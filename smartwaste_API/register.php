
<?php
header("Content-Type: application/json");

require_once "koneksi.php";

$data = json_decode(file_get_contents("php://input"), true);

$nama = trim($data["nama"] ?? "");
$email = strtolower(trim($data["email"] ?? ""));
$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";
$role = $data["role"] ?? "masyarakat";

if ($nama === "" || $email === "" || $username === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Semua field wajib diisi"
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Format email tidak valid"
    ]);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Password minimal 8 karakter"
    ]);
    exit;
}

// Registrasi publik hanya untuk masyarakat.
if ($role !== "masyarakat") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Role tidak diizinkan"
    ]);
    exit;
}

// Periksa username atau email yang sudah digunakan.
$cek = $conn->prepare(
    "SELECT id FROM users WHERE username = ? OR email = ?"
);
$cek->bind_param("ss", $username, $email);
$cek->execute();
$hasil = $cek->get_result();

if ($hasil->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "message" => "Username atau email sudah digunakan"
    ]);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    "INSERT INTO users (nama, email, username, password, role)
     VALUES (?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "sssss",
    $nama,
    $email,
    $username,
    $hash,
    $role
);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registrasi berhasil"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Registrasi gagal"
    ]);
}

$stmt->close();
$cek->close();
$conn->close();
?>
