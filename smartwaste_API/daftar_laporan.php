<?php
header("Access-Control-Allow-Origin: https://golden-pithivier-4c3773.netlify.app");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once "koneksi.php";

$sql = "SELECT
            laporan.id,
            laporan.kategori_id,
            kategori.nama_kategori AS kategori,
            laporan.judul,
            laporan.lokasi,
            laporan.deskripsi,
            laporan.foto,
            laporan.status,
            laporan.prioritas,
            laporan.created_at
        FROM laporan
        INNER JOIN kategori
            ON laporan.kategori_id = kategori.id
        ORDER BY laporan.id ASC";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal mengambil data laporan"
    ]);
    exit;
}

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $data
]);

$conn->close();
?>