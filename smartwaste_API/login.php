<?php
session_start();

header("Content-Type: application/json");

require_once "koneksi.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

if ($username === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Username dan password wajib diisi"
    ]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT id, nama, username, password,role
     FROM users
     WHERE username = ?
     LIMIT 1"
);

$stmt->bind_param("s", $username);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user["password"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Username atau password salah"
    ]);
    exit;
}

// Buat ID session baru setelah login berhasil
session_regenerate_id(true);


 // Simpan identitas pengguna ke session
$_SESSION["user_id"] = $user["id"];
$_SESSION["nama"] = $user["nama"];
$_SESSION["username"] = $user["username"];
$_SESSION["role"] = $user["role"];

echo json_encode([
    "success" => true,
    "message" => "Login berhasil! Selamat datang.",
    "user" => [
        "id" => $user["id"],
        "nama" => $user["nama"],
        "username" => $user["username"],
        "role" => $user["role"]
    ]
]);
?>