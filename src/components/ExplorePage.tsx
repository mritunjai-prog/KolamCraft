import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { 
  Heart, MessageCircle, Bookmark, Download, Printer, 
  Search, Filter, Eye, User, Calendar, Grid3x3, Feather
} from 'lucide-react';

// --- IMPORTANT: IMPORT THE MOCK DATA HERE ---
import { mockDesigns } from '../data/exploreDesigns';
import CommentsDrawer from './CommentsDrawer';

interface KolamDesign {
  id: string;
  title: string;
  creator: string;
  imageUrl: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  gridType: string;
  createdAt: string;
  description: string;
}

const ExplorePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // --- USE THE MOCK DATA TO INITIALIZE THE STATE ---
  const [designs, setDesigns] = useState<KolamDesign[]>(mockDesigns as KolamDesign[]);
  const [filteredDesigns, setFilteredDesigns] = useState<KolamDesign[]>(mockDesigns as KolamDesign[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'complexity' | 'gridType'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'likes'>('recent');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [selectedGridType, setSelectedGridType] = useState<string>('all');
  const [commentsForPost, setCommentsForPost] = useState<string | null>(null);

  useEffect(() => {
    let filtered = designs.filter(design => {
      const matchesSearch = design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          design.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          design.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesComplexity = selectedComplexity === 'all' || design.complexity === selectedComplexity;
      const matchesGridType = selectedGridType === 'all' || design.gridType === selectedGridType;

      return matchesSearch && matchesComplexity && matchesGridType;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.likes + b.comments) - (a.likes + a.comments);
        case 'likes':
          return b.likes - a.likes;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredDesigns(filtered);
  }, [designs, searchTerm, selectedComplexity, selectedGridType, sortBy]);

  const handleAction = (action: string, designId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }

    if (action === 'comment') {
      setCommentsForPost(designId);
      return;
    }

    setDesigns(prev => prev.map(design => {
      if (design.id === designId) {
        switch (action) {
          case 'like':
            return { 
              ...design, 
              isLiked: !design.isLiked, 
              likes: design.isLiked ? design.likes - 1 : design.likes + 1 
            };
          case 'save':
            return { ...design, isSaved: !design.isSaved };
          default:
            return design;
        }
      }
      return design;
    }));

    switch (action) {
      case 'like':
        toast.success(designs.find(d => d.id === designId)?.isLiked ? 'Design unliked!' : 'Design liked!');
        break;
      case 'save':
        toast.success('Design saved!');
        break;
      case 'download':
        toast.success('Design downloaded!');
        break;
      case 'print':
        toast.success('Sent to printer!');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl mb-2">Explore Kolam Designs</h1>
          <p className="text-xl text-gray-600">Discover and be inspired by our creative community</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search designs, creators, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
              <SelectTrigger>
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGridType} onValueChange={setSelectedGridType}>
              <SelectTrigger>
                <SelectValue placeholder="Grid Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grids</SelectItem>
                <SelectItem value="Rectangular">Rectangular</SelectItem>
                <SelectItem value="Triangular">Triangular</SelectItem>
                <SelectItem value="Circular">Circular</SelectItem>
                <SelectItem value="Freehand">Freehand</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredDesigns.length} designs
            </p>
            <div className="flex gap-2">
              <Button
                variant={filterBy === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('all')}
              >
                All
              </Button>
              <Button
                variant={filterBy === 'complexity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('complexity')}
              >
                By Complexity
              </Button>
              <Button
                variant={filterBy === 'gridType' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('gridType')}
              >
                By Grid Type
              </Button>
            </div>
          </div>
        </div>

        {/* Design Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDesigns.map((design) => (
            <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Design Image */}
              <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-pink-100">
                <img 
                  src={design.imageUrl} 
                  alt={design.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleAction('download', design.id)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleAction('print', design.id)}
                      className="flex-1"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Complexity Badge */}
                <Badge 
                  className={`absolute top-2 right-2 ${
                    design.complexity === 'Beginner' ? 'bg-green-500' :
                    design.complexity === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                >
                  {design.complexity}
                </Badge>
              </div>

              <CardContent className="p-4">
                {/* Title and Creator */}
                <div className="mb-3">
                  <h3 className="text-lg mb-1 line-clamp-1">{design.title}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-3 h-3 mr-1" />
                    {design.creator}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {design.description}
                </p>

                {/* Tags */}
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

                {/* Grid Type and Date */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Grid3x3 className="w-3 h-3 mr-1" />
                    {design.gridType}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(design.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleAction('like', design.id)}
                      className={`flex items-center space-x-1 text-sm ${
                        design.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${design.isLiked ? 'fill-current' : ''}`} />
                      <span>{design.likes}</span>
                    </button>

                    <button
                      onClick={() => handleAction('comment', design.id)}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-orange-500"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{design.comments}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction('save', design.id)}
                      className={`${
                        design.isSaved ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${design.isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <Button size="sm" onClick={() => navigate('/canvas', { state: { imageUrl: design.imageUrl } })}>
                      <Feather className="w-4 h-4 mr-1" />
                      Practice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDesigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4"></div>
            <h3 className="text-xl mb-2">No designs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedComplexity('all');
              setSelectedGridType('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Comments Drawer */}
        <CommentsDrawer 
          postId={commentsForPost || ''} 
          currentUserId={user?.id} 
          open={Boolean(commentsForPost)} 
          onClose={() => setCommentsForPost(null)} 
        />

        {/* Load More */}
        {filteredDesigns.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Designs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
