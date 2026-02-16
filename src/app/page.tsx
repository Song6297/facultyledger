"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowRight, CheckCircle, Shield, BarChart3, Users, Loader2, Clock, IndianRupee } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-300 selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link className="flex items-center gap-3 group" href="/">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white uppercase italic">Faculty<span className="text-blue-600">Core</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Modules', 'About', 'Contact'].map((item) => (
              <Link key={item} className="text-sm font-bold text-slate-400 hover:text-white transition-colors" href={`#${item.toLowerCase()}`}>
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-white px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
              Login
            </Link>
            <Link href="/signup" className="text-sm font-bold text-white px-6 py-2.5 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
              Request Demo
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Intelligent Academic Workforce Management
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white leading-[1.1]">
                Transform Academic <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Precision & Control</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
                FacultyCore is an enterprise-grade platform designed for modern institutions to manage teachers, performance, and payroll through automated smart tracking.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-600/20 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all font-black text-lg flex items-center justify-center gap-2"
                >
                  Get Started Today <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#modules"
                  className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl border border-white/10 hover:bg-slate-800 transition-all font-bold text-lg"
                >
                  Request Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why FacultyCore Grid */}
        <section id="features" className="py-24 bg-slate-950">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 px-4">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-white italic">Why <span className="text-blue-600">FacultyCore?</span></h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Institutional Operations Excellence</p>
              </div>
              <div className="h-1 flex-1 bg-white/5 rounded-full mb-4 hidden md:block mx-12" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Centralized Data", desc: "Complete faculty records, employment status, and performance history in one vault.", icon: <Users /> },
                { title: "Smart Attendance", desc: "Real-time monitoring with automated check-in/out and anomaly detection.", icon: <Clock /> },
                { title: "Rule Enforcement", desc: "Automated disciplinary enforcement and salary penalty management.", icon: <Shield /> },
                { title: "Payroll Control", desc: "Consolidated institutional balance tracking and transparent salary distribution.", icon: <IndianRupee /> },
                { title: "Compliance Logs", desc: "Audit trails for every administrative action ensuring total accountability.", icon: <CheckCircle /> },
                { title: "Advanced Analytics", desc: "Actionable insights into trends, violation patterns, and expenses.", icon: <BarChart3 /> },
                { title: "Role-Based Control", desc: "Multi-level administrative access for Admin, Principal, and Management.", icon: <Users /> },
                { title: "Secure Docs", desc: "Encrypted storage for contracts, certifications, and identity documents.", icon: <Shield /> }
              ].map((benefit, i) => (
                <div key={i} className="group bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all hover:bg-slate-900">
                  <div className="bg-blue-600/10 p-4 rounded-2xl text-blue-500 w-fit mb-6 group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{benefit.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Feature Deep Dive */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-12">
                <div className="space-y-4">
                  <div className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Precision Engineering</div>
                  <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Advanced Disciplinary <br /> & Compliance Engine</h2>
                  <p className="text-lg text-slate-400 font-medium">Define institutional rules and automatically apply penalties for violations such as late attendance or absence. The system manages the entire lifecycle of enforcement.</p>
                </div>
                <div className="space-y-6">
                  {[
                    "Custom Rule Configuration & Logic",
                    "Automated Violation Detection",
                    "Integrated Salary Penalty Enforcement",
                    "Warning & Suspension Tracking"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="bg-blue-600 p-1 rounded-md text-white group-hover:scale-125 transition-transform"><CheckCircle className="h-5 w-5" /></div>
                      <span className="font-bold text-white tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="aspect-square bg-slate-950 rounded-[3rem] border border-white/10 shadow-3xl shadow-blue-500/10 p-2 overflow-hidden">
                  <div className="w-full h-full bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 relative">
                    {/* Decorative UI elements mimicking a dashboard */}
                    <div className="space-y-4">
                      <div className="h-4 w-[60%] bg-blue-600/20 rounded-full" />
                      <div className="h-4 w-[40%] bg-slate-800 rounded-full" />
                      <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="h-32 bg-slate-800/50 rounded-2xl border border-white/5 animate-pulse" />
                        <div className="h-32 bg-slate-800/50 rounded-2xl border border-white/5 animate-pulse" style={{ animationDelay: '1s' }} />
                      </div>
                      <div className="h-40 bg-blue-600/10 rounded-2xl border border-blue-500/10 mt-4 overflow-hidden">
                        <div className="h-full w-[70%] bg-blue-600/10 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Modules Grid */}
        <section id="modules" className="py-24 bg-slate-950">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-white">System Modules</h2>
              <p className="text-slate-400 font-medium max-w-2xl mx-auto italic">A modular ecosystem designed for institutional total-visibility</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Attendance Management", features: ["Daily Monitoring", "Late Arrival Detection", "Absence Tracking", "History Logs"], color: "blue" },
                { title: "Finance & Payroll", features: ["Monthly Processing", "Deduction Logic", "Balance Tracking", "Transaction Records"], color: "purple" },
                { title: "Performance Analytics", features: ["Performance Scoring", "Behavioral Analysis", "Institutional Insights", "Trends Visualization"], color: "green" },
                { title: "Administrative Control", features: ["RBAC Access", "Tiered Management", "System Config", "Audit Logging"], color: "orange" }
              ].map((mod, i) => (
                <div key={i} className="bg-slate-900/30 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm group hover:border-white/10 transition-all">
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4 italic uppercase tracking-tighter">
                    <div className={`h-1 w-12 bg-${mod.color}-600 rounded-full`} />
                    {mod.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mod.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-32 relative overflow-hidden bg-slate-950 border-t border-white/5">
          <div className="container mx-auto px-6 text-center space-y-12 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black text-white leading-tight">
              Ready to Streamline <br /> Your <span className="italic text-blue-600 underline decoration-blue-500/30">Workforce?</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup" className="group px-12 py-6 bg-white text-slate-950 rounded-2xl font-black text-xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center gap-2">
                Launch FacultyCore <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">Used by Leading Universities & Schools</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <Link className="flex items-center gap-3" href="/">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <Users className="h-5 w-5" />
                </div>
                <span className="font-black text-xl tracking-tighter text-white uppercase italic">FacultyCore</span>
              </Link>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Intelligent academic workforce management platform designed for the next generation of educational leadership.</p>
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Support & Contact</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="mailto:support@facultycore.com" className="hover:text-blue-500">support@facultycore.com</a></li>
                <li><span className="text-slate-400">+91-XXXXXXXXXX</span></li>
                <li className="text-xs text-slate-600 leading-snug font-medium italic">Institutional Technology Solutions HQ <br /> Education Tech Park, Silicon Valley</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Institutional Focus</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-500">
                <li>Colleges & Universities</li>
                <li>Modern K-12 Academies</li>
                <li>Research Institutions</li>
                <li>Training Centers</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Legal</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-500">
                <li><Link href="#" className="hover:text-blue-500">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-500">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-blue-500">Security Audit</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              © 2026 FacultyCore. All rights reserved. Intellectual Property.
            </p>
            <div className="flex gap-6">
              {/* Social Icons Placeholder */}
              <div className="h-4 w-4 bg-white/5 rounded-full" />
              <div className="h-4 w-4 bg-white/5 rounded-full" />
              <div className="h-4 w-4 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
