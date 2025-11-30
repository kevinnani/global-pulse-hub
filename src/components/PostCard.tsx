import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Post, DataService, categories } from '@/lib/data';
import { Heart, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const author = DataService.getUserById(post.userId);
  const category = categories.find(c => c.id === post.category);
  const [imageHeight, setImageHeight] = useState('300px');

  useEffect(() => {
    const theme = DataService.getTheme();
    const sizes = {
      small: '200px',
      medium: '300px',
      large: '400px',
    };
    setImageHeight(sizes[theme.imageSize]);
    
    const handleStorageChange = () => {
      const updatedTheme = DataService.getTheme();
      setImageHeight(sizes[updatedTheme.imageSize]);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

        <div className="flex items-center gap-1 text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span className="text-sm font-medium">{post.likes}</span>
        </div>
      </div>
    </Card>
  );
};
