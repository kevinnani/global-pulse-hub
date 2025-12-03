import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FirebaseAuthService, User } from '@/lib/firebase-auth';
import { FirebaseDataService, Post, ThemeSettings } from '@/lib/firebase-data';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, FileText, ToggleLeft, ToggleRight, Trash2, Plus, Palette, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeSettings>(FirebaseDataService.getTheme());

  useEffect(() => {
    // Check for guest user first
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      navigate('/feed');
      return;
    }

    // Check for Firebase user
    const unsubscribe = FirebaseAuthService.onAuthChange(async (user) => {
      if (user) {
        if (!user.isAdmin) {
          navigate('/feed');
          return;
        }
        setCurrentUser(user);
        await loadData();
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    const [usersData, postsData] = await Promise.all([
      FirebaseAuthService.getAllUsers(),
      FirebaseDataService.getAllPosts(),
    ]);
    setUsers(usersData);
    setPosts(postsData);
    setIsLoading(false);
  };

  const handleToggleUserStatus = async (userId: string) => {
    const { success, error } = await FirebaseAuthService.toggleUserStatus(userId);
    if (success) {
      await loadData();
      toast({
        title: 'User Status Updated',
        description: 'User account status has been changed',
      });
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const { success, error } = await FirebaseAuthService.deleteUser(userId);
    if (success) {
      await loadData();
      toast({
        title: 'User Deleted',
        description: 'User account has been permanently removed',
      });
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePostStatus = async (postId: string) => {
    const { success, error } = await FirebaseDataService.togglePostStatus(postId);
    if (success) {
      await loadData();
      toast({
        title: 'Post Status Updated',
        description: 'Post visibility has been changed',
      });
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to update post',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { success, error } = await FirebaseDataService.deletePost(postId);
    if (success) {
      await loadData();
      toast({
        title: 'Post Deleted',
        description: 'Post has been permanently removed',
      });
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const handleThemeChange = (key: keyof ThemeSettings, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    FirebaseDataService.updateTheme({ [key]: value });
    toast({
      title: 'Theme Updated',
      description: 'Design changes applied automatically',
    });
  };

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users, posts, and platform content</p>
              </div>
            </div>
            <Button onClick={loadData} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardHeader className="pb-3">
              <CardDescription>Total Posts</CardDescription>
              <CardTitle className="text-3xl">{posts.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardHeader className="pb-3">
              <CardDescription>Active Posts</CardDescription>
              <CardTitle className="text-3xl">{posts.filter(p => p.isActive).length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No users found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{user.avatar}</span>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{user.email}</TableCell>
                          <TableCell>{user.country}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge variant="default">Admin</Badge>
                            ) : (
                              <Badge variant="secondary">User</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleUserStatus(user.id)}
                                disabled={user.id === currentUser.id}
                              >
                                {user.isActive ? (
                                  <ToggleRight className="h-4 w-4" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" disabled={user.id === currentUser.id}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Post Management</CardTitle>
                  <CardDescription>View, manage, and create posts</CardDescription>
                </div>
                <Button onClick={() => navigate('/create-post')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No posts found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Post</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Likes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="max-w-xs">
                                <div className="font-medium line-clamp-1">{post.title}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {post.content}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{post.country}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{post.category}</Badge>
                          </TableCell>
                          <TableCell>{post.likes}</TableCell>
                          <TableCell>
                            {post.isActive ? (
                              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="destructive">Hidden</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTogglePostStatus(post.id)}
                              >
                                {post.isActive ? (
                                  <ToggleRight className="h-4 w-4" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this post? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle>Theme Customization</CardTitle>
                <CardDescription>Customize colors, fonts, and sizes across the entire application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Colors */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Colors
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Primary Color (HSL format)</Label>
                        <Input
                          value={theme.primaryColor}
                          onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                          placeholder="200 100% 50%"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: 200 100% 50% (cyan)
                        </p>
                      </div>
                      <div>
                        <Label>Accent Color (HSL format)</Label>
                        <Input
                          value={theme.accentColor}
                          onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                          placeholder="15 90% 60%"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: 15 90% 60% (coral)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Typography</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Font Size</Label>
                        <div className="flex gap-2 mt-2">
                          {(['small', 'medium', 'large'] as const).map((size) => (
                            <Badge
                              key={size}
                              variant={theme.fontSize === size ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleThemeChange('fontSize', size)}
                            >
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Font Family</Label>
                        <div className="flex gap-2 mt-2">
                          {(['inter', 'playfair', 'system'] as const).map((font) => (
                            <Badge
                              key={font}
                              variant={theme.fontFamily === font ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleThemeChange('fontFamily', font)}
                            >
                              {font.charAt(0).toUpperCase() + font.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Sizes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Post Images</h3>
                    <div>
                      <Label>Image Size</Label>
                      <div className="flex gap-2 mt-2">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <Badge
                            key={size}
                            variant={theme.imageSize === size ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleThemeChange('imageSize', size)}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;