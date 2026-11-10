-- KU Restaurant order improvements
-- Table number and token are now assigned automatically by the server.
-- Existing columns are retained; customers no longer enter table_number.

-- Run only if your existing orders table is missing these columns.
-- ALTER TABLE orders ADD COLUMN table_number VARCHAR(30) NULL AFTER location;
-- ALTER TABLE orders ADD COLUMN token_number VARCHAR(30) NOT NULL UNIQUE AFTER table_number;

-- No new customer-facing fields are required for automatic assignment.
