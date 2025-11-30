// Static data store for the application

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  username: string;
  country: string;
  avatar: string;
  bio: string;
  isActive: boolean;
  isAdmin: boolean;
}

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  imageSize: 'small' | 'medium' | 'large';
  fontFamily: 'inter' | 'playfair' | 'system';
}

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

// Theme settings
let themeSettings: ThemeSettings = {
  primaryColor: '200 100% 50%',
  accentColor: '15 90% 60%',
  fontSize: 'medium',
  imageSize: 'medium',
  fontFamily: 'inter',
};

// Demo users
export const users: User[] = [
  {
    id: '1',
    email: 'kevin@gmail.com',
    password: 'kevin123',
    name: 'Kevin Anderson',
    username: 'kevin_admin',
    country: 'US',
    avatar: '👨‍💼',
    bio: 'Super Admin - News curator and platform manager',
    isActive: true,
    isAdmin: true,
  },
  {
    id: '2',
    email: 'sarah@gmail.com',
    password: 'sarah123',
    name: 'Sarah Johnson',
    username: 'sarah_explorer',
    country: 'UK',
    avatar: '👩‍🎨',
    bio: 'Culture enthusiast sharing stories from around the world',
    isActive: true,
    isAdmin: false,
  },
];

// Demo posts
export const posts: Post[] = [
  {
    id: '1',
    userId: '1',
    country: 'US',
    category: 'culture',
    title: 'Renaissance Art Exhibition Opens in New York',
    content: 'The Metropolitan Museum unveils a stunning collection of Renaissance masterpieces featuring works from Da Vinci and Michelangelo.',
    image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800',
    createdAt: '2024-01-15T10:00:00Z',
    likes: 234,
    isActive: true,
  },
  {
    id: '2',
    userId: '2',
    country: 'UK',
    category: 'culture',
    title: 'London Theatre District Celebrates 50 Years',
    content: 'West End theatres mark a golden anniversary with special performances and retrospective exhibitions.',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    createdAt: '2024-01-15T11:00:00Z',
    likes: 189,
    isActive: true,
  },
  {
    id: '3',
    userId: '1',
    country: 'US',
    category: 'sports',
    title: 'NBA Finals Draw Record Viewership',
    content: 'Historic championship game attracts millions of viewers worldwide as underdogs claim victory.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    createdAt: '2024-01-14T15:00:00Z',
    likes: 567,
    isActive: true,
  },
  {
    id: '4',
    userId: '2',
    country: 'UK',
    category: 'sports',
    title: 'Premier League Implements New Sustainability Rules',
    content: 'English football takes bold steps toward carbon neutrality with innovative stadium policies.',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
    createdAt: '2024-01-14T16:00:00Z',
    likes: 345,
    isActive: true,
  },
  {
    id: '5',
    userId: '1',
    country: 'US',
    category: 'education',
    title: 'Universities Launch Free Coding Bootcamps',
    content: 'Major tech companies partner with educational institutions to offer accessible programming courses.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    createdAt: '2024-01-13T09:00:00Z',
    likes: 412,
    isActive: true,
  },
  {
    id: '6',
    userId: '2',
    country: 'UK',
    category: 'education',
    title: 'Oxford Announces Scholarships for Global Students',
    content: 'Prestigious university expands accessibility with new funding programs for international learners.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    createdAt: '2024-01-13T10:00:00Z',
    likes: 298,
    isActive: true,
  },
  {
    id: '7',
    userId: '1',
    country: 'US',
    category: 'lifestyle',
    title: 'Minimalist Living Trend Gains Momentum',
    content: 'Americans embrace decluttering and intentional consumption for improved wellbeing.',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    createdAt: '2024-01-12T14:00:00Z',
    likes: 523,
    isActive: true,
  },
  {
    id: '8',
    userId: '2',
    country: 'UK',
    category: 'lifestyle',
    title: 'London Coffee Culture Evolves with Sustainability Focus',
    content: 'Independent cafes lead the way in zero-waste initiatives and ethical sourcing.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    createdAt: '2024-01-12T15:00:00Z',
    likes: 276,
    isActive: true,
  },
  {
    id: '9',
    userId: '1',
    country: 'US',
    category: 'environment',
    title: 'National Parks Expand Conservation Programs',
    content: 'New initiatives protect endangered species and restore native ecosystems across America.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    createdAt: '2024-01-11T08:00:00Z',
    likes: 678,
    isActive: true,
  },
  {
    id: '10',
    userId: '2',
    country: 'UK',
    category: 'environment',
    title: 'UK Cities Achieve Record Reduction in Air Pollution',
    content: 'Clean air zones and green transport initiatives show measurable environmental impact.',
    image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800',
    createdAt: '2024-01-11T09:00:00Z',
    likes: 445,
    isActive: true,
  },
  {
    id: '11',
    userId: '1',
    country: 'US',
    category: 'politics',
    title: 'Congress Passes Bipartisan Infrastructure Bill',
    content: 'Historic legislation promises improvements to transportation and digital connectivity nationwide.',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
    createdAt: '2024-01-10T12:00:00Z',
    likes: 892,
    isActive: true,
  },
  {
    id: '12',
    userId: '2',
    country: 'UK',
    category: 'politics',
    title: 'Parliament Debates Digital Privacy Legislation',
    content: 'New proposals aim to strengthen consumer data protection in the digital age.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    createdAt: '2024-01-10T13:00:00Z',
    likes: 534,
    isActive: true,
  },
];

