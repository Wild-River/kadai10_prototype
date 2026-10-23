<?php
// .envファイルを読み込んで環境変数として登録する
function load_env(string $path): void
{
    if (!file_exists($path)) {
        error_log('.envファイルが見つかりません: ' . $path); // 開発者向け：詳細はログへ
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'サーバーエラーが発生しました。時間をおいて再度お試しください。']);
        exit;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $value = trim($value, "\"'");

        putenv("$key=$value");
        $_ENV[$key] = $value;
    }
}

load_env(__DIR__ . '/../.env');
