<?php
require_once __DIR__ . '/env.php';

$dbn = sprintf(
    'mysql:dbname=%s;charset=utf8mb4;port=%s;host=%s',
    getenv('DB_NAME'),
    getenv('DB_PORT'),
    getenv('DB_HOST')
);
$user = getenv('DB_USER');
$pwd  = getenv('DB_PASS');

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dbn, $user, $pwd, $options);
} catch (PDOException $e) {
    error_log('DB接続失敗: ' . $e->getMessage()); // 開発者向け：詳細はログへ
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'サーバーエラーが発生しました。時間をおいて再度お試しください。']);
    exit;
}
