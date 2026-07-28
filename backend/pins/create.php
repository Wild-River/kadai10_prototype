<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

$error = '';
$category_id = '';
$name = '';
$lat = '';
$lng = '';
$status = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'] ?? '';
    $category_id = $_POST['category_id'] ?? '';
    $name = $_POST['name'] ?? '';
    $lat = $_POST['lat'] ?? '';
    $lng = $_POST['lng'] ?? '';
    $status = $_POST['status'] ?? '';
    $selectedTagIds = $_POST["tags"] ?? [];

    try {
        $uploadDir = __DIR__ . '/../../uploads/pins';
    } catch (RuntimeException $e) {
        $error = $e->getMessage();
    }

    if (!$error) {
        $sql = "INSERT INTO pins (user_id, category_id, name, lat, lng, status) VALUES (:user_id, :category_id, :name, :lat, :lng,:status)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
        $stmt->bindValue(':category_id', $category_id, PDO::PARAM_STR);
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':lat', $lat, PDO::PARAM_STR);
        $stmt->bindValue(':lng', $lng, PDO::PARAM_STR);
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);

        try {
            $stmt->execute();
            $pin_id = $pdo->lastInsertId(); //今INSERTしたばかりの行のIDを取得

            foreach ($selectedTagIds as $selectedTagId) {
                $sql = "INSERT INTO pin_tag (pin_id, tag_id) VALUES (:pin_id, :tag_id)";
                $stmt = $pdo->prepare($sql);
                $stmt->bindValue(':pin_id', $pin_id, PDO::PARAM_INT);
                $stmt->bindValue(':tag_id', $selectedTagId, PDO::PARAM_INT);
                $stmt->execute();
            }

            echo json_encode(['success' => true, 'id' => $pin_id]);
        } catch (PDOException $e) {
            error_log($e->getMessage()); // 開発者向け：詳細はログへ
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '投稿の保存に失敗しました。時間をおいて再度お試しください。']);
        }
    }
}
