import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';
import {
  allAppleProcurementItems,
  appleAccessoryProducts,
  appleDeviceProducts,
  type AppleProcurementItem,
} from '../data/appleDeviceProcurement';
import type { TalkToUsPrefill } from '../components/TalkToUsModal';

interface Props {
  onTalkToUs: (prefill?: TalkToUsPrefill) => void;
}

const FILTERS = ['All', 'Mac', 'Desktop', 'iPad', 'iPhone', 'Accessory'];
const APPLE_PRICE_FALLBACK_MESSAGE = 'Live Apple pricing is temporarily updating. Your configuration can still be submitted for confirmation.';

const APPLE_LIVE_QUERY_OVERRIDES: Record<string, string> = {
  'MacBook Pro M5 (New)': 'MacBook Pro',
  'MacBook Neo': 'MacBook Neo',
  'MacBook Pro': 'MacBook Pro',
  'MacBook Air': 'MacBook Air',
  'Mac mini': 'Mac mini',
  'Mac Studio': 'Mac Studio',
  iMac: 'iMac',
  iPad: 'iPad',
  iPhone: 'iPhone',
  'Apple Pencil': 'Apple Pencil',
  'Magic Keyboard': 'Magic Keyboard',
  AirPods: 'AirPods',
};

const APPLE_OPTION_PRICE_ADJUSTMENTS: Record<string, number> = {
  'Device only': 0,
  'Device + email setup': 1650,
  'Device + Microsoft 365 setup': 2150,
  'Device + data transfer and handover': 2800,
  'Add compatible USB-C power adapter': 690,
  'No power adapter required': 0,
  'Magic Keyboard': 0,
  'Magic Keyboard with Touch ID': 1500,
  'No accessories': 0,
  'Add keyboard and mouse': 4990,
  'Add display': 18999,
  'Add full workstation bundle': 24990,
  'Included accessories only': 0,
  'Add Magic Trackpad': 2999,
  'Add numeric keyboard': 2199,
  'Add office setup': 1650,
  'No accessory': 0,
  'Add Apple Pencil': 2499,
  'Add keyboard cover': 6999,
  'Add protective case': 1299,
  'Add case': 999,
  'Add charger': 699,
  'Add AirPods': 3499,
  'Add full mobile kit': 5499,
  'For standard iPad': 0,
  'For iPad Air': 350,
  'For iPad Pro': 900,
  'Standard layout': 0,
  'Numeric keypad': 1200,
  '20W': 0,
  '30W': 120,
  '35W dual USB-C': 240,
  '67W': 640,
  '96W / high power': 1090,
  'USB-C to USB-C': 0,
  'USB-C to Lightning': 180,
  'MagSafe cable': 320,
  '1m': 0,
  '2m': 150,
  HDMI: 0,
  'USB-A': 150,
  Ethernet: 350,
  'SD card reader': 220,
  'Multiport hub': 850,
  'Basic protection': 0,
  'Rugged / field use': 350,
  'Executive / premium': 650,
  'Clear case': 150,
};

type LiveAppleVariant = {
  sku: string;
  model: string;
  description: string;
  displayPrice: number;
  stockStatus: 'in_stock' | 'confirm_stock';
  availability: 'available';
  source?: string;
  fetchedAt: string;
};

type ApplePriceLineItem = {
  label: string;
  amount: number;
};

function money(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value);
}

function ProductImage({
  imageUrl,
  imageAlt,
  icon,
}: {
  imageUrl?: string;
  imageAlt?: string;
  icon: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <div className="flex flex-col items-center gap-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[64px] text-[#6e6e73]">{icon}</span>
        <span className="text-center text-[11px] font-bold uppercase tracking-widest">
          Configuration confirmed on quote
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={imageAlt || ''}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full w-full object-contain p-lg"
    />
  );
}

