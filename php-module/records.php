<?php
/**
 * FreshKart - Display, Search, Seed & Delete Registered Records
 * Directly connected to MySQL (phpMyAdmin) users & feedback tables.
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

require_once 'db.php';

// Support JSON API mode for external callers or dashboards
if (isset($_GET['format']) && $_GET['format'] === 'json' || isset($_GET['api'])) {
    header('Content-Type: application/json; charset=utf-8');
    if (!isset($pdo) || !$pdo) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $db_error ?: 'Database connection failed']);
        exit;
    }
    $search = trim($_GET['search'] ?? '');
    if (!empty($search)) {
        $stmt = $pdo->prepare("SELECT id, full_name, email, phone, dob, gender, pref_time, address, city, state, country, category_prefs, brand_prefs, budget_range, profile_pic, additional_notes, created_at FROM users WHERE full_name LIKE :s OR email LIKE :s OR city LIKE :s OR phone LIKE :s ORDER BY id DESC");
        $stmt->execute([':s' => "%$search%"]);
    } else {
        $stmt = $pdo->query("SELECT id, full_name, email, phone, dob, gender, pref_time, address, city, state, country, category_prefs, brand_prefs, budget_range, profile_pic, additional_notes, created_at FROM users ORDER BY id DESC");
    }
    $rows = $stmt->fetchAll();
    echo json_encode(['success' => true, 'count' => count($rows), 'records' => $rows]);
    exit;
}

$msg = $_GET['msg'] ?? '';
$search = trim($_GET['search'] ?? '');

// Handle delete request
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delId = intval($_GET['id']);
    if (isset($pdo) && $pdo) {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $delId]);
        header("Location: records.php?msg=deleted");
        exit;
    }
}

// Handle seed sample data request (convenient for demonstrations)
if (isset($_GET['action']) && $_GET['action'] === 'seed') {
    if (isset($pdo) && $pdo) {
        $samples = [
            [
                'full_name'        => 'Aarav Sharma',
                'email'            => 'aarav.sharma@example.com',
                'phone'            => '9876543211',
                'dob'              => '1996-04-12',
                'gender'           => 'male',
                'pref_time'        => '09:00:00',
                'address'          => 'Flat 402, Green Meadows, Anna Nagar',
                'city'             => 'Chennai',
                'state'            => 'Tamil Nadu',
                'country'          => 'IN',
                'category_prefs'   => 'Fresh Vegetables, Fresh Fruits',
                'brand_prefs'      => 'FreshFarm, Amul',
                'budget_range'     => '1000-2500',
                'additional_notes' => 'Prefers morning delivery between 8 AM and 10 AM.',
                'password_hash'    => password_hash('FreshKart@123', PASSWORD_BCRYPT)
            ],
            [
                'full_name'        => 'Priya Patel',
                'email'            => 'priya.patel@example.com',
                'phone'            => '9823456789',
                'dob'              => '1998-08-25',
                'gender'           => 'female',
                'pref_time'        => '18:30:00',
                'address'          => '12 Palm Grove Road, Indiranagar',
                'city'             => 'Bengaluru',
                'state'            => 'Karnataka',
                'country'          => 'IN',
                'category_prefs'   => 'Dairy & Breakfast, Daily Needs, Staples & Grains',
                'brand_prefs'      => 'Amul, Aashirvaad, Tata',
                'budget_range'     => '2500-5000',
                'additional_notes' => 'Requires organic certified produce whenever in stock.',
                'password_hash'    => password_hash('FreshKart@123', PASSWORD_BCRYPT)
            ],
            [
                'full_name'        => 'Rohan Varma',
                'email'            => 'rohan.varma@example.com',
                'phone'            => '9811223344',
                'dob'              => '1992-11-05',
                'gender'           => 'male',
                'pref_time'        => '11:00:00',
                'address'          => 'B-103, Skyline Heights, Bandra West',
                'city'             => 'Mumbai',
                'state'            => 'Maharashtra',
                'country'          => 'IN',
                'category_prefs'   => 'Fresh Fruits, Snacks & Beverages',
                'brand_prefs'      => 'FreshFarm, Tata',
                'budget_range'     => '5000+',
                'additional_notes' => 'Looking for seasonal exotic fruit hampers.',
                'password_hash'    => password_hash('FreshKart@123', PASSWORD_BCRYPT)
            ]
        ];

        $ins = $pdo->prepare("INSERT INTO users (full_name, email, phone, dob, gender, pref_time, address, city, state, country, category_prefs, brand_prefs, budget_range, additional_notes, password_hash)
                              VALUES (:full_name, :email, :phone, :dob, :gender, :pref_time, :address, :city, :state, :country, :category_prefs, :brand_prefs, :budget_range, :additional_notes, :password_hash)
                              ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)");

        foreach ($samples as $s) {
            $ins->execute($s);
        }

        header("Location: records.php?msg=seeded");
        exit;
    }
}

// Fetch records from MySQL
$records = [];
$totalCount = 0;
$dbConnected = (isset($pdo) && $pdo !== null);

if ($dbConnected) {
    try {
        if (!empty($search)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE full_name LIKE :s OR email LIKE :s OR city LIKE :s OR phone LIKE :s ORDER BY id DESC");
            $stmt->execute([':s' => "%$search%"]);
            $records = $stmt->fetchAll();
        } else {
            $stmt = $pdo->query("SELECT * FROM users ORDER BY id DESC");
            $records = $stmt->fetchAll();
        }
        $countStmt = $pdo->query("SELECT COUNT(*) FROM users");
        $totalCount = (int)$countStmt->fetchColumn();
    } catch (PDOException $e) {
        $db_error = $e->getMessage();
        $dbConnected = false;
    }
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MySQL Records Manager — FreshKart phpMyAdmin Module</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <style>
        body { padding: 2rem 0 4rem; background: var(--bg); font-family: var(--font, 'Plus Jakarta Sans', sans-serif); color: var(--text); }
        .module-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.25rem; margin-bottom:2rem; }
        .status-badge { display:inline-flex; align-items:center; gap:0.5rem; padding:0.45rem 1rem; border-radius:999px; font-size:0.85rem; font-weight:700; }
        .status-badge.online { background:rgba(16,185,129,0.18); color:var(--primary-light); border:1.5px solid var(--primary-light); box-shadow:0 0 15px var(--primary-glow); }
        .status-badge.offline { background:rgba(239,68,68,0.15); color:var(--danger); border:1.5px solid var(--danger); }
        .status-card { background:var(--gradient-card); border:1.5px solid var(--border); border-radius:var(--radius); padding:1.5rem 1.75rem; margin-bottom:2rem; box-shadow:var(--shadow-sm); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.25rem; position:relative; overflow:hidden; }
        .status-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:4px; background:var(--gradient); }
        .table-wrap { overflow-x: auto; background: var(--card-bg); border: 1.5px solid var(--border); border-radius: var(--radius); box-shadow:var(--shadow-sm); }
        table { width: 100%; border-collapse: collapse; font-size: 0.88rem; min-width:920px; }
        th, td { padding: 1rem 1.15rem; border-bottom: 1px solid var(--border); text-align: left; vertical-align: middle; }
        th { background: var(--bg-3); color: var(--text-strong); font-weight: 750; text-transform: uppercase; font-size: 0.76rem; letter-spacing: 0.06em; }
        tr:hover td { background: var(--primary-tint); }
        .avatar-thumb { width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid var(--primary-light); background:var(--bg-3); display:inline-flex; align-items:center; justify-content:center; font-weight:800; color:var(--primary-light); box-shadow:0 2px 8px var(--primary-glow); }
        .modal-backdrop { display:none; position:fixed; inset:0; background:rgba(4,25,18,0.75); backdrop-filter:blur(10px); z-index:9999; align-items:center; justify-content:center; padding:1.25rem; }
        .modal-box { background:var(--card-bg); border-radius:var(--radius); border:1.5px solid var(--border); width:100%; max-width:620px; max-height:90vh; overflow-y:auto; padding:2rem; box-shadow:var(--shadow); position:relative; }
        .modal-box::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:var(--gradient); border-radius:var(--radius) var(--radius) 0 0; }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; }
        .detail-item { margin-bottom:0.85rem; }
        .detail-label { font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:750; letter-spacing:0.04em; }
        .detail-val { font-size:0.92rem; color:var(--text-strong); margin-top:3px; word-break:break-word; font-weight:600; }
    </style>
</head>
<body>
<div class="container">

    <!-- Top Navigation Header -->
    <div class="module-header">
        <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                <h1 style="font-size:1.5rem; font-weight:800; margin:0;">📋 MySQL Records Management</h1>
                <?php if ($dbConnected): ?>
                    <span class="status-badge online"><i class="fa fa-circle-check"></i> Connected to freshkart_db</span>
                <?php else: ?>
                    <span class="status-badge offline"><i class="fa fa-circle-exclamation"></i> MySQL Offline</span>
                <?php endif; ?>
            </div>
            <p style="color:var(--text-muted); font-size:0.875rem; margin:0;">
                Live records stored in MySQL table <code>users</code>. Accessible via phpMyAdmin.
            </p>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <a href="http://localhost/phpmyadmin/index.php?route=/sql&db=freshkart_db&table=users" target="_blank" class="btn btn-outline btn-sm" title="Open phpMyAdmin in new tab">
                <i class="fa fa-database"></i> Open phpMyAdmin ↗
            </a>
            <a href="index.html" class="btn btn-primary btn-sm">
                <i class="fa fa-user-plus"></i> + New User Form
            </a>
            <a href="../register.html" class="btn btn-outline btn-sm">
                <i class="fa fa-arrow-left"></i> Main Registration
            </a>
            <a href="../index.html" class="btn btn-outline btn-sm">
                <i class="fa fa-store"></i> Storefront
            </a>
        </div>
    </div>

    <!-- Feedback Alerts -->
    <?php if ($msg === 'success'): ?>
        <div class="card mb-3" style="background:#ecfdf5; border-color:#6ee7b7; color:#065f46; padding:0.85rem 1.25rem;">
            <i class="fa fa-circle-check"></i> <strong>Success!</strong> Registration has been saved into phpMyAdmin (MySQL database).
        </div>
    <?php elseif ($msg === 'deleted'): ?>
        <div class="card mb-3" style="background:#fef2f2; border-color:#fca5a5; color:#991b1b; padding:0.85rem 1.25rem;">
            <i class="fa fa-trash-can"></i> <strong>Deleted!</strong> Record was successfully removed from MySQL.
        </div>
    <?php elseif ($msg === 'seeded'): ?>
        <div class="card mb-3" style="background:#eff6ff; border-color:#93c5fd; color:#1e40af; padding:0.85rem 1.25rem;">
            <i class="fa fa-seedling"></i> <strong>Sample Data Loaded!</strong> 3 sample records were added to phpMyAdmin.
        </div>
    <?php endif; ?>

    <!-- Database Connection Info Card -->
    <div class="status-card">
        <div>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.25rem;">DATABASE STATUS &amp; METRICS</div>
            <div style="font-size:1.1rem; font-weight:700;">
                <?php if ($dbConnected): ?>
                    <span style="color:var(--success);">● Active &amp; Synchronized</span>
                    <span style="color:var(--text-muted); font-size:0.85rem; font-weight:normal; margin-left:8px;">
                        (Database: <code>freshkart_db</code> &bull; Table: <code>users</code> &bull; Records: <strong><?= $totalCount ?></strong>)
                    </span>
                <?php else: ?>
                    <span style="color:var(--danger);">● Database Connection Error</span>
                    <div style="font-size:0.8rem; color:var(--danger); margin-top:4px;">
                        <?= htmlspecialchars($db_error ?? 'Unable to connect to MySQL on localhost:3306') ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <?php if ($dbConnected && $totalCount === 0): ?>
                <a href="records.php?action=seed" class="btn btn-primary btn-sm">
                    <i class="fa fa-seedling"></i> Seed Sample Records to phpMyAdmin
                </a>
            <?php elseif ($dbConnected): ?>
                <a href="records.php?action=seed" class="btn btn-outline btn-sm" onclick="return confirm('Add 3 demo records to MySQL?')" title="Populate demo users">
                    <i class="fa fa-seedling"></i> Add Demo Users
                </a>
            <?php endif; ?>
            <a href="records.php?format=json" target="_blank" class="btn btn-outline btn-sm" title="View live JSON data">
                <i class="fa fa-code"></i> View Raw JSON API
            </a>
        </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="card mb-3" style="padding:1rem;">
        <form method="GET" action="records.php" style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <div style="flex:1; min-width:260px;">
                <input type="text" name="search" class="form-control" placeholder="Search by name, email, phone, or city..." value="<?= htmlspecialchars($search) ?>" />
            </div>
            <button type="submit" class="btn btn-primary">
                <i class="fa fa-search"></i> Search
            </button>
            <?php if (!empty($search)): ?>
                <a href="records.php" class="btn btn-outline">Clear Filter</a>
            <?php endif; ?>
        </form>
    </div>

    <!-- Records Table -->
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th style="width:50px;">ID</th>
                    <th style="width:40px;">Avatar</th>
                    <th>User / Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Gender &amp; DOB</th>
                    <th>Location</th>
                    <th>Preferences</th>
                    <th>Budget</th>
                    <th>Registered</th>
                    <th style="width:140px; text-align:center;">Action</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($records)): ?>
                    <tr>
                        <td colspan="11" style="text-align:center; padding:3rem 1.5rem; color:var(--text-muted);">
                            <div style="font-size:2rem; margin-bottom:0.5rem;">📂</div>
                            <h3 style="font-size:1.1rem; color:var(--text-strong); margin-bottom:0.25rem;">
                                <?= !empty($search) ? "No records matched your search query '<strong>" . htmlspecialchars($search) . "</strong>'" : "No registered records found in MySQL (users table)." ?>
                            </h3>
                            <p style="font-size:0.85rem; margin-bottom:1rem;">
                                <?= !empty($search) ? "Try a different search term or clear the filter." : "Click below to seed sample records or register a new customer." ?>
                            </p>
                            <?php if (!empty($search)): ?>
                                <a href="records.php" class="btn btn-outline btn-sm">Clear Search</a>
                            <?php elseif ($dbConnected): ?>
                                <div style="display:flex; gap:0.5rem; justify-content:center;">
                                    <a href="records.php?action=seed" class="btn btn-primary btn-sm"><i class="fa fa-seedling"></i> Seed 3 Sample Customers</a>
                                    <a href="index.html" class="btn btn-outline btn-sm"><i class="fa fa-plus"></i> Register Manually</a>
                                </div>
                            <?php else: ?>
                                <p style="color:var(--danger); font-size:0.85rem;">Please start the MySQL service in XAMPP Control Panel.</p>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($records as $r): ?>
                        <tr>
                            <td><strong style="color:var(--primary);">#<?= htmlspecialchars($r['id']) ?></strong></td>
                            <td>
                                <?php if (!empty($r['profile_pic']) && file_exists(__DIR__ . '/' . $r['profile_pic'])): ?>
                                    <img src="<?= htmlspecialchars($r['profile_pic']) ?>" alt="Avatar" class="avatar-thumb" />
                                <?php else: ?>
                                    <div class="avatar-thumb">
                                        <?= strtoupper(substr($r['full_name'], 0, 1)) ?>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <strong><?= htmlspecialchars($r['full_name']) ?></strong>
                            </td>
                            <td>
                                <a href="mailto:<?= htmlspecialchars($r['email']) ?>" style="color:inherit; text-decoration:underline;">
                                    <?= htmlspecialchars($r['email']) ?>
                                </a>
                            </td>
                            <td><?= htmlspecialchars($r['phone'] ?? '-') ?></td>
                            <td>
                                <?= ucfirst($r['gender'] ?? 'Other') ?>
                                <?php if (!empty($r['dob'])): ?>
                                    <div style="font-size:0.75rem; color:var(--text-muted);"><?= htmlspecialchars($r['dob']) ?></div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <div><?= htmlspecialchars($r['city'] ?? '-') ?></div>
                                <div style="font-size:0.75rem; color:var(--text-muted);"><?= htmlspecialchars($r['state'] ?? '') ?></div>
                            </td>
                            <td>
                                <?php if (!empty($r['category_prefs'])): ?>
                                    <span class="tag tag-primary" style="font-size:0.7rem;"><?= htmlspecialchars($r['category_prefs']) ?></span>
                                <?php else: ?>
                                    <span style="color:var(--text-muted); font-size:0.75rem;">-</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if (!empty($r['budget_range'])): ?>
                                    <span class="tag tag-success" style="font-size:0.7rem;">₹<?= htmlspecialchars($r['budget_range']) ?></span>
                                <?php else: ?>
                                    <span style="color:var(--text-muted); font-size:0.75rem;">-</span>
                                <?php endif; ?>
                            </td>
                            <td style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">
                                <?= date('d M Y, H:i', strtotime($r['created_at'])) ?>
                            </td>
                            <td style="text-align:center;">
                                <div style="display:inline-flex; gap:0.25rem;">
                                    <button type="button" class="btn btn-outline btn-sm" onclick='inspectUser(<?= json_encode($r) ?>)' title="View Full Details">
                                        <i class="fa fa-eye"></i>
                                    </button>
                                    <a href="records.php?action=delete&id=<?= $r['id'] ?>" onclick="return confirm('Permanently delete record #<?= $r['id'] ?> (<?= addslashes($r['full_name']) ?>) from phpMyAdmin?')" class="btn btn-danger btn-sm" title="Delete from MySQL">
                                        <i class="fa fa-trash"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

</div>

<!-- Details Modal -->
<div class="modal-backdrop" id="userModal">
    <div class="modal-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; border-bottom:1px solid var(--border); padding-bottom:0.75rem;">
            <h3 style="margin:0; font-size:1.2rem;" id="modalTitle">User Details</h3>
            <button type="button" onclick="closeModal()" class="icon-btn" style="font-size:1.2rem; cursor:pointer;">&times;</button>
        </div>

        <div class="grid-2">
            <div class="detail-item">
                <div class="detail-label">User ID</div>
                <div class="detail-val" id="m-id">-</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Full Name</div>
                <div class="detail-val" id="m-name">-</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-val" id="m-email">-</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Phone</div>
                <div class="detail-val" id="m-phone">-</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">DOB / Gender</div>
                <div class="detail-val" id="m-dob-gender">-</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Preferred Time</div>
                <div class="detail-val" id="m-pref-time">-</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-val" id="m-location">-</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Budget Range</div>
                <div class="detail-val" id="m-budget">-</div>
            </div>
        </div>

        <div class="detail-item" style="margin-top:0.5rem;">
            <div class="detail-label">Full Address</div>
            <div class="detail-val" id="m-address" style="background:var(--bg-3); padding:0.5rem; border-radius:var(--radius-sm); font-size:0.85rem;">-</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Category Preferences</div>
            <div class="detail-val" id="m-categories">-</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Brand Preferences</div>
            <div class="detail-val" id="m-brands">-</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Additional Notes</div>
            <div class="detail-val" id="m-notes" style="background:var(--bg-3); padding:0.5rem; border-radius:var(--radius-sm); font-size:0.85rem;">-</div>
        </div>

        <div class="detail-item">
            <div class="detail-label">Registered Timestamp</div>
            <div class="detail-val" id="m-created">-</div>
        </div>

        <div style="margin-top:1.5rem; text-align:right;">
            <button type="button" class="btn btn-outline" onclick="closeModal()">Close</button>
        </div>
    </div>
</div>

<script>
function inspectUser(user) {
    document.getElementById('m-id').textContent = '#' + user.id;
    document.getElementById('m-name').textContent = user.full_name || '-';
    document.getElementById('m-email').textContent = user.email || '-';
    document.getElementById('m-phone').textContent = user.phone || '-';
    document.getElementById('m-dob-gender').textContent = (user.gender ? user.gender.toUpperCase() : '-') + ' / ' + (user.dob || '-');
    document.getElementById('m-pref-time').textContent = user.pref_time || 'Not specified';
    document.getElementById('m-location').textContent = (user.city || '') + (user.state ? ', ' + user.state : '') + (user.country ? ' (' + user.country + ')' : '');
    document.getElementById('m-budget').textContent = user.budget_range ? '₹' + user.budget_range : '-';
    document.getElementById('m-address').textContent = user.address || 'No address provided.';
    document.getElementById('m-categories').textContent = user.category_prefs || 'None selected';
    document.getElementById('m-brands').textContent = user.brand_prefs || 'None selected';
    document.getElementById('m-notes').textContent = user.additional_notes || 'No comments.';
    document.getElementById('m-created').textContent = user.created_at || '-';

    document.getElementById('modalTitle').textContent = 'User Details: ' + (user.full_name || '#' + user.id);
    document.getElementById('userModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Close on backdrop click
document.getElementById('userModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});
</script>
</body>
</html>
