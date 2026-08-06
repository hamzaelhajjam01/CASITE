// NHTSA VPIC API — Real-time VIN verification
// Public API, CORS-enabled, no auth required

export interface VINVerifyResult {
  valid: boolean;
  error: string | null;
  attributes: {
    year: string;
    make: string;
    model: string;
  } | null;
}

const VPIC_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin';

/**
 * Verify a VIN using the NHTSA VPIC API.
 * CORS-enabled — can be called directly from the browser.
 */
export async function verifyVIN(vin: string): Promise<VINVerifyResult> {
  // 1. Validate format client-side first
  const cleanVIN = vin.toUpperCase().trim();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVIN)) {
    return {
      valid: false,
      error: 'Invalid VIN. Please enter a valid 17-character VIN.',
      attributes: null,
    };
  }

  // 2. Call NHTSA VPIC API with 12s timeout
  try {
    const response = await fetch(
      `${VPIC_BASE}/${cleanVIN}?format=json`,
      { signal: AbortSignal.timeout(12000) }
    );

    if (response.ok) {
      const data = await response.json();
      const results: Array<{ Variable: string; Value: string | null }> = data.Results || [];

      const make = results.find((r) => r.Variable === 'Make')?.Value;
      const model = results.find((r) => r.Variable === 'Model')?.Value;
      const year = results.find((r) => r.Variable === 'Model Year')?.Value;

      // If valid data found
      if (make || model || year) {
        return {
          valid: true,
          error: null,
          attributes: {
            year: year || '2024',
            make: make || 'Vehicle',
            model: model || 'Model',
          },
        };
      }
    }
    
    return {
      valid: false,
      error: "We couldn't decode this VIN. Please double-check it.",
      attributes: null,
    };

  } catch (err) {
    // Network error, CORS, or API timeout — fallback gracefully
    return {
      valid: false,
      error: 'Verification service unavailable. Proceeding with standard lookup.',
      attributes: null,
    };
  }
}

/**
 * Validate VIN format client-side (quick check before API call)
 */
export function isValidVINFormat(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

/**
 * Clean VIN input: uppercase, strip spaces/dashes, block I/O/Q
 */
export function cleanVINInput(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/[IOQ]/g, '')
    .slice(0, 17);
}
