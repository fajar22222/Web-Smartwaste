
<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "koneksi.php";

function kirimRespons($success, $message, $statusCode = 200, $data = []) {
    http_response_code($statusCode);
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message
    ], $data));
    exit;
}

// Data teks diterima melalui FormData.
$judul = trim($_POST["title"] ?? "");
$kategoriInput = trim($_POST["category"] ?? "");
$lokasi = trim($_POST["location"] ?? "");
$deskripsi = trim($_POST["description"] ?? "");
$prioritas = $_POST["priority"] ?? "medium";

if (
    $judul === "" ||
    $kategoriInput === "" ||
    $lokasi === "" ||
    $deskripsi === ""
) {
    kirimRespons(false, "Semua kolom wajib diisi", 400);
}

if (!in_array($prioritas, ["low", "medium", "high"], true)) {
    kirimRespons(false, "Prioritas tidak valid", 400);
}

// Mencocokkan kategori berdasarkan nama atau slug.
function buatSlug($teks) {
    $teks = strtolower(trim($teks));
    $teks = preg_replace('/[^a-z0-9]+/', '-', $teks);
    return trim($teks, '-');
}

$stmtKategori = $conn->prepare(
    "SELECT id, nama_kategori FROM kategori"
);
$stmtKategori->execute();
$resultKategori = $stmtKategori->get_result();

$kategoriId = null;
$slugInput = buatSlug($kategoriInput);

while ($row = $resultKategori->fetch_assoc()) {
    if (buatSlug($row["nama_kategori"]) === $slugInput) {
        $kategoriId = (int) $row["id"];
        break;
    }
}
$stmtKategori->close();

if ($kategoriId === null) {
    kirimRespons(
        false,
        "Kategori tidak ditemukan di database",
        400
    );
}

// Foto bersifat opsional.
$namaFoto = null;
$fileBaru = null;

if (
    isset($_FILES["photo"]) &&
    $_FILES["photo"]["error"] !== UPLOAD_ERR_NO_FILE
) {
    $foto = $_FILES["photo"];

    if ($foto["error"] !== UPLOAD_ERR_OK) {
        kirimRespons(false, "Gagal menerima file foto", 400);
    }

    if ($foto["size"] > 5 * 1024 * 1024) {
        kirimRespons(false, "Ukuran foto maksimal 5 MB", 400);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($foto["tmp_name"]);

    $tipeDiizinkan = [
        "image/jpeg" => "jpg",
        "image/png"  => "png",
        "image/webp" => "webp",
        "image/gif"  => "gif"
    ];

    if (!isset($tipeDiizinkan[$mime])) {
        kirimRespons(
            false,
            "Format foto harus JPG, PNG, WEBP, atau GIF",
            400
        );
    }

    $folderUpload = __DIR__ . "/uploads/";

    if (
        !is_dir($folderUpload) &&
        !mkdir($folderUpload, 0755, true)
    ) {
        kirimRespons(false, "Gagal membuat folder uploads", 500);
    }

    $namaFoto = bin2hex(random_bytes(16))
        . "."
        . $tipeDiizinkan[$mime];

    $fileBaru = $folderUpload . $namaFoto;

    if (!move_uploaded_file($foto["tmp_name"], $fileBaru)) {
        kirimRespons(false, "Gagal menyimpan foto ke server", 500);
    }
}

// Laporan baru selalu berstatus menunggu.
$status = "menunggu";

$stmt = $conn->prepare(
    "INSERT INTO laporan
    (kategori_id, judul, lokasi, deskripsi, foto, status, prioritas)
    VALUES (?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "issssss",
    $kategoriId,
    $judul,
    $lokasi,
    $deskripsi,
    $namaFoto,
    $status,
    $prioritas
);

if ($stmt->execute()) {
    $idBaru = $conn->insert_id;

    echo json_encode([
        "success" => true,
        "message" => "Laporan berhasil disimpan",
        "id" => $idBaru,
        "foto" => $namaFoto
    ]);
} else {
    if ($fileBaru !== null && file_exists($fileBaru)) {
        unlink($fileBaru);
    }

    kirimRespons(false, "Gagal menyimpan laporan", 500);
}

$stmt->close();
$conn->close();
?>