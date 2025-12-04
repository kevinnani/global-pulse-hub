import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Post, FirebaseDataService, categories } from '@/lib/firebase-data';
import { User, FirebaseAuthService } from '@/lib/firebase-auth';
import { Heart, MapPin, Trash2, Share2, Copy, Check, Edit2, Save, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageHeight, setImageHeight] = useState('300px');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    category: post.category,
    image: post.image,
  });
  const [saving, setSaving] = useState(false);
  const category = categories.find(c => c.id === post.category);

  useEffect(() => {
    const theme = FirebaseDataService.getTheme();
    const sizes = { small: '200px', medium: '300px', large: '400px' };
    setImageHeight(sizes[theme.imageSize]);
    
    const handleStorageChange = () => {
      const updatedTheme = FirebaseDataService.getTheme();
      setImageHeight(sizes[updatedTheme.imageSize]);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      const guest = JSON.parse(guestUser);
      setCurrentUser(guest);
      setIsLiked(false);
    } else {
      FirebaseAuthService.getCurrentUser().then((user) => {
        setCurrentUser(user);
        if (user) {
          setIsLiked(post.likedBy?.includes(user.id) || false);
        }
      });
    }

    FirebaseAuthService.getUserById(post.userId).then((user) => {
      if (user) {
        setAuthor(user);
      } else {
        setAuthor({
          id: post.userId,
          email: '',
          name: 'User',
          username: 'user',
          country: post.country,
          avatar: '👤',
          bio: '',
          isAdmin: false,
          isActive: true,
        });
      }
    });
  }, [post.userId, post.likedBy]);

  const isOwner = currentUser && !currentUser.isGuest && currentUser.id === post.userId;

  const handleDelete = async () => {
    const { success, error } = await FirebaseDataService.deletePost(post.id);
    if (success) {
      toast({ title: 'Post Deleted', description: 'Your post has been removed' });
      onUpdate?.();
    } else {
      toast({ title: 'Error', description: error || 'Failed to delete post', variant: 'destructive' });
    }
  };

  const handleLike = async () => {
    if (!currentUser || currentUser.isGuest) {
      toast({ title: 'Login Required', description: 'Please login to like posts', variant: 'destructive' });
      return;
    }
    const { success, liked } = await FirebaseDataService.toggleLike(post.id, currentUser.id);
    if (success) {
      setIsLiked(liked);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = (platform?: 'whatsapp' | 'twitter' | 'facebook' | 'copy') => {
    FirebaseDataService.sharePost(post, platform);
    if (platform === 'copy') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Link Copied!', description: 'Post link copied to clipboard' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Please select an image under 5MB', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const { success, error } = await FirebaseDataService.updatePost(post.id, {
      title: editData.title,
      content: editData.content,
      category: editData.category as Post['category'],
      image: editData.image,
    });
    setSaving(false);

    if (success) {
      setIsEditing(false);
      toast({ title: 'Post Updated', description: 'Your changes have been saved' });
      onUpdate?.();
    } else {
      toast({ title: 'Error', description: error || 'Failed to update post', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-card transition-shadow group">
        <div className="overflow-hidden bg-muted" style={{ height: imageHeight }}>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm bg-primary/10">
                {author?.avatar || '👤'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{author?.name || 'Unknown'}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{post.country}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {category?.icon} {category?.name}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1 line-clamp-2">{post.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <Button variant="ghost" size="sm" onClick={handleLike} className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}>
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')}>💬 WhatsApp</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>🐦 Twitter</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('facebook')}>📘 Facebook</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}>{copied ? <><Check className="h-4 w-4 mr-2"/> Copied!</> : <><Copy className="h-4 w-4 mr-2"/> Copy Link</>}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isOwner && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 text-primary" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editData.category} onValueChange={(value) => setEditData({ ...editData, category: value as Post['category'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50"
              >
                <img src={editData.image} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                <p className="text-xs text-muted-foreground mt-2">Click to change image</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
