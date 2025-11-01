import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import {
  User,
  Settings,
  Heart,
  Bookmark,
  Download,
  Printer,
  Edit,
  Trash2,
  Eye,
  Share,
  Calendar,
  Grid3x3,
  Star,
  Trophy,
  Palette,
  Clock,
} from "lucide-react";
import { Post, listPosts } from "../utils/dataStore";

interface UserDesign {
  id: string;
  title: string;
  imageUrl: string;
  likes: number;
  comments: number;
  isPublic: boolean;
  gridType: string;
  complexity: string;
  createdAt: string;
  tags: string[];
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("myPosts");
  const [userDesigns, setUserDesigns] = useState<UserDesign[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<UserDesign[]>([]);
  const [privateDesigns, setPrivateDesigns] = useState<UserDesign[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Fetch real posts from data store, filter by current user
    (async () => {
      try {
        const posts = await listPosts();
        const myPosts = posts.filter((p) => p.user_id === user?.id);
        const mapped: UserDesign[] = myPosts.map((p) => ({
          id: p.id,
          title: p.title,
          imageUrl: p.image_url,
          likes: p.likes_count || 0,
          comments: p.comments_count || 0,
          isPublic: true,
          gridType: p.grid_type || "Freehand",
          complexity: (p.complexity || "Beginner") as any,
          createdAt: p.created_at,
          tags: p.tags || [],
        }));
        setUserDesigns(mapped);
      } catch (e) {
        console.error(e);
      }
    })();

    // Mock private and saved for now
    const mockPrivateDesigns: UserDesign[] = [];
    const mockSavedDesigns: UserDesign[] = [];
    setPrivateDesigns(mockPrivateDesigns);
    setSavedDesigns(mockSavedDesigns);
  }, [isAuthenticated, navigate, user?.id]);

  const handleDesignAction = (action: string, designId: string) => {
    switch (action) {
      case "edit":
        navigate("/canvas");
        toast.success("Opening design in editor...");
        break;
      case "delete":
        setUserDesigns((prev) => prev.filter((d) => d.id !== designId));
        setPrivateDesigns((prev) => prev.filter((d) => d.id !== designId));
        toast.success("Design deleted");
        break;
      case "publish":
        setPrivateDesigns((prev) => prev.filter((d) => d.id !== designId));
        toast.success("Design published to community");
        break;
      case "unpublish":
        toast.success("Design made private");
        break;
      case "download":
        toast.success("Design downloaded");
        break;
      case "print":
        toast.success("Sent to printer");
        break;
      case "share":
        navigator.clipboard.writeText(window.location.href);
        toast.success("Design link copied to clipboard");
        break;
    }
  };

  const stats = {
    totalDesigns: userDesigns.length + privateDesigns.length,
    totalLikes: userDesigns.reduce((sum, design) => sum + design.likes, 0),
    totalComments: userDesigns.reduce(
      (sum, design) => sum + design.comments,
      0
    ),
    savedDesigns: savedDesigns.length,
  };

  const DesignCard = ({
    design,
    showPrivateActions = false,
  }: {
    design: UserDesign;
    showPrivateActions?: boolean;
  }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-pink-100">
        <img
          src={design.imageUrl}
          alt={design.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-2 left-2 right-2 flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDesignAction("download", design.id)}
              className="flex-1 text-xs"
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDesignAction("print", design.id)}
              className="flex-1 text-xs"
            >
              <Printer className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDesignAction("share", design.id)}
              className="flex-1 text-xs"
            >
              <Share className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {!design.isPublic && (
          <Badge className="absolute top-2 left-2 bg-gray-500">Private</Badge>
        )}

        <Badge
          className={`absolute top-2 right-2 ${
            design.complexity === "Beginner"
              ? "bg-green-500"
              : design.complexity === "Intermediate"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        >
          {design.complexity}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="mb-1 line-clamp-1">{design.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Grid3x3 className="w-3 h-3 mr-1" />
              {design.gridType}
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(design.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {design.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {design.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{design.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {design.likes}
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {design.comments}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDesignAction("edit", design.id)}
            >
              <Edit className="w-3 h-3" />
            </Button>

            {showPrivateActions && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDesignAction("publish", design.id)}
              >
                Publish
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDesignAction("delete", design.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>

              <div className="flex-1">
                <h1 className="text-3xl mb-2">{user?.username}</h1>
                <p className="text-gray-600 mb-4">{user?.email}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Palette className="w-4 h-4 mr-1 text-orange-500" />
                      <span className="text-2xl">{stats.totalDesigns}</span>
                    </div>
                    <p className="text-sm text-gray-600">Designs</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Heart className="w-4 h-4 mr-1 text-red-500" />
                      <span className="text-2xl">{stats.totalLikes}</span>
                    </div>
                    <p className="text-sm text-gray-600">Likes</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="w-4 h-4 mr-1 text-blue-500" />
                      <span className="text-2xl">{stats.totalComments}</span>
                    </div>
                    <p className="text-sm text-gray-600">Comments</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bookmark className="w-4 h-4 mr-1 text-yellow-500" />
                      <span className="text-2xl">{stats.savedDesigns}</span>
                    </div>
                    <p className="text-sm text-gray-600">Saved</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button onClick={() => navigate("/canvas")}>
                  <Palette className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <h4>First Design</h4>
                  <p className="text-sm text-gray-600">
                    Created your first Kolam
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <h4>Community Favorite</h4>
                  <p className="text-sm text-gray-600">Received 50+ likes</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                <Clock className="w-8 h-8 text-green-500" />
                <div>
                  <h4>Weekly Creator</h4>
                  <p className="text-sm text-gray-600">
                    Created 3 designs this week
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="myPosts">
              My Posts ({userDesigns.length})
            </TabsTrigger>
            <TabsTrigger value="private">
              Private Designs ({privateDesigns.length})
            </TabsTrigger>
            <TabsTrigger value="saved">
              Saved Designs ({savedDesigns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="myPosts" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userDesigns.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
            {userDesigns.length === 0 && (
              <div className="text-center py-12">
                <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl mb-2">No public designs yet</h3>
                <p className="text-gray-600 mb-4">
                  Create and share your first Kolam design
                </p>
                <Button onClick={() => navigate("/canvas")}>
                  Start Creating
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="private" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {privateDesigns.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  showPrivateActions
                />
              ))}
            </div>
            {privateDesigns.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl mb-2">No private designs</h3>
                <p className="text-gray-600">
                  Your draft designs will appear here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedDesigns.map((design) => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
            {savedDesigns.length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl mb-2">No saved designs</h3>
                <p className="text-gray-600 mb-4">
                  Designs you save from the community will appear here
                </p>
                <Button onClick={() => navigate("/explore")}>
                  Explore Designs
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
