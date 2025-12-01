// Firebase Authentication Service
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  country: string;
  avatar: string;
  bio: string;
  isAdmin: boolean;
  isGuest?: boolean;
}

export class FirebaseAuthService {
  // Register new user
  static async register(
    email: string, 
    password: string, 
    userData: { name: string; username: string; country: string; avatar: string; bio: string }
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });

      // Create user document in Firestore
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name,
        username: userData.username,
        country: userData.country,
        avatar: userData.avatar,
        bio: userData.bio,
        isAdmin: false
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), user);

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const user = userDoc.data() as User;
        return { user, error: null };
      } else {
        return { user: null, error: 'User data not found' };
      }
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Guest login (in-memory only, no Firebase)
  static loginAsGuest(): User {
    const guestUser: User = {
      id: 'guest',
      email: 'guest@demo.com',
      name: 'Guest User',
      username: 'guest_explorer',
      country: 'US',
      avatar: '👤',
      bio: 'Exploring the platform',
      isAdmin: false,
      isGuest: true
    };
    return guestUser;
  }

  // Logout
  static async logout(): Promise<void> {
    await signOut(auth);
  }

  // Get current user data
  static async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  }

  // Auth state observer
  static onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}
