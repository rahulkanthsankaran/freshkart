<?php
/**
 * FreshKart - Server-Side Form Processing & Record Creation
 * Receives registrations from both register.html and php-module/index.html,
 * validates inputs, handles image uploads, and saves directly into MySQL (phpMyAdmin).
 */

// Enable CORS for cross-origin or local live-server requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

// Detect if caller expects JSON
$isJsonExpected = (
    !empty($_SERVER['HTTP_X_REQUESTED_WITH']) ||
    (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) ||
    isset($_POST['ajax']) ||
    isset($_GET['ajax'])
);

if ($isJsonExpected) {
    header('Content-Type: application/json; charset=utf-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    if ($isJsonExpected) {
        echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    } else {
        echo 'Method not allowed. Use POST.';
    }
    exit;
}

// Check database connectivity
if (!isset($pdo) || !$pdo) {
    http_response_code(500);
    $errMsg = 'Database connection failed: ' . ($db_error ?: 'Could not connect to MySQL. Ensure MySQL is started in XAMPP.');
    if ($isJsonExpected) {
        echo json_encode(['success' => false, 'errors' => [$errMsg]]);
    } else {
        echo "<h3>Database Error</h3><p>$errMsg</p><p><a href='records.php'>Go to Records</a></p>";
    }
    exit;
}

// Check if this is a feedback submission
if (isset($_POST['action']) && $_POST['action'] === 'feedback' || (isset($_POST['subject']) && isset($_POST['message']))) {
    $fb_name    = trim($_POST['name'] ?? $_POST['fullName'] ?? 'Anonymous');
    $fb_email   = trim($_POST['email'] ?? '');
    $fb_subject = trim($_POST['subject'] ?? 'General Inquiry');
    $fb_message = trim($_POST['message'] ?? '');
    $fb_user_id = !empty($_POST['user_id']) ? intval($_POST['user_id']) : null;

    if (empty($fb_email) || !filter_var($fb_email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => ['Valid email address is required.']]);
        exit;
    }
    if (empty($fb_message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => ['Message cannot be empty.']]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO feedback (user_id, name, email, subject, message) VALUES (:uid, :name, :email, :subject, :msg)");
        $stmt->execute([
            ':uid'     => $fb_user_id,
            ':name'    => $fb_name,
            ':email'   => $fb_email,
            ':subject' => $fb_subject,
            ':msg'     => $fb_message
        ]);
        echo json_encode(['success' => true, 'message' => 'Feedback saved to MySQL database successfully!']);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'errors' => ['Failed to save feedback: ' . $e->getMessage()]]);
        exit;
    }
}

// 1. Sanitize & Validate User Registration Inputs
$errors = [];

$full_name = trim($_POST['fullName'] ?? $_POST['full_name'] ?? $_POST['name'] ?? '');
$email_raw = trim($_POST['email'] ?? '');
$email     = filter_var($email_raw, FILTER_VALIDATE_EMAIL) ? $email_raw : false;
$phone     = trim($_POST['phone'] ?? '');
$dob       = trim($_POST['dob'] ?? '');
$gender    = trim($_POST['gender'] ?? 'other');
$pref_time = trim($_POST['prefTime'] ?? $_POST['pref_time'] ?? '');
$address   = trim($_POST['address'] ?? '');
$city      = trim($_POST['city'] ?? '');
$state     = trim($_POST['state'] ?? '');
$country   = trim($_POST['country'] ?? 'IN');
$budget    = trim($_POST['budget'] ?? $_POST['budget_range'] ?? '');
$notes     = trim($_POST['userNotes'] ?? $_POST['notes'] ?? $_POST['additional_notes'] ?? '');
$password  = $_POST['password'] ?? '';

// Categories & Brands can be passed as array or string
if (isset($_POST['categories'])) {
    $categories = is_array($_POST['categories']) ? implode(', ', $_POST['categories']) : trim($_POST['categories']);
} else {
    $categories = '';
}

if (isset($_POST['brands'])) {
    $brands = is_array($_POST['brands']) ? implode(', ', $_POST['brands']) : trim($_POST['brands']);
} else {
    $brands = '';
}

