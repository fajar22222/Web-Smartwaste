```php
<?php
header("Content-Type: application/json");
require_once "koneksi.php";

$nama = "fajar";
$username = "fajar25";
$password = "12345678";

// Periksa apakah username sudah digunakan
$stmt = $conn->prepare(
    "SELECT id FROM users WHERE username = ? LIMIT 1"
);
$stmt->bind_param("s", $username);
$stmt->execute();
$existing = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($existing) {
    echo json_encode([
        "success" => false,
        "message" => "Username admin sudah terdaftar."
    ]);
    exit;
}

// Hash password sebelum disimpan
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$role = "admin";

$stmt = $conn->prepare(
    "INSERT INTO users (nama, username, password, role)
     VALUES (?, ?, ?, ?)"
);
$stmt->bind_param(
    "ssss",
    $nama,
    $username,
    $passwordHash,
    $role
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Akun admin berhasil dibuat."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal membuat akun admin."
    ]);
}

$stmt->close();
$conn->close();
?>
```