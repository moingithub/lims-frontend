// Unified Analysis Pricing Service - Handles CRUD operations, search, validation, pricing calculations, and helper methods
import { API_BASE_URL } from "../config/api";
import { authService } from "./authService";

export interface AnalysisPrice {
  id: number;
  analysis_code: string;
  analysis_name: string;
  description: string;
  price: number;
  standard_rate: number;
  rushed_rate: number;
  sample_fee?: number;
  active: boolean;
  created_by: number;
}

type ApiAnalysisPrice = {
  id: number;
  analysis_type: string;
  description: string;
  standard_rate: string | number;
  rushed_rate: string | number;
  sample_fee: string | number | null;
  active: boolean;
  created_by_id: number | null;
};

let analysisCache: AnalysisPrice[] = [];
let analysisLoaded = false;

const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === "") return 0;
  return typeof value === "number" ? value : parseFloat(value);
};

const mapApiAnalysis = (analysis: ApiAnalysisPrice): AnalysisPrice => {
  const standardRate = toNumber(analysis.standard_rate);
  const rushedRate = toNumber(analysis.rushed_rate);
  const sampleFee =
    analysis.sample_fee === null ? undefined : toNumber(analysis.sample_fee);
  return {
    id: analysis.id,
    analysis_code: analysis.analysis_type,
    analysis_name: analysis.analysis_type,
    description: analysis.description,
    price: standardRate,
    standard_rate: standardRate,
    rushed_rate: rushedRate,
    sample_fee: sampleFee,
    active: analysis.active,
    created_by: analysis.created_by_id ?? 0,
  };
};

