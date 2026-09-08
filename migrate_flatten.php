<?php
/**
 * Final Migration: Flatten women_profiles
 * - Drop FK int columns (association_id, city_mun_id, barangay_id)
 * - Add varchar columns: association_name, municipality, barangay
 * - Populate from existing relational data
 * - Remove sequence_no (not needed in flat table)
 */
require 'config.php';
try {
    $pdo = new PDO(
        'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4',
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    echo "Step 1: Populate varchar columns FIRST (before dropping FKs)...\n";
    // Add new varchar columns if they don't exist yet
    $cols = array_column($pdo->query('DESCRIBE women_profiles')->fetchAll(PDO::FETCH_ASSOC), 'Field');

    if (!in_array('association_name', $cols)) {
        $pdo->exec("ALTER TABLE women_profiles ADD COLUMN association_name VARCHAR(255) NULL DEFAULT NULL AFTER barangay_id");
        echo "  ✔ Added association_name column\n";
    }
    if (!in_array('municipality', $cols)) {
        $pdo->exec("ALTER TABLE women_profiles ADD COLUMN municipality VARCHAR(100) NULL DEFAULT NULL AFTER association_name");
        echo "  ✔ Added municipality column\n";
    }
    if (!in_array('barangay', $cols)) {
        $pdo->exec("ALTER TABLE women_profiles ADD COLUMN barangay VARCHAR(100) NULL DEFAULT NULL AFTER municipality");
        echo "  ✔ Added barangay column\n";
    }

    // Populate from relational tables before dropping them
    $pdo->exec("
        UPDATE women_profiles wp
        JOIN barangay_associations ba ON ba.id = wp.association_id
        LEFT JOIN city_mun cm ON cm.id = wp.city_mun_id
        LEFT JOIN barangay bg ON bg.id = wp.barangay_id
        SET
            wp.association_name = COALESCE(ba.association_name, 'KALIPI Women\\'s Association'),
            wp.municipality     = COALESCE(cm.name, ba.municipality, 'Pagadian City'),
            wp.barangay         = COALESCE(bg.name, ba.barangay, 'San Jose')
        WHERE wp.association_name IS NULL OR wp.municipality IS NULL OR wp.barangay IS NULL
    ");
    echo "  ✔ Populated association_name, municipality, barangay from relational tables\n";

    // Verify
    $sample = $pdo->query("SELECT id, full_name, association_name, municipality, barangay FROM women_profiles LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($sample as $row) {
        echo "  Sample: #{$row['id']} {$row['full_name']} | {$row['association_name']} | {$row['municipality']}, {$row['barangay']}\n";
    }

    echo "\nStep 2: Drop FK constraints...\n";
    $pdo->exec("ALTER TABLE women_profiles DROP FOREIGN KEY fk_profile_association");
    echo "  ✔ Dropped fk_profile_association\n";
    $pdo->exec("ALTER TABLE women_profiles DROP FOREIGN KEY fk_wp_city_mun");
    echo "  ✔ Dropped fk_wp_city_mun\n";
    $pdo->exec("ALTER TABLE women_profiles DROP FOREIGN KEY fk_wp_barangay");
    echo "  ✔ Dropped fk_wp_barangay\n";

    echo "\nStep 3: Drop FK index keys...\n";
    $pdo->exec("ALTER TABLE women_profiles DROP INDEX fk_profile_association");
    echo "  ✔ Dropped index fk_profile_association\n";
    $pdo->exec("ALTER TABLE women_profiles DROP INDEX fk_wp_city_mun");
    echo "  ✔ Dropped index fk_wp_city_mun\n";
    $pdo->exec("ALTER TABLE women_profiles DROP INDEX fk_wp_barangay");
    echo "  ✔ Dropped index fk_wp_barangay\n";

    echo "\nStep 4: Drop int FK columns...\n";
    $pdo->exec("ALTER TABLE women_profiles DROP COLUMN association_id");
    echo "  ✔ Dropped association_id\n";
    $pdo->exec("ALTER TABLE women_profiles DROP COLUMN city_mun_id");
    echo "  ✔ Dropped city_mun_id\n";
    $pdo->exec("ALTER TABLE women_profiles DROP COLUMN barangay_id");
    echo "  ✔ Dropped barangay_id\n";
    $pdo->exec("ALTER TABLE women_profiles DROP COLUMN sequence_no");
    echo "  ✔ Dropped sequence_no (auto-numbered via id)\n";

    echo "\nStep 5: Final schema...\n";
    $fields = $pdo->query('DESCRIBE women_profiles')->fetchAll(PDO::FETCH_ASSOC);
    foreach ($fields as $f) {
        echo "  {$f['Field']}  ({$f['Type']})  NULL:{$f['Null']}  KEY:{$f['Key']}\n";
    }

    echo "\nMigration complete!\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
