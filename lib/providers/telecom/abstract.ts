export type TelecomLookupResult = {
  carrierCurrent: string | null;
  carrierOriginal: string | null;
  ported: boolean | null;
  source: string;
  checkedAt: string;
  lineType?: string | null;
  location?: string | null;
  valid?: boolean | null;
};

type AbstractPhoneValidationResponse = {
  phone?: string;
  valid?: boolean;
  format?: {
    international?: string;
    local?: string;
  };
  country?: {
    code?: string;
    name?: string;
    prefix?: string;
  };
  location?: string;
  type?: string;
  carrier?: string;
};

export class AbstractTelecomProvider {
  private readonly apiKey: string;
  private readonly endpoint = 'https://phonevalidation.abstractapi.com/v1/';

  constructor() {
    const apiKey = process.env.ABSTRACT_PHONE_API_KEY;

    if (!apiKey) {
      throw new Error('ABSTRACT_PHONE_API_KEY não configurada.');
    }

    this.apiKey = apiKey;
  }

  async lookup(e164: string): Promise<TelecomLookupResult> {
    const url = new URL(this.endpoint);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('phone', e164);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Abstract API respondeu com HTTP ${response.status}.`);
    }

    const data = (await response.json()) as AbstractPhoneValidationResponse;

    return {
      carrierCurrent: data.carrier?.trim() || null,
      carrierOriginal: null,
      ported: null,
      source: 'abstract',
      checkedAt: new Date().toISOString(),
      lineType: data.type?.trim() || null,
      location: data.location?.trim() || null,
      valid: typeof data.valid === 'boolean' ? data.valid : null,
    };
  }
}
