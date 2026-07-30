<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

$id = $_GET['id'] ?? '';

$sql = "SELECT pins.id, pins.category_id, pins.name, pins.status, pins.lat, pins.lng, pins.user_id, categories.color, categories.icon, categories.name AS category_name
FROM pins
LEFT JOIN categories ON pins.category_id = categories.id
WHERE pins.id = :id AND (pins.status = 'published' OR pins.user_id = :user_id)";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(':id', $id, PDO::PARAM_INT);
$stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
$stmt->execute();
$pin = $stmt->fetch();

$sql = "SELECT tag_id FROM pin_tag WHERE pin_id = :id";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':id', $id, PDO::PARAM_INT);
$stmt->execute();
$postTagIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

$sql = "SELECT type, content, url, sort_order FROM pin_blocks WHERE pin_id = :id ORDER BY sort_order";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':id', $id, PDO::PARAM_INT);
$stmt->execute();
$postBlocks = $stmt->fetchAll();

echo json_encode(['success' => true, 'pin' => $pin, 'tags' => $postTagIds, 'blocks' => $postBlocks]);
