-- =====================================================================
-- Home Services Partner Management & Tracking System
-- DBMS Mini Project: DATABASE LOGIC (logic.sql)
-- Target Database: home_services_db (MySQL 8.0)
-- Execution Order:
--   1. DELIMITER
--   2. Procedures
--   3. Triggers
--   4. Views
--   5. DELIMITER ;
-- =====================================================================

USE home_services_db;

DELIMITER $$

-- =====================================================================
-- PROCEDURES
-- =====================================================================

-- ---------------------------------------------------------------------
-- Procedure 1: assign_partner
-- Verifies the partner exists, updates Booking.partner_id,
-- and sets booking_status to 'Assigned'.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS assign_partner$$

CREATE PROCEDURE assign_partner(
    IN p_booking_id INT,
    IN p_partner_id INT
)
BEGIN
    DECLARE v_partner_count INT DEFAULT 0;
    DECLARE v_valid_partner_count INT DEFAULT 0;
    DECLARE v_booking_count INT DEFAULT 0;

    -- Verify the partner exists
    SELECT COUNT(*) INTO v_partner_count
    FROM Service_Partner
    WHERE partner_id = p_partner_id;

    IF v_partner_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Partner does not exist.';
    END IF;

    -- Verify the partner is Verified and Active
    SELECT COUNT(*) INTO v_valid_partner_count
    FROM Service_Partner
    WHERE partner_id = p_partner_id
      AND verification_status = 'Verified'
      AND account_status = 'Active';

    IF v_valid_partner_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Partner must be Verified and Active.';
    END IF;

    -- Verify the booking exists
    SELECT COUNT(*) INTO v_booking_count
    FROM Booking
    WHERE booking_id = p_booking_id;

    IF v_booking_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Booking does not exist.';
    END IF;

    -- Update booking partner and set status to Assigned
    UPDATE Booking
    SET partner_id = p_partner_id,
        booking_status = 'Assigned'
    WHERE booking_id = p_booking_id;
END$$

-- ---------------------------------------------------------------------
-- Procedure 2: create_booking
-- Finds an eligible partner (Verified, Active, offers the service,
-- available during day/time, not double-booked) and creates the booking.
-- If no eligible partner exists, raises an error.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS create_booking$$

