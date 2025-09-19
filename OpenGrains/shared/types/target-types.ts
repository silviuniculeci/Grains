/**
 * Target Management Types for OpenGrains
 * Defines types for sales targets, zones, and performance tracking
 */

import { RomanianCountyCode } from './romanian-documents'

/**
 * Sales zone definition for Romania
 */
export interface Zone {
  id: string
  code: string                    // Zone code (e.g., "BH-01", "CJ-02")
  name: string
  description?: string

  // Geographic coverage
  counties: RomanianCountyCode[]  // Romanian counties covered
  cities?: string[]               // Major cities in the zone
  regions?: string[]              // Agricultural regions

  // Market characteristics
  marketPotential: number         // Estimated market size (tons/year)
  historicalVolume: number        // Historical volume traded
  averagePrice: number            // Average price per ton (RON)
  seasonalFactors: SeasonalFactor[]

  // Current status
  activeSuppliers: number
  totalSuppliers: number
  lastUpdated: Date

  // Zone management
  assignedAgents: string[]        // Agent IDs assigned to this zone
  primaryAgent?: string           // Primary agent ID
  coverage: number                // 0-100% coverage rate

  // Performance metrics
  performanceRating: number       // 1-5 rating
  competitiveness: 'low' | 'medium' | 'high'
  growthPotential: 'low' | 'medium' | 'high'
}

/**
 * Seasonal factors affecting grain trading
 */
export interface SeasonalFactor {
  month: number                   // 1-12
  factor: number                  // Multiplier (e.g., 1.2 = 20% increase)
  grainTypes: string[]            // Which grains are affected
  reason: string                  // Explanation for the factor
}

/**
 * Sales target definition
 */
export interface PurchaseTarget {
  id: string
  name: string
  description?: string

  // Target assignment
  salesAgentId: string
  zoneId: string

  // Time period
  year: number
  quarter?: number                // 1-4 for quarterly targets
  month?: number                  // 1-12 for monthly targets
  startDate: Date
  endDate: Date

  // Target metrics
  targetVolume: number            // Target volume in tons
  targetValue: number             // Target value in RON
  targetSuppliers: number         // Target number of suppliers
  targetMarketShare?: number      // Target market share percentage

  // Grain-specific targets
  grainTargets: GrainTarget[]

  // Current progress
  actualVolume: number
  actualValue: number
  actualSuppliers: number
  actualMarketShare?: number

  // Calculated metrics
  volumeProgress: number          // 0-100%
  valueProgress: number           // 0-100%
  supplierProgress: number        // 0-100%
  overallProgress: number         // 0-100%

  // Status and flags
  status: TargetStatus
  priority: 'low' | 'medium' | 'high' | 'critical'
  autoCalculate: boolean          // Whether to auto-update progress

  // Metadata
  createdAt: Date
  createdBy: string
  lastUpdated: Date
  updatedBy: string

  // Notes and comments
  notes?: string
  milestones: TargetMilestone[]
}

/**
 * Grain-specific target details
 */
export interface GrainTarget {
  grainType: string               // wheat, corn, etc.
  targetVolume: number            // tons
  targetValue: number             // RON
  currentVolume: number           // tons achieved
  currentValue: number            // RON achieved
  averagePrice: number            // RON per ton
  qualityRequirements?: string[]  // Quality specifications
  seasonalPeaks: number[]         // Months when this grain is most active
}

/**
 * Target status enumeration
 */
export type TargetStatus =
  | 'draft'                       // Target being created
  | 'active'                      // Currently active target
  | 'on_track'                    // On track to meet target
  | 'at_risk'                     // At risk of missing target
  | 'behind'                      // Behind schedule
  | 'exceeded'                    // Target exceeded
  | 'completed'                   // Target period completed
  | 'cancelled'                   // Target cancelled
  | 'suspended'                   // Temporarily suspended

/**
 * Target milestone for tracking progress
 */
export interface TargetMilestone {
  id: string
  title: string
  description?: string
  targetDate: Date
  achievedDate?: Date
  status: 'pending' | 'achieved' | 'missed' | 'cancelled'

  // Milestone metrics
  volumeTarget?: number
  valueTarget?: number
  supplierTarget?: number

  // Progress at milestone
  actualVolume?: number
  actualValue?: number
  actualSuppliers?: number

  notes?: string
}

/**
 * Target performance metrics
 */
export interface TargetPerformance {
  targetId: string
  period: {
    startDate: Date
    endDate: Date
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  }

  // Volume metrics
  volumeMetrics: {
    target: number
    actual: number
    variance: number              // actual - target
    variancePercent: number       // (actual - target) / target * 100
    trend: 'improving' | 'stable' | 'declining'
  }

  // Value metrics
  valueMetrics: {
    target: number
    actual: number
    variance: number
    variancePercent: number
    averagePrice: number          // RON per ton
    trend: 'improving' | 'stable' | 'declining'
  }

