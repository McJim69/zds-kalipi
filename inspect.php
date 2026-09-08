<?php
require 'config.php';
$pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);

echo "=== DISTINCT MUNICIPALITIES ===\n";
$muni = $pdo->query("SELECT DISTINCT municipality FROM barangays WHERE municipality IS NOT NULL AND municipality != '' ORDER BY municipality")->fetchAll(PDO::FETCH_COLUMN);
print_r($muni);

echo "\n=== BARANGAYS FOR PAGADIAN CITY ===\n";
$stmt = $pdo->prepare("SELECT barangay FROM barangays WHERE LOWER(municipality) = LOWER('Pagadian City') ORDER BY barangay");
$stmt->execute();
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