CREATE PROCEDURE create_booking(
    IN p_customer_id INT,
    IN p_service_id INT,
    IN p_address_id INT,
    IN p_scheduled_on DATETIME
)
BEGIN
    DECLARE v_duration_min INT DEFAULT NULL;
    DECLARE v_partner_id INT DEFAULT NULL;

    -- Validate scheduled time is in the future
    IF p_scheduled_on <= NOW() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT='Error: Scheduled time must be in the future.';
    END IF;

    -- Validate customer owns the address
    IF NOT EXISTS (
        SELECT 1 FROM Address
        WHERE address_id = p_address_id AND customer_id = p_customer_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Address does not belong to this customer.';
    END IF;

    -- 1. Fetch service duration
    SELECT duration_min INTO v_duration_min
    FROM Service
    WHERE service_id = p_service_id;

    IF v_duration_min IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Service does not exist.';
    END IF;

    -- 2. Find an eligible partner:
    --    - Verified and Active
    --    - Offers the requested service (is_active = TRUE)
    --    - Weekly availability covers the scheduled day and window
    --      (day_of_week: 1 = Monday ... 7 = Sunday)
    --    - No overlapping non-completed booking
    SELECT sp.partner_id INTO v_partner_id
    FROM Service_Partner sp
    JOIN Partner_Service ps
        ON sp.partner_id = ps.partner_id
       AND ps.service_id = p_service_id
       AND ps.is_active = TRUE
    JOIN Partner_Availability pa
        ON sp.partner_id = pa.partner_id
       AND pa.day_of_week = (WEEKDAY(p_scheduled_on) + 1)
       AND pa.start_time <= TIME(p_scheduled_on)
       AND pa.end_time >= TIME(DATE_ADD(p_scheduled_on, INTERVAL v_duration_min MINUTE))
    WHERE sp.verification_status = 'Verified'
      AND sp.account_status = 'Active'
      AND NOT EXISTS (
          SELECT 1
          FROM Booking b
          JOIN Service bs ON b.service_id = bs.service_id
          WHERE b.partner_id = sp.partner_id
            AND b.booking_status <> 'Completed'
            AND p_scheduled_on < DATE_ADD(b.scheduled_on, INTERVAL bs.duration_min MINUTE)
            AND DATE_ADD(p_scheduled_on, INTERVAL v_duration_min MINUTE) > b.scheduled_on
      )
    ORDER BY sp.partner_id ASC
    LIMIT 1;

    -- 3. If no partner exists, raise error
    IF v_partner_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: No available partner found for the requested service and datetime.';
    END IF;

    -- 4. Otherwise, insert booking with status 'Assigned'
    INSERT INTO Booking (
        customer_id,
        service_id,
        address_id,
        partner_id,
        scheduled_on,
        booking_status
    ) VALUES (
        p_customer_id,
        p_service_id,
        p_address_id,
        v_partner_id,
        p_scheduled_on,
        'Assigned'
    );

    SELECT LAST_INSERT_ID() AS booking_id;
END$$

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Trigger 1: trg_booking_after_insert
-- Automatically logs the initial 'Assigned' status in Job_Tracking
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_booking_after_insert$$

CREATE TRIGGER trg_booking_after_insert
AFTER INSERT ON Booking
FOR EACH ROW
BEGIN
    INSERT INTO Job_Tracking (booking_id, status)
    VALUES (NEW.booking_id, NEW.booking_status);
END$$

-- ---------------------------------------------------------------------
-- Trigger 2: trg_booking_after_update
-- Whenever booking_status changes, appends the new status to Job_Tracking
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_booking_after_update$$

CREATE TRIGGER trg_booking_after_update
AFTER UPDATE ON Booking
FOR EACH ROW
BEGIN
    IF OLD.booking_status <> NEW.booking_status THEN
        INSERT INTO Job_Tracking (booking_id, status)
        VALUES (NEW.booking_id, NEW.booking_status);
    END IF;
END$$

-- ---------------------------------------------------------------------
-- Trigger 3: trg_booking_before_update
-- Validates strict sequential status flow:
-- Assigned -> En Route -> Started -> Completed.
-- Completed status is final. Any illegal transition raises SIGNAL.
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_booking_before_update$$

CREATE TRIGGER trg_booking_before_update
BEFORE UPDATE ON Booking
FOR EACH ROW
BEGIN
    IF OLD.booking_status <> NEW.booking_status THEN
        IF OLD.booking_status = 'Completed' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid status transition: Completed bookings cannot change status.';
        ELSEIF OLD.booking_status = 'Assigned' AND NEW.booking_status <> 'En Route' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid status transition: Assigned can only transition to En Route.';
        ELSEIF OLD.booking_status = 'En Route' AND NEW.booking_status <> 'Started' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid status transition: En Route can only transition to Started.';
        ELSEIF OLD.booking_status = 'Started' AND NEW.booking_status <> 'Completed' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Invalid status transition: Started can only transition to Completed.';
        END IF;
    END IF;
END$$

-- ---------------------------------------------------------------------
-- Trigger 4: trg_rating_before_insert
-- Ensures that a booking must be 'Completed' before a rating can be added.
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_rating_before_insert$$

CREATE TRIGGER trg_rating_before_insert
BEFORE INSERT ON Rating
FOR EACH ROW
BEGIN
    DECLARE v_booking_status VARCHAR(20);

    -- Retrieve the booking status for the referenced booking
    SELECT booking_status INTO v_booking_status
    FROM Booking
    WHERE booking_id = NEW.booking_id;

    -- Reject insert if the booking is not completed
    IF v_booking_status IS NULL OR v_booking_status <> 'Completed' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking must be completed before rating.';
    END IF;
END$$

-- =====================================================================
-- VIEWS
-- =====================================================================

-- ---------------------------------------------------------------------
-- View 1: pending_kyc
-- Shows partners whose verification_status is 'Pending'
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW pending_kyc AS
SELECT 
    sp.partner_id,
    sp.name AS partner_name,
    sp.phone,
    sc.category_name AS category
FROM Service_Partner sp
JOIN Service_Category sc ON sp.category_id = sc.category_id
WHERE sp.verification_status = 'Pending'$$

-- ---------------------------------------------------------------------
-- View 2: partner_ratings
-- Displays average rating, number of ratings, and partner name
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW partner_ratings AS
SELECT 
    sp.name AS partner_name,
    ROUND(AVG(r.score), 2) AS avg_rating,
    COUNT(r.rating_id) AS number_of_ratings
FROM Service_Partner sp
LEFT JOIN Booking b ON sp.partner_id = b.partner_id
LEFT JOIN Rating r ON b.booking_id = r.booking_id
GROUP BY sp.partner_id, sp.name$$

-- ---------------------------------------------------------------------
-- View 3: booking_details
-- Denormalized view showing booking id, customer, partner, service,
-- address, scheduled date, and booking status
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW booking_details AS
SELECT 
    b.booking_id,
    c.name AS customer,
    sp.name AS partner,
    s.service_name AS service,
    CONCAT(a.address_line, ', ', a.city, ' - ', a.pincode) AS address,
    b.scheduled_on AS scheduled_date,
    b.booking_status
FROM Booking b
JOIN Customer c ON b.customer_id = c.customer_id
JOIN Service_Partner sp ON b.partner_id = sp.partner_id
JOIN Service s ON b.service_id = s.service_id
JOIN Address a ON b.address_id = a.address_id$$

DELIMITER ;
