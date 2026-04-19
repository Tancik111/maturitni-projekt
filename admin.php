<!-- Toto je kód pro administrátorskou stránku Pověstníku, která umožňuje spravovat dotazy zaslané uživateli. Kód načítá konfiguraci z .env souboru, připojuje se k databázi, zobrazuje všechny dotazy a umožňuje administrátorovi odpovídat na ně pomocí e-mailu nebo je mazat. Odpovědi jsou odesílány pomocí PHPMaileru s HTML šablonou pro lepší vzhled. Administrátor může také vidět stav každého dotazu (vyřízeno/nevyrizeno) a po odeslání odpovědi se stav aktualizuje. -->
<?php
session_start();
if (!isset($_SESSION['admin_logged'])) { header("Location: login.php"); exit; }
ini_set('display_errors', 1);
error_reporting(E_ALL);
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
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
$host = 'localhost';
$db   = 'c554contact'; 
$user = 'c554karoch';
$pass = getenv('DB_PASS'); 
$charset = 'utf8mb4';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Chyba archivu: " . $e->getMessage());
}
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    try {
        $id_ke_smazani = $_GET['delete'];
        $stmt = $pdo->prepare("DELETE FROM dotazy WHERE id = ?");
        $stmt->execute([$id_ke_smazani]);
        header("Location: admin.php?msg=Zápis byl spálen v krbu");
        exit;
    } catch (PDOException $e) {
        $error = "Nepodařilo se zápis spálit: " . $e->getMessage();
    }
}
if (isset($_POST['send_reply'])) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.seznam.cz'; 
        $mail->SMTPAuth   = true;
        $mail->Username   = 'info.povestnik@seznam.cz'; 
        $mail->Password   = getenv('SMTP_PASS'); 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom('info.povestnik@seznam.cz', 'Pověstník');
        $mail->addAddress($_POST['email']);
        $mail->addReplyTo('info.povestnik@seznam.cz', 'Pověstník');
        $reply_text = $_POST['reply_text'];
        $original_query = $_POST['original_query'];
        $email_template = "
        <div style='padding: 50px 0; font-family: \"Georgia\", serif; color: #2c1a05; margin: 0;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #fdfaf2; border: 1px solid #d4c5a9; box-shadow: 0 15px 40px rgba(0,0,0,0.15);'>
                <div style='padding: 40px 20px; text-align: center; border-bottom: 1px double #8b1a1a; background-color: #8b1a1a;'>
                    <h1 style='margin: 0; font-size: 28px; font-weight: normal; color: #ffffff; letter-spacing: 2px;'>Odpověď na dotaz</h1>
                </div>
                <div style='padding: 50px 60px; line-height: 1.8; text-align: justify;'>
                    <p style='font-size: 19px; color: #4a0404; margin-top: 0;'>Dobrý den,</p>
                    <div style='font-size: 17px; margin: 30px 0; color: #3d2b1f;'>
                        " . nl2br($reply_text) . "
                    </div>
                    <div style='margin-top: 50px; padding: 25px; border-left: 2px solid #8b1a1a; background-color: rgba(139, 26, 26, 0.03); font-style: italic; color: #5a3e2b;'>
                        <span style='font-size: 12px; text-transform: uppercase; color: #8b1a1a; font-style: normal; display: block; margin-bottom: 10px; letter-spacing: 1px;'>Rekapitulace Vašeho dotazu:</span>
                        <span style='font-size: 15px;'>\"" . htmlspecialchars($original_query) . "\"</span>
                    </div>
                </div>
                <div style='padding: 30px; text-align: center; border-top: 1px solid #eee; background-color: #f9f7f2;'>
                    <p style='margin: 0; font-size: 16px; color: #8b1a1a;'><b>Tvůj tým Pověstník</b></p>
                    <p style='margin: 10px 0 0 0; font-size: 11px; color: #999; letter-spacing: 1px;'>© 2026 Pověstník | Kutnohorská 40, Kolín</p>
                </div>
            </div>
        </div>";
        $mail->isHTML(true);
        $mail->Subject = 'Odpověď na Váš dotaz:';
        $mail->Body    = $email_template;
        $mail->AltBody = "Odpověď: " . $reply_text;
        $mail->send();
        $stmt = $pdo->prepare("UPDATE dotazy SET vyrizeno = 1 WHERE id = ?");
        $stmt->execute([$_POST['id']]);
        header("Location: admin.php?msg=Posel byl vyslán! Odpověď doručena.");
        exit;
    } catch (Exception $e) {
        $error = "Posel zabloudil: {$mail->ErrorInfo}";
    }
}
$dotazy = $pdo->query("SELECT * FROM dotazy ORDER BY vyrizeno ASC, vytvoreno DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archiv dotazů | Pověstník</title>
    <link rel="shortcut icon" href="data/favi.ico" type="image/x-icon">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Eagle+Lake&display=swap" rel="stylesheet">
    <style>
    body { 
        font-family: "Eagle Lake", serif; 
        background-image: url('data/pozadi.webp'); 
        background-size: cover; 
        background-attachment: fixed; 
        background-color: #2c1a05;
    }
    .admin-nav { 
        background-color: #8b1a1a; 
        padding: 15px 0; 
    }
            .admin-nav h1 { 
                color: #f1e9d2; 
                font-size: 1.5rem; 
            }
    .btn-logout { 
        border: 2px solid #f1e9d2; 
        color: #f1e9d2 !important; 
        text-decoration: none; 
        padding: 8px 15px; 
        transition: 0.3s;
        font-size: 0.9rem;
    }
            .btn-logout:hover { 
                background: #f1e9d2; 
                color: #8b1a1a !important; 
            }
    .admin-container { 
        max-width: 950px; 
        margin: 40px auto; 
        padding: 0 15px; 
    }
    .card-dotaz { 
        background-image: url('data/pergamen2.webp'); 
        background-size: 100% 100%; 
        background-repeat: no-repeat; 
        background-position: center; 
        border: none; 
        margin-bottom: 50px; 
        padding: 90px 110px; 
        min-height: 400px; 
        position: relative; 
        background-color: transparent !important; 
    }
    .dotaz-header {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .email-text {
        color: #4a0404;
        font-size: 1.3rem;
        word-break: break-all;
        margin: 0;
        line-height: 1.2;
    }
    .dotaz-actions {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    .dotaz-obsah { 
        background: rgba(0, 0, 0, 0.05); 
        border-radius: 4px; 
        padding: 20px; 
        margin: 20px 0; 
        font-style: italic; 
        font-size: 1.1rem; 
        line-height: 1.6; 
        border-left: 4px solid #8b1a1a; 
        word-wrap: break-word;
    }
    .btn-povestnik { 
        background-color: #8b1a1a; 
        color: #f1e9d2; 
        border: none; 
        padding: 12px 25px; 
        font-family: "Eagle Lake", serif; 
        transition: 0.3s; 
    }
    .btn-povestnik:hover { 
        background-color: #5a1111; 
        color: white; 
        transform: translateY(-2px); 
    }
    .btn-delete { 
        color: #080808; 
        text-decoration: underline; 
        font-size: 0.9rem; 
    }
    .status-badge { 
        font-weight: bold; 
        letter-spacing: 1px; 
        padding: 8px 12px; 
    }
    @media (min-width: 768px) {
        .dotaz-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
        }
    }
    @media (max-width: 767px) {
        .card-dotaz {
            padding: 50px 40px; 
            min-height: auto;
            margin-bottom: 30px;
        }
        .email-text { 
            font-size: 1.1rem; 
        }
        .admin-nav h1 { 
            font-size: 1.2rem; 
        }
        .btn-povestnik { 
            width: 100%; 
        }
    }
    @media (min-width: 768px) {
        .dotaz-actions {
            flex-direction: column;
            align-items: flex-end;
        }
    }       
</style>
</head>
<body>
<nav class="admin-nav sticky-top">
    <div class="container d-flex justify-content-between align-items-center">
        <h1 class="m-0">Správa kroniky</h1>
        <a href="logout.php" class="btn-logout">Opustit archiv</a>
    </div>
</nav>
<div class="admin-container">
    <?php if(isset($_GET['msg'])): ?>
        <div id="status-alert" class="alert alert-info shadow text-center"><?php echo htmlspecialchars($_GET['msg']); ?></div>
    <?php endif; ?>
    <?php if(isset($error)): ?>
        <div id="status-alert" class="alert alert-danger shadow text-center"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    <div class="row">
        <?php foreach ($dotazy as $d): ?>
        <div class="col-12">
            <div class="card card-dotaz <?php echo $d['vyrizeno'] ? 'vyrizeno' : ''; ?>">
                <div class="dotaz-header">
                    <div>
                        <h2 class="email-text"><?php echo htmlspecialchars($d['email']); ?></h2>
                        <small class="text-muted italic">Zapsáno: <?php echo date("d.m.Y H:i", strtotime($d['vytvoreno'])); ?></small>
                    </div>
                    <div class="dotaz-actions">
                        <?php if ($d['vyrizeno']): ?>
                            <span class="badge bg-success status-badge">VYŘÍZENO</span>
                        <?php else: ?>
                            <span class="badge bg-danger status-badge">NEVYŘÍZENO</span>
                        <?php endif; ?>
                        <a href="admin.php?delete=<?php echo $d['id']; ?>" class="btn-delete" onclick="return confirm('Opravdu chceš tento zápis spálit?')">Smazat</a>
                    </div>
                </div>
                <div class="dotaz-obsah">
                    "<?php echo nl2br(htmlspecialchars($d['dotaz'])); ?>"
                </div>
                <?php if (!$d['vyrizeno']): ?>
                <button class="btn btn-povestnik" type="button" data-bs-toggle="collapse" data-bs-target="#reply-<?php echo $d['id']; ?>">
                    Zapsat odpověď
                </button>
                <div class="collapse mt-4" id="reply-<?php echo $d['id']; ?>">
                    <div class="p-4 border-top border-2 border-danger" style="background: rgba(255,255,255,0.3);">
                        <form method="POST">
                            <input type="hidden" name="id" value="<?php echo $d['id']; ?>">
                            <input type="hidden" name="email" value="<?php echo $d['email']; ?>">
                            <input type="hidden" name="original_query" value="<?php echo htmlspecialchars($d['dotaz']); ?>">
                            <textarea name="reply_text" class="form-control mb-3" rows="5" placeholder="Tvé sjednané poselství..." required style="background: rgba(255,255,255,0.8); border: 1px solid #7a5c3c;"></textarea>
                            <div class="text-end">
                                <button name="send_reply" type="submit" class="btn btn-povestnik">Vyslat poštovního holuba</button>
                            </div>
                        </form>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function() {
    const alert = document.getElementById('status-alert');
    if (alert) {
        setTimeout(function() {
            alert.style.transition = "opacity 0.8s ease";
            alert.style.opacity = "0";
            setTimeout(function() { alert.remove(); }, 800);
        }, 3000);
        if (window.history.replaceState) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }
});
</script>
</body>
</html>