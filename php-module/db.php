<?php
/**
 * FreshKart - Database Connection Module (PDO)
 * Automatically connects to MySQL via XAMPP / WAMP / standard setup,
 * and ensures the freshkart_db database and tables exist.
 */

$host     = getenv('DB_HOST') ?: '127.0.0.1';
$dbname   = getenv('DB_NAME') ?: 'freshkart_db';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$port     = getenv('DB_PORT') ?: '3306';

$pdo = null;
$db_error = null;

// Candidates to attempt connection
$dsnsToTry = [
    "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
    "mysql:host=localhost;port=$port;dbname=$dbname;charset=utf8mb4",
    "mysql:host=$host;port=$port;dbname=FreshKart_db;charset=utf8mb4",
    "mysql:host=localhost;port=$port;dbname=FreshKart_db;charset=utf8mb4",
];

foreach ($dsnsToTry as $dsn) {
    try {
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $db_error = null;
        break;
    } catch (PDOException $e) {
        $db_error = $e->getMessage();
    }
}

// If direct connection failed (e.g. unknown database), attempt to connect to server and create database
if (!$pdo) {
    $serverDsns = [
        "mysql:host=$host;port=$port;charset=utf8mb4",
        "mysql:host=localhost;port=$port;charset=utf8mb4",
    ];
    foreach ($serverDsns as $sDsn) {
        try {
            $rootPdo = new PDO($sDsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `freshkart_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            $rootPdo->exec("USE `freshkart_db`;");

            $pdo = new PDO("mysql:host=$host;port=$port;dbname=freshkart_db;charset=utf8mb4", $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            $db_error = null;
            break;
        } catch (PDOException $e2) {
            $db_error = $e2->getMessage();
        }
    }
}

// Auto-create required tables if not already present in the database
if ($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(120) NOT NULL UNIQUE,
                phone VARCHAR(20) NOT NULL,
                dob DATE NOT NULL,
                gender ENUM('male', 'female', 'other') NOT NULL,
                pref_time TIME NULL,
                address TEXT NULL,
                city VARCHAR(80) NOT NULL,
                state VARCHAR(80) NOT NULL,
                country VARCHAR(10) DEFAULT 'IN',
                category_prefs TEXT NULL,
                brand_prefs TEXT NULL,
                budget_range VARCHAR(50) NULL,
                profile_pic VARCHAR(255) NULL,
                additional_notes TEXT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;

            CREATE TABLE IF NOT EXISTS feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(120) NOT NULL,
                subject VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB;
        ");
    } catch (PDOException $e) {
        // Table creation warning - non fatal
    }
}
