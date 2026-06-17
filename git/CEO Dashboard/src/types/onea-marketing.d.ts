declare global {
  interface OneaAttribution {
    referralParam: string | null;
    documentReferrer: string | null;
    matchedDomain: string | null;
  }

  interface OneaMarketingInterface {
    _queue: Array<any>;
    _initialized: boolean;
    init: () => void;
    track: (event: 'service_pillar_view'|'lead_intent_initiated'|'form_step_navigation'|string, payload?: Record<string, any>) => any;
    getAttribution: () => OneaAttribution;
    listen: (eventName: string, handler: (payload: any) => void) => void;
    supported?: string[];
  }

  interface Window {
    OneaMarketing: OneaMarketingInterface;
    dispatchOneaMarketingEvent?: (name: string, detail?: any) => void;
    dataLayer?: Array<Record<string, any>>;
    gtag?: (...args: any[]) => void;
  }
}

export {};
