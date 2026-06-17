type MarketingPayload = Record<string, unknown>;

export function trackOneaEvent(event: string, payload: MarketingPayload = {}) {
  try {
    const enriched = {
      ...payload,
      page_path: window.location.pathname,
      page_url: window.location.href,
    };

    if (window.OneaMarketing?.track) {
      window.OneaMarketing.track(event, enriched);
    } else {
      window.dataLayer?.push?.({ event, onea_event: event, ...enriched });
    }
    window.dispatchOneaMarketingEvent?.(event, enriched);
  } catch {
    // Marketing must never block a customer action.
  }
}

export function trackLeadConversion(payload: MarketingPayload = {}) {
  trackOneaEvent('generate_lead', {
    currency: 'ZAR',
    ...payload,
  });
}
