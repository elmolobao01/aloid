export type TelecomLookupResult = {
  carrierCurrent: string | null;
  carrierOriginal: string | null;
  ported: boolean | null;
  source: string;
  checkedAt: string;

  lineType: string | null;
  providerLocation: {
    countryName: string | null;
    countryCode: string | null;
    region: string | null;
    city: string | null;
    timezone: string | null;
  } | null;

  lineStatus: string | null;
  isVoip: boolean | null;

  registration: {
    name: string | null;
    type: string | null;
  } | null;

  risk: {
    level: string | null;
    disposable: boolean | null;
    abuseDetected: boolean | null;
  } | null;

  breaches: {
    total: number | null;
    firstBreachedAt: string | null;
    lastBreachedAt: string | null;
    domains: string[];
  } | null;
};

type AbstractPhoneIntelligenceResponse = {
  phone_number?: string;
  phone_format?: {
    international?: string;
    national?: string;
  };
  phone_carrier?: {
    name?: string | null;
    line_type?: string | null;
    mcc?: number | null;
    mnc?: number | null;
  };
  phone_location?: {
    country_name?: string | null;
    country_code?: string | null;
    country_prefix?: string | null;
    region?: string | null;
    city?: string | null;
    timezone?: string | null;
  };
  phone_messaging?: {
    sms_domain?: string | null;
    sms_email?: string | null;
  };
  phone_validation?: {
    is_valid?: boolean | null;
    line_status?: string | null;
    is_voip?: boolean | null;
    minimum_age?: number | null;
  };
  phone_registration?: {
    name?: string | null;
    type?: string | null;
  };
  phone_risk?: {
    risk_level?: string | null;
    is_disposable?: boolean | null;
    is_abuse_detected?: boolean | null;
  };
  phone_breaches?: {
    total_breaches?: number | null;
    date_first_breached?: string | null;
    date_last_breached?: string | null;
    breached_domains?: string[] | null;
  };
};

export class AbstractTelecomProvider {
  private readonly apiKey: string;
  private readonly endpoint = 'https://phoneintelligence.abstractapi.com/v1/';

  constructor() {
    const apiKey = process.env.ABSTRACT_PHONE_API_KEY;

    if (!apiKey) {
      throw new Error('ABSTRACT_PHONE_API_KEY não configurada.');
    }

    this.apiKey = apiKey;
  }

  async lookup(e164: string): Promise<TelecomLookupResult> {
    const url = new URL(this.endpoint);
    url.searchParams.set('phone', e164);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-api-key': this.apiKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Abstract Phone Intelligence respondeu com HTTP ${response.status}.`);
    }

    const data = (await response.json()) as AbstractPhoneIntelligenceResponse;

    return {
      carrierCurrent: data.phone_carrier?.name?.trim() || null,

      // A API testada não informa operadora anterior nem confirmação de portabilidade.
      carrierOriginal: null,
      ported: null,

      source: 'abstract_phone_intelligence',
      checkedAt: new Date().toISOString(),

      lineType: data.phone_carrier?.line_type?.trim() || null,

      providerLocation: data.phone_location
        ? {
            countryName: data.phone_location.country_name ?? null,
            countryCode: data.phone_location.country_code ?? null,
            region: data.phone_location.region ?? null,
            city: data.phone_location.city ?? null,
            timezone: data.phone_location.timezone ?? null,
          }
        : null,

      lineStatus: data.phone_validation?.line_status ?? null,
      isVoip:
        typeof data.phone_validation?.is_voip === 'boolean'
          ? data.phone_validation.is_voip
          : null,

      registration: data.phone_registration
        ? {
            name: data.phone_registration.name ?? null,
            type: data.phone_registration.type ?? null,
          }
        : null,

      risk: data.phone_risk
        ? {
            level: data.phone_risk.risk_level ?? null,
            disposable:
              typeof data.phone_risk.is_disposable === 'boolean'
                ? data.phone_risk.is_disposable
                : null,
            abuseDetected:
              typeof data.phone_risk.is_abuse_detected === 'boolean'
                ? data.phone_risk.is_abuse_detected
                : null,
          }
        : null,

      breaches: data.phone_breaches
        ? {
            total: data.phone_breaches.total_breaches ?? null,
            firstBreachedAt: data.phone_breaches.date_first_breached ?? null,
            lastBreachedAt: data.phone_breaches.date_last_breached ?? null,
            domains: data.phone_breaches.breached_domains ?? [],
          }
        : null,
    };
  }
}
