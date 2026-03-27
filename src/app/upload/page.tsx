"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Loader2, X, Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = [
  { name: "Anime", value: "anime" },
  { name: "Gaming", value: "gaming" },
  { name: "Movies", value: "movies" },
  { name: "Music", value: "music" },
  { name: "VFX", value: "vfx" },
  { name: "Other", value: "other" },
];

const QUALITY_OPTIONS = [
  { name: "HD (720p)", value: "HD" },
  { name: "Full HD (1080p)", value: "FHD" },
  { name: "4K (2160p)", value: "4K" },
];

export default function UploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    previewUrl: "",
    category: "",
    quality: "HD",
    driveLink: "",
    megaLink: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag) && tags.length < 10) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.driveLink) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/scenepacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: JSON.stringify(tags),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload");
      }

      toast.success("Scenepack uploaded! Waiting for admin approval.");
      router.push("/browse");
    } catch {
      toast.error("Failed to upload scenepack");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-600/10 mb-4">
                <Upload className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Upload Scenepack</h1>
              <p className="text-gray-400">
                Share your scenepack with the community. All uploads are reviewed before
                being published.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glow-border rounded-xl bg-gray-900/50 p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter scenepack title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your scenepack..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="bg-gray-800/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500 resize-none"
                  />
                </div>

                {/* Category & Quality */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800/50 border-red-900/30 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-red-900/30">
                        {CATEGORIES.map((cat) => (
                          <SelectItem
                            key={cat.value}
                            value={cat.value}
                            className="text-white focus:text-red-400 focus:bg-red-600/10"
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Quality</Label>
                    <Select
                      value={formData.quality}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, quality: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800/50 border-red-900/30 text-white">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-red-900/30">
                        {QUALITY_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-white focus:text-red-400 focus:bg-red-600/10"
                          >
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="bg-gray-800/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      className="border-red-600/30 text-red-400"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-gray-800 text-gray-300 pr-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 h-4 w-4 rounded-full bg-gray-700 flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Links Section */}
              <div className="glow-border rounded-xl bg-gray-900/50 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">Download Links</h3>

                {/* Thumbnail URL */}
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl" className="text-gray-300">
                    Thumbnail URL
                  </Label>
                  <Input
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    placeholder="https://example.com/thumbnail.jpg"
                    value={formData.thumbnailUrl}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Preview URL */}
                <div className="space-y-2">
                  <Label htmlFor="previewUrl" className="text-gray-300">
                    Preview Video URL
                  </Label>
                  <Input
                    id="previewUrl"
                    name="previewUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.previewUrl}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Drive Link */}
                <div className="space-y-2">
                  <Label htmlFor="driveLink" className="text-gray-300">
                    Google Drive Link <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="driveLink"
                    name="driveLink"
                    placeholder="https://drive.google.com/..."
                    value={formData.driveLink}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Mega Link */}
                <div className="space-y-2">
                  <Label htmlFor="megaLink" className="text-gray-300">
                    Mega Link (Optional)
                  </Label>
                  <Input
                    id="megaLink"
                    name="megaLink"
                    placeholder="https://mega.nz/..."
                    value={formData.megaLink}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-red-900/30 focus:border-red-600 focus:ring-red-600/20 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Scenepack
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
