export type PriceAvailability = 'available' | 'quote_required' | 'unavailable';
export type PriceSourceType = 'supplier_api' | 'supplier_feed' | 'internal_rate_card' | 'partner_price_list';

export type PriceSource = {
  type: PriceSourceType;
  name: string;
  reference?: string;
  fetchedAt?: string;
  validUntil?: string;
};

export type PublicPrice = {
  id: string;
  label: string;
  displayOnceOff?: number;
  displayMonthly?: number;
  availability: PriceAvailability;
  source: PriceSource;
};

export type InternalPrice = PublicPrice & {
  supplierCostOnceOff?: number;
  supplierCostMonthly?: number;
  floorOnceOff?: number;
  floorMonthly?: number;
};

export type PriceSelection = {
  price: PublicPrice;
  quantity?: number;
};

export type PriceTotals = {
  onceOff: number;
  monthly: number;
  unavailable: PublicPrice[];
};

export type DeliveryPriority = 'standard' | 'priority' | 'urgent';
export type CommercialEnvironment = 'standard' | 'corporate' | 'regulated';

export function isPriceFresh(price: PublicPrice, now = new Date()) {
  if (!price.source.validUntil) return true;
  const validUntil = new Date(price.source.validUntil);
  return !Number.isNaN(validUntil.getTime()) && validUntil.getTime() >= now.getTime();
}

export function canCalculatePrice(price: PublicPrice, now = new Date()) {
  const hasAmount = price.displayOnceOff !== undefined || price.displayMonthly !== undefined;
  return price.availability === 'available' && hasAmount && isPriceFresh(price, now);
}

export function calculatePriceTotals(selections: PriceSelection[], now = new Date()): PriceTotals {
  return selections.reduce<PriceTotals>((totals, selection) => {
    const quantity = Math.max(1, Math.floor(selection.quantity || 1));
    if (!canCalculatePrice(selection.price, now)) {
      totals.unavailable.push(selection.price);
      return totals;
    }
    totals.onceOff += (selection.price.displayOnceOff || 0) * quantity;
    totals.monthly += (selection.price.displayMonthly || 0) * quantity;
    return totals;
  }, { onceOff: 0, monthly: 0, unavailable: [] });
}

export function calculateNegotiationBand(displayPrice?: number, floorPrice?: number) {
  if (displayPrice === undefined || floorPrice === undefined) return undefined;
  return Math.max(0, displayPrice - floorPrice);
}

export function applyMargin(supplierCost: number, marginPercent: number) {
  if (!Number.isFinite(supplierCost) || supplierCost < 0) {
    throw new Error('Supplier cost must be a non-negative number.');
  }
  if (!Number.isFinite(marginPercent) || marginPercent < 0) {
    throw new Error('Margin percentage must be a non-negative number.');
  }
  return Math.round(supplierCost * (1 + marginPercent / 100));
}

export function calculateCommercialAdjustment(
  amount: number,
  priority: DeliveryPriority,
  environment: CommercialEnvironment,
  recurring = false,
) {
  const priorityMultiplier = recurring
    ? 1
    : priority === 'urgent'
      ? 1.3
      : priority === 'priority'
        ? 1.15
        : 1;
  const environmentMultiplier = environment === 'regulated'
    ? 1.1
    : environment === 'corporate'
      ? 1.05
      : 1;
  return Math.round(amount * ((priorityMultiplier * environmentMultiplier) - 1));
}

export function assertDirectionalPriceChange(before: PriceTotals, after: PriceTotals, direction: 'up' | 'down') {
  const beforeValue = before.onceOff + before.monthly;
  const afterValue = after.onceOff + after.monthly;
  if (direction === 'up' && afterValue <= beforeValue) {
    throw new Error(`Expected price to increase, but ${afterValue} is not greater than ${beforeValue}.`);
  }
  if (direction === 'down' && afterValue >= beforeValue) {
    throw new Error(`Expected price to decrease, but ${afterValue} is not less than ${beforeValue}.`);
  }
}