function itemAnchor(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeAppleText(value: string) {
  return value
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[^a-z0-9+/\-. ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collapseAppleText(value: string) {
  return normalizeAppleText(value).replace(/[^a-z0-9]+/g, '');
}

function appleLookupQuery(item: { asbisSku?: string; name: string }) {
  const override = APPLE_LIVE_QUERY_OVERRIDES[item.name];
  if (override) return override;
  return item.asbisSku?.trim() || item.name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
}

function optionDefault(item: AppleProcurementItem, groupLabel: string) {
  return item.optionGroups.find(group => group.label === groupLabel)?.options[0] || '';
}

function selectedOption(item: AppleProcurementItem, selections: Record<string, string> | undefined, groupLabel: string) {
  return selections?.[groupLabel] || optionDefault(item, groupLabel);
}

function appleCapacityToken(value: string) {
  const match = value.match(/(\d+)\s*(gb|tb)/i);
  return match ? `${match[1]}${match[2].toLowerCase()}` : '';
}

function appleSizeToken(value: string) {
  const match = value.match(/(\d+)\s*[- ]?inch/i);
  return match ? `${match[1]}inch` : '';
}

function appleWattageToken(value: string) {
  const match = value.match(/(\d+)\s*w/i);
  return match ? `${match[1]}w` : '';
}

function scoreVariantForOption(groupLabel: string, option: string, variant: LiveAppleVariant) {
  if (/^confirm\b/i.test(option)) return 0;

  const normalizedOption = normalizeAppleText(option);
  const collapsedOption = collapseAppleText(option);
  const variantText = `${variant.sku} ${variant.model} ${variant.description}`;
  const normalizedVariant = normalizeAppleText(variantText);
  const collapsedVariant = collapseAppleText(variantText);

  switch (groupLabel) {
    case 'Memory':
    case 'Storage': {
      const token = appleCapacityToken(option);
      if (!token) return 0;
      return collapsedVariant.includes(token) ? 18 : -10;
    }
    case 'Screen size': {
      const token = appleSizeToken(option);
      if (!token) return 0;
      return collapsedVariant.includes(token) ? 18 : -10;
    }
    case 'Wattage': {
      const token = appleWattageToken(option);
      if (!token) return 0;
      return collapsedVariant.includes(token) ? 12 : -6;
    }
    case 'Length': {
      return collapsedVariant.includes(collapsedOption) ? 10 : -4;
    }
    case 'Processor / chip': {
      if (normalizedOption.includes('m5 max')) return collapsedVariant.includes('m5max') ? 16 : -8;
      if (normalizedOption.includes('m5 pro')) return collapsedVariant.includes('m5pro') ? 16 : -8;
      if (normalizedOption === 'm5') return collapsedVariant.includes('m5') && !collapsedVariant.includes('m5pro') && !collapsedVariant.includes('m5max') ? 14 : -6;
      if (normalizedOption.includes('m4 pro')) return collapsedVariant.includes('m4pro') ? 16 : -8;
      if (normalizedOption === 'm4') return collapsedVariant.includes('m4') && !collapsedVariant.includes('m4pro') ? 14 : -6;
      if (normalizedOption.includes('a18 pro')) return collapsedVariant.includes('a18pro') ? 16 : -8;
      if (normalizedOption.includes('max chip')) return collapsedVariant.includes('max') ? 12 : -6;
      if (normalizedOption.includes('ultra chip')) return collapsedVariant.includes('ultra') ? 12 : -6;
      if (normalizedOption.includes('pro chip')) return collapsedVariant.includes('pro') && !collapsedVariant.includes('promax') && !collapsedVariant.includes('ultra') ? 10 : -4;
      if (normalizedOption.includes('standard chip')) return /(pro|max|ultra)/.test(collapsedVariant) ? -4 : 8;
      return collapsedVariant.includes(collapsedOption) ? 10 : 0;
    }
    case 'Finish': {
      const finishTokens: Record<string, string[]> = {
        'space black / dark finish': ['spaceblack', 'black'],
        'starlight / light finish': ['starlight'],
        'white / silver': ['white', 'silver'],
      };
      const tokens = finishTokens[normalizedOption] || [collapsedOption];
      return tokens.some(token => collapsedVariant.includes(token)) ? 8 : -2;
    }
    case 'Model family': {
      if (normalizedOption === 'ipad air') return collapsedVariant.includes('ipadair') ? 14 : -8;
      if (normalizedOption === 'ipad pro') return collapsedVariant.includes('ipadpro') ? 14 : -8;
      if (normalizedOption === 'ipad mini') return collapsedVariant.includes('ipadmini') ? 14 : -8;
      if (normalizedOption === 'ipad') return collapsedVariant.includes('ipad') && !/(ipadair|ipadpro|ipadmini)/.test(collapsedVariant) ? 10 : -4;
      if (normalizedOption === 'plus model') return collapsedVariant.includes('plus') ? 12 : -6;
      if (normalizedOption === 'pro max model') return collapsedVariant.includes('promax') ? 14 : -8;
      if (normalizedOption === 'pro model') return collapsedVariant.includes('pro') && !collapsedVariant.includes('promax') ? 12 : -6;
      if (normalizedOption === 'standard iphone') return collapsedVariant.includes('iphone') && !/(plus|promax|pro)/.test(collapsedVariant) ? 10 : -4;
      return 0;
    }
    case 'Connectivity': {
      if (normalizedOption === 'wifi + cellular') {
        return /(cellular|5g)/.test(collapsedVariant) ? 12 : -8;
      }
      if (normalizedOption === 'wifi only') {
        return /(cellular|5g)/.test(collapsedVariant) ? -6 : 10;
      }
      return 0;
    }
    case 'Compatibility': {
      if (normalizedOption === 'for ipad pro') return collapsedVariant.includes('pro') ? 10 : -4;
      if (normalizedOption === 'for ipad air') return collapsedVariant.includes('air') ? 10 : -4;
      if (normalizedOption === 'for standard ipad') return /(air|pro)/.test(collapsedVariant) ? -2 : 8;
      return 0;
    }
    case 'Layout': {
      if (normalizedOption === 'numeric keypad') return /(numeric|keypad)/.test(collapsedVariant) ? 10 : -4;
      if (normalizedOption === 'standard layout') return /(numeric|keypad)/.test(collapsedVariant) ? -2 : 8;
      return 0;
    }
    case 'Cable type': {
      if (normalizedOption === 'usb-c to lightning') return collapsedVariant.includes('lightning') ? 10 : -4;
      if (normalizedOption === 'magsafe cable') return collapsedVariant.includes('magsafe') ? 10 : -4;
      if (normalizedOption === 'usb-c to usb-c') return collapsedVariant.includes('usbc') ? 8 : 0;
      return 0;
    }
    default:
      return collapsedVariant.includes(collapsedOption) ? 6 : 0;
  }
}

function selectedVariantForItem(
  item: AppleProcurementItem,
  variants: LiveAppleVariant[],
  selections: Record<string, string> | undefined,
) {
  if (!variants.length) return undefined;

  return variants
    .slice()
    .sort((left, right) => {
      const leftScore = item.optionGroups
        .filter(group => group.label !== 'Quantity')
        .reduce((score, group) => score + scoreVariantForOption(group.label, selectedOption(item, selections, group.label), left), 0)
        + (left.sku === item.asbisSku ? 6 : 0)
        + (left.stockStatus === 'in_stock' ? 2 : 0);
      const rightScore = item.optionGroups
        .filter(group => group.label !== 'Quantity')
        .reduce((score, group) => score + scoreVariantForOption(group.label, selectedOption(item, selections, group.label), right), 0)
        + (right.sku === item.asbisSku ? 6 : 0)
        + (right.stockStatus === 'in_stock' ? 2 : 0);

      if (leftScore !== rightScore) return rightScore - leftScore;
      if (left.sku === item.asbisSku && right.sku !== item.asbisSku) return -1;
      if (right.sku === item.asbisSku && left.sku !== item.asbisSku) return 1;
      return left.displayPrice - right.displayPrice;
    })[0];
}

function appleOptionAdjustment(item: AppleProcurementItem, selections: Record<string, string> | undefined) {
  const lineItems: ApplePriceLineItem[] = [];

  item.optionGroups
    .filter(group => group.label !== 'Quantity')
    .forEach(group => {
      const choice = selectedOption(item, selections, group.label);
      const amount = APPLE_OPTION_PRICE_ADJUSTMENTS[choice] || 0;
      if (amount > 0) {
        lineItems.push({
          label: `${group.label}: ${choice}`,
          amount,
        });
      }
    });

  return lineItems;
}

export default function AppleDeviceProcurementPage({ onTalkToUs }: Props) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [liveVariants, setLiveVariants] = useState<Record<string, LiveAppleVariant[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Record<string, string>>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState<Record<string, boolean>>({});
  const [priceErrors, setPriceErrors] = useState<Record<string, string>>({});
  const inFlightControllers = useRef<Record<string, AbortController>>({});

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return allAppleProcurementItems;
    return allAppleProcurementItems.filter(item => item.category === activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    const missing = filtered.filter(item =>
      liveVariants[item.name] === undefined
      && !loadingPrices[item.name]
      && !inFlightControllers.current[item.name],
    );
    if (!missing.length) return;

    setLoadingPrices(current => ({
      ...current,
      ...Object.fromEntries(missing.map(item => [item.name, true])),
    }));

    missing.forEach(item => {
      const controller = new AbortController();
      let timedOut = false;
      const query = appleLookupQuery(item);
      const timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 15000);
      inFlightControllers.current[item.name] = controller;

      void fetch(`/api/apple-prices.php?query=${encodeURIComponent(query)}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      })
        .then(async response => {
          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload) {
            const statusError = new Error('Apple pricing unavailable');
            Object.assign(statusError, { status: response.status });
            throw statusError;
          }
          const products = Array.isArray(payload.products)
            ? payload.products.filter((product: LiveAppleVariant) =>
                product?.sku && Number.isFinite(Number(product.displayPrice)) && Number(product.displayPrice) > 0)
            : [];
          setLiveVariants(current => ({
            ...current,
            [item.name]: products,
          }));
          setPriceErrors(current => ({
            ...current,
            [item.name]: products.length ? '' : APPLE_PRICE_FALLBACK_MESSAGE,
          }));
        })
        .catch(error => {
          if (controller.signal.aborted && !timedOut) {
            return;
          }
          setLiveVariants(current => ({
            ...current,
            [item.name]: [],
          }));
          setPriceErrors(current => ({
            ...current,
            [item.name]: APPLE_PRICE_FALLBACK_MESSAGE,
          }));
        })
        .finally(() => {
          window.clearTimeout(timeoutId);
          delete inFlightControllers.current[item.name];
          setLoadingPrices(current => ({
            ...current,
            [item.name]: false,
          }));
        });
    });
  }, [filtered, liveVariants, loadingPrices]);

  useEffect(() => () => {
    Object.values(inFlightControllers.current).forEach(controller => controller.abort());
    inFlightControllers.current = {};
  }, []);

  function selectedVariant(item: AppleProcurementItem) {
    return selectedVariantForItem(item, liveVariants[item.name] || [], selectedOptions[item.name]);
  }

  function requestQuote(itemName: string) {
    const item = allAppleProcurementItems.find(entry => entry.name === itemName);
    if (!item) return;
    const variant = selectedVariant(item);
    const addOnLines = appleOptionAdjustment(item, selectedOptions[item.name]);
    const quantity = Math.max(1, quantities[itemName] || 1);
    const choices = item.optionGroups
      .filter(group => group.label !== 'Quantity')
      .map(group => `${group.label}: ${selectedOption(item, selectedOptions[itemName], group.label)}`)
      .join('; ');
    const unitAddOns = addOnLines.reduce((total, line) => total + line.amount, 0);
    const unitEstimate = variant ? variant.displayPrice + unitAddOns : 0;
    const configuration = variant
      ? `Selected configuration: ${variant.model} (${variant.sku}). Current estimate: ${money(unitEstimate * quantity)} total, based on ${money(variant.displayPrice)} base hardware${unitAddOns > 0 ? ` plus ${money(unitAddOns)} selected add-ons per unit` : ''}.`
      : `Requested configuration: ${choices}. Price confirmation required.`;

    onTalkToUs({
      service: 'Apple Device Procurement',
      message: `Apple Device Procurement request: ${itemName}. ${configuration} Quantity: ${quantity}. Please confirm availability, delivery and setup before quote approval.`,
    });
  }

  return (
    <div className="bg-background text-on-surface font-body-md">
      <section className="bg-soft-surface border-b border-border-subtle py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection>
            <span className="inline-block px-md py-xs bg-[#1a1a1a]/5 text-text-primary rounded-full font-label-md text-label-md mb-lg">Apple Device Procurement</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-md">
              Apple devices and accessories for business teams
            </h1>
            <p className="text-on-surface-variant text-body-lg max-w-3xl">
              Request Mac, iPad, iPhone and Apple accessory quotes through Onea Africa. We confirm availability, configuration, delivery and setup before quote approval.
            </p>
            <p className="mt-lg text-body-sm text-on-surface-variant">
              Select a product and adjust the configuration. When a live Apple variant is available, memory, storage, chip and size changes update the estimate automatically.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-xxl bg-white border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="mb-xl">
            <div className="flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-headline-md text-text-primary mb-sm">Browse Apple procurement items</h2>
                <p className="text-on-surface-variant text-body-lg max-w-3xl">
                  Choose the exact device or accessory you want quoted so our team can check the right model, configuration and availability.
                </p>
              </div>
              <div className="flex flex-wrap gap-sm">
                {FILTERS.map(filter => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-md py-sm text-body-sm font-bold transition ${
                      activeFilter === filter
                        ? 'bg-primary text-on-primary'
                        : 'border border-border-subtle bg-white text-text-primary hover:border-primary'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <StaggerGrid className="grid grid-cols-1 gap-lg md:grid-cols-2 xl:grid-cols-3" stagger={0.06}>
            {filtered.map(item => {
              const variant = selectedVariant(item);
              const quantity = Math.max(1, quantities[item.name] || 1);
              const addOnLines = appleOptionAdjustment(item, selectedOptions[item.name]);
              const unitAddOns = addOnLines.reduce((total, line) => total + line.amount, 0);
              const unitPrice = variant ? variant.displayPrice + unitAddOns : null;
              const totalPrice = unitPrice !== null ? unitPrice * quantity : null;
              return (
              <StaggerItem key={item.name}>
                <article id={itemAnchor(item.name)} className="flex h-full scroll-mt-32 flex-col rounded-2xl border border-border-subtle bg-white p-lg shadow-sm">
                  <div className="relative mb-lg flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-[#f5f5f7]">
                    <ProductImage imageUrl={item.imageUrl} imageAlt={item.imageAlt} icon={item.icon} />
                    {item.badge && (
                      <span className="absolute left-md top-md inline-flex rounded-full bg-[#D32F2F] px-md py-xs text-[11px] font-bold uppercase tracking-widest text-white shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-xs">
                      <span className="inline-flex rounded-full bg-soft-surface px-md py-xs text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="mt-md font-headline-md text-[22px] text-text-primary">{item.name}</h3>
                  </div>
                  {loadingPrices[item.name] ? (
                    <p className="mt-md text-[18px] font-bold text-text-primary">Updating price...</p>
                  ) : totalPrice !== null ? (
                    <>
                      <p className="mt-md text-[28px] font-extrabold text-text-primary">
                        {money(totalPrice)}
                      </p>
                      <p className="mt-xs text-[12px] text-on-surface-variant">
                        Current estimated price
                        {quantity > 1 && unitPrice !== null ? ` at ${money(unitPrice)} each` : ''}.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-md text-[20px] font-extrabold text-[#9a6700]">Price confirmed on quote</p>
                    </>
                  )}
                  {!loadingPrices[item.name] && priceErrors[item.name] && (
                    <p className="mt-sm rounded-2xl border border-[#f1d7a8] bg-[#fff9ef] p-sm text-[12px] font-semibold text-[#8a5a00]">
                      {priceErrors[item.name]}
                    </p>
                  )}
                  <p className="mt-md flex-1 text-body-md text-on-surface-variant">{item.description}</p>
                  <ul className="mt-lg space-y-xs">
                    {item.specs.map(spec => (
                      <li key={spec} className="flex gap-sm text-body-sm text-on-surface-variant">
                        <span className="material-symbols-outlined mt-[1px] text-[16px] text-primary">check_circle</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-lg rounded-2xl border border-border-subtle bg-[#fbfcf6] p-md">
                    <p className="mb-sm text-[11px] font-bold uppercase tracking-widest text-text-primary">Choose configuration</p>
                    <div className="grid gap-sm">
                      {variant && (
                        <div className="rounded-2xl border border-primary/20 bg-white p-sm">
                          <p className="text-[12px] font-semibold text-text-primary">Matched live Apple model</p>
                          <p className="mt-xs text-body-sm font-bold text-text-primary">{variant.model}</p>
                          <p className="mt-xs text-[12px] text-on-surface-variant">
                            SKU {variant.sku} · base hardware {money(variant.displayPrice)}
                          </p>
                        </div>
                      )}
                      {item.optionGroups.filter(group => group.label !== 'Quantity').map(group => (
                        <label key={group.label} className="block">
                          <span className="text-[12px] font-semibold text-on-surface-variant">{group.label}</span>
                          <select
                            value={selectedOption(item, selectedOptions[item.name], group.label)}
                            onChange={(event) => setSelectedOptions(current => ({
                              ...current,
                              [item.name]: {
                                ...(current[item.name] || {}),
                                [group.label]: event.target.value,
                              },
                            }))}
                            className="mt-xs w-full rounded-2xl border border-border-subtle bg-white px-md py-sm text-body-sm text-text-primary outline-none focus:border-primary"
                          >
                            {group.options.map(option => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                      ))}
                      <label className="block">
                        <span className="text-[12px] font-semibold text-on-surface-variant">Quantity</span>
                          <select
                            value={quantity}
                            onChange={(event) => setQuantities(current => ({ ...current, [item.name]: Number(event.target.value) }))}
                            className="mt-xs w-full rounded-full border border-border-subtle bg-white px-md py-sm text-body-sm text-text-primary outline-none focus:border-primary"
                          >
                            {Array.from({ length: 20 }, (_, index) => index + 1).map(quantity => (
                              <option key={quantity} value={quantity}>{quantity} unit{quantity === 1 ? '' : 's'}</option>
                            ))}
                          </select>
                      </label>
                    </div>
                    {variant && addOnLines.length > 0 && (
                      <div className="mt-sm rounded-2xl border border-primary/20 bg-primary/5 p-sm">
                        <p className="text-[12px] font-semibold text-text-primary">Selected add-ons per unit</p>
                        <div className="mt-xs space-y-[6px] text-[12px] text-on-surface-variant">
                          {addOnLines.map(line => (
                            <div key={line.label} className="flex items-start justify-between gap-sm">
                              <span>{line.label}</span>
                              <strong className="text-text-primary">{money(line.amount)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="mt-sm text-[11px] leading-relaxed text-on-surface-variant">
                      Live Apple variants are matched automatically where available. Exact stock and quote approval still happen before delivery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => requestQuote(item.name)}
                    className="mt-lg inline-flex items-center justify-center gap-sm rounded-full bg-primary px-lg py-sm font-bold text-on-primary hover:opacity-90"
                  >
                    Request Selected Quote
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </article>
              </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      <section className="py-xxl bg-soft-surface">
        <div className="max-w-[1280px] mx-auto px-xl">
          <div className="grid gap-lg lg:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-white p-lg">
              <h2 className="font-headline-md text-[22px] text-text-primary">Devices listed</h2>
              <p className="mt-sm text-body-md text-on-surface-variant">
                {appleDeviceProducts.length} device categories are available for quote planning.
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white p-lg">
              <h2 className="font-headline-md text-[22px] text-text-primary">Accessories listed</h2>
              <p className="mt-sm text-body-md text-on-surface-variant">
                {appleAccessoryProducts.length} accessories are listed individually so quote requests are specific.
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white p-lg">
              <h2 className="font-headline-md text-[22px] text-text-primary">Optional setup</h2>
              <p className="mt-sm text-body-md text-on-surface-variant">
                Add email, Microsoft 365, app setup, data transfer and handover support to your quote request.
              </p>
            </div>
          </div>
          <p className="mt-lg text-center text-[11px] text-on-surface-variant">
            Apple and the Apple product names listed are trademarks of Apple Inc. Onea Africa is an independent procurement provider. Product configuration, availability and final pricing are confirmed before approval.
          </p>
        </div>
      </section>
    </div>
  );
}
