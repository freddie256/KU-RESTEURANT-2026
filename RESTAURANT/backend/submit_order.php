<?php
/** KU Restaurant - Submit Food Order */
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Invalid request method.'], 405);
}

$input = readInput();
$customerName = sanitize($input['customer_name'] ?? '');
$phone        = sanitize($input['phone'] ?? '');
$email        = sanitize($input['email'] ?? '');
$orderType    = sanitize($input['order_type'] ?? 'Dine-in');
$location     = sanitize($input['location'] ?? '');
$packageName  = sanitize($input['package_name'] ?? 'Individual Meal');
$pickupTime   = sanitize($input['pickup_time'] ?? '');
$notes        = sanitize($input['notes'] ?? '');
$items        = is_array($input['items'] ?? null) ? $input['items'] : [];

$errors = [];
if ($customerName === '') $errors[] = 'Please tell us your name.';
if ($phone === '') $errors[] = 'Please provide a phone number.';
if ($location === '') $errors[] = 'Please provide your location.';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Please provide a valid email address.';
if (!in_array($orderType, ['Dine-in', 'Takeaway', 'Delivery'], true)) $errors[] = 'Please select a valid order type.';
if (empty($items)) $errors[] = 'Your cart is empty. Please add at least one item.';

if ($errors) jsonResponse(['success' => false, 'message' => implode(' ', $errors)], 422);

$total = 0;
$cleanItems = [];
foreach ($items as $item) {
    $name  = sanitize($item['name'] ?? '');
    $price = round((float)($item['price'] ?? 0), 2);
    $qty   = max(1, (int)($item['qty'] ?? 1));
    if ($name === '' || $price <= 0) continue;
    $lineTotal = $price * $qty;
    $total += $lineTotal;
    $cleanItems[] = ['name'=>$name, 'price'=>$price, 'qty'=>$qty, 'line_total'=>$lineTotal];
}
if (!$cleanItems) jsonResponse(['success'=>false,'message'=>'Your cart items could not be processed.'],422);

$pdo = getDbConnection();

try {
    $pdo->beginTransaction();

    // Generate a daily sequential token, e.g. KU-260926-001.
    $today = date('ymd');
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE() FOR UPDATE");
    $countStmt->execute();
    $dailyCount = (int)$countStmt->fetchColumn() + 1;
    $tokenNumber = 'KU-' . $today . '-' . str_pad((string)$dailyCount, 3, '0', STR_PAD_LEFT);

    // Automatically assign a table for dine-in. Customers never enter it.
    $tableNumber = null;
    if ($orderType === 'Dine-in') {
        $occupiedStmt = $pdo->query("SELECT table_number FROM orders WHERE DATE(created_at)=CURDATE() AND order_type='Dine-in' AND table_number IS NOT NULL AND status IN ('pending','confirmed','preparing','ready')");
        $occupied = [];
        foreach ($occupiedStmt->fetchAll(PDO::FETCH_COLUMN) as $table) $occupied[(string)$table] = true;
        for ($i=1; $i<=50; $i++) {
            $candidate = 'T' . str_pad((string)$i, 2, '0', STR_PAD_LEFT);
            if (!isset($occupied[$candidate])) { $tableNumber = $candidate; break; }
        }
        if ($tableNumber === null) throw new RuntimeException('All restaurant tables are currently occupied.');
    }

    $orderRef = generateReference('KU');
    $orderStmt = $pdo->prepare('INSERT INTO orders
        (order_ref, customer_name, phone, email, order_type, location, table_number, token_number, package_name, pickup_time, notes, total_amount)
        VALUES (:ref,:name,:phone,:email,:type,:location,:table,:token,:package,:pickup,:notes,:total)');
    $orderStmt->execute([
        ':ref'=>$orderRef, ':name'=>$customerName, ':phone'=>$phone,
        ':email'=>$email !== '' ? $email : null, ':type'=>$orderType,
        ':location'=>$location, ':table'=>$tableNumber, ':token'=>$tokenNumber,
        ':package'=>$packageName, ':pickup'=>$pickupTime !== '' ? $pickupTime : 'As soon as possible',
        ':notes'=>$notes, ':total'=>$total
    ]);
    $orderId=(int)$pdo->lastInsertId();

    $itemStmt=$pdo->prepare('INSERT INTO order_items (order_id,item_name,unit_price,quantity,line_total) VALUES (:order_id,:name,:price,:qty,:line_total)');
    foreach($cleanItems as $item){
        $itemStmt->execute([':order_id'=>$orderId,':name'=>$item['name'],':price'=>$item['price'],':qty'=>$item['qty'],':line_total'=>$item['line_total']]);
    }

    $pdo->commit();

    $message = "NEW ORDER - " . RESTAURANT_NAME . "\n\n";
    $message .= "Token: {$tokenNumber}\nOrder Ref: {$orderRef}\n";
    $message .= "Customer: {$customerName}\nPhone: {$phone}\n";
    if ($email !== '') $message .= "Email: {$email}\n";
    $message .= "Order Type: {$orderType}\nLocation: {$location}\n";
    $message .= "Table: " . ($tableNumber ?: 'Not required') . "\n";
    $message .= "Package: {$packageName}\nTime: " . ($pickupTime ?: 'As soon as possible') . "\n\nItems:\n";
    foreach($cleanItems as $item) $message .= "- {$item['qty']} x {$item['name']} = UGX " . number_format($item['line_total']) . "\n";
    $message .= "\nTOTAL: UGX " . number_format($total) . "\n";
    if ($notes !== '') $message .= "Notes: {$notes}\n";

    $emailSent = sendOrderEmail('New Restaurant Order - ' . $tokenNumber, $message, $email ?: null);
    $whatsappSent = sendOrderWhatsApp($message);

    jsonResponse([
        'success'=>true,
        'message'=>'Order submitted successfully. The restaurant has been notified.',
        'order_ref'=>$orderRef,
        'token_number'=>$tokenNumber,
        'total'=>$total,
        'order_type'=>$orderType,
        'location'=>$location,
        'table_number'=>$tableNumber,
        'package_name'=>$packageName,
        'email_sent'=>$emailSent,
        'whatsapp_sent'=>$whatsappSent
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    jsonResponse(['success'=>false,'message'=>'The order could not be submitted. Please try again.','debug'=>DEBUG_MODE?$e->getMessage():null],500);
}
