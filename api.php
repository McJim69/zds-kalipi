<?php
session_start();
/**
 * ZAMBOANGA DEL SUR KALIPI-RIC WOMEN FEDERATION, INC.
 * Backend REST API (MySQL PDO) + Remote Data Sync & Photo Storage
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

$host = DB_HOST;
$db   = DB_NAME;
$user = DB_USER;
$pass = DB_PASS;
$charset = DB_CHARSET;

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

/**
 * Saves Base64 image payload to images/photos/ directory and returns relative URL
 */
function processAndSavePhoto($imageInput) {
    if (empty($imageInput)) return '';

    // Check if it is a Data URL (base64)
    if (preg_match('/^data:image\/(\w+);base64,/', $imageInput, $typeMatch)) {
        $base64Data = substr($imageInput, strpos($imageInput, ',') + 1);
        $extension = strtolower($typeMatch[1]);
        if ($extension === 'jpeg') $extension = 'jpg';
        if (!in_array($extension, ['jpg', 'png', 'webp', 'gif', 'svg+xml'])) {
            $extension = 'png';
        }

        $decodedData = base64_decode($base64Data);
        if ($decodedData !== false) {
            $photosDir = __DIR__ . '/images/photos';
            if (!file_exists($photosDir)) {
                mkdir($photosDir, 0755, true);
            }
            $filename = 'photo_' . time() . '_' . substr(md5(uniqid()), 0, 8) . '.' . $extension;
            $fullPath = $photosDir . '/' . $filename;
            file_put_contents($fullPath, $decodedData);
            return 'images/photos/' . $filename;
        }
    }

    return $imageInput;
}

$action = $_GET['action'] ?? 'get_all';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

function require_admin($targetMunicipality = null) {
    if (empty($_SESSION['is_admin']) || empty($_SESSION['role'])) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Login required.']);
        exit();
    }
    
    if ($targetMunicipality !== null && $_SESSION['role'] !== 'superadmin') {
        if ($_SESSION['municipality'] !== $targetMunicipality && $_SESSION['municipality'] !== 'ALL') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized. You do not have permission for this municipality.']);
            exit();
        }
    }
}

