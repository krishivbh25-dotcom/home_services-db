-- =====================================================================
-- Home Services Partner Management & Tracking System
-- DBMS Mini Project: SEED DATA (seed.sql)
-- Target Database: home_services_db (MySQL 8.0)
-- Dependency Order:
--   1. Customer
--   2. Address
--   3. Service_Category
--   4. Service
--   5. Admin
--   6. Service_Partner
--   7. Partner_Service
--   8. Partner_Document
--   9. Partner_Availability
--   10. Booking
--   11. Rating
-- (Job_Tracking is excluded - populated via triggers)
-- =====================================================================

USE home_services_db;

-- ---------------------------------------------------------------------
-- 1. Customer (10 realistic Indian customer records)
-- ---------------------------------------------------------------------
INSERT INTO Customer (customer_id, name, phone, email, registered_on) VALUES
(1,  'Rajesh Sharma',    '+919820112233', 'rajesh.sharma@example.com',    '2025-01-15'),
(2,  'Priya Patel',      '+919833223344', 'priya.patel@example.com',      '2025-02-10'),
(3,  'Amit Verma',       '+919844334455', 'amit.verma@example.com',       '2025-03-05'),
(4,  'Sneha Iyer',       '+919855445566', 'sneha.iyer@example.com',       '2025-03-20'),
(5,  'Vikram Singh',     '+919866556677', 'vikram.singh@example.com',     '2025-04-12'),
(6,  'Ananya Mukherjee', '+919877667788', 'ananya.m@example.com',         '2025-05-01'),
(7,  'Rohan Gupta',      '+919888778899', 'rohan.gupta@example.com',      '2025-05-18'),
(8,  'Kavita Nair',      '+919899889900', 'kavita.nair@example.com',      '2025-06-02'),
(9,  'Deepak Joshi',     '+919811990011', 'deepak.joshi@example.com',     '2025-06-25'),
(10, 'Pooja Reddy',      '+919822001122', 'pooja.reddy@example.com',      '2025-07-10');

-- ---------------------------------------------------------------------
-- 2. Address (1-2 addresses per customer, strictly valid 6-digit pincodes)
-- ---------------------------------------------------------------------
INSERT INTO Address (address_id, customer_id, address_line, city, pincode) VALUES
(1,  1,  'Flat 402, Shanti Heights, Link Road, Andheri West', 'Mumbai',    '400053'),
(2,  1,  'Unit 12B, Trade Center, Bandra Kurla Complex',       'Mumbai',    '400051'),
(3,  2,  'B-201, Green Meadows, Koregaon Park',                'Pune',      '411001'),
(4,  3,  '14/A, Rose Villa, 100 Feet Road, Indiranagar',       'Bengaluru', '560038'),
(5,  3,  'Building 4, Tech Park Hub, Whitefield',              'Bengaluru', '560066'),
(6,  4,  '503, Skyline Towers, Road No. 12, Banjara Hills',    'Hyderabad', '500034'),
(7,  5,  'House 72, Block C, Sector 15',                       'Noida',     '201301'),
(8,  5,  'Plot 88, Phase 2, DLF Cyber City',                   'Gurugram',  '122002'),
(9,  6,  '12/1, Ballygunge Circular Road',                     'Kolkata',   '700019'),
(10, 7,  '304, Palm Springs, Pocket 7, Vasant Kunj',           'New Delhi', '110070'),
(11, 7,  '82, Inner Circle, Connaught Place',                  'New Delhi', '110001'),
(12, 8,  '21, 2nd Avenue, Anna Nagar West',                    'Chennai',   '600040'),
(13, 9,  'C-45, Queens Road, Malviya Nagar',                   'Jaipur',    '302017'),
(14, 10, '102, Lake View Apartments, Vastrapur',               'Ahmedabad', '380015'),
(15, 10, 'Shop 5, Riverfront Arcade, Ashram Road',             'Ahmedabad', '380009');

