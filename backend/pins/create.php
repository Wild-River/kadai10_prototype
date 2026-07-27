<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

$error = '';
$category_id = '';
$name = '';
$status = '';

$sql = "SELECT id, name FROM categories";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$categories = $stmt->fetchAll();

$sql = "SELECT id, name FROM tags";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$tags = $stmt->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    if (!$error) {
        $sql = "INSERT INTO pins (user_id, category_id, name, status) VALUES (:user_id, :category_id, :name, :status)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':user_id', $user_id, PDO::PARAM_STR);
        $stmt->bindValue(':category_id', $category_id, PDO::PARAM_STR);
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);

        try {
            $stmt->execute();
            $post_id = $pdo->lastInsertId(); //今INSERTしたばかりの行のIDを取得

            foreach ($selectedTagIds as $selectedTagId) {
                $sql = "INSERT INTO post_tags (post_id, tag_id) VALUES (:post_id, :tag_id)";
                $stmt = $pdo->prepare($sql);
                $stmt->bindValue(':post_id', $post_id, PDO::PARAM_INT);
                $stmt->bindValue(':tag_id', $selectedTagId, PDO::PARAM_INT);
                $stmt->execute();
            }

            // redirect('index.php');
        } catch (e) {
        }
    }
}
