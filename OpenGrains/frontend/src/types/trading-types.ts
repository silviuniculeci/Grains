/**
 * Trading Types for OpenGrains - Sales Offers and Purchase Requests
 * Defines types for grain trading operations between suppliers and buyers
 */

/**
 * Grain quality standards
 */
export type GrainQuality = 'premium' | 'standard' | 'feed' | 'organic' | 'custom'

/**
 * Grain types supported by the platform
 */
export type GrainType =
  | 'wheat' | 'corn' | 'barley' | 'oats' | 'rye'
  | 'sunflower' | 'soybean' | 'rapeseed' | 'other'

/**
 * Offer/Request status
 */
export type TradingStatus =
  | 'draft'           // Being created
  | 'pending'         // Submitted, waiting for review
  | 'active'          // Published and available
  | 'matched'         // Matched with counterpart
  | 'negotiating'     // In negotiation phase
  | 'accepted'        // Terms accepted
  | 'contracted'      // Contract signed
  | 'delivered'       // Goods delivered
  | 'completed'       // Transaction completed
  | 'cancelled'       // Cancelled by user
  | 'rejected'        // Rejected by admin
  | 'expired'         // Expired due to time

/**
 * Price types
 */
export type PriceType =
  | 'fixed'           // Fixed price per ton
  | 'market'          // Market price at delivery
  | 'negotiable'      // To be negotiated

/**
 * Delivery terms
 */
export type DeliveryTerms =
  | 'ex_farm'         // Ex-farm (buyer collects)
  | 'delivered'       // Delivered to buyer
  | 'negotiable'      // To be negotiated

/**
 * Payment terms
 */
export type PaymentTerms =
  | 'cash_on_delivery' // COD
  | 'prepaid'         // Payment in advance
  | 'net_30'          // 30 days payment
  | 'net_60'          // 60 days payment
  | 'negotiable'      // To be negotiated

/**
 * Sales Offer - When suppliers offer grain for sale
 */
export interface SalesOffer {
  id: string
  supplierId: string
  supplierName: string

  // Grain details
  grainType: GrainType
  grainQuality: GrainQuality
  customQualitySpec?: string

  // Quantity and pricing
  quantity: number              // Tons
  minQuantity?: number          // Minimum order quantity
  priceType: PriceType
  pricePerTon?: number          // RON per ton (if fixed)
  currency: 'RON' | 'EUR' | 'USD'

  // Availability
  availableFrom: Date
  availableUntil: Date
  harvestYear: number

  // Location and logistics
  location: {
    address: string
    city: string
    county: string
    coordinates?: { lat: number; lng: number }
  }
  deliveryTerms: DeliveryTerms
  deliveryRadius?: number       // km radius for delivery

  // Commercial terms
  paymentTerms: PaymentTerms
  contractTerms?: string

  // Additional info
  description?: string
  specifications: GrainSpecification[]
  photos: string[]              // URLs to grain photos
  certificates: string[]        // URLs to quality certificates

  // Status and metadata
  status: TradingStatus
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  expiresAt: Date

  // Analytics
  viewCount: number
  inquiryCount: number

  // Internal flags
  featured: boolean
  verified: boolean
  requiresApproval: boolean
}

/**
 * Purchase Request - When buyers request specific grain
 */
export interface PurchaseRequest {
  id: string
  buyerId: string               // Can be supplier buying from others
  buyerName: string

  // Grain requirements
  grainType: GrainType
  grainQuality: GrainQuality
  customQualitySpec?: string
  requiredSpecifications: GrainSpecification[]

  // Quantity and pricing
  quantity: number              // Tons required
  maxQuantity?: number          // Maximum quantity accepted
  priceType: PriceType
  maxPricePerTon?: number       // Maximum willing to pay
  budget?: number               // Total budget
  currency: 'RON' | 'EUR' | 'USD'

  // Timeline
  requiredBy: Date              // When needed
  flexible: boolean             // Timeline flexibility

  // Location and logistics
  deliveryLocation: {
    address: string
    city: string
    county: string
    coordinates?: { lat: number; lng: number }
  }
  acceptedDeliveryTerms: DeliveryTerms[]
  maxDeliveryDistance?: number  // km

  // Commercial preferences
  preferredPaymentTerms: PaymentTerms[]
  contractRequirements?: string

  // Additional info
  description?: string
  purpose: 'resale' | 'processing' | 'animal_feed' | 'storage' | 'other'

  // Status and metadata
  status: TradingStatus
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  expiresAt: Date

  // Matching
  matchedOffers: string[]       // IDs of matched offers

  // Analytics
  viewCount: number
  responseCount: number

  // Internal flags
  urgent: boolean
  verified: boolean
  requiresApproval: boolean
}

/**
 * Grain specifications and quality parameters
 */
export interface GrainSpecification {
  parameter: string             // e.g., 'moisture', 'protein', 'test_weight'
  value: number
  unit: string                  // e.g., '%', 'kg/hl'
  tolerance?: number            // Acceptable deviation
  required: boolean
  testMethod?: string           // Testing standard used
}

/**
 * Match between offer and request
 */
