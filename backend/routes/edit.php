<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? '';

    $sql = "SELECT routes.id, routes.user_id, routes.name, routes.status, routes.travel_mode
    FROM routes
    WHERE routes.id = :id AND routes.user_id = :user_id";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();
    $post = $stmt->fetch();

    $sql = "SELECT route_stops.id, route_stops.sort_order, pins.id AS pin_id, pins.name, pins.lat, pins.lng
    FROM route_stops
    JOIN pins ON route_stops.pin_id = pins.id
    WHERE route_stops.route_id = :id ORDER BY route_stops.sort_order";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $routeStops = $stmt->fetchAll();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $user_id = $_SESSION['user_id'] ?? '';
    $name = $_POST['name'] ?? '';
    $status = $_POST['status'] ?? 'draft';
    $travelMode = $_POST['travel_mode'] ?? 'WALKING';
    $routeStops = $_POST['route_stops'] ?? [];

    $checkStmt = $pdo->prepare("SELECT id FROM routes WHERE id = :id AND user_id = :user_id");
    $checkStmt->bindValue(':id', $id, PDO::PARAM_INT);
    $checkStmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
    $checkStmt->execute();

    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => '対象のルートが見つかりません']);
        exit;
    }

    $sql = "UPDATE routes SET name = :name, status = :status, travel_mode = :travel_mode WHERE id = :id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);

    $stmt->bindValue(':id', $id, PDO::PARAM_STR);
    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->bindValue(':status', $status, PDO::PARAM_STR);
    $stmt->bindValue(':travel_mode', $travelMode, PDO::PARAM_STR);

    try {
        $stmt->execute();

        $deleteSql = "DELETE FROM route_stops WHERE route_id = :route_id";
        $deleteStmt = $pdo->prepare($deleteSql);
        $deleteStmt->bindValue(':route_id', $id, PDO::PARAM_INT);
        $deleteStmt->execute();

        foreach ($routeStops as $index => $pinId) {
            $sql = "INSERT INTO route_stops (route_id, pin_id, sort_order) VALUES (:route_id, :pin_id, :sort_order)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':route_id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':pin_id', $pinId, PDO::PARAM_INT);
            $stmt->bindValue(':sort_order', $index, PDO::PARAM_INT);
            $stmt->execute();
        }

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'ルートの保存に失敗しました。時間をおいて再度お試しください。']);
    }
}
