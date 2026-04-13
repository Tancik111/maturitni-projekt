<!-- Kód pro odhlášení uživatele z administrátorského rozhraní Pověstníku. Kód začíná session_start() pro zahájení session, poté vymaže všechny session proměnné a pokud jsou používány cookies pro session, nastaví cookie s minulým datem, aby se odstranila. Nakonec zničí session a přesměruje uživatele zpět na přihlašovací stránku login.php. -->
<?php
session_start();
$_SESSION = array();
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();
header("Location: login.php");
exit;
?>