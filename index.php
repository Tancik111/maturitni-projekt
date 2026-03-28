<?php
header('Content-Type: application/json');

/**
 * Jednoduchá funkce pro načtení .env souboru
 */
function loadEnv($path) {
    if (!file_exists($path)) {
        return false;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Přeskočit komentáře
        if (strpos(trim($line), '#') === 0) continue;
        
        // Rozdělit na název a hodnotu
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            putenv(trim($name) . "=" . trim($value));
        }
    }
    return true;
}

// Načtení proměnných ze souboru .env
loadEnv(__DIR__ . '/.env');

// Konfigurace (Citlivé věci jsou v getenv)
$db_config = [
    'host' => 'localhost',
    'name' => 'c554ai', 
    'user' => 'c554karoch', 
    'pass' => getenv('DB_PASS') ?: '' // Načte z .env
];

$groq_api_key = getenv('GROQ_API_KEY');
$model = 'llama-3.3-70b-versatile';

// Kontrola, zda máme API klíč
if (!$groq_api_key) {
    echo json_encode(['error' => 'Chybí API klíč v .env souboru.']);
    exit;
}

try {
    // Připojení k databázi
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['name']};charset=utf8mb4", 
        $db_config['user'], 
        $db_config['pass']
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Automatické vytvoření tabulky, pokud neexistuje
    $pdo->exec("CREATE TABLE IF NOT EXISTS api_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    
    // Kontrola limitu (5 pověstí / 10 min)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM api_logs WHERE ip_address = ? AND created_at > NOW() - INTERVAL 10 MINUTE");
    $stmt->execute([$ip]);
    if ($stmt->fetchColumn() >= 5) {
        echo json_encode(['error' => 'Příliš mnoho požadavků. Zkuste to za 10 minut.']);
        exit;
    }

    // Příprava dat z POST požadavku
    $misto    = htmlspecialchars($_POST['misto'] ?? 'Neznámé místo');
    $postava  = htmlspecialchars($_POST['postava'] ?? 'Neznámý hrdina');
    $zapletka = htmlspecialchars($_POST['zapletka'] ?? 'Tajemství');

    $prompt = "Jsi mistr vypravěč tajuplných pověstí. Napiš poutavý příběh v češtině. 
               Místo: $misto, Postavy: $postava, Zápletka: $zapletka. 
               Délka: cca 350 slov. Na konci přidej krátké ponaučení.";

    // Volání Groq API přes cURL
    $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $groq_api_key
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => $model,
        'messages' => [['role' => 'user', 'content' => $prompt]],
        'max_tokens' => 1000, 
        'temperature' => 0.8
    ]));

    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception('CURL Chyba: ' . curl_error($ch));
    }
    
    $data = json_decode($response, true);
    curl_close($ch);
    
    // Ošetření chyb z API
    if (isset($data['error'])) {
        echo json_encode(['error' => 'AI Chyba: ' . $data['error']['message']]);
        exit;
    }

    $text = $data['choices'][0]['message']['content'] ?? 'Omlouváme se, kronikář dnes nemá pero v ruce.';

    // Zápis do logu (úspěšný požadavek)
    $stmt = $pdo->prepare("INSERT INTO api_logs (ip_address) VALUES (?)");
    $stmt->execute([$ip]);

    // Odeslání výsledku zpět do frontendu
    echo json_encode(['text' => $text]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Chyba serveru: ' . $e->getMessage()]);
}