<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

$sql = "SELECT pins.id, pins.name, pins.status, pins.lat, pins.lng, pins.user_id, categories.color, categories.icon, categories.name AS category_name
FROM pins
LEFT JOIN categories ON pins.category_id = categories.id
WHERE pins.status = 'published' OR pins.user_id = :user_id";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
$stmt->execute();
$pins = $stmt->fetchAll();
echo json_encode(['success' => true, 'pins' => $pins]);
