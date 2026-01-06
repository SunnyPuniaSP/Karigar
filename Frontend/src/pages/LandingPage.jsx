import React, { useState, useEffect } from "react";
import {
  MapPin,
  ShieldCheck,
  Clock,
  Hammer,
  Zap,
  Users,
  Briefcase,
  ArrowRight,
  BadgeCheck,
  Scale,
  Smartphone,
  CheckCircle2,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Shared Components ---

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Placeholder handler for future logic
  const handleAction = () => {
    console.log("Button clicked - Logic to be added by developer");
  };

  const scrollToSafety = () => {
    const section = document.getElementById("trust-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed w-full z-[100] transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer group"
              onClick={handleAction}
            >
              <div className="transition-colors p-2 rounded-xl mr-3 bg-brand-600 group-hover:bg-brand-700 shadow-lg shadow-brand-600/20">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  Karigar
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Safety Link */}
              <button
                onClick={scrollToSafety}
                className="text-sm font-medium text-slate-600 hover:text-brand-600 transition cursor-pointer"
              >
                Safety
              </button>

              {/* Secondary Action: For Workers */}
              <button
                onClick={() => navigate("/worker")}
                className="text-sm font-bold text-slate-800 hover:text-brand-600 transition cursor-pointer"
              >
                Join as Pro
              </button>

              {/* Primary Action: Book Service */}
              <button
                onClick={() => navigate("/customer")}
                className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-600/20 active:scale-95 transform duration-150 flex items-center gap-2 cursor-pointer"
              >
                Book a Service
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl md:hidden animate-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col p-4 space-y-3">
              <button
                onClick={() => {
                  handleAction();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
              >
                Home
              </button>
              <button
                onClick={() => {
                  handleAction();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
              >
                Safety
              </button>
              <button
                onClick={() => {
                  handleAction();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
              >
                Join as Professional
              </button>
              <button
                onClick={() => {
                  handleAction();
                  setIsMobileMenuOpen(false);
                }}
                className="text-center px-4 py-3 rounded-lg bg-brand-600 text-white font-bold shadow-md"
              >
                Book a Service
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

const Footer = () => {
  const handleAction = () => console.log("Footer link clicked");

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="bg-brand-600 p-2 rounded-lg mr-3">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Karigar</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              India's first hyper-local marketplace connecting skilled
              daily-wage professionals with households instantly. Safe, secure,
              and transparent.
            </p>
            <div className="flex space-x-4">
              {/* Social Placeholders */}
              <div
                onClick={handleAction}
                className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-brand-600 transition cursor-pointer"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </div>
              <div
                onClick={handleAction}
                className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-brand-600 transition cursor-pointer"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <button
                  onClick={handleAction}
                  className="hover:text-brand-500 transition text-left cursor-pointer"
                >
                  About Karigar
                </button>
              </li>
              <li>
                <button
                  onClick={handleAction}
                  className="hover:text-brand-500 transition text-left cursor-pointer"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  onClick={handleAction}
                  className="hover:text-brand-500 transition text-left cursor-pointer"
                >
                  Impact Report
                </button>
              </li>
              <li>
                <button
                  onClick={handleAction}
                  className="hover:text-brand-500 transition text-left cursor-pointer"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Services</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <button
                  onClick={handleAction}
                  className="hover:text-brand-500 transition text-left cursor-pointer"
                >
                  Electrician
                </button>
              </li>
              <li>
                <button
                  onClick={handleAction}
                  className="hover:text-brand-500 transition text-left cursor-pointer"
                >
                  Plumber
                </button>
              </li>
              <li>
                <button
                  onClick={handleAction}
                  className="hover:text-brand-500 transition text-left cursor-pointer"
                >
                  Carpenter
                </button>
              </li>
              <li>
                <button
                  onClick={handleAction}
                  className="hover:text-brand-500 transition text-left cursor-pointer"
                >
                  Appliance Repair
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Install App</h4>
            <p className="text-xs text-slate-500 mb-4">
              Experience the fastest way to book local experts.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleAction}
                className="bg-slate-800 hover:bg-slate-700 transition p-3 rounded-xl flex items-center border border-slate-700 cursor-pointer"
              >
                <Smartphone className="h-6 w-6 text-white mr-3" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Download on
                  </div>
                  <div className="text-sm font-bold text-white">App Store</div>
                </div>
              </button>
              <button
                onClick={handleAction}
                className="bg-slate-800 hover:bg-slate-700 transition p-3 rounded-xl flex items-center border border-slate-700 cursor-pointer"
              >
                <div className="h-6 w-6 bg-transparent text-white mr-3 flex items-center justify-center font-bold text-lg">
                  G
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Get it on
                  </div>
                  <div className="text-sm font-bold text-white">
                    Google Play
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Karigar Technologies Pvt Ltd. All
            rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              onClick={handleAction}
              className="hover:text-white transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={handleAction}
              className="hover:text-white transition"
            >
              Terms of Service
            </button>
            <button
              onClick={handleAction}
              className="hover:text-white transition"
            >
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Landing Page Sections ---

const StatsBar = () => {
  return (
    <div className="bg-slate-900 py-16 relative overflow-hidden">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {/* Stat 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-slate-800/50 p-3 rounded-2xl mb-4 ring-1 ring-white/10 shadow-lg shadow-black/20">
              <CheckCircle2 className="w-6 h-6 text-brand-500" />
            </div>
            <div className="text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
              50k+
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              Bookings Done
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-slate-800/50 p-3 rounded-2xl mb-4 ring-1 ring-white/10 shadow-lg shadow-black/20">
              <Star className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
              4.8/5
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              Average Rating
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-slate-800/50 p-3 rounded-2xl mb-4 ring-1 ring-white/10 shadow-lg shadow-black/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
              2k+
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              Verified Pros
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-slate-800/50 p-3 rounded-2xl mb-4 ring-1 ring-white/10 shadow-lg shadow-black/20">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
              30m
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              Arrival Time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DualPersonaSection = () => {
  const navigate = useNavigate();

  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            One Platform, Two Worlds
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            We are bridging the gap between skilled hands and household needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Customer Card */}
          <div className="relative group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 hover:shadow-2xl hover:shadow-brand-900/10 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="h-48 w-48 text-brand-600 transform rotate-12" />
            </div>
            <div className="p-10 relative z-10 flex flex-col h-full">
              <div className="bg-brand-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <Users className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                For Households
              </h3>
              <p className="text-slate-600 mb-8 text-lg leading-relaxed flex-grow">
                Get repairs done in minutes, not days. Transparent pricing,
                verified professionals, and a satisfaction guarantee for every
                job.
              </p>
              <ul className="space-y-3 mb-10 text-slate-700">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> No
                  bargaining needed
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />{" "}
                  Background checked pros
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Pay
                  after service
                </li>
              </ul>
              <button
                onClick={() => navigate("/customer")}
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition flex items-center justify-center group-hover:translate-y-[-2px] cursor-pointer"
              >
                Find a Professional
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Worker Card */}
          <div className="relative group overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase className="h-48 w-48 text-accent-500 transform -rotate-12" />
            </div>
            <div className="p-10 relative z-10 flex flex-col h-full">
              <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <Hammer className="h-8 w-8 text-accent-500" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                For Professionals
              </h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed flex-grow">
                Join India's largest network of skilled workers. Get daily jobs
                near your location, instant payments, and respect for your
                craft.
              </p>
              <ul className="space-y-3 mb-10 text-slate-300">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-accent-500 mr-3" /> 0%
                  Commission for first month
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-accent-500 mr-3" />{" "}
                  Flexible working hours
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-accent-500 mr-3" />{" "}
                  Insurance & benefits
                </li>
              </ul>
              <button
                onClick={() => navigate("/worker")}
                className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center group-hover:translate-y-[-2px] cursor-pointer"
              >
                Join as Partner
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrustSection = () => {
  return (
    <div className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-100 mb-6">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Trust & Safety
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Built for trust. <br />
            <span className="text-slate-500">Designed for peace of mind.</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            A secure marketplace for everyone. Whether you are hiring help or
            finding work, your safety is our priority.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)]">
          {/* Card 1: Verification (Vertical - Left) */}
          <div className="md:col-span-1 md:row-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-48 h-48 text-brand-600" />
            </div>

            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-brand-600">
              <BadgeCheck className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Verified Talent
            </h3>
            <p className="text-slate-500 leading-relaxed mb-8">
              Quality you can trust. Every professional earns their badge
              through rigorous checks.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                <span>Aadhaar Identity Check</span>
              </li>
              <li className="flex items-center text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                <span>Criminal Court Record Check</span>
              </li>
              <li className="flex items-center text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                <span>Skill & Quality Check</span>
              </li>
            </ul>

            {/* Visual: ID Card */}
            <div className="mt-auto relative mx-auto w-48 h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-md rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0"></div>
                <div className="space-y-2 w-full">
                  <div className="h-2 w-20 bg-slate-200 rounded"></div>
                  <div className="h-2 w-12 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-2 w-full bg-green-100 rounded"></div>
              </div>
              <div className="absolute -right-2 -top-2 bg-green-500 text-white p-1 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Fair Pricing (Inclusive for workers) */}
          <div className="md:col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10"></div>

            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
              <Scale className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Secure Escrow
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Funds held safely. Instant release to workers upon completion.
            </p>

            {/* Visual: Escrow UI */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500">Agreed Price</span>
                <span className="text-xs font-bold text-slate-900">₹450</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Funds Locked</span>
              </div>
            </div>
          </div>

          {/* Card 3: Instant Connection */}
          <div className="md:col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
              <Zap className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Instant Connection
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Smart matching connects the right expert to the right job.
            </p>

            {/* Visual: Radar Animation */}
            <div className="relative h-16 flex items-center justify-center">
              <div className="absolute w-16 h-16 bg-purple-100 rounded-full animate-ping opacity-20"></div>
              <div className="absolute w-10 h-10 bg-purple-100 rounded-full animate-ping opacity-40 delay-75"></div>
              <div className="relative z-10 bg-white border-2 border-purple-100 rounded-full p-1 shadow-sm">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="absolute top-0 right-8 w-6 h-6 bg-slate-200 rounded-full border-2 border-white animate-bounce delay-100"></div>
              <div className="absolute bottom-0 left-8 w-6 h-6 bg-slate-200 rounded-full border-2 border-white animate-bounce delay-300"></div>
            </div>
          </div>

          {/* Card 4: Real-time GPS */}
          <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group flex flex-col md:flex-row items-center gap-8">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            ></div>

            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-1 rounded-full border border-blue-500/30 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                  LIVE TRACKING
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-3">
                Live Safety & Tracking
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Mutual safety through live location. Eliminates address
                confusion and ensures a secure experience for both parties.
              </p>
            </div>

            {/* Visual: Map Route UI */}
            <div className="relative z-10 w-full md:w-1/2 bg-slate-800/50 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
              {/* Map graphic lines */}
              <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Pro
                  </span>
                </div>

                <div className="flex-1 mx-4 h-0.5 bg-slate-700 relative">
                  {/* Progress bar */}
                  <div className="absolute left-0 top-0 h-full w-2/3 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  {/* Moving marker */}
                  <div className="absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full border-4 border-slate-900 shadow-lg flex items-center justify-center">
                    <Hammer className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-[10px] text-green-500 font-medium">
                    You
                  </span>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                  {/* Placeholder avatar */}
                  <div className="w-full h-full bg-slate-600"></div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    Ramesh Kumar
                  </div>
                  <div className="text-xs text-slate-400">
                    Electrician • 4.8 ★
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-bold text-white">2 min</div>
                  <div className="text-xs text-slate-500">Away</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      <Navbar />

      <main>
        <div className="animate-in fade-in duration-700">
          {/* Hero Section */}
          <div className="relative pt-[18vh] pb-[14vh] lg:pt-32 lg:pb-28 overflow-hidden bg-white">

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-brand-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-accent-50 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-6xl mx-auto">

                {/* invisible live indicator for future use */}
                <div className="invisible inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 mb-8 shadow-sm hover:border-brand-300 transition cursor-default">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  Live in Mumbai, Delhi & Bangalore
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-8">

  <span className="block pb-1">
    Reliable help,
  </span>

  <span className="block pb-2 leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500">
    exactly when you need it.
  </span>

</h1>



                <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Karigar is the bridge between households needing quick repairs
                  and skilled professionals seeking dignified work. Fast, safe,
                  and transparent.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <button
                    onClick={() => navigate("/customer")}
                    className="group relative overflow-hidden bg-brand-600 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-600/30 hover:bg-brand-700 transition transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div className="flex items-center">
                      Book a Service
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/worker")}
                    className="bg-white text-slate-900 border-2 border-slate-100 px-8 py-5 rounded-2xl font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-center transform hover:-translate-y-1 shadow-lg shadow-slate-200/50 cursor-pointer"
                  >
                    <Hammer className="mr-2 h-5 w-5 text-slate-600" />
                    Join as Professional
                  </button>
                </div>

                <p className="mt-8 text-sm text-slate-400 font-medium">
                  Trusted by 10,000+ households across India
                </p>
              </div>
            </div>
          </div>

          <StatsBar />
          <DualPersonaSection />
          <div id="trust-section">
            <TrustSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
