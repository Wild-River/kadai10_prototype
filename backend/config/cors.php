<?php
$allowedOrigins = ['http://localhost:5173', 'https://gs2026-arakawa.sakura.ne.jp'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
