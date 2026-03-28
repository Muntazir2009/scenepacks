"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const quotes = [
  "Premium scenepacks for professional editors",
  "Join thousands of creators worldwide",
  "Quality over quantity - curated packs only",
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  // Rotating quotes effect - fade in/out every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setQuoteVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Clear error when user starts typing
  useEffect(() => {
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }, [email, errors.email]);

  useEffect(() => {
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  }, [password, errors.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
      setShakeEmail(true);
      setTimeout(() => setShakeEmail(false), 500);
    }

    if (!password) {
      newErrors.password = "Password is required";
      setShakePassword(true);
      setTimeout(() => setShakePassword(false), 500);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Invalid email or password" });
        setShakeEmail(true);
        setShakePassword(true);
        setTimeout(() => {
          setShakeEmail(false);
          setShakePassword(false);
        }, 500);
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrors({ general: "Something went wrong" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Panel - Hidden on mobile (< 768px) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
        
        {/* Abstract geometric shapes (CSS only) */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large rotating square */}
          <div 
            className="absolute top-1/4 left-1/4 w-64 h-64 border border-white/5 rotate-45 animate-spin"
            style={{ animationDuration: '30s' }}
          />
          {/* Medium rotating square */}
          <div 
            className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-rose-600/10 rotate-12 animate-spin"
            style={{ animationDuration: '25s', animationDirection: 'reverse' }}
          />
          {/* Small floating squares */}
          <div 
            className="absolute top-1/2 right-1/3 w-32 h-32 border border-white/5 rotate-45 animate-spin"
            style={{ animationDuration: '20s' }}
          />
          {/* Decorative circles */}
          <div className="absolute top-1/3 left-1/6 w-2 h-2 bg-rose-600/30 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/6 w-3 h-3 bg-rose-600/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* CSS Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Quote section */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <AnimatePresence mode="wait">
            {quoteVisible && (
              <motion.p
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-3xl lg:text-4xl font-display text-white/90 text-center leading-relaxed"
              >
                &ldquo;{quotes[currentQuoteIndex]}&rdquo;
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Brand watermark */}
        <div className="absolute bottom-8 left-8">
          <span className="text-white/20 text-sm font-display tracking-wider">MYTHICEDITZ17</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-black">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Success banner - after signup redirect */}
          <AnimatePresence>
            {registered && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
              >
                Account created! Please sign in.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                MYTHIC<span className="text-rose-600">EDITZ</span>17
              </h1>
            </Link>
            <p className="text-zinc-400 mt-3">
              Welcome back. Sign in to continue.
            </p>
          </div>

          {/* General error message */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {errors.general}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <motion.div
                animate={shakeEmail ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-zinc-900 border-zinc-800 focus:border-rose-600 focus:ring-rose-600/20 text-white placeholder:text-zinc-500 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
              </motion.div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <motion.div
                animate={shakePassword ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-zinc-900 border-zinc-800 focus:border-rose-600 focus:ring-rose-600/20 text-white placeholder:text-zinc-500 pr-10 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-400">
                <input
                  type="checkbox"
                  className="rounded border-zinc-700 bg-zinc-900 text-rose-600 focus:ring-rose-600/20"
                />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-rose-500 hover:text-rose-400 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Primary button - rose */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-6 text-lg font-medium transition-all hover:shadow-lg hover:shadow-rose-600/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Link to other auth page */}
          <p className="mt-8 text-center text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-rose-500 hover:text-rose-400 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex bg-black items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