-- ---------------------------------------------------------------------
-- 3. Service_Category (4 specified categories)
-- ---------------------------------------------------------------------
INSERT INTO Service_Category (category_id, category_name) VALUES
(1, 'Electrical'),
(2, 'Plumbing'),
(3, 'Cleaning'),
(4, 'Carpentry');

-- ---------------------------------------------------------------------
-- 4. Service (10 realistic services with base prices and durations)
-- ---------------------------------------------------------------------
INSERT INTO Service (service_id, category_id, service_name, base_price, duration_min) VALUES
(1,  1, 'Ceiling Fan Installation & Repair',    299.00,  45),
(2,  1, 'Switchboard & Socket Replacement',     249.00,  30),
(3,  1, 'Complete Home Electrical Inspection',  999.00,  90),
(4,  2, 'Tap & Shower Leakage Repair',          299.00,  45),
(5,  2, 'Drainage & Pipe Unclogging',           499.00,  60),
(6,  2, 'Overhead Water Tank Cleaning',        1299.00,  90),
(7,  3, 'Intensive Bathroom Deep Cleaning',     799.00,  90),
(8,  3, 'Complete Apartment Deep Cleaning',    2999.00, 240),
(9,  4, 'Door Lock & Latch Fitting',            349.00,  45),
(10, 4, 'Wooden Furniture Assembly & Repair',   649.00,  75);

-- ---------------------------------------------------------------------
-- 5. Admin (2 administrators for KYC and partner operations)
-- ---------------------------------------------------------------------
INSERT INTO Admin (admin_id, name, email, role) VALUES
(1, 'Suresh Menon',   'suresh.menon@homeservices.in',   'Super Admin'),
(2, 'Meera Deshmukh', 'meera.deshmukh@homeservices.in', 'Verification Officer');

-- ---------------------------------------------------------------------
-- 6. Service_Partner (8 partners across trade categories)
--    Status ENUMs:
--      verification_status: 'Pending', 'Verified', 'Rejected'
--      account_status:      'Active', 'Inactive', 'Suspended'
-- ---------------------------------------------------------------------
INSERT INTO Service_Partner (partner_id, category_id, verified_by, name, phone, experience_yrs, verification_status, account_status) VALUES
(1, 1, 1,    'Ramesh Kumar',  '+919711001122', 8,  'Verified', 'Active'),
(2, 1, 1,    'Manoj Tiwari',  '+919722112233', 5,  'Verified', 'Active'),
(3, 2, 2,    'Sanjay Yadav',  '+919733223344', 7,  'Verified', 'Active'),
(4, 2, 2,    'Ganesh Patil',  '+919744334455', 4,  'Verified', 'Active'),
(5, 3, 1,    'Sunita Devi',   '+919755445566', 6,  'Verified', 'Active'),
(6, 3, NULL, 'Radha Rani',    '+919766556677', 3,  'Pending',  'Active'),
(7, 4, 2,    'Harish Mistri', '+919777667788', 10, 'Verified', 'Active'),
(8, 4, 2,    'Dinesh Suthar', '+919788778899', 2,  'Rejected', 'Inactive');

-- ---------------------------------------------------------------------
-- 7. Partner_Service (M:N mapping with customized pricing)
-- ---------------------------------------------------------------------
INSERT INTO Partner_Service (partner_id, service_id, custom_price, is_active) VALUES
(1, 1,  320.00, TRUE),
(1, 2,  250.00, TRUE),
(1, 3,  950.00, TRUE),
(2, 1,  299.00, TRUE),
(2, 2,  249.00, TRUE),
(3, 4,  300.00, TRUE),
(3, 5,  480.00, TRUE),
(3, 6, 1250.00, TRUE),
(4, 4,  299.00, TRUE),
(4, 5,  520.00, TRUE),
(5, 7,  750.00, TRUE),
(5, 8, 2899.00, TRUE),
(6, 7,  799.00, TRUE),
(7, 9,  350.00, TRUE),
(7, 10, 650.00, TRUE),
(8, 9,  399.00, FALSE);

