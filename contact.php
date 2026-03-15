<?php
$host = 'localhost';
$db   = 'c274contact';
$user = 'c274karoch';
$pass = 'Stepan98.';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $email = $_POST['email'] ?? '';
        $message = $_POST['message'] ?? ''; 

        if (!empty($email) && !empty($message)) {
            $sql = "INSERT INTO dotazy (email, dotaz) VALUES (?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$email, $message]);
            
            echo "success";
            exit;
        }
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo "Database Error: " . $e->getMessage();
    exit;
}
?>