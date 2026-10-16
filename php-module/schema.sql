-- ========================================================
-- FreshKart: User Registration & Feedback Demonstration Schema
-- Database: FreshKart_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS FreshKart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE FreshKart_db;

-- 1. Users Registration Table
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

-- 2. Feedback / Support Table
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