try {
    switch ($action) {
        case 'check_auth':
            echo json_encode([
                'status' => 'success', 
                'isAdmin' => !empty($_SESSION['is_admin']),
                'role' => $_SESSION['role'] ?? '',
                'municipality' => $_SESSION['municipality'] ?? ''
            ]);
            break;

        case 'login':
            $username = trim($input['username'] ?? '');
            $pwd = $input['password'] ?? '';
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($pwd, $user['password_hash'])) {
                $_SESSION['is_admin'] = true;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['municipality'] = $user['municipality'];
                
                echo json_encode([
                    'status' => 'success', 
                    'message' => 'Logged in successfully.',
                    'role' => $user['role'],
                    'municipality' => $user['municipality']
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Incorrect username or password.']);
            }
            break;

        case 'logout':
            $_SESSION['is_admin'] = false;
            session_destroy();
            echo json_encode(['status' => 'success', 'message' => 'Logged out.']);
            break;

        case 'get_all':
            $stmtProf = $pdo->query("SELECT * FROM women_profiles ORDER BY id ASC");
            $rawProfiles = $stmtProf->fetchAll();

            $profiles = array_map(function($p) {
                $computedAge = (int)$p['age'];
                if (!empty($p['birthdate'])) {
                    $bDate = new DateTime($p['birthdate']);
                    $today = new DateTime();
                    $computedAge = $today->diff($bDate)->y;
                }

                $img = !empty($p['img_url']) ? $p['img_url'] : $p['avatar_url'];

                return [
                    'id' => (string)$p['id'],
                    'dbId' => (int)$p['id'],
                    'name' => $p['full_name'],
                    'birthdate' => $p['birthdate'],
                    'age' => $computedAge,
                    'civilStatus' => $p['civil_status'],
                    'occupation' => $p['occupation'],
                    'position' => $p['position'],
                    'contactNo' => $p['contact_number'],
                    'municipality' => $p['municipality'] ?? '',
                    'barangay' => $p['barangay'] ?? '',
                    'remarks' => $p['remarks'],
                    'avatar' => $img,
                    'imgUrl' => $img,
                    'avatar_url' => $img,
                    'img_url' => $img
                ];
            }, $rawProfiles);

            echo json_encode([
                'status' => 'success',
                'profiles' => $profiles,
                'syncKey' => SYNC_SECRET_KEY
            ]);
            break;

        case 'save_profile':
            $name = trim($input['name'] ?? '');
            $birthdate = trim($input['birthdate'] ?? '');
            $age = intval($input['age'] ?? 0);

            if ($birthdate) {
                try {
                    $bDate = new DateTime($birthdate);
                    $today = new DateTime();
                    $calcAge = $today->diff($bDate)->y;
                    if ($calcAge >= 0) {
                        $age = $calcAge;
                    }
                } catch (\Exception $e) {}
            }

            $civilStatus  = $input['civilStatus'] ?? 'Married';
            $occupation   = trim($input['occupation'] ?? '');
            $position     = $input['position'] ?? 'Member';
            $contactNo    = trim($input['contactNo'] ?? '');
            $municipality = trim($input['municipality'] ?? '');
            $barangay     = trim($input['barangay'] ?? '');
            $remarks      = trim($input['remarks'] ?? '');
            
            require_admin($municipality);
            
            // Support avatar, imgUrl, avatar_url, img_url input field names & process base64 photo upload
            $rawAvatar = trim($input['imgUrl'] ?? $input['img_url'] ?? $input['avatar'] ?? $input['avatar_url'] ?? '');
            $avatar = processAndSavePhoto($rawAvatar);

            $id = $input['id'] ?? null;
            $dbId = isset($input['dbId']) ? intval($input['dbId']) : (is_numeric($id) ? intval($id) : null);

            if (!$name) {
                echo json_encode(['status' => 'error', 'message' => 'Full Name is required.']);
                exit();
            }

            if ($dbId) {
                $stmt = $pdo->prepare("UPDATE women_profiles SET 
                    full_name = :name,
                    birthdate = :birthdate,
                    age = :age,
                    civil_status = :civilStatus,
                    occupation = :occupation,
                    position = :position,
                    contact_number = :contactNo,
                    municipality = :municipality,
                    barangay = :barangay,
                    remarks = :remarks,
                    avatar_url = :avatar,
                    img_url = :imgUrl
                    WHERE id = :id");
                $stmt->execute([
                    ':name' => $name,
                    ':birthdate' => $birthdate ?: null,
                    ':age' => $age,
                    ':civilStatus' => $civilStatus,
                    ':occupation' => $occupation,
                    ':position' => $position,
                    ':contactNo' => $contactNo,
                    ':municipality' => $municipality,
                    ':barangay' => $barangay,
                    ':remarks' => $remarks,
                    ':avatar' => $avatar,
                    ':imgUrl' => $avatar,
                    ':id' => $dbId
                ]);
                $savedId = $dbId;
            } else {
                $stmt = $pdo->prepare("INSERT INTO women_profiles 
                    (association_id, full_name, birthdate, age, civil_status, occupation, position, contact_number, municipality, barangay, remarks, avatar_url, img_url)
                    VALUES (1, :name, :birthdate, :age, :civilStatus, :occupation, :position, :contactNo, :municipality, :barangay, :remarks, :avatar, :imgUrl)");
                $stmt->execute([
                    ':name' => $name,
                    ':birthdate' => $birthdate ?: null,
                    ':age' => $age,
                    ':civilStatus' => $civilStatus,
                    ':occupation' => $occupation,
                    ':position' => $position,
                    ':contactNo' => $contactNo,
                    ':municipality' => $municipality,
                    ':barangay' => $barangay,
                    ':remarks' => $remarks,
                    ':avatar' => $avatar,
                    ':imgUrl' => $avatar
                ]);
                $savedId = $pdo->lastInsertId();
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Profile saved successfully.',
                'id' => (string)$savedId,
                'computedAge' => $age,
                'imgUrl' => $avatar,
                'avatar' => $avatar
            ]);
            break;

        case 'delete_profile':
            $id = $input['id'] ?? null;
            $dbId = isset($input['dbId']) ? intval($input['dbId']) : (is_numeric($id) ? intval($id) : null);

            if ($dbId) {
                $stmtSelect = $pdo->prepare("SELECT img_url, avatar_url, municipality FROM women_profiles WHERE id = :id");
                $stmtSelect->execute([':id' => $dbId]);
                $row = $stmtSelect->fetch();
                
                if ($row) {
                    require_admin($row['municipality']);
                    $photoPath = $row['img_url'] ?: $row['avatar_url'];
                    if ($photoPath && strpos($photoPath, 'images/photos/') === 0) {
                        $fullFile = __DIR__ . '/' . $photoPath;
                        if (file_exists($fullFile)) {
                            @unlink($fullFile);
                        }
                    }
                }

                $stmt = $pdo->prepare("DELETE FROM women_profiles WHERE id = :id");
                $stmt->execute([':id' => $dbId]);
                echo json_encode(['status' => 'success', 'message' => 'Profile deleted successfully.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Invalid Profile ID.']);
            }
            break;

        // --- REMOTE SYNC HANDLERS ---
        case 'sync_push':
            require_admin();
            $key = $input['syncKey'] ?? '';
            if ($key !== SYNC_SECRET_KEY) {
                echo json_encode(['status' => 'error', 'message' => 'Invalid Sync Secret Key.']);
                exit();
            }

            if (isset($input['associationInfo'])) {
                $a = $input['associationInfo'];
                $stmt = $pdo->prepare("UPDATE barangay_associations SET 
                    municipality = :m, barangay = :b, association_name = :an, president_leader = :p, contact_number = :c, dole_registration_no = :d 
                    WHERE id = 1");
                $stmt->execute([
                    ':m' => $a['municipality'] ?? 'Pagadian City',
                    ':b' => $a['barangay'] ?? 'San Jose',
                    ':an' => $a['associationName'] ?? '',
                    ':p' => $a['presidentLeader'] ?? '',
                    ':c' => $a['contactNo'] ?? '',
                    ':d' => $a['doleRegNo'] ?? ''
                ]);
            }

            if (isset($input['profiles']) && is_array($input['profiles'])) {
                $pdo->exec("DELETE FROM women_profiles");
                $stmtIns = $pdo->prepare("INSERT INTO women_profiles 
                    (association_id, full_name, birthdate, age, civil_status, occupation, position, contact_number, remarks, avatar_url, img_url) 
                    VALUES (1, :name, :birthdate, :age, :civilStatus, :occupation, :position, :contactNo, :remarks, :avatar, :imgUrl)");

                foreach ($input['profiles'] as $p) {
                    $bdate = $p['birthdate'] ?? null;
                    $calcAge = intval($p['age'] ?? 0);
                    if ($bdate && $calcAge <= 0) {
                        try {
                            $calcAge = (new DateTime())->diff(new DateTime($bdate))->y;
                        } catch (\Exception $e) {}
                    }

                    $rawImg = $p['imgUrl'] ?? $p['img_url'] ?? $p['avatar'] ?? $p['avatar_url'] ?? '';
                    $img = processAndSavePhoto($rawImg);

                    $stmtIns->execute([
                        ':name' => $p['name'],
                        ':birthdate' => $bdate ?: null,
                        ':age' => $calcAge,
                        ':civilStatus' => $p['civilStatus'] ?? 'Married',
                        ':occupation' => $p['occupation'] ?? '',
                        ':position' => $p['position'] ?? 'Member',
                        ':contactNo' => $p['contactNo'] ?? '',
                        ':remarks' => $p['remarks'] ?? '',
                        ':avatar' => $img,
                        ':imgUrl' => $img
                    ]);
                }
            }

            echo json_encode(['status' => 'success', 'message' => 'Database synchronized successfully!']);
            break;

        case 'trigger_sync_remote':
            require_admin();
            $targetUrl = $input['remoteUrl'] ?? REMOTE_SERVER_URL;
            $syncKey = $input['syncKey'] ?? SYNC_SECRET_KEY;

            $stmtAssoc = $pdo->query("SELECT * FROM barangay_associations ORDER BY id ASC LIMIT 1");
            $assoc = $stmtAssoc->fetch();
            $stmtProf = $pdo->query("SELECT * FROM women_profiles ORDER BY id ASC");
            $rawProfiles = $stmtProf->fetchAll();

            $payload = [
                'syncKey' => $syncKey,
                'associationInfo' => [
                    'municipality' => $assoc['municipality'],
                    'barangay' => $assoc['barangay'],
                    'associationName' => $assoc['association_name'],
                    'presidentLeader' => $assoc['president_leader'],
                    'contactNo' => $assoc['contact_number'],
                    'doleRegNo' => $assoc['dole_registration_no']
                ],
                'profiles' => array_map(function($p) {
                    $img = !empty($p['img_url']) ? $p['img_url'] : $p['avatar_url'];
                    return [
                        'name' => $p['full_name'],
                        'birthdate' => $p['birthdate'],
                        'age' => (int)$p['age'],
                        'civilStatus' => $p['civil_status'],
                        'occupation' => $p['occupation'],
                        'position' => $p['position'],
                        'contactNo' => $p['contact_number'],
                        'remarks' => $p['remarks'],
                        'avatar' => $img,
                        'imgUrl' => $img
                    ];
                }, $rawProfiles)
            ];

            $ch = curl_init($targetUrl . '?action=sync_push');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);

            $result = curl_exec($ch);
            $err = curl_error($ch);
            curl_close($ch);

            if ($err) {
                echo json_encode(['status' => 'error', 'message' => 'cURL Error: ' . $err]);
            } else {
                echo $result;
            }
            break;

        case 'trigger_sync_pull':
            require_admin();
            $targetUrl = $input['remoteUrl'] ?? REMOTE_SERVER_URL;
            
            $ch = curl_init($targetUrl . '?action=get_all');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $response = curl_exec($ch);
            $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($response && $httpcode == 200) {
                $data = json_decode($response, true);
                if (isset($data['status']) && $data['status'] === 'success' && isset($data['profiles'])) {
                    
                    $pdo->exec("DELETE FROM women_profiles");
                    $stmtIns = $pdo->prepare("INSERT INTO women_profiles 
                        (association_id, full_name, birthdate, age, civil_status, occupation, position, contact_number, remarks, avatar_url, img_url) 
                        VALUES (1, :name, :birthdate, :age, :civilStatus, :occupation, :position, :contactNo, :remarks, :avatar, :imgUrl)");

                    foreach ($data['profiles'] as $p) {
                        $bdate = !empty($p['birthdate']) ? $p['birthdate'] : null;
                        $calcAge = intval($p['age'] ?? 0);
                        $img = $p['imgUrl'] ?? $p['avatar'] ?? '';

                        $stmtIns->execute([
                            ':name' => $p['name'],
                            ':birthdate' => $bdate,
                            ':age' => $calcAge,
                            ':civilStatus' => $p['civilStatus'] ?? 'Married',
                            ':occupation' => $p['occupation'] ?? '',
                            ':position' => $p['position'] ?? 'Member',
                            ':contactNo' => $p['contactNo'] ?? '',
                            ':remarks' => $p['remarks'] ?? '',
                            ':avatar' => $img,
                            ':imgUrl' => $img
                        ]);
                    }
                    echo json_encode(['status' => 'success', 'message' => 'Successfully pulled ' . count($data['profiles']) . ' profiles from Production!']);
                    exit();
                }
            }
            echo json_encode(['status' => 'error', 'message' => 'Failed to pull or invalid response from remote server.']);
            break;

        case 'get_users':
            require_admin();
            if ($_SESSION['role'] !== 'superadmin') {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Super admin only.']);
                exit;
            }
            $stmt = $pdo->query("SELECT id, username, municipality, role, created_at FROM users ORDER BY municipality ASC");
            echo json_encode(['status' => 'success', 'users' => $stmt->fetchAll()]);
            break;

        case 'create_user':
            require_admin();
            if ($_SESSION['role'] !== 'superadmin') {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Super admin only.']);
                exit;
            }
            $username = trim($input['username'] ?? '');
            $password = $input['password'] ?? '';
            $municipality = trim($input['municipality'] ?? '');
            $role = trim($input['role'] ?? 'admin');

            if (!$username || !$password || !$municipality) {
                echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
                break;
            }

            try {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, municipality, role) VALUES (?, ?, ?, ?)");
                $stmt->execute([$username, $hash, $municipality, $role]);
                echo json_encode(['status' => 'success', 'message' => 'User created successfully']);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => 'Username might already exist']);
            }
            break;

        case 'delete_user':
            require_admin();
            if ($_SESSION['role'] !== 'superadmin') {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Super admin only.']);
                exit;
            }
            $userId = intval($input['id'] ?? 0);
            if ($userId == $_SESSION['user_id']) {
                echo json_encode(['status' => 'error', 'message' => 'Cannot delete yourself']);
                break;
            }
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            echo json_encode(['status' => 'success', 'message' => 'User deleted']);
            break;

        default:
            echo json_encode(['status' => 'error', 'message' => 'Unknown API action.']);
            break;
    }
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
