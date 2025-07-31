-- migrations/create_tables.sql
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  blood_type TEXT NOT NULL,
  location TEXT,
  last_donated TIMESTAMP,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  blood_type TEXT NOT NULL,
  urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  donor_id UUID REFERENCES donors(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- Blood type compatibility view
CREATE OR REPLACE VIEW compatible_matches AS
SELECT 
  p.id as patient_id,
  d.id as donor_id,
  p.phone as patient_phone,
  d.phone as donor_phone,
  d.name as donor_name,
  p.blood_type as needed_type,
  d.blood_type as donor_type
FROM patients p
CROSS JOIN donors d
WHERE d.available = true
AND (
  -- Universal donors
  (d.blood_type = 'O-') OR
  -- Same blood type
  (p.blood_type = d.blood_type) OR
  -- O+ can donate to positive types
  (d.blood_type = 'O+' AND p.blood_type IN ('A+', 'B+', 'AB+', 'O+')) OR
  -- A- can donate to A types
  (d.blood_type = 'A-' AND p.blood_type IN ('A+', 'A-', 'AB+', 'AB-')) OR
  -- B- can donate to B types  
  (d.blood_type = 'B-' AND p.blood_type IN ('B+', 'B-', 'AB+', 'AB-')) OR
  -- A+ can donate to A+ and AB+
  (d.blood_type = 'A+' AND p.blood_type IN ('A+', 'AB+')) OR
  -- B+ can donate to B+ and AB+
  (d.blood_type = 'B+' AND p.blood_type IN ('B+', 'AB+'))
);