export interface TradingMatch {
  id: string
  offerId: string
  requestId: string

  // Match quality
  matchScore: number            // 0-100 compatibility score
  matchReasons: string[]        // Why they match
  concerns: string[]            // Potential issues

  // Participants
  sellerId: string
  buyerId: string

  // Proposed terms
  proposedQuantity: number
  proposedPrice?: number
  proposedDelivery?: Date
  proposedLocation?: string

  // Status
  status: 'suggested' | 'viewed' | 'contacted' | 'negotiating' | 'agreed' | 'declined'

  // Communication
  messages: TradingMessage[]

  // Timestamps
  createdAt: Date
  lastActivity: Date
  expiresAt: Date
}

/**
 * Messages within a trading match
 */
export interface TradingMessage {
  id: string
  matchId: string
  senderId: string
  senderName: string
  senderRole: 'seller' | 'buyer'

  messageType: 'text' | 'offer' | 'counteroffer' | 'acceptance' | 'rejection' | 'question'
  content: string

  // Offer details (if messageType is offer/counteroffer)
  offerDetails?: {
    quantity: number
    pricePerTon: number
    deliveryDate: Date
    deliveryTerms: DeliveryTerms
    paymentTerms: PaymentTerms
    validUntil: Date
  }

  attachments: string[]         // URLs to documents/photos

  // Status
  read: boolean
  readAt?: Date

  // Timestamps
  sentAt: Date
}

/**
 * Trading contract
 */
export interface TradingContract {
  id: string
  matchId: string
  offerId: string
  requestId: string

  // Parties
  seller: {
    id: string
    name: string
    contact: string
    address: string
  }
  buyer: {
    id: string
    name: string
    contact: string
    address: string
  }

  // Agreed terms
  grainType: GrainType
  quality: GrainQuality
  specifications: GrainSpecification[]
  quantity: number
  pricePerTon: number
  totalValue: number
  currency: 'RON' | 'EUR' | 'USD'

  // Delivery
  deliveryDate: Date
  deliveryLocation: string
  deliveryTerms: DeliveryTerms

  // Payment
  paymentTerms: PaymentTerms
  paymentDueDate: Date

  // Contract details
  contractTerms: string
  qualityTolerances: GrainSpecification[]
  penalties: ContractPenalty[]

  // Status tracking
  status: 'draft' | 'pending_signatures' | 'active' | 'fulfilled' | 'breached' | 'cancelled'

  // Signatures
  sellerSigned: boolean
  sellerSignedAt?: Date
  buyerSigned: boolean
  buyerSignedAt?: Date

  // Documents
  contractDocument?: string     // URL to PDF contract
  qualityCertificates: string[]
  deliveryReceipts: string[]
  invoices: string[]

  // Timestamps
  createdAt: Date
  signedAt?: Date
  deliveredAt?: Date
  completedAt?: Date
}

/**
 * Contract penalties and clauses
 */
export interface ContractPenalty {
  condition: string             // When penalty applies
  penaltyType: 'percentage' | 'fixed' | 'price_reduction'
  amount: number
  description: string
}

/**
 * Trading analytics and insights
 */
export interface TradingAnalytics {
  timeframe: {
    start: Date
    end: Date
  }

  // Market data
  averagePrices: Record<GrainType, {
    price: number
    currency: string
    sampleSize: number
    trend: 'up' | 'down' | 'stable'
  }>

  // Volume data
  totalVolume: Record<GrainType, number>
  tradingActivity: {
    offersCreated: number
    requestsCreated: number
    matchesMade: number
    contractsSigned: number
    volumeTraded: number
  }

  // User performance
  userStats: {
    activeOffers: number
    activeRequests: number
    completedTrades: number
    averageResponseTime: number
    successRate: number
    rating: number
  }

  // Regional data
  regionalActivity: Record<string, {
    offers: number
    requests: number
    averagePrice: Record<GrainType, number>
  }>
}

/**
 * Trading filters for search and discovery
 */
export interface TradingFilters {
  grainType?: GrainType[]
  quality?: GrainQuality[]
  priceRange?: { min: number; max: number }
  quantityRange?: { min: number; max: number }
  location?: {
    counties: string[]
    radius?: number
    centerPoint?: { lat: number; lng: number }
  }
  deliveryTerms?: DeliveryTerms[]
  paymentTerms?: PaymentTerms[]
  availabilityDate?: { from: Date; to: Date }
  harvestYear?: number[]
  verified?: boolean
  featured?: boolean
}

/**
 * Search results for trading
 */
export interface TradingSearchResults<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
  filters: TradingFilters
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

/**
 * Real-time market data
 */
export interface MarketData {
  grainType: GrainType
  region: string

  // Current market
  currentPrice: number
  currency: string
  lastUpdated: Date

  // Price history
  priceHistory: Array<{
    date: Date
    price: number
    volume?: number
  }>

  // Market indicators
  trend: 'bullish' | 'bearish' | 'stable'
  volatility: number
  supply: 'low' | 'normal' | 'high'
  demand: 'low' | 'normal' | 'high'

  // News and factors
  marketNews: string[]
  priceFactors: string[]
}