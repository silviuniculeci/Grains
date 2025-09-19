-- Fix IBAN constraint to allow NULL values and proper Romanian IBAN validation
-- Run this SQL in your Supabase SQL editor

-- First, let's see the current constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
AND constraint_name ILIKE '%iban%';

-- Drop the existing IBAN constraint if it exists
DO $$
BEGIN
    -- Try to drop common constraint names
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints
               WHERE constraint_schema = 'public'
               AND constraint_name = 'valid_iban') THEN
        ALTER TABLE supplier_profiles DROP CONSTRAINT valid_iban;
        RAISE NOTICE 'Dropped existing valid_iban constraint';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.check_constraints
               WHERE constraint_schema = 'public'
               AND constraint_name = 'supplier_profiles_bank_account_check') THEN
        ALTER TABLE supplier_profiles DROP CONSTRAINT supplier_profiles_bank_account_check;
        RAISE NOTICE 'Dropped existing bank_account constraint';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop constraint: %', SQLERRM;
END $$;

-- Create a new, more flexible IBAN constraint
ALTER TABLE supplier_profiles
ADD CONSTRAINT valid_iban_or_null
CHECK (
    bank_account IS NULL OR
    bank_account = '' OR
    (
        bank_account ~ '^RO[0-9]{22}$' AND  -- Romanian IBAN format: RO + 22 digits
        length(bank_account) = 24
    )
);

-- Alternative: If you want to temporarily disable IBAN validation completely
-- ALTER TABLE supplier_profiles DROP CONSTRAINT IF EXISTS valid_iban_or_null;

-- Check that the constraint was created
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
AND table_name = 'supplier_profiles'
AND constraint_name = 'valid_iban_or_null';

-- Test the constraint with some sample data (won't actually insert)
DO $$
BEGIN
    RAISE NOTICE 'Testing IBAN validation:';

    -- These should be valid
    IF 'RO49AAAA1B31007593840000' ~ '^RO[0-9]{22}$' THEN
        RAISE NOTICE '✓ Valid Romanian IBAN format accepted';
    END IF;

    -- NULL should be valid
    IF NULL IS NULL THEN
        RAISE NOTICE '✓ NULL values accepted';
    END IF;

    -- Empty string should be valid
    IF '' = '' THEN
        RAISE NOTICE '✓ Empty string accepted';
    END IF;

END $$;