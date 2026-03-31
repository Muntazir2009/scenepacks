"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Cloud,
  ExternalLink,
  Download,
  Eye,
  LogIn,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Anime", value: "Anime" },
  { name: "Gaming", value: "Gaming" },
  { name: "Movies", value: "Movies" },
  { name: "Music", value: "Music" },
  { name: "VFX", value: "VFX" },
  { name: "Sports", value: "Sports" },
  { name: "Nature", value: "Nature" },
  { name: "Abstract", value: "Abstract" },
];

const QUALITY_OPTIONS = [
  { name: "HD (720p)", value: "HD" },
  { name: "Full HD (1080p)", value: "FHD" },
  { name: "4K (2160p)", value: "4K" },
];

const STEPS = [
  { id: 1, title: "Details", description: "Basic information" },
  { id: 2, title: "Links", description: "Download & preview" },
  { id: 3, title: "Review", description: "Final check" },
];

interface FormData {
  title: string;
  description: string;
  category: string;
  quality: string;
  tags: string[];
  thumbnailUrl: string;
  previewUrl: string;
  driveLink: string;
  megaLink: string;
}

interface FormErrors {
  title?: string;
  category?: string;
  driveLink?: string;
  thumbnailUrl?: string;
  tags?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Success animation variants
const successContainer = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: "easeOut" as const },
      opacity: { duration: 0.01 },
    },
  },
};

const confettiVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: [0, 1, 0],
    y: -50 - Math.random() * 100,
    x: (Math.random() - 0.5) * 200,
    rotate: Math.random() * 360,
    transition: {
      delay: i * 0.05,
      duration: 1,
      ease: "easeOut" as const,
    },
  }),
};

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentTag, setCurrentTag] = useState("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    quality: "HD",
    tags: [],
    thumbnailUrl: "",
    previewUrl: "",
    driveLink: "",
    megaLink: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Validation for each step
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
      } else if (formData.title.trim().length < 3) {
        newErrors.title = "Title must be at least 3 characters";
      }
      if (!formData.category) {
        newErrors.category = "Please select a category";
      }
      if (formData.tags.length > 5) {
        newErrors.tags = "Maximum 5 tags allowed";
      }
    }

    if (step === 2) {
      if (!formData.driveLink.trim()) {
        newErrors.driveLink = "Google Drive link is required";
      } else if (!isValidDriveUrl(formData.driveLink)) {
        newErrors.driveLink = "Please enter a valid Google Drive URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidDriveUrl = (url: string): boolean => {
    return url.includes("drive.google.com") || url.includes("docs.google.com");
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url) || 
             url.includes("imgur.com") || 
             url.includes("i.redd.it") ||
             url.includes("images.unsplash.com");
    } catch {
      return false;
    }
  };

  const isStepValid = (step: number): boolean => {
    if (step === 1) {
      return (
        formData.title.trim().length >= 3 &&
        !!formData.category &&
        formData.tags.length <= 5
      );
    }
    if (step === 2) {
      return formData.driveLink.trim().length > 0 && isValidDriveUrl(formData.driveLink);
    }
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setCurrentTag("");
      if (errors.tags) setErrors((prev) => ({ ...prev, tags: undefined }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/scenepacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: JSON.stringify(formData.tags),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload");
      }

      setIsSuccess(true);
    } catch {
      setErrors({ driveLink: "Failed to upload scenepack. Please try again." });
      setIsLoading(false);
    }
  };

  const handleUploadAnother = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      quality: "HD",
      tags: [],
      thumbnailUrl: "",
      previewUrl: "",
      driveLink: "",
      megaLink: "",
    });
    setCurrentStep(1);
    setIsSuccess(false);
    setIsLoading(false);
    setErrors({});
  };

  // Auth Gate
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#E11D48]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#0A0A0A] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <Upload className="h-10 w-10 text-[#E11D48]" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">
              Please sign in to upload scenepacks
            </h1>
            <p className="text-zinc-400 mb-6">
              You need an account to share your scenepacks with the community.
            </p>
            <Button
              onClick={() => router.push("/auth/login?callbackUrl=/upload")}
              className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-8 h-12"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial="hidden"
            animate="visible"
            className="text-center max-w-md"
          >
            {/* Success Animation */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              {/* Confetti */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={confettiVariants}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: ["#E11D48", "#f43f5e", "#fbbf24", "#22c55e", "#60a5fa"][
                      i % 5
                    ],
                  }}
                />
              ))}
              
              {/* Checkmark Circle */}
              <motion.div
                variants={successContainer}
                className="w-24 h-24 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center"
              >
                <svg className="w-12 h-12" viewBox="0 0 24 24">
                  <motion.path
                    variants={checkmarkVariants}
                    d="M5 13l4 4L19 7"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-semibold text-white mb-3">
                Upload Successful!
              </h1>
              <p className="text-zinc-400 mb-8">
                Your pack is pending review. We&apos;ll notify you once it&apos;s approved.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleUploadAnother}
                  variant="outline"
                  className="border-white/[0.1] text-white hover:bg-white/5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Another
                </Button>
                <Button
                  onClick={() => router.push("/browse")}
                  className="bg-[#E11D48] hover:bg-[#E11D48]/90"
                >
                  View My Uploads
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-[#E11D48]/10 mb-4 border border-[#E11D48]/20">
              <Upload className="h-7 w-7 text-[#E11D48]" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">Upload Scenepack</h1>
            <p className="text-zinc-400">
              Share your scenepack with the community
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center flex-1"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: currentStep === step.id ? 1.1 : 1,
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        currentStep > step.id
                          ? "bg-[#E11D48] text-white"
                          : currentStep === step.id
                          ? "bg-[#E11D48] text-white"
                          : "bg-[#0A0A0A] border border-white/[0.06] text-zinc-500"
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        step.id
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        "text-sm font-medium hidden sm:block",
                        currentStep === step.id ? "text-white" : "text-zinc-500"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4 bg-[#0A0A0A] border-t border-white/[0.06]">
                      <motion.div
                        className="h-full bg-[#E11D48]"
                        initial={{ width: "0%" }}
                        animate={{
                          width: currentStep > step.id ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-1" />
          </motion.div>

          {/* Form Container */}
          <div className="relative overflow-hidden rounded-xl bg-[#0A0A0A] border border-white/[0.06]">
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.3 }}
                  className="p-6 md:p-8"
                >
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-lg bg-[#E11D48]/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-[#E11D48]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">Details</h2>
                        <p className="text-sm text-zinc-400">Basic information about your scenepack</p>
                      </div>
                    </div>

                    {/* Title */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="title" className="text-zinc-300 flex items-center gap-1">
                        Title <span className="text-[#E11D48]">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter scenepack title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={cn(
                          "bg-black/50 border transition-all text-white placeholder:text-zinc-600 h-11",
                          errors.title
                            ? "border-[#E11D48] focus:border-[#E11D48]"
                            : "border-white/[0.06] focus:border-[#E11D48]/50"
                        )}
                      />
                      {errors.title && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-[#E11D48] flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" /> {errors.title}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Description */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description" className="text-zinc-300">
                          Description
                        </Label>
                        <span className={cn(
                          "text-xs",
                          formData.description.length > 450 ? "text-[#E11D48]" : "text-zinc-500"
                        )}>
                          {formData.description.length}/500
                        </span>
                      </div>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your scenepack... What's included? Any special effects?"
                        value={formData.description}
                        onChange={handleInputChange}
                        maxLength={500}
                        rows={4}
                        className={cn(
                          "bg-black/50 border resize-none text-white placeholder:text-zinc-600",
                          "border-white/[0.06] focus:border-[#E11D48]/50"
                        )}
                      />
                    </motion.div>

                    {/* Category & Quality */}
                    <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300 flex items-center gap-1">
                          Category <span className="text-[#E11D48]">*</span>
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => {
                            setFormData((prev) => ({ ...prev, category: value }));
                            if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "bg-black/50 border h-11 text-white",
                              errors.category
                                ? "border-[#E11D48]"
                                : "border-white/[0.06] focus:border-[#E11D48]/50"
                            )}
                          >
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0A0A0A] border-white/[0.06]">
                            {CATEGORIES.map((cat) => (
                              <SelectItem
                                key={cat.value}
                                value={cat.value}
                                className="text-white focus:bg-white/5 focus:text-[#E11D48]"
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-[#E11D48] flex items-center gap-1"
                          >
                            <AlertCircle className="h-3 w-3" /> {errors.category}
                          </motion.p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-zinc-300">Quality</Label>
                        <Select
                          value={formData.quality}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, quality: value }))
                          }
                        >
                          <SelectTrigger className="bg-black/50 border border-white/[0.06] h-11 text-white">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0A0A0A] border-white/[0.06]">
                            {QUALITY_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-white focus:bg-white/5 focus:text-[#E11D48]"
                              >
                                {opt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>

                    {/* Tags */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label className="text-zinc-300">
                        Tags <span className="text-zinc-500 font-normal">(max 5, comma-separated)</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          className="bg-black/50 border border-white/[0.06] focus:border-[#E11D48]/50 text-white placeholder:text-zinc-600 h-11"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddTag}
                          disabled={!currentTag.trim() || formData.tags.length >= 5}
                          className="border-white/[0.06] text-white hover:bg-white/5 hover:border-[#E11D48]/50 shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-white/5 text-zinc-300 pr-1 py-1.5 border border-white/[0.06] hover:border-[#E11D48]/50 transition-colors"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 h-4 w-4 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E11D48] transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      {errors.tags && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-[#E11D48] flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" /> {errors.tags}
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex justify-end mt-8 pt-6 border-t border-white/[0.06]">
                    <Button
                      onClick={nextStep}
                      disabled={!isStepValid(1)}
                      className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-8"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Links */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.3 }}
                  className="p-6 md:p-8"
                >
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-lg bg-[#E11D48]/10 flex items-center justify-center">
                        <LinkIcon className="h-5 w-5 text-[#E11D48]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">Links</h2>
                        <p className="text-sm text-zinc-400">Download links and preview</p>
                      </div>
                    </div>

                    {/* Thumbnail URL with Preview */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="thumbnailUrl" className="text-zinc-300">
                        Thumbnail URL
                      </Label>
                      <Input
                        id="thumbnailUrl"
                        name="thumbnailUrl"
                        placeholder="https://example.com/thumbnail.jpg"
                        value={formData.thumbnailUrl}
                        onChange={handleInputChange}
                        className={cn(
                          "bg-black/50 border text-white placeholder:text-zinc-600 h-11",
                          errors.thumbnailUrl
                            ? "border-[#E11D48]"
                            : "border-white/[0.06] focus:border-[#E11D48]/50"
                        )}
                      />
                      {/* Live Preview */}
                      <div className="mt-3">
                        <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden bg-black/30 border border-white/[0.06]">
                          {formData.thumbnailUrl && isValidImageUrl(formData.thumbnailUrl) ? (
                            <img
                              src={formData.thumbnailUrl}
                              alt="Thumbnail preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                              <ImageIcon className="h-8 w-8 mb-2" />
                              <span className="text-xs">Enter a valid image URL</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Preview Video URL */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="previewUrl" className="text-zinc-300">
                        Preview Video URL <span className="text-zinc-500 font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="previewUrl"
                        name="previewUrl"
                        placeholder="https://youtube.com/watch?v=..."
                        value={formData.previewUrl}
                        onChange={handleInputChange}
                        className="bg-black/50 border border-white/[0.06] focus:border-[#E11D48]/50 text-white placeholder:text-zinc-600 h-11"
                      />
                      <p className="text-xs text-zinc-500">YouTube or direct video URL</p>
                    </motion.div>

                    {/* Google Drive Link */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="driveLink" className="text-zinc-300 flex items-center gap-1">
                        <Cloud className="h-4 w-4 mr-1 text-[#E11D48]" />
                        Google Drive Link <span className="text-[#E11D48]">*</span>
                      </Label>
                      <Input
                        id="driveLink"
                        name="driveLink"
                        placeholder="https://drive.google.com/file/d/..."
                        value={formData.driveLink}
                        onChange={handleInputChange}
                        className={cn(
                          "bg-black/50 border text-white placeholder:text-zinc-600 h-11",
                          errors.driveLink
                            ? "border-[#E11D48]"
                            : "border-white/[0.06] focus:border-[#E11D48]/50"
                        )}
                      />
                      {errors.driveLink && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-[#E11D48] flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" /> {errors.driveLink}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Mega Link */}
                    <motion.div variants={fadeInUp} className="space-y-2">
                      <Label htmlFor="megaLink" className="text-zinc-300 flex items-center gap-1">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Mega Link <span className="text-zinc-500 font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="megaLink"
                        name="megaLink"
                        placeholder="https://mega.nz/file/..."
                        value={formData.megaLink}
                        onChange={handleInputChange}
                        className="bg-black/50 border border-white/[0.06] focus:border-[#E11D48]/50 text-white placeholder:text-zinc-600 h-11"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.06]">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="border-white/[0.06] text-white hover:bg-white/5"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!isStepValid(2)}
                      className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-8"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.3 }}
                  className="p-6 md:p-8"
                >
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">Review</h2>
                        <p className="text-sm text-zinc-400">Check your scenepack details</p>
                      </div>
                    </div>

                    {/* Card Preview */}
                    <motion.div variants={fadeInUp}>
                      <Label className="text-zinc-300 mb-3 block">Preview</Label>
                      <div className="max-w-sm">
                        {/* Simulated ScenepackCard */}
                        <article className="group relative rounded-lg bg-[#0A0A0A] border border-white/[0.06] overflow-hidden">
                          {/* Thumbnail */}
                          <div className="relative aspect-video overflow-hidden">
                            {formData.thumbnailUrl && isValidImageUrl(formData.thumbnailUrl) ? (
                              <img
                                src={formData.thumbnailUrl}
                                alt={formData.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
                                <span className="text-4xl font-black text-[#E11D48]/20 tracking-wider">ME17</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            
                            {/* Quality Badge */}
                            <span
                              className={cn(
                                "absolute top-3 left-3 px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wide",
                                formData.quality === "HD" && "bg-zinc-700 text-zinc-300",
                                formData.quality === "FHD" && "bg-blue-500/20 text-blue-400",
                                formData.quality === "4K" && "bg-yellow-500/20 text-yellow-400"
                              )}
                            >
                              {formData.quality}
                            </span>
                          </div>
                          
                          {/* Bottom Bar */}
                          <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/5">
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-white/5 text-zinc-400">
                              {formData.category || "Category"}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                              <Download className="w-3.5 h-3.5" />
                              0
                            </span>
                          </div>
                        </article>
                        
                        {/* Title below card */}
                        <h3 className="text-white font-medium mt-3 truncate">{formData.title || "Untitled"}</h3>
                      </div>
                    </motion.div>

                    {/* Details Summary */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                      <div className="bg-black/30 rounded-lg p-4 border border-white/[0.06]">
                        <h4 className="text-sm font-medium text-zinc-400 mb-3">Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-zinc-500">Title:</span>
                            <p className="text-white">{formData.title}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500">Category:</span>
                            <p className="text-white">{formData.category}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500">Quality:</span>
                            <p className="text-white">{formData.quality}</p>
                          </div>
                          <div>
                            <span className="text-zinc-500">Tags:</span>
                            <p className="text-white">{formData.tags.length > 0 ? formData.tags.join(", ") : "None"}</p>
                          </div>
                        </div>
                        {formData.description && (
                          <div className="mt-3 pt-3 border-t border-white/[0.06]">
                            <span className="text-zinc-500 text-sm">Description:</span>
                            <p className="text-white text-sm mt-1 line-clamp-2">{formData.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-black/30 rounded-lg p-4 border border-white/[0.06]">
                        <h4 className="text-sm font-medium text-zinc-400 mb-3">Links</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-zinc-500 shrink-0" />
                            <span className="text-zinc-500">Drive:</span>
                            <p className="text-white truncate">{formData.driveLink}</p>
                          </div>
                          {formData.megaLink && (
                            <div className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4 text-zinc-500 shrink-0" />
                              <span className="text-zinc-500">Mega:</span>
                              <p className="text-white truncate">{formData.megaLink}</p>
                            </div>
                          )}
                          {formData.previewUrl && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-zinc-500 shrink-0" />
                              <span className="text-zinc-500">Preview:</span>
                              <p className="text-white truncate">{formData.previewUrl}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.06]">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="border-white/[0.06] text-white hover:bg-white/5"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-8"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit for Review
                          <Check className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
