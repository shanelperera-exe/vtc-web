-- Flyway migration: create table for storing application-level shipping amount
CREATE TABLE IF NOT EXISTS shipping_config (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  shipping_amount DECIMAL(19,2) NOT NULL
);
