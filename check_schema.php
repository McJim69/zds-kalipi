<?php
require 'config.php';
$pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS);
$stmt = $pdo->query("DESCRIBE women_profiles");
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "women_profiles cols: ";
foreach ($res as $r) echo $r['Field'] . ", ";

echo "\n\nbarangays cols: ";
$stmt = $pdo->query("DESCRIBE barangays");
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($res as $r) echo $r['Field'] . ", ";
