
<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

mysqli_report(MYSQLI_REPORT_OFF);

function kirimJSON($success, $message, $status = 200) {
    http_response_code($status);
    echo json_encode([
        "success" => $success,
        "message" => $message
    ]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    kirimJSON(false, "Metode request tidak diizinkan.", 405);
}

require_once "koneksi.php";

if (!isset($conn) || !$conn) {
    kirimJSON(false, "Koneksi database gagal.", 500);
}

$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    kirimJSON(false, "Data request tidak valid.", 400);
}

$id = filter_var(
    $input["id"] ?? null,
    FILTER_VALIDATE_INT
);

if ($id === false || $id === null || $id < 1) {
    kirimJSON(false, "ID kategori tidak valid.", 400);
}

$stmt = mysqli_prepare(
    $conn,
    "DELETE FROM kategori WHERE id = ?"
);

if (!$stmt) {
    error_log("Gagal menyiapkan hapus kategori: " . mysqli_error($conn));
    kirimJSON(false, "Gagal menyiapkan penghapusan kategori.", 500);
}

mysqli_stmt_bind_param($stmt, "i", $id);

if (!mysqli_stmt_execute($stmt)) {
    $errorCode = mysqli_stmt_errno($stmt);

    error_log(
        "Gagal menghapus kategori. Kode: " . $errorCode .
        ", Pesan: " . mysqli_stmt_error($stmt)
    );

    mysqli_stmt_close($stmt);

    if ($errorCode === 1451) {
        kirimJSON(
            false,
            "Kategori tidak dapat dihapus karena masih digunakan oleh laporan.",
            409
        );
    }

    kirimJSON(false, "Kategori gagal dihapus. Periksa konfigurasi database.", 500);
}

$affectedRows = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affectedRows > 0) {
    kirimJSON(true, "Kategori berhasil dihapus.");
}

kirimJSON(false, "Kategori tidak ditemukan.", 404);
?>
