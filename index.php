<?php
header('Content-Type: application/json');

$db_config = [
    'host' => 'localhost',
    'name' => 'c274ai', 
    'user' => 'c274karoch', 
    'pass' => 'Stepan98.'
];

$groq_api_key = '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'; 
$model = 'llama-3.3-70b-versatile';

try {
    $pdo = new PDO("mysql:host={$db_config['host']};dbname={$db_config['name']};charset=utf8mb4", $db_config['user'], $db_config['pass']);
    $ip = $_SERVER['REMOTE_ADDR'];
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM api_logs WHERE ip_address = ? AND created_at > NOW() - INTERVAL 10 MINUTE");
    $stmt->execute([$ip]);
    if ($stmt->fetchColumn() >= 5) {
        echo json_encode(['error' => 'Příliš mnoho požadavků. Zkuste to za 10 minut.']);
        exit;
    }

    $misto = htmlspecialchars($_POST['misto'] ?? '');
    $postava = htmlspecialchars($_POST['postava'] ?? '');
    $zapletka = htmlspecialchars($_POST['zapletka'] ?? '');

    $prompt = "Jsi mistr vypravěč. Píšeš kvalitní češtinou. Napiš rozsáhlou tajuplnou pověst o délce přibližně 600 slov. 
               Místo: $misto, Postava: $postava, Zápletka: $zapletka. 
               Piš velmi poutavě a košatě. Piš pouze příběh. Na konci každého příběhu bude ponaučení.";

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
        'max_tokens' => 600, 
        'temperature' => 0.7
    ]));

    $response = curl_exec($ch);
    $data = json_decode($response, true);
    $text = $data['choices'][0]['message']['content'] ?? 'Chyba AI.';

    $stmt = $pdo->prepare("INSERT INTO api_logs (ip_address) VALUES (?)");
    $stmt->execute([$ip]);

    echo json_encode(['text' => $text]);
    exit;

} catch (Exception $e) {
    // Toto ti do konzole prohlížeče vypíše, co je přesně špatně (např. špatné heslo k DB)
    echo json_encode(['error' => 'Detail chyby: ' . $e->getMessage()]);
    exit;
}