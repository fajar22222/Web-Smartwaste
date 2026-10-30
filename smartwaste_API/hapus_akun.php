
<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

require_once 'koneksi.php';

// Hanya admin yang boleh menghapus akun
if (
    !isset($_SESSION['user_id']) ||
    !isset($_SESSION['role']) ||
    $_SESSION['role'] !== 'admin'
) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Akses hanya untuk admin.'
    ]);
    exit;
}

// Hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Metode request tidak diizinkan.'
    ]);
    exit;
}

// Membaca ID akun dari request JSON
$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? (int) $data['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ID akun tidak valid.'
    ]);
    exit;
}

// Mencegah admin menghapus akunnya sendiri
if ($id === (int) $_SESSION['user_id']) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Anda tidak dapat menghapus akun sendiri.'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare(
        'DELETE FROM users WHERE id = ?'
    );

    if (!$stmt) {
        throw new Exception('Gagal menyiapkan query.');
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Akun berhasil dihapus.'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Akun tidak ditemukan.'
        ]);
    }

    $stmt->close();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal menghapus akun. Periksa relasi database.'
    ]);
}

$conn->close();
?>
