import type {
  SalesOffer,
  PurchaseRequest,
  TradingMatch,
  TradingMessage,
  TradingContract,
  TradingAnalytics,
  TradingFilters,
  TradingSearchResults,
  MarketData,
  GrainType,
  TradingStatus
} from '../../shared/types/trading-types'

export interface CreateSalesOfferRequest {
  grainType: GrainType
  grainQuality: string
  quantity: number
  pricePerTon?: number
  priceType: string
  availableFrom: Date
  availableUntil: Date
  location: {
    address: string
    city: string
    county: string
  }
  deliveryTerms: string
  paymentTerms: string
  description?: string
  specifications?: Array<{
    parameter: string
    value: number
    unit: string
  }>
}

export interface CreatePurchaseRequestRequest {
  grainType: GrainType
  grainQuality: string
  quantity: number
  maxPricePerTon?: number
  priceType: string
  requiredBy: Date
  deliveryLocation: {
    address: string
    city: string
    county: string
  }
  acceptedDeliveryTerms: string[]
  preferredPaymentTerms: string[]
  description?: string
  purpose: string
}

export class TradingService {
  private static baseUrl = '/api/trading'

  // ===== SALES OFFERS =====

  /**
   * Create a new sales offer
   */
  static async createSalesOffer(data: CreateSalesOfferRequest): Promise<SalesOffer> {
    try {
      const response = await fetch(`${this.baseUrl}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to create sales offer: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Create sales offer error:', error)
      throw new Error(`Failed to create sales offer: ${error.message}`)
    }
  }

  /**
   * Get my sales offers
   */
  static async getMySalesOffers(status?: TradingStatus): Promise<SalesOffer[]> {
    try {
      const queryParams = new URLSearchParams()
      if (status) queryParams.append('status', status)

      const url = queryParams.toString()
        ? `${this.baseUrl}/offers/my?${queryParams.toString()}`
        : `${this.baseUrl}/offers/my`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch my offers: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Get my sales offers error:', error)
      throw new Error(`Failed to fetch my sales offers: ${error.message}`)
    }
  }

  /**
   * Search sales offers
   */
  static async searchSalesOffers(
    filters?: TradingFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TradingSearchResults<SalesOffer>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('pageSize', pageSize.toString())

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v.toString()))
            } else if (typeof value === 'object') {
              queryParams.append(key, JSON.stringify(value))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`${this.baseUrl}/offers/search?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to search offers: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Search sales offers error:', error)
      throw new Error(`Failed to search sales offers: ${error.message}`)
    }
  }

  /**
   * Update a sales offer
   */
  static async updateSalesOffer(offerId: string, updates: Partial<CreateSalesOfferRequest>): Promise<SalesOffer> {
    try {
      const response = await fetch(`${this.baseUrl}/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`Failed to update offer: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Update sales offer error:', error)
      throw new Error(`Failed to update sales offer: ${error.message}`)
    }
  }

  /**
   * Delete a sales offer
   */
  static async deleteSalesOffer(offerId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/offers/${offerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete offer: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('Delete sales offer error:', error)
      throw new Error(`Failed to delete sales offer: ${error.message}`)
    }
  }

  // ===== PURCHASE REQUESTS =====

  /**
   * Create a new purchase request
   */
  static async createPurchaseRequest(data: CreatePurchaseRequestRequest): Promise<PurchaseRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to create purchase request: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Create purchase request error:', error)
      throw new Error(`Failed to create purchase request: ${error.message}`)
    }
  }

  /**
   * Get my purchase requests
   */
  static async getMyPurchaseRequests(status?: TradingStatus): Promise<PurchaseRequest[]> {
    try {
      const queryParams = new URLSearchParams()
      if (status) queryParams.append('status', status)

      const url = queryParams.toString()
        ? `${this.baseUrl}/requests/my?${queryParams.toString()}`
        : `${this.baseUrl}/requests/my`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch my requests: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Get my purchase requests error:', error)
      throw new Error(`Failed to fetch my purchase requests: ${error.message}`)
    }
  }

  /**
   * Search purchase requests
   */
  static async searchPurchaseRequests(
    filters?: TradingFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TradingSearchResults<PurchaseRequest>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('pageSize', pageSize.toString())

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v.toString()))
            } else if (typeof value === 'object') {
              queryParams.append(key, JSON.stringify(value))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`${this.baseUrl}/requests/search?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to search requests: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Search purchase requests error:', error)
      throw new Error(`Failed to search purchase requests: ${error.message}`)
    }
  }

  /**
   * Update a purchase request
   */
  static async updatePurchaseRequest(requestId: string, updates: Partial<CreatePurchaseRequestRequest>): Promise<PurchaseRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`Failed to update request: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Update purchase request error:', error)
      throw new Error(`Failed to update purchase request: ${error.message}`)
    }
  }

  /**
   * Delete a purchase request
   */
  static async deletePurchaseRequest(requestId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/requests/${requestId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete request: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('Delete purchase request error:', error)
      throw new Error(`Failed to delete purchase request: ${error.message}`)
    }
  }

  // ===== MATCHING AND COMMUNICATION =====

  /**
   * Get matches for my offers/requests
   */
  static async getMyMatches(): Promise<TradingMatch[]> {
    try {
      const response = await fetch(`${this.baseUrl}/matches/my`)

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Get my matches error:', error)
      throw new Error(`Failed to fetch my matches: ${error.message}`)
    }
  }

  /**
   * Send a message in a match
   */
  static async sendMessage(matchId: string, content: string, messageType: string = 'text'): Promise<TradingMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/matches/${matchId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          messageType
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Send message error:', error)
      throw new Error(`Failed to send message: ${error.message}`)
    }
  }

  /**
   * Get messages for a match
   */
  static async getMatchMessages(matchId: string): Promise<TradingMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/matches/${matchId}/messages`)

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Get match messages error:', error)
      throw new Error(`Failed to fetch match messages: ${error.message}`)
    }
  }

  // ===== ANALYTICS AND MARKET DATA =====

  /**
   * Get trading analytics
   */
  static async getTradingAnalytics(timeframe?: { start: Date; end: Date }): Promise<TradingAnalytics> {
    try {
      const queryParams = new URLSearchParams()
      if (timeframe) {
        queryParams.append('start', timeframe.start.toISOString())
        queryParams.append('end', timeframe.end.toISOString())
      }

      const url = queryParams.toString()
        ? `${this.baseUrl}/analytics?${queryParams.toString()}`
        : `${this.baseUrl}/analytics`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Get trading analytics error:', error)
      throw new Error(`Failed to fetch trading analytics: ${error.message}`)
    }
  }

  /**
   * Get market data for a grain type
   */
  static async getMarketData(grainType: GrainType, region?: string): Promise<MarketData> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('grainType', grainType)
      if (region) queryParams.append('region', region)

      const response = await fetch(`${this.baseUrl}/market-data?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Get market data error:', error)
      throw new Error(`Failed to fetch market data: ${error.message}`)
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get available grain types
   */
  static getGrainTypes() {
    return [
      { value: 'wheat', label: 'Grâu / Wheat', season: 'summer' },
      { value: 'corn', label: 'Porumb / Corn', season: 'autumn' },
      { value: 'barley', label: 'Orz / Barley', season: 'summer' },
      { value: 'oats', label: 'Ovăz / Oats', season: 'summer' },
      { value: 'rye', label: 'Secară / Rye', season: 'summer' },
      { value: 'sunflower', label: 'Floarea-soarelui / Sunflower', season: 'autumn' },
      { value: 'soybean', label: 'Soia / Soybean', season: 'autumn' },
      { value: 'rapeseed', label: 'Rapiță / Rapeseed', season: 'summer' },
      { value: 'other', label: 'Altele / Other', season: 'any' }
    ]
  }

  /**
   * Get quality standards
   */
  static getQualityStandards() {
    return [
      { value: 'premium', label: 'Premium', description: 'Cea mai înaltă calitate' },
      { value: 'standard', label: 'Standard', description: 'Calitate comercială standard' },
      { value: 'feed', label: 'Furajer', description: 'Pentru hrană animală' },
      { value: 'organic', label: 'Organic', description: 'Certificat organic' },
      { value: 'custom', label: 'Personalizat', description: 'Specificații personalizate' }
    ]
  }

  /**
   * Get delivery terms options
   */
  static getDeliveryTerms() {
    return [
      { value: 'ex_farm', label: 'Ex-fermă', description: 'Cumpărătorul ridică de la fermă' },
      { value: 'delivered', label: 'Livrat', description: 'Livrat la destinație' },
      { value: 'negotiable', label: 'Negociabil', description: 'Se stabilește prin negociere' }
    ]
  }

  /**
   * Get payment terms options
   */
  static getPaymentTerms() {
    return [
      { value: 'cash_on_delivery', label: 'Plata la livrare', description: 'Plata în numerar la livrare' },
      { value: 'prepaid', label: 'Plata în avans', description: 'Plata înainte de livrare' },
      { value: 'net_30', label: 'Net 30 zile', description: 'Plata în 30 de zile' },
      { value: 'net_60', label: 'Net 60 zile', description: 'Plata în 60 de zile' },
      { value: 'negotiable', label: 'Negociabil', description: 'Se stabilește prin negociere' }
    ]
  }

  /**
   * Format price display
   */
  static formatPrice(price: number, currency: string = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  /**
   * Format quantity display
   */
  static formatQuantity(quantity: number, unit: string = 't'): string {
    return `${quantity.toLocaleString('ro-RO')} ${unit}`
  }

  /**
   * Calculate total value
   */
  static calculateTotalValue(quantity: number, pricePerTon: number): number {
    return quantity * pricePerTon
  }

  /**
   * Get status display information
   */
  static getStatusInfo(status: TradingStatus) {
    const statusMap: Record<TradingStatus, { label: string; color: string; description: string }> = {
      'draft': { label: 'Ciornă', color: 'gray', description: 'În curs de completare' },
      'pending': { label: 'În așteptare', color: 'yellow', description: 'Așteaptă aprobare' },
      'active': { label: 'Activ', color: 'green', description: 'Publicat și disponibil' },
      'matched': { label: 'Potrivit', color: 'blue', description: 'Găsit partener potențial' },
      'negotiating': { label: 'Negociere', color: 'purple', description: 'În curs de negociere' },
      'accepted': { label: 'Acceptat', color: 'green', description: 'Termenii acceptați' },
      'contracted': { label: 'Contractat', color: 'blue', description: 'Contract semnat' },
      'delivered': { label: 'Livrat', color: 'teal', description: 'Marfa livrată' },
      'completed': { label: 'Finalizat', color: 'green', description: 'Tranzacție completă' },
      'cancelled': { label: 'Anulat', color: 'red', description: 'Anulat de utilizator' },
      'rejected': { label: 'Respins', color: 'red', description: 'Respins de administrator' },
      'expired': { label: 'Expirat', color: 'gray', description: 'A expirat termenul' }
    }

    return statusMap[status] || statusMap['draft']
  }
}