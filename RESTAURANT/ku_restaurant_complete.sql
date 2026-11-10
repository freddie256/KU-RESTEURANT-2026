-- ============================================================
-- KU RESTAURANT - COMPLETE MYSQL DATABASE
-- Compatible with the current KU Restaurant frontend/backend.
-- Import this whole file in phpMyAdmin.
-- ============================================================

CREATE DATABASE IF NOT EXISTS ku_restaurant
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ku_restaurant;

-- If this database was created from an older version, run these ALTER
-- statements once before using the new checkout fields.
-- For a fresh installation the CREATE TABLE below already contains them.
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. ADMIN USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(150) NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin','manager','staff') NOT NULL DEFAULT 'staff',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    last_login DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. MENU CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. MENU ITEMS
-- Supports admin add/edit/delete/availability and food images.
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT NULL,
    category VARCHAR(80) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255) NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_by INT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_menu_category (category),
    INDEX idx_menu_available (is_available),
    CONSTRAINT fk_menu_category
        FOREIGN KEY (category_id) REFERENCES menu_categories(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_menu_admin
        FOREIGN KEY (created_by) REFERENCES admins(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. FOOD ORDERS
-- Current cart.js uses:
-- customer_name, phone, pickup_time, notes, total_amount/order total
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_ref VARCHAR(20) NOT NULL UNIQUE,
    customer_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NULL,
    order_type ENUM('Dine-in','Takeaway','Delivery') NOT NULL DEFAULT 'Dine-in',
    location VARCHAR(255) NOT NULL,
    table_number VARCHAR(30) NULL,
    token_number VARCHAR(30) NOT NULL UNIQUE,
    package_name VARCHAR(100) NOT NULL DEFAULT 'Individual Meal',
    pickup_time VARCHAR(40) NULL,
    notes TEXT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM(
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    payment_status ENUM(
        'unpaid',
        'pending',
        'paid',
        'refunded'
    ) NOT NULL DEFAULT 'unpaid',
    payment_method ENUM(
        'cash',
        'mobile_money',
        'card',
        'other'
    ) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_status (status),
    INDEX idx_order_phone (phone),
    INDEX idx_order_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. ORDER ITEMS
-- Snapshot item name and price so old orders remain correct
-- even when menu items are edited later.
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    menu_item_id INT UNSIGNED NULL,
    item_name VARCHAR(120) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    line_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL,
    INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. TABLE RESERVATIONS
-- For normal restaurant table bookings.
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(30) NOT NULL,
    guests TINYINT UNSIGNED NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    notes TEXT NULL,
    status ENUM(
        'pending',
        'confirmed',
        'cancelled',
        'completed'
    ) NOT NULL DEFAULT 'pending',
    admin_note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reservation_date (booking_date),
    INDEX idx_reservation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. SOCIAL EVENT TYPES
-- ============================================================
CREATE TABLE IF NOT EXISTS event_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT NULL,
    image VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. SOCIAL EVENT BOOKINGS / REQUESTS
-- Matches event-booking.html and submit_booking.php:
-- event_type, full_name, phone, email, guest_count, event_date,
-- event_time, venue, package, extras, message.
-- ============================================================
CREATE TABLE IF NOT EXISTS event_bookings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(20) NOT NULL UNIQUE,
    event_type_id INT UNSIGNED NULL,
    event_type VARCHAR(80) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NULL,
    guest_count INT UNSIGNED NULL,
    event_date DATE NULL,
    event_time TIME NULL,
    venue VARCHAR(160) NULL,
    package VARCHAR(80) NULL,
    extras TEXT NULL,
    message TEXT NULL,
    status ENUM(
        'new',
        'contacted',
        'quoted',
        'confirmed',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'new',
    admin_response TEXT NULL,
    response_at DATETIME NULL,
    responded_by INT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_status (status),
    INDEX idx_event_date (event_date),
    INDEX idx_event_phone (phone),
    FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9. EVENT BOOKING CONVERSATION / CLIENT MESSAGES
-- Allows the client and restaurant to continue communicating
-- about a particular event request.
-- ============================================================
CREATE TABLE IF NOT EXISTS event_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_booking_id INT UNSIGNED NOT NULL,
    sender_type ENUM('customer','admin') NOT NULL,
    sender_name VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_booking_id)
        REFERENCES event_bookings(id) ON DELETE CASCADE,
    INDEX idx_event_messages_booking (event_booking_id),
    INDEX idx_event_messages_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. CONTACT MESSAGES
-- Matches contact.html:
-- name, contact, subject, message.
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,
    subject VARCHAR(150) NULL,
    message TEXT NOT NULL,
    status ENUM('new','read','replied','closed') NOT NULL DEFAULT 'new',
    admin_reply TEXT NULL,
    replied_by INT UNSIGNED NULL,
    replied_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (replied_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_contact_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 11. CUSTOMER FEEDBACK
-- General feedback about food/service/restaurant.
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,
    rating TINYINT UNSIGNED NULL,
    subject VARCHAR(150) NULL,
    message TEXT NOT NULL,
    status ENUM('new','reviewed','responded','closed') NOT NULL DEFAULT 'new',
    admin_reply TEXT NULL,
    replied_by INT UNSIGNED NULL,
    replied_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (replied_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_feedback_status (status),
    INDEX idx_feedback_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 12. TESTIMONIALS
-- Customers submit testimonials; admin approves before display.
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NULL,
    role_or_title VARCHAR(120) NULL,
    message TEXT NOT NULL,
    rating TINYINT UNSIGNED NULL,
    image VARCHAR(255) NULL,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    approved_by INT UNSIGNED NULL,
    approved_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_testimonial_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 13. GALLERY
-- Admin can add/remove photos from the restaurant gallery.
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    image VARCHAR(255) NOT NULL,
    category VARCHAR(80) NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    uploaded_by INT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_gallery_category (category),
    INDEX idx_gallery_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 14. SITE SETTINGS
-- Allows admin to manage restaurant information centrally.
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    setting_group VARCHAR(80) NOT NULL DEFAULT 'general',
    updated_by INT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 15. ADMIN NOTIFICATIONS
-- Dashboard notifications for new orders, bookings, messages,
-- testimonials and feedback.
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    reference_id INT UNSIGNED NULL,
    reference_type VARCHAR(50) NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_notification_admin (admin_id),
    INDEX idx_notification_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 16. ADMIN ACTIVITY LOG
-- Records important administrative actions.
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_activity_admin (admin_id),
    INDEX idx_activity_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Admin demo account.
-- Password: Admin@123
-- IMPORTANT: replace this hash with a password_hash() value
-- before using the system publicly.
INSERT IGNORE INTO admins
    (full_name, username, email, password_hash, role)
VALUES
    (
        'KU Restaurant Administrator',
        'admin',
        'admin@kurestaurant.local',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC6jJYzJ5nV5pKJf1C',
        'super_admin'
    );

-- Menu categories
INSERT IGNORE INTO menu_categories
    (name, description, display_order)
VALUES
    ('Starters', 'Light meals and snacks to begin your meal.', 1),
    ('Mains', 'Main meals prepared by KU Restaurant.', 2),
    ('Drinks', 'Fresh juices, water, soda and hot drinks.', 3),
    ('Breakfast', 'Breakfast meals and morning favourites.', 4),
    ('Snacks', 'Quick bites and campus favourites.', 5),
    ('Desserts', 'Sweet treats and desserts.', 6);

-- Event types
INSERT IGNORE INTO event_types
    (name, description, display_order)
VALUES
    ('Birthday', 'Birthday celebrations and private parties.', 1),
    ('Conference', 'Conference and corporate event arrangements.', 2),
    ('Handover Party', 'Handover and institutional celebrations.', 3),
    ('Wedding', 'Wedding receptions and related celebrations.', 4),
    ('Graduation', 'Graduation celebrations and meals.', 5),
    ('Meeting', 'Meetings and small group functions.', 6),
    ('Social Gathering', 'General social gatherings.', 7),
    ('Other Event', 'Other events not listed above.', 8);

-- Sample menu items
INSERT INTO menu_items
    (name, description, category, price, image, is_featured, is_available)
VALUES
    ('Chicken Samosas',
     'Crispy pastry filled with spiced chicken',
     'Starters',
     8000,
     'images/samo.jpg',
     1,
     1),

    ('Grilled Tilapia',
     'Whole tilapia with kachumbari and chips',
     'Mains',
     28000,
     'images/fish.jpg',
     1,
     1),

    ('Beef Pilau',
     'Spiced rice with tender beef',
     'Mains',
     18000,
     'images/pilau.jpg',
     1,
     1),

    ('Fresh Passion Juice',
     'Freshly squeezed passion juice, no sugar added',
     'Drinks',
     5000,
     'images/juice.jpg',
     1,
     1),

    ('Rolex',
     'Chapati wrapped with egg and fresh vegetables',
     'Snacks',
     7000,
     'images/rolex.jpg',
     0,
     1),

    ('Matoke',
     'Traditional banana meal prepared with a savoury sauce',
     'Mains',
     12000,
     'images/matoke.jpg',
     0,
     1),

    ('Millet Porridge',
     'Warm millet porridge served fresh',
     'Breakfast',
     5000,
     'images/millet pprridge.jpg',
     0,
     1),

    ('Coffee',
     'Freshly prepared hot coffee',
     'Drinks',
     5000,
     'images/coffee.jpg',
     0,
     1);

-- Gallery sample records using image files already present
INSERT INTO gallery
    (title, image, category, is_featured, is_active, display_order)
VALUES
    ('KU Restaurant Meal', 'images/fish.jpg', 'Food', 1, 1, 1),
    ('Fresh Juice', 'images/juice.jpg', 'Drinks', 1, 1, 2),
    ('Beef Pilau', 'images/pilau.jpg', 'Food', 1, 1, 3),
    ('Freshly Prepared Meal', 'images/matoke.jpg', 'Food', 0, 1, 4),
    ('Restaurant Snack', 'images/rolex.jpg', 'Food', 0, 1, 5),
    ('Coffee', 'images/coffee.jpg', 'Drinks', 0, 1, 6);

-- Site settings
INSERT IGNORE INTO site_settings
    (setting_key, setting_value, setting_group)
VALUES
    ('restaurant_name', 'KU Restaurant', 'general'),
    ('currency', 'UGX', 'general'),
    ('phone', '+256 700 000 000', 'contact'),
    ('whatsapp', '+256 700 000 000', 'contact'),
    ('email', 'info@kurestaurant.local', 'contact'),
    ('address', 'Kampala University Campus, Uganda', 'contact'),
    ('opening_hours', 'Monday - Sunday: 7:00 AM - 9:00 PM', 'hours'),
    ('facebook_url', '#', 'social'),
    ('instagram_url', '#', 'social'),
    ('twitter_url', '#', 'social');

-- ============================================================
-- USEFUL VIEWS FOR ADMIN DASHBOARD
-- ============================================================

CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM menu_items WHERE is_available = 1) AS available_menu_items,
    (SELECT COUNT(*) FROM orders WHERE status IN ('pending','confirmed','preparing')) AS active_orders,
    (SELECT COUNT(*) FROM event_bookings WHERE status IN ('new','contacted','quoted')) AS active_event_requests,
    (SELECT COUNT(*) FROM contact_messages WHERE status = 'new') AS new_messages,
    (SELECT COUNT(*) FROM feedback WHERE status = 'new') AS new_feedback,
    (SELECT COUNT(*) FROM testimonials WHERE status = 'pending') AS pending_testimonials;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF KU RESTAURANT DATABASE
-- ============================================================
