<?php
require_once '../config/session.php';
$_SESSION = [];
session_destroy();

header('Content-Type: application/json');
echo json_encode(['success' => true]);
