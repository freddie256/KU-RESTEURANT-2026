<?php
/**
 * KU Restaurant - Shared backend helpers
 *
 * Included by every endpoint in this folder. Sets up CORS, gives every
 * endpoint a PDO connection, and provides small helpers so each endpoint
 * file stays short and readable.
 */

require_once __DIR__ . '/config.php';

// ---- CORS + JSON headers (every endpoint returns JSON) ----
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Browsers send an OPTIONS "preflight" request before the real POST.
// Answer it immediately with no body.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Send a JSON response and stop execution.
 */
function jsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Trim + escape a string coming from the client.
 */
function sanitize(?string $value): string
{
    return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

/**
 * Read and decode a JSON request body sent via fetch().
 * Falls back to $_POST for plain HTML form submissions.
 */
function readInput(): array
{
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true);

    if (is_array($decoded)) {
        return $decoded;
    }

    return $_POST;
}

/**
 * Generate a short, human-friendly reference code, e.g. KU-8F3A2C.
 */
function generateReference(string $prefix = 'KU'): string
{
    return $prefix . '-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
}

/**
 * Get a shared PDO connection. Connects once per request.
 */
function getDbConnection(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    } catch (PDOException $e) {
        jsonResponse([
            'success' => false,
            'message' => 'Could not connect to the database. Please try again shortly.',
            'debug'   => DEBUG_MODE ? $e->getMessage() : null,
        ], 500);
    }

    return $pdo;
}


/** Send an order notification email directly from the server. */
function sendOrderEmail(string $subject, string $body, ?string $customerEmail = null): bool
{
    $headers = "From: " . RESTAURANT_EMAIL . "\r\n";
    $headers .= "Reply-To: " . RESTAURANT_EMAIL . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $sent = @mail(RESTAURANT_EMAIL, $subject, $body, $headers);

    if ($customerEmail && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        @mail($customerEmail, 'Your ' . RESTAURANT_NAME . ' order confirmation', $body, $headers);
    }

    return $sent;
}

/**
 * Send an order notification through WhatsApp Business Cloud API.
 * If credentials are not configured, return false rather than exposing
 * a WhatsApp/email choice to the customer.
 */
function sendOrderWhatsApp(string $message): bool
{
    if (WHATSAPP_API_TOKEN === '' || WHATSAPP_PHONE_NUMBER_ID === '' || WHATSAPP_RECIPIENT === '') {
        return false;
    }

    $recipient = preg_replace('/\D+/', '', WHATSAPP_RECIPIENT);
    if (strpos($recipient, '0') === 0) {
        $recipient = '256' . substr($recipient, 1);
    }

    $url = 'https://graph.facebook.com/' . WHATSAPP_API_VERSION . '/' . WHATSAPP_PHONE_NUMBER_ID . '/messages';
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'to' => $recipient,
        'type' => 'text',
        'text' => ['body' => $message]
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . WHATSAPP_API_TOKEN,
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 15
    ]);

    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $response !== false && $httpCode >= 200 && $httpCode < 300;
}
