
<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "koneksi.php";

function kirimRespons($success, $message, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        "success" => $success,
        "message" => $message
    ]);
    exit;
}

// FormData mengirim data melalui $_POST dan $_FILES.
$id = intval($_POST["id"] ?? 0);
$judul = trim($_POST["title"] ?? "");
$kategoriInput = trim($_POST["category"] ?? "");
$lokasi = trim($_POST["location"] ?? "");
$deskripsi = trim($_POST["description"] ?? "");
$prioritas = $_POST["priority"] ?? "medium";

if (
    $id <= 0 ||
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

function buatSlug($teks) {
    $teks = strtolower(trim($teks));
    $teks = preg_replace('/[^a-z0-9]+/', '-', $teks);
    return trim($teks, '-');
}

// Cari ID kategori.
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
    kirimRespons(false, "Kategori tidak ditemukan", 400);
}

// Ambil foto lama agar tidak hilang saat edit tanpa foto baru.
$stmtCek = $conn->prepare(
    "SELECT foto FROM laporan WHERE id = ?"
);
$stmtCek->bind_param("i", $id);
$stmtCek->execute();
$resultCek = $stmtCek->get_result();
$laporan = $resultCek->fetch_assoc();
$stmtCek->close();

if (!$laporan) {
    kirimRespons(false, "Laporan tidak ditemukan", 404);
}

$namaFoto = $laporan["foto"];
$fileBaru = null;

// Jika pengguna memilih foto baru, proses unggahan.
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

    // Periksa tipe gambar berdasarkan isi file.
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

    // Folder penyimpanan foto di backend.
    $folderUpload = __DIR__ . "/uploads/";

    if (
        !is_dir($folderUpload) &&
        !mkdir($folderUpload, 0755, true)
    ) {
        kirimRespons(
            false,
            "Folder uploads gagal dibuat",
            500
        );
    }

    $namaFoto = bin2hex(random_bytes(16))
        . "."
        . $tipeDiizinkan[$mime];

    $tujuan = $folderUpload . $namaFoto;

    if (!move_uploaded_file($foto["tmp_name"], $tujuan)) {
        kirimRespons(false, "Gagal menyimpan foto ke server", 500);
    }

    $fileBaru = $tujuan;
}

// Simpan data dan nama foto ke database.
$stmt = $conn->prepare(
    "UPDATE laporan
     SET kategori_id = ?,
         judul = ?,
         lokasi = ?,
         deskripsi = ?,
         prioritas = ?,
         foto = ?
     WHERE id = ?"
);

$stmt->bind_param(
    "isssssi",
    $kategoriId,
    $judul,
    $lokasi,
    $deskripsi,
    $prioritas,
    $namaFoto,
    $id
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Laporan berhasil diperbarui",
        "foto" => $namaFoto
    ]);
} else {
    // Hapus file baru jika penyimpanan database gagal.
    if ($fileBaru !== null && file_exists($fileBaru)) {
        unlink($fileBaru);
    }

    kirimRespons(false, "Gagal memperbarui laporan", 500);
}

$stmt->close();
$conn->close();
?>
