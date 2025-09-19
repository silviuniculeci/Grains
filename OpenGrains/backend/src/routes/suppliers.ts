import { Router } from 'express'
import { z } from 'zod'
import supabaseAdmin from '../lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../../../shared/types/database'

const router = Router()

// Validation schemas
const createSupplierSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_type: z.enum(['PJ', 'PF']),
  contact_person: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  alternative_phone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
  postal_code: z.string().regex(/^[0-9]{6}$/, 'Postal code must be 6 digits'),
  country: z.string().default('Romania'),
  grain_types: z.array(z.string()).min(1, 'At least one grain type is required'),
  estimated_volume: z.number().positive().optional(),
  bank_account: z.string().regex(/^RO[0-9]{2}[A-Z]{4}[0-9A-Z]{16}$/, 'Invalid Romanian IBAN').optional(),
  cui: z.string().regex(/^(RO)?[0-9]{2,10}$/, 'Invalid Romanian CUI').optional(),
  onrc_number: z.string().regex(/^J[0-9]{2}\/[0-9]+\/[0-9]{4}$/, 'Invalid ONRC format').optional(),
  apia_id: z.string().optional(),
  language_preference: z.enum(['en', 'ro']).default('ro'),
})

const updateSupplierSchema = createSupplierSchema.partial()

// GET /api/suppliers - Get all suppliers (with pagination and filters)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string
    const county = req.query.county as string
    const grain_type = req.query.grain_type as string

    let query = supabaseAdmin
      .from('supplier_profiles')
      .select(`
        *,
        assigned_zone:zones(id, name, code),
        assigned_agent:users!supplier_profiles_assigned_agent_fkey(id, first_name, last_name, email)
      `)

    // Apply filters
    if (status) {
      query = query.eq('registration_status', status)
    }
    if (county) {
      query = query.eq('county', county)
    }
    if (grain_type) {
      query = query.contains('grain_types', [grain_type])
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: suppliers, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching suppliers:', error)
      return res.status(500).json({ error: 'Failed to fetch suppliers' })
    }

    res.json({
      suppliers,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error in GET /suppliers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/suppliers/:id - Get specific supplier
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: supplier, error } = await supabaseAdmin
      .from('supplier_profiles')
      .select(`
        *,
        assigned_zone:zones(id, name, code, counties),
        assigned_agent:users!supplier_profiles_assigned_agent_fkey(id, first_name, last_name, email),
        documents(id, document_type, filename, upload_status, validation_status, ocr_status, created_at)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Supplier not found' })
      }
      console.error('Error fetching supplier:', error)
      return res.status(500).json({ error: 'Failed to fetch supplier' })
    }

    res.json(supplier)
  } catch (error) {
    console.error('Error in GET /suppliers/:id:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/suppliers - Create new supplier
router.post('/', async (req, res) => {
  try {
    const validatedData = createSupplierSchema.parse(req.body)
    const userId = req.user?.id // Assumes auth middleware sets req.user

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Auto-assign to zone based on county
    const { data: zone } = await supabaseAdmin
      .from('zones')
      .select('id')
      .contains('counties', [validatedData.county])
      .single()

    const supplierData: TablesInsert<'supplier_profiles'> = {
      ...validatedData,
      user_id: userId,
      assigned_zone: zone?.id,
      registration_status: 'draft',
      validation_status: 'not_reviewed',
    }

    const { data: supplier, error } = await supabaseAdmin
      .from('supplier_profiles')
      .insert(supplierData)
      .select()
      .single()

    if (error) {
      console.error('Error creating supplier:', error)
      return res.status(500).json({ error: 'Failed to create supplier' })
    }

    res.status(201).json(supplier)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      })
    }
    console.error('Error in POST /suppliers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = updateSupplierSchema.parse(req.body)

    // Check if supplier exists and user has permission
    const { data: existingSupplier, error: fetchError } = await supabaseAdmin
      .from('supplier_profiles')
      .select('user_id, registration_status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Supplier not found' })
      }
      console.error('Error fetching supplier:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch supplier' })
    }

    // Auto-assign to zone if county changed
    let updateData: TablesUpdate<'supplier_profiles'> = validatedData

    if (validatedData.county) {
      const { data: zone } = await supabaseAdmin
        .from('zones')
        .select('id')
        .contains('counties', [validatedData.county])
        .single()

      updateData.assigned_zone = zone?.id
    }

    const { data: supplier, error } = await supabaseAdmin
      .from('supplier_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating supplier:', error)
      return res.status(500).json({ error: 'Failed to update supplier' })
    }

    res.json(supplier)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      })
    }
    console.error('Error in PUT /suppliers/:id:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/suppliers/:id/submit - Submit supplier for review
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params

    const { data: supplier, error } = await supabaseAdmin
      .from('supplier_profiles')
      .update({
        registration_status: 'submitted',
        validation_status: 'under_review',
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Supplier not found' })
      }
      console.error('Error submitting supplier:', error)
      return res.status(500).json({ error: 'Failed to submit supplier' })
    }

    res.json({ message: 'Supplier submitted for review', supplier })
  } catch (error) {
    console.error('Error in POST /suppliers/:id/submit:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/suppliers/:id/approve - Approve supplier (back office only)
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    const { data: supplier, error } = await supabaseAdmin
      .from('supplier_profiles')
      .update({
        registration_status: 'approved',
        validation_status: 'approved',
        approval_date: new Date().toISOString(),
        validation_notes: notes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Supplier not found' })
      }
      console.error('Error approving supplier:', error)
      return res.status(500).json({ error: 'Failed to approve supplier' })
    }

    // TODO: Update target calculations for assigned zone
    // TODO: Send notification to supplier

    res.json({ message: 'Supplier approved', supplier })
  } catch (error) {
    console.error('Error in POST /suppliers/:id/approve:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/suppliers/:id/reject - Reject supplier (back office only)
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    if (!notes) {
      return res.status(400).json({ error: 'Rejection notes are required' })
    }

    const { data: supplier, error } = await supabaseAdmin
      .from('supplier_profiles')
      .update({
        registration_status: 'rejected',
        validation_status: 'rejected',
        validation_notes: notes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Supplier not found' })
      }
      console.error('Error rejecting supplier:', error)
      return res.status(500).json({ error: 'Failed to reject supplier' })
    }

    // TODO: Send notification to supplier

    res.json({ message: 'Supplier rejected', supplier })
  } catch (error) {
    console.error('Error in POST /suppliers/:id/reject:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router