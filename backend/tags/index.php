<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

$stmt = $pdo->prepare("SELECT id, name, slug FROM tags");
$stmt->execute();
$tags = $stmt->fetchAll();

echo json_encode(['success' => true, 'tags' => $tags]);
