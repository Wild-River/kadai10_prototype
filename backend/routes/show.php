<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

$id = $_GET['id'] ?? '';

$sql = "SELECT routes.id, routes.name, routes.status, routes.user_id
FROM routes
WHERE routes.id = :id AND (routes.status = 'published' OR routes.user_id = :user_id)";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(':id', $id, PDO::PARAM_INT);
$stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
$stmt->execute();
$route = $stmt->fetch();

$sql = "SELECT route_stops.id, route_stops.sort_order, pins.id AS pin_id, pins.name, pins.lat, pins.lng
FROM route_stops
JOIN pins ON route_stops.pin_id = pins.id
WHERE route_stops.route_id = :id ORDER BY route_stops.sort_order";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':id', $id, PDO::PARAM_INT);
$stmt->execute();
$routeStops = $stmt->fetchAll();

echo json_encode(['success' => true, 'route' => $route, 'route_stops' => $routeStops]);
