-- Seed data for Real Estate Management System
-- WARNING: These are sample credentials for development/testing only!
-- DO NOT use these in production. Change all passwords immediately after deployment.
USE real_estate_db;

-- Insert admin user (password: Admin123!@#)
-- bcrypt hash for 'Admin123!@#' with 10 rounds
-- SECURITY: Change this password immediately in production!
INSERT INTO users (email, password_hash, full_name, role, phone, status) VALUES
('admin@realestate.com', '$2b$10$rKZqJQ8lN0X8VqXQP3Y8.OQJxVZXvGxNjhJZKvY6ZgXYxQYPQJxVe', 'System Administrator', 'admin', '+639171234567', 'active');

-- Insert 6 agents (password: Agent123!@# for all)
-- bcrypt hash for 'Agent123!@#' with 10 rounds
INSERT INTO users (email, password_hash, full_name, role, phone, status) VALUES
('maria.santos@realestate.com', '$2b$10$vY9xKlJQ7LpZQxQP3Y8.OeQJxVZXvGxNjhJZKvY6ZgXYxQYPQJxVf', 'Maria Santos', 'agent', '+639171234568', 'active'),
('juan.delacruz@realestate.com', '$2b$10$vY9xKlJQ7LpZQxQP3Y8.OeQJxVZXvGxNjhJZKvY6ZgXYxQYPQJxVf', 'Juan dela Cruz', 'agent', '+639171234569', 'active'),
('anna.reyes@realestate.com', '$2b$10$vY9xKlJQ7LpZQxQP3Y8.OeQJxVZXvGxNjhJZKvY6ZgXYxQYPQJxVf', 'Anna Reyes', 'agent', '+639171234570', 'active'),
('pedro.gonzales@realestate.com', '$2b$10$vY9xKlJQ7LpZQxQP3Y8.OeQJxVZXvGxNjhJZKvY6ZgXYxQYPQJxVf', 'Pedro Gonzales', 'agent', '+639171234571', 'active'),
('lucia.garcia@realestate.com', '$2b$10$vY9xKlJQ7LpZQxQP3Y8.OeQJxVZXvGxNjhJZKvY6ZgXYxQYPQJxVf', 'Lucia Garcia', 'agent', '+639171234572', 'active'),
('carlos.mendoza@realestate.com', '$2b$10$vY9xKlJQ7LpZQxQP3Y8.OeQJxVZXvGxNjhJZKvY6ZgXYxQYPQJxVf', 'Carlos Mendoza', 'agent', '+639171234573', 'active');

-- Insert 10 properties (assigned to different agents)
INSERT INTO properties (title, description, property_type, status, price, location, address, bedrooms, bathrooms, floor_area, lot_area, features, agent_id) VALUES
('Luxury 3BR House in Makati', 'Modern 3-bedroom house with spacious living area and garage', 'house', 'available', 15000000.00, 'Makati City', '123 Ayala Avenue, Makati City', 3, 2, 180.00, 200.00, '["garage", "garden", "security"]', 2),
('2BR Condo in BGC', 'Fully furnished 2-bedroom condo unit with city view', 'condo', 'available', 8500000.00, 'Bonifacio Global City', 'Unit 1503, One Serendra, BGC', 2, 2, 95.00, NULL, '["furnished", "pool", "gym"]', 3),
('Townhouse in Quezon City', 'Brand new 4-bedroom townhouse in gated community', 'townhouse', 'available', 12000000.00, 'Quezon City', '456 Commonwealth Avenue, QC', 4, 3, 220.00, 150.00, '["gated", "playground", "parking"]', 4),
('Commercial Lot in Pasig', '500 sqm commercial lot near highway', 'lot', 'available', 25000000.00, 'Pasig City', 'Ortigas Avenue, Pasig City', NULL, NULL, NULL, 500.00, '["commercial", "corner lot"]', 5),
('Beach House in Batangas', 'Beautiful 5BR beach house with private beach access', 'house', 'reserved', 35000000.00, 'Batangas', 'Beach Road, Nasugbu, Batangas', 5, 4, 300.00, 800.00, '["beach access", "pool", "garage"]', 6),
('Studio Condo in Manila', 'Affordable studio type condo near universities', 'condo', 'available', 3500000.00, 'Manila', 'Unit 805, Taft Tower, Manila', 1, 1, 28.00, NULL, '["furnished", "near schools"]', 7),
('4BR House in Alabang', 'Spacious family home in exclusive subdivision', 'house', 'available', 18000000.00, 'Alabang, Muntinlupa', 'Ayala Alabang Village', 4, 3, 250.00, 300.00, '["pool", "garden", "security", "garage"]', 2),
('Commercial Building in Makati', 'Three-story commercial building for lease or sale', 'commercial', 'available', 75000000.00, 'Makati City', 'Buendia Avenue, Makati', NULL, 4, 600.00, 200.00, '["elevator", "parking", "corner"]', 3),
('Residential Lot in Tagaytay', '1000 sqm residential lot with mountain view', 'lot', 'available', 12000000.00, 'Tagaytay City', 'Ridge Area, Tagaytay', NULL, NULL, NULL, 1000.00, '["mountain view", "flat terrain"]', 4),
('Penthouse in Ortigas', 'Luxury penthouse with panoramic city views', 'condo', 'sold', 45000000.00, 'Ortigas, Pasig', 'Penthouse Unit, The Grove, Ortigas', 3, 3, 280.00, NULL, '["penthouse", "balcony", "parking", "gym"]', 5);

-- Insert 15 inquiries with various statuses
INSERT INTO inquiries (property_id, client_name, client_email, client_phone, message, status, assigned_to, commission_amount, commission_locked) VALUES
(1, 'Robert Tan', 'robert.tan@email.com', '+639181234567', 'Interested in viewing this property', 'viewing_scheduled', 2, NULL, FALSE),
(2, 'Jennifer Lim', 'jennifer.lim@email.com', '+639181234568', 'Is this still available?', 'contacted', 3, NULL, FALSE),
(3, 'Michael Cruz', 'michael.cruz@email.com', '+639181234569', 'Would like to schedule a viewing', 'new', 4, NULL, FALSE),
(4, 'Sarah Torres', 'sarah.torres@email.com', '+639181234570', 'Interested for commercial use', 'negotiating', 5, 500000.00, FALSE),
(5, 'David Kim', 'david.kim@email.com', '+639181234571', 'Ready to make a deposit', 'deposit_paid', 6, 1750000.00, TRUE),
(5, 'Lisa Wang', 'lisa.wang@email.com', '+639181234572', 'Also interested in this property', 'cancelled', 6, NULL, FALSE),
(6, 'James Garcia', 'james.garcia@email.com', '+639181234573', 'Perfect for students', 'viewing_completed', 7, NULL, FALSE),
(7, 'Patricia Reyes', 'patricia.reyes@email.com', '+639181234574', 'Looking for family home', 'viewing_scheduled', 2, NULL, FALSE),
(8, 'Daniel Santos', 'daniel.santos@email.com', '+639181234575', 'For business investment', 'negotiating', 3, 2250000.00, FALSE),
(9, 'Michelle Aquino', 'michelle.aquino@email.com', '+639181234576', 'Great location!', 'contacted', 4, NULL, FALSE),
(10, 'Anthony Ramirez', 'anthony.ramirez@email.com', '+639181234577', 'Want to purchase immediately', 'sold', 5, 2250000.00, TRUE),
(1, 'Catherine Flores', 'catherine.flores@email.com', '+639181234578', 'Second inquiry for property 1', 'new', 2, NULL, FALSE),
(2, 'Steven Mendoza', 'steven.mendoza@email.com', '+639181234579', 'Looking for investment', 'viewing_scheduled', 3, NULL, FALSE),
(3, 'Elizabeth Cruz', 'elizabeth.cruz@email.com', '+639181234580', 'Need more details', 'contacted', 4, NULL, FALSE),
(7, 'Richard Valdez', 'richard.valdez@email.com', '+639181234581', 'Family of 5 looking for home', 'negotiating', 2, 540000.00, FALSE);

-- Update property 5 to be reserved by inquiry 5
UPDATE properties SET 
    status = 'reserved',
    reservation_type = 'deposit',
    reservation_date = NOW(),
    reservation_expiry = DATE_ADD(NOW(), INTERVAL 30 DAY),
    reserved_by_inquiry_id = 5
WHERE id = 5;

-- Update property 10 to be sold
UPDATE properties SET 
    status = 'sold',
    reservation_type = 'full_payment',
    reservation_date = DATE_SUB(NOW(), INTERVAL 15 DAY),
    reserved_by_inquiry_id = 11
WHERE id = 10;

-- Insert inquiry status history
INSERT INTO inquiry_status_history (inquiry_id, old_status, new_status, changed_by, notes) VALUES
(1, 'new', 'contacted', 2, 'Initial contact made via phone'),
(1, 'contacted', 'viewing_scheduled', 2, 'Viewing scheduled for next week'),
(5, 'new', 'contacted', 6, 'Client called and expressed interest'),
(5, 'contacted', 'negotiating', 6, 'Price negotiation started'),
(5, 'negotiating', 'deposit_paid', 6, 'Deposit received - 5% of property value'),
(11, 'new', 'contacted', 5, 'Initial contact made'),
(11, 'contacted', 'negotiating', 5, 'Client ready to purchase'),
(11, 'negotiating', 'sold', 5, 'Full payment received, property sold');

-- Insert 5 calendar events
INSERT INTO calendar_events (title, description, event_type, start_time, end_time, property_id, inquiry_id, agent_id, status) VALUES
('Property Viewing - Makati House', 'Client viewing for 3BR House in Makati', 'viewing', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 1 HOUR), 1, 1, 2, 'scheduled'),
('BGC Condo Viewing', 'Show 2BR condo unit to potential buyer', 'viewing', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 1 HOUR), 2, 13, 3, 'scheduled'),
('Team Meeting', 'Weekly sales team meeting', 'meeting', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), NULL, NULL, 2, 'scheduled'),
('Deposit Deadline - Beach House', 'Deadline for beach house deposit payment', 'deadline', DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 30 DAY), INTERVAL 1 HOUR), 5, 5, 6, 'scheduled'),
('Alabang House Viewing', 'Family viewing for 4BR house', 'viewing', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 1 HOUR), 7, 15, 2, 'scheduled');