// Validation rules
if (empty($full_name) || mb_strlen($full_name) < 2) {
    $errors[] = 'Full name must be at least 2 characters.';
}
if (!$email) {
    $errors[] = 'Valid email address is required.';
}
if (empty($phone) || !preg_match('/^[6-9][0-9]{9}$/', $phone)) {
    $errors[] = 'Phone number must be a valid 10-digit Indian mobile number (starts with 6-9).';
}
if (empty($dob)) {
    $errors[] = 'Date of birth is required.';
}
if (empty($gender)) {
    $errors[] = 'Gender selection is required.';
}
if (empty($password) || strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters.';
}

// 2. Check for Duplicate Email before insertion
if ($email && empty($errors)) {
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $checkStmt->execute([':email' => $email]);
    if ($checkStmt->fetch()) {
        $errors[] = 'This email (' . htmlspecialchars($email) . ') is already registered in phpMyAdmin. Please use another email or sign in.';
    }
}

// 3. Handle Profile Picture Upload
$profile_pic_path = null;
if (isset($_FILES['profilePic']) && $_FILES['profilePic']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath   = $_FILES['profilePic']['tmp_name'];
    $fileName      = $_FILES['profilePic']['name'];
    $fileSize      = $_FILES['profilePic']['size'];
    $fileNameCmps  = explode(".", $fileName);
    $fileExtension = strtolower(end($fileNameCmps));

    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (in_array($fileExtension, $allowedExtensions)) {
        if ($fileSize <= 5 * 1024 * 1024) { // Up to 5MB
            $uploadFileDir = __DIR__ . '/uploads/';
            if (!is_dir($uploadFileDir)) {
                mkdir($uploadFileDir, 0755, true);
            }
            $safeFileName = 'user_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $fileExtension;
            $dest_path = $uploadFileDir . $safeFileName;
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                $profile_pic_path = 'uploads/' . $safeFileName;
            }
        } else {
            $errors[] = 'Profile picture must be under 5MB.';
        }
    } else {
        $errors[] = 'Upload valid image type (JPG, PNG, WebP, GIF).';
    }
}

// Return errors if any
if (!empty($errors)) {
    http_response_code(400);
    if ($isJsonExpected) {
        echo json_encode(['success' => false, 'errors' => $errors]);
    } else {
        echo "<h3>Submission Errors:</h3><ul>";
        foreach ($errors as $err) {
            echo "<li>" . htmlspecialchars($err) . "</li>";
        }
        echo "</ul><p><a href='javascript:history.back()'>Go back and fix</a></p>";
    }
    exit;
}

// 4. Insert Record into MySQL (users table)
$password_hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $sql = "INSERT INTO users (
                full_name, email, phone, dob, gender, pref_time, 
                address, city, state, country, category_prefs, 
                brand_prefs, budget_range, profile_pic, additional_notes, 
                password_hash
            ) VALUES (
                :full_name, :email, :phone, :dob, :gender, :pref_time, 
                :address, :city, :state, :country, :category_prefs, 
                :brand_prefs, :budget_range, :profile_pic, :additional_notes, 
                :password_hash
            )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':full_name'        => $full_name,
        ':email'            => $email,
        ':phone'            => $phone,
        ':dob'              => $dob,
        ':gender'           => $gender,
        ':pref_time'        => !empty($pref_time) ? $pref_time : null,
        ':address'          => $address,
        ':city'             => $city,
        ':state'            => $state,
        ':country'          => $country,
        ':category_prefs'   => $categories,
        ':brand_prefs'      => $brands,
        ':budget_range'     => $budget,
        ':profile_pic'      => $profile_pic_path,
        ':additional_notes' => $notes,
        ':password_hash'    => $password_hash
    ]);

    $newUserId = $pdo->lastInsertId();

    if ($isJsonExpected) {
        echo json_encode([
            'success'  => true,
            'message'  => "Registration successfully saved into phpMyAdmin (users table)!",
            'userId'   => $newUserId,
            'userName' => $full_name,
            'email'    => $email
        ]);
    } else {
        header("Location: records.php?msg=success&id=" . urlencode($newUserId));
    }
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    $msg = 'MySQL Database error: ' . $e->getMessage();
    if ($isJsonExpected) {
        echo json_encode(['success' => false, 'errors' => [$msg]]);
    } else {
        echo "<h3>Database Error</h3><p>" . htmlspecialchars($msg) . "</p>";
    }
    exit;
}
