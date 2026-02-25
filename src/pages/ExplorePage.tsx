import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
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

/* â”€â”€ Dynamic import of every image in assets/ â”€â”€ */
const imageModules = import.meta.glob("../assets/*.{jpg,jpeg,png,webp}", {
  eager: true,
}) as Record<string, { default: string }>;

const titles = [
  "Intricate Peacock Feather Kolam",
  "Lotus Bloom Festival Rangoli",
  "Traditional Pongal Kolam",
  "Geometric Star Pattern Kolam",
  "Spiral Dots & Curves Design",
  "Floral Grid Kolam",
  "Circular Chakra Design",
  "Symmetry in Dot Art",
  "Classic Pulli Kolam",
  "Freehand Navaratri Rangoli",
  "Peacock Kolam with 7 Dots",
  "Simple & Elegant Daisy Kolam",
  "Diwali Diya Kolam",
  "Colorful Sanskar Bharati Design",
  "Abstract Line Art Kolam",
  "Margazhi Morning Kolam",
  "Kavi Oxide Kolam",
  "Chikku Star Pattern",
  "Heritage Temple Kolam",
  "Festive Diya Border",
];
const descriptions = [
  "A vibrant kolam featuring a graceful peacock, perfect for festive occasions.",
  "This design captures the essence of a blooming lotus â€” ideal for beginners.",
  "A traditional design with a modern twist using complex curves and symmetrical patterns.",
  "Celebrating the harvest season adorned with sun and sugarcane motifs.",
  "A beautiful blend of geometric shapes and fluid lines.",
  "Freehand bold colors and delicate strokes create a stunning visual masterpiece.",
  "Inspired by ancient symbols, this circular design is perfect for home decoration.",
  "A timeless classic that relies on a precise dot grid to form interconnected patterns.",
  "Classic pulli-based loops forming an elegant everyday kolam.",
  "Multi-layer star geometry celebrating Karthigai Deepam.",
];
const categoryList = [
  "Traditional",
  "Dot Grid",
  "Festive",
  "Contemporary",
  "Heritage",
  "Geometric",
  "Freehand",
];
const levelList = ["Beginner", "Intermediate", "Advanced"];
const tagPool = [
  "traditional",
  "festival",
  "beginner",
  "intermediate",
  "advanced",
  "dots",
  "lines",
  "symmetry",
  "geometric",
  "floral",
  "peacock",
  "lotus",
  "freehand",
  "rangoli",
  "indian-art",
  "spiritual",
  "culture",
  "vibrant",
  "harvest",
  "diwali",
  "pulli",
  "chikku",
  "kavi",
  "margazhi",
  "heritage",
];

function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickTags() {
  const s = new Set<string>();
  while (s.size < 3) s.add(pickRandom(tagPool));
  return [...s];
}

const seed = 42; // keeps the gallery stable across re-renders
let rng = seed;
function seededRand() {
  rng = (rng * 1664525 + 1013904223) & 0xffffffff;
  return Math.abs(rng) / 0x7fffffff;
}

const allDesigns = Object.keys(imageModules).map((path, i) => {
  const r = () => seededRand();
  return {
    id: nanoid(),
    title: titles[Math.floor(r() * titles.length)],
    imageUrl: imageModules[path].default,
    category: categoryList[Math.floor(r() * categoryList.length)],
    level: levelList[Math.floor(r() * levelList.length)],
    likes: Math.floor(r() * 495) + 5,
    description: descriptions[Math.floor(r() * descriptions.length)],
    tags: pickTags(),
  };
});

/* â”€â”€ UI â”€â”€ */
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

const categories = ["All", ...categoryList];
const levels = ["All", ...levelList];

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  const filteredDesigns = useMemo(() => {
    let result = [...allDesigns] as Design[];
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

  const paged = filteredDesigns.slice(0, page * PAGE_SIZE);

  const handleLike = (id: string) => {
    setLikedIds((prev) => {
      const n = new Set(prev);
      n.has(id)
        ? (n.delete(id), toast.info("Removed like"))
        : (n.add(id), toast.success("Liked!"));
      return n;
    });
  };
  const handleSave = (id: string) => {
    setSavedIds((prev) => {
      const n = new Set(prev);
      n.has(id)
        ? (n.delete(id), toast.info("Removed from saved"))
        : (n.add(id), toast.success("Saved!"));
      return n;
    });
  };
  const handleDownload = (design: Design) => {
    const a = document.createElement("a");
    a.href = design.imageUrl;
    a.download = `${design.title.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    a.click();
    toast.success(`Downloaded ${design.title}`);
  };
  const handlePractice = (design: Design) =>
    navigate("/canvas", { state: { imageUrl: design.imageUrl } });

  const levelColor = (level: string) => {
    if (level === "Beginner")
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (level === "Intermediate")
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={(v) => {
              setSelectedCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44 bg-card border-border">
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
          <Select
            value={selectedLevel}
            onValueChange={(v) => {
              setSelectedLevel(v);
              setPage(1);
            }}
          >
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

        {/* Count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing{" "}
          <span className="text-foreground font-medium">{paged.length}</span> of{" "}
          <span className="text-foreground font-medium">
            {filteredDesigns.length}
          </span>{" "}
          designs
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paged.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index % PAGE_SIZE, 15) * 0.04,
                  }}
                >
                  <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all duration-300">
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
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
                      <div className="absolute top-2 right-2">
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
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
                        {design.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {design.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
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
                        <div className="flex gap-1">
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
                            className={`h-7 px-2 ${savedIds.has(design.id) ? "text-primary" : "text-muted-foreground"}`}
                          >
                            <Bookmark
                              className={`w-3 h-3 ${savedIds.has(design.id) ? "fill-primary" : ""}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(design)}
                            className="h-7 px-2 text-muted-foreground"
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

            {/* Load more */}
            {paged.length < filteredDesigns.length && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground px-8"
                >
                  Load More ({filteredDesigns.length - paged.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
