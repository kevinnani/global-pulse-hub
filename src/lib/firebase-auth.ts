// Firebase Authentication Service
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
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
  isActive: boolean;
  isGuest?: boolean;
  phone?: string;
  createdAt?: string;
}

export class FirebaseAuthService {
  // Register new user
  static async register(
    email: string, 
    password: string, 
    userData: { name: string; username: string; country: string; avatar: string; bio: string; phone?: string }
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
        isAdmin: false,
        isActive: true,
        phone: userData.phone,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), user);

      return { user, error: null };
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email/phone is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      return { user: null, error: errorMessage };
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
        if (!user.isActive) {
          await signOut(auth);
          return { user: null, error: 'Your account has been deactivated' };
        }
        return { user, error: null };
      } else {
        return { user: null, error: 'User data not found' };
      }
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email/phone or password';
      }
      return { user: null, error: errorMessage };
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
      isActive: true,
      isGuest: true,
    };
    return guestUser;
  }

  // Logout
  static async logout(): Promise<void> {
    localStorage.removeItem('guestUser');
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

  // Get all users (for admin)
  static async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
      });
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Toggle user active status (for admin)
  static async toggleUserStatus(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const currentStatus = userDoc.data().isActive;
        await updateDoc(doc(db, 'users', userId), { isActive: !currentStatus });
        return { success: true, error: null };
      }
      return { success: false, error: 'User not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete user (for admin)
  static async deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}