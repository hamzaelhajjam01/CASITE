import { useState, useMemo } from 'react';
import { DollarSign, Sparkles } from 'lucide-react';

// ─── Term multipliers (yearly discounts) ────────────────────
const TERM_MULT: Record<string, number> = {
  '1m':  1.00,
  '3m':  1.00,
  '6m':  0.85,
  '12m': 0.75,
};
const DED_MULT: Record<string, number> = {
  '500':  1.00,
  '1000': 0.90,
};

// ─── Component ──────────────────────────────────────────────
export default function SavingsCalculator() {
  const [monthlyStr, setMonthlyStr] = useState('280');
  const [term, setTerm]       = useState('3m');
  const [ded, setDed]         = useState('500');

  const monthly   = parseFloat(monthlyStr) || 0;
  const baseYearly = monthly * 12;

  const newYearly = useMemo(
    () => Math.round(baseYearly * TERM_MULT[term] * DED_MULT[ded]),
    [baseYearly, term, ded]
  );
  const savings       = Math.max(0, baseYearly - newYearly);
  const newMonthly    = Math.round(newYearly / 12);
  const monthlySavings = Math.round(savings / 12);

  // Discount line items for the breakdown
  const discountLines: { label: string; pct: string }[] = [];
  if (term === '6m')  discountLines.push({ label: 'Prepaid 6 months discount',  pct: '\u201415%' });
  if (term === '12m') discountLines.push({ label: 'Prepaid 12 months discount', pct: '\u201425%' });
  if (ded === '1000') discountLines.push({ label: '$1,000 deductible credit',   pct: '\u201410%' });

  const termOptions = [
    { id: '1m',  label: '1 month',  sub: '+41%',  subColor: 'text-[#C2410C]' },
    { id: '3m',  label: '3 months', sub: 'Standard', subColor: 'text-[#5F6368]' },
    { id: '6m',  label: '6 months', sub: 'Save 15%', subColor: 'text-[#168A5A]' },
    { id: '12m', label: '12 months', sub: 'Save 25%', subColor: 'text-[#168A5A]' },
  ];

  const dedOptions = [
    { id: '500',  label: '$500',  sub: 'Lower out-of-pocket' },
    { id: '1000', label: '$1,000', sub: 'Save ~10% on premium' },
  ];

  return (
    <section id="calculator" className="bg-[#F7F7F5] py-24 lg:py-[120px]">
      <div className="max-w-container mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-satoshi font-semibold text-[#111] text-[32px] sm:text-[36px] lg:text-[40px] leading-[1.1]">
            See how much you could save
          </h2>
          <p className="mt-4 font-inter text-[#5F6368] text-[16px] leading-relaxed max-w-[560px] mx-auto">
            Enter what you pay today, pick your term and deductible, and see your estimated yearly savings.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-[1100px] mx-auto">

          {/* LEFT — Form */}
          <div className="bg-white border border-[#E6E8EB] rounded-[16px] p-6 sm:p-8">

            {/* Monthly Input */}
            <div className="mb-6">
              <label className="block font-inter text-[13px] font-medium text-[#111] mb-2">
                What you pay today (per month)
              </label>
              <div className="relative">
                <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0A6]" />
                <input
                  type="number"
                  value={monthlyStr}
                  onChange={(e) => setMonthlyStr(e.target.value)}
                  min="0"
                  className="w-full pl-12 pr-4 py-4 bg-[#F7F7F5] border border-[#E6E8EB] rounded-[12px] font-inter text-[24px] font-semibold text-[#111] outline-none focus:border-[#168A5A] focus:ring-2 focus:ring-[#168A5A]/10 transition-all"
                />
              </div>
              <p className="mt-2 font-inter text-[13px] text-[#5F6368]">
                &asymp; <span className="font-semibold text-[#111]">${baseYearly.toLocaleString()}</span> CAD per year today
              </p>
            </div>

            {/* Term Selector */}
            <div className="mb-6">
              <label className="block font-inter text-[13px] font-medium text-[#111] mb-3">Choose policy term</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {termOptions.map(t => {
                  const isActive = term === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTerm(t.id)}
                      className={`flex flex-col items-center p-3 rounded-[12px] font-inter transition-all duration-200 ${
                        isActive
                          ? 'border-2 border-[#168A5A] bg-white shadow-[0_2px_8px_rgba(22,138,90,0.12)]'
                          : 'border border-[#E6E8EB] bg-[#F7F7F5] hover:border-[#168A5A]/40'
                      }`}
                    >
                      <span className={`text-[13px] font-semibold ${isActive ? 'text-[#168A5A]' : 'text-[#111]'}`}>
                        {t.label}
                      </span>
                      <span className={`text-[11px] mt-0.5 ${t.subColor} ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                        {t.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* 1-month banner */}
              {term === '1m' && (
                <div className="mt-3 bg-[#FFF7ED] border border-[#FDBA74] rounded-[10px] p-3 flex items-start gap-2">
                  <span className="text-[#C2410C] font-inter text-[12px] font-bold mt-0.5">!</span>
                  <p className="font-inter text-[12px] text-[#7C2D12] leading-relaxed">
                    Perfect for Car registration &amp; plate renewal &mdash; get covered just long enough to renew your plates or registration.
                  </p>
                </div>
              )}
            </div>

            {/* Deductible Selector */}
            <div className="mb-4">
              <label className="block font-inter text-[13px] font-medium text-[#111] mb-3">Choose deductible</label>
              <div className="flex gap-3">
                {dedOptions.map(d => {
                  const isActive = ded === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDed(d.id)}
                      className={`flex-1 px-4 py-3 rounded-[12px] font-inter text-left transition-all duration-200 ${
                        isActive
                          ? 'border-2 border-[#168A5A] bg-white shadow-[0_2px_8px_rgba(22,138,90,0.12)]'
                          : 'border border-[#E6E8EB] bg-[#F7F7F5] hover:border-[#168A5A]/40'
                      }`}
                    >
                      <p className={`text-[14px] font-semibold ${isActive ? 'text-[#168A5A]' : 'text-[#111]'}`}>{d.label}</p>
                      <p className={`text-[12px] mt-0.5 ${isActive ? 'text-[#168A5A]/70' : 'text-[#9AA0A6]'}`}>{d.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="font-inter text-[12px] text-[#9AA0A6] leading-relaxed">
              Deductible is what you&apos;d pay in a claim &mdash; not an extra charge.
            </p>
          </div>

          {/* RIGHT — Results */}
          <div className="rounded-[16px] p-6 sm:p-8 flex flex-col justify-between"
               style={{ background: 'linear-gradient(135deg, #0a2f1d 0%, #081826 100%)' }}>
            <div>
              <p className="font-inter text-[11px] uppercase tracking-[0.2em] text-white/60 mb-4">
                Your Estimated Savings
              </p>

              <div className="mb-2">
                <span className="font-satoshi font-semibold text-white text-[56px] sm:text-[64px] leading-none">
                  ${savings.toLocaleString()}
                </span>
                <span className="font-inter text-[16px] text-white/50 ml-1">/year</span>
              </div>

              <p className="font-inter text-[13px] text-white/50 mb-6">
                vs your current ${baseYearly.toLocaleString()} / year
              </p>

              {/* Breakdown box */}
              <div className="bg-white/5 border border-white/10 rounded-[10px] p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-inter text-[12px] text-white/50">New yearly cost</span>
                  <span className="font-inter text-[14px] font-semibold text-white">${newYearly.toLocaleString()} CAD</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-inter text-[12px] text-white/50">Equivalent monthly</span>
                  <span className="font-inter text-[14px] font-semibold text-white">${newMonthly} / mo</span>
                </div>

                {discountLines.length > 0 && (
                  <>
                    <div className="border-t border-white/10 my-2" />
                    {discountLines.map((line, i) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <span className="font-inter text-[12px] text-white/70">{line.label}</span>
                        <span className="font-inter text-[12px] font-semibold text-white">{line.pct}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Highlight bar */}
              {savings > 0 && (
                <div className="bg-[#168A5A]/20 border border-[#168A5A]/30 rounded-[10px] p-3 mb-4">
                  <p className="font-inter text-[14px] font-semibold text-[#1FA36A] text-center">
                    That&apos;s ${monthlySavings} less every month
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div>
              <button className="w-full bg-white text-[#081826] font-inter text-[15px] font-semibold py-4 rounded-[12px] hover:bg-[#F7F7F5] transition-colors flex items-center justify-center gap-2">
                <Sparkles size={16} /> Lock in this rate
              </button>
              <p className="mt-3 font-inter text-[11px] text-white/40 text-center leading-relaxed">
                Estimate only. Final rate depends on driver profile, vehicle, and broker review.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
