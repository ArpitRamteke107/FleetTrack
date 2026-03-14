import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button';
import { Truck, BarChart3, Users, Fuel, ArrowRight, ShieldCheck, Activity, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'owner' ? '/owner-dashboard' : '/driver-dashboard');
    }
  }, [currentUser, navigate]);

  const features = [
    {
      icon: Truck,
      title: 'Vehicle Management',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      bullets: [
        'Complete vehicle profile & maintenance schedules.',
        'Fuel consumed per Km.',
        'Assigned driver tracking.',
      ],
    },
    {
      icon: BarChart3,
      title: 'Trip Analytics',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      bullets: [
        'Monitor trip performance and revenue.',
        'Breakdown by material type (Sand, Bricks, etc.).',
      ],
    },
    {
      icon: Users,
      title: 'Driver Management',
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      bullets: [
        'Complete driver profile & daily trip logs.',
        'Performance scores.',
        'Track material delivered vs. fuel efficiency.',
      ],
    },
    {
      icon: Fuel,
      title: 'Fuel Management',
      color: 'bg-orange-100',
      iconColor: 'text-orange-500',
      bullets: [
        'Log fill-ups via receipt scan.',
        'Calculate cost per trip.',
        'Automatic alerts for theft & excess consumption.',
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 90 } },
  };

  return (
    <div className="bg-white text-foreground min-h-screen flex flex-col font-sans">
      <Helmet>
        <title>Fleet Track Pro - Professional Fleet Management System</title>
        <meta name="description" content="Comprehensive fleet management solution for tracking vehicles, drivers, trips, fuel, and expenses with real-time analytics." />
      </Helmet>

      <Header />

      <main className="flex-1">

        {/* ── Hero Section ── */}
        <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-slate-50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/80 to-amber-50/50" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-[100px] animate-pulse" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <motion.div
                className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-sm mb-6 border border-amber-200 shadow-sm">
                    <Activity className="w-4 h-4" /> Next-Gen Logistics & Tracking
                  </span>
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight text-slate-900">
                  Manage your fleet with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500">
                    precision & intelligence
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                  Track vehicles, monitor trips, manage drivers, and analyze performance all in one platform built for modern transport businesses.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/signup">
                    <Button size="lg" className="h-14 px-8 text-lg gap-2 group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 border-0 transition-all duration-300 text-white rounded-full">
                      Start Tracking
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors duration-300 bg-white shadow-sm rounded-full">
                      Provider Login
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                className="relative hidden lg:block"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border-4 border-white">
                  <img src="/bg/fleet_hero.png" alt="Fleet Tracking Dashboard" className="w-full h-auto object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none" />
                </div>
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">System Status</p>
                    <p className="text-lg font-bold text-slate-800">100% Online</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Live Dashboard Snapshot / Features Section ── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-1">Live Dashboard Snapshot</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase tracking-wide">
                The Complete Material &amp; Vehicle Fleet Suite
              </h2>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
            >
              {features.map((feature, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <div className="h-full border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color}`}>
                      <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                    <ul className="space-y-1.5">
                      {feature.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Two Logins, One Seamless Workflow ── */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase tracking-wide">
                Two Logins, One Seamless Workflow
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20"
            >
              {/* Driver — Phone mockup */}
              <div className="flex flex-col items-center gap-6 text-center max-w-xs">
                <div className="relative">
                  {/* Phone frame */}
                  <div className="w-32 h-56 bg-white border-4 border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                    <div className="absolute top-2 w-10 h-1.5 bg-slate-800 rounded-full" />
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="w-16 h-1 bg-slate-200 rounded" />
                    <div className="w-12 h-1 bg-slate-100 rounded" />
                    <div className="w-14 h-1 bg-slate-100 rounded" />
                  </div>
                  {/* Arrow pointing right */}
                  <div className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 items-center">
                    <div className="w-10 border-t-2 border-dashed border-slate-400" />
                    <ArrowRight className="w-5 h-5 text-slate-400 -ml-1" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm uppercase tracking-wide">Driver Login — Mobile:</p>
                  <p className="text-slate-600 text-sm mt-1">Start trip in 2 taps.<br />Scan fuel receipt.</p>
                </div>
              </div>

              {/* Laptop mockup */}
              <div className="flex flex-col items-center gap-6 text-center max-w-xs">
                <div className="relative">
                  {/* Laptop frame */}
                  <div className="w-64 bg-white border-4 border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-slate-100 h-36 flex flex-col items-center justify-center gap-2 px-4">
                      <div className="w-full flex gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded" />
                      <div className="w-3/4 h-2 bg-slate-200 rounded" />
                      <div className="grid grid-cols-3 gap-1.5 w-full mt-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-3 bg-blue-100 rounded" />
                        ))}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-800" />
                  </div>
                  <div className="h-2 w-72 bg-slate-700 rounded-b-xl mx-auto -mt-px" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm uppercase tracking-wide">Owner Login — Web:</p>
                  <p className="text-slate-600 text-sm mt-1">System instantly analyzes trip.<br />See weekly profit summary.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Dark CTA Banner ── */}
        <section className="relative overflow-hidden bg-slate-900 py-20">
          {/* Truck image on right */}
          <div
            className="absolute inset-0 bg-no-repeat bg-right bg-cover opacity-20"
            style={{ backgroundImage: "url('/bg/fleet_hero.png')" }}
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/70" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 uppercase leading-tight tracking-tight drop-shadow-lg">
                Don't Just Run a Fleet.
                <br />
                <span className="text-white">Own Your Profitability.</span>
              </h2>

              <Link to="/signup">
                <button className="mt-2 inline-flex items-center gap-3 px-10 py-4 text-lg font-bold text-white bg-orange-500 hover:bg-orange-400 rounded-full shadow-[0_6px_30px_rgba(249,115,22,0.45)] hover:shadow-[0_10px_40px_rgba(249,115,22,0.6)] transition-all duration-300 hover:-translate-y-1">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>

              <p className="mt-6 text-slate-400 text-sm">
                Join modern transport businesses using FleetTrack Pro to boost revenue.
              </p>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default HomePage;