const buildAuthHeaders = (): HeadersInit => {
  const token = authService.getAuthState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const analysisPricingService = {
  // ========== CRUD Operations ==========

  // Get all analysis prices
  getAnalysisPrices: (): AnalysisPrice[] => {
    return analysisCache;
  },

  // Fetch analysis prices from API (cached)
  fetchAnalysisPrices: async (force = false): Promise<AnalysisPrice[]> => {
    if (analysisLoaded && !force) return analysisCache;

    const response = await fetch(`${API_BASE_URL}/analysis_pricing`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to load analysis pricing";
      throw new Error(message);
    }

    const data: ApiAnalysisPrice[] = await response.json();
    analysisCache = Array.isArray(data) ? data.map(mapApiAnalysis) : [];
    analysisLoaded = true;
    return analysisCache;
  },

  // Replace cached analysis prices (local updates)
  setAnalysisPrices: (prices: AnalysisPrice[]): void => {
    analysisCache = prices;
    analysisLoaded = true;
  },

  // Add a new analysis price
  addAnalysisPrice: async (
    analysisPrice: Omit<AnalysisPrice, "id" | "created_by">,
  ): Promise<AnalysisPrice> => {
    const response = await fetch(`${API_BASE_URL}/analysis_pricing`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        analysis_type: analysisPrice.analysis_code,
        description: analysisPrice.description,
        standard_rate: analysisPrice.standard_rate.toString(),
        rushed_rate: analysisPrice.rushed_rate.toString(),
        sample_fee: analysisPrice.sample_fee?.toString() ?? "0",
        active: analysisPrice.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to create analysis pricing";
      throw new Error(message);
    }

    const data: ApiAnalysisPrice = await response.json();
    const created = mapApiAnalysis(data);
    analysisCache = [...analysisCache, created];
    analysisLoaded = true;
    return created;
  },

  // Update an existing analysis price
  updateAnalysisPrice: async (
    id: number,
    updatedAnalysisPrice: Omit<AnalysisPrice, "created_by">,
  ): Promise<AnalysisPrice> => {
    const response = await fetch(`${API_BASE_URL}/analysis_pricing/${id}`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        description: updatedAnalysisPrice.description,
        standard_rate: updatedAnalysisPrice.standard_rate.toString(),
        rushed_rate: updatedAnalysisPrice.rushed_rate.toString(),
        sample_fee: updatedAnalysisPrice.sample_fee?.toString() ?? "0",
        active: updatedAnalysisPrice.active,
      }),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to update analysis pricing";
      throw new Error(message);
    }

    const data: ApiAnalysisPrice = await response.json();
    const saved = mapApiAnalysis(data);
    analysisCache = analysisCache.map((analysis) =>
      analysis.id === id ? saved : analysis,
    );
    analysisLoaded = true;
    return saved;
  },

  // Delete an analysis price
  deleteAnalysisPrice: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/analysis_pricing/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      const message =
        response.status === 401
          ? "Unauthorized"
          : "Failed to delete analysis pricing";
      throw new Error(message);
    }

    analysisCache = analysisCache.filter((analysis) => analysis.id !== id);
    analysisLoaded = true;
  },

  // Search analysis prices by code or description
  searchAnalysisPrices: (
    analysisPrices: AnalysisPrice[],
    searchTerm: string,
  ): AnalysisPrice[] => {
    return analysisPrices.filter(
      (price) =>
        price.analysis_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  },

  // Validate analysis price data
  validateAnalysisPrice: (
    analysisPrice: Partial<AnalysisPrice>,
  ): { valid: boolean; error?: string } => {
    if (
      !analysisPrice.analysis_code ||
      analysisPrice.analysis_code.trim() === ""
    ) {
      return { valid: false, error: "Analysis code is required" };
    }
    if (!analysisPrice.description || analysisPrice.description.trim() === "") {
      return { valid: false, error: "Description is required" };
    }
    if (
      analysisPrice.standard_rate === undefined ||
      analysisPrice.standard_rate < 0
    ) {
      return { valid: false, error: "Valid standard rate is required" };
    }
    if (
      analysisPrice.rushed_rate === undefined ||
      analysisPrice.rushed_rate < 0
    ) {
      return { valid: false, error: "Valid rushed rate is required" };
    }
    return { valid: true };
  },

  // ========== Helper Methods ==========

  // Get a single analysis price by ID
  getAnalysisPriceById: (id: number): AnalysisPrice | undefined => {
    return analysisCache.find((price) => price.id === id);
  },

  // Get a single analysis price by code
  getAnalysisPriceByCode: (analysisCode: string): AnalysisPrice | undefined => {
    return analysisCache.find((price) => price.analysis_code === analysisCode);
  },

  // Check if an analysis code exists
  analysisCodeExists: (analysisCode: string): boolean => {
    return analysisCache.some((price) => price.analysis_code === analysisCode);
  },

  // Get active analysis prices only
  getActiveAnalysisPrices: (): AnalysisPrice[] => {
    return analysisCache.filter((price) => price.active);
  },

  // Get inactive analysis prices only
  getInactiveAnalysisPrices: (): AnalysisPrice[] => {
    return analysisCache.filter((price) => !price.active);
  },

  // Count active analysis prices
  countActiveAnalysisPrices: (): number => {
    return analysisCache.filter((price) => price.active).length;
  },

  // Count inactive analysis prices
  countInactiveAnalysisPrices: (): number => {
    return analysisCache.filter((price) => !price.active).length;
  },

  // Get analysis codes only (for dropdowns)
  getAnalysisCodes: (): string[] => {
    return analysisCache.map((price) => price.analysis_code);
  },

  // Get active analysis codes only (for dropdowns)
  getActiveAnalysisCodes: (): string[] => {
    return analysisCache
      .filter((price) => price.active)
      .map((price) => price.analysis_code);
  },

  // Get analysis options for select components
  getAnalysisOptions: (): { value: string; label: string }[] => {
    return analysisCache.map((price) => ({
      value: price.analysis_code,
      label: `${price.analysis_code} - ${price.description}`,
    }));
  },

  // Get active analysis options for select components
  getActiveAnalysisOptions: (): { value: string; label: string }[] => {
    return analysisCache
      .filter((price) => price.active)
      .map((price) => ({
        value: price.analysis_code,
        label: price.analysis_code,
      }));
  },

  // Get analyses with sample fees
  getAnalysesWithSampleFees: (): AnalysisPrice[] => {
    return analysisCache.filter(
      (price) => price.sample_fee !== undefined && price.sample_fee > 0,
    );
  },

  // Get analyses without sample fees
  getAnalysesWithoutSampleFees: (): AnalysisPrice[] => {
    return analysisCache.filter(
      (price) => price.sample_fee === undefined || price.sample_fee === 0,
    );
  },

  // Get analyses by price range
  getAnalysesByPriceRange: (
    minPrice: number,
    maxPrice: number,
  ): AnalysisPrice[] => {
    return analysisCache.filter(
      (price) =>
        price.standard_rate >= minPrice && price.standard_rate <= maxPrice,
    );
  },

  // ========== Pricing Calculation Methods ==========

  // Calculate price based on rush status and volume discount
  calculatePrice: (
    analysisCode: string,
    isRushed: boolean,
    monthlyAnalysisCount: number = 0,
  ): number | null => {
    const analysis = analysisCache.find(
      (price) => price.analysis_code === analysisCode,
    );
    if (!analysis) return null;

    let price = isRushed ? analysis.rushed_rate : analysis.standard_rate;

    // Apply volume discount: 5% discount when monthly count >= 50
    if (monthlyAnalysisCount >= 50) {
      price = price * 0.95; // 5% discount
    }

    // Apply non-rushed discount: $5 off for non-rushed with 50+ monthly analyses
    if (!isRushed && monthlyAnalysisCount >= 50) {
      price = price - 5;
    }

    return price;
  },

  // Calculate total price including sample fee
  calculateTotalPrice: (
    analysisCode: string,
    isRushed: boolean,
    monthlyAnalysisCount: number = 0,
  ): number | null => {
    const analysis = analysisCache.find(
      (price) => price.analysis_code === analysisCode,
    );
    if (!analysis) return null;

    const basePrice = analysisPricingService.calculatePrice(
      analysisCode,
      isRushed,
      monthlyAnalysisCount,
    );
    if (basePrice === null) return null;

    const sampleFee = analysis.sample_fee || 0;
    return basePrice + sampleFee;
  },

  // Calculate discount amount
  calculateDiscount: (
    analysisCode: string,
    isRushed: boolean,
    monthlyAnalysisCount: number,
  ): number => {
    const analysis = analysisCache.find(
      (price) => price.analysis_code === analysisCode,
    );
    if (!analysis) return 0;

    const basePrice = isRushed ? analysis.rushed_rate : analysis.standard_rate;
    const discountedPrice = analysisPricingService.calculatePrice(
      analysisCode,
      isRushed,
      monthlyAnalysisCount,
    );

    if (discountedPrice === null) return 0;
    return basePrice - discountedPrice;
  },

  // Calculate total for multiple analyses
  calculateBulkTotal: (
    analyses: { code: string; isRushed: boolean }[],
    monthlyAnalysisCount: number = 0,
  ): number => {
    return analyses.reduce((total, analysis) => {
      const price = analysisPricingService.calculateTotalPrice(
        analysis.code,
        analysis.isRushed,
        monthlyAnalysisCount,
      );
      return total + (price || 0);
    }, 0);
  },

  // Get price breakdown for an analysis
  getPriceBreakdown: (
    analysisCode: string,
    isRushed: boolean,
    monthlyAnalysisCount: number = 0,
  ): {
    baseRate: number;
    sampleFee: number;
    discount: number;
    finalPrice: number;
    total: number;
  } | null => {
    const analysis = analysisCache.find(
      (price) => price.analysis_code === analysisCode,
    );
    if (!analysis) return null;

    const baseRate = isRushed ? analysis.rushed_rate : analysis.standard_rate;
    const sampleFee = analysis.sample_fee || 0;
    const discount = analysisPricingService.calculateDiscount(
      analysisCode,
      isRushed,
      monthlyAnalysisCount,
    );
    const finalPrice =
      analysisPricingService.calculatePrice(
        analysisCode,
        isRushed,
        monthlyAnalysisCount,
      ) || 0;
    const total = finalPrice + sampleFee;

    return {
      baseRate,
      sampleFee,
      discount,
      finalPrice,
      total,
    };
  },

  // ========== Statistics & Reporting Methods ==========

  // Get analysis pricing statistics
  getAnalysisPricingStatistics: (): {
    total: number;
    active: number;
    inactive: number;
    averageStandardRate: number;
    averageRushedRate: number;
    minStandardRate: number;
    maxStandardRate: number;
    totalWithSampleFees: number;
    totalWithoutSampleFees: number;
  } => {
    const standardRates = analysisCache.map((p) => p.standard_rate);
    const rushedRates = analysisCache.map((p) => p.rushed_rate);

    return {
      total: analysisCache.length,
      active: analysisCache.filter((p) => p.active).length,
      inactive: analysisCache.filter((p) => !p.active).length,
      averageStandardRate:
        standardRates.reduce((sum, rate) => sum + rate, 0) /
        standardRates.length,
      averageRushedRate:
        rushedRates.reduce((sum, rate) => sum + rate, 0) / rushedRates.length,
      minStandardRate: Math.min(...standardRates),
      maxStandardRate: Math.max(...standardRates),
      totalWithSampleFees: analysisCache.filter(
        (p) => p.sample_fee && p.sample_fee > 0,
      ).length,
      totalWithoutSampleFees: analysisCache.filter(
        (p) => !p.sample_fee || p.sample_fee === 0,
      ).length,
    };
  },

  // ========== UI Helper Methods ==========

  // Format currency
  formatCurrency: (amount: number | undefined): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "$0.00";
    }
    return `$${amount.toFixed(2)}`;
  },

  // Format analysis code with description
  formatAnalysisDisplay: (analysisCode: string): string => {
    const analysis = analysisCache.find(
      (price) => price.analysis_code === analysisCode,
    );
    return analysis
      ? `${analysis.analysis_code} - ${analysis.description}`
      : analysisCode;
  },

  // Get rush rate multiplier
  getRushRateMultiplier: (analysisCode: string): number => {
    const analysis = analysisCache.find(
      (price) => price.analysis_code === analysisCode,
    );
    if (!analysis) return 1.5; // default multiplier
    return analysis.rushed_rate / analysis.standard_rate;
  },
};
