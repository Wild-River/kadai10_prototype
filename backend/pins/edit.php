<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? '';

    $sql = "SELECT pins.id, pins.category_id, pins.name, pins.lat, pins.lng, pins.status, categories.color, categories.name AS category_name
    FROM pins
    LEFT JOIN categories ON pins.category_id = categories.id
    WHERE pins.id = :id AND pins.user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();
    $post = $stmt->fetch();

    $sql = "SELECT tag_id FROM pin_tag WHERE pin_id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $postTagIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

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

    $sql = "UPDATE pins SET category_id = :category_id, name = :name, lat = :lat, lng = :lng, status = :status WHERE id = :id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);

    $stmt->bindValue(':id', $id, PDO::PARAM_STR);
    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
    $stmt->bindValue(':category_id', $category_id, PDO::PARAM_STR);
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->bindValue(':lat', $lat, PDO::PARAM_STR);
    $stmt->bindValue(':lng', $lng, PDO::PARAM_STR);
    $stmt->bindValue(':status', $status, PDO::PARAM_STR);

    try {
        $stmt->execute();
        $affectedRows = $stmt->rowCount(); // ここで確保

        // 他人のpinを消そうとした/編集しようとした場合
        if ($affectedRows === 0) {
            http_response_code(404); // または403
            echo json_encode(['success' => false, 'message' => '対象の投稿が見つかりません']);
            exit;
        }

        $deleteSql = "DELETE FROM pin_tag WHERE pin_id = :pin_id";
        $deleteStmt = $pdo->prepare($deleteSql);
        $deleteStmt->bindValue(':pin_id', $id, PDO::PARAM_INT);
        $deleteStmt->execute();

        foreach ($selectedTagIds as $selectedTagId) {
            $sql = "INSERT INTO pin_tag (pin_id, tag_id) VALUES (:pin_id, :tag_id)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':pin_id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':tag_id', $selectedTagId, PDO::PARAM_INT);
            $stmt->execute();
        }

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '投稿の保存に失敗しました。時間をおいて再度お試しください。']);
    }
}
