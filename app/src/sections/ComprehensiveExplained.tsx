import { Shield, Lock, Flame, CloudLightning, Hammer, PawPrint, GlassWater, XCircle, CheckCircle2, AlertTriangle, Car, Snowflake } from 'lucide-react';

// ─── Section A Data ─────────────────────────────────────────
const coverageItems = [
  {
    icon: Lock,
    title: 'Theft',
    desc: 'Full vehicle theft or break-in damage. Pays Actual Cash Value of your car minus deductible.',
  },
  {
    icon: Flame,
    title: 'Fire & explosion',
    desc: 'Engine fires, garage fires, wildfire damage — covered down to the frame.',
  },
  {
    icon: CloudLightning,
    title: 'Hail, wind & storms',
    desc: 'Dented hood, smashed windows, fallen tree branches. Major in AB, SK, and ON every summer.',
  },
  {
    icon: Hammer,
    title: 'Vandalism & riots',
    desc: 'Keyed paint, slashed tires, broken mirrors — even if the person is never identified.',
  },
  {
    icon: PawPrint,
    title: 'Animal strikes',
    desc: 'Hitting a deer, moose, or any wildlife counts as comprehensive (not collision) — your premium isn\'t affected the same way.',
  },
  {
    icon: GlassWater,
    title: 'Falling objects & glass',
    desc: 'Rocks off a gravel truck, ice off an overpass, full windshield replacement — typically $0 deductible on glass.',
  },
];

const notCoveredItems = [
  'Mechanical breakdown or normal wear & tear',
  'Personal items stolen from inside the car (tenant/home policy covers these)',
  'Damage from racing or commercial use',
];

const goodToKnowItems = [
  'Required by every lender if your car is financed or leased',
  'Comprehensive claims usually don\'t raise your premium the way at-fault collision claims do',
  'Glass-only claims are typically deductible-free',
];

// ─── Section B Data ─────────────────────────────────────────
const claimExamples = [
  {
    badge: 'Basic & Full',
    badgeBg: 'bg-[#E8F5EE] text-[#168A5A]',
    title: 'Rear-ended at a red light',
    desc: 'Not your fault. DCPD covers your repairs with $0 deductible. Insurer pays 100% of repair.',
    icon: Car,
  },
  {
    badge: 'Full Only',
    badgeBg: 'bg-[#EEF2FF] text-[#4F46E5]',
    title: 'You slide into a pole in a snowstorm',
    desc: 'Collision covers your car minus your deductible. $6,500 repair - $1,000 deductible = $5,500 paid',
    icon: Snowflake,
  },
  {
    badge: 'Full Only',
    badgeBg: 'bg-[#EEF2FF] text-[#4F46E5]',
    title: 'Car stolen from your driveway',
    desc: 'Comprehensive pays the actual cash value of your vehicle. ACV of vehicle - deductible paid out',
    icon: Lock,
  },
];

// ─── Component ──────────────────────────────────────────────
export default function ComprehensiveExplained() {
  return (
    <section id="comprehensive" className="bg-white py-24 lg:py-[120px] relative overflow-hidden">
      {/* Winter protection background accent */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.04] pointer-events-none hidden lg:block"
        style={{
          backgroundImage: 'url(/images/winter-protection.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
        }}
      />

      <div className="max-w-container mx-auto px-6 lg:px-12 relative z-10">

        {/* ════════════════════════════════════════════════════
            SECTION A — Comprehensive Explained
        ════════════════════════════════════════════════════ */}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center">
            <Shield size={20} className="text-[#168A5A]" strokeWidth={2} />
          </div>
          <h2 className="font-satoshi font-semibold text-[#111] text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.15]">
            Comprehensive coverage, explained
          </h2>
        </div>

        {/* Intro text */}
        <p className="font-inter text-[#5F6368] text-[16px] leading-relaxed max-w-[780px] mb-12">
          Comprehensive (sometimes called &ldquo;other than collision&rdquo;) protects your vehicle from things that aren&rsquo;t a crash with another car. It&rsquo;s the half of Full coverage most people don&rsquo;t realize they need — until a hailstorm rolls through or a deer steps onto the highway.
        </p>

        {/* 3×2 Coverage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {coverageItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-[#F7F7F5] border border-[#E6E8EB] rounded-[12px] p-6 hover:border-[#168A5A]/20 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E8F5EE] flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#168A5A]" strokeWidth={2} />
                </div>
                <h3 className="font-inter text-[15px] font-semibold text-[#111] mb-2">
                  {item.title}
                </h3>
                <p className="font-inter text-[13px] text-[#5F6368] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Two Info Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {/* What's Not Covered */}
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] p-6">
            <div className="flex items-center gap-2 mb-5">
              <XCircle size={18} className="text-[#DC2626]" strokeWidth={2} />
              <h3 className="font-inter text-[14px] font-semibold text-[#991B1B] uppercase tracking-wide">
                What&rsquo;s Not Covered
              </h3>
            </div>
            <ul className="space-y-3">
              {notCoveredItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FCA5A5] shrink-0" />
                  <span className="font-inter text-[13px] text-[#7F1D1D] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Good to Know */}
          <div className="bg-[#E8F5EE] border border-[#A7DAB9] rounded-[12px] p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 size={18} className="text-[#168A5A]" strokeWidth={2} />
              <h3 className="font-inter text-[14px] font-semibold text-[#065F2E] uppercase tracking-wide">
                Good to Know
              </h3>
            </div>
            <ul className="space-y-3">
              {goodToKnowItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={14} className="mt-0.5 text-[#168A5A] shrink-0" strokeWidth={2.5} />
                  <span className="font-inter text-[13px] text-[#064E3B] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            SECTION B — Real-World Claim Examples
        ════════════════════════════════════════════════════ */}

        <div className="mb-10">
          <p className="font-inter text-[11px] uppercase tracking-[0.2em] text-[#5F6368] mb-4">
            Real-World Claim Examples
          </p>
          <h3 className="font-satoshi font-semibold text-[#111] text-[22px] sm:text-[26px] leading-[1.2]">
            See how coverage works in practice
          </h3>
        </div>

        {/* 3 Claim Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {claimExamples.map((ex) => {
            const Icon = ex.icon;
            return (
              <div
                key={ex.title}
                className="bg-[#F7F7F5] border border-[#E6E8EB] rounded-[12px] p-6 hover:border-[#168A5A]/20 transition-colors"
              >
                {/* Badge */}
                <span className={`inline-block ${ex.badgeBg} font-inter text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-4`}>
                  {ex.badge}
                </span>

                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E6E8EB] flex items-center justify-center">
                    <Icon size={16} className="text-[#5F6368]" strokeWidth={2} />
                  </div>
                  <h4 className="font-inter text-[15px] font-semibold text-[#111]">
                    {ex.title}
                  </h4>
                </div>

                {/* Description */}
                <p className="font-inter text-[13px] text-[#5F6368] leading-relaxed">
                  {ex.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════
            Disclaimer
        ════════════════════════════════════════════════════ */}

        <div className="border-t border-[#E6E8EB] pt-8">
          <div className="flex items-start gap-3 max-w-[900px]">
            <AlertTriangle size={16} className="text-[#9AA0A6] shrink-0 mt-0.5" strokeWidth={2} />
            <p className="font-inter text-[12px] text-[#9AA0A6] leading-relaxed">
              Limits shown reflect a standard Canadian private-passenger auto policy. Final binding limits, endorsements, and exclusions are confirmed on your policy documents at activation. PolarGuard is a licensed brokerage; underwriting is provided by partner insurers.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
