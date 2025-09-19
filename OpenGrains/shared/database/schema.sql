-- OpenGrains Database Schema for Supabase
-- Bilingual OCR-Enhanced Supplier Engagement System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('sales_agent', 'supplier', 'back_office', 'admin');
CREATE TYPE language_preference AS ENUM ('en', 'ro');
CREATE TYPE business_type AS ENUM ('PJ', 'PF');
CREATE TYPE document_type AS ENUM ('onrc_certificate', 'farmer_id_card', 'apia_certificate', 'bank_statement', 'identity_card', 'other');
CREATE TYPE status_type AS ENUM ('pending', 'draft', 'submitted', 'under_review', 'approved', 'rejected', 'failed', 'completed');
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical', 'urgent');
CREATE TYPE competitiveness_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE target_status AS ENUM ('draft', 'active', 'on_track', 'at_risk', 'behind', 'exceeded', 'completed', 'cancelled');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'supplier',
    language_preference language_preference NOT NULL DEFAULT 'en',
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Zones table for geographical management
CREATE TABLE public.zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    counties TEXT[] NOT NULL DEFAULT '{}',
    cities TEXT[] DEFAULT '{}',
    market_potential DECIMAL(15,2) NOT NULL DEFAULT 0,
    historical_volume DECIMAL(15,2) NOT NULL DEFAULT 0,
    average_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    active_suppliers INTEGER NOT NULL DEFAULT 0,
    total_suppliers INTEGER NOT NULL DEFAULT 0,
    assigned_agents UUID[] DEFAULT '{}',
    primary_agent UUID REFERENCES public.users(id),
    coverage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (coverage >= 0 AND coverage <= 100),
    performance_rating DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (performance_rating >= 0 AND performance_rating <= 5),
    competitiveness competitiveness_level NOT NULL DEFAULT 'medium',
    growth_potential competitiveness_level NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Supplier profiles table
CREATE TABLE public.supplier_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    business_name TEXT NOT NULL,
    business_type business_type NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternative_phone TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    county TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Romania',
    grain_types TEXT[] NOT NULL DEFAULT '{}',
    estimated_volume DECIMAL(10,2),
    bank_account TEXT, -- Romanian IBAN
    cui TEXT, -- Romanian tax ID
    onrc_number TEXT, -- Romanian business registration
    apia_id TEXT, -- Romanian agricultural agency ID
    language_preference language_preference NOT NULL DEFAULT 'ro',
    assigned_zone UUID REFERENCES public.zones(id),
    registration_status status_type NOT NULL DEFAULT 'draft',
    approval_date TIMESTAMP WITH TIME ZONE,
    assigned_agent UUID REFERENCES public.users(id),
    romanian_business_data JSONB,
    validation_status status_type NOT NULL DEFAULT 'under_review',
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT valid_cui CHECK (cui IS NULL OR cui ~ '^(RO)?[0-9]{2,10}$'),
    CONSTRAINT valid_iban CHECK (bank_account IS NULL OR bank_account ~ '^RO[0-9]{2}[A-Z]{4}[0-9A-Z]{16}$'),
    CONSTRAINT valid_onrc CHECK (onrc_number IS NULL OR onrc_number ~ '^J[0-9]{2}/[0-9]+/[0-9]{4}$'),
    CONSTRAINT valid_postal_code CHECK (postal_code ~ '^[0-9]{6}$')
);

-- Documents table for OCR processing
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
    document_type document_type NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    upload_status status_type NOT NULL DEFAULT 'pending',
    validation_status status_type NOT NULL DEFAULT 'under_review',
    ocr_status status_type NOT NULL DEFAULT 'pending',
    ocr_result_id UUID,
    uploaded_by UUID REFERENCES public.users(id) NOT NULL,
    validation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 10485760), -- 10MB limit
    CONSTRAINT valid_mime_type CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/jpg'))
);

-- OCR results table
CREATE TABLE public.ocr_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    raw_text TEXT NOT NULL,
    extracted_data JSONB NOT NULL DEFAULT '{}',
    overall_confidence DECIMAL(5,2) NOT NULL CHECK (overall_confidence >= 0 AND overall_confidence <= 100),
    field_confidences JSONB NOT NULL DEFAULT '{}',
    confidence_level confidence_level NOT NULL,
    processing_time INTEGER NOT NULL, -- milliseconds
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ocr_provider TEXT NOT NULL DEFAULT 'openai',
    model_version TEXT,
    errors JSONB DEFAULT '[]',
    warnings TEXT[] DEFAULT '{}',
    requires_review BOOLEAN NOT NULL DEFAULT false,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    manual_corrections JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Purchase targets table
CREATE TABLE public.purchase_targets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sales_agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    zone_id UUID REFERENCES public.zones(id) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2050),
    quarter INTEGER CHECK (quarter >= 1 AND quarter <= 4),
    month INTEGER CHECK (month >= 1 AND month <= 12),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_volume DECIMAL(15,2) NOT NULL CHECK (target_volume >= 0),
    target_value DECIMAL(15,2) NOT NULL CHECK (target_value >= 0),
    target_suppliers INTEGER NOT NULL CHECK (target_suppliers >= 0),
    target_market_share DECIMAL(5,2) CHECK (target_market_share >= 0 AND target_market_share <= 100),
    actual_volume DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (actual_volume >= 0),
    actual_value DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (actual_value >= 0),
    actual_suppliers INTEGER NOT NULL DEFAULT 0 CHECK (actual_suppliers >= 0),
    actual_market_share DECIMAL(5,2) DEFAULT 0 CHECK (actual_market_share >= 0 AND actual_market_share <= 100),
    volume_progress DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (volume_progress >= 0),
    value_progress DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (value_progress >= 0),
    supplier_progress DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (supplier_progress >= 0),
    overall_progress DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (overall_progress >= 0),
    status target_status NOT NULL DEFAULT 'draft',
    priority priority_level NOT NULL DEFAULT 'medium',
    auto_calculate BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Sales offers table
CREATE TABLE public.sales_offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
    grain_type TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    price_per_ton DECIMAL(10,2) NOT NULL CHECK (price_per_ton > 0),
    total_value DECIMAL(15,2) NOT NULL CHECK (total_value > 0),
    quality_specifications JSONB,
    delivery_location TEXT NOT NULL,
    delivery_date DATE NOT NULL,
    offer_status status_type NOT NULL DEFAULT 'draft',
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT valid_future_delivery CHECK (delivery_date >= CURRENT_DATE),
    CONSTRAINT valid_offer_expiry CHECK (valid_until > created_at)
);

