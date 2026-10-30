<?php
header("Access-Control-Allow-Origin: https://golden-pithivier-4c3773.netlify.app");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
require_once "koneksi.php";

$sql = "SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'menunggu' THEN 1 ELSE 0 END) AS menunggu,
            SUM(CASE WHEN status = 'diproses' THEN 1 ELSE 0 END) AS diproses,
            SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS selesai
        FROM laporan";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal mengambil statistik laporan"
    ]);
    $conn->close();
    exit;
}

$data = $result->fetch_assoc();

echo json_encode([
    "success" => true,
    "data" => [
        "total" => (int) $data["total"],
        "menunggu" => (int) $data["menunggu"],
        "diproses" => (int) $data["diproses"],
        "selesai" => (int) $data["selesai"]
    ]
]);

$conn->close();
?>
