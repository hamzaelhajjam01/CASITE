import { useEffect } from 'react';
import Navbar from '../sections/Navbar';
import VINQuoteSystem from '../sections/VINQuoteSystem';
import Footer from '../sections/Footer';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { ShieldCheck, Clock, CheckCircle2, Lock } from 'lucide-react';

export default function Quote() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-pg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 pt-[64px] lg:pt-[72px]">
        {/* Dedicated Page Hero Header */}
        <div className="bg-gradient-to-b from-white to-[#F7F7F5] border-b border-[#E6E8EB] py-10 lg:py-14">
          <div className="max-w-container mx-auto px-6 lg:px-12 text-center">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 bg-[#F0FDF4] border border-[#A7DAB9] text-[#168A5A] font-inter text-[12px] font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm">
              <ShieldCheck size={16} />
              <span>Official Canadian Auto Insurance Portal &bull; Licensed TD Broker</span>
            </div>

            <h1 className="font-satoshi font-bold text-[#111] text-[34px] sm:text-[42px] lg:text-[48px] tracking-tight leading-[1.15]">
              Get Your Instant Auto Quote &amp; Pink Slip
            </h1>
            <p className="mt-3 font-inter text-[#5F6368] text-[16px] sm:text-[18px] max-w-[660px] mx-auto leading-relaxed">
              Complete your demand in under 3 minutes. Your rate breakdown and official quote PDF will be immediately dispatched to your inbox.
            </p>

            {/* Micro value badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[13px] font-inter text-[#4B5563]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#168A5A]" />
                <span>100% Guaranteed Acceptance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-[#168A5A]" />
                <span>15&ndash;25 Min Pink Slip Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={16} className="text-[#168A5A]" />
                <span>Bank-Grade 256-Bit Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Quote System */}
        <div>
          <VINQuoteSystem />
        </div>

        {/* What Happens Next? Explainer Card */}
        <section className="py-12 bg-white border-t border-[#E6E8EB]">
          <div className="max-w-[880px] mx-auto px-6">
            <div className="text-center mb-8">
              <span className="font-inter text-[11px] font-bold uppercase tracking-[0.14em] text-[#168A5A]">
                Clear 3-Step Activation
              </span>
              <h3 className="font-satoshi font-semibold text-[#111] text-[22px] sm:text-[26px] mt-1">
                How Your Policy &amp; Pink Card Are Issued
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#FAFBFB] border border-[#E6E8EB] rounded-[16px] p-5">
                <div className="w-8 h-8 rounded-full bg-[#168A5A] text-white flex items-center justify-center font-inter font-bold text-[14px] mb-3">
                  1
                </div>
                <h4 className="font-inter font-semibold text-[#111] text-[15px] mb-1">
                  1. Submit Quote Request
                </h4>
                <p className="font-inter text-[13px] text-[#5F6368] leading-relaxed">
                  Enter your vehicle &amp; driver info above. An official PDF quote is immediately emailed to you with payment instructions.
                </p>
              </div>

              <div className="bg-[#FAFBFB] border border-[#E6E8EB] rounded-[16px] p-5">
                <div className="w-8 h-8 rounded-full bg-[#168A5A] text-white flex items-center justify-center font-inter font-bold text-[14px] mb-3">
                  2
                </div>
                <h4 className="font-inter font-semibold text-[#111] text-[15px] mb-1">
                  2. Send e-Transfer
                </h4>
                <p className="font-inter text-[13px] text-[#5F6368] leading-relaxed">
                  Send your payment via Interac e-Transfer using your Canadian online banking app with your Quote Reference in the memo.
                </p>
              </div>

              <div className="bg-[#FAFBFB] border border-[#E6E8EB] rounded-[16px] p-5">
                <div className="w-8 h-8 rounded-full bg-[#168A5A] text-white flex items-center justify-center font-inter font-bold text-[14px] mb-3">
                  3
                </div>
                <h4 className="font-inter font-semibold text-[#111] text-[15px] mb-1">
                  3. Receive Pink Card
                </h4>
                <p className="font-inter text-[13px] text-[#5F6368] leading-relaxed">
                  Reply to the email with your payment screenshot. Our licensed broker verifies it and sends your official Canadian Pink Slip.
                </p>
              </div>
            </div>

            {/* Need Help Assistance Banner */}
            <div className="mt-8 bg-[#F0FDF4] border border-[#A7DAB9] rounded-[16px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-inter font-semibold text-[#111] text-[15px]">
                  Need help with your quote or VIN lookup?
                </p>
                <p className="font-inter text-[13px] text-[#5F6368]">
                  Our licensed insurance team is active 24/7 on WhatsApp.
                </p>
              </div>
              <a
                href="https://wa.me/15799877798"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-inter text-[13px] font-semibold text-white bg-[#168A5A] hover:bg-[#13784E] px-4 py-2.5 rounded-full shrink-0 shadow-sm transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white shrink-0" />
                <span>Chat with a Broker (+1 579 987-7798)</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
