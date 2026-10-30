<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "koneksi.php";

// Menerima data dari React
$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Data tidak valid"
    ]);
    exit;
}

$id = intval($input["id"] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID laporan tidak valid"
    ]);
    exit;
}

// Memeriksa apakah laporan tersedia
$stmt = $conn->prepare(
    "SELECT id FROM laporan WHERE id = ?"
);
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Laporan tidak ditemukan"
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$stmt->close();

// Menghapus laporan dari database
$stmt = $conn->prepare(
    "DELETE FROM laporan WHERE id = ?"
);
$stmt->bind_param("i", $id);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode([
        "success" => true,
        "message" => "Laporan berhasil dihapus"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal menghapus laporan"
    ]);
}

$stmt->close();
$conn->close();
?>