import { useState, useEffect, type CSSProperties } from 'react';
import {
  Check, ChevronRight, ChevronLeft, Plus, Trash2, Car, User, Shield,
  Copy, Upload, Lock, Sparkles, Calendar, CheckCircle2, Circle,
  AlertTriangle, X, Eye, Loader2, Edit2, ChevronDown, ChevronUp, Send, Mail
} from 'lucide-react';
import { verifyVIN } from '../api/vinaudit';
import { fetchPackages, fetchSettings, calculateQuote, submitQuote, notifyPayment, checkPolicyStatus, type PackageData, type SiteSettings } from '../api/packages';

// ─── Types ──────────────────────────────────────────────────
export interface AdditionalDriver {
  id: number;
  fullName: string;
  dob?: string;
  licenseClass?: string;
  relationship?: string;
}

interface VehicleData { vin: string; year: string; make: string; model: string; }
interface DriverData { license: string; dob: string; postal: string; province: string; email?: string; phone?: string; fullName?: string; street?: string; city?: string; }
interface CoverageData { term: string; type: string; deductible: string; extraDrivers?: number; additionalDriversList?: AdditionalDriver[]; billingFrequency?: 'full' | 'monthly'; }
interface ExtraVehicle { id: number; vin: string; year?: string; make?: string; model?: string; decoded: { year: string; make: string; model: string } | null; }
interface PinkCardData { fullName: string; email?: string; phone?: string; street: string; city: string; additionalDrivers?: string; }

// ─── Official Term Pricing Matrix (Pay Once Per Term) ─────
const FALLBACK_PRICES: Record<string, { basic: number; full: number }> = {
  '3m':  { basic: 570,  full: 720 },
  '6m':  { basic: 1080, full: 1350 },
  '12m': { basic: 2040, full: 2520 },
};
const termLabels: Record<string, string> = {
  '3m': '3 months (Save 5%)', '6m': '6 months (Popular - Save 10%)', '12m': '12 months (Best Value - Save 15%)',
};

// Build basePrices shape from API packages array
function buildBasePrices(packages: PackageData[]): Record<string, { basic: number; full: number }> {
  const basicPkg = packages.find(p => p.slug === 'basic');
  const fullPkg  = packages.find(p => p.slug === 'full');
  if (!basicPkg || !fullPkg) return FALLBACK_PRICES;
  const result: Record<string, { basic: number; full: number }> = {};
  for (const term of ['3m', '6m', '12m']) {
    result[term] = {
      basic: basicPkg.prices[term] ?? FALLBACK_PRICES[term]?.basic ?? 570,
      full:  fullPkg.prices[term]  ?? FALLBACK_PRICES[term]?.full ?? 720,
    };
  }
  return result;
}

// ─── Canadian Postal Code Validation ────────────────────────
const POSTAL_PROVINCE_MAP: Record<string, { code: string; name: string }> = {
  'A': { code: 'NL', name: 'Newfoundland and Labrador' },
  'B': { code: 'NS', name: 'Nova Scotia' },
  'C': { code: 'PE', name: 'Prince Edward Island' },
  'E': { code: 'NB', name: 'New Brunswick' },
  'G': { code: 'QC', name: 'Qu\u00e9bec' },
  'H': { code: 'QC', name: 'Qu\u00e9bec' },
  'J': { code: 'QC', name: 'Qu\u00e9bec' },
  'K': { code: 'ON', name: 'Ontario' },
  'L': { code: 'ON', name: 'Ontario' },
  'M': { code: 'ON', name: 'Ontario' },
  'N': { code: 'ON', name: 'Ontario' },
  'P': { code: 'ON', name: 'Ontario' },
  'R': { code: 'MB', name: 'Manitoba' },
  'S': { code: 'SK', name: 'Saskatchewan' },
  'T': { code: 'AB', name: 'Alberta' },
  'V': { code: 'BC', name: 'British Columbia' },
  'X': { code: 'NT', name: 'Northwest Territories / Nunavut' },
  'Y': { code: 'YT', name: 'Yukon' },
};
const INVALID_POSTAL_FIRST_LETTERS = new Set(['D', 'F', 'I', 'O', 'Q', 'U', 'W', 'Z']);
const POSTAL_FORMAT_REGEX = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;

function cleanPostalCode(postal: string): string {
  if (!postal) return '';
  let clean = postal.trim().toUpperCase();
  // Strip optional 2-letter province prefix (e.g. AB, ON, BC, QC, etc.) if typed before postal code
  clean = clean.replace(/^(?:AB|ON|BC|QC|MB|SK|NS|NB|PE|NL|YT|NT|NU)[,\s\-\:]+/i, '');
  return clean;
}

function validatePostalCode(postal: string): { valid: boolean; province: { code: string; name: string } | null; error: string | null } {
  if (!postal || postal.trim().length === 0) return { valid: false, province: null, error: null };
  const clean = cleanPostalCode(postal);
  if (clean.length === 0) return { valid: false, province: null, error: null };
  const firstChar = clean[0];

  // Check for invalid first letters (never used in Canadian postal codes)
  if (INVALID_POSTAL_FIRST_LETTERS.has(firstChar)) {
    return { valid: false, province: null, error: `Invalid Canadian postal code — "${firstChar}" is not a valid first letter` };
  }

  // Check format: ANA NAN
  if (!POSTAL_FORMAT_REGEX.test(clean)) {
    return { valid: false, province: null, error: 'Invalid format — use A1A 1A1' };
  }

  // Look up province
  const province = POSTAL_PROVINCE_MAP[firstChar];
  if (!province) {
    return { valid: false, province: null, error: `Unknown province for postal code starting with "${firstChar}"` };
  }

  return { valid: true, province, error: null };
}

// ─── Mock VIN Decoder ───────────────────────────────────────
const decodeVIN = (vin: string) => {
  if (vin.length < 11) return null;
  const makes = ['Honda', 'Toyota', 'Ford', 'Lexus', 'BMW'];
  const models = ['Civic', 'RAV4', 'F-150', 'RX 350', 'X3'];
  const yearCodes: Record<string, string> = { 'R': '2024', 'S': '2025', 'P': '2023', 'N': '2022' };
  const mi = vin.charCodeAt(1) % makes.length;
  const yi = vin[9]?.toUpperCase() || 'R';
  return { year: yearCodes[yi] || '2024', make: makes[mi], model: models[mi] };
};

const DEDUCTIBLE_ADDON: Record<string, number> = {
  '1m': 30,
  '3m': 50,
  '6m': 80,
  '12m': 140,
};

// ─── Local Pricing Calculator (flat group term rates) ─
function calculatePrice(
  term: string, type: string, deductible: string, _license: string, _dob: string,
  extraVehicles: ExtraVehicle[],
  basePrices: Record<string, { basic: number; full: number }> = FALLBACK_PRICES,
  _extraDrivers: number = 0,
) {
  const bp = basePrices[term] || basePrices['6m'] || FALLBACK_PRICES['6m'];
  let price = type === 'basic' ? bp.basic : bp.full;

  // Deductible adjustment for Full Coverage ($500 lower out-of-pocket vs $1,000 standard)
  if (type === 'full' && deductible === '500') {
    price += (DEDUCTIBLE_ADDON[term] ?? 80);
  }

  // Multi-vehicle flat 20% discount on combined premium
  const totalVehicles = 1 + extraVehicles.length;
  if (totalVehicles >= 2) {
    const combined = price * totalVehicles;
    price = Math.round(combined * 0.80);
  }

  return { 
    price, 
    original: type === 'basic' ? bp.basic : bp.full, 
    label: `${termLabels[term] || '6 months'} prepaid` 
  };
}

// ─── Steps Config ───────────────────────────────────────────
const steps = [{ num: 1, label: 'Vehicle', icon: Car }, { num: 2, label: 'Driver Info', icon: User }, { num: 3, label: 'Coverage', icon: Shield }];

// ═════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════

function ProgressBar({ currentStep }: { currentStep: number }) {
  const pct = Math.round((currentStep / 3) * 100);
  return (
    <div className="mb-10">
      <div className="flex items-center justify-center gap-0 mb-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isCompleted = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          return (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCurrent ? 'bg-[#168A5A] text-white shadow-[0_4px_12px_rgba(22,138,90,0.3)]' : isCompleted ? 'bg-[#168A5A] text-white' : 'bg-[#F7F7F5] text-[#B0B4B8] border border-[#E6E8EB]'
                }`}>
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={2} />}
                </div>
                <span className={`font-inter text-[12px] font-medium ${isCurrent || isCompleted ? 'text-[#168A5A]' : 'text-[#B0B4B8]'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-16 sm:w-24 h-[2px] mx-2 mb-6 rounded-full ${currentStep > s.num ? 'bg-[#168A5A]' : 'bg-[#E6E8EB]'}`} />}
            </div>
          );
        })}
      </div>
      <div className="text-center"><span className="font-inter text-[12px] text-[#5F6368]">Step {currentStep} of 3 &middot; {pct}% complete</span></div>
    </div>
  );
}

function Step1Vehicle({ vehicle, setVehicle, onNext, extraVehicles, setExtraVehicles }: {
  vehicle: VehicleData; setVehicle: (v: Partial<VehicleData>) => void; onNext: () => void;
  extraVehicles: ExtraVehicle[]; setExtraVehicles: (v: ExtraVehicle[]) => void;
}) {
  const [vinStatus, setVinStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'warning'>('idle');
  const [vinError, setVinError] = useState('');

  // Debounced VIN verification
  useEffect(() => {
    const vin = vehicle.vin;
    if (vin.length < 17) {
      setVinStatus('idle');
      return;
    }

    setVinStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const result = await verifyVIN(vin);
        if (result.valid && result.attributes) {
          setVinStatus('valid');
          setVehicle({
            year: result.attributes.year,
            make: result.attributes.make,
            model: result.attributes.model,
          });
        } else if (result.error && result.error.includes('unavailable')) {
          const fallback = decodeVIN(vin);
          if (fallback) {
            setVinStatus('warning');
            setVinError('API service unavailable. Using standard vehicle lookup.');
            setVehicle({ year: fallback.year, make: fallback.make, model: fallback.model });
          } else {
            setVinStatus('invalid');
            setVinError(result.error);
          }
        } else {
          setVinStatus('invalid');
          setVinError(result.error || 'Invalid VIN');
        }
      } catch {
        const fallback = decodeVIN(vin);
        if (fallback) {
          setVinStatus('warning');
          setVinError('Verification service offline. Proceeding with standard lookup.');
          setVehicle({ year: fallback.year, make: fallback.make, model: fallback.model });
        } else {
          setVinStatus('invalid');
          setVinError('Verification unavailable.');
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [vehicle.vin]);

  const addExtra = () => {
    const nextId = extraVehicles.length > 0 ? Math.max(...extraVehicles.map(v => v.id)) + 1 : 2;
    setExtraVehicles([...extraVehicles, { id: nextId, vin: '', year: '', make: '', model: '', decoded: null }]);
  };
  const removeExtra = (id: number) => setExtraVehicles(extraVehicles.filter(v => v.id !== id));
  const updateExtraVIN = (id: number, vin: string) => {
    const cleanVin = vin.toUpperCase().slice(0, 17);
    const extraDecoded = cleanVin.length >= 11 ? decodeVIN(cleanVin) : null;
    setExtraVehicles(extraVehicles.map(v => {
      if (v.id !== id) return v;
      return {
        ...v,
        vin: cleanVin,
        decoded: extraDecoded,
        year: v.year || extraDecoded?.year || '',
        make: v.make || extraDecoded?.make || '',
        model: v.model || extraDecoded?.model || '',
      };
    }));
  };
  const updateExtraField = (id: number, field: 'year' | 'make' | 'model', val: string) => {
    setExtraVehicles(extraVehicles.map(v => v.id === id ? { ...v, [field]: val } : v));
  };

  const canProceed = vehicle.vin.trim().length >= 11 && Boolean(vehicle.year?.trim()) && Boolean(vehicle.make?.trim()) && Boolean(vehicle.model?.trim());

  return (
    <div className="bg-white rounded-[20px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="mb-8">
        <h3 className="font-satoshi font-semibold text-[#111] text-[22px] mb-1">Vehicle identification</h3>
        <p className="font-inter text-[#5F6368] text-[14px]">Enter your 17-character VIN and confirm your vehicle year, make, and model.</p>
      </div>

      {/* VIN Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="font-inter text-[14px] font-medium text-[#111]">Vehicle Identification Number (VIN)</label>
          <span className="font-inter text-[12px] text-[#5F6368]">{vehicle.vin.length}/17 characters</span>
        </div>
        <input
          type="text"
          value={vehicle.vin}
          onChange={e => {
            const clean = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17);
            setVehicle({ vin: clean });
            setVinStatus('idle');
          }}
          placeholder="E.g., 1HGBH82633A004352"
          maxLength={17}
          className={`w-full h-[52px] px-5 rounded-[12px] border bg-[#FAFAFA] font-inter text-[15px] uppercase tracking-wider outline-none transition-all ${
            vinStatus === 'valid' ? 'border-[#168A5A] focus:border-[#168A5A]' :
            vinStatus === 'invalid' ? 'border-[#DC2626] focus:border-[#DC2626]' :
            'border-[#E6E8EB] focus:border-[#168A5A]'
          } focus:bg-white`}
        />
        <p className="font-inter text-[12px] text-[#8B949E] mt-2">Find it on your vehicle dashboard or registration document</p>

        {/* VIN Status Messages */}
        {vinStatus === 'checking' && (
          <div className="flex items-center gap-2 mt-3">
            <div className="w-4 h-4 border-2 border-[#168A5A] border-t-transparent rounded-full animate-spin" />
            <span className="font-inter text-[13px] text-[#5F6368]">Checking VIN...</span>
          </div>
        )}
        {vinStatus === 'invalid' && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-[#FEF2F2] rounded-[8px]">
            <X size={14} className="text-[#DC2626] shrink-0 mt-0.5" />
            <span className="font-inter text-[13px] text-[#991B1B]">{vinError}</span>
          </div>
        )}
        {vinStatus === 'warning' && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-[#FFF7ED] rounded-[8px]">
            <AlertTriangle size={14} className="text-[#C2410C] shrink-0 mt-0.5" />
            <span className="font-inter text-[13px] text-[#7C2D12]">{vinError}</span>
          </div>
        )}
      </div>

      {/* Manual / Editable Vehicle Details */}
      <div className="mb-6 bg-[#F9FAFB] border border-[#E6E8EB] rounded-[16px] p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="font-inter text-[14px] font-semibold text-[#111]">Vehicle Details</label>
          <span className="font-inter text-[11px] text-[#5F6368]">Auto-populated from VIN or enter manually</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">Year *</label>
            <input
              type="text"
              placeholder="e.g. 2022"
              maxLength={4}
              value={vehicle.year || ''}
              onChange={e => setVehicle({ year: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              className="w-full h-[46px] px-4 rounded-[10px] border border-[#E6E8EB] bg-white font-inter text-[14px] outline-none focus:border-[#168A5A] transition-all"
            />
          </div>
          <div>
            <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">Make *</label>
            <input
              type="text"
              placeholder="e.g. Toyota"
              value={vehicle.make || ''}
              onChange={e => setVehicle({ make: e.target.value })}
              className="w-full h-[46px] px-4 rounded-[10px] border border-[#E6E8EB] bg-white font-inter text-[14px] outline-none focus:border-[#168A5A] transition-all"
            />
          </div>
          <div>
            <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">Model *</label>
            <input
              type="text"
              placeholder="e.g. RAV4"
              value={vehicle.model || ''}
              onChange={e => setVehicle({ model: e.target.value })}
              className="w-full h-[46px] px-4 rounded-[10px] border border-[#E6E8EB] bg-white font-inter text-[14px] outline-none focus:border-[#168A5A] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Verified / Confirmed Vehicle Card */}
      {Boolean(vehicle.year && vehicle.make) && (
        <div className="border border-[#168A5A]/20 rounded-[16px] p-5 mb-6 bg-[#F0FDF4]/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#168A5A] flex items-center justify-center"><Check size={14} className="text-white" strokeWidth={3} /></div>
            <span className="font-inter text-[11px] font-bold tracking-[0.1em] text-[#168A5A] uppercase">Vehicle Selected</span>
          </div>
          <p className="font-inter text-[16px] font-semibold text-[#111] mb-1">{vehicle.year} {vehicle.make} {vehicle.model}</p>
          <p className="font-inter text-[12px] text-[#5F6368] mb-4">VIN: {vehicle.vin || 'Pending entry'}</p>
          <div className="w-full h-[120px] rounded-[12px] bg-gradient-to-br from-[#E8F5EE] to-[#D1E8DD] flex items-center justify-center"><Car size={48} className="text-[#168A5A]/30" /></div>
        </div>
      )}

      {/* Multi-Vehicle Discount Box */}
      <div className="border border-[#E6E8EB] rounded-[16px] p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#168A5A] font-inter text-[11px] font-bold uppercase tracking-[0.1em]">Multi-Vehicle Discount</span>
          <span className="text-[#5F6368] font-inter text-[11px]">&middot;</span>
          <span className="text-[#168A5A] font-inter text-[11px] font-bold">SAVE 20%</span>
        </div>
        <p className="font-inter text-[13px] text-[#5F6368] mb-4">Insuring 2 or more cars under the same driver? Add their VIN and models below and we&apos;ll apply a flat 20% off the combined premium automatically.</p>
        {extraVehicles.map(ev => (
          <div key={ev.id} className="mb-4 p-4 border border-[#E6E8EB] rounded-[14px] bg-[#FAFAFA]">
            <div className="flex items-center justify-between mb-2">
              <label className="font-inter text-[13px] font-semibold text-[#111]">VEHICLE #{ev.id}</label>
              <button onClick={() => removeExtra(ev.id)} className="text-[#9AA0A6] hover:text-[#DC2626] transition-colors"><Trash2 size={16} /></button>
            </div>
            <input type="text" value={ev.vin} onChange={e => updateExtraVIN(ev.id, e.target.value)} placeholder="Enter 17-character VIN..." maxLength={17}
              className="w-full h-[46px] px-4 rounded-[10px] border border-[#E6E8EB] bg-white font-inter text-[14px] uppercase tracking-wider outline-none focus:border-[#168A5A] transition-all mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" placeholder="Year (e.g. 2021)" value={ev.year || ''} onChange={e => updateExtraField(ev.id, 'year', e.target.value.slice(0, 4))}
                className="h-[40px] px-3 rounded-[8px] border border-[#E6E8EB] bg-white font-inter text-[13px] outline-none focus:border-[#168A5A]" />
              <input type="text" placeholder="Make (e.g. Honda)" value={ev.make || ''} onChange={e => updateExtraField(ev.id, 'make', e.target.value)}
                className="h-[40px] px-3 rounded-[8px] border border-[#E6E8EB] bg-white font-inter text-[13px] outline-none focus:border-[#168A5A]" />
              <input type="text" placeholder="Model (e.g. Civic)" value={ev.model || ''} onChange={e => updateExtraField(ev.id, 'model', e.target.value)}
                className="h-[40px] px-3 rounded-[8px] border border-[#E6E8EB] bg-white font-inter text-[13px] outline-none focus:border-[#168A5A]" />
            </div>
          </div>
        ))}
        <button onClick={addExtra} className="inline-flex items-center gap-2 font-inter text-[13px] font-semibold text-[#168A5A] border border-[#168A5A] px-5 py-2.5 rounded-xl hover:bg-[#E8F5EE] transition-all">
          <Plus size={16} />{extraVehicles.length === 0 ? 'Add another vehicle' : 'Add one more vehicle'}
        </button>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={onNext} disabled={!canProceed}
          className={`inline-flex items-center gap-2 font-inter text-[14px] font-semibold px-8 py-3.5 rounded-xl transition-all ${canProceed ? 'bg-[#168A5A] text-white hover:bg-[#1FA36A] active:scale-[0.98]' : 'bg-[#E6E8EB] text-[#B0B4B8] cursor-not-allowed'}`}>
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Step2Driver({ driver, setDriver, onNext, onBack }: { driver: DriverData; setDriver: (d: Partial<DriverData>) => void; onNext: () => void; onBack: () => void; }) {
  const [postalTouched, setPostalTouched] = useState(false);
  const [streetTouched, setStreetTouched] = useState(false);
  const [cityTouched, setCityTouched] = useState(false);

  const postalValidation = validatePostalCode(driver.postal);
  const postalValid = postalValidation.valid;
  const addressValid = Boolean(driver.street && driver.street.trim().length >= 3 && driver.city && driver.city.trim().length >= 2);
  const q1Valid = postalValid && addressValid;
  const licenseValid = driver.license !== '';
  // Age calculation and 18+ restriction
  const userAge = (() => {
    if (!driver.dob) return null;
    const dob = new Date(driver.dob);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  })();

  const isUnder18 = userAge !== null && userAge < 18;
  const dobValid = driver.dob !== '' && userAge !== null && userAge >= 18;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const contactValid = Boolean(
    driver.fullName && driver.fullName.trim().length >= 2 &&
    driver.email && emailRegex.test(driver.email.trim()) &&
    driver.phone && driver.phone.trim().length >= 7
  );

  const maxDate18 = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })();

  // Detect province on input (first 3 chars enough to determine province from first letter)
  const detectProvince = (postal: string) => {
    if (postal.length >= 1) {
      const result = validatePostalCode(postal);
      if (result.province) {
        setDriver({ province: result.province.code });
      } else {
        setDriver({ province: '' });
      }
    } else {
      setDriver({ province: '' });
    }
  };

  const getLicenseCards = (prov: string) => {
    switch (prov) {
      case 'BC':
        return [
          { id: 'G', title: 'Class 5', sub: 'Full passenger license' },
          { id: 'G2', title: 'Class 7', sub: 'Novice (N)' },
          { id: 'G1', title: 'Class 7L', sub: 'Learner (L)' },
          { id: 'COMMERCIAL', title: 'Class 4', sub: 'Taxi / limo / small bus / rideshare' },
        ];
      case 'ON':
        return [
          { id: 'G', title: 'G', sub: 'Full passenger license' },
          { id: 'G2', title: 'G2', sub: 'Probationary \u2014 1+ year driving' },
          { id: 'G1', title: 'G1', sub: 'Beginner \u2014 supervised only' },
          { id: 'COMMERCIAL', title: 'Class F / CZ', sub: 'Taxi / shuttle / small bus' },
        ];
      case 'AB':
        return [
          { id: 'G', title: 'Class 5 Full', sub: 'Full passenger license' },
          { id: 'G2', title: 'Class 5 GDL', sub: 'Probationary \u2014 1+ year driving' },
          { id: 'G1', title: 'Class 7', sub: 'Learner \u2014 supervised only' },
          { id: 'COMMERCIAL', title: 'Class 4', sub: 'Taxi / limo / small bus / rideshare' },
        ];
      case 'QC':
        return [
          { id: 'G', title: 'Class 5 Full', sub: 'Permis de conduire' },
          { id: 'G2', title: 'Probationary', sub: 'Permis probatoire' },
          { id: 'G1', title: 'Learner', sub: 'Permis d\'apprenti' },
          { id: 'COMMERCIAL', title: 'Class 4C', sub: 'Taxi / limousine / rideshare' },
        ];
      default:
        return [
          { id: 'G', title: 'Full License', sub: 'Full unrestricted license' },
          { id: 'G2', title: 'Probationary', sub: 'Novice \u2014 1+ year driving' },
          { id: 'G1', title: 'Learner / Beginner', sub: 'Supervised driving only' },
          { id: 'COMMERCIAL', title: 'Commercial Class 4', sub: 'Taxi / limo / rideshare' },
        ];
    }
  };

  const licenseCards = getLicenseCards(driver.province);
  const completedCount = [q1Valid, licenseValid, dobValid, contactValid].filter(Boolean).length;
  const canProceed = q1Valid && licenseValid && dobValid && contactValid;

  return (
    <div className="bg-white rounded-[20px] p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="mb-8">
        <h3 className="font-satoshi font-semibold text-[#111] text-[22px] mb-1">Driver &amp; Policyholder Info</h3>
        <p className="font-inter text-[#5F6368] text-[14px]">Each answer unlocks the next &mdash; license classes shown will match your province.</p>
      </div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-inter text-[12px] text-[#5F6368]">Progress</span>
          <span className="font-inter text-[12px] font-semibold text-[#168A5A]">{completedCount}/4</span>
        </div>
        <div className="w-full h-[6px] bg-[#E6E8EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#168A5A] rounded-full transition-all duration-500" style={{ width: `${(completedCount / 4) * 100}%` }} />
        </div>
      </div>

      {/* Q1 Postal & Residential Address Boxed Card */}
      <div className="border border-[#E6E8EB] rounded-[16px] p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          {q1Valid ? (
            <div className="w-8 h-8 rounded-full bg-[#168A5A] flex items-center justify-center shrink-0">
              <Check size={16} className="text-white" strokeWidth={3} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center shrink-0">
              <span className="font-inter text-[13px] font-bold text-white">1</span>
            </div>
          )}
          <h4 className="font-inter text-[15px] font-semibold text-[#111]">Postal Code &amp; Residential Address</h4>
        </div>
        <div className="ml-11">
          <div>
            <label className="block font-inter text-[12px] font-semibold text-[#111] mb-1.5">
              Postal Code (Zip Code) *
            </label>
            <input
              type="text"
              value={driver.postal}
              onChange={e => {
                const val = e.target.value.toUpperCase().slice(0, 12);
                setDriver({ postal: val });
                detectProvince(val);
              }}
              onBlur={() => setPostalTouched(true)}
              placeholder="e.g. M5V 2T6"
              className={`w-full h-[50px] px-5 rounded-[12px] border bg-[#FAFAFA] font-inter text-[15px] uppercase outline-none transition-all ${
                postalValidation.error && postalTouched
                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:bg-white'
                  : postalValid
                  ? 'border-[#168A5A] focus:border-[#168A5A] focus:bg-white'
                  : 'border-[#E6E8EB] focus:border-[#168A5A] focus:bg-white'
              }`}
            />
            {/* Error message */}
            {postalValidation.error && postalTouched && (
              <span className="inline-block mt-2 bg-[#FEF2F2] text-[#DC2626] font-inter text-[12px] font-semibold px-3 py-1 rounded-full">
                {postalValidation.error}
              </span>
            )}
            {/* Province detected */}
            {postalValidation.valid && postalValidation.province && (
              <span className="inline-block mt-2 bg-[#F0FDF4] text-[#168A5A] font-inter text-[12px] font-semibold px-3 py-1 rounded-full">
                Detected: {postalValidation.province.name} ({postalValidation.province.code})
              </span>
            )}
          </div>

          {/* Real residential address input for the Pink Slip card */}
          <div className="mt-5 pt-5 border-t border-[#E6E8EB] space-y-3">
            <div>
              <label className="block font-inter text-[12px] font-semibold text-[#111] mb-1.5">
                Complete Street Address (for official Pink Slip) *
              </label>
              <input
                type="text"
                value={driver.street || ''}
                onChange={e => setDriver({ street: e.target.value })}
                onBlur={() => setStreetTouched(true)}
                placeholder="e.g. 123 Main Street West, Apt 4B"
                className={`w-full h-[48px] px-4 rounded-[10px] border bg-white font-inter text-[14px] outline-none transition-all ${
                  streetTouched && (!driver.street || driver.street.trim().length < 3)
                    ? 'border-[#DC2626] focus:border-[#DC2626]'
                    : driver.street && driver.street.trim().length >= 3
                    ? 'border-[#168A5A] focus:border-[#168A5A]'
                    : 'border-[#E6E8EB] focus:border-[#168A5A]'
                }`}
              />
              {streetTouched && (!driver.street || driver.street.trim().length < 3) && (
                <span className="inline-block mt-1 text-[#DC2626] font-inter text-[11px] font-medium">
                  Please enter your street address
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-inter text-[12px] font-semibold text-[#111] mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={driver.city || ''}
                  onChange={e => setDriver({ city: e.target.value })}
                  onBlur={() => setCityTouched(true)}
                  placeholder="e.g. Toronto"
                  className={`w-full h-[48px] px-4 rounded-[10px] border bg-white font-inter text-[14px] outline-none transition-all ${
                    cityTouched && (!driver.city || driver.city.trim().length < 2)
                      ? 'border-[#DC2626] focus:border-[#DC2626]'
                      : driver.city && driver.city.trim().length >= 2
                      ? 'border-[#168A5A] focus:border-[#168A5A]'
                      : 'border-[#E6E8EB] focus:border-[#168A5A]'
                  }`}
                />
                {cityTouched && (!driver.city || driver.city.trim().length < 2) && (
                  <span className="inline-block mt-1 text-[#DC2626] font-inter text-[11px] font-medium">
                    Please enter your city
                  </span>
                )}
              </div>
              <div>
                <label className="block font-inter text-[12px] font-semibold text-[#111] mb-1.5">
                  Province
                </label>
                <input
                  type="text"
                  disabled
                  value={postalValidation.province ? `${postalValidation.province.name} (${postalValidation.province.code})` : driver.province || 'Auto-detected from postal code'}
                  className="w-full h-[48px] px-4 rounded-[10px] border border-[#E6E8EB] bg-[#F7F7F5] text-[#5F6368] font-inter text-[14px] cursor-not-allowed"
                />
              </div>
            </div>
            <p className="font-inter text-[11px] text-[#8B949E]">
              This exact residential address will be registered and printed on your official Canadian Motor Vehicle Liability Card (Pink Slip).
            </p>
          </div>
        </div>
      </div>

      {/* Q2 License Boxed Card */}
      <div className={`border border-[#E6E8EB] rounded-[16px] p-6 mb-6 transition-all duration-500 ${postalValid ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-3 mb-3">
          {licenseValid ? (
            <div className="w-8 h-8 rounded-full bg-[#168A5A] flex items-center justify-center shrink-0">
              <Check size={16} className="text-white" strokeWidth={3} />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${postalValid ? 'bg-[#111]' : 'bg-[#E6E8EB]'}`}>
              <span className={`font-inter text-[13px] font-bold ${postalValid ? 'text-white' : 'text-[#9AA0A6]'}`}>2</span>
            </div>
          )}
          <h4 className="font-inter text-[15px] font-semibold text-[#111]">Which {postalValidation.province ? postalValidation.province.name : ''} license do you hold?</h4>
        </div>
        <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {licenseCards.map(card => {
            const isActive = driver.license === card.id;
            return (
              <button key={card.id} onClick={() => setDriver({ license: card.id })}
                className={`relative p-4 rounded-[12px] border text-left transition-all duration-200 ${isActive ? 'border-2 border-[#168A5A] bg-[#F0FDF4]/30' : 'border border-[#E6E8EB] hover:border-[#168A5A]/40'}`}>
                {isActive && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#168A5A] flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></div>}
                <p className={`font-inter text-[16px] font-bold ${isActive ? 'text-[#168A5A]' : 'text-[#111]'}`}>{card.title}</p>
                <p className="font-inter text-[12px] text-[#5F6368] mt-1">{card.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Q3 DOB Boxed Card */}
      <div className={`border border-[#E6E8EB] rounded-[16px] p-6 mb-6 transition-all duration-500 ${licenseValid ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-3 mb-3">
          {dobValid ? (
            <div className="w-8 h-8 rounded-full bg-[#168A5A] flex items-center justify-center shrink-0">
              <Check size={16} className="text-white" strokeWidth={3} />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${licenseValid ? 'bg-[#111]' : 'bg-[#E6E8EB]'}`}>
              <span className={`font-inter text-[13px] font-bold ${licenseValid ? 'text-white' : 'text-[#9AA0A6]'}`}>3</span>
            </div>
          )}
          <h4 className="font-inter text-[15px] font-semibold text-[#111]">What&apos;s your date of birth? (Must be 18+)</h4>
        </div>
        <div className="ml-11">
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0A6]" />
            <input
              type="date"
              max={maxDate18}
              value={driver.dob}
              onChange={e => setDriver({ dob: e.target.value })}
              className={`w-full h-[52px] pl-12 pr-5 rounded-[12px] border bg-[#FAFAFA] font-inter text-[14px] outline-none transition-all ${
                isUnder18
                  ? 'border-[#DC2626] focus:border-[#DC2626] focus:bg-white'
                  : dobValid
                  ? 'border-[#168A5A] focus:border-[#168A5A] focus:bg-white'
                  : 'border-[#E6E8EB] focus:border-[#168A5A] focus:bg-white'
              }`}
            />
          </div>
          <p className="font-inter text-[12px] text-[#8B949E] mt-2">Drivers must be at least 18 years old. Under 25 pays an age-based rate premium.</p>
          {isUnder18 && (
            <span className="inline-block mt-2 bg-[#FEF2F2] text-[#DC2626] font-inter text-[12px] font-semibold px-3 py-1 rounded-full">
              Must be at least 18 years old to apply for auto insurance
            </span>
          )}
        </div>
      </div>

      {/* Q4 Contact Info Boxed Card */}
      <div className={`border border-[#E6E8EB] rounded-[16px] p-6 mb-6 transition-all duration-500 ${dobValid ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center gap-3 mb-3">
          {contactValid ? (
            <div className="w-8 h-8 rounded-full bg-[#168A5A] flex items-center justify-center shrink-0">
              <Check size={16} className="text-white" strokeWidth={3} />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dobValid ? 'bg-[#111]' : 'bg-[#E6E8EB]'}`}>
              <span className={`font-inter text-[13px] font-bold ${dobValid ? 'text-white' : 'text-[#9AA0A6]'}`}>4</span>
            </div>
          )}
          <h4 className="font-inter text-[15px] font-semibold text-[#111]">Primary Driver &amp; Policy Delivery</h4>
        </div>
        <p className="font-inter text-[12px] text-[#5F6368] mb-4 ml-11">Required for your official TD pink card and immediate email delivery of your policy documentation.</p>
        <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">Full Legal Name (as shown on Driver&apos;s License) *</label>
            <input
              type="text"
              placeholder="e.g. John Alexander Smith"
              value={driver.fullName || ''}
              onChange={e => setDriver({ fullName: e.target.value })}
              className="w-full h-[48px] px-4 rounded-[10px] border border-[#E6E8EB] bg-[#FAFAFA] font-inter text-[14px] outline-none focus:border-[#168A5A] focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">Email Address *</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={driver.email || ''}
              onChange={e => setDriver({ email: e.target.value })}
              className="w-full h-[48px] px-4 rounded-[10px] border border-[#E6E8EB] bg-[#FAFAFA] font-inter text-[14px] outline-none focus:border-[#168A5A] focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">Mobile Phone Number *</label>
            <input
              type="tel"
              placeholder="(416) 555-0199"
              value={driver.phone || ''}
              onChange={e => setDriver({ phone: e.target.value })}
              className="w-full h-[48px] px-4 rounded-[10px] border border-[#E6E8EB] bg-[#FAFAFA] font-inter text-[14px] outline-none focus:border-[#168A5A] focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <span className="inline-flex items-center gap-2 bg-[#F0FDF4] text-[#168A5A] font-inter text-[12px] font-medium px-4 py-2 rounded-full">
          <Check size={14} strokeWidth={2.5} />Your contact details are encrypted and used solely for issuing and delivering your policy documents.
        </span>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1 font-inter text-[14px] font-medium text-[#5F6368] hover:text-[#111] transition-colors"><ChevronLeft size={16} /> Back</button>
        <button onClick={onNext} disabled={!canProceed}
          className={`inline-flex items-center gap-2 font-inter text-[14px] font-semibold px-8 py-3.5 rounded-xl transition-all ${canProceed ? 'bg-[#168A5A] text-white hover:bg-[#1FA36A] active:scale-[0.98]' : 'bg-[#E6E8EB] text-[#B0B4B8] cursor-not-allowed'}`}>
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Step3Coverage({ coverage, setCoverage, onBack, onSubmitQuote, isSubmitting, basePrices, driver, extraVehicles, setPinkCard }: {
  coverage: CoverageData; setCoverage: (c: Partial<CoverageData>) => void;
  onBack: () => void; onSubmitQuote: () => void; isSubmitting?: boolean;
  basePrices: Record<string, { basic: number; full: number }>;
  driver: DriverData; extraVehicles: ExtraVehicle[];
  setPinkCard: (c: Partial<PinkCardData>) => void;
}) {
  // Seed from basePrices immediately, then update from API
  const bp = basePrices[coverage.term] || basePrices['3m'] || FALLBACK_PRICES['3m'];
  const [apiPrices, setApiPrices] = useState<{ basic: number; full: number } | null>(null);

  useEffect(() => {
    setApiPrices(null);
    const dob = driver.dob || '1990-01-01';
    const extraCount = extraVehicles.length;
    const extraDrivers = coverage.extraDrivers || 0;
    Promise.all([
      calculateQuote({ term: coverage.term, package_slug: 'basic', deductible: coverage.deductible, license_class: driver.license || 'G', date_of_birth: dob, extra_vehicle_count: extraCount, extra_driver_count: extraDrivers }),
      calculateQuote({ term: coverage.term, package_slug: 'full', deductible: coverage.deductible, license_class: driver.license || 'G', date_of_birth: dob, extra_vehicle_count: extraCount, extra_driver_count: extraDrivers }),
    ]).then(([basicRes, fullRes]) => {
      setApiPrices({ basic: Math.round(basicRes.final_price), full: Math.round(fullRes.final_price) });
    }).catch(() => {});
  }, [coverage.term, coverage.deductible, coverage.extraDrivers, driver.license, driver.dob, extraVehicles.length]);

  const localCalc = {
    basic: calculatePrice(coverage.term, 'basic', coverage.deductible, driver.license, driver.dob, extraVehicles, basePrices, coverage.extraDrivers || 0).price,
    full: calculatePrice(coverage.term, 'full', coverage.deductible, driver.license, driver.dob, extraVehicles, basePrices, coverage.extraDrivers || 0).price,
  };
  const displayPrices = apiPrices ?? localCalc;
  const basicPrice = displayPrices.basic;
  const fullPrice = displayPrices.full;

  const termOptions = [
    { id: '3m', label: '3 months', sub: 'Standard (Save 5%)', badge: '$190/mo', badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8]' },
    { id: '6m', label: '6 months', sub: 'Popular (Save 10%)', badge: 'POPULAR', badgeColor: 'bg-[#F0FDF4] text-[#168A5A]' },
    { id: '12m', label: '12 months', sub: 'Best Value (Save 15%)', badge: 'BEST VALUE', badgeColor: 'bg-[#FEF3C7] text-[#B45309]' },
  ];

  const basicChecks = ['Third-party liability', 'Accident benefits', 'Direct Compensation Property Damage', 'Uninsured automobile coverage'];
  const fullChecks = [...basicChecks, 'Collision coverage', 'Comprehensive coverage', 'Theft, fire, vandalism, hail protection'];

  const selectedExtraDrivers = coverage.extraDrivers ?? 0;
  const termMonths = coverage.term === '3m' ? 3 : coverage.term === '6m' ? 6 : 12;
  const isMonthly = coverage.billingFrequency === 'monthly';
  const basicMonthly = Math.round(basicPrice / termMonths);
  const fullMonthly = Math.round(fullPrice / termMonths);

  const handleDriverCountChange = (count: number) => {
    if (count === 0) {
      setCoverage({ extraDrivers: 0, additionalDriversList: [] });
      setPinkCard({ additionalDrivers: '' });
      return;
    }

    const existing = coverage.additionalDriversList || [];
    const list: AdditionalDriver[] = [];
    for (let i = 0; i < count; i++) {
      list.push(
        existing[i] || {
          id: i + 1,
          fullName: '',
          dob: '',
          licenseClass: driver.license || 'G',
          relationship: i === 0 ? 'Spouse / Partner' : 'Family Member',
        }
      );
    }
    setCoverage({ extraDrivers: count, additionalDriversList: list });
    const names = list.map(d => d.fullName.trim()).filter(Boolean).join(' & ');
    setPinkCard({ additionalDrivers: names });
  };

  const updateAdditionalDriver = (index: number, field: keyof AdditionalDriver, value: string) => {
    const currentList = coverage.additionalDriversList ? [...coverage.additionalDriversList] : [];
    if (!currentList[index]) {
      currentList[index] = { id: index + 1, fullName: '', dob: '', licenseClass: 'G', relationship: 'Spouse / Partner' };
    }
    currentList[index] = { ...currentList[index], [field]: value };
    setCoverage({ additionalDriversList: currentList });

    if (field === 'fullName') {
      const names = currentList.map(d => d.fullName.trim()).filter(Boolean).join(' & ');
      setPinkCard({ additionalDrivers: names });
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="mb-8">
        <h3 className="font-satoshi font-semibold text-[#111] text-[22px] mb-1">Choose your coverage</h3>
        <p className="font-inter text-[#5F6368] text-[14px]">
          {isMonthly
            ? `Pick your term and coverage level. Pay in equal monthly installments via e-Transfer — no credit check or bank auto-debits.`
            : `Pick your term and coverage level. Pay once via e-Transfer — you're fully covered for the entire term.`}
        </p>
      </div>

      {/* Term Selector */}
      <div className="mb-8">
        <label className="block font-inter text-[13px] font-medium text-[#111] mb-3">Coverage term</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {termOptions.map(t => {
            const isActive = coverage.term === t.id;
            return (
              <button key={t.id} onClick={() => setCoverage({ term: t.id })}
                className={`relative p-4 rounded-[12px] border text-left transition-all duration-200 ${isActive ? 'border-2 border-[#168A5A] bg-[#F0FDF4]/30' : 'border border-[#E6E8EB] hover:border-[#168A5A]/40'}`}>
                {t.badge && <span className={`absolute top-2 right-2 ${t.badgeColor} font-inter text-[10px] font-semibold px-2 py-0.5 rounded-full`}>{t.badge}</span>}
                <p className={`font-inter text-[14px] font-semibold ${isActive ? 'text-[#168A5A]' : 'text-[#111]'}`}>{t.label}</p>
                <p className="font-inter text-[12px] text-[#5F6368] mt-0.5">{t.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Schedule Selector (Full Term vs Monthly Installments) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block font-inter text-[13px] font-medium text-[#111]">Payment schedule</label>
          <span className="font-inter text-[11px] font-semibold text-[#168A5A] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#A7DAB9]">
            Flexible Payment Options
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCoverage({ billingFrequency: 'full' })}
            className={`p-4 rounded-[14px] border text-left transition-all duration-200 relative ${
              !isMonthly
                ? 'border-2 border-[#168A5A] bg-[#F0FDF4]/30 shadow-sm'
                : 'border-[#E6E8EB] hover:border-[#168A5A]/40 bg-white'
            }`}
          >
            {!isMonthly && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#168A5A] flex items-center justify-center">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <p className={`font-inter text-[15px] font-bold ${!isMonthly ? 'text-[#168A5A]' : 'text-[#111]'}`}>
                Pay Full Term (One-Time)
              </p>
              <span className="bg-[#E8F5EE] text-[#168A5A] font-inter text-[10px] font-bold px-2 py-0.5 rounded-full">
                Prepaid
              </span>
            </div>
            <p className="font-inter text-[12px] text-[#5F6368] leading-relaxed">
              One-time payment covers your entire {termLabels[coverage.term] || '6 months'}. No recurring auto-debits.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCoverage({ billingFrequency: 'monthly' })}
            className={`p-4 rounded-[14px] border text-left transition-all duration-200 relative ${
              isMonthly
                ? 'border-2 border-[#168A5A] bg-[#F0FDF4]/30 shadow-sm'
                : 'border-[#E6E8EB] hover:border-[#168A5A]/40 bg-white'
            }`}
          >
            {isMonthly && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#168A5A] flex items-center justify-center">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <p className={`font-inter text-[15px] font-bold ${isMonthly ? 'text-[#168A5A]' : 'text-[#111]'}`}>
                Pay Monthly (Installments)
              </p>
              <span className="bg-[#FEF3C7] text-[#B45309] font-inter text-[10px] font-bold px-2 py-0.5 rounded-full">
                No Credit Check · 0% Interest
              </span>
            </div>
            <p className="font-inter text-[12px] text-[#5F6368] leading-relaxed">
              Pay Month 1 today to activate your pink card, then {termMonths - 1} equal monthly e-Transfers.
            </p>
          </button>
        </div>
      </div>

      {/* ADDITIONAL DRIVERS · OPTIONAL Card */}
      <div className="border border-[#E6E8EB] rounded-[16px] p-6 mb-8 bg-white">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-inter text-[11px] font-bold uppercase tracking-[0.1em] text-[#168A5A]">
            ADDITIONAL DRIVERS &middot; INCLUDED FREE
          </span>
          <span className="bg-[#F0FDF4] border border-[#A7DAB9] text-[#168A5A] font-inter text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            $0 Extra Fee
          </span>
        </div>
        <h4 className="font-satoshi font-semibold text-[#111] text-[18px] sm:text-[20px] mb-1">
          Add a spouse, family member or secondary driver
        </h4>
        <p className="font-inter text-[13px] text-[#5F6368] mb-5">
          Secondary licensed drivers are <strong className="text-[#168A5A] font-semibold">100% free ($0 add-on)</strong> on all PolarGuard terms. Each additional driver receives complete liability, accident benefits, and policy coverage with their name printed on the official pink card.
        </p>

        {/* 3 Selectable Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { count: 0, title: 'Just me', sub: 'Primary driver only' },
            { count: 1, title: '+1 driver', sub: 'Included Free ($0)' },
            { count: 2, title: '+2 drivers', sub: 'Included Free ($0)' },
          ].map(opt => {
            const isActive = selectedExtraDrivers === opt.count;
            return (
              <button
                key={opt.count}
                type="button"
                onClick={() => handleDriverCountChange(opt.count)}
                className={`p-4 rounded-[14px] border text-center transition-all duration-200 ${
                  isActive
                    ? 'border-2 border-[#168A5A] bg-[#F0FDF4]/40 shadow-sm'
                    : 'border-[#E6E8EB] hover:border-[#168A5A]/40 bg-white'
                }`}
              >
                <p className={`font-inter text-[15px] font-bold ${isActive ? 'text-[#168A5A]' : 'text-[#111]'}`}>
                  {opt.title}
                </p>
                <p className={`font-inter text-[12px] mt-1 ${isActive ? 'text-[#168A5A] font-semibold' : 'text-[#5F6368]'}`}>
                  {opt.sub}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Additional Driver Information Input Form */}
        {selectedExtraDrivers > 0 && (
          <div className="space-y-4 mb-5 pt-4 border-t border-[#E6E8EB]">
            {(coverage.additionalDriversList || []).slice(0, selectedExtraDrivers).map((ad, idx) => (
              <div key={ad.id || idx} className="p-4 sm:p-5 border border-[#168A5A]/30 rounded-[14px] bg-[#FBFDFB]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#168A5A] text-white flex items-center justify-center font-inter text-[12px] font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-inter text-[14px] font-bold text-[#111]">
                      Additional Driver #{idx + 1} Information
                    </span>
                  </div>
                  <span className="bg-[#F0FDF4] text-[#168A5A] font-inter text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#A7DAB9]">
                    FREE ($0)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">
                      Full Legal Name (as shown on Driver&apos;s Licence) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Marie Smith"
                      value={ad.fullName || ''}
                      onChange={e => updateAdditionalDriver(idx, 'fullName', e.target.value)}
                      className="w-full h-[46px] px-4 rounded-[10px] border border-[#E6E8EB] bg-white font-inter text-[14px] outline-none focus:border-[#168A5A] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">
                      Relationship to Primary Driver
                    </label>
                    <select
                      value={ad.relationship || 'Spouse / Partner'}
                      onChange={e => updateAdditionalDriver(idx, 'relationship', e.target.value)}
                      className="w-full h-[46px] px-3 rounded-[10px] border border-[#E6E8EB] bg-white font-inter text-[13px] outline-none focus:border-[#168A5A] transition-all"
                    >
                      <option value="Spouse / Partner">Spouse / Partner</option>
                      <option value="Child / Dependant">Child / Dependant</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Roommate">Roommate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">
                      Licence Class
                    </label>
                    <select
                      value={ad.licenseClass || 'G'}
                      onChange={e => updateAdditionalDriver(idx, 'licenseClass', e.target.value)}
                      className="w-full h-[46px] px-3 rounded-[10px] border border-[#E6E8EB] bg-white font-inter text-[13px] outline-none focus:border-[#168A5A] transition-all"
                    >
                      <option value="G">Full Licence (Class 5 / G)</option>
                      <option value="G2">Probationary / Novice (G2 / Class 7)</option>
                      <option value="G1">Learner / Beginner (G1 / Class 7L)</option>
                      <option value="COMMERCIAL">Commercial / Class 4</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={ad.dob || ''}
                      onChange={e => updateAdditionalDriver(idx, 'dob', e.target.value)}
                      className="w-full h-[46px] px-4 rounded-[10px] border border-[#E6E8EB] bg-white font-inter text-[13px] outline-none focus:border-[#168A5A] transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rate breakdown box */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] p-4 font-inter text-[12.5px] text-[#475569]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#168A5A] shrink-0" />
            <span>
              Zero additional charge ($0) for adding secondary drivers. All drivers receive complete coverage under your policy and appear on your TD pink slip.
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block font-inter text-[13px] font-medium text-[#111] mb-3">Coverage type</label>
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={() => setCoverage({ type: 'basic' })}
            className={`relative p-6 rounded-[16px] border text-left transition-all duration-200 ${coverage.type === 'basic' ? 'border-2 border-[#168A5A] bg-[#F0FDF4]/30' : 'border border-[#E6E8EB] hover:border-[#168A5A]/40'}`}>
            {coverage.type === 'basic' && <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#168A5A] flex items-center justify-center"><Check size={14} className="text-white" strokeWidth={3} /></div>}
            <h4 className="font-inter text-[16px] font-semibold text-[#111] mb-1">Basic Coverage</h4>
            <p className="font-inter text-[12px] text-[#5F6368] mb-4">Provincial minimums + liability protection</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-satoshi text-[32px] font-bold text-[#111]">
                ${isMonthly ? basicMonthly : basicPrice}
              </span>
              <span className="font-inter text-[14px] text-[#5F6368]">
                {isMonthly ? 'CAD / mo' : 'CAD'}
              </span>
              {!isMonthly && (
                <span className="font-inter text-[12px] font-semibold text-[#168A5A] ml-2">(${basicMonthly}/mo)</span>
              )}
            </div>
            {apiPrices && bp.basic !== apiPrices.basic && !isMonthly && <p className="font-inter text-[12px] text-[#9AA0A6] line-through mb-1">${bp.basic}</p>}
            <p className="font-inter text-[12px] text-[#5F6368] mb-4">
              {isMonthly
                ? `Pay $${basicMonthly} CAD today to activate · ${termMonths} monthly installments via e-Transfer (Total $${basicPrice} CAD)`
                : `One-time payment, covers full ${termLabels[coverage.term] || '3 months'}`}
            </p>
            <ul className="space-y-2">{basicChecks.map(item => <li key={item} className="flex items-center gap-2"><Check size={14} className="text-[#168A5A] shrink-0" strokeWidth={2.5} /><span className="font-inter text-[13px] text-[#111]">{item}</span></li>)}</ul>
          </button>
          <button onClick={() => setCoverage({ type: 'full' })}
            className={`relative p-6 rounded-[16px] border text-left transition-all duration-200 ${coverage.type === 'full' ? 'border-2 border-[#168A5A] bg-[#F0FDF4]/30' : 'border border-[#E6E8EB] hover:border-[#168A5A]/40'}`}>
            <span className="absolute top-4 left-4 bg-[#C2410C] text-white font-inter text-[10px] font-bold px-2 py-0.5 rounded-full">RECOMMENDED</span>
            {coverage.type === 'full' && <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#168A5A] flex items-center justify-center"><Check size={14} className="text-white" strokeWidth={3} /></div>}
            <h4 className="font-inter text-[16px] font-semibold text-[#111] mb-1 mt-6">Full Coverage</h4>
            <p className="font-inter text-[12px] text-[#5F6368] mb-4">Maximum protection for your vehicle</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-satoshi text-[32px] font-bold text-[#111]">
                ${isMonthly ? fullMonthly : fullPrice}
              </span>
              <span className="font-inter text-[14px] text-[#5F6368]">
                {isMonthly ? 'CAD / mo' : 'CAD'}
              </span>
              {!isMonthly && (
                <span className="font-inter text-[12px] font-semibold text-[#168A5A] ml-2">(${fullMonthly}/mo)</span>
              )}
            </div>
            {apiPrices && bp.full !== apiPrices.full && !isMonthly && <p className="font-inter text-[12px] text-[#9AA0A6] line-through mb-1">${bp.full}</p>}
            <p className="font-inter text-[12px] text-[#5F6368] mb-4">
              {isMonthly
                ? `Pay $${fullMonthly} CAD today to activate · ${termMonths} monthly installments via e-Transfer (Total $${fullPrice} CAD)`
                : `One-time payment, covers full ${termLabels[coverage.term] || '3 months'}`}
            </p>
            <ul className="space-y-2">{fullChecks.map(item => <li key={item} className="flex items-center gap-2"><Check size={14} className="text-[#168A5A] shrink-0" strokeWidth={2.5} /><span className="font-inter text-[13px] text-[#111]">{item}</span></li>)}</ul>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold">
            Collision &amp; Comprehensive Deductible
          </p>
          <span className="font-inter text-[11px] text-[#168A5A] font-semibold">
            {coverage.type === 'basic'
              ? 'Applies to Full Coverage'
              : (coverage.deductible === '500'
                  ? `+$${DEDUCTIBLE_ADDON[coverage.term] ?? 80} CAD (${isMonthly ? `+$${Math.round((DEDUCTIBLE_ADDON[coverage.term] ?? 80) / termMonths)}/mo` : 'selected'})`
                  : 'Standard best rate (Included)')}
          </span>
        </div>
        <p className="font-inter text-[12px] text-[#8B949E] mb-3">
          The amount you&apos;d pay out of pocket on a claim before insurance kicks in.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: '1000',
              label: '$1,000',
              badge: 'Standard · Best Rate',
              sub: 'Included in base rate (pay first $1,000 of claim)',
              cost: '+$0',
            },
            {
              id: '500',
              label: '$500',
              badge: 'Lower Out-of-Pocket',
              sub: `You pay only first $500 on a claim (+${isMonthly ? `$${Math.round((DEDUCTIBLE_ADDON[coverage.term] ?? 80) / termMonths)}/mo` : `$${DEDUCTIBLE_ADDON[coverage.term] ?? 80} CAD`})`,
              cost: `+${isMonthly ? `$${Math.round((DEDUCTIBLE_ADDON[coverage.term] ?? 80) / termMonths)}/mo` : `$${DEDUCTIBLE_ADDON[coverage.term] ?? 80}`}`,
            },
          ].map(d => {
            const isActive = coverage.deductible === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setCoverage({ deductible: d.id })}
                className={`p-4 rounded-[14px] border text-left transition-all duration-200 relative ${
                  isActive
                    ? 'border-2 border-[#168A5A] bg-[#F0FDF4]/30 shadow-sm'
                    : 'border border-[#E6E8EB] hover:border-[#168A5A]/40 bg-white'
                }`}
              >
                {isActive && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#168A5A] flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-inter text-[16px] font-bold ${isActive ? 'text-[#168A5A]' : 'text-[#111]'}`}>
                    {d.label} Deductible
                  </p>
                  <span className={`font-inter text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    d.id === '1000' ? 'bg-[#E8F5EE] text-[#168A5A]' : 'bg-[#FEF3C7] text-[#B45309]'
                  }`}>
                    {d.badge}
                  </span>
                </div>
                <p className="font-inter text-[12px] text-[#5F6368] leading-relaxed">
                  {d.sub}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8 bg-[#F0FDF4] border border-[#A7DAB9] rounded-[12px] p-5 flex items-start gap-3">
        <CheckCircle2 size={18} className="text-[#168A5A] shrink-0 mt-0.5" />
        <p className="font-inter text-[13px] text-[#064E3B] leading-relaxed">Your policy will be issued under TD Insurance. PolarGuard places your coverage with TD General Insurance Company &mdash; a federally regulated Canadian insurer. You&apos;ll receive an official TD pink card after activation.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-[#E6E8EB]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1 font-inter text-[14px] font-medium text-[#5F6368] hover:text-[#111] transition-colors py-2"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <button
          type="button"
          onClick={onSubmitQuote}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 bg-[#168A5A] hover:bg-[#1FA36A] text-white font-inter text-[15px] font-semibold px-8 py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-[#168A5A]/20 disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Submitting &amp; Sending Email...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Submit &amp; Send Quote via Email</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] flex items-center justify-between gap-3 text-[12.5px] text-[#5F6368]">
        <div className="flex items-center gap-2">
          <Mail size={15} className="text-[#168A5A] shrink-0" />
          <span>
            Automated delivery to <strong className="text-[#111]">{driver.email || 'your email'}</strong> with your official TD quote &amp; e-Transfer details.
          </span>
        </div>
        <span className="font-semibold text-[#168A5A] shrink-0 hidden sm:inline">Free &amp; Instant</span>
      </div>
    </div>
  );
}

function QuotePreview({ vehicle, driver, coverage, extraVehicles, pinkCard, setPinkCard, refNum, onBack, onActivate, basePrices }: {
  vehicle: VehicleData; driver: DriverData; coverage: CoverageData; extraVehicles: ExtraVehicle[];
  pinkCard: PinkCardData; setPinkCard: (c: Partial<PinkCardData>) => void;
  refNum: string;
  onBack: () => void; onActivate: () => void;
  basePrices: Record<string, { basic: number; full: number }>;
}) {
  const decoded = vehicle.vin.length >= 11 ? decodeVIN(vehicle.vin) : null;

  // Use API quote; fall back to local calc while loading or on error
  const [apiPrice, setApiPrice] = useState<number | null>(null);
  const [apiLabel, setApiLabel] = useState<string | null>(null);
  useEffect(() => {
    const dob = driver.dob || '1990-01-01';
    calculateQuote({
      term: coverage.term as '1m'|'3m'|'6m'|'12m',
      package_slug: (coverage.type === 'basic' ? 'basic' : 'full') as 'basic'|'full',
      deductible: coverage.deductible as '500'|'1000',
      license_class: (driver.license || 'G') as 'G'|'G2'|'G1',
      date_of_birth: dob,
      extra_vehicle_count: extraVehicles.length,
      extra_driver_count: coverage.extraDrivers || 0,
    }).then(result => {
      setApiPrice(result.final_price);
      setApiLabel(result.term_label);
    }).catch(() => {
      // fall back silently
    });
  }, [coverage, driver, extraVehicles.length]);

  const localPrice = calculatePrice(coverage.term, coverage.type, coverage.deductible, driver.license, driver.dob, extraVehicles, basePrices, coverage.extraDrivers || 0);
  const price = {
    price: apiPrice ?? localPrice.price,
    original: localPrice.original,
    label: apiLabel ?? localPrice.label,
  };

  const isMonthly = coverage.billingFrequency === 'monthly';
  const termMonths = coverage.term === '3m' ? 3 : coverage.term === '6m' ? 6 : 12;
  const totalPrice = price.price;
  const monthlyPrice = Math.round(totalPrice / termMonths);
  const dueToday = isMonthly ? monthlyPrice : totalPrice;

  // Countdown timer — 30 minutes from quote generation
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft > 0 && timeLeft < 60; // under 1 minute

  const postalInfo = validatePostalCode(driver.postal);
  const additionalDriversNames = (coverage.additionalDriversList && coverage.additionalDriversList.length > 0)
    ? coverage.additionalDriversList.map(d => d.fullName.trim()).filter(Boolean).join(' & ')
    : (pinkCard.additionalDrivers || '');

  const additionalDriversValue = (coverage.extraDrivers ?? 0) === 0
    ? 'Just me (0 extra drivers)'
    : `+${coverage.extraDrivers} extra driver${coverage.extraDrivers! > 1 ? 's' : ''} (Free · $0)${additionalDriversNames ? ` — ${additionalDriversNames}` : ''}`;

  const summaryRows = [
    { label: 'VEHICLE', value: vehicle.year ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '\u2014' },
    ...(extraVehicles.length > 0 ? [
      { label: 'EXTRA VEHICLES', value: `${extraVehicles.length} extra vehicle${extraVehicles.length > 1 ? 's' : ''} (20% Multi-Car Discount Applied)` }
    ] : []),
    { label: 'VIN', value: vehicle.vin },
    { label: 'LICENSE', value: driver.license || '\u2014' },
    { label: 'DOB', value: driver.dob || '\u2014' },
    { label: 'ADDRESS', value: [driver.street, driver.city].filter(Boolean).join(', ') || '\u2014' },
    { label: 'POSTAL', value: (cleanPostalCode(driver.postal) || driver.postal) + (postalInfo.province ? ` (${postalInfo.province.name})` : '') },
    { label: 'ADDITIONAL DRIVERS', value: additionalDriversValue },
    { label: 'COVERAGE', value: coverage.type === 'basic' ? 'Basic' : 'Full' },
    { label: 'DEDUCTIBLE', value: coverage.type === 'full' ? `$${coverage.deductible || '1000'} CAD` : 'N/A (Basic Liability)' },
    { label: 'PAYMENT PLAN', value: isMonthly ? `Monthly Installments (${termMonths} payments of $${monthlyPrice} CAD)` : 'Full Term Prepaid (One-Time)' },
    { label: 'DUE TODAY', value: isMonthly ? `$${dueToday} CAD (Month 1 of ${termMonths})` : `$${dueToday} CAD` },
    { label: 'TERM', value: (termLabels[coverage.term] || '3 months') + (isMonthly ? ' (Monthly Plan)' : ' prepaid') },
  ];

  return (
    <div className="bg-white rounded-[20px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex flex-col sm:row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-satoshi font-semibold text-[#111] text-[28px] sm:text-[32px]">Auto Insurance Quote Preview</h2>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="font-inter text-[14px] text-[#5F6368] hover:text-[#111] transition-colors">Edit details</button>
          <button onClick={onBack} className="font-inter text-[14px] font-medium text-[#111] border border-[#E6E8EB] px-4 py-2 rounded-lg hover:border-[#168A5A] transition-colors">Start over</button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="bg-[#FFF7ED] text-[#C2410C] font-inter text-[11px] font-bold px-3 py-1 rounded-full">Application Review</span>
        <span className="bg-[#168A5A] text-white font-inter text-[11px] font-bold px-3 py-1 rounded-full">Vehicle Verified</span>
        <span className="bg-[#168A5A] text-white font-inter text-[11px] font-bold px-3 py-1 rounded-full">Quote Preview Generated</span>
        {extraVehicles.length > 0 && (
          <span className="bg-[#168A5A] text-white font-inter text-[11px] font-bold px-3 py-1 rounded-full">20% Multi-Vehicle Discount</span>
        )}
      </div>
      <p className="font-inter text-[12px] text-[#9AA0A6] mb-6">Ref: {refNum}</p>

      {/* Application Progress */}
      <div className="mb-8">
        <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold mb-4">Application Progress</p>
        <div className="space-y-3">
          {['Vehicle Confirmed', 'Driver Info Added', 'Coverage Selected', 'e-Transfer Uploaded', 'Payment Verified'].map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              {i < 3 ? <CheckCircle2 size={18} className="text-[#168A5A] shrink-0" /> : <Circle size={18} className="text-[#E6E8EB] shrink-0" />}
              <span className={`font-inter text-[14px] ${i < 3 ? 'text-[#111]' : 'text-[#9AA0A6]'}`}>{label}</span>
            </div>
          ))}
        </div>
        <p className="font-inter text-[12px] text-[#9AA0A6] mt-3">All sections are reviewed by a licensed broker before activation.</p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-12">

        {/* LEFT — Full width for details */}
        <div className="flex-1 min-w-0">

          {/* Car Image */}
          {decoded && (
            <div className="bg-[#F7F7F5] rounded-[12px] p-4 mb-8 w-[280px]">
              <div className="w-full h-[180px] rounded-[12px] bg-gradient-to-br from-[#E8F5EE] to-[#D1E8DD] flex items-center justify-center">
                <Car size={56} className="text-[#168A5A]/30" />
              </div>
              <p className="font-inter text-[13px] font-medium text-[#111] mt-3">{decoded.year} {decoded.make} {decoded.model}</p>
            </div>
          )}

          {/* Details — 160px label + 1fr value, full width */}
          <div className="border-t border-[#E6E8EB] pt-6 mb-8">
            <p className="font-inter text-[11px] uppercase tracking-[0.08em] text-[#5F6368] font-semibold mb-5">Details</p>
            <div className="grid grid-cols-[160px_1fr] gap-x-8 gap-y-5">
              {summaryRows.map(row => (
                <div key={row.label} className="contents">
                  <p className="font-inter text-[11px] uppercase tracking-[0.08em] text-[#9AA0A6] pt-0.5">{row.label}</p>
                  <p className="font-inter text-[15px] font-medium text-[#111] break-all">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pink Card Form */}
          <div className="border-t border-[#E6E8EB] pt-6 mb-8">
            <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold mb-1">Fill Out Your Pink Card</p>
            <p className="font-inter text-[12px] text-[#8B949E] mb-4">These details print on your TD pink card. Match them to your driver&apos;s licence.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Full name (Primary)" value={pinkCard.fullName} onChange={e => setPinkCard({ fullName: e.target.value })} className="w-full h-[48px] px-4 rounded-[10px] border border-[#E6E8EB] bg-[#FAFAFA] font-inter text-[14px] outline-none focus:border-[#168A5A] focus:bg-white transition-all" />
              <input type="text" placeholder="Additional drivers on card (e.g. Jane Smith)" value={pinkCard.additionalDrivers || ''} onChange={e => setPinkCard({ additionalDrivers: e.target.value })} className="w-full h-[48px] px-4 rounded-[10px] border border-[#E6E8EB] bg-[#FAFAFA] font-inter text-[14px] outline-none focus:border-[#168A5A] focus:bg-white transition-all" />
              <input type="text" placeholder="Street address" value={pinkCard.street} onChange={e => setPinkCard({ street: e.target.value })} className="w-full h-[48px] px-4 rounded-[10px] border border-[#E6E8EB] bg-[#FAFAFA] font-inter text-[14px] outline-none focus:border-[#168A5A] focus:bg-white transition-all" />
              <input type="text" placeholder="City/town" value={pinkCard.city} onChange={e => setPinkCard({ city: e.target.value })} className="w-full h-[48px] px-4 rounded-[10px] border border-[#E6E8EB] bg-[#FAFAFA] font-inter text-[14px] outline-none focus:border-[#168A5A] focus:bg-white transition-all" />
            </div>
          </div>

          {/* Insurance Card Preview */}
          <div className="border-t border-[#E6E8EB] pt-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold">Insurance Card Preview</p>
              <span className="font-inter text-[11px] text-[#9AA0A6]">Motor Vehicle Liability &mdash; Sample</span>
            </div>
            <div className="relative bg-gradient-to-br from-[#FCE7F3] to-[#FBCFE8] rounded-[12px] min-h-[200px] overflow-hidden mb-4">
              <div className="absolute inset-0 bg-[#081826]/70 rounded-[12px] flex flex-col items-center justify-center gap-2 px-8 py-10">
                <Lock size={32} className="text-white/60 mb-1" />
                <p className="font-inter text-[16px] font-bold text-white tracking-wide">UNLOCK WITH PAYMENT</p>
                <p className="font-inter text-[13px] text-white/60">Pink Slip locked</p>
                <p className="font-inter text-[12px] text-white/40">Available after payment is verified</p>
                <button className="mt-3 font-inter text-[13px] text-white/50 border border-white/25 px-6 py-2.5 rounded-lg cursor-not-allowed">
                  Download TD Pink Slip
                </button>
              </div>
              <div className="p-6 opacity-0">
                <p className="font-inter text-[16px] font-bold text-[#9D174D]">TD Insurance</p>
                <p className="font-inter text-[12px] text-[#9D174D]/70 mt-4">Pink Card # {refNum}</p>
              </div>
            </div>

            {/* Single CTA button */}
            <button
              onClick={onActivate}
              disabled={isExpired}
              className={`w-full font-inter text-[15px] font-semibold h-[52px] rounded-[12px] transition-all flex items-center justify-center gap-2 ${
                isExpired
                  ? 'bg-[#E6E8EB] text-[#9AA0A6] cursor-not-allowed'
                  : 'bg-[#168A5A] hover:bg-[#1FA36A] text-white'
              }`}
            >
              <Sparkles size={18} /> {isExpired ? 'Quote Expired' : 'Activate Policy Now'}
            </button>

            <div className="flex items-center gap-3 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="font-inter text-[12px] text-[#5F6368]">QA overlay</span>
              </label>
              <span className="bg-[#FFF7ED] text-[#C2410C] font-inter text-[10px] font-bold px-2 py-0.5 rounded-full">Preview only</span>
            </div>
          </div>
        </div>

        {/* RIGHT — Sidebar: Live Summary + Payment Card */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-6">

          {/* Live Summary */}
          <div className="bg-white border border-[#E6E8EB] rounded-[16px] p-6">
            <p className="font-inter text-[11px] uppercase tracking-[0.12em] text-[#5F6368] font-semibold mb-5">Live Summary</p>
            <div className="space-y-4 mb-6">
              {summaryRows.map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="font-inter text-[11px] uppercase tracking-[0.08em] text-[#8B949E]">{row.label}</span>
                  <span className="font-inter text-[13px] font-medium text-[#111] text-right max-w-[200px] break-all">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E6E8EB] pt-4">
              <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#5F6368] font-semibold mb-2">
                {isMonthly ? 'Due Today (Month 1)' : 'Estimated Rate'}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-satoshi text-[36px] font-bold text-[#111] leading-none">${dueToday}</span>
                <span className="font-inter text-[14px] text-[#5F6368]">{isMonthly ? 'CAD / mo' : 'CAD'}</span>
              </div>
              <p className="font-inter text-[12px] text-[#5F6368] mt-2 leading-relaxed">
                {isMonthly
                  ? `Pay $${dueToday} CAD today to activate your TD pink card. Remaining ${termMonths - 1} installments of $${dueToday} CAD paid monthly via e-Transfer (Total $${totalPrice} CAD).`
                  : `One-time prepaid for full ${termLabels[coverage.term] || '3 months'}. No monthly billing.`}
              </p>
            </div>
          </div>

          {/* Dark Payment Card */}
          <div className="rounded-[16px] p-6" style={{ background: 'linear-gradient(135deg, #0a2f1d 0%, #081826 100%)' }}>
            <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-white/40 mb-4">
              {isMonthly ? `Monthly Plan &middot; ${termLabels[coverage.term] || '3 months'}` : `Negotiated ${termLabels[coverage.term] || '3 months'} Rate`}
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-satoshi text-[44px] font-bold text-white leading-none">${dueToday}</span>
              <span className="font-inter text-[16px] text-white/50">{isMonthly ? 'CAD / mo' : 'CAD'}</span>
            </div>
            <p className="font-inter text-[13px] text-white/50 mb-6 leading-relaxed">
              {isMonthly
                ? `Pay $${dueToday} CAD today to activate Month 1 &mdash; your official TD pink card is issued immediately. The remaining ${termMonths - 1} installments ($${dueToday}/mo) are sent monthly via e-Transfer.`
                : `Pay $${totalPrice} CAD once &mdash; you&apos;re covered for the full ${termLabels[coverage.term] || '3 months'}. No monthly billing. Renewable at term end.`}
            </p>
            <div className="bg-white/5 border border-white/10 rounded-[10px] p-4 mb-6">
              <p className="font-inter text-[12px] text-white/50 leading-relaxed">
                Your ${coverage.deductible} deductible is only what you&apos;d pay if you ever file a claim &mdash; it&apos;s not an extra charge on top of your premium.
              </p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              {!isExpired && <span className={`w-2 h-2 rounded-full animate-pulse ${isUrgent ? 'bg-[#DC2626]' : 'bg-[#F97316]'}`} />}
              <span className={`font-inter text-[13px] font-medium ${isExpired ? 'text-[#DC2626]' : isUrgent ? 'text-[#DC2626]' : 'text-[#F97316]'}`}>
                {isExpired ? 'Quote expired' : `Quote expires in ${minutes}:${seconds.toString().padStart(2, '0')}`}
              </span>
            </div>
            <p className="font-inter text-[11px] text-white/30">Limited discounted slots available</p>
            <p className="font-inter text-[11px] text-white/40 mt-6 leading-relaxed">
              Once your e-Transfer screenshot is uploaded, a licensed broker matches it to the incoming payment, then emails your TD pink card along with your full coverage documents &mdash; ready in 15-25 minutes.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Pink Slip Card Sub-Component ───────────────────────────
function PinkSlipCard({ paymentConfirmed, previewUnlocked, hasUsedPreview, relockTimeLeft, onUnlock, pinkCard, vehicle, coverage, policyNumber, driver }: {
  paymentConfirmed: boolean; previewUnlocked: boolean; hasUsedPreview: boolean; relockTimeLeft: number;
  onUnlock: () => void; pinkCard: PinkCardData; vehicle: VehicleData; coverage: CoverageData; policyNumber: string; driver?: DriverData;
}) {

  // Calculate effective and expiry dates from coverage term
  const termMonths: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
  const eff = new Date();
  const exp = new Date();
  exp.setMonth(exp.getMonth() + (termMonths[coverage.term] || 3));

  const effYear = String(eff.getFullYear());
  const effMonth = String(eff.getMonth() + 1).padStart(2, '0');
  const effDay = String(eff.getDate()).padStart(2, '0');
  const expYear = String(exp.getFullYear());
  const expMonth = String(exp.getMonth() + 1).padStart(2, '0');
  const expDay = String(exp.getDate()).padStart(2, '0');

  // Dynamic insured info from pink card form
  const primaryName = (pinkCard.fullName || driver?.fullName || 'JOHN A. SMITH').toUpperCase();
  const additionalNames = pinkCard.additionalDrivers ? ` & ${pinkCard.additionalDrivers.toUpperCase()}` : '';
  const insuredName = `${primaryName}${additionalNames}`;
  const insuredStreet = (pinkCard.street || driver?.street || '123 MAIN STREET').toUpperCase();
  const rawCity = (pinkCard.city || driver?.city || 'TORONTO').toUpperCase();
  const rawProv = (driver?.province || 'ON').toUpperCase();
  const rawPostal = (driver?.postal || 'M5V 2T6').toUpperCase();
  const insuredCity = `${rawCity}, ${rawProv} ${rawPostal}`;

  // Vehicle info
  const vehicleInfo = `${vehicle.year || '2016'} ${vehicle.make || 'E-ONE'} ${vehicle.model || 'TRUCK'}`.toUpperCase();
  const vinDisplay = (vehicle.vin || '4EN6AAA82G1000278').toUpperCase();

  // Cell styles — left padding 12px on text columns
  // Cell styles — left padding 8px on text columns
  const thBase: CSSProperties = { border: '1px solid #333', padding: '2px 2px', fontSize: '7.5px', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'top', lineHeight: 1.0, background: 'rgba(255,255,255,0.25)', height: '24px' };
  const tdBase: CSSProperties = { border: '1px solid #333', padding: '4px 2px', fontSize: '9.5px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle', color: '#1a1a1a' };
  const thLeft: CSSProperties = { ...thBase, padding: '2px 2px 2px 8px', textAlign: 'left' };
  const tdLeft: CSSProperties = { ...tdBase, padding: '4px 2px 4px 8px', textAlign: 'left' };

  return (
    <div className="w-full max-w-[600px] mx-auto shrink-0">
      <div
        id="active-pink-slip-card"
        className={`relative rounded-[8px] overflow-hidden ${!paymentConfirmed && !previewUnlocked && !hasUsedPreview ? 'cursor-pointer' : ''}`}
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)', paddingBottom: '62.8%' }}
        onClick={onUnlock}
      >
        {/* ── Background image layer — AS-IS, no opacity, no color overlay ── */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <img
            src="/images/pink-crests-background.png"
            alt=""
            className="w-full h-full"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* ── Content layer ── */}
        <div className="absolute inset-0" style={{ zIndex: 1, fontFamily: '"Times New Roman", Times, serif' }}>
          <div className={`h-full flex flex-col ${!paymentConfirmed && !previewUnlocked ? 'blur-[5px]' : ''}`}>

            {/* Header — NO background, black text, left padding 20px */}
            <div className="relative shrink-0" style={{ padding: '10px 14px 10px 20px', borderBottom: '1px solid #333', color: '#1a1a1a' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                INSURER / ASSUREUR: <span style={{ fontWeight: 'normal' }}>TD General Insurance Company</span>
              </div>
              <div style={{ fontSize: '10px', marginTop: '2px' }}>
                66 Wellington St W., 39th FL Toronto, ON M5K 1A2
              </div>
              {/* Timer pill (preview mode only) */}
              {!paymentConfirmed && previewUnlocked && (
                <div data-html2canvas-ignore="true" className="absolute flex items-center gap-1.5" style={{ top: '8px', right: '12px', background: '#2a2a2a', color: '#f97316', padding: '3px 10px', borderRadius: '14px', fontSize: '10px', fontWeight: 600 }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                  Relocks in {relockTimeLeft}s
                </div>
              )}
              {/* Active badge (paid only) */}
              {paymentConfirmed && (
                <div data-html2canvas-ignore="true" className="absolute" style={{ top: '8px', right: '12px', background: '#168A5A', color: 'white', padding: '3px 10px', borderRadius: '14px', fontSize: '10px', fontWeight: 'bold' }}>
                  Active
                </div>
              )}
            </div>

            {/* Agency section */}
            <div className="flex shrink-0" style={{ borderBottom: '1px solid #333', background: 'rgba(255,255,255,0.15)' }}>
              <div style={{ width: '24px', borderRight: '1px solid #333', background: 'rgba(255,255,255,0.35)', position: 'relative', overflow: 'hidden' }} className="shrink-0">
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <g transform="translate(12, 22) rotate(90)">
                    <text textAnchor="middle" fill="#1a1a1a" fontSize="7.5" fontWeight="bold" fontFamily="Times New Roman, serif" letterSpacing="0.3">AGENCY</text>
                    <text y="8" textAnchor="middle" fill="#1a1a1a" fontSize="6.5" fontWeight="bold" fontFamily="Times New Roman, serif" opacity="0.8">AGENCE</text>
                  </g>
                </svg>
              </div>
              <div style={{ padding: '8px 14px 8px 20px', flex: 1 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '2px', textTransform: 'uppercase' }}>TD Insurance Direct Agency Inc.</div>
                <div style={{ fontSize: '10.5px', color: '#1a1a1a', lineHeight: 1.3, textTransform: 'uppercase' }}>101 McNabb Street, 2nd Floor, Markham, ON L3R 4H8</div>
              </div>
            </div>

            {/* Insured section */}
            <div className="flex shrink-0" style={{ borderBottom: '1px solid #333', background: 'rgba(255,255,255,0.15)' }}>
              <div style={{ width: '24px', borderRight: '1px solid #333', background: 'rgba(255,255,255,0.35)', position: 'relative', overflow: 'hidden' }} className="shrink-0">
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <g transform="translate(12, 30) rotate(90)">
                    <text textAnchor="middle" fill="#1a1a1a" fontSize="7.5" fontWeight="bold" fontFamily="Times New Roman, serif" letterSpacing="0.3">INSURED</text>
                    <text y="8" textAnchor="middle" fill="#1a1a1a" fontSize="6.5" fontWeight="bold" fontFamily="Times New Roman, serif" opacity="0.8">ASSUR&Eacute;-E</text>
                  </g>
                </svg>
              </div>
              <div style={{ padding: '8px 14px 8px 20px', flex: 1 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '2px', textTransform: 'uppercase' }}>{insuredName}</div>
                <div style={{ fontSize: '10.5px', color: '#1a1a1a', lineHeight: 1.3, textTransform: 'uppercase' }}>{insuredStreet}</div>
                <div style={{ fontSize: '10.5px', color: '#1a1a1a', lineHeight: 1.3, textTransform: 'uppercase' }}>{insuredCity}</div>
              </div>
            </div>

            {/* Policy table */}
            <table className="shrink-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thLeft, width: '20%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '1px' }}>
                      <div style={{ fontSize: '7px', fontWeight: 'bold' }}>POLICY NO</div>
                      <div style={{ fontSize: '5.8px', fontWeight: 'normal', marginTop: '1px', opacity: 0.85 }}>NO DE POLICE</div>
                    </div>
                  </th>
                  <th style={{ ...thBase, width: '8%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '4px', fontSize: '7.5px' }}>Y/A</div>
                  </th>
                  <th style={{ ...thBase, width: '7%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '4px', fontSize: '7.5px' }}>M</div>
                  </th>
                  <th style={{ ...thBase, width: '7%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '4px', fontSize: '7.5px' }}>D/J</div>
                  </th>
                  <th style={{ ...thLeft, width: '16%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '1px' }}>
                      <div style={{ fontSize: '7px', fontWeight: 'bold' }}>EFFECTIVE DATE</div>
                      <div style={{ fontSize: '5.8px', fontWeight: 'normal', marginTop: '1px', opacity: 0.85 }}>DATE D&apos;EFFET</div>
                    </div>
                  </th>
                  <th style={{ ...thLeft, width: '16%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '1px' }}>
                      <div style={{ fontSize: '7px', fontWeight: 'bold' }}>EXPIRY DATE</div>
                      <div style={{ fontSize: '5.8px', fontWeight: 'normal', marginTop: '1px', opacity: 0.85 }}>EXPIRATION</div>
                    </div>
                  </th>
                  <th style={{ ...thBase, width: '8%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '4px', fontSize: '7.5px' }}>Y/A</div>
                  </th>
                  <th style={{ ...thBase, width: '7%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '4px', fontSize: '7.5px' }}>M</div>
                  </th>
                  <th style={{ ...thBase, width: '7%' }}>
                    <div style={{ lineHeight: '1.0', paddingTop: '4px', fontSize: '7.5px' }}>D/J</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdLeft}>{policyNumber}</td>
                  <td style={tdBase}>{effYear}</td>
                  <td style={tdBase}>{effMonth}</td>
                  <td style={tdBase}>{effDay}</td>
                  <td style={tdLeft}>
                    <span>{effYear}</span>&nbsp;&nbsp;&nbsp;<span>{effMonth}</span>&nbsp;&nbsp;&nbsp;<span>{effDay}</span>
                  </td>
                  <td style={tdLeft}>
                    <span>{expYear}</span>&nbsp;&nbsp;&nbsp;<span>{expMonth}</span>&nbsp;&nbsp;&nbsp;<span>{expDay}</span>
                  </td>
                  <td style={tdBase}>{expYear}</td>
                  <td style={tdBase}>{expMonth}</td>
                  <td style={tdBase}>{expDay}</td>
                </tr>
              </tbody>
            </table>

            {/* Vehicle row — flex-1 to fill remaining space */}
            <div className="flex items-center justify-between flex-1" style={{ padding: '8px 14px 8px 20px', background: 'rgba(255,255,255,0.1)', borderTop: '1px solid #333', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#1a1a1a' }}>
              <span>{vehicleInfo}</span>
              <span style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>VIN: {vinDisplay}</span>
            </div>
          </div>
        </div>

        {/* ── Lock overlay (locked state only — perfectly centered) ── */}
        {!paymentConfirmed && !previewUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ zIndex: 10 }}>
            <div className="text-center max-w-[85%] sm:max-w-[300px] w-full mx-auto" style={{ background: 'white', padding: '16px 20px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <Lock size={24} className={`mx-auto mb-1.5 ${hasUsedPreview ? 'text-[#DC2626]' : 'text-[#333]'}`} />
              {hasUsedPreview ? (
                <>
                  <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.8px', color: '#DC2626', textTransform: 'uppercase' }}>PREVIEW EXPIRED</p>
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '4px', lineHeight: 1.3 }}>One-time 10s preview completed.<br />Upload payment receipt to unlock.</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.8px', color: '#1a1a1a', textTransform: 'uppercase' }}>UNLOCK WITH PAYMENT</p>
                  <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Click to preview for 10s</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step4Activate({ coverage: initialCoverage, driver, vehicle, extraVehicles, pinkCard, policyNumber, onBack, basePrices, settings }: {
  coverage: CoverageData; driver: DriverData; vehicle: VehicleData; extraVehicles: ExtraVehicle[]; pinkCard: PinkCardData; policyNumber: string; onBack: () => void;
  basePrices: Record<string, { basic: number; full: number }>;
  settings: SiteSettings;
}) {
  const [selType, setSelType] = useState(initialCoverage.type);
  const [optionPrices, setOptionPrices] = useState<Record<string, number>>(() => {
    // Seed with local fallback immediately so UI isn't empty
    const local = calculatePrice(initialCoverage.term, 'full', initialCoverage.deductible, driver.license, driver.dob, extraVehicles, basePrices, initialCoverage.extraDrivers || 0);
    const COV_MULT: Record<string, number> = { basic: 0.60, full: 1.0, commercial: 1.35 };
    return {
      basic: Math.round(local.price * COV_MULT.basic),
      full: local.price,
      commercial: Math.round(local.price * COV_MULT.commercial),
    };
  });

  // Fetch live prices from API for all three coverage types
  useEffect(() => {
    const slugs: Record<string, string> = { basic: 'basic', full: 'full', commercial: 'full' };
    const COV_MULT: Record<string, number> = { basic: 1.0, full: 1.0, commercial: 1.35 };
    const dob = driver.dob || '1990-01-01';
    Promise.all(
      ['basic', 'full', 'commercial'].map(async (type) => {
        const result = await calculateQuote({
          term: initialCoverage.term,
          package_slug: slugs[type],
          deductible: initialCoverage.deductible,
          license_class: driver.license,
          date_of_birth: dob,
          extra_vehicle_count: extraVehicles.length,
          extra_driver_count: initialCoverage.extraDrivers || 0,
        });
        return [type, Math.round(result.final_price * COV_MULT[type])] as [string, number];
      })
    ).then(entries => {
      setOptionPrices(Object.fromEntries(entries));
    }).catch(() => { /* keep local fallback */ });
  }, [initialCoverage.term, initialCoverage.deductible, initialCoverage.extraDrivers, driver.license, driver.dob, extraVehicles.length]);

  const currentPrice = optionPrices[selType] ?? 0;
  const isMonthly = initialCoverage.billingFrequency === 'monthly';
  const termMonths = initialCoverage.term === '3m' ? 3 : initialCoverage.term === '6m' ? 6 : 12;
  const dueToday = isMonthly ? Math.round(currentPrice / termMonths) : currentPrice;
  const [copiedField, setCopiedField] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileObj, setUploadedFileObj] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCovModal, setShowCovModal] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const [hasUsedPreview, setHasUsedPreview] = useState(false);
  const [relockTimeLeft, setRelockTimeLeft] = useState(10);

  // Payment verification states
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [brokerVerified, setBrokerVerified] = useState(false);
  const [verificationTimeLeft, setVerificationTimeLeft] = useState(60 * 60); // 1 hour in seconds
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  const handleDownloadPinkCard = async () => {
    setIsGeneratingCard(true);
    try {
      const cardElement = document.getElementById('active-pink-slip-card');
      if (!cardElement) throw new Error('Card element not found');

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
      });
      const link = document.createElement('a');
      link.download = `PolarGuard_Pink_Slip_${policyNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate customized pink slip card image:', err);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // 1-hour verification countdown timer
  useEffect(() => {
    if (!verifyingPayment || brokerVerified) return;
    const timer = setInterval(() => {
      setVerificationTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [verifyingPayment, brokerVerified]);

  // Live status polling: check server if admin approved in Telegram
  useEffect(() => {
    if (!verifyingPayment || brokerVerified || paymentConfirmed) return;

    const pollStatus = async () => {
      try {
        const res = await checkPolicyStatus(policyNumber);
        if (res.status === 'active') {
          setBrokerVerified(true);
          setPaymentConfirmed(true);
        }
      } catch {
        // ignore polling errors
      }
    };

    pollStatus();
    const pollInterval = setInterval(pollStatus, 3000);
    return () => clearInterval(pollInterval);
  }, [verifyingPayment, brokerVerified, paymentConfirmed, policyNumber]);

  // 10-second preview countdown timer
  useEffect(() => {
    if (!previewUnlocked || paymentConfirmed) return;
    setRelockTimeLeft(10);
    const timer = setInterval(() => {
      setRelockTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPreviewUnlocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [previewUnlocked, paymentConfirmed]);


  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  // Coverage items per type
  const covItems: Record<string, string[]> = {
    basic: [
      'Third-party liability',
      'Accident benefits',
      'Direct Compensation Property Damage',
      'Uninsured automobile coverage',
    ],
    full: [
      'Everything in Basic Coverage',
      'Comprehensive (theft, fire, vandalism, hail)',
      'Glass & windshield repair included',
      '24/7 roadside assistance',
      'Collision / upset coverage',
      `$${initialCoverage.deductible} deductible on claims`,
      'Loss of use & rental car coverage',
      'Accident forgiveness on first at-fault claim',
    ],
    commercial: [
      'Everything in Full Coverage',
      'Commercial use endorsement',
      'Business liability extension',
      'Rideshare coverage (Uber/Lyft)',
      'Delivery vehicle protection',
      'Goods-in-transit coverage',
      'Hired auto liability',
      'Employer non-owned liability',
    ],
  };

  const covOptions = [
    { id: 'basic', title: 'Basic Coverage', sub: 'Liability + accident benefits \u2014 meets provincial minimums.' },
    { id: 'full', title: 'Full Coverage', sub: 'Liability + collision + comprehensive \u2014 full protection.' },
    { id: 'commercial', title: 'Commercial Use', sub: 'Business / rideshare / delivery use \u2014 commercial endorsement.' },
  ];

  return (
    <div className="bg-white rounded-[20px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="mb-8">
        <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#168A5A] font-bold mb-2">Step 4 &middot; Activate Policy</p>
        <h3 className="font-satoshi font-semibold text-[#111] text-[22px] mb-1">Pay by Interac e-Transfer</h3>
        <p className="font-inter text-[#5F6368] text-[14px]">
          {isMonthly
            ? `Send your $${dueToday} CAD e-Transfer (Month 1 of ${termMonths} installment) to ONE of the addresses below, then upload the receipt to lock in your policy.`
            : `Send your $${currentPrice} CAD e-Transfer to ONE of the addresses below, then upload the receipt to lock in your policy.`}
        </p>
      </div>

      {/* Recipient Card */}
      <div className="mb-8 bg-[#F0FDF4] border border-[#168A5A] rounded-[12px] p-5">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={16} className="text-[#168A5A]" />
          <span className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#168A5A] font-bold">E-Transfer to</span>
        </div>
        <p className="font-inter text-[16px] font-semibold text-[#111] mb-1">{settings.company_name}</p>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[14px] text-[#5F6368]">{settings.etransfer_email}</span>
          <button onClick={() => copyToClipboard(settings.etransfer_email, 'email')} className="text-[#168A5A] hover:text-[#1FA36A] transition-colors p-1 rounded hover:bg-[#E8F5EE]">
            {copiedField === 'email' ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Monthly Installments Active Notice / Badge */}
      {isMonthly && (
        <div className="mb-8 border border-[#168A5A]/30 bg-[#F0FDF4] rounded-[12px] p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-[#168A5A] shrink-0 mt-0.5" />
          <div className="flex-1 text-[13px] font-inter">
            <p className="font-semibold text-[#111] mb-0.5">
              Monthly Installment Plan Active &middot; Month 1 of {termMonths}
            </p>
            <p className="text-[#4B5563] leading-relaxed">
              Pay <strong>${dueToday} CAD today</strong> to activate Month 1. Your official TD pink slip and full policy papers will be issued immediately. The remaining {termMonths - 1} equal installments of ${dueToday} CAD will be due every 30 days via e-Transfer (Total ${currentPrice} CAD).
            </p>
          </div>
        </div>
      )}

      {/* Coverage Type — Non-editable view with Ghost Edit button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-inter text-[13px] font-semibold text-[#111]">Coverage Type</p>
          <button
            type="button"
            onClick={() => setShowCovModal(true)}
            className="inline-flex items-center gap-1.5 font-inter text-[12px] font-semibold text-[#168A5A] border border-[#168A5A] hover:bg-[#F0FDF4] px-3.5 py-1.5 rounded-lg transition-all"
          >
            <Edit2 size={13} /> Edit
          </button>
        </div>

        {/* Selected Coverage Summary Box */}
        {(() => {
          const selectedOpt = covOptions.find(o => o.id === selType) || covOptions[1];
          return (
            <div className="p-4 rounded-[12px] border border-[#168A5A] bg-[#F0FDF4]/30 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#168A5A] shrink-0 mt-0.5 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#168A5A]" />
                </div>
                <div>
                  <p className="font-inter text-[14px] font-semibold text-[#111]">{selectedOpt.title}</p>
                  <p className="font-inter text-[12px] text-[#5F6368] mt-0.5">{selectedOpt.sub}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-inter text-[15px] font-bold text-[#168A5A]">${dueToday} CAD{isMonthly ? ' / mo' : ''}</p>
                {isMonthly && (
                  <p className="font-inter text-[11px] text-[#5F6368] mt-0.5">
                    Month 1 of {termMonths} &middot; Total ${currentPrice} CAD
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Coverage Switch Modal */}
      {showCovModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] max-w-[500px] w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCovModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#5F6368] hover:text-[#111] hover:bg-[#F7F7F5] rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <h3 className="font-satoshi font-bold text-[20px] text-[#111] mb-1">Switch Coverage Type</h3>
            <p className="font-inter text-[13px] text-[#5F6368] mb-6">Select a new coverage level. Prices update instantly across your quote.</p>

            <div className="space-y-3 mb-6">
              {covOptions.map(opt => {
                const isActive = selType === opt.id;
                const optPrice = optionPrices[opt.id] ?? 0;
                const optDue = isMonthly ? Math.round(optPrice / termMonths) : optPrice;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelType(opt.id);
                      setShowCovModal(false);
                    }}
                    className={`w-full flex items-start gap-3 p-4 rounded-[12px] border text-left transition-all ${
                      isActive
                        ? 'border-2 border-[#168A5A] bg-[#F0FDF4]'
                        : 'border border-[#E6E8EB] hover:border-[#168A5A]/50 hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${isActive ? 'border-[#168A5A]' : 'border-[#E6E8EB]'}`}>
                      {isActive && <div className="w-2.5 h-2.5 rounded-full bg-[#168A5A]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-inter text-[14px] font-semibold text-[#111]">{opt.title}</p>
                        <p className={`font-inter text-[14px] font-bold ${isActive ? 'text-[#168A5A]' : 'text-[#5F6368]'}`}>
                          ${optDue} CAD{isMonthly ? ' / mo' : ''}
                        </p>
                      </div>
                      <p className="font-inter text-[12px] text-[#5F6368] mt-0.5">{opt.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowCovModal(false)}
                className="font-inter text-[14px] font-semibold px-6 py-2.5 rounded-xl bg-[#168A5A] text-white hover:bg-[#1FA36A] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* What&apos;s Included */}
      <div className="mb-8">
        <p className="font-inter text-[13px] font-semibold text-[#111] mb-3">What&apos;s Included</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {covItems[selType].map(item => (
            <div key={item} className="flex items-center gap-2">
              <Check size={14} className="text-[#168A5A] shrink-0" strokeWidth={2.5} />
              <span className="font-inter text-[13px] text-[#111]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recipient + Amount */}
      <div className="mb-8 bg-[#F7F7F5] rounded-[12px] p-5">
        <div className="mb-3">
          <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold mb-1">Recipient name (use this exact name in your e-Transfer)</p>
          <div className="flex items-center gap-2">
            <span className="font-inter text-[15px] font-semibold text-[#111]">{settings.company_name}</span>
            <button onClick={() => copyToClipboard(settings.company_name, 'recipient')} className="text-[#168A5A] hover:text-[#1FA36A] transition-colors p-1 rounded hover:bg-[#E8F5EE]">
              {copiedField === 'recipient' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-[8px] p-3 flex items-start gap-2 mb-4">
          <AlertTriangle size={14} className="text-[#C2410C] shrink-0 mt-0.5" />
          <p className="font-inter text-[12px] text-[#7C2D12]">You must enter the exact same recipient name in your bank&apos;s e-Transfer &mdash; otherwise the payment will not match your policy.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold">
            {isMonthly ? `Amount to send today (Month 1 of ${termMonths})` : 'Amount to send (CAD)'}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-inter text-[20px] font-bold text-[#111]">${dueToday}</span>
            <button onClick={() => copyToClipboard(String(dueToday), 'amount')} className="text-[#168A5A] hover:text-[#1FA36A] transition-colors p-1 rounded hover:bg-[#E8F5EE]">
              {copiedField === 'amount' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Steps */}
      <div className="mb-8">
        <p className="font-inter text-[13px] font-semibold text-[#111] mb-3">Payment Steps</p>
        <div className="space-y-3">
          {['Open your bank app \u2192 Send Interac e-Transfer', 'Use NO security question OR enable auto-deposit', 'Take a screenshot of your transfer receipt', 'Upload the screenshot below \u2014 your pink card and full coverage documents will be ready in 15-25 minutes'].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#111] flex items-center justify-center shrink-0 mt-0.5"><span className="font-inter text-[11px] font-bold text-white">{i + 1}</span></div>
              <p className="font-inter text-[13px] text-[#111] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insurance Card Preview — 3 states: Locked / Unlocked Preview (30s) / Paid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold">
            {paymentConfirmed ? 'Your Pink Slip' : 'Insurance Card Preview'}
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="font-inter text-[12px] text-[#5F6368]">QA overlay</span>
            </label>
            <span className={`font-inter text-[10px] font-bold px-2 py-0.5 rounded-full ${paymentConfirmed ? 'bg-[#F0FDF4] text-[#168A5A]' : previewUnlocked ? 'bg-[#EFF6FF] text-[#2563EB]' : hasUsedPreview ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#FFF7ED] text-[#C2410C]'}`}>
              {paymentConfirmed ? 'Active' : previewUnlocked ? 'Preview' : hasUsedPreview ? 'Preview Used' : 'Preview only'}
            </span>
          </div>
        </div>

        {/* ═══ PINK CARD + INFO BOX side by side on desktop, stacked on mobile ═══ */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center">

          {/* Pink Slip Card */}
          <PinkSlipCard
            paymentConfirmed={paymentConfirmed}
            previewUnlocked={previewUnlocked}
            hasUsedPreview={hasUsedPreview}
            relockTimeLeft={relockTimeLeft}
            onUnlock={() => {
              if (!paymentConfirmed && !previewUnlocked && !hasUsedPreview) {
                setPreviewUnlocked(true);
                setHasUsedPreview(true);
              }
            }}
            pinkCard={pinkCard}
            vehicle={vehicle}
            coverage={{ ...initialCoverage, type: selType }}
            policyNumber={policyNumber}
            driver={driver}
          />

          {/* Info text — flexes to fill remaining space, centered vertically */}
          <div className="flex-1 flex items-center min-w-0">
            {paymentConfirmed ? (
              /* PAID — green info */
              <div className="w-full space-y-3">
                <div className="bg-[#F0FDF4] border border-[#A7DAB9] rounded-[10px] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-[#168A5A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-inter text-[13px] font-semibold text-[#064E3B]">Payment verified</p>
                      <p className="font-inter text-[13px] text-[#064E3B]/80 leading-relaxed">
                        Your policy is now active. Your official pink card has been issued under TD Insurance. Download it below or check your email for the full coverage documents.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#F0FDF4] rounded-[10px] p-4">
                  <CheckCircle2 size={16} className="text-[#168A5A] shrink-0" />
                  <div>
                    <p className="font-inter text-[13px] font-medium text-[#111]">Pink Slip active</p>
                    <p className="font-inter text-[12px] text-[#5F6368]">Policy issued and ready for download</p>
                  </div>
                  <button
                    onClick={handleDownloadPinkCard}
                    disabled={isGeneratingCard}
                    className="ml-auto font-inter text-[12px] font-semibold text-[#168A5A] border border-[#168A5A] px-4 py-2 rounded-lg hover:bg-[#168A5A] hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isGeneratingCard ? <Loader2 size={14} className="animate-spin" /> : null}
                    {isGeneratingCard ? 'Generating...' : 'Download'}
                  </button>
                </div>
              </div>
            ) : previewUnlocked ? (
              /* PREVIEW — blue info */
              <div className="w-full bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-4">
                <div className="flex items-start gap-3">
                  <Eye size={18} className="text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-inter text-[13px] font-semibold text-[#1E40AF]">Preview mode</p>
                    <p className="font-inter text-[13px] text-[#1E40AF]/80 leading-relaxed">
                      Review your pink slip details. The card will relock in {relockTimeLeft} seconds. Download is only available after payment is verified.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* LOCKED — green info */
              <div className="w-full bg-[#F0FDF4] border border-[#A7DAB9] rounded-[10px] p-4">
                <p className="font-inter text-[13px] text-[#064E3B] leading-relaxed">
                  Click the card above for a 10-second preview to verify your details. Make payment to activate your policy and unlock permanent access to your pink slip.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Upload Area + Payment Verification Flow ═══ */}
      {!brokerVerified && (
        <>
          {/* Upload Area */}
          <div className="mb-6">
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-[12px] p-8 text-center transition-all hover:border-[#168A5A] ${uploadedFile ? 'border-[#168A5A] bg-[#F0FDF4]/30' : 'border-[#E6E8EB]'}`}>
                {uploadedFile ? (
                  <div className="flex items-center gap-3 justify-center">
                    {uploadedFileUrl && (
                      <img src={uploadedFileUrl} alt="Receipt" className="w-[60px] h-[60px] object-cover rounded-[8px]" />
                    )}
                    <div className="text-left">
                      <p className="font-inter text-[14px] font-semibold text-[#168A5A]">{uploadedFile}</p>
                      <p className="font-inter text-[12px] text-[#5F6368]">Click to change file</p>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUploadedFile(null); setUploadedFileUrl(null); setUploadedFileObj(null); }}
                      className="ml-auto w-6 h-6 rounded-full bg-[#eee] text-[#666] flex items-center justify-center hover:bg-[#ddd] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-[#9AA0A6]" />
                    <p className="font-inter text-[14px] font-semibold text-[#111]">Upload e-Transfer screenshot</p>
                    <p className="font-inter text-[12px] text-[#9AA0A6]">Drag & drop or click to browse</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file.name);
                      setUploadedFileUrl(URL.createObjectURL(file));
                      setUploadedFileObj(file);
                    }
                  }}
                />
              </div>
            </label>
          </div>

          {/* ── State A: Initial — "I have made the payment" button ── */}
          {!verifyingPayment && (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!uploadedFile}
              className={`w-full font-inter text-[16px] font-semibold h-[52px] rounded-[12px] transition-all flex items-center justify-center gap-2 ${
                uploadedFile ? 'bg-[#168A5A] hover:bg-[#1FA36A] text-white' : 'bg-[#E6E8EB] text-[#9AA0A6] cursor-not-allowed'
              }`}
            >
              <Check size={20} strokeWidth={3} /> I have made the payment
            </button>
          )}

          {/* ── State B: Verifying — spinner + countdown ── */}
          {verifyingPayment && !brokerVerified && (
            <div className="space-y-3">
              {/* Verifying button (disabled, spinning) */}
              <button
                disabled
                className="w-full font-inter text-[16px] font-semibold h-[52px] rounded-[12px] bg-[#f0f0f0] text-[#666] cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Loader2 size={20} className="animate-spin" /> Verifying your payment...
              </button>

              {/* Countdown timer */}
              <div className="text-center py-3 px-4 bg-[#f9f9f9] rounded-[8px]">
                <p className="font-inter text-[14px] text-[#666]">
                  Verification in progress:{" "}
                  <span className="font-mono font-bold text-[#333] text-[16px]">
                    {Math.floor(verificationTimeLeft / 60)}:{String(verificationTimeLeft % 60).padStart(2, '0')}
                  </span>
                </p>
              </div>

              {/* Download button (disabled, locked) */}
              <button
                disabled
                className="w-full font-inter text-[15px] font-semibold h-[48px] rounded-[12px] bg-[#e5e5e5] text-[#999] cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock size={16} /> Download your pink card
              </button>

              <p className="text-center font-inter text-[12px] text-[#999]">
                Your pink card will be available once payment is verified by our licensed broker.
              </p>
            </div>
          )}

          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
              <div className="bg-white rounded-[16px] p-6 max-w-[400px] w-full shadow-xl" onClick={e => e.stopPropagation()}>
                <p className="font-satoshi font-semibold text-[#111] text-[18px] mb-2">Have you sent the e-Transfer?</p>
                <p className="font-inter text-[14px] text-[#5F6368] mb-6">Please confirm that you have sent ${dueToday} CAD via Interac e-Transfer to {settings.company_name}.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowConfirm(false); }}
                    className="flex-1 font-inter text-[14px] font-medium text-[#111] border border-[#E6E8EB] py-3 rounded-xl hover:border-[#168A5A] transition-all"
                  >
                    No, go back
                  </button>
                  <button
                    onClick={async () => {
                      setShowConfirm(false);
                      setVerifyingPayment(true);
                      // Fire Telegram notification with screenshot + details
                      if (uploadedFileObj) {
                        try {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const vehicleName = (vehicle.year && vehicle.make)
                              ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim()
                              : (vehicle.vin.length >= 11 && decodeVIN(vehicle.vin))
                              ? `${decodeVIN(vehicle.vin)?.year} ${decodeVIN(vehicle.vin)?.make} ${decodeVIN(vehicle.vin)?.model}`
                              : vehicle.vin;

                            const additionalDriversStr = (initialCoverage.additionalDriversList && initialCoverage.additionalDriversList.length > 0)
                              ? initialCoverage.additionalDriversList
                                  .filter(d => d.fullName?.trim())
                                  .map(d => `${d.fullName} (${d.relationship || 'Driver'}, ${d.licenseClass || 'Class G'})`)
                                  .join('; ')
                              : (pinkCard.additionalDrivers || undefined);

                            const vehicleSummary = extraVehicles.length > 0
                              ? `${vehicleName} + ${extraVehicles.length} extra vehicle(s) [${extraVehicles.map(v => `${v.year || ''} ${v.make || ''} ${v.model || ''} (${v.vin})`.trim()).join(', ')}]`
                              : vehicleName;

                            notifyPayment({
                              policy_number:      policyNumber,
                              amount:             dueToday,
                              billing_frequency:  isMonthly ? 'monthly' : 'full',
                              coverage_type:      selType.charAt(0).toUpperCase() + selType.slice(1),
                              term:               initialCoverage.term,
                              deductible:         initialCoverage.deductible,
                              vin:                vehicle.vin,
                              vehicle:            vehicleSummary,
                              license_class:      driver.license || 'G',
                              dob:                driver.dob || '',
                              postal:             driver.postal || '',
                              street:             driver.street || pinkCard.street || '',
                              city:               driver.city || pinkCard.city || '',
                              province:           driver.province || '',
                              receipt_base64:     reader.result as string,
                              receipt_name:       uploadedFileObj.name,
                              customer_name:      pinkCard.fullName || driver.fullName || '',
                              customer_email:     pinkCard.email || driver.email || '',
                              customer_phone:     pinkCard.phone || driver.phone || '',
                              additional_drivers: additionalDriversStr,
                            });
                          };
                          reader.readAsDataURL(uploadedFileObj);
                        } catch { /* never block the user */ }
                      }
                    }}
                    className="flex-1 font-inter text-[14px] font-semibold bg-[#168A5A] text-white py-3 rounded-xl hover:bg-[#1FA36A] transition-all"
                  >
                    Yes, confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── State C: Verified — success badge + active download ── */}
      {brokerVerified && (
        <div className="space-y-4">
          <div className="text-center py-4 bg-[#F0FDF4] border border-[#A7DAB9] rounded-[12px]">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 size={20} className="text-[#168A5A]" />
              <span className="font-inter text-[16px] font-semibold text-[#168A5A]">Payment verified</span>
            </div>
          </div>

          <button
            onClick={handleDownloadPinkCard}
            disabled={isGeneratingCard}
            className="w-full font-inter text-[16px] font-semibold h-[52px] rounded-[12px] bg-[#168A5A] hover:bg-[#15803d] text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGeneratingCard ? <Loader2 size={18} className="animate-spin" /> : null}
            {isGeneratingCard ? 'Generating your pink card...' : 'Download your pink card'}
          </button>
        </div>
      )}

      <button onClick={onBack} className="inline-flex items-center gap-1 font-inter text-[14px] font-medium text-[#5F6368] hover:text-[#111] transition-colors mt-6">
        <ChevronLeft size={16} /> Back to Quote
      </button>
    </div>
  );
}
function LiveSummaryPanel({ vehicle, driver, coverage, extraVehicles, view, basePrices }: {
  vehicle: VehicleData; driver: DriverData; coverage: CoverageData; extraVehicles: ExtraVehicle[]; view: string;
  basePrices: Record<string, { basic: number; full: number }>;
}) {
  const decoded = vehicle.vin.length >= 11 ? decodeVIN(vehicle.vin) : null;

  const [apiPrice, setApiPrice] = useState<number | null>(null);
  useEffect(() => {
    if (!coverage.term || !coverage.type) return;
    const dob = driver.dob || '1990-01-01';
    calculateQuote({
      term: coverage.term as '1m'|'3m'|'6m'|'12m',
      package_slug: (coverage.type === 'basic' ? 'basic' : 'full') as 'basic'|'full',
      deductible: coverage.deductible as '500'|'1000',
      license_class: (driver.license || 'G') as 'G'|'G2'|'G1',
      date_of_birth: dob,
      extra_vehicle_count: extraVehicles.length,
      extra_driver_count: coverage.extraDrivers || 0,
    }).then(r => setApiPrice(r.final_price)).catch(() => {});
  }, [coverage, driver, extraVehicles.length]);

  const localPrice = calculatePrice(coverage.term, coverage.type, coverage.deductible, driver.license, driver.dob, extraVehicles, basePrices, coverage.extraDrivers || 0);
  const price = { ...localPrice, price: apiPrice ?? localPrice.price };

  const isMonthly = coverage.billingFrequency === 'monthly';
  const termMonths = coverage.term === '3m' ? 3 : coverage.term === '6m' ? 6 : 12;
  const fullTermTotal = Math.round(price.price);
  const monthlyRate = Math.round(fullTermTotal / termMonths);
  const dueToday = isMonthly ? monthlyRate : fullTermTotal;

  const multiVehicle = extraVehicles.length > 0;
  const vehicleLabel = multiVehicle
    ? `${extraVehicles.length + 1} VEHICLES (20% BUNDLE)`
    : (vehicle.year && vehicle.make)
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim()
    : decoded
    ? `${decoded.year} ${decoded.make} ${decoded.model}`
    : null;
  const singlePrice = (basePrices[coverage.term] ?? FALLBACK_PRICES['3m'])[coverage.type as 'basic' | 'full'] || 570;
  const originalTotal = singlePrice * (extraVehicles.length + 1);

  const additionalDriversNames = (coverage.additionalDriversList && coverage.additionalDriversList.length > 0)
    ? coverage.additionalDriversList.map(d => d.fullName.trim()).filter(Boolean).join(' & ')
    : '';

  const additionalDriversValue = (coverage.extraDrivers ?? 0) === 0
    ? 'Just me'
    : `+${coverage.extraDrivers} extra driver${coverage.extraDrivers! > 1 ? 's' : ''} (Free · $0)${additionalDriversNames ? ` — ${additionalDriversNames}` : ''}`;

  const fullAddress = [driver.street, driver.city].filter(Boolean).join(', ');

  const rows = [
    { label: 'VEHICLE', value: vehicleLabel },
    { label: 'VIN', value: multiVehicle ? `${vehicle.vin ? vehicle.vin.slice(0, 8) + '...' : 'Pending'} (+${extraVehicles.length} car${extraVehicles.length > 1 ? 's' : ''})` : vehicle.vin || null },
    { label: 'LICENSE', value: driver.license || null },
    { label: 'DOB', value: driver.dob || null },
    { label: 'ADDRESS', value: fullAddress || null },
    { label: 'POSTAL', value: driver.postal ? `${driver.postal}${driver.province ? ` (${POSTAL_PROVINCE_MAP[driver.province[0]]?.name || driver.province})` : ''}` : null },
    { label: 'ADDITIONAL DRIVERS', value: additionalDriversValue },
    { label: 'COVERAGE', value: coverage.type ? (coverage.type === 'basic' ? 'Basic' : 'Full') : null },
    { label: 'DEDUCTIBLE', value: coverage.type === 'full' ? `$${coverage.deductible || '1000'} CAD` : 'N/A (Basic)' },
    { label: 'PAYMENT PLAN', value: isMonthly ? `Monthly (${termMonths} payments)` : 'Full Term (One-Time)' },
    { label: 'DUE TODAY', value: isMonthly ? `$${dueToday} CAD (Mo. 1)` : `$${dueToday} CAD` },
    { label: 'TERM', value: coverage.term ? `${termLabels[coverage.term]}${view === 'preview' || view === 'activate' ? (isMonthly ? ' (Monthly)' : ' prepaid') : ''}` : null },
  ];

  return (
    <div className="bg-white rounded-[16px] border border-[#E6E8EB] p-7 sticky top-24">
      <p className="font-inter text-[11px] uppercase tracking-[0.12em] text-[#5F6368] font-semibold mb-6">Live Summary</p>
      <div className="space-y-4 mb-8">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="font-inter text-[11px] uppercase tracking-[0.08em] text-[#8B949E]">{row.label}</span>
            <span className={`font-inter text-[13px] font-medium ${row.value ? 'text-[#111]' : 'text-[#B0B4B8]'}`}>{row.value || '\u2014'}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#F7F7F5] rounded-[12px] p-5 mb-4">
        <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[#5F6368] font-semibold mb-2">
          {isMonthly
            ? `Due Today (Month 1 of ${termMonths})`
            : multiVehicle
            ? `Estimated Rate — ${extraVehicles.length + 1} Vehicles (20% Off)`
            : 'Estimated Rate'}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-satoshi text-[#111] text-[44px] font-bold tracking-tight leading-none">${dueToday}</span>
          <span className="font-inter text-[#5F6368] text-[16px]">{isMonthly ? 'CAD / mo' : 'CAD'}</span>
        </div>
        {multiVehicle && (
          <div className="mt-2.5 pt-2 border-t border-[#E6E8EB]">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[#5F6368]">Combined Standard:</span>
              <span className="text-[#9AA0A6] line-through font-medium">
                ${isMonthly ? Math.round(originalTotal / termMonths) : originalTotal} CAD{isMonthly ? '/mo' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] mt-1">
              <span className="text-[#168A5A] font-bold">Multi-Vehicle Discount:</span>
              <span className="text-[#168A5A] font-bold">Save 20% (-${isMonthly ? Math.round((originalTotal - price.price) / termMonths) : Math.round(originalTotal - price.price)} CAD{isMonthly ? '/mo' : ''})</span>
            </div>
          </div>
        )}
        <p className="font-inter text-[12px] text-[#5F6368] mt-2 leading-relaxed">
          {isMonthly
            ? `Month 1 due today to issue your TD pink card. Remaining ${termMonths - 1} installments of $${dueToday} CAD billed monthly via e-Transfer (Total $${fullTermTotal} CAD).`
            : `One-time prepaid for the full ${termLabels[coverage.term] || '3 months'}. You're covered the entire term — no monthly billing.`}
        </p>
      </div>
    </div>
  );
}

function MobileLiveSummaryBar({
  vehicle,
  driver,
  coverage,
  extraVehicles,
  basePrices,
}: {
  vehicle: VehicleData;
  driver: DriverData;
  coverage: CoverageData;
  extraVehicles: ExtraVehicle[];
  basePrices: Record<string, { basic: number; full: number }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const decoded = vehicle.vin.length >= 11 ? decodeVIN(vehicle.vin) : null;

  const [apiPrice, setApiPrice] = useState<number | null>(null);
  useEffect(() => {
    if (!coverage.term || !coverage.type) return;
    const dob = driver.dob || '1990-01-01';
    calculateQuote({
      term: coverage.term as '1m'|'3m'|'6m'|'12m',
      package_slug: (coverage.type === 'basic' ? 'basic' : 'full') as 'basic'|'full',
      deductible: coverage.deductible as '500'|'1000',
      license_class: (driver.license || 'G') as 'G'|'G2'|'G1',
      date_of_birth: dob,
      extra_vehicle_count: extraVehicles.length,
      extra_driver_count: coverage.extraDrivers || 0,
    }).then(r => setApiPrice(r.final_price)).catch(() => {});
  }, [coverage, driver, extraVehicles.length]);

  const localPrice = calculatePrice(
    coverage.term,
    coverage.type,
    coverage.deductible,
    driver.license,
    driver.dob,
    extraVehicles,
    basePrices,
    coverage.extraDrivers || 0
  );
  const price = { ...localPrice, price: apiPrice ?? localPrice.price };

  const isMonthly = coverage.billingFrequency === 'monthly';
  const termMonths = coverage.term === '3m' ? 3 : coverage.term === '6m' ? 6 : 12;
  const fullTermTotal = Math.round(price.price);
  const monthlyRate = Math.round(fullTermTotal / termMonths);
  const dueToday = isMonthly ? monthlyRate : fullTermTotal;

  const multiVehicle = extraVehicles.length > 0;
  const vehicleLabel = multiVehicle
    ? `${extraVehicles.length + 1} VEHICLES (20% BUNDLE)`
    : (vehicle.year && vehicle.make)
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim()
    : decoded
    ? `${decoded.year} ${decoded.make} ${decoded.model}`
    : vehicle.vin
    ? `VIN: ${vehicle.vin.slice(0, 8)}...`
    : null;

  const singlePrice = (basePrices[coverage.term] ?? FALLBACK_PRICES['3m'])[coverage.type as 'basic' | 'full'] || 570;
  const originalTotal = singlePrice * (extraVehicles.length + 1);

  const additionalDriversNames = (coverage.additionalDriversList && coverage.additionalDriversList.length > 0)
    ? coverage.additionalDriversList.map(d => d.fullName.trim()).filter(Boolean).join(' & ')
    : '';

  const additionalDriversValue = (coverage.extraDrivers ?? 0) === 0
    ? 'Just me'
    : `+${coverage.extraDrivers} extra driver${coverage.extraDrivers! > 1 ? 's' : ''} (Free · $0)${additionalDriversNames ? ` — ${additionalDriversNames}` : ''}`;

  const fullAddress = [driver.street, driver.city].filter(Boolean).join(', ');

  const rows = [
    { label: 'VEHICLE', value: vehicleLabel },
    { label: 'VIN', value: multiVehicle ? `${vehicle.vin ? vehicle.vin.slice(0, 8) + '...' : 'Pending'} (+${extraVehicles.length} car${extraVehicles.length > 1 ? 's' : ''})` : vehicle.vin || null },
    { label: 'LICENSE', value: driver.license || null },
    { label: 'DOB', value: driver.dob || null },
    { label: 'ADDRESS', value: fullAddress || null },
    { label: 'POSTAL', value: driver.postal ? `${driver.postal}${driver.province ? ` (${POSTAL_PROVINCE_MAP[driver.province[0]]?.name || driver.province})` : ''}` : null },
    { label: 'ADDITIONAL DRIVERS', value: additionalDriversValue },
    { label: 'COVERAGE', value: coverage.type ? (coverage.type === 'basic' ? 'Basic' : 'Full') : null },
    { label: 'DEDUCTIBLE', value: coverage.type === 'full' ? `$${coverage.deductible || '1000'} CAD` : 'N/A (Basic)' },
    { label: 'PAYMENT PLAN', value: isMonthly ? `Monthly (${termMonths} payments)` : 'Full Term (One-Time)' },
    { label: 'DUE TODAY', value: isMonthly ? `$${dueToday} CAD (Mo. 1)` : `$${dueToday} CAD` },
    { label: 'TERM', value: coverage.term ? termLabels[coverage.term] : null },
  ];

  return (
    <div className="lg:hidden sticky top-[68px] z-30 mb-6 bg-white/95 backdrop-blur-md rounded-[16px] border border-[#E6E8EB] shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FBFBFA] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-8 h-8 rounded-full bg-[#E8F5EE] flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-[#168A5A]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-inter text-[11px] uppercase tracking-[0.08em] text-[#5F6368] font-bold">Live Summary</span>
              <span className="font-inter text-[10px] font-bold bg-[#E8F5EE] text-[#168A5A] px-2 py-0.5 rounded-full">
                {isMonthly ? 'Monthly Plan' : 'Full Term'}
              </span>
            </div>
            <p className="font-inter text-[12px] text-[#8B949E] mt-0.5 truncate max-w-[200px]">
              {vehicleLabel || 'Select vehicle to start'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-right">
            <span className="font-satoshi text-[20px] font-bold text-[#111] leading-none">${dueToday}</span>
            <span className="font-inter text-[11px] text-[#5F6368] ml-1">{isMonthly ? 'CAD/mo' : 'CAD'}</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#5F6368]">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-[#F1F3F5] bg-[#FAFAFA]/95 max-h-[65vh] overflow-y-auto">
          <div className="space-y-2.5 my-3">
            {rows.map(row => (
              <div key={row.label} className="flex items-center justify-between text-[12px]">
                <span className="font-inter uppercase tracking-[0.05em] text-[#8B949E] text-[11px] font-medium">{row.label}</span>
                <span className={`font-inter font-medium text-right max-w-[210px] truncate ${row.value ? 'text-[#111]' : 'text-[#B0B4B8]'}`}>
                  {row.value || '\u2014'}
                </span>
              </div>
            ))}
          </div>

          {multiVehicle && (
            <div className="p-2.5 bg-[#F0FDF4] border border-[#A7DAB9] rounded-[10px] mb-3 text-[11.5px]">
              <div className="flex items-center justify-between">
                <span className="text-[#064E3B] font-medium">Standard Combined:</span>
                <span className="line-through text-[#8B949E]">${isMonthly ? Math.round(originalTotal / termMonths) : originalTotal} CAD{isMonthly ? '/mo' : ''}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-[#168A5A] mt-0.5">
                <span>Multi-Vehicle Discount:</span>
                <span>Save 20% (-${isMonthly ? Math.round((originalTotal - price.price) / termMonths) : Math.round(originalTotal - price.price)} CAD{isMonthly ? '/mo' : ''})</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[10px] p-3 border border-[#E6E8EB] text-[11.5px] text-[#5F6368] leading-relaxed">
            {isMonthly
              ? `Month 1 due today ($${dueToday} CAD). Remaining ${termMonths - 1} installments of $${dueToday} CAD billed monthly via Interac e-Transfer.`
              : `One-time payment covers your vehicle for the entire ${termLabels[coverage.term] || '3 months'}.`}
          </div>
        </div>
      )}
    </div>
  );
}

function QuoteSubmittedConfirmation({
  vehicle,
  driver,
  coverage,
  extraVehicles,
  policyNumber,
  refNum,
  basePrices,
  settings,
  onStartOver,
  onEdit,
}: {
  vehicle: VehicleData;
  driver: DriverData;
  coverage: CoverageData;
  extraVehicles: ExtraVehicle[];
  policyNumber: string;
  refNum: string;
  basePrices: Record<string, { basic: number; full: number }>;
  settings: SiteSettings;
  onStartOver: () => void;
  onEdit: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const decoded = vehicle.vin.length >= 11 ? decodeVIN(vehicle.vin) : null;

  const isMonthly = coverage.billingFrequency === 'monthly';
  const termMonths = coverage.term === '3m' ? 3 : coverage.term === '6m' ? 6 : 12;

  const price = calculatePrice(
    coverage.term,
    coverage.type,
    coverage.deductible,
    driver.license,
    driver.dob,
    extraVehicles,
    basePrices,
    coverage.extraDrivers || 0
  );

  const totalPrice = Math.round(price.price);
  const monthlyPrice = Math.round(totalPrice / termMonths);
  const dueToday = isMonthly ? monthlyPrice : totalPrice;

  const multiVehicle = extraVehicles.length > 0;
  const vehicleLabel = multiVehicle
    ? `${extraVehicles.length + 1} Vehicles Bundle`
    : (vehicle.year && vehicle.make)
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim()
    : decoded
    ? `${decoded.year} ${decoded.make} ${decoded.model}`
    : vehicle.vin || 'Registered Vehicle';

  const additionalDriversNames = (coverage.additionalDriversList && coverage.additionalDriversList.length > 0)
    ? coverage.additionalDriversList.map(d => d.fullName.trim()).filter(Boolean).join(' & ')
    : '';

  const additionalDriversValue = (coverage.extraDrivers ?? 0) === 0
    ? 'Just me'
    : `+${coverage.extraDrivers} extra driver${coverage.extraDrivers! > 1 ? 's' : ''} (Free · $0)${additionalDriversNames ? ` — ${additionalDriversNames}` : ''}`;

  const copyRef = () => {
    navigator.clipboard.writeText(refNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-[760px] mx-auto bg-white rounded-[24px] border border-[#E6E8EB] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      {/* Top Success Badge */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#E8F5EE] border-2 border-[#168A5A]/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 size={36} className="text-[#168A5A]" />
        </div>
        <span className="inline-block bg-[#F0FDF4] text-[#168A5A] border border-[#A7DAB9] font-inter text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.1em] mb-2">
          Quote Dispatched &amp; Email Sent
        </span>
        <h3 className="font-satoshi font-bold text-[#111] text-[28px] sm:text-[34px] leading-tight">
          Demand Received &amp; Quote Dispatched!
        </h3>
        <p className="mt-2 font-inter text-[#5F6368] text-[15px] max-w-[580px] mx-auto">
          We&apos;ve received your insurance demand. Your official TD Insurance quote breakdown, attached PDF document, and payment instructions have been sent to{' '}
          <strong className="text-[#111] font-semibold">{driver.email || 'your email'}</strong>.
        </p>

        {/* Reference & Policy Number Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 bg-[#F7F7F5] border border-[#E6E8EB] rounded-full px-4 py-1.5">
            <span className="font-inter text-[12px] text-[#5F6368]">Quote Ref:</span>
            <span className="font-mono text-[13px] font-bold text-[#111]">#{refNum}</span>
            <button
              onClick={copyRef}
              className="text-[#168A5A] hover:text-[#111] transition-colors p-1 cursor-pointer"
              title="Copy Reference"
            >
              {copied ? <Check size={14} className="text-[#168A5A]" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#F7F7F5] border border-[#E6E8EB] rounded-full px-4 py-1.5">
            <span className="font-inter text-[12px] text-[#5F6368]">Policy #:</span>
            <span className="font-mono text-[13px] font-semibold text-[#5F6368]">{policyNumber}</span>
          </div>
        </div>
      </div>

      {/* Due Today & Payment Summary Card */}
      <div className="bg-[#F0FDF4] border-2 border-[#86efac] rounded-[16px] p-6 mb-8 text-center">
        <p className="font-inter text-[11px] uppercase tracking-[0.12em] font-bold text-[#15803d] mb-1">
          {isMonthly ? `Amount Due Today (Month 1 of ${termMonths})` : 'Total Due Today (Full Term)'}
        </p>
        <div className="flex items-baseline justify-center gap-1.5 my-2">
          <span className="font-satoshi text-[48px] font-extrabold text-[#166534] leading-none">${dueToday}</span>
          <span className="font-inter text-[#15803d] text-[18px] font-semibold">{isMonthly ? 'CAD / mo' : 'CAD'}</span>
        </div>
        <p className="font-inter text-[13px] text-[#14532d] max-w-[500px] mx-auto leading-relaxed">
          {isMonthly
            ? `Month 1 installment of $${dueToday} CAD due today to issue your TD pink slip. Remaining ${termMonths - 1} installments of $${dueToday} CAD billed monthly via Interac e-Transfer (Total $${totalPrice} CAD).`
            : `One-time payment covers your vehicle for the full ${termLabels[coverage.term] || '3 months'}. No recurring charges.`}
        </p>
      </div>

      {/* 3 Steps to Receive Pink Slip */}
      <div className="mb-8">
        <h4 className="font-satoshi font-semibold text-[#111] text-[18px] mb-4">
          How to finalize &amp; receive your TD Pink Card
        </h4>
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 p-4 rounded-[14px] bg-[#FAFBFB] border border-[#E6E8EB]">
            <div className="w-7 h-7 rounded-full bg-[#168A5A] text-white flex items-center justify-center font-inter font-bold text-[13px] shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-inter text-[14px] font-semibold text-[#111]">Check Your Inbox (Quote PDF Attached)</p>
              <p className="font-inter text-[12.5px] text-[#5F6368] mt-0.5 leading-relaxed">
                Open the confirmation email sent to <strong className="text-[#111]">{driver.email}</strong> from <span className="font-mono text-[12px] text-[#168A5A]">contact@polarguardbrokerage.ca</span>. Your official Automobile Insurance Quote document is attached as a PDF (<span className="font-mono text-[11.5px] text-[#111]">PolarGuard_Official_Quote_#{refNum}.pdf</span>) along with payment instructions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-[14px] bg-[#FAFBFB] border border-[#E6E8EB]">
            <div className="w-7 h-7 rounded-full bg-[#168A5A] text-white flex items-center justify-center font-inter font-bold text-[13px] shrink-0 mt-0.5">
              2
            </div>
            <div className="w-full">
              <p className="font-inter text-[14px] font-semibold text-[#111]">Send Interac e-Transfer</p>
              <p className="font-inter text-[12.5px] text-[#5F6368] mt-0.5 leading-relaxed">
                Using your Canadian banking app, send <strong>${dueToday} CAD</strong> via Interac e-Transfer to:
              </p>
              <div className="mt-2.5 p-3 rounded-[10px] bg-white border border-[#E2E8F0] font-mono text-[12.5px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Recipient:</span>
                  <span className="font-semibold text-[#111]">{settings.company_name || 'Airwallex (Canada) International'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Email:</span>
                  <span className="font-semibold text-[#168A5A]">{settings.etransfer_email || 'polarguardtransfers@outlook.com'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Amount:</span>
                  <span className="font-semibold text-[#111]">${dueToday}.00 CAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Message/Memo:</span>
                  <span className="font-semibold text-[#111]">Quote #{refNum}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-[14px] bg-[#FAFBFB] border border-[#E6E8EB]">
            <div className="w-7 h-7 rounded-full bg-[#168A5A] text-white flex items-center justify-center font-inter font-bold text-[13px] shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-inter text-[14px] font-semibold text-[#111]">Reply With Screenshot &amp; Receive Pink Slip (15–25 min)</p>
              <p className="font-inter text-[12.5px] text-[#5F6368] mt-0.5 leading-relaxed">
                Once sent, simply <strong>reply to the confirmation email</strong> we just sent you with a screenshot of your transfer confirmation. A licensed insurance broker will immediately verify your payment and email your official Canadian TD Pink Card PDF.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Summary Snapshot */}
      <div className="border border-[#E6E8EB] rounded-[16px] p-5 mb-8 bg-white">
        <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-bold mb-3">
          Your Submitted Quote Summary
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-[13px]">
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">Vehicle:</span>
            <span className="font-medium text-[#111] truncate max-w-[200px]">{vehicleLabel}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">VIN:</span>
            <span className="font-mono text-[#111]">{vehicle.vin || '\u2014'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">Coverage:</span>
            <span className="font-medium text-[#111]">{coverage.type === 'full' ? 'Full Coverage' : 'Basic Coverage'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">Deductible:</span>
            <span className="font-medium text-[#111]">{coverage.type === 'full' ? `$${coverage.deductible || '1000'} CAD` : 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">Term:</span>
            <span className="font-medium text-[#111]">{termLabels[coverage.term] || '6 months'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">Payment Plan:</span>
            <span className="font-medium text-[#111]">{isMonthly ? 'Monthly Installments' : 'Full Term Prepaid'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">Additional Drivers:</span>
            <span className="font-medium text-[#168A5A] truncate max-w-[200px]">{additionalDriversValue}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">Primary Insured:</span>
            <span className="font-medium text-[#111]">{driver.fullName || '\u2014'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F3F4F6]">
            <span className="text-[#8B949E]">Address:</span>
            <span className="font-medium text-[#111] truncate max-w-[200px]">{[driver.street, driver.city, driver.postal].filter(Boolean).join(', ') || '\u2014'}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onEdit}
          className="w-full sm:w-auto font-inter text-[14px] font-medium text-[#5F6368] hover:text-[#111] px-5 py-2.5 rounded-xl border border-[#E6E8EB] hover:border-[#111] transition-all cursor-pointer"
        >
          Edit Quote Details
        </button>
        <button
          onClick={onStartOver}
          className="w-full sm:w-auto font-inter text-[14px] font-semibold text-white bg-[#168A5A] hover:bg-[#1FA36A] px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Start a New Quote
        </button>
      </div>
    </div>
  );
}

export default function VINQuoteSystem() {
  const [step, setStep] = useState(1);
  const [view, setView] = useState<'wizard' | 'preview' | 'activate' | 'submitted'>('wizard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleData>({ vin: '', year: '', make: '', model: '' });
  const [driver, setDriver] = useState<DriverData>({ license: '', dob: '', postal: '', province: '', street: '', city: '' });
  const [coverage, setCoverage] = useState<CoverageData>({ term: '6m', type: 'full', deductible: '1000', extraDrivers: 0, billingFrequency: 'full' });
  const [extraVehicles, setExtraVehicles] = useState<ExtraVehicle[]>([]);
  const [pinkCard, setPinkCard] = useState<PinkCardData>({ fullName: '', street: '', city: '' });
  const [policyNumber] = useState(() => `PG${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
  const [refNum] = useState(() => `PQ${Math.floor(234800000 + Math.random() * 1000000)}`);

  // ─── Fetch live prices from backend ───────────────────────
  const [basePrices, setBasePrices] = useState<Record<string, { basic: number; full: number }>>(FALLBACK_PRICES);
  useEffect(() => {
    fetchPackages()
      .then(pkgs => setBasePrices(buildBasePrices(pkgs)))
      .catch(() => { /* keep fallback */ });
  }, []);

  // ─── Fetch site settings ───────────────────────────────────
  const [settings, setSettings] = useState<SiteSettings>({
    company_name: 'Airwallex (Canada) International',
    etransfer_email: 'polarguardtransfers@outlook.com',
  });
  useEffect(() => {
    fetchSettings()
      .then(s => setSettings(s))
      .catch(() => { /* keep fallback */ });
  }, []);

  // ─── Listen for in-chat quote population event ──────────────
  useEffect(() => {
    const handlePopulate = (e: CustomEvent) => {
      const d = e.detail;
      if (!d) return;

      if (d.vehicle) setVehicle(p => ({ ...p, ...d.vehicle }));
      if (d.driver) setDriver(p => ({ ...p, ...d.driver }));
      if (d.coverage) setCoverage(p => ({ ...p, ...d.coverage }));
      if (d.pinkCard) setPinkCard(p => ({ ...p, ...d.pinkCard }));

      if (d.view) setView(d.view);

      setTimeout(() => {
        document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    };

    window.addEventListener('populate-pink-card-quote' as any, handlePopulate);
    return () => window.removeEventListener('populate-pink-card-quote' as any, handlePopulate);
  }, []);

  const uv = (v: Partial<VehicleData>) => setVehicle(p => ({ ...p, ...v }));
  const ud = (d: Partial<DriverData>) => {
    setDriver(p => ({ ...p, ...d }));
    if (d.street !== undefined || d.city !== undefined || d.fullName !== undefined || d.email !== undefined || d.phone !== undefined) {
      setPinkCard(p => ({
        ...p,
        ...(d.street !== undefined ? { street: d.street } : {}),
        ...(d.city !== undefined ? { city: d.city } : {}),
        ...(d.fullName !== undefined ? { fullName: d.fullName } : {}),
        ...(d.email !== undefined ? { email: d.email } : {}),
        ...(d.phone !== undefined ? { phone: d.phone } : {}),
      }));
    }
  };
  const uc = (c: Partial<CoverageData>) => setCoverage(p => ({ ...p, ...c }));
  const upc = (c: Partial<PinkCardData>) => setPinkCard(p => ({ ...p, ...c }));

  // ─── Final step: Submit quote & dispatch email automation ──
  const handleSubmitQuote = async () => {
    if (!driver.email || !driver.email.includes('@')) {
      alert('Please enter your email address so we can deliver your TD quote and pink card instructions.');
      setStep(2);
      return;
    }

    setIsSubmitting(true);

    const termMonths = coverage.term === '3m' ? 3 : coverage.term === '6m' ? 6 : 12;
    const isMonthly = coverage.billingFrequency === 'monthly';

    const localPrice = calculatePrice(
      coverage.term,
      coverage.type,
      coverage.deductible,
      driver.license,
      driver.dob,
      extraVehicles,
      basePrices,
      coverage.extraDrivers || 0
    );

    let finalPrice = localPrice.price;
    try {
      const qRes = await calculateQuote({
        term: coverage.term,
        package_slug: coverage.type,
        deductible: coverage.deductible,
        license_class: driver.license || 'G',
        date_of_birth: driver.dob || '1990-01-01',
        extra_vehicle_count: extraVehicles.length,
        extra_driver_count: coverage.extraDrivers || 0,
      });
      finalPrice = qRes.final_price;
    } catch {}

    const totalPrice = Math.round(finalPrice);
    const monthlyPrice = Math.round(totalPrice / termMonths);
    const dueToday = isMonthly ? monthlyPrice : totalPrice;

    const multiVehicle = extraVehicles.length > 0;
    const decoded = vehicle.vin.length >= 11 ? decodeVIN(vehicle.vin) : null;
    const vehicleLabel = multiVehicle
      ? `${extraVehicles.length + 1} Vehicles Bundle`
      : (vehicle.year && vehicle.make)
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim()
      : decoded
      ? `${decoded.year} ${decoded.make} ${decoded.model}`
      : (vehicle.vin ? `VIN: ${vehicle.vin}` : 'Vehicle');

    const additionalDriversNames = (coverage.additionalDriversList && coverage.additionalDriversList.length > 0)
      ? coverage.additionalDriversList.map(d => d.fullName.trim()).filter(Boolean).join(' & ')
      : '';

    const additionalDriversValue = (coverage.extraDrivers ?? 0) === 0
      ? 'Just me'
      : `+${coverage.extraDrivers} extra driver${coverage.extraDrivers! > 1 ? 's' : ''} (Free · $0)${additionalDriversNames ? ` — ${additionalDriversNames}` : ''}`;

    try {
      await submitQuote({
        policy_number: policyNumber,
        ref_num: refNum,
        customer_name: driver.fullName || 'Valued Customer',
        customer_email: driver.email,
        customer_phone: driver.phone || '',
        license_class: driver.license || 'G',
        dob: driver.dob || '',
        postal: driver.postal || '',
        province: driver.province || '',
        street: driver.street || pinkCard.street || '',
        city: driver.city || pinkCard.city || '',
        vehicle: vehicleLabel,
        vin: vehicle.vin || 'Pending',
        extra_vehicles: extraVehicles.map(v => `${v.year || ''} ${v.make || ''} ${v.model || ''} (${v.vin})`.trim()).filter(Boolean),
        coverage_type: (coverage.type === 'basic' ? 'basic' : 'full') as 'basic' | 'full',
        term: (coverage.term || '6m') as '1m' | '3m' | '6m' | '12m',
        term_label: termLabels[coverage.term] || `${termMonths} months`,
        deductible: (coverage.deductible || '1000') as '500' | '1000',
        billing_frequency: (coverage.billingFrequency || 'full') as 'full' | 'monthly',
        due_today: dueToday,
        total_price: totalPrice,
        monthly_price: monthlyPrice,
        additional_drivers: additionalDriversValue,
      });
      setView('submitted');
      setTimeout(() => {
        document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } catch (err) {
      console.error('[VINQuoteSystem] Quote submission error:', err);
      alert('Unable to connect to the server to dispatch your quote email. Please ensure the backend is active and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="quote" className="bg-pg-bg py-24 lg:py-[120px]">
      <div className="max-w-container mx-auto px-6 lg:px-12">
        <div className="text-center mb-10">
          <p className="font-inter text-[12px] uppercase tracking-[0.2em] text-[#5F6368] mb-4">
            {view === 'submitted' ? 'Quote Submitted' : view === 'preview' ? 'Quote Preview' : view === 'activate' ? 'Activate' : 'Quote Flow'}
          </p>
          <h2 className="font-satoshi font-semibold text-[#111] text-[32px] sm:text-[36px] lg:text-[40px] leading-[1.1]">
            {view === 'submitted' ? 'Your Quote Has Been Sent' : view === 'preview' ? 'Your Quote Preview' : view === 'activate' ? 'Activate Your Policy' : 'Build your prepaid quote'}
          </h2>
          <p className="mt-3 font-inter text-[#5F6368] text-[16px]">
            {view === 'submitted' ? 'Check your email inbox for your full breakdown and payment instructions.' : view === 'preview' ? 'Review your details before activation.' : view === 'activate' ? 'Complete payment to receive your pink card.' : 'Three short steps. Your details are reviewed before activation.'}
          </p>
        </div>

        {view === 'wizard' && <ProgressBar currentStep={step} />}

        {/* Mobile Live Summary: collapsible dropdown above wizard steps */}
        {view === 'wizard' && (
          <MobileLiveSummaryBar
            vehicle={vehicle}
            driver={driver}
            coverage={coverage}
            extraVehicles={extraVehicles}
            basePrices={basePrices}
          />
        )}

        {/* Wizard: 58/42 split with desktop Live Summary. Preview/Activate: full width */}
        {view === 'wizard' ? (
          <div className="grid lg:grid-cols-[58%_42%] gap-8 items-start">
            <div>
              {step === 1 && <Step1Vehicle vehicle={vehicle} setVehicle={uv} onNext={() => setStep(2)} extraVehicles={extraVehicles} setExtraVehicles={setExtraVehicles} />}
              {step === 2 && <Step2Driver driver={driver} setDriver={ud} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
              {step === 3 && (
                <Step3Coverage
                  coverage={coverage}
                  setCoverage={uc}
                  onBack={() => setStep(2)}
                  onSubmitQuote={handleSubmitQuote}
                  isSubmitting={isSubmitting}
                  basePrices={basePrices}
                  driver={driver}
                  extraVehicles={extraVehicles}
                  setPinkCard={upc}
                />
              )}
            </div>
            <div className="hidden lg:block">
              <LiveSummaryPanel vehicle={vehicle} driver={driver} coverage={coverage} extraVehicles={extraVehicles} view={view} basePrices={basePrices} />
            </div>
          </div>
        ) : view === 'submitted' ? (
          <QuoteSubmittedConfirmation
            vehicle={vehicle}
            driver={driver}
            coverage={coverage}
            extraVehicles={extraVehicles}
            policyNumber={policyNumber}
            refNum={refNum}
            basePrices={basePrices}
            settings={settings}
            onStartOver={() => {
              setStep(1);
              setView('wizard');
              setVehicle({ vin: '', year: '', make: '', model: '' });
              setDriver({ license: '', dob: '', postal: '', province: '', street: '', city: '' });
              setCoverage({ term: '6m', type: 'full', deductible: '1000', extraDrivers: 0, billingFrequency: 'full' });
              setExtraVehicles([]);
            }}
            onEdit={() => {
              setStep(3);
              setView('wizard');
            }}
          />
        ) : (
          <div>
            {view === 'preview' && <QuotePreview vehicle={vehicle} driver={driver} coverage={coverage} extraVehicles={extraVehicles} pinkCard={pinkCard} setPinkCard={upc} refNum={refNum} onBack={() => setView('wizard')} onActivate={() => setView('activate')} basePrices={basePrices} />}
            {view === 'activate' && <Step4Activate coverage={coverage} driver={driver} vehicle={vehicle} extraVehicles={extraVehicles} pinkCard={pinkCard} policyNumber={policyNumber} onBack={() => setView('preview')} basePrices={basePrices} settings={settings} />}
          </div>
        )}
      </div>
    </section>
  );
}
