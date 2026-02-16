"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowRight, CheckCircle, Shield, BarChart3, Users, Loader2 } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-100 dark:border-gray-800">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Users className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">TWMS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors dark:text-gray-300" href="/login">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900 dark:text-white">
                  Teacher Workforce <span className="text-blue-600">Management System</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  A powerful, centralized platform for education staff compliance, attendance tracking, and automated payroll management.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-8 py-2 text-sm font-medium text-white shadow transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 items-start justify-center">
              <div className="flex flex-col items-center space-y-2 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-hover hover:shadow-md">
                <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Real-time Analytics</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Monitor workforce presence, attendance trends, and performance metrics in real-time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-hover hover:shadow-md">
                <Shield className="h-10 w-10 text-blue-600 mb-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compliance Rules</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Automated penalty engine for lateness and absenteeism based on customizable rules.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-hover hover:shadow-md">
                <CheckCircle className="h-10 w-10 text-blue-600 mb-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Automated Payroll</h3>
                <p className="text-sm text-gray-500 text-center dark:text-gray-400">
                  Generate error-free monthly salaries with auto-calculated deductions from violations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 TWMS ERP. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4 text-gray-500 dark:text-gray-400" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
