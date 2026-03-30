<?php
session_start();

// Smaže všechny proměnné v session
$_SESSION = array();

// Pokud chcete zničit i session cookie, odstraňte ji z prohlížeče
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Úplné zničení session na serveru
session_destroy();

// Přesměrování na přihlašovací formulář
header("Location: login.php");
exit;
?>