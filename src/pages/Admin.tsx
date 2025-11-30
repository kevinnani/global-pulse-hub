import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthService, DataService, users, posts } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, FileText, ToggleLeft, ToggleRight, Trash2, Plus } from 'lucide-react';
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
  const currentUser = AuthService.getCurrentUser();
  const isAdmin = AuthService.isAdmin();

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/feed');
    }
  }, [currentUser, isAdmin, navigate]);

  if (!currentUser || !isAdmin) return null;

  const handleToggleUserStatus = (userId: string) => {
    DataService.toggleUserStatus(userId);
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'User Status Updated',
      description: 'User account status has been changed',
    });
  };

  const handleDeleteUser = (userId: string) => {
    DataService.deleteUser(userId);
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'User Deleted',
      description: 'User account has been permanently removed',
    });
  };

  const handleTogglePostStatus = (postId: string) => {
    DataService.togglePostStatus(postId);
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'Post Status Updated',
      description: 'Post visibility has been changed',
    });
  };

  const handleDeletePost = (postId: string) => {
    DataService.deletePost(postId);
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'Post Deleted',
      description: 'Post has been permanently removed',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, posts, and platform content</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Posts</CardDescription>
              <CardTitle className="text-3xl">{posts.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
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
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all user accounts</CardDescription>
              </CardHeader>
              <CardContent>
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
                        <TableCell>{user.email}</TableCell>
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
                            <Badge variant="default" className="bg-green-500">Active</Badge>
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
                            >
                              {user.isActive ? (
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => {
                      const author = DataService.getUserById(post.userId);
                      return (
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
                          <TableCell>{author?.name || 'Unknown'}</TableCell>
                          <TableCell>{post.country}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{post.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {post.isActive ? (
                              <Badge variant="default" className="bg-green-500">Active</Badge>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
