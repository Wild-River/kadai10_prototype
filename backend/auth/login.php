<?php
require_once '../config/cors.php';
require_once '../config/session.php';
require_once '../config/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];

        echo json_encode([
            'success' => true,
            // $userをそのままJSONで返すとpassword_hashまで漏れてしまうので、必要なフィールドだけを返す
            'user' => ['id' => $user['id'], 'username' => $user['username']],
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'ユーザー名またはパスワードが違います']);
    }
}
