<?php
require_once '../auth/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'アップロードに失敗しました']);
        exit;
    }

    // サイズチェック(2MBまで)
    if ($file['size'] > 2 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => '画像サイズが大きすぎます。2MB以下の画像をアップロードしてください']);
        exit;
    }

    // 拡張子ではなく、実際のファイルの中身からMIMEタイプを判定する
    $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
    $mimeType = mime_content_type($file['tmp_name']);
    if (!isset($allowedTypes[$mimeType])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => '対応していない画像形式です']);
        exit;
    }

    $uploadDir = __DIR__ . '/../../uploads/pins';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // ファイル名は自分で生成する(元のファイル名をそのまま使わない)
    $filename = uniqid('pin_', true) . '.' . $allowedTypes[$mimeType];
    $destination = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '保存に失敗しました']);
        exit;
    }

    echo json_encode(['success' => true, 'url' => '/kadai10_prototype/uploads/pins/' . $filename]);
}
