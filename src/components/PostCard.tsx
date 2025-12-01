import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Post, FirebaseDataService, categories } from '@/lib/firebase-data';
import { User, FirebaseAuthService } from '@/lib/firebase-auth';
import { Heart, MapPin, Pencil, Trash2, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
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

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const { toast } = useToast();
  const [imageHeight, setImageHeight] = useState('300px');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const category = categories.find(c => c.id === post.category);

  useEffect(() => {
    // Get theme settings
    const theme = FirebaseDataService.getTheme();
    const sizes = {
      small: '200px',
      medium: '300px',
      large: '400px',
    };
    setImageHeight(sizes[theme.imageSize]);
    
    const handleStorageChange = () => {
      const updatedTheme = FirebaseDataService.getTheme();
      setImageHeight(sizes[updatedTheme.imageSize]);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Get current user
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      setCurrentUser(JSON.parse(guestUser));
    } else {
      FirebaseAuthService.getCurrentUser().then(setCurrentUser);
    }

    // Get post author - for now we'll just use the userId
    // In a real implementation, you'd fetch from Firestore users collection
    setAuthor({
      id: post.userId,
      email: '',
      name: 'User',
      username: 'user',
      country: post.country,
      avatar: '👤',
      bio: '',
      isAdmin: false,
    });
  }, [post.userId]);

  const isOwner = currentUser && !currentUser.isGuest && currentUser.id === post.userId;

  const handleDelete = async () => {
    const { success, error } = await FirebaseDataService.deletePost(post.id);
    if (success) {
      toast({
        title: 'Post Deleted',
        description: 'Your post has been removed',
      });
      onUpdate?.();
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    FirebaseDataService.sharePost(post);
    toast({
      title: 'Link Copied!',
      description: 'Post link has been copied to clipboard',
    });
  };

  return (
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

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">{post.likes}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            {isOwner && (
              <>
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
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
