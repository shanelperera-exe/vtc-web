-- Remove legacy 'amount' column if it exists to avoid insert errors
ALTER TABLE shipping_config DROP COLUMN IF EXISTS amount;