-- ---------------------------------------------------------------------
-- 8. Partner_Document (KYC files for administrative verification)
--    document_type:   'Aadhaar', 'PAN', 'Trade Certificate'
--    approval_status: 'Pending', 'Approved', 'Rejected'
-- ---------------------------------------------------------------------
INSERT INTO Partner_Document (document_id, partner_id, document_type, file_url, approval_status) VALUES
(1,  1, 'Aadhaar',           'https://storage.homeservices.in/kyc/p1_aadhaar.pdf', 'Approved'),
(2,  1, 'Trade Certificate', 'https://storage.homeservices.in/kyc/p1_trade.pdf',   'Approved'),
(3,  2, 'Aadhaar',           'https://storage.homeservices.in/kyc/p2_aadhaar.pdf', 'Approved'),
(4,  2, 'PAN',               'https://storage.homeservices.in/kyc/p2_pan.pdf',     'Approved'),
(5,  3, 'Aadhaar',           'https://storage.homeservices.in/kyc/p3_aadhaar.pdf', 'Approved'),
(6,  3, 'Trade Certificate', 'https://storage.homeservices.in/kyc/p3_trade.pdf',   'Approved'),
(7,  4, 'Aadhaar',           'https://storage.homeservices.in/kyc/p4_aadhaar.pdf', 'Approved'),
(8,  4, 'PAN',               'https://storage.homeservices.in/kyc/p4_pan.pdf',     'Approved'),
(9,  5, 'Aadhaar',           'https://storage.homeservices.in/kyc/p5_aadhaar.pdf', 'Approved'),
(10, 6, 'Aadhaar',           'https://storage.homeservices.in/kyc/p6_aadhaar.pdf', 'Pending'),
(11, 6, 'PAN',               'https://storage.homeservices.in/kyc/p6_pan.pdf',     'Pending'),
(12, 7, 'Aadhaar',           'https://storage.homeservices.in/kyc/p7_aadhaar.pdf', 'Approved'),
(13, 7, 'Trade Certificate', 'https://storage.homeservices.in/kyc/p7_trade.pdf',   'Approved'),
(14, 8, 'Aadhaar',           'https://storage.homeservices.in/kyc/p8_aadhaar.pdf', 'Rejected');

-- ---------------------------------------------------------------------
-- 9. Partner_Availability (Recurring shifts, day_of_week 1=Mon ... 7=Sun)
-- ---------------------------------------------------------------------
INSERT INTO Partner_Availability (availability_id, partner_id, day_of_week, start_time, end_time) VALUES
(1,  1, 1, '09:00:00', '18:00:00'),
(2,  1, 2, '09:00:00', '18:00:00'),
(3,  1, 3, '09:00:00', '18:00:00'),
(4,  1, 4, '09:00:00', '18:00:00'),
(5,  1, 5, '09:00:00', '18:00:00'),
(6,  2, 2, '08:30:00', '17:30:00'),
(7,  2, 3, '08:30:00', '17:30:00'),
(8,  2, 4, '08:30:00', '17:30:00'),
(9,  2, 5, '08:30:00', '17:30:00'),
(10, 2, 6, '08:30:00', '17:30:00'),
(11, 3, 1, '09:00:00', '19:00:00'),
(12, 3, 2, '09:00:00', '19:00:00'),
(13, 3, 3, '09:00:00', '19:00:00'),
(14, 3, 4, '09:00:00', '19:00:00'),
(15, 3, 5, '09:00:00', '19:00:00'),
(16, 3, 6, '09:00:00', '19:00:00'),
(17, 4, 3, '10:00:00', '19:00:00'),
(18, 4, 4, '10:00:00', '19:00:00'),
(19, 4, 5, '10:00:00', '19:00:00'),
(20, 4, 6, '10:00:00', '19:00:00'),
(21, 4, 7, '10:00:00', '19:00:00'),
(22, 5, 1, '08:00:00', '16:00:00'),
(23, 5, 2, '08:00:00', '16:00:00'),
(24, 5, 3, '08:00:00', '16:00:00'),
(25, 5, 4, '08:00:00', '16:00:00'),
(26, 5, 5, '08:00:00', '16:00:00'),
(27, 6, 1, '09:00:00', '18:00:00'),
(28, 6, 2, '09:00:00', '18:00:00'),
(29, 6, 3, '09:00:00', '18:00:00'),
(30, 7, 1, '09:30:00', '18:30:00'),
(31, 7, 2, '09:30:00', '18:30:00'),
(32, 7, 3, '09:30:00', '18:30:00'),
(33, 7, 4, '09:30:00', '18:30:00'),
(34, 7, 5, '09:30:00', '18:30:00'),
(35, 7, 6, '09:30:00', '18:30:00'),
(36, 8, 1, '10:00:00', '16:00:00');

