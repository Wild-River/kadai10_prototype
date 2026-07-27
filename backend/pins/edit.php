<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

$error = '';

$sql = "SELECT id, name FROM categories";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$categories = $stmt->fetchAll();

$sql = "SELECT id, name FROM tags";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$tags = $stmt->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'];

    $sql = "SELECT pins.id, pins.name, pins.status, pins.category_id, categories.name AS category_name
    FROM pins
    LEFT JOIN categories ON pins.category_id = categories.id
    WHERE pins.id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $post = $stmt->fetch();

    $sql = "SELECT tag_id FROM post_tags WHERE post_id = :id";
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
    $status = $_POST['status'] ?? '';
    $selectedTagIds = $_POST["tags"] ?? [];

    try {
        $uploadDir = __DIR__ . '/../../uploads/pins';
    } catch (RuntimeException $e) {
        $error = $e->getMessage();
    }

    $sql = "UPDATE pins SET user_id = :user_id, category_id = :category_id, name = :name, status = :status WHERE id = :id";
    $stmt = $pdo->prepare($sql);

    $stmt->bindValue(':id', $id, PDO::PARAM_STR);
    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
    $stmt->bindValue(':category_id', $category_id, PDO::PARAM_STR);
    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->bindValue(':status', $status, PDO::PARAM_STR);

    try {
        $stmt->execute();
        $deleteSql = "DELETE FROM post_tags WHERE post_id = :post_id";
        $deleteStmt = $pdo->prepare($deleteSql);
        $deleteStmt->bindValue(':post_id', $id, PDO::PARAM_INT);
        $deleteStmt->execute();

        foreach ($selectedTagIds as $selectedTagId) {
            $sql = "INSERT INTO post_tags (post_id, tag_id) VALUES (:post_id, :tag_id)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':post_id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':tag_id', $selectedTagId, PDO::PARAM_INT);
            $stmt->execute();
        }

        // redirect('index.php');
    } catch (PDOException $e) {
        $post = ['id' => $id, 'category_id' => $category_id, 'name' => $name, 'status' => $status];
    }
}
