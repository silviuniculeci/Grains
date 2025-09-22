-- Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic identification
  name VARCHAR(255) NOT NULL,
  legal_type VARCHAR(20) NOT NULL CHECK (legal_type IN ('individual', 'legal_entity')),
  tax_id VARCHAR(50), -- CUI for legal entities, CNP for individuals
  agent_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_validation', 'valid', 'rejected')),
  contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('supplier', 'buyer', 'both')),

  -- Contact information
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  county VARCHAR(50) NOT NULL,
  country VARCHAR(50) NOT NULL DEFAULT 'Romania',
  postal_code VARCHAR(20) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Individual specific fields
  first_name VARCHAR(100), -- Only for individuals
  last_name VARCHAR(100), -- Only for individuals
  full_name VARCHAR(200), -- Auto-populated for individuals
  id_series VARCHAR(10), -- Romanian ID series
  id_number VARCHAR(20), -- Romanian ID number
  personal_identification_number VARCHAR(13), -- CNP

  -- Legal entity specific fields
  company_name VARCHAR(255), -- Only for legal entities
  trade_register_number VARCHAR(50), -- ONRC number
  vat_registration_number VARCHAR(50), -- VAT number
  company_number VARCHAR(50), -- Company registration number

  -- Financial information
  iban VARCHAR(34),
  bank_name VARCHAR(255),
  swift_code VARCHAR(11),
  iban_validated BOOLEAN DEFAULT FALSE,
  anaf_verified BOOLEAN DEFAULT FALSE,
  anaf_data JSONB,
  anaf_last_checked TIMESTAMPTZ,

  -- Commercial information (primarily for suppliers)
  cultivated_area DECIMAL(10,2), -- hectares
  purchase_potential TEXT,
  annual_purchase_target DECIMAL(15,2),
  apia_certificate_number VARCHAR(100),
  apia_certificate_expiration DATE,

  -- Validation workflow
  validation_status VARCHAR(20) NOT NULL DEFAULT 'not_reviewed' CHECK (validation_status IN ('not_reviewed', 'under_review', 'approved', 'rejected')),
  validation_notes TEXT,
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,

  -- Flags
  can_place_orders BOOLEAN DEFAULT FALSE,
  requires_backoffice_validation BOOLEAN DEFAULT TRUE,

  -- Audit fields
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_individual_data CHECK (
    (legal_type = 'individual' AND first_name IS NOT NULL AND last_name IS NOT NULL) OR
    (legal_type = 'legal_entity' AND company_name IS NOT NULL)
  ),

  CONSTRAINT valid_tax_id CHECK (
    (legal_type = 'individual' AND (tax_id IS NULL OR length(tax_id) = 13)) OR
    (legal_type = 'legal_entity' AND (tax_id IS NULL OR length(tax_id) BETWEEN 2 AND 10))
  )
);

-- Create loading addresses table
CREATE TABLE contact_loading_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address VARCHAR(500) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  unloading_location VARCHAR(255) NOT NULL,
  secondary_address VARCHAR(500),
  secondary_address_2 VARCHAR(500),
  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create associated contacts table
CREATE TABLE contact_associated_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role VARCHAR(100),
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contact documents table (extends existing documents table concept)
CREATE TABLE contact_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  description TEXT,

  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  validation_status VARCHAR(20) NOT NULL DEFAULT 'not_reviewed' CHECK (validation_status IN ('not_reviewed', 'under_review', 'approved', 'rejected')),
  validation_notes TEXT,
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,

  -- OCR integration
  ocr_status VARCHAR(20) DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_result_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX idx_contacts_legal_type ON contacts(legal_type);
CREATE INDEX idx_contacts_validation_status ON contacts(validation_status);
CREATE INDEX idx_contacts_agent_id ON contacts(agent_id);
CREATE INDEX idx_contacts_county ON contacts(county);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_tax_id ON contacts(tax_id);

CREATE INDEX idx_loading_addresses_contact_id ON contact_loading_addresses(contact_id);
CREATE INDEX idx_loading_addresses_is_primary ON contact_loading_addresses(is_primary);

CREATE INDEX idx_associated_contacts_contact_id ON contact_associated_contacts(contact_id);
CREATE INDEX idx_associated_contacts_email ON contact_associated_contacts(email);

CREATE INDEX idx_contact_documents_contact_id ON contact_documents(contact_id);
CREATE INDEX idx_contact_documents_validation_status ON contact_documents(validation_status);
CREATE INDEX idx_contact_documents_document_type ON contact_documents(document_type);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loading_addresses_updated_at BEFORE UPDATE ON contact_loading_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_associated_contacts_updated_at BEFORE UPDATE ON contact_associated_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_documents_updated_at BEFORE UPDATE ON contact_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-populate full_name for individuals
CREATE OR REPLACE FUNCTION update_full_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.legal_type = 'individual' AND NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN
    NEW.full_name = NEW.first_name || ' ' || NEW.last_name;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_full_name BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_full_name();

-- Create trigger to ensure only one primary loading address per contact
CREATE OR REPLACE FUNCTION ensure_single_primary_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE contact_loading_addresses
    SET is_primary = FALSE
    WHERE contact_id = NEW.contact_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_primary_address BEFORE INSERT OR UPDATE ON contact_loading_addresses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_address();

-- Create RLS policies (if RLS is enabled)
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_loading_addresses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_associated_contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_documents ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE contacts IS 'Comprehensive contact management for suppliers, buyers, and mixed contacts';
COMMENT ON COLUMN contacts.legal_type IS 'Individual person or legal entity (company)';
COMMENT ON COLUMN contacts.contact_type IS 'Supplier, buyer, or both';
COMMENT ON COLUMN contacts.status IS 'Draft (editable), pending validation, valid (can place orders), or rejected';
COMMENT ON COLUMN contacts.can_place_orders IS 'Only valid suppliers can place orders in the system';
COMMENT ON COLUMN contacts.personal_identification_number IS 'Romanian CNP for individuals';
COMMENT ON COLUMN contacts.trade_register_number IS 'Romanian ONRC registration number';

COMMENT ON TABLE contact_loading_addresses IS 'Multiple loading addresses per contact with primary designation';
COMMENT ON TABLE contact_associated_contacts IS 'People associated with a company contact';
COMMENT ON TABLE contact_documents IS 'Documents uploaded for contact validation and compliance';