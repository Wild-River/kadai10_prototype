<?php
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '認証が必要です']);
    exit();
}

$timeout = 1800; // タイムアウトまでの秒数（30分）
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
    $_SESSION = [];
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'セッションがタイムアウトしました']);
    exit();
}
$_SESSION['last_activity'] = time();
