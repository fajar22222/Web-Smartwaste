
<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

require_once 'koneksi.php';

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Hanya admin yang boleh mengubah akun.
if (
    !isset($_SESSION['user_id'], $_SESSION['role']) ||
    $_SESSION['role'] !== 'admin'
) {
    respond(403, [
        'success' => false,
        'message' => 'Akses hanya untuk admin.'
    ]);
}

// Hanya menerima POST.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, [
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ]);
}

// Baca JSON.
$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    respond(400, [
        'success' => false,
        'message' => 'Format data JSON tidak valid.'
    ]);
}

$id = filter_var(
    $data['id'] ?? null,
    FILTER_VALIDATE_INT,
    ['options' => ['min_range' => 1]]
);

$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

// Validasi tipe input.
if (
    !$id ||
    !is_string($data['username'] ?? null) ||
    !is_string($password)
) {
    respond(400, [
        'success' => false,
        'message' => 'ID, username, atau password tidak valid.'
    ]);
}

if ($username === '') {
    respond(400, [
        'success' => false,
        'message' => 'Username wajib diisi.'
    ]);
}

if (!preg_match('/^[a-zA-Z0-9_.-]{3,50}$/', $username)) {
    respond(400, [
        'success' => false,
        'message' => 'Username harus 3-50 karakter dan hanya berisi huruf, angka, titik, garis bawah, atau tanda hubung.'
    ]);
}

if ($password !== '' && strlen($password) < 8) {
    respond(400, [
        'success' => false,
        'message' => 'Password baru minimal 8 karakter.'
    ]);
}

try {
    // Pastikan akun tersedia.
    $stmt = $conn->prepare(
        'SELECT id FROM users WHERE id = ? LIMIT 1'
    );

    $stmt->bind_param('i', $id);
    $stmt->execute();

    $akun = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$akun) {
        respond(404, [
            'success' => false,
            'message' => 'Akun tidak ditemukan.'
        ]);
    }

    // Username harus unik.
    $stmt = $conn->prepare(
        'SELECT id FROM users
         WHERE username = ? AND id <> ?
         LIMIT 1'
    );

    $stmt->bind_param('si', $username, $id);
    $stmt->execute();

    $usernameAda = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($usernameAda) {
        respond(409, [
            'success' => false,
            'message' => 'Username sudah digunakan akun lain.'
        ]);
    }

    // Password kosong berarti tidak mengubah password.
    if ($password === '') {
        $stmt = $conn->prepare(
            'UPDATE users SET username = ? WHERE id = ?'
        );

        $stmt->bind_param('si', $username, $id);
    } else {
        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $stmt = $conn->prepare(
            'UPDATE users
             SET username = ?, password = ?
             WHERE id = ?'
        );

        $stmt->bind_param(
            'ssi',
            $username,
            $passwordHash,
            $id
        );
    }

    $stmt->execute();
    $stmt->close();

    respond(200, [
        'success' => true,
        'message' => 'Permintaan pembaruan akun berhasil diproses.'
    ]);

} catch (Throwable $e) {
    // Detail teknis hanya dicatat di log server.
    error_log('Ubah akun SmartWaste: ' . $e->getMessage());

    respond(500, [
        'success' => false,
        'message' => 'Gagal memperbarui akun. Silakan periksa log server.'
    ]);
}
