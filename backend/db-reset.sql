-- Destructive reset for local development ONLY.
-- Drops and recreates the schema used by the Spring application.
-- Usage (Linux/macOS):
--   mysql -u vtcuser -p < backend/db-reset.sql

DROP DATABASE IF EXISTS vtcdb;
CREATE DATABASE vtcdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- (Re)create user if necessary (commented out if already exists)
-- CREATE USER IF NOT EXISTS 'vtcuser'@'%' IDENTIFIED BY 'VTCweb@123';
-- GRANT ALL PRIVILEGES ON vtcdb.* TO 'vtcuser'@'%';
-- FLUSH PRIVILEGES;

-- After running this, start the Spring Boot app with ddl-auto=create or update.
-- Remove deprecated carousel image column from categories (safe for local dev resets)
ALTER TABLE categories
	DROP COLUMN IF EXISTS carousel_img_url;

-- NOTE: The Product entity long text field has been renamed in code to 'detailedDescription'
-- but still maps to the physical column 'description' for backward compatibility.
-- Future migration (optional): ALTER TABLE products RENAME COLUMN description TO detailed_description;

-- Migration: add company fields to orders addresses and order notes
-- Safe to run multiple times if DB supports IF NOT EXISTS
-- Remove legacy state columns if present (safe in MySQL 8+ / compatible servers)
ALTER TABLE orders
	DROP COLUMN IF EXISTS billing_state,
	DROP COLUMN IF EXISTS shipping_state;

-- Add new address-related columns (idempotent when IF NOT EXISTS supported)
ALTER TABLE orders 
	ADD COLUMN IF NOT EXISTS billing_company VARCHAR(255),
	ADD COLUMN IF NOT EXISTS shipping_company VARCHAR(255),
	ADD COLUMN IF NOT EXISTS billing_district VARCHAR(255),
	ADD COLUMN IF NOT EXISTS billing_province VARCHAR(255),
	ADD COLUMN IF NOT EXISTS shipping_district VARCHAR(255),
	ADD COLUMN IF NOT EXISTS shipping_province VARCHAR(255),
	ADD COLUMN IF NOT EXISTS order_notes TEXT;