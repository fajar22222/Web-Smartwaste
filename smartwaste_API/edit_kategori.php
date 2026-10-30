
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

$id = filter_var($input["id"] ?? null, FILTER_VALIDATE_INT);
$nama = trim($input["nama_kategori"] ?? "");
$deskripsi = trim($input["deskripsi"] ?? "");

if (!$id || $id < 1 || $nama === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID dan nama kategori wajib diisi."
    ]);
    exit;
}

$stmt = mysqli_prepare(
    $conn,
    "UPDATE kategori
     SET nama_kategori = ?, deskripsi = ?
     WHERE id = ?"
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal menyiapkan perubahan kategori."
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "ssi", $nama, $deskripsi, $id);

if (mysqli_stmt_execute($stmt)) {
    if (mysqli_stmt_affected_rows($stmt) >= 0) {
        echo json_encode([
            "success" => true,
            "message" => "Kategori berhasil diperbarui."
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Kategori gagal diperbarui."
    ]);
}

mysqli_stmt_close($stmt);
?>
