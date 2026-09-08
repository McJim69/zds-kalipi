<?php
/**
 * ZAMBOANGA DEL SUR KALIPI-RIC WOMEN FEDERATION, INC.
 * Location Options API Endpoint (PDO)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdoOptions = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $pdoOptions);
} catch (\PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$type         = strtolower(trim($_GET['type'] ?? ''));
$municipality = trim($_GET['municipality'] ?? $_GET['city_mun'] ?? '');
$options      = [];

try {
    if ($type === 'municipality' || $type === 'municipaliy' || $type === 'city_mun' || $type === 'lgu') {
        // Return list of distinct Municipalities / Cities
        $stmt = $pdo->query("SELECT DISTINCT municipality FROM barangays WHERE municipality IS NOT NULL AND municipality != '' ORDER BY municipality ASC");
        $options = $stmt->fetchAll(PDO::FETCH_COLUMN);
    } elseif ($type === 'barangay') {
        // Return list of Barangays filtered by Municipality if provided
        if (!empty($municipality)) {
            $shortMuni = trim(preg_replace('/\bcity\b/i', '', $municipality));
            $stmt = $pdo->prepare("
                SELECT DISTINCT barangay 
                FROM barangays 
                WHERE LOWER(municipality) = LOWER(:m1) 
                   OR LOWER(municipality) = LOWER(:m2) 
                   OR LOWER(municipality) LIKE LOWER(:m3)
                ORDER BY barangay ASC
            ");
            $stmt->execute([
                ':m1' => $municipality,
                ':m2' => $shortMuni,
                ':m3' => '%' . $shortMuni . '%'
            ]);
            $options = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } else {
            // Return all barangays if no municipality specified
            $stmt = $pdo->query("SELECT DISTINCT barangay FROM barangays ORDER BY barangay ASC");
            $options = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }
    } else {
        // Return structured object if no type specified
        $stmtMuni = $pdo->query("SELECT DISTINCT municipality FROM barangays WHERE municipality IS NOT NULL AND municipality != '' ORDER BY municipality ASC");
        $municipalities = $stmtMuni->fetchAll(PDO::FETCH_COLUMN);

        $stmtBrgy = $pdo->query("SELECT brgy_id AS id, barangay AS name, municipality FROM barangays ORDER BY barangay ASC");
        $barangays = $stmtBrgy->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status'         => 'success',
            'municipalities' => $municipalities,
            'barangays'      => $barangays
        ]);
        exit();
    }

    echo json_encode($options);
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}