// Firebase Data Service
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';

export interface Post {
  id: string;
  userId: string;
  country: string;
  category: 'culture' | 'sports' | 'education' | 'lifestyle' | 'environment' | 'politics';
  title: string;
  content: string;
  image: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  isActive: boolean;
}

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  imageSize: 'small' | 'medium' | 'large';
  fontFamily: 'inter' | 'playfair' | 'system';
}

export class FirebaseDataService {
  // Create post
  static async createPost(
    postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'isActive'>
  ): Promise<{ post: Post | null; error: string | null }> {
    try {
      const newPost = {
        ...postData,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);
      const post = { ...newPost, id: docRef.id } as Post;

      return { post, error: null };
    } catch (error: any) {
      return { post: null, error: error.message };
    }
  }

  // Get all posts with optional filters
  static async getPosts(country?: string, category?: string): Promise<Post[]> {
    try {
      let q = query(
        collection(db, 'posts'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      if (country) {
        q = query(
          collection(db, 'posts'),
          where('isActive', '==', true),
          where('country', '==', country),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      let posts: Post[] = [];
      
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
      });

      // Client-side category filter if needed
      if (category) {
        posts = posts.filter(p => p.category === category);
      }

      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  // Get all posts for admin (including inactive)
  static async getAllPosts(): Promise<Post[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];
      
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
      });

      return posts;
    } catch (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
  }

  // Get posts by user
  static async getPostsByUser(userId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];
      
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post);
      });

      return posts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  // Update post
  static async updatePost(
    postId: string, 
    updates: Partial<Post>
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      await updateDoc(doc(db, 'posts', postId), updates);
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete post
  static async deletePost(postId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Toggle post active status
  static async togglePostStatus(postId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        const currentStatus = postDoc.data().isActive;
        await updateDoc(doc(db, 'posts', postId), { isActive: !currentStatus });
        return { success: true, error: null };
      }
      return { success: false, error: 'Post not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Like/Unlike post
  static async toggleLike(postId: string, userId: string): Promise<{ success: boolean; liked: boolean; error: string | null }> {
    try {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const likedBy = postData.likedBy || [];
        const isLiked = likedBy.includes(userId);

        if (isLiked) {
          await updateDoc(doc(db, 'posts', postId), { 
            likes: increment(-1),
            likedBy: arrayRemove(userId)
          });
          return { success: true, liked: false, error: null };
        } else {
          await updateDoc(doc(db, 'posts', postId), { 
            likes: increment(1),
            likedBy: arrayUnion(userId)
          });
          return { success: true, liked: true, error: null };
        }
      }
      return { success: false, liked: false, error: 'Post not found' };
    } catch (error: any) {
      return { success: false, liked: false, error: error.message };
    }
  }

  // Theme management (stored in localStorage)
  static getTheme(): ThemeSettings {
    const stored = localStorage.getItem('themeSettings');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      primaryColor: '200 100% 50%',
      accentColor: '15 90% 60%',
      fontSize: 'medium',
      imageSize: 'medium',
      fontFamily: 'inter',
    };
  }

  static updateTheme(settings: Partial<ThemeSettings>): void {
    const current = this.getTheme();
    const updated = { ...current, ...settings };
    localStorage.setItem('themeSettings', JSON.stringify(updated));
    this.applyTheme();
  }

  static applyTheme(): void {
    const root = document.documentElement;
    const theme = this.getTheme();
    
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--accent', theme.accentColor);
    
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('font-size', fontSizes[theme.fontSize]);
    
    const fontFamilies = {
      inter: 'Inter, system-ui, -apple-system, sans-serif',
      playfair: 'Playfair Display, serif',
      system: 'system-ui, -apple-system, sans-serif',
    };
    root.style.setProperty('--font-sans', fontFamilies[theme.fontFamily]);
    
    root.setAttribute('data-image-size', theme.imageSize);
  }

  // Share post with platform options
  static sharePost(post: Post, platform?: 'whatsapp' | 'twitter' | 'facebook' | 'copy'): void {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = `Check out this news: ${post.title}`;
    const fullText = `${shareText}\n\n${post.content.substring(0, 100)}...\n\n${shareUrl}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: post.title,
            text: shareText,
            url: shareUrl,
          }).catch(() => {
            navigator.clipboard.writeText(shareUrl);
          });
        } else {
          navigator.clipboard.writeText(shareUrl);
        }
    }
  }
}

// Static reference data
export const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
];

export const categories = [
  { id: 'culture', name: 'Culture', icon: '🎭' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
  { id: 'environment', name: 'Environment', icon: '🌍' },
  { id: 'politics', name: 'Politics', icon: '🏛️' },
];
