import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FirebaseAuthService, User } from '@/lib/firebase-auth';
import { FirebaseDataService, Post } from '@/lib/firebase-data';
import { MapPin, Mail, User as UserIcon, Plus } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      const guest = JSON.parse(guestUser);
      if (guest.isGuest) {
        navigate('/feed');
        return;
      }
      setCurrentUser(guest);
      loadPosts(guest.id);
    } else {
      FirebaseAuthService.getCurrentUser().then((user) => {
        if (!user) {
          navigate('/');
        } else {
          setCurrentUser(user);
          loadPosts(user.id);
        }
      });
    }
  }, [navigate]);

  const loadPosts = async (userId: string) => {
    setLoading(true);
    const posts = await FirebaseDataService.getPostsByUser(userId);
    setUserPosts(posts);
    setLoading(false);
  };

  if (!currentUser) return null;

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
                        <UserIcon className="h-4 w-4" />
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
            
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : userPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {userPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onUpdate={() => loadPosts(currentUser.id)} 
                  />
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
