<?php
/**
 * KU Restaurant - Submit Event Booking
 *
 * Called by the "Request This Event" booking form (event-booking.html).
 */

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Invalid request method.'], 405);
}

$input = readInput();

$eventType   = sanitize($input['event_type'] ?? '');
$fullName    = sanitize($input['full_name'] ?? '');
$phone       = sanitize($input['phone'] ?? '');
$email       = sanitize($input['email'] ?? '');
$guestCount  = (int) ($input['guest_count'] ?? 0);
$eventDate   = sanitize($input['event_date'] ?? '');
$eventTime   = sanitize($input['event_time'] ?? '');
$venue       = sanitize($input['venue'] ?? '');
$package     = sanitize($input['package'] ?? '');
$extrasArray = is_array($input['extras'] ?? null) ? $input['extras'] : [];
$extras      = sanitize(implode(', ', $extrasArray));
$message     = sanitize($input['message'] ?? '');

$errors = [];

if ($eventType === '') {
    $errors[] = 'Please select an event type.';
}

if ($fullName === '') {
    $errors[] = 'Please tell us your name.';
}

if ($phone === '') {
    $errors[] = 'Please provide a phone number so we can reach you.';
}

if (!empty($errors)) {
    jsonResponse(['success' => false, 'message' => implode(' ', $errors)], 422);
}

$pdo = getDbConnection();

try {
    $bookingRef = generateReference('EV');

    $stmt = $pdo->prepare(
        'INSERT INTO event_bookings
            (booking_ref, event_type, full_name, phone, email, guest_count,
             event_date, event_time, venue, package, extras, message)
         VALUES
            (:ref, :type, :name, :phone, :email, :guests,
             :date, :time, :venue, :package, :extras, :message)'
    );

    $stmt->execute([
        ':ref'     => $bookingRef,
        ':type'    => $eventType,
        ':name'    => $fullName,
        ':phone'   => $phone,
        ':email'   => $email !== '' ? $email : null,
        ':guests'  => $guestCount > 0 ? $guestCount : null,
        ':date'    => $eventDate !== '' ? $eventDate : null,
        ':time'    => $eventTime !== '' ? $eventTime : null,
        ':venue'   => $venue !== '' ? $venue : null,
        ':package' => $package !== '' ? $package : null,
        ':extras'  => $extras !== '' ? $extras : null,
        ':message' => $message !== '' ? $message : null,
    ]);

    jsonResponse([
        'success'     => true,
        'message'     => 'Your event request has been received! Our team will contact you shortly.',
        'booking_ref' => $bookingRef,
    ]);

} catch (Exception $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Something went wrong while saving your request. Please try again.',
        'debug'   => DEBUG_MODE ? $e->getMessage() : null,
    ], 500);
}
