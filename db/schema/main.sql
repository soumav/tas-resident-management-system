
-- Main schema file that imports all other schema files
-- This is the file you would run to set up the entire database

-- Load tables
\i db/schema/tables.sql

-- Load policies
\i db/schema/policies.sql
\i db/schema/resident_policies.sql
\i db/schema/staff_volunteer_policies.sql
\i db/schema/message_storage_policies.sql

-- Load seed data
\i db/schema/seed_data.sql
