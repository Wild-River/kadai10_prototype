<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

$sql = "SELECT pins.id, pins.name, pins.status, categories.name AS category_name FROM pins LEFT JOIN categories ON pins.category_id = categories.id";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$pins = $stmt->fetchAll();