  // Supplier metrics
  supplierMetrics: {
    target: number
    actual: number
    variance: number
    variancePercent: number
    newSuppliers: number          // New suppliers added this period
    activeSuppliers: number       // Currently active suppliers
    retentionRate: number         // % of suppliers retained
  }

  // Quality metrics
  qualityMetrics: {
    averageQuality: number        // 1-5 rating
    rejectionRate: number         // % of offers rejected
    complianceRate: number        // % meeting requirements
  }

  // Market metrics
  marketMetrics: {
    marketShare: number           // % of local market
    competitorActivity: 'low' | 'medium' | 'high'
    priceCompetitiveness: number  // vs market average
  }

  // Efficiency metrics
  efficiencyMetrics: {
    costPerTon: number            // RON per ton
    timeToComplete: number        // days from offer to contract
    conversionRate: number        // % of inquiries that become contracts
  }

  // Calculated scores
  overallScore: number            // 0-100 composite score
  ranking?: number                // Rank among all targets
  benchmarkComparison: {
    vsLastPeriod: number          // % change vs last period
    vsLastYear: number            // % change vs same period last year
    vsTeamAverage: number         // % vs team average
  }
}

/**
 * Target calculation configuration
 */
export interface TargetCalculationConfig {
  zoneId: string

  // Historical data weighting
  historicalWeight: number        // 0-1, weight of historical data
  historicalPeriods: number       // Number of periods to consider

  // Market factors
  marketGrowthRate: number        // Expected market growth %
  seasonalAdjustment: boolean     // Apply seasonal adjustments
  competitionFactor: number       // Adjustment for competition

  // Agent factors
  agentExperience: number         // 0-1, agent experience factor
  agentCapacity: number           // 0-1, agent capacity factor
  agentPerformance: number        // 0-1, historical performance factor

  // Grain-specific factors
  grainMix: Record<string, number> // Expected grain type distribution
  qualityPremiums: Record<string, number> // Quality premium factors

  // Economic factors
  priceInflation: number          // Expected price inflation %
  economicConditions: 'poor' | 'fair' | 'good' | 'excellent'
  currencyStability: number       // 0-1, RON stability factor

  // Calculation mode
  calculationMode: 'conservative' | 'realistic' | 'optimistic'
  confidenceLevel: number         // 0-100, confidence in calculations

  // Update frequency
  autoUpdate: boolean
  updateFrequency: 'daily' | 'weekly' | 'monthly'
  lastCalculated: Date
}

/**
 * Target dashboard summary
 */
export interface TargetDashboardSummary {
  agentId: string
  period: {
    startDate: Date
    endDate: Date
    type: 'current' | 'quarter' | 'year'
  }

  // Overall metrics
  totalTargets: number
  activeTargets: number
  completedTargets: number
  overallProgress: number         // 0-100%

  // Status breakdown
  statusBreakdown: Record<TargetStatus, number>

  // Performance summary
  totalVolumeTarget: number
  totalVolumeActual: number
  totalValueTarget: number
  totalValueActual: number
  totalSupplierTarget: number
  totalSupplierActual: number

  // Zone performance
  zonePerformance: Array<{
    zoneId: string
    zoneName: string
    progress: number
    status: TargetStatus
    rank: number
  }>

  // Recent activity
  recentMilestones: TargetMilestone[]
  upcomingDeadlines: Array<{
    targetId: string
    targetName: string
    deadline: Date
    daysRemaining: number
    progress: number
  }>

  // Alerts and notifications
  alerts: Array<{
    type: 'target_at_risk' | 'deadline_approaching' | 'target_exceeded' | 'milestone_missed'
    targetId: string
    message: string
    severity: 'info' | 'warning' | 'error'
    createdAt: Date
  }>

  // Trends
  trends: {
    volumeTrend: 'up' | 'down' | 'stable'
    valueTrend: 'up' | 'down' | 'stable'
    supplierTrend: 'up' | 'down' | 'stable'
    overallTrend: 'up' | 'down' | 'stable'
  }
}

/**
 * Target comparison and benchmarking
 */
export interface TargetBenchmark {
  targetId: string
  benchmarkType: 'agent' | 'zone' | 'company' | 'industry'

  comparisons: Array<{
    metric: string
    value: number
    benchmark: number
    variance: number
    percentile: number            // 0-100, where this target ranks
    rank: number                  // Absolute rank
    total: number                 // Total number being compared
  }>

  recommendations: Array<{
    area: string
    recommendation: string
    expectedImpact: 'low' | 'medium' | 'high'
    effort: 'low' | 'medium' | 'high'
    priority: number              // 1-10
  }>

  bestPractices: Array<{
    practice: string
    description: string
    successRate: number           // % success rate
    avgImprovement: number        // % average improvement
  }>
}