// Auth state management
export class AuthService {
  private static currentUser: User | null = null;

  static login(email: string, password: string): User | null {
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  }

  static loginAsGuest(): User {
    const guestUser: User = {
      id: 'guest',
      email: 'guest@demo.com',
      password: '',
      name: 'Guest User',
      username: 'guest_explorer',
      country: 'US',
      avatar: '👤',
      bio: 'Exploring the platform',
      isActive: true,
      isAdmin: false,
    };
    this.currentUser = guestUser;
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
    return guestUser;
  }

  static register(userData: Omit<User, 'id' | 'isActive' | 'isAdmin'>): User {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      isActive: true,
      isAdmin: false,
    };
    users.push(newUser);
    this.currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
  }

  static logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    return null;
  }

  static isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }
}

// Data management functions
export class DataService {
  static getPosts(country?: string, category?: string): Post[] {
    let filtered = posts.filter(p => p.isActive);
    
    if (country) {
      filtered = filtered.filter(p => p.country === country);
    }
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static createPost(postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'isActive'>): Post {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isActive: true,
    };
    posts.push(newPost);
    return newPost;
  }

  static updatePost(id: string, updates: Partial<Post>): boolean {
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      return true;
    }
    return false;
  }

  static deletePost(id: string): boolean {
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts.splice(index, 1);
      return true;
    }
    return false;
  }

  static togglePostStatus(id: string): boolean {
    const post = posts.find(p => p.id === id);
    if (post) {
      post.isActive = !post.isActive;
      return true;
    }
    return false;
  }

  static getUsers(): User[] {
    return users;
  }

  static updateUser(id: string, updates: Partial<User>): boolean {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      return true;
    }
    return false;
  }

  static toggleUserStatus(id: string): boolean {
    const user = users.find(u => u.id === id);
    if (user) {
      user.isActive = !user.isActive;
      return true;
    }
    return false;
  }

  static deleteUser(id: string): boolean {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users.splice(index, 1);
      return true;
    }
    return false;
  }

  static getUserById(id: string): User | undefined {
    return users.find(u => u.id === id);
  }

  static getTheme(): ThemeSettings {
    const stored = localStorage.getItem('themeSettings');
    if (stored) {
      themeSettings = JSON.parse(stored);
    }
    return themeSettings;
  }

  static updateTheme(settings: Partial<ThemeSettings>): void {
    themeSettings = { ...themeSettings, ...settings };
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
    this.applyTheme();
  }

  static applyTheme(): void {
    const root = document.documentElement;
    const theme = this.getTheme();
    
    // Apply colors
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--accent', theme.accentColor);
    
    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('font-size', fontSizes[theme.fontSize]);
    
    // Apply font family
    const fontFamilies = {
      inter: 'Inter, system-ui, -apple-system, sans-serif',
      playfair: 'Playfair Display, serif',
      system: 'system-ui, -apple-system, sans-serif',
    };
    root.style.setProperty('--font-sans', fontFamilies[theme.fontFamily]);
    
    // Apply image size class
    root.setAttribute('data-image-size', theme.imageSize);
  }
}
