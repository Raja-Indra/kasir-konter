<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=kasir_konter', 'root', '');
    echo "Connected 127.0.0.1\n";
} catch(PDOException $e) {
    echo "Fail 127.0.0.1: " . $e->getMessage() . "\n";
}
try {
    $pdo = new PDO('mysql:host=localhost;port=3307;dbname=kasir_konter', 'root', '');
    echo "Connected localhost\n";
} catch(PDOException $e) {
    echo "Fail localhost: " . $e->getMessage() . "\n";
}
