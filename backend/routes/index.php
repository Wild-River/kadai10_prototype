<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

$sql = "SELECT routes.id, routes.name, routes.status, routes.user_id
FROM routes
WHERE routes.status = 'published' OR routes.user_id = :user_id";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
$stmt->execute();
$routes = $stmt->fetchAll();
echo json_encode(['success' => true, 'routes' => $routes]);
