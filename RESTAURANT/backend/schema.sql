-- KU Restaurant - Database Schema
-- Import this file once into MySQL (phpMyAdmin -> Import, or the command
-- line: mysql -u root -p < schema.sql) before using the backend.

CREATE DATABASE IF NOT EXISTS ku_restaurant
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ku_restaurant;

-- ---------------------------------------------------------------
-- Food orders placed from the Menu page
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_ref     VARCHAR(20)  NOT NULL UNIQUE,
    customer_name VARCHAR(120) NOT NULL,
    phone         VARCHAR(30)  NOT NULL,
    email         VARCHAR(150) NULL,
    order_type    ENUM('Dine-in','Takeaway','Delivery') NOT NULL DEFAULT 'Dine-in',
    location      VARCHAR(255) NOT NULL,
    table_number  VARCHAR(30) NULL,
    token_number  VARCHAR(30) NOT NULL UNIQUE,
    package_name  VARCHAR(100) NOT NULL DEFAULT 'Individual Meal',
    pickup_time   VARCHAR(40)  NOT NULL,
    notes         TEXT         NULL,
    total_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
    status        ENUM('pending', 'confirmed', 'ready', 'completed', 'cancelled')
                      NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    item_name   VARCHAR(120)  NOT NULL,
    unit_price  DECIMAL(10,2) NOT NULL,
    quantity    INT           NOT NULL,
    line_total  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------
-- Social event booking requests
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_bookings (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref  VARCHAR(20)  NOT NULL UNIQUE,
    event_type   VARCHAR(60)  NOT NULL,
    full_name    VARCHAR(120) NOT NULL,
    phone        VARCHAR(30)  NOT NULL,
    email        VARCHAR(120) NULL,
    guest_count  INT          NULL,
    event_date   DATE         NULL,
    event_time   TIME         NULL,
    venue        VARCHAR(160) NULL,
    package      VARCHAR(60)  NULL,
    extras       VARCHAR(255) NULL,
    message      TEXT         NULL,
    status       ENUM('new', 'contacted', 'confirmed', 'cancelled')
                      NOT NULL DEFAULT 'new',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ---------------------------------------------------------------
-- Contact page messages
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contact_messages (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    full_name  VARCHAR(120) NOT NULL,
    email      VARCHAR(120) NOT NULL,
    phone      VARCHAR(30)  NULL,
    subject    VARCHAR(150) NULL,
    message    TEXT         NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;
