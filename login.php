<!-- Toto je kód pro přihlašovací stránku administrátorů Pověstníku. Kód načítá konfiguraci z .env souboru, ověřuje zadané uživatelské jméno a heslo proti uloženým hashům a pokud jsou údaje správné, nastaví session proměnné pro přihlášení a přesměruje uživatele na admin.php. Pokud jsou údaje nesprávné, zobrazí chybovou zprávu. -->
<?php
session_start();
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
loadEnv(__DIR__ . '/.env');
if (isset($_POST['login'])) {
    $user_input = $_POST['user'];
    $pass_input = $_POST['pass'];
    $users = [
        getenv('ADMIN1_USER') => getenv('ADMIN1_PASS'),
        getenv('ADMIN2_USER') => getenv('ADMIN2_PASS'),
        getenv('ADMIN3_USER') => getenv('ADMIN3_PASS')
    ];
    $authenticated = false;
    if (array_key_exists($user_input, $users)) {
        // password_verify porovná zadané heslo s uloženým hashem
        if (password_verify($pass_input, $users[$user_input])) {
            $authenticated = true;
        }
    }
    if ($authenticated) {
        $_SESSION['admin_logged'] = true;
        $_SESSION['admin_user'] = $user_input;
        header("Location: admin.php");
        exit;
    } else {
        $error = "Strážce brány tě nepustil. Neplatné údaje!";
    }
}
?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vstup do kroniky | Pověstník</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="shortcut icon" href="data/favi.ico" type="image/x-icon">
    <style>
@import url('https://fonts.googleapis.com/css2?family=Eagle+Lake&display=swap');
body {
    font-family: "Eagle Lake", serif;
    background-image: url('data/pozadi.webp'); 
    background-size: cover;
    background-attachment: fixed;
    background-position: center;
    background-color: #f1e9d2; 
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}
.login-container {
    width: 100%;
    max-width: 800px;
    padding: 20px;
    display: flex;
    justify-content: center;
}
.pergamen-card {
    background-image: url('data/pergamen2.webp'); 
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    max-width: 600px;
    padding: 40px 70px; 
    text-align: center;
    filter: drop-shadow(0 15px 30px rgba(0,0,0,0.5));
    display: flex;
    flex-direction: column;
}
h2 {
    color: #4a0404;
    font-size: 2.2rem;
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 2px double #8b1a1a;
    padding-bottom: 10px;
}
.form-label {
    color: #2c1a05;
    font-size: 1rem;
    display: block;
    text-align: left;
    margin-bottom: 4px;
}
.form-control {
    background: rgba(255, 255, 255, 0.5);
    border: 2px solid #7a5c3c;
    font-family: 'Georgia', serif;
    padding: 8px 12px;
    margin-bottom: 12px;
    border-radius: 4px;
    font-size: 1rem;
    width: 100%;
}
.btn-login {
    background-color: #8b1a1a;
    color: #f1e9d2;
    border: none;
    padding: 12px;
    width: 100%;
    font-size: 1.3rem;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 8px 15px rgba(0,0,0,0.3);
    margin-top: 5px;
    text-transform: uppercase;
    letter-spacing: 2px;
}
.btn-login:hover {
    background-color: #5a1111;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.4);
}
.error-msg {
    color: #8b1a1a;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.3);
    padding: 8px;
    margin-bottom: 15px;
    border-radius: 5px;
    font-size: 0.9rem;
}
.back-link {
    display: inline-block;
    margin-top: 20px;
    color: #4a0404;
    text-decoration: none;
    font-size: 0.95rem;
}
.back-link:hover {
    text-decoration: underline;
}
@media (max-width: 768px) {
    .pergamen-card {
        padding: 40px 40px;
        max-width: 90%;
    }
    h2 {
        font-size: 1.8rem;
    }
}
</style>
</head>
<body>

<!-- Formulář pro přihlášení administrátorů Pověstníku, který ověřuje zadané uživatelské jméno a heslo proti uloženým hashům v .env souboru. Pokud jsou údaje správné, nastaví session proměnné pro přihlášení a přesměruje uživatele na admin.php. Pokud jsou údaje nesprávné, zobrazí chybovou zprávu. -->

<div class="login-container">
    <div class="pergamen-card">
        <h2>Vstup do kroniky</h2>
        <?php if(isset($error)): ?>
            <p class="error-msg"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>
        <form method="POST">
            <div class="mb-3 text-start">
                <label class="form-label fw-bold">Jméno správce:</label>
                <input type="text" name="user" class="form-control" required placeholder="Který ze správců přichází?">
            </div>
            <div class="mb-4 text-start">
                <label class="form-label fw-bold">Tajné heslo:</label>
                <input type="password" name="pass" class="form-control" required placeholder="Zadej svůj tajný klíč...">
            </div>
            <button type="submit" name="login" class="btn-login">Odemknout bránu</button>
        </form>
        <a href="index.html" class="back-link">← Zpět na web</a>
    </div>
</div>
</body>
</html>