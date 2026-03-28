"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const quotes = [
  "Premium scenepacks for editors",
  "Join thousands of creators",
  "Quality assets, zero hassle",
];

type PasswordStrength = "weak" | "fair" | "good" | "strong";

function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) return "weak";
  
  let score = 0;
  
  // Length check
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  if (score <= 4) return "good";
  return "strong";
}

function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case "weak": return "bg-red-500";
    case "fair": return "bg-yellow-500";
    case "good": return "bg-green-500";
    case "strong": return "bg-emerald-500";
  }
}

function getStrengthWidth(strength: PasswordStrength): string {
  switch (strength) {
    case "weak": return "w-1/4";
    case "fair": return "w-1/2";
    case "good": return "w-3/4";
    case "strong": return "w-full";
  }
}

function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case "weak": return "Weak";
    case "fair": return "Fair";
    case "good": return "Good";
    case "strong": return "Strong";
  }
}

export default function SignupPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string; 
    general?: string 
  }>({});
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Rotate quotes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const passwordStrength = calculatePasswordStrength(password);

  const validateForm = () => {
    const newErrors: { 
      name?: string; 
      email?: string; 
      password?: string; 
      confirmPassword?: string 
    } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Something went wrong" });
        setIsLoading(false);
        return;
      }

      router.push("/auth/login?registered=true");
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Panel - Dark with Rotating Quotes */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E11D48]/10 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-display font-bold text-white">
              Mythic<span className="text-[#E11D48]">Editz17</span>
            </h1>
          </motion.div>
          
          {/* Rotating Quotes */}
          <div className="h-24 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-2xl text-zinc-300 text-center font-light"
              >
                {quotes[currentQuoteIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          {/* Quote indicators */}
          <div className="flex gap-2 mt-8">
            {quotes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuoteIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentQuoteIndex 
                    ? 'bg-[#E11D48] w-6' 
                    : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="flex items-center gap-4 text-zinc-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>HD Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Fast Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Free Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
            <p className="text-zinc-400">
              Join the community and start sharing your scenepacks
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {errors.general}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`bg-black/50 border-white/10 focus:border-[#E11D48] focus:ring-[#E11D48]/20 text-white placeholder:text-zinc-600 h-11 ${
                  errors.name ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`bg-black/50 border-white/10 focus:border-[#E11D48] focus:ring-[#E11D48]/20 text-white placeholder:text-zinc-600 h-11 ${
                  errors.email ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`bg-black/50 border-white/10 focus:border-[#E11D48] focus:ring-[#E11D48]/20 text-white placeholder:text-zinc-600 h-11 pr-10 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1.5">
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)} ${getStrengthWidth(passwordStrength)}`}
                    />
                  </div>
                  <p className={`text-xs ${
                    passwordStrength === 'weak' ? 'text-red-400' :
                    passwordStrength === 'fair' ? 'text-yellow-400' :
                    passwordStrength === 'good' ? 'text-green-400' :
                    'text-emerald-400'
                  }`}>
                    {getStrengthLabel(passwordStrength)} password
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={`bg-black/50 border-white/10 focus:border-[#E11D48] focus:ring-[#E11D48]/20 text-white placeholder:text-zinc-600 h-11 pr-10 ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E11D48] hover:bg-[#E11D48]/90 text-white h-11 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0A0A0A] text-zinc-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <Link href="/auth/login">
            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/5 hover:text-white h-11"
            >
              Sign in instead
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
