<?php
require_once '../auth/auth.php';
require_once '../config/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];

    $sql = "DELETE FROM pins WHERE id = :id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);

    try {
        $stmt->execute();

        // 他人のpinを消そうとした/編集しようとした場合
        if ($stmt->rowCount() === 0) {
            http_response_code(404); // または403
            echo json_encode(['success' => false, 'message' => '対象の投稿が見つかりません']);
            exit;
        }

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        error_log($e->getMessage()); // 開発者向け：詳細はログへ
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '投稿の保存に失敗しました。時間をおいて再度お試しください。']);
    }
}
