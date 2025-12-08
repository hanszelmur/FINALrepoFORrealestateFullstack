-- Real Estate Management System Database Schema
-- MySQL 8.0+

DROP DATABASE IF EXISTS real_estate_db;
CREATE DATABASE real_estate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE real_estate_db;

-- Users table (admin and agents)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'agent') NOT NULL DEFAULT 'agent',
    phone VARCHAR(20),
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Properties table
CREATE TABLE properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type ENUM('house', 'condo', 'townhouse', 'lot', 'commercial') NOT NULL,
    status ENUM('available', 'reserved', 'sold', 'archived') NOT NULL DEFAULT 'available',
    price DECIMAL(15, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    bedrooms INT,
    bathrooms INT,
    floor_area DECIMAL(10, 2),
    lot_area DECIMAL(10, 2),
    features JSON,
    reservation_type ENUM('none', 'deposit', 'full_payment') DEFAULT 'none',
    reservation_date TIMESTAMP NULL,
    reservation_expiry TIMESTAMP NULL,
    reserved_by_inquiry_id INT NULL,
    agent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_property_type (property_type),
    INDEX idx_price (price),
    INDEX idx_agent_id (agent_id),
    INDEX idx_reservation_expiry (reservation_expiry),
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Property photos
CREATE TABLE property_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    photo_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_property_id (property_id),
    INDEX idx_is_primary (is_primary),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inquiries table
CREATE TABLE inquiries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    message TEXT,
    status ENUM(
        'new',
        'contacted',
        'viewing_scheduled',
        'viewing_completed',
        'negotiating',
        'deposit_paid',
        'reserved',
        'payment_processing',
        'sold',
        'cancelled',
        'expired'
    ) NOT NULL DEFAULT 'new',
    assigned_to INT NULL,
    commission_amount DECIMAL(15, 2) NULL,
    commission_locked BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_property_id (property_id),
    INDEX idx_status (status),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_client_email (client_email),
    INDEX idx_client_phone (client_phone),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for reserved_by_inquiry_id to properties
ALTER TABLE properties
    ADD CONSTRAINT fk_reserved_inquiry
    FOREIGN KEY (reserved_by_inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL;

-- Inquiry status history
CREATE TABLE inquiry_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inquiry_id INT NOT NULL,
    old_status ENUM(
        'new',
        'contacted',
        'viewing_scheduled',
        'viewing_completed',
        'negotiating',
        'deposit_paid',
        'reserved',
        'payment_processing',
        'sold',
        'cancelled',
        'expired'
    ),
    new_status ENUM(
        'new',
        'contacted',
        'viewing_scheduled',
        'viewing_completed',
        'negotiating',
        'deposit_paid',
        'reserved',
        'payment_processing',
        'sold',
        'cancelled',
        'expired'
    ) NOT NULL,
    changed_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inquiry_id (inquiry_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calendar events
CREATE TABLE calendar_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('viewing', 'meeting', 'deadline', 'other') NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    property_id INT NULL,
    inquiry_id INT NULL,
    agent_id INT NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time),
    INDEX idx_agent_id (agent_id),
    INDEX idx_status (status),
    INDEX idx_property_id (property_id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a view for agent statistics
CREATE VIEW agent_stats AS
SELECT 
    u.id as agent_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT p.id) as total_properties,
    COUNT(DISTINCT CASE WHEN i.status = 'sold' THEN i.id END) as sold_inquiries,
    COUNT(DISTINCT CASE WHEN i.status IN ('new', 'contacted', 'viewing_scheduled', 'viewing_completed', 'negotiating') THEN i.id END) as active_inquiries,
    COALESCE(SUM(CASE WHEN i.status = 'sold' THEN i.commission_amount END), 0) as total_commission
FROM users u
LEFT JOIN properties p ON u.id = p.agent_id
LEFT JOIN inquiries i ON u.id = i.assigned_to
WHERE u.role = 'agent' AND u.status = 'active'
GROUP BY u.id, u.full_name, u.email;
