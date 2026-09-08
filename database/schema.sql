-- ============================================================================
-- ZAMBOANGA DEL SUR KALIPI-RIC WOMEN FEDERATION, INC.
-- BARANGAY WOMEN'S PROFILING SYSTEM - DATABASE SCHEMA (CY 2026)
-- Target RDBMS: MySQL 8.0+ / MariaDB 10.3+ / PostgreSQL / SQLite
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `zds_kalipi_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `zds_kalipi_db`;

-- ----------------------------------------------------------------------------
-- 1. Table: barangay_associations
-- Stores header info for each barangay women's association unit
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `women_profiles`;
DROP TABLE IF EXISTS `barangay_associations`;

CREATE TABLE `barangay_associations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `municipality` VARCHAR(100) NOT NULL DEFAULT 'Pagadian City',
    `barangay` VARCHAR(100) NOT NULL DEFAULT 'San Jose',
    `association_name` VARCHAR(255) NOT NULL DEFAULT 'KALIPI San Jose Women''s Association, Inc.',
    `president_leader` VARCHAR(150) NOT NULL DEFAULT 'Ma. Elena S. Santos',
    `contact_number` VARCHAR(50) DEFAULT '0917-890-1234',
    `dole_registration_no` VARCHAR(100) DEFAULT 'DOLE-IX-2024-0589-WA',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_municipality_barangay` (`municipality`, `barangay`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: women_profiles
-- Stores individual woman profile records for each association
-- ----------------------------------------------------------------------------
CREATE TABLE `women_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `association_id` INT NOT NULL,
    `sequence_no` INT DEFAULT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `age` INT NOT NULL CHECK (`age` >= 15 AND `age` <= 110),
    `birthdate` DATE DEFAULT NULL,
    `civil_status` ENUM('Single', 'Married', 'Widowed', 'Separated', 'Solo Parent') NOT NULL DEFAULT 'Married',
    `occupation` VARCHAR(150) DEFAULT NULL,
    `position` ENUM('President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor', 'P.R.O.', 'Board Member', 'Member') NOT NULL DEFAULT 'Member',
    `contact_number` VARCHAR(50) DEFAULT NULL,
    `remarks` TEXT DEFAULT NULL,
    `avatar_url` VARCHAR(500) DEFAULT NULL,
    `imgUrl` VARCHAR(500) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_profile_association` FOREIGN KEY (`association_id`) 
        REFERENCES `barangay_associations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_full_name` (`full_name`),
    INDEX `idx_position` (`position`),
    INDEX `idx_civil_status` (`civil_status`),
    INDEX `idx_birthdate` (`birthdate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INITIAL SEED DATA (Zamboanga del Sur KALIPI Sample Records)
-- ============================================================================

INSERT INTO `barangay_associations` 
    (`id`, `municipality`, `barangay`, `association_name`, `president_leader`, `contact_number`, `dole_registration_no`) 
VALUES 
    (1, 'Pagadian City', 'San Jose', 'KALIPI San Jose Women\'s Association, Inc.', 'Ma. Elena S. Santos', '0917-890-1234', 'DOLE-IX-2024-0589-WA');

INSERT INTO `women_profiles` 
    (`association_id`, `sequence_no`, `full_name`, `age`, `birthdate`, `civil_status`, `occupation`, `position`, `contact_number`, `remarks`, `avatar_url`, `imgUrl`) 
VALUES
(1, 1, 'Ma. Elena S. Santos', 48, '1978-03-14', 'Married', 'Public School Teacher', 'President', '0917-890-1234', 'Federation Board Representative & Livelihood Lead', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
(1, 2, 'Rosalinda G. Mendoza', 45, '1981-07-22', 'Married', 'Business Owner / Enterprise', 'Vice President', '0919-234-5678', 'Crafts & Weaving Project Head', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'),
(1, 3, 'Teresita V. Alcantara', 39, '1987-11-05', 'Single', 'Barangay Health Worker (BHW)', 'Secretary', '0920-345-6789', 'Health & Nutrition Committee Chair', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'),
(1, 4, 'Carmencita D. Roxas', 52, '1974-01-19', 'Married', 'Micro-Entrepreneur', 'Treasurer', '0918-456-7890', 'Savings & Credit Cooperative Officer', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'),
(1, 5, 'Luzviminda M. Castro', 41, '1985-09-30', 'Solo Parent', 'Dressmaker & Tailor', 'Auditor', '0921-567-8901', 'Solo Parent Welfare Advocate', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
(1, 6, 'Corazon B. Aquino-Flores', 36, '1990-04-12', 'Married', 'Organic Farmer / RIC Coordinator', 'P.R.O.', '0917-678-9012', 'Rural Improvement Club (RIC) Agriculture Focal', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'),
(1, 7, 'Analyn P. Sumalinog', 55, '1971-08-08', 'Widowed', 'Sari-Sari Store Owner', 'Board Member', '0998-789-0123', 'Senior Citizen Women Group Lead', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80'),
(1, 8, 'Jacqueline K. Cabahug', 34, '1992-02-25', 'Married', 'Daycare Worker', 'Board Member', '0905-890-1234', 'Early Childhood Care Coordinator', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80'),
(1, 9, 'Merlinda R. Dela Cruz', 29, '1997-06-18', 'Single', 'Online Seller / Digital Artisan', 'Member', '0916-901-2345', 'Youth Women Representative & IT Support', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
(1, 10, 'Evelyn T. Gonzaga', 50, '1976-10-04', 'Married', 'Food Processing Specialist', 'Member', '0922-012-3456', 'KALIPI Food Production Team', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
(1, 11, 'Grace H. Manalo', 38, '1988-12-14', 'Solo Parent', 'Financial Literacy Trainer', 'Member', '0935-123-4567', 'Microfinance & Budgeting Workshop Facilitator', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'),
(1, 12, 'Fe Maria C. Villarin', 44, '1982-05-27', 'Married', 'Livestock Farmer', 'Member', '0947-234-5678', 'RIC Poultry & Goat Raising Project', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80');
