import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Download,
  Bookmark,
  Search,
  ArrowLeft,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

// Direct import of all 5 Lovable project assets
import kolamChikku from "@/assets/kolam-chikku.jpg";
import kolamHero from "@/assets/kolam-hero.jpg";
import kolamKavi from "@/assets/kolam-kavi.jpg";
import kolamPulli from "@/assets/kolam-pulli.jpg";
import kolamSanskur from "@/assets/kolam-sanskar.jpg";

interface Design {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  level: string;
  likes: number;
  description: string;
  tags: string[];
}

const mockDesigns: Design[] = [
  {
    id: "1",
    title: "Chikku Kolam",
    imageUrl: kolamChikku,
    category: "Traditional",
    level: "Intermediate",
    likes: 142,
    description: "A classic chikku (star) pattern with interlocking loops",
    tags: ["chikku", "loops", "traditional"],
  },
  {
    id: "2",
    title: "Pulli Kolam",
    imageUrl: kolamPulli,
    category: "Dot Grid",
    level: "Beginner",
    likes: 98,
    description: "Elegant dot-based kolam perfect for daily use",
    tags: ["pulli", "dots", "daily"],
  },
  {
    id: "3",
    title: "Kavi Kolam",
    imageUrl: kolamKavi,
    category: "Festive",
    level: "Advanced",
    likes: 217,
    description:
      "Intricate kavi (red oxide) style patterns for special occasions",
    tags: ["kavi", "festive", "intricate"],
  },
  {
    id: "4",
    title: "Hero Kolam",
    imageUrl: kolamHero,
    category: "Contemporary",
    level: "Intermediate",
    likes: 173,
    description:
      "A modern reinterpretation blending symmetry with geometric flair",
    tags: ["modern", "symmetric", "geometric"],
  },
  {
    id: "5",
    title: "Sanskar Kolam",
    imageUrl: kolamSanskur,
    category: "Heritage",
    level: "Advanced",
    likes: 289,
    description:
      "Heritage pattern celebrating the rich cultural heritage of south India",
    tags: ["heritage", "cultural", "south-india"],
  },
];

const categories = [
  "All",
  "Traditional",
  "Dot Grid",
  "Festive",
  "Contemporary",
  "Heritage",
];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filteredDesigns = useMemo(() => {
    let result = [...mockDesigns];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.tags.some((t) => t.includes(q)),
      );
    }
    if (selectedCategory !== "All")
      result = result.filter((d) => d.category === selectedCategory);
    if (selectedLevel !== "All")
      result = result.filter((d) => d.level === selectedLevel);
    result.sort((a, b) =>
      sortBy === "popular" ? b.likes - a.likes : a.title.localeCompare(b.title),
    );
    return result;
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  const handleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed like");
      } else {
        next.add(id);
        toast.success("Liked!");
      }
      return next;
    });
  };

  const handleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Removed from saved");
      } else {
        next.add(id);
        toast.success("Saved to collection!");
      }
      return next;
    });
  };

  const handleDownload = (design: Design) => {
    const link = document.createElement("a");
    link.href = design.imageUrl;
    link.download = `${design.title.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    link.click();
    toast.success(`Downloaded ${design.title}`);
  };

  const handlePractice = (design: Design) => {
    navigate("/canvas", { state: { imageUrl: design.imageUrl } });
  };

  const levelColor = (level: string) => {
    if (level === "Beginner")
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (level === "Intermediate")
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Explore Gallery</h1>
            <p className="text-xs text-muted-foreground">
              Discover and practice traditional kolam designs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-40 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          {filteredDesigns.length} design
          {filteredDesigns.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        {filteredDesigns.length === 0 ? (
          <div className="text-center py-20">
            <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No designs found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design, index) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all duration-300">
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                        onClick={() => handlePractice(design)}
                      >
                        Practice This Design
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge
                        className={`text-xs border ${levelColor(design.level)}`}
                      >
                        {design.level}
                      </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-black/50 text-white border-0"
                      >
                        {design.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">
                      {design.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {design.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {design.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs py-0 border-border text-muted-foreground"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(design.id)}
                          className={`flex items-center gap-1 text-xs h-7 px-2 ${likedIds.has(design.id) ? "text-red-400" : "text-muted-foreground"}`}
                        >
                          <Heart
                            className={`w-3 h-3 ${likedIds.has(design.id) ? "fill-red-400" : ""}`}
                          />
                          {design.likes + (likedIds.has(design.id) ? 1 : 0)}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(design.id)}
                          className={`flex items-center gap-1 text-xs h-7 px-2 ${savedIds.has(design.id) ? "text-primary" : "text-muted-foreground"}`}
                        >
                          <Bookmark
                            className={`w-3 h-3 ${savedIds.has(design.id) ? "fill-primary" : ""}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(design)}
                          className="flex items-center gap-1 text-xs h-7 px-2 text-muted-foreground"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePractice(design)}
                        className="text-xs h-7 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        Practice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
