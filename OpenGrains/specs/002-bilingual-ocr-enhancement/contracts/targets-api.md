# Target Management API Contracts

## GET /api/targets/zones

**Purpose**: Retrieve zone-based purchase targets and performance metrics

### Query Parameters
```typescript
interface ZoneTargetsQuery {
  agentId?: string          // Filter by specific agent
  year?: number            // Target year (default: current year)
  quarter?: number         // Optional quarterly view (1-4)
  includeMetrics?: boolean // Include performance calculations (default: true)
}
```

### Response - Success (200 OK)
```typescript
interface ZoneTargetsResponse {
  zones: Array<{
    zoneId: string
    zoneName: string
    zoneCode: string
    romanianCounty?: string

    // Target data
    targets: {
      targetVolume: number
      targetValue: number
      targetSuppliers: number
    }

    // Actual performance
    actual: {
      actualVolume: number
      actualValue: number
      actualSuppliers: number
    }

    // Calculated metrics
    performance: {
      volumeProgress: number    // Percentage (0-100+)
      valueProgress: number     // Percentage (0-100+)
      supplierProgress: number  // Percentage (0-100+)
      overallProgress: number   // Weighted average
      status: 'on_track' | 'at_risk' | 'exceeded' | 'missed'
    }

    // Historical context
    historical?: {
      lastYearActual: number
      seasonalTrend: number
      potentialEstimate: number
    }
  }>

  // Aggregated data
  totals: {
    totalTargetVolume: number
    totalActualVolume: number
    totalTargetValue: number
    totalActualValue: number
    overallPerformance: number
  }

  lastUpdated: Date
}
```

### Test Cases
```typescript
describe('GET /api/targets/zones', () => {
  it('should return zone targets for specific agent', async () => {
    const response = await api.get('/api/targets/zones?agentId=agent_123&year=2025')

    expect(response.status).toBe(200)
    expect(response.data.zones).toHaveLength(3)
    expect(response.data.zones[0]).toHaveProperty('targets')
    expect(response.data.zones[0]).toHaveProperty('actual')
    expect(response.data.zones[0]).toHaveProperty('performance')
    expect(response.data.totals.overallPerformance).toBeGreaterThanOrEqual(0)
  })

  it('should calculate correct performance percentages', async () => {
    const response = await api.get('/api/targets/zones?agentId=agent_124')

    const zone = response.data.zones[0]
    const expectedVolumeProgress = (zone.actual.actualVolume / zone.targets.targetVolume) * 100

    expect(zone.performance.volumeProgress).toBeCloseTo(expectedVolumeProgress, 1)
    expect(zone.performance.status).toMatch(/^(on_track|at_risk|exceeded|missed)$/)
  })
})
```

## POST /api/targets/update

**Purpose**: Update target metrics when suppliers are approved or performance changes

### Request
```typescript
interface TargetUpdateRequest {
  updateType: 'supplier_approved' | 'volume_adjusted' | 'manual_update'
  agentId: string
  zoneId: string

  // Updates based on type
  supplierApproved?: {
    supplierId: string
    estimatedVolume: number
    estimatedValue: number
  }

  volumeAdjustment?: {
    volumeChange: number
    valueChange: number
    reason: string
  }

  manualUpdate?: {
    newTargetVolume?: number
    newTargetValue?: number
    newTargetSuppliers?: number
    updateReason: string
  }
}
```

### Response - Success (200 OK)
```typescript
interface TargetUpdateResponse {
  targetId: string
  updatedAt: Date
  previousValues: {
    targetVolume: number
    targetValue: number
    actualVolume: number
    actualValue: number
    actualSuppliers: number
  }
  newValues: {
    targetVolume: number
    targetValue: number
    actualVolume: number
    actualValue: number
    actualSuppliers: number
  }
  performanceImpact: {
    previousProgress: number
    newProgress: number
    statusChange?: string
  }
}
```

### Test Cases
```typescript
describe('POST /api/targets/update', () => {
  it('should update targets when supplier is approved', async () => {
    const request: TargetUpdateRequest = {
      updateType: 'supplier_approved',
      agentId: 'agent_123',
      zoneId: 'zone_bh',
      supplierApproved: {
        supplierId: 'supplier_456',
        estimatedVolume: 100,
        estimatedValue: 50000
      }
    }

    const response = await api.post('/api/targets/update', request)

    expect(response.status).toBe(200)
    expect(response.data.newValues.actualSuppliers).toBe(
      response.data.previousValues.actualSuppliers + 1
    )
    expect(response.data.newValues.actualVolume).toBe(
      response.data.previousValues.actualVolume + 100
    )
  })

  it('should validate zone and agent relationship', async () => {
    const request: TargetUpdateRequest = {
      updateType: 'supplier_approved',
      agentId: 'agent_123',
      zoneId: 'zone_not_assigned',
      supplierApproved: {
        supplierId: 'supplier_456',
        estimatedVolume: 100,
        estimatedValue: 50000
      }
    }

    const response = await api.post('/api/targets/update', request)

    expect(response.status).toBe(400)
    expect(response.data.error).toBe('zone_not_assigned_to_agent')
  })
})
```

## GET /api/agents/{agentId}/dashboard

**Purpose**: Get comprehensive dashboard data for sales agent

### Response - Success (200 OK)
```typescript
interface AgentDashboardResponse {
  agentInfo: {
    agentId: string
    name: string
    assignedZones: Array<{
      zoneId: string
      zoneName: string
      zoneCode: string
    }>
    languagePreference: 'en' | 'ro'
  }

  // Current period performance
  currentPerformance: {
    period: string  // "2025-Q3"
    totalTargets: {
      volume: number
      value: number
      suppliers: number
    }
    totalActual: {
      volume: number
      value: number
      suppliers: number
    }
    progressPercentages: {
      volume: number
      value: number
      suppliers: number
      overall: number
    }
    ranking: {
      position: number
      totalAgents: number
      percentile: number
    }
  }

  // Zone breakdown
  zonePerformance: Array<{
    zoneId: string
    zoneName: string
    performance: {
      volume: { target: number, actual: number, progress: number }
      value: { target: number, actual: number, progress: number }
      suppliers: { target: number, actual: number, progress: number }
      status: 'on_track' | 'at_risk' | 'exceeded' | 'missed'
    }
    recentActivity: Array<{
      type: 'supplier_approved' | 'offer_received' | 'target_updated'
      description: string
      timestamp: Date
    }>
  }>

  // Recent achievements
  achievements: Array<{
    type: 'target_exceeded' | 'new_supplier' | 'milestone_reached'
    title: string
    description: string
    achievedAt: Date
  }>

  lastUpdated: Date
}
```

### Test Cases
```typescript
describe('GET /api/agents/{agentId}/dashboard', () => {
  it('should return complete dashboard for Romanian agent', async () => {
    const response = await api.get('/api/agents/agent_123/dashboard', {
      headers: { 'Accept-Language': 'ro' }
    })

    expect(response.status).toBe(200)
    expect(response.data.agentInfo.languagePreference).toBe('ro')
    expect(response.data.zonePerformance).toHaveLength(3)
    expect(response.data.currentPerformance.progressPercentages.overall).toBeGreaterThanOrEqual(0)
  })

  it('should include recent activity for all zones', async () => {
    const response = await api.get('/api/agents/agent_124/dashboard')

    expect(response.status).toBe(200)
    response.data.zonePerformance.forEach(zone => {
      expect(zone.recentActivity).toBeInstanceOf(Array)
      expect(zone.performance.status).toMatch(/^(on_track|at_risk|exceeded|missed)$/)
    })
  })
})
```