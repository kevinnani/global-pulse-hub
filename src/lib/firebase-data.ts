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
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

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
  // Upload image to Firebase Storage
  static async uploadImage(file: File, userId: string): Promise<string> {
    const timestamp = Date.now();
    const fileName = `posts/${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  }

  // Create post
  static async createPost(
    postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'isActive'>,
    imageFile?: File
  ): Promise<{ post: Post | null; error: string | null }> {
    try {
      let imageUrl = postData.image;
      
      if (imageFile) {
        imageUrl = await this.uploadImage(imageFile, postData.userId);
      }

      const newPost = {
        ...postData,
        image: imageUrl,
        createdAt: new Date().toISOString(),
        likes: 0,
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
    updates: Partial<Post>,
    imageFile?: File,
    userId?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      if (imageFile && userId) {
        const imageUrl = await this.uploadImage(imageFile, userId);
        updates.image = imageUrl;
      }

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

  // Share post (generates shareable link)
  static sharePost(post: Post): void {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = `Check out this post: ${post.title}`;

    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: shareText,
        url: shareUrl,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
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
];

export const categories = [
  { id: 'culture', name: 'Culture', icon: '🎭' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
  { id: 'environment', name: 'Environment', icon: '🌍' },
  { id: 'politics', name: 'Politics', icon: '🏛️' },
];
