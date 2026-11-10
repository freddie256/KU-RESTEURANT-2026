<?php
/**
 * KU Restaurant - Backend Configuration
 *
 * Update the values below to match your hosting environment
 * (XAMPP/WAMP on your laptop, or your live web host).
 */

// ---- Database ----
define('DB_HOST', 'localhost');
define('DB_NAME', 'ku_restaurant');
define('DB_USER', 'root');
define('DB_PASS', '');

// ---- Restaurant details (used in confirmation messages) ----
define('RESTAURANT_NAME', 'KU Restaurant');
define('RESTAURANT_PHONE', '+256 700 000 000');
define('RESTAURANT_EMAIL', 'sizoomuderick59@gmail.com');

// ---- Automatic order notifications ----
// Email is sent by PHP when an order is submitted.
// WhatsApp requires a WhatsApp Business/Cloud API sender. Put the API
// credentials below when available; the customer still sees only ONE button.
define('WHATSAPP_API_TOKEN', '');
define('WHATSAPP_PHONE_NUMBER_ID', '');
define('WHATSAPP_RECIPIENT', '0758388351');
define('WHATSAPP_API_VERSION', 'v23.0');

// ---- CORS ----
// If your front-end HTML files are served from the SAME domain/folder as
// this backend, you can leave this as "*". If you host the front-end
// separately, replace "*" with your exact site URL, e.g.
// 'https://kurestaurant.com'
define('ALLOWED_ORIGIN', '*');

// ---- Environment ----
// Set to false on a live server so PHP errors are never shown to visitors.
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}
