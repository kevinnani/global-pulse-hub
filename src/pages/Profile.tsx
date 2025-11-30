import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AuthService, DataService } from '@/lib/data';
import { MapPin, Mail, User, Plus } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const userPosts = DataService.getPosts().filter(post => post.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-4xl bg-primary/10">
                    {currentUser.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="text-3xl font-serif font-bold">{currentUser.name}</h1>
                    <p className="text-muted-foreground">@{currentUser.username}</p>
                  </div>
                  
                  <p className="text-foreground">{currentUser.bio}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {currentUser.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {currentUser.country}
                    </div>
                    {currentUser.isAdmin && (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <User className="h-4 w-4" />
                        Admin
                      </div>
                    )}
                  </div>

                  <Button onClick={() => navigate('/create-post')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Post
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* User Posts */}
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold">Your Posts ({userPosts.length})</h2>
            
            {userPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">You haven't created any posts yet</p>
                  <Button onClick={() => navigate('/create-post')}>
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
