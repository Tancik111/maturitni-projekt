<?php
// Tady ty řádky necháme pro ladění, dokud to nerozchodíme
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

function loadEnv($path) {
    if (!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            putenv(trim($name) . "=" . trim($value));
        }
    }
    return true;
}

loadEnv(__DIR__ . '/.env');

$db_config = [
    'host' => 'localhost',
    'name' => 'c554ai', 
    'user' => 'c554karoch', 
    'pass' => getenv('DB_PASS') ?: ''
];

$groq_api_key = getenv('GROQ_API_KEY');
$model = 'llama-3.3-70b-versatile';

if (!$groq_api_key) {
    echo json_encode(array('error' => 'Chyba: Chybí API klíč v .env.'));
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['name']};charset=utf8mb4", 
        $db_config['user'], 
        $db_config['pass']
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    
    // Antispam limit
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM api_logs WHERE ip_address = ? AND created_at > NOW() - INTERVAL 10 MINUTE");
    $stmt->execute(array($ip));
    if ($stmt->fetchColumn() >= 5) {
        echo json_encode(array('error' => 'Poutníku, tvé pero je unavené. Další příběh zapiš za 10 minut.'));
        exit;
    }

    $misto    = mb_substr(htmlspecialchars(trim($_POST['misto'] ?? '')), 0, 150);
    $postava  = mb_substr(htmlspecialchars(trim($_POST['postava'] ?? '')), 0, 150);
    $zapletka = mb_substr(htmlspecialchars(trim($_POST['zapletka'] ?? '')), 0, 500);

    if (empty($misto) || empty($postava) || empty($zapletka)) {
        echo json_encode(array('error' => 'Všechna pole musí být vyplněna.'));
        exit;
    }

    // ROZSÁHLÝ BLACKLIST
    $blacklist = array(
        'kokot', 'pica', 'píča', 'curak', 'čurák', 'mrdat', 'hovno', 'zmrd', 'debil', 'kunda', 
        'mrdko', 'idiot', 'kretén', 'hajzl', 'pizda', 'šulin', 'zkurv', 'kurva', 'děvka',
        'nigger', 'negr', 'cikán', 'cikan', 'židák', 'hitler', 'nazi', 'nacista', 'fašista', 
        'holocaust', 'osvětim', 'koncentrák', 'bílá síla', 'white power', 'muslimák',
        'porno', 'sex', 'erotik', 'pedofil', 'znásilnění', 'orgie', 'masturbace', 'penis', 
        'vagina', 'kozy', 'anál', 'bukvice', 'teplouš', 'gay', 'lesba', 'šoustat',
        'piko', 'pervitin', 'kokain', 'heroin', 'marihuana', 'tráva', 'perník', 'lsd', 'fetovat',
        'vražda', 'sebevražda', 'terorismus', 'bomba', 'výbušnina', 'atentát', 'poprava', 'mučení',
        'casino', 'hazard', 'půjčka', 'pujcka', 'krypto', 'cryptocurrency'
    );

    $input_to_check = mb_strtolower($misto . ' ' . $postava . ' ' . $zapletka);
    $deep_clean_input = str_replace(array(' ', '.', ',', '-', '_', '*', '/', '|', '+'), '', $input_to_check);

    foreach ($blacklist as $word) {
        // Používáme strpos místo str_contains pro starší PHP
        if (strpos($input_to_check, $word) !== false || strpos($deep_clean_input, $word) !== false) {
            echo json_encode(array('error' => 'Zadání obsahuje nevhodná slova.'));
            exit;
        }
    }

    $system_prompt = "Jsi mistr vypravěč starých českých pověstí. Piš tajuplně, archaicky, bezpečně. Rozsah 250 slov. Na konci dej Ponaučení.";
    $user_prompt = "Napiš pověst. Místo: $misto. Postavy: $postava. Zápletka: $zapletka.";

    $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: Bearer ' . $groq_api_key
    ));
    
    $post_fields = json_encode(array(
        'model' => $model,
        'messages' => array(
            array('role' => 'system', 'content' => $system_prompt),
            array('role' => 'user', 'content' => $user_prompt)
        ),
        'max_tokens' => 1200, 
        'temperature' => 0.75
    ));
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        throw new Exception('Chyba spojení s kronikářem.');
    }
    curl_close($ch);
    
    $data = json_decode($response, true);
    
    if ($http_code !== 200 || isset($data['error'])) {
        echo json_encode(array('error' => 'Kronikář nemá brko. (Chyba API)'));
        exit;
    }

    $generated_text = isset($data['choices'][0]['message']['content']) ? $data['choices'][0]['message']['content'] : 'Kronika zůstala prázdná...';

    $stmt = $pdo->prepare("INSERT INTO api_logs (ip_address) VALUES (?)");
    $stmt->execute(array($ip));

    echo json_encode(array('text' => $generated_text));

} catch (Exception $e) {
    echo json_encode(array('error' => 'Chyba v hradním archivu: ' . $e->getMessage()));
}