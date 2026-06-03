import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { fetchPackages, type PackageData } from '../api/packages';

// ─── Term Options ───────────────────────────────────────────
const terms = [
  { id: '1m', label: '1 month', sub: 'plate renewal' },
  { id: '3m', label: '3 months', sub: 'standard' },
  { id: '6m', label: '6 months', sub: 'save 15%' },
  { id: '12m', label: '12 months', sub: 'save 25%' },
];

// ─── Fallback Table Data ─────────────────────────────────────
interface TableRow { name: string; desc: string; basic: string; full: string; }

const FALLBACK_ROWS: TableRow[] = [
  { name: 'Third-Party Liability',                 desc: 'Injury or property damage you cause to others',  basic: '$1,000,000',               full: '$2,000,000' },
  { name: 'Accident Benefits',                     desc: 'Medical, rehab & income replacement',            basic: 'Provincial minimums',      full: 'Enhanced — up to $1M medical, $1,000/wk income' },
  { name: 'Direct Compensation – Property Damage', desc: 'Damage to your car, not-at-fault',               basic: 'Included · $0 deductible', full: 'Included · $0 deductible' },
  { name: 'Uninsured Automobile',                  desc: 'Hit by an uninsured driver',                    basic: 'Up to $200,000',           full: 'Up to $200,000' },
  { name: 'Collision',                             desc: 'At-fault damage to your vehicle',               basic: 'Not included',             full: '$500 or $1,000 deductible' },
  { name: 'Comprehensive',                         desc: 'Theft, fire, vandalism, hail, animal strike',   basic: 'Not included',             full: '$500 or $1,000 deductible' },
  { name: 'Glass / Windshield',                    desc: 'Cracks, chips, full replacement',               basic: 'Not included',             full: 'Included under comprehensive' },
  { name: 'Loss of Use',                           desc: 'Rental car after a covered claim',              basic: 'Not included',             full: 'Up to $900 / 30 days' },
];

function rowsFromPackages(pkgs: PackageData[]): TableRow[] {
  const any = pkgs[0];
  if (!any?.coverage_rows?.length) return FALLBACK_ROWS;
  return any.coverage_rows
    .filter(r => r.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(r => ({ name: r.name, desc: r.description, basic: r.basic_value, full: r.full_value }));
}

const deductibles = [
  {
    id: '500',
    label: '$500 deductible',
    helper: 'Lower out-of-pocket if you ever claim. Adds about $80 per term to your premium.',
  },
  {
    id: '1000',
    label: '$1,000 deductible',
    helper: 'Standard option. Lower premium — you pay the first $1,000 of any collision or comprehensive claim.',
  },
];

// ─── Component ──────────────────────────────────────────────
export default function CoveragePlans() {
  const [activeDed, setActiveDed] = useState('500');
  const [tableRows, setTableRows] = useState<TableRow[]>(FALLBACK_ROWS);

  useEffect(() => {
    fetchPackages()
      .then(pkgs => setTableRows(rowsFromPackages(pkgs)))
      .catch(() => { /* keep fallback */ });
  }, []);

  return (
    <section id="coverage" className="bg-pg-bg py-24 lg:py-[120px]">
      <div className="max-w-container mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-inter text-[12px] uppercase tracking-[0.2em] text-[#5F6368] mb-4">Coverage</p>
          <h2 className="font-satoshi font-semibold text-[#111] text-[32px] sm:text-[36px] lg:text-[40px] leading-[1.1]">
            What you&apos;re actually covered for
          </h2>
          <p className="mt-4 font-inter text-[#5F6368] text-[16px] leading-relaxed max-w-[700px] mx-auto">
            Real Canadian auto insurance limits — not marketing fluff. Available as 1, 3, 6, or 12-month prepaid terms. Longer terms include a built-in prepaid discount; the 1-month plan is perfect for plate renewal.
          </p>
        </div>

        {/* Term Labels — plain text, not interactive */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-12">
          {terms.map(t => (
            <div key={t.id} className="flex items-center gap-2 font-inter">
              <span className="text-[14px] font-semibold text-[#111]">{t.label}</span>
              <span className="text-[12px] text-[#5F6368]">{t.sub}</span>
            </div>
          ))}
        </div>

        {/* ═══ DESKTOP TABLE (≥768px) ═══ */}
        <div className="hidden md:block bg-white rounded-[16px] border border-[#E6E8EB] overflow-hidden mb-10">
          {/* Table Header */}
          <div className="grid grid-cols-[1.8fr_1fr_1fr] bg-[#F7F7F5]">
            <div className="px-6 py-5 flex items-center">
              <span className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#5F6368] font-medium">Coverage Feature</span>
            </div>
            <div className="px-6 py-5 text-center flex items-center justify-center">
              <span className="font-inter text-[13px] font-semibold text-[#111] uppercase tracking-wide">Basic</span>
            </div>
            <div className="relative px-6 py-5 text-center flex items-center justify-center">
              <span className="font-inter text-[13px] font-semibold text-[#111] uppercase tracking-wide">Full</span>
              {/* BEST badge */}
              <span className="absolute top-3 right-3 bg-[#168A5A] text-white font-inter text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Best
              </span>
            </div>
          </div>

          {/* Rows */}
          {tableRows.map((row, i) => {
            const basicNotInc = row.basic === 'Not included';
            const fullNotInc = row.full === 'Not included';
            return (
              <div
                key={row.name}
                className={`grid grid-cols-[1.8fr_1fr_1fr] transition-colors hover:bg-[#F0FDF4]/40 ${i % 2 === 1 ? 'bg-[#F7F7F5]' : ''}`}
              >
                {/* Feature name + desc */}
                <div className="px-6 py-5">
                  <p className="font-inter text-[#111] text-[15px] font-medium">{row.name}</p>
                  <p className="font-inter text-[#5F6368] text-[13px] mt-0.5">{row.desc}</p>
                </div>

                {/* Basic */}
                <div className="px-6 py-5 flex items-center justify-center">
                  {basicNotInc ? (
                    <span className="flex items-center gap-1.5 font-inter text-[13px] text-[#9AA0A6] line-through">
                      <X size={14} strokeWidth={1.5} /> {row.basic}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-inter text-[13px] text-[#111] font-medium">
                      <Check size={14} className="text-[#168A5A]" strokeWidth={2.5} /> {row.basic}
                    </span>
                  )}
                </div>

                {/* Full */}
                <div className="px-6 py-5 flex items-center justify-center">
                  {fullNotInc ? (
                    <span className="flex items-center gap-1.5 font-inter text-[13px] text-[#9AA0A6] line-through">
                      <X size={14} strokeWidth={1.5} /> {row.full}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-inter text-[13px] text-[#111] font-medium">
                      <Check size={14} className="text-[#168A5A]" strokeWidth={2.5} /> {row.full}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ MOBILE STACKED CARDS (<768px) ═══ */}
        <div className="md:hidden space-y-4 mb-10">
          {tableRows.map((row) => {
            const basicNotInc = row.basic === 'Not included';
            const fullNotInc = row.full === 'Not included';
            return (
              <div key={row.name} className="bg-white rounded-[12px] border border-[#E6E8EB] p-5">
                {/* Feature name + desc */}
                <p className="font-inter text-[#111] text-[16px] font-bold">{row.name}</p>
                <p className="font-inter text-[#5F6368] text-[13px] mt-0.5 mb-4 leading-relaxed">{row.desc}</p>

                {/* Two-column comparison: Basic | Full */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Basic */}
                  <div className="bg-[#F7F7F5] rounded-[8px] p-3">
                    <span className="font-inter text-[10px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold block mb-2">Basic</span>
                    {basicNotInc ? (
                      <span className="flex items-center gap-1.5 font-inter text-[13px] text-[#9AA0A6] line-through leading-snug">
                        <X size={14} strokeWidth={1.5} /> {row.basic}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-inter text-[13px] text-[#111] font-medium leading-snug">
                        <Check size={14} className="text-[#168A5A] shrink-0" strokeWidth={2.5} /> {row.basic}
                      </span>
                    )}
                  </div>

                  {/* Full */}
                  <div className="bg-[#F7F7F5] rounded-[8px] p-3 relative">
                    <span className="font-inter text-[10px] uppercase tracking-[0.1em] text-[#5F6368] font-semibold block mb-2">Full</span>
                    {fullNotInc ? (
                      <span className="flex items-center gap-1.5 font-inter text-[13px] text-[#9AA0A6] line-through leading-snug">
                        <X size={14} strokeWidth={1.5} /> {row.full}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-inter text-[13px] text-[#111] font-medium leading-snug">
                        <Check size={14} className="text-[#168A5A] shrink-0" strokeWidth={2.5} /> {row.full}
                      </span>
                    )}
                    {/* BEST badge on Full column */}
                    <span className="absolute top-[-6px] right-2 bg-[#168A5A] text-white font-inter text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Best
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deductible Selector */}
        <div className="mb-8">
          <p className="font-inter text-[13px] font-medium text-[#111] mb-3">Deductible</p>
          <div className="flex flex-wrap gap-3">
            {deductibles.map(d => {
              const isActive = activeDed === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDed(d.id)}
                  className={`px-6 py-3 rounded-full font-inter text-[14px] font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#111] text-white'
                      : 'bg-[#F7F7F5] text-[#5F6368] border border-[#E6E8EB] hover:border-[#111]/20'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 font-inter text-[13px] text-[#5F6368] max-w-[600px]">
            {deductibles.find(d => d.id === activeDed)?.helper}
          </p>
        </div>

        {/* Worked Example Card */}
        <div className="bg-[#F7F7F5] border border-[#E6E8EB] rounded-[12px] p-6 max-w-[700px]">
          <p className="font-inter text-[14px] text-[#111] leading-relaxed">
            <span className="font-semibold">Worked example:</span> Repair bill $4,200 — with{' '}
            <span className="font-semibold">$500 deductible</span> you pay $500, insurer pays $3,700. With{' '}
            <span className="font-semibold">$1,000 deductible</span> you pay $1,000, insurer pays $3,200.
          </p>
        </div>
      </div>
    </section>
  );
}
