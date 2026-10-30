<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once "koneksi.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Metode request tidak diizinkan."
    ]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$nama = trim($input["nama_kategori"] ?? "");
$deskripsi = trim($input["deskripsi"] ?? "");

if ($nama === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Nama kategori wajib diisi."
    ]);
    exit;
}

$stmt = mysqli_prepare(
    $conn,
    "INSERT INTO kategori (nama_kategori, deskripsi) VALUES (?, ?)"
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal menyiapkan penyimpanan kategori."
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "ss", $nama, $deskripsi);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "success" => true,
        "message" => "Kategori berhasil ditambahkan.",
        "id" => mysqli_insert_id($conn)
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Kategori gagal ditambahkan."
    ]);
}

mysqli_stmt_close($stmt);
?>