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
$status = trim($input["status"] ?? "");

// Memeriksa ID dan status
$statusValid = ["menunggu", "diproses", "selesai", "dibatalkan"];

if ($id <= 0 || !in_array($status, $statusValid, true)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID atau status tidak valid"
    ]);
    exit;
}

// Memastikan laporan tersedia
$stmtCek = $conn->prepare(
    "SELECT id FROM laporan WHERE id = ?"
);
$stmtCek->bind_param("i", $id);
$stmtCek->execute();
$stmtCek->store_result();

if ($stmtCek->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Laporan tidak ditemukan"
    ]);
    $stmtCek->close();
    $conn->close();
    exit;
}

$stmtCek->close();

// Memperbarui status laporan
$stmt = $conn->prepare(
    "UPDATE laporan SET status = ? WHERE id = ?"
);
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Status laporan berhasil diperbarui",
        "id" => $id,
        "status" => $status
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal memperbarui status laporan"
    ]);
}

$stmt->close();
$conn->close();
?>