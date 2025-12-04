import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FirebaseAuthService, User } from '@/lib/firebase-auth';
import { FirebaseDataService, countries, categories } from '@/lib/firebase-data';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Image as ImageIcon, MapPin } from 'lucide-react';

const CreatePost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
  });

  useEffect(() => {
    // Check for guest user
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      // Guest users can't create posts - redirect
      navigate('/feed');
      return;
    }

    // Check for Firebase user
    const unsubscribe = FirebaseAuthService.onAuthChange((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        title: 'Not logged in',
        description: 'Please login to create a post',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    if (!formData.category || !formData.title || !formData.content || !imagePreview) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields and select an image',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // User can only post in their registered country
    const { post, error } = await FirebaseDataService.createPost({
      userId: currentUser.id,
      country: currentUser.country, // Automatically use user's country
      category: formData.category as any,
      title: formData.title,
      content: formData.content,
      image: imagePreview,
    });

    setIsLoading(false);

    if (post) {
      toast({
        title: 'Post Created!',
        description: 'Your post has been published successfully',
      });
      navigate('/feed');
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to create post',
        variant: 'destructive',
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const userCountry = countries.find(c => c.code === currentUser.country);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/feed')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
            <CardTitle className="text-2xl font-serif">Create New Post</CardTitle>
            <CardDescription>Share news and knowledge with the global community</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Country is fixed to user's country */}
                <div className="space-y-2">
                  <Label>Your Country</Label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {userCountry?.flag} {userCountry?.name || currentUser.country}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Posts are created for your registered country
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Share your news or insights..."
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Post Image</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-muted-foreground">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Post'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/feed')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;