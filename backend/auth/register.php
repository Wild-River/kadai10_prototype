<?php
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

// username/emailの重複チェック
// usersテーブルにUNIQUE制約があるので、try-catchでPDOExceptionを拾い、重複エラー（SQLSTATE 23000）を判定してユーザーに分かるメッセージを返す
// password_hash($password, PASSWORD_DEFAULT)で保存
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)");
        $stmt->bindValue(':username', $username, PDO::PARAM_STR);
        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->bindValue(':password_hash', $hash, PDO::PARAM_STR);
        $stmt->execute();

        $userId = $pdo->lastInsertId();
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;

        echo json_encode(['success' => true, 'user' => ['id' => $userId, 'username' => $username]]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            http_response_code(409); // Conflict
            echo json_encode(['success' => false, 'message' => 'そのユーザー名またはメールアドレスは既に使用されています']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => '登録に失敗しました']);
        }
    }
}
