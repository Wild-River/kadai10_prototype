<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $status = $_POST['status'] ?? 'draft';
    $routeStops = $_POST['route_stops'] ?? [];

    $sql = "INSERT INTO routes (user_id, name, status) VALUES (:user_id, :name, :status)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->bindValue(':status', $status, PDO::PARAM_STR);

    try {
        $stmt->execute();
        $routeId = $pdo->lastInsertId(); //今INSERTしたばかりの行のIDを取得

        foreach ($routeStops as $index => $pinId) {
            $sql = "INSERT INTO route_stops (route_id, pin_id, sort_order) VALUES (:route_id, :pin_id, :sort_order)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':route_id', $routeId, PDO::PARAM_INT);
            $stmt->bindValue(':pin_id', $pinId, PDO::PARAM_INT);
            $stmt->bindValue(':sort_order', $index, PDO::PARAM_INT);
            $stmt->execute();
        }

        echo json_encode(['success' => true, 'id' => $routeId]);
    } catch (PDOException $e) {
        error_log($e->getMessage()); // 開発者向け：詳細はログへ
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'ルートの保存に失敗しました。時間をおいて再度お試しください。']);
    }
}
