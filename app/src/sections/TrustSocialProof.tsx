import { useEffect, useRef, useState } from 'react';
import { Star, Shield, TrendingDown, PiggyBank, SlidersHorizontal, Building2, Gauge, Quote } from 'lucide-react';

// ─── Stats Data ─────────────────────────────────────────────
const stats = [
  { icon: Star, value: '4.9★', label: 'AVG. RATING' },
  { icon: Shield, value: '15,000+', label: 'DRIVERS INSURED' },
  { icon: TrendingDown, value: '$487', label: 'AVG. YEARLY SAVING' },
];

// ─── How We Reduce Your Cost ────────────────────────────────
const costFeatures = [
  {
    icon: PiggyBank,
    title: 'Prepay & save up to 25%',
    desc: '12-month prepaid policies save 25%, 6-month saves 15% — no monthly admin fees.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Right-sized deductible',
    desc: 'Choosing a $1,000 deductible instead of $500 typically lowers your premium 8–12%.',
  },
  {
    icon: Building2,
    title: 'Shopped across insurers',
    desc: 'We place your file with TD and compare against partners to lock in the lowest legal rate.',
  },
  {
    icon: Gauge,
    title: 'Bundle & telematics credits',
    desc: 'We apply every available discount: telematics, multi-vehicle, winter tires, claims-free.',
  },
];

// ─── Testimonials Data ──────────────────────────────────────
interface TestimonialItem {
  quote: string;
  name: string;
  location: string;
  driverType: string;
  badge: string;
  avatar: string;
}

const testimonials: TestimonialItem[] = [
  {
    quote: 'My renewal came back at $214/month. PolarGuard placed me on a prepaid 12-month and I ended up paying $1,479 total — way less than what I was quoted anywhere else.',
    name: 'Amara O.',
    location: 'Scarborough, ON',
    driverType: 'Full G driver',
    badge: 'Saved $612 / year',
    avatar: '/images/avatar-amara.png',
  },
  {
    quote: "I'm a G2 and every broker wanted $480/month. They got me a 6-month TD policy and walked me through the deductible options on WhatsApp. Felt like a real broker, not a call center.",
    name: 'Daniyal K.',
    location: 'Mississauga, ON',
    driverType: 'G2 driver',
    badge: 'Saved $340 / year',
    avatar: '/images/avatar-daniyal.png',
  },
  {
    quote: 'As a G1 I was getting refused everywhere. PolarGuard found me coverage in under an hour and the pink card was in my email the same day. The prepaid discount is real.',
    name: 'Priya M.',
    location: 'Etobicoke, ON',
    driverType: 'New G1',
    badge: 'Saved $1,100 / year',
    avatar: '/images/avatar-priya.png',
  },
  {
    quote: 'Switched mid-term and they prorated everything cleanly. Chose the $1,000 deductible to keep the premium down. Honest advice, no upsell.',
    name: 'Marcus T.',
    location: 'North York, ON',
    driverType: 'Full G · Sedan',
    badge: 'Saved $285 / year',
    avatar: '/images/avatar-marcus.png',
  },
];

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center mb-3">
        <Icon size={18} className="text-[#168A5A]" strokeWidth={2} />
      </div>
      <p className="font-satoshi text-[28px] sm:text-[32px] font-medium text-[#111] tracking-[-0.02em] mb-1">
        {stat.value}
      </p>
      <p className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#5F6368]">
        {stat.label}
      </p>
    </div>
  );
}

// ─── Cost Feature Card ──────────────────────────────────────
function CostFeatureCard({ feature, index }: { feature: typeof costFeatures[0]; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`flex items-start gap-4 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-9 h-9 rounded-full bg-[#E8F5EE] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={16} className="text-[#168A5A]" strokeWidth={2} />
      </div>
      <div>
        <h3 className="font-inter text-[14px] font-semibold text-[#111] mb-1">{feature.title}</h3>
        <p className="font-inter text-[13px] text-[#5F6368] leading-relaxed">{feature.desc}</p>
      </div>
    </div>
  );
}

// ─── Testimonial Card ───────────────────────────────────────
function TestimonialCard({ t, index }: { t: TestimonialItem; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-white border border-[#E6E8EB] rounded-[16px] p-7 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-700 relative ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Decorative quotation mark */}
      <Quote size={32} className="text-[#168A5A]/8 absolute top-5 right-5 rotate-180" strokeWidth={1} />

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill="#FFB800" stroke="#FFB800" />
        ))}
      </div>

      {/* Quote */}
      <p className="font-inter text-[#111] text-[15px] leading-[1.65] mb-6 relative z-10">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <img
            src={t.avatar}
            alt={t.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0"
            loading="lazy"
            width="64"
            height="64"
          />
          <div className="min-w-0">
            <p className="font-inter font-semibold text-[#111] text-[14px] truncate">{t.name}</p>
            <p className="font-inter text-[13px] text-[#5F6368] truncate">
              {t.location} · {t.driverType}
            </p>
          </div>
        </div>

        {/* Savings badge */}
        <span className="shrink-0 bg-[#F0FDF4] text-[#168A5A] font-inter text-[12px] font-semibold px-3 py-1.5 rounded-[8px]">
          {t.badge}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function TrustSocialProof() {
  return (
    <section id="testimonials" className="bg-[#F7F7F5] py-24 lg:py-[120px]">
      <div className="max-w-container mx-auto px-6 lg:px-12">

        {/* ─── Trust Badge ─── */}
        <div className="flex justify-center mb-10">
          <img
            src="/images/trust-badge.png"
            alt="15,000+ Canadian Drivers Protected shield badge"
            className="w-[110px] sm:w-[120px] h-auto"
            loading="lazy"
            width="120"
            height="120"
          />
        </div>

        {/* ─── Header ─── */}
        <div className="text-center mb-14">
          <p className="font-inter text-[12px] uppercase tracking-[0.2em] text-[#5F6368] mb-4">
            Trusted by Canadian Drivers
          </p>
          <h2 className="font-satoshi font-semibold text-[#111] text-[32px] sm:text-[36px] lg:text-[40px] leading-[1.1]">
            Real customers. Real savings.
          </h2>
          <p className="mt-4 font-inter text-[#5F6368] text-[16px] leading-relaxed max-w-[600px] mx-auto">
            Average client saves $487/year after switching to a PolarGuard-placed policy.
          </p>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-3 gap-6 mb-20 max-w-[700px] mx-auto">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* ─── How We Reduce Your Cost ─── */}
        <div className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {costFeatures.map((f, i) => (
              <CostFeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </div>

        {/* ─── Testimonials ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>

        {/* ─── Disclaimer ─── */}
        <p className="text-center font-inter text-[12px] text-[#9AA0A6] leading-relaxed">
          Reviews reflect verified PolarGuard customers. Savings vary by driver profile, vehicle and location.
        </p>

      </div>
    </section>
  );
}
