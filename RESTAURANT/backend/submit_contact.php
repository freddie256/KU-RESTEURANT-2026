<?php
/**
 * KU Restaurant - Submit Contact Message
 *
 * Called by the contact form on contact.html.
 */

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Invalid request method.'], 405);
}

$input = readInput();

$fullName = sanitize($input['full_name'] ?? '');
$email    = sanitize($input['email'] ?? '');
$phone    = sanitize($input['phone'] ?? '');
$subject  = sanitize($input['subject'] ?? '');
$message  = sanitize($input['message'] ?? '');

$errors = [];

if ($fullName === '') {
    $errors[] = 'Please tell us your name.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address.';
}

if ($message === '') {
    $errors[] = 'Please write a message.';
}

if (!empty($errors)) {
    jsonResponse(['success' => false, 'message' => implode(' ', $errors)], 422);
}

$pdo = getDbConnection();

try {
    $stmt = $pdo->prepare(
        'INSERT INTO contact_messages (full_name, email, phone, subject, message)
         VALUES (:name, :email, :phone, :subject, :message)'
    );

    $stmt->execute([
        ':name'    => $fullName,
        ':email'   => $email,
        ':phone'   => $phone !== '' ? $phone : null,
        ':subject' => $subject !== '' ? $subject : null,
        ':message' => $message,
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Thanks for reaching out! We will get back to you soon.',
    ]);

} catch (Exception $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Something went wrong while sending your message. Please try again.',
        'debug'   => DEBUG_MODE ? $e->getMessage() : null,
    ], 500);
}
