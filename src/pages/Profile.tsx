import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FirebaseAuthService, User } from '@/lib/firebase-auth';
import { FirebaseDataService, Post } from '@/lib/firebase-data';
import { MapPin, Phone, User as UserIcon, Plus, Edit2, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', username: '', bio: '' });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

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
          setEditData({ name: user.name, username: user.username, bio: user.bio });
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

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    const { success, error } = await FirebaseAuthService.updateUserProfile(currentUser.id, {
      name: editData.name,
      username: editData.username,
      bio: editData.bio,
    });
    setSaving(false);

    if (success) {
      setCurrentUser({ ...currentUser, ...editData });
      setIsEditing(false);
      toast({ title: 'Profile Updated', description: 'Your profile has been saved' });
    } else {
      toast({ title: 'Error', description: error || 'Failed to update profile', variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwordData.new.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { success, error } = await FirebaseAuthService.changePassword(passwordData.current, passwordData.new);
    setSaving(false);

    if (success) {
      setPasswordDialog(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      toast({ title: 'Password Changed', description: 'Your password has been updated' });
    } else {
      toast({ title: 'Error', description: error || 'Failed to change password', variant: 'destructive' });
    }
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
                
                <div className="flex-1 space-y-3 w-full">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Username</Label>
                          <Input
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} disabled={saving} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-3xl font-serif font-bold">{currentUser.name}</h1>
                          <p className="text-muted-foreground">@{currentUser.username}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                      
                      <p className="text-foreground">{currentUser.bio}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {currentUser.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {currentUser.phone}
                          </div>
                        )}
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

                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => navigate('/create-post')} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create New Post
                        </Button>
                        
                        <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <Lock className="h-4 w-4" />
                              Change Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change Password</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Current Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                  >
                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>New Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                  >
                                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                  >
                                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                              <Button onClick={handleChangePassword} disabled={saving} className="w-full">
                                {saving ? 'Changing...' : 'Change Password'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </>
                  )}
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
