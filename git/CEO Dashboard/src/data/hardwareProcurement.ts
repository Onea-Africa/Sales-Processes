export type HardwareSupplier = 'ASBIS' | 'Nology' | 'Scoop' | 'MiRO' | 'Manual';

export type HardwareCategory =
  | 'Apple Procurement'
  | 'Notebook'
  | 'Desktop'
  | 'Networking'
  | 'VoIP'
  | 'CCTV'
  | 'UPS & Power'
  | 'Accessories';

export interface HardwareProduct {
  id: string;
  supplier: HardwareSupplier;
  sku: string;
  model: string;
  brand: string;
  category: HardwareCategory;
  description: string;
  stockLabel: string;
  dealerCost: number;
  suggestedMarginPercent: number;
  floorMarginPercent: number;
  setupFee: number;
  stock?: number;
  isInStock?: boolean;
  isOutOfBox?: boolean;
  itemKind?: 'device' | 'accessory';
  imageUrl?: string;
  complianceNote?: string;
  sourceNote: string;
}

export interface HardwareCartLine {
  productId: string;
  product?: HardwareProduct;
  quantity: number;
  marginPercent: number;
  includeSetup: boolean;
}

export const HARDWARE_CATEGORIES: Array<'All' | HardwareCategory> = [
  'All',
  'Apple Procurement',
  'Notebook',
  'Desktop',
  'Networking',
  'VoIP',
  'CCTV',
  'UPS & Power',
  'Accessories',
];

export const HARDWARE_SUPPLIERS: Array<'All' | HardwareSupplier> = [
  'All',
  'ASBIS',
  'Nology',
  'Scoop',
  'MiRO',
  'Manual',
];

// Supplier costs must come from authenticated server-side feeds.
// Static fallback products are intentionally not shipped to the browser.
export const hardwareProducts: HardwareProduct[] = [];

export function calculateSellPrice(cost: number, marginPercent: number) {
  return Math.round(cost * (1 + marginPercent / 100));
}
