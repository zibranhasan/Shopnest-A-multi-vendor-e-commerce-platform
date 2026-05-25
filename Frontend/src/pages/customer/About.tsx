import { ShoppingBag, Users, Store, Shield, Zap, Globe, Heart, ArrowRight, Star, Package, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, value: "500K+", label: "Happy Customers", color: "from-violet-500 to-purple-600" },
  { icon: Store, value: "12K+", label: "Active Vendors", color: "from-blue-500 to-cyan-600" },
  { icon: Package, value: "2M+", label: "Products Listed", color: "from-emerald-500 to-teal-600" },
  { icon: TrendingUp, value: "$180M+", label: "Annual GMV", color: "from-orange-500 to-amber-600" },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Every transaction is protected with enterprise-grade security and our buyer guarantee program ensures peace of mind.",
    color: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized infrastructure ensures sub-second page loads and real-time inventory updates across all vendors.",
    color: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Connect with vendors and customers worldwide, with localized experiences and multi-currency support.",
    color: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Heart,
    title: "Community First",
    description:
      "We build long-term relationships between buyers and sellers, fostering a thriving marketplace community.",
    color: "from-rose-500/10 to-pink-500/10",
    border: "border-rose-500/20",
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
  },
];

const team = [
  {
    name: "Aria Chen",
    role: "CEO & Co-Founder",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=aria&backgroundColor=b6e3f4",
    bio: "Former VP at Amazon Marketplace. 12+ years scaling e-commerce platforms globally.",
    stars: 5,
  },
  {
    name: "Marcus Osei",
    role: "CTO & Co-Founder",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=marcus&backgroundColor=c0aede",
    bio: "Ex-Google Engineer. Built distributed systems serving billions of requests daily.",
    stars: 5,
  },
  {
    name: "Sofia Ramirez",
    role: "Head of Vendor Success",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=sofia&backgroundColor=d1d4f9",
    bio: "Helped 5,000+ small businesses grow their online revenue. Passionate about empowering entrepreneurs.",
    stars: 5,
  },
  {
    name: "Jin Park",
    role: "Head of Design",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=jin&backgroundColor=ffd5dc",
    bio: "Award-winning UX designer. Crafting delightful experiences that convert and retain users.",
    stars: 5,
  },
];

const milestones = [
  { year: "2020", event: "Shopnest founded in a small apartment with 3 vendors" },
  { year: "2021", event: "Reached 1,000 vendors and launched mobile apps" },
  { year: "2022", event: "Series A funding — $12M raised to fuel expansion" },
  { year: "2023", event: "Crossed 100K customers and expanded to 15 countries" },
  { year: "2024", event: "Series B — $45M raised; launched AI-powered recommendations" },
  { year: "2025", event: "500K+ customers and $180M+ GMV milestone achieved" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[100px]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8 animate-pulse">
            <ShoppingBag className="w-4 h-4" />
            Multi-Vendor E-Commerce Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent leading-tight mb-6">
            Empowering Vendors,<br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Delighting Customers
            </span>
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Shopnest is the all-in-one marketplace where ambitious vendors and discerning shoppers
            come together to create extraordinary commerce experiences.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 font-semibold text-white transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/vendor/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
            >
              Become a Vendor
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-1 text-center overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-sm text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="relative px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10 p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-blue-900/20" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Our Mission</h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                To democratize commerce by giving every entrepreneur—regardless of size—the tools,
                audience, and support they need to build a thriving business online. We believe the
                future of retail belongs to those who dare to create.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="relative px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">What We Stand For</h2>
            <p className="text-white/40 text-lg">The principles that guide every decision we make</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, title, description, color, border, iconBg, iconColor }) => (
              <div
                key={title}
                className={`group p-7 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] transition-all duration-300`}
              >
                <div className={`inline-flex p-3 rounded-xl ${iconBg} mb-4`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-white/50 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="relative px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Our Journey</h2>
            <p className="text-white/40 text-lg">From a small idea to a thriving marketplace</p>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/60 via-blue-500/40 to-transparent" />
            <div className="space-y-8">
              {milestones.map(({ year, event }) => (
                <div key={year} className="flex gap-6 group">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="pb-2">
                    <span className="text-xs font-bold text-violet-400 tracking-widest uppercase">{year}</span>
                    <p className="text-white/70 mt-1 leading-relaxed group-hover:text-white/90 transition-colors">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="relative px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Meet the Team</h2>
            <p className="text-white/40 text-lg">The people building the future of commerce</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map(({ name, role, image, bio, stars }) => (
              <div
                key={name}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-violet-500/30 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="relative mx-auto mb-4 w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity blur-md scale-110" />
                  <img
                    src={image}
                    alt={name}
                    className="relative w-20 h-20 rounded-full object-cover border-2 border-white/10 group-hover:border-violet-500/50 transition-colors"
                  />
                </div>
                <div className="flex justify-center gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h3 className="font-bold text-white mb-1">{name}</h3>
                <div className="text-xs text-violet-400 font-medium mb-3">{role}</div>
                <p className="text-xs text-white/40 leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden p-14 border border-white/8">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-blue-600/15 to-cyan-600/10" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
                Ready to Join<br />
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Shopnest?
                </span>
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
                Whether you're a shopper looking for unique products or an entrepreneur ready to grow — we have a place for you.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 font-semibold text-white transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="relative text-center pb-12 text-white/20 text-sm">
        © {new Date().getFullYear()} Shopnest · Built with ❤️ for the global commerce community
      </div>
    </div>
  );
}