-- Input purchase requests table
CREATE TABLE public.input_purchase_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE CASCADE NOT NULL,
    input_type TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    price_per_unit DECIMAL(10,2) NOT NULL CHECK (price_per_unit > 0),
    total_value DECIMAL(15,2) NOT NULL CHECK (total_value > 0),
    specifications JSONB,
    delivery_location TEXT NOT NULL,
    requested_delivery_date DATE NOT NULL,
    request_status status_type NOT NULL DEFAULT 'draft',
    priority priority_level NOT NULL DEFAULT 'medium',
    notes TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT valid_future_delivery CHECK (requested_delivery_date >= CURRENT_DATE)
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_language ON public.users(language_preference);
CREATE INDEX idx_zones_counties ON public.zones USING GIN(counties);
CREATE INDEX idx_zones_assigned_agents ON public.zones USING GIN(assigned_agents);
CREATE INDEX idx_supplier_profiles_user_id ON public.supplier_profiles(user_id);
CREATE INDEX idx_supplier_profiles_assigned_zone ON public.supplier_profiles(assigned_zone);
CREATE INDEX idx_supplier_profiles_registration_status ON public.supplier_profiles(registration_status);
CREATE INDEX idx_supplier_profiles_validation_status ON public.supplier_profiles(validation_status);
CREATE INDEX idx_supplier_profiles_county ON public.supplier_profiles(county);
CREATE INDEX idx_supplier_profiles_grain_types ON public.supplier_profiles USING GIN(grain_types);
CREATE INDEX idx_documents_supplier_id ON public.documents(supplier_id);
CREATE INDEX idx_documents_document_type ON public.documents(document_type);
CREATE INDEX idx_documents_upload_status ON public.documents(upload_status);
CREATE INDEX idx_documents_ocr_status ON public.documents(ocr_status);
CREATE INDEX idx_ocr_results_document_id ON public.ocr_results(document_id);
CREATE INDEX idx_ocr_results_confidence_level ON public.ocr_results(confidence_level);
CREATE INDEX idx_purchase_targets_agent_zone ON public.purchase_targets(sales_agent_id, zone_id);
CREATE INDEX idx_purchase_targets_status ON public.purchase_targets(status);
CREATE INDEX idx_purchase_targets_year_quarter ON public.purchase_targets(year, quarter);
CREATE INDEX idx_sales_offers_supplier_id ON public.sales_offers(supplier_id);
CREATE INDEX idx_sales_offers_status ON public.sales_offers(offer_status);
CREATE INDEX idx_sales_offers_grain_type ON public.sales_offers(grain_type);
CREATE INDEX idx_input_requests_supplier_id ON public.input_purchase_requests(supplier_id);
CREATE INDEX idx_input_requests_status ON public.input_purchase_requests(request_status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON public.zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_profiles_updated_at BEFORE UPDATE ON public.supplier_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ocr_results_updated_at BEFORE UPDATE ON public.ocr_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_targets_updated_at BEFORE UPDATE ON public.purchase_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_offers_updated_at BEFORE UPDATE ON public.sales_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_input_requests_updated_at BEFORE UPDATE ON public.input_purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.input_purchase_requests ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can access their own data)
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Suppliers can view own profile" ON public.supplier_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Suppliers can update own profile" ON public.supplier_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Agents can view assigned suppliers" ON public.supplier_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'sales_agent')
);

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.supplier_profiles WHERE supplier_profiles.id = documents.supplier_id AND supplier_profiles.user_id = auth.uid())
);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policy for documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert sample data for Romanian zones
INSERT INTO public.zones (code, name, description, counties, market_potential, historical_volume, average_price) VALUES
('BH-01', 'Bihor Nord', 'Northern Bihor agricultural zone', '{"BH"}', 25000, 18500, 1250),
('CJ-01', 'Cluj Central', 'Central Cluj agricultural zone', '{"CJ"}', 35000, 28000, 1320),
('TM-01', 'Timiș Vest', 'Western Timiș agricultural zone', '{"TM"}', 45000, 38000, 1280),
('AR-01', 'Arad Sud', 'Southern Arad agricultural zone', '{"AR"}', 30000, 25000, 1300),
('HD-01', 'Hunedoara Est', 'Eastern Hunedoara zone', '{"HD"}', 20000, 15000, 1200);

-- Insert sample grain types configuration
INSERT INTO public.zones (code, name, counties) VALUES
('GRAIN_TYPES', 'Supported Grain Types', '{}');

-- Function to calculate target progress
CREATE OR REPLACE FUNCTION calculate_target_progress(target_id UUID)
RETURNS VOID AS $$
DECLARE
    target_record RECORD;
    vol_progress DECIMAL(5,2);
    val_progress DECIMAL(5,2);
    sup_progress DECIMAL(5,2);
    overall_progress DECIMAL(5,2);
BEGIN
    SELECT * INTO target_record FROM public.purchase_targets WHERE id = target_id;

    IF target_record IS NULL THEN
        RETURN;
    END IF;

    -- Calculate progress percentages
    vol_progress := CASE
        WHEN target_record.target_volume > 0 THEN
            LEAST(100, (target_record.actual_volume / target_record.target_volume) * 100)
        ELSE 0
    END;

    val_progress := CASE
        WHEN target_record.target_value > 0 THEN
            LEAST(100, (target_record.actual_value / target_record.target_value) * 100)
        ELSE 0
    END;

    sup_progress := CASE
        WHEN target_record.target_suppliers > 0 THEN
            LEAST(100, (target_record.actual_suppliers::DECIMAL / target_record.target_suppliers) * 100)
        ELSE 0
    END;

    overall_progress := (vol_progress + val_progress + sup_progress) / 3;

    -- Update the target with calculated progress
    UPDATE public.purchase_targets
    SET
        volume_progress = vol_progress,
        value_progress = val_progress,
        supplier_progress = sup_progress,
        overall_progress = overall_progress,
        status = CASE
            WHEN overall_progress >= 100 THEN 'exceeded'
            WHEN overall_progress >= 90 THEN 'on_track'
            WHEN overall_progress >= 70 THEN 'at_risk'
            ELSE 'behind'
        END
    WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;