<?php
session_start();
header("Content-Type: application/json");

require_once "koneksi.php";

// Hanya admin yang boleh melihat daftar akun
if (
    !isset($_SESSION["user_id"]) ||
    !isset($_SESSION["role"]) ||
    $_SESSION["role"] !== "admin"
) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Akses hanya untuk admin."
    ]);
    exit;
}

// Ambil daftar akun tanpa menampilkan password
$query = "
    SELECT id, nama, username, role, created_at
    FROM users
    ORDER BY id DESC
";

$result = $conn->query($query);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal mengambil daftar akun."
    ]);
    exit;
}

$akun = [];

while ($row = $result->fetch_assoc()) {
    $akun[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $akun
]);

$conn->close();
?>