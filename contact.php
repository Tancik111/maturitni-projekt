<?php
/**
 * Funkce pro načtení .env souboru
 */
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            putenv(trim($name) . "=" . trim($value));
        }
    }
}

// Načtení proměnných
loadEnv(__DIR__ . '/.env');

// Konfigurace z .env
$host = 'localhost';
$db   = getenv('DB_NAME') ?: 'c554contact'; // Načte z .env, jinak použije default
$user = 'c554karoch';
$pass = getenv('DB_PASS') ?: '';           // Načte heslo z .env
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    // Automatické vytvoření tabulky 'dotazy', pokud ještě neexistuje
    $pdo->exec("CREATE TABLE IF NOT EXISTS dotazy (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        dotaz TEXT NOT NULL,
        vytvoreno TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $email = $_POST['email'] ?? '';
        $message = $_POST['message'] ?? ''; 

        if (!empty($email) && !empty($message)) {
            // Validace e-mailu (vždycky dobrý nápad)
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo "Invalid email format";
                exit;
            }

            $sql = "INSERT INTO dotazy (email, dotaz) VALUES (?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$email, $message]);
            
            echo "success";
            exit;
        } else {
            http_response_code(400);
            echo "Fields cannot be empty";
            exit;
        }
    }
} catch (\PDOException $e) {
    http_response_code(500);
    // V produkci je lepší vypsat jen obecnou chybu, ale pro ladění necháváme:
    echo "Database Error: " . $e->getMessage();
    exit;
}
?>