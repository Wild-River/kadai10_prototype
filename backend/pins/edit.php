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

    $sql = "SELECT type, content, url, sort_order FROM pin_blocks WHERE pin_id = :id ORDER BY sort_order";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $postBlocks = $stmt->fetchAll();
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

    $checkStmt = $pdo->prepare("SELECT id FROM pins WHERE id = :id AND user_id = :user_id");
    $checkStmt->bindValue(':id', $id, PDO::PARAM_INT);
    $checkStmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
    $checkStmt->execute();

    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => '対象の投稿が見つかりません']);
        exit;
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

        $deleteBlockSql = "DELETE FROM pin_blocks WHERE pin_id = :pin_id";
        $deleteBlockStmt = $pdo->prepare($deleteBlockSql);
        $deleteBlockStmt->bindValue(':pin_id', $id, PDO::PARAM_INT);
        $deleteBlockStmt->execute();

        $blocks = $_POST['blocks'] ?? [];
        foreach ($blocks as $index => $block) {
            $sql = "INSERT INTO pin_blocks (pin_id, type, content, url, sort_order) VALUES (:pin_id, :type, :content, :url, :sort_order)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':pin_id', $id, PDO::PARAM_STR);
            $stmt->bindValue(':type', $block['type'], PDO::PARAM_STR);
            $content = $block['type'] === 'text' ? $block['content'] : null;
            $stmt->bindValue(':content', $content, is_null($content) ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $url = $block['type'] === 'image' ? $block['url'] : null;
            $stmt->bindValue(':url', $url, is_null($url) ? PDO::PARAM_NULL : PDO::PARAM_STR);
            $stmt->bindValue(':sort_order', $index, PDO::PARAM_INT);
            $stmt->execute();
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
