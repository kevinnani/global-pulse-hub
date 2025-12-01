import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { Badge } from '@/components/ui/badge';
import { Post, FirebaseDataService, countries, categories } from '@/lib/firebase-data';
import { User, FirebaseAuthService } from '@/lib/firebase-auth';

const Feed = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts1, setPosts1] = useState<Post[]>([]);
  const [posts2, setPosts2] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [country1, setCountry1] = useState('US');
  const [country2, setCountry2] = useState('UK');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  useEffect(() => {
    // Check for guest user
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      setCurrentUser(JSON.parse(guestUser));
    } else {
      // Check Firebase auth
      const unsubscribe = FirebaseAuthService.onAuthChange((user) => {
        setCurrentUser(user);
        if (!user) {
          navigate('/');
        }
      });
      return () => unsubscribe();
    }
  }, [navigate]);

  useEffect(() => {
    loadPosts();
  }, [country1, country2, selectedCategory]);

  const loadPosts = async () => {
    setLoading(true);
    const [p1, p2] = await Promise.all([
      FirebaseDataService.getPosts(country1, selectedCategory),
      FirebaseDataService.getPosts(country2, selectedCategory),
    ]);
    setPosts1(p1);
    setPosts2(p2);
    setLoading(false);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Global News Feed</h1>
            <p className="text-muted-foreground">Compare perspectives from around the world</p>
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
        <div className="mb-6 space-y-3">
          <label className="text-sm font-medium">Select Countries to Compare</label>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <Badge
                key={country.code}
                variant={country1 === country.code || country2 === country.code ? 'default' : 'outline'}
                className="cursor-pointer hover:shadow-sm transition-shadow text-base py-2 px-4"
                onClick={() => {
                  if (country1 === country.code || country2 === country.code) {
                    return;
                  }
                  if (country1 === 'US' && country2 === 'UK') {
                    setCountry1(country.code);
                  } else if (country1 !== 'US' && country1 !== 'UK') {
                    setCountry2(country.code);
                  } else {
                    setCountry1(country.code);
                  }
                }}
              >
                {country.flag} {country.name}
              </Badge>
            ))}
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
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : posts1.length > 0 ? (
                posts1.map((post) => <PostCard key={post.id} post={post} onUpdate={loadPosts} />)
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
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : posts2.length > 0 ? (
                posts2.map((post) => <PostCard key={post.id} post={post} onUpdate={loadPosts} />)
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
