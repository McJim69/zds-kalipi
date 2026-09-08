<?php
require 'config.php';
try {
    $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create users table
    $sql = "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        municipality VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($sql);
    
    // Insert default super admin if users table is empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        $hash = password_hash('kalipi2026', PASSWORD_DEFAULT);
        $stmtIns = $pdo->prepare("INSERT INTO users (username, password_hash, municipality, role) VALUES ('admin', ?, 'ALL', 'superadmin')");
        $stmtIns->execute([$hash]);
        echo "Users table created and default super admin ('admin' / 'kalipi2026') inserted.\n";
    } else {
        echo "Users table already exists and is populated.\n";
    }
} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
?>