INSERT INTO Partner_Availability (partner_id, day_of_week, start_time, end_time) VALUES
(5, 6, '08:00:00', '16:00:00'),
(7, 7, '09:30:00', '18:30:00'),
(2, 1, '08:30:00', '17:30:00'),
(4, 1, '10:00:00', '19:00:00');

UPDATE Partner_Availability
SET end_time='20:00:00'
WHERE availability_id=22;

-- ---------------------------------------------------------------------
-- 10. Booking (10 bookings across Assigned, En Route, Started, Completed)
--     address_id strictly matches customer_id; partner_id offers the service
-- ---------------------------------------------------------------------
INSERT INTO Booking (booking_id, customer_id, service_id, address_id, partner_id, scheduled_on, booking_status) VALUES
(1,  1,  1,  1,  1, '2026-10-15 10:00:00', 'Completed'),
(2,  2,  4,  3,  3, '2026-10-16 11:30:00', 'Completed'),
(3,  3,  7,  4,  5, '2026-10-17 09:00:00', 'Completed'),
(4,  4,  9,  6,  7, '2026-10-18 14:00:00', 'Completed'),
(5,  5,  2,  7,  2, '2026-10-19 10:00:00', 'Started'),
(6,  6,  5,  9,  4, '2026-10-19 11:00:00', 'Started'),
(7,  7,  10, 10, 7, '2026-10-19 15:30:00', 'En Route'),
(8,  8,  8,  12, 5, '2026-10-19 16:00:00', 'En Route'),
(9,  9,  3,  13, 1, '2026-10-20 10:30:00', 'Assigned'),
(10, 10, 6,  14, 3, '2026-10-20 14:00:00', 'Assigned');

-- ---------------------------------------------------------------------
-- 11. Rating (Customer reviews for Completed bookings only)
-- ---------------------------------------------------------------------
INSERT INTO Rating (rating_id, booking_id, score, review_text, rated_on) VALUES
(1, 1, 5, 'Ramesh arrived right on time, replaced the fan capacitor, and left the room spotless.', '2026-10-15'),
(2, 2, 4, 'Very knowledgeable plumber. Replaced the faulty tap valve quickly without any mess.',  '2026-10-16'),
(3, 3, 5, 'Outstanding deep cleaning service! The bathroom tiles and fixtures shine like new.',  '2026-10-17'),
(4, 4, 4, 'Smooth and secure lock fitting. Harish brought all required tools and hardware.',     '2026-10-18');


-- ---------------------------------------------------------------------
-- 12. Job_Tracking (Initial status progression history for seed bookings)
-- ---------------------------------------------------------------------
INSERT INTO Job_Tracking (booking_id, status, updated_at)
SELECT b.booking_id, s.status, b.scheduled_on - INTERVAL s.mins MINUTE
FROM Booking b
JOIN (SELECT 'Assigned' AS status, 1440 AS mins
      UNION ALL SELECT 'En Route', 30
      UNION ALL SELECT 'Started', 0
      UNION ALL SELECT 'Completed', -60) s
  ON FIELD(s.status, 'Assigned','En Route','Started','Completed')
   <= FIELD(b.booking_status, 'Assigned','En Route','Started','Completed')
ORDER BY b.booking_id, s.mins DESC;
