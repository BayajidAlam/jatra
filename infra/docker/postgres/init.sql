-- Initialize databases for all microservices
-- Each service gets its own database for data isolation

-- Auth Service Database
CREATE DATABASE auth_db;

-- User Service Database
CREATE DATABASE user_db;

-- Schedule Service Database
CREATE DATABASE schedule_db;

-- Search Service Database (optional - can use schedule_db with read replica)
CREATE DATABASE search_db;

-- Seat Reservation Service Database
CREATE DATABASE seat_reservation_db;

-- Booking Service Database
CREATE DATABASE booking_db;

-- Payment Service Database
CREATE DATABASE payment_db;

-- Ticket Service Database
CREATE DATABASE ticket_db;

-- Notification Service Database
CREATE DATABASE notification_db;

-- Admin Service Database (can share with schedule_db)
CREATE DATABASE admin_db;

-- Reporting Service Database
CREATE DATABASE reporting_db;

-- Grant privileges to jatra_user
GRANT ALL PRIVILEGES ON DATABASE auth_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE user_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE schedule_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE search_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE seat_reservation_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE booking_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE ticket_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE admin_db TO jatra_user;
GRANT ALL PRIVILEGES ON DATABASE reporting_db TO jatra_user;
