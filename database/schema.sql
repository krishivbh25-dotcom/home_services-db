-- =====================================================================
-- Home Services Partner Management & Tracking System
-- DBMS Mini Project: SCHEMA ONLY (12 tables)
-- Requires MySQL 8.0.16 or higher (CHECK constraints are enforced)
-- Load order: schema.sql -> seed.sql -> logic.sql
-- =====================================================================
 
DROP DATABASE IF EXISTS home_services_db;
CREATE DATABASE home_services_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE home_services_db;
 
-- =====================================================================
-- TABLE 1: Customer
-- Purpose: Registered customers who book home services.
-- =====================================================================
CREATE TABLE Customer (
    customer_id   INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    phone         VARCHAR(15)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    registered_on DATE         NOT NULL
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 2: Address
-- Purpose: Saved service addresses (home, office, etc.) of a customer.
-- =====================================================================
CREATE TABLE Address (
    address_id   INT AUTO_INCREMENT PRIMARY KEY,
    customer_id  INT          NOT NULL,
    address_line VARCHAR(200) NOT NULL,
    city         VARCHAR(50)  NOT NULL,
    pincode      VARCHAR(6)   NOT NULL,
    CONSTRAINT chk_address_pincode CHECK (pincode REGEXP '^[0-9]{6}$'),
    CONSTRAINT fk_address_customer FOREIGN KEY (customer_id)
        REFERENCES Customer(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 3: Service_Category
-- Purpose: Top-level trade groups such as Electrician or Plumber.
-- =====================================================================
CREATE TABLE Service_Category (
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 4: Service
-- Purpose: Specific bookable tasks inside a category, with base price
--          and duration.
-- =====================================================================
CREATE TABLE Service (
    service_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_id  INT          NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    base_price   DECIMAL(8,2) NOT NULL,
    duration_min INT          NOT NULL,
    CONSTRAINT chk_service_price    CHECK (base_price > 0),
    CONSTRAINT chk_service_duration CHECK (duration_min > 0),
    CONSTRAINT fk_service_category FOREIGN KEY (category_id)
        REFERENCES Service_Category(category_id)
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 5: Admin
-- Purpose: Back-office administrators who verify service partners.
-- =====================================================================
CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    email    VARCHAR(100) NOT NULL UNIQUE,
    role     VARCHAR(30)  NOT NULL
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 6: Service_Partner
-- Purpose: Home service professionals. verified_by stays NULL until an
--          admin verifies the partner.
-- =====================================================================
CREATE TABLE Service_Partner (
    partner_id          INT AUTO_INCREMENT PRIMARY KEY,
    category_id         INT          NOT NULL,
    verified_by         INT          NULL,
    name                VARCHAR(100) NOT NULL,
    phone               VARCHAR(15)  NOT NULL UNIQUE,
    experience_yrs      INT          NOT NULL DEFAULT 0,
    verification_status ENUM('Pending', 'Verified', 'Rejected')
                        NOT NULL DEFAULT 'Pending',
    account_status      ENUM('Active', 'Inactive', 'Suspended')
                        NOT NULL DEFAULT 'Active',
    CONSTRAINT chk_partner_experience CHECK (experience_yrs >= 0),
    CONSTRAINT fk_partner_category FOREIGN KEY (category_id)
        REFERENCES Service_Category(category_id),
    CONSTRAINT fk_partner_admin FOREIGN KEY (verified_by)
        REFERENCES Admin(admin_id)
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 7: Partner_Service  (associative table for the M:N OFFERS link)
-- Purpose: Which partner offers which service, and at what price.
-- =====================================================================
CREATE TABLE Partner_Service (
    partner_id   INT          NOT NULL,
    service_id   INT          NOT NULL,
    custom_price DECIMAL(8,2) NOT NULL,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (partner_id, service_id),
    CONSTRAINT chk_ps_price CHECK (custom_price > 0),
    CONSTRAINT fk_ps_partner FOREIGN KEY (partner_id)
        REFERENCES Service_Partner(partner_id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_service FOREIGN KEY (service_id)
        REFERENCES Service(service_id) ON DELETE CASCADE
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 8: Partner_Document
-- Purpose: KYC documents (Aadhaar, PAN, Trade Certificate) uploaded by
--          a partner for admin verification.
-- =====================================================================
CREATE TABLE Partner_Document (
    document_id     INT AUTO_INCREMENT PRIMARY KEY,
    partner_id      INT          NOT NULL,
    document_type   ENUM('Aadhaar', 'PAN', 'Trade Certificate') NOT NULL,
    file_url        VARCHAR(255) NOT NULL,
    approval_status ENUM('Pending', 'Approved', 'Rejected')
                    NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_doc_partner FOREIGN KEY (partner_id)
        REFERENCES Service_Partner(partner_id) ON DELETE CASCADE
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 9: Partner_Availability
-- Purpose: Recurring weekly working slots of a partner
--          (day_of_week: 1 = Monday ... 7 = Sunday).
-- =====================================================================
CREATE TABLE Partner_Availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id      INT  NOT NULL,
    day_of_week     INT  NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    CONSTRAINT chk_avail_day  CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT chk_avail_time CHECK (end_time > start_time),
    CONSTRAINT fk_avail_partner FOREIGN KEY (partner_id)
        REFERENCES Service_Partner(partner_id) ON DELETE CASCADE
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 10: Booking
-- Purpose: Central table. One row per service order, linking the
--          customer, service, address and assigned partner.
--          A booking is created already assigned, so partner_id is
--          NOT NULL. Status flow: Assigned -> En Route -> Started
--          -> Completed.
-- =====================================================================
CREATE TABLE Booking (
    booking_id     INT AUTO_INCREMENT PRIMARY KEY,
    customer_id    INT      NOT NULL,
    service_id     INT      NOT NULL,
    address_id     INT      NOT NULL,
    partner_id     INT      NOT NULL,
    scheduled_on   DATETIME NOT NULL,
    booking_status ENUM('Assigned', 'En Route', 'Started', 'Completed')
                   NOT NULL DEFAULT 'Assigned',
    CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id)
        REFERENCES Customer(customer_id),
    CONSTRAINT fk_booking_service FOREIGN KEY (service_id)
        REFERENCES Service(service_id),
    CONSTRAINT fk_booking_address FOREIGN KEY (address_id)
        REFERENCES Address(address_id),
    CONSTRAINT fk_booking_partner FOREIGN KEY (partner_id)
        REFERENCES Service_Partner(partner_id),
    -- speeds up the "does this partner already have an overlapping job?" check
    INDEX idx_booking_partner_time (partner_id, scheduled_on)
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 11: Job_Tracking
-- Purpose: Append-only history of every status a booking has been in.
--          Rows are filled by a trigger, never edited by hand.
--          (No GPS columns: location tracking is out of scope.)
-- =====================================================================
CREATE TABLE Job_Tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id  INT      NOT NULL,
    status      ENUM('Assigned', 'En Route', 'Started', 'Completed') NOT NULL,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tracking_booking FOREIGN KEY (booking_id)
        REFERENCES Booking(booking_id) ON DELETE CASCADE,
    INDEX idx_tracking_booking_time (booking_id, updated_at)
) ENGINE=InnoDB;
 
-- =====================================================================
-- TABLE 12: Rating
-- Purpose: Customer feedback for a booking. UNIQUE booking_id means a
--          booking has at most one rating (1:0..1).
-- =====================================================================
CREATE TABLE Rating (
    rating_id   INT AUTO_INCREMENT PRIMARY KEY,
    booking_id  INT  NOT NULL UNIQUE,
    score       INT  NOT NULL,
    review_text TEXT,
    rated_on    DATE NOT NULL,
    CONSTRAINT chk_rating_score CHECK (score BETWEEN 1 AND 5),
    CONSTRAINT fk_rating_booking FOREIGN KEY (booking_id)
        REFERENCES Booking(booking_id)
) ENGINE=InnoDB;
 