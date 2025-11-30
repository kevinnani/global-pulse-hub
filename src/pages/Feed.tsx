import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthService, DataService, countries, categories } from '@/lib/data';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Feed = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  
  const [country1, setCountry1] = useState('US');
  const [country2, setCountry2] = useState('UK');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const posts1 = DataService.getPosts(country1, selectedCategory);
  const posts2 = DataService.getPosts(country2, selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">Global News Feed</h1>
              <p className="text-muted-foreground">Compare perspectives from around the world</p>
            </div>
            <Button onClick={() => navigate('/create-post')} className="gradient-primary gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === '' ? 'default' : 'outline'}
              className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setSelectedCategory('')}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon} {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Country Selectors */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Country 1</label>
            <Select value={country1} onValueChange={setCountry1}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Country 2</label>
            <Select value={country2} onValueChange={setCountry2}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Side-by-Side Posts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Country 1 Posts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {countries.find(c => c.code === country1)?.flag}
              {countries.find(c => c.code === country1)?.name}
            </h2>
            <div className="space-y-4">
              {posts1.length > 0 ? (
                posts1.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No posts found for this selection
                </div>
              )}
            </div>
          </div>

          {/* Country 2 Posts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {countries.find(c => c.code === country2)?.flag}
              {countries.find(c => c.code === country2)?.name}
            </h2>
            <div className="space-y-4">
              {posts2.length > 0 ? (
                posts2.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No posts found for this selection
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feed;
