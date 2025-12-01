# Firebase Setup Guide

## 🔥 Complete Firebase Integration

Your app is now fully integrated with Firebase! Just add your Firebase configuration keys and it will work instantly.

## Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "worldnews-app")
4. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Click "Save"

### 3. Create Firestore Database

1. Go to **Build** > **Firestore Database**
2. Click "Create database"
3. Select **Production mode**
4. Choose a Cloud Firestore location
5. Click "Enable"

#### Set Firestore Security Rules:

Click on the "Rules" tab and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read users
      allow read: if request.auth != null;
      // Users can only update their own profile
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts collection
    match /posts/{postId} {
      // Anyone authenticated can read posts
      allow read: if request.auth != null;
      // Authenticated users can create posts
      allow create: if request.auth != null;
      // Users can only update/delete their own posts
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

Click **Publish**

### 4. Enable Firebase Storage

1. Go to **Build** > **Storage**
2. Click "Get started"
3. Select **Production mode**
4. Click "Next" and "Done"

#### Set Storage Security Rules:

Click on the "Rules" tab and paste this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Posts images
    match /posts/{userId}/{fileName} {
      // Anyone can read images
      allow read: if true;
      // Only the user can upload their own images
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish**

### 5. Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon (`</>`) to add a web app
5. Register app with a nickname (e.g., "WorldNews Web")
6. Copy the `firebaseConfig` object

### 6. Add Configuration to Your App

Open `src/lib/firebase.ts` and replace these values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← Paste from Firebase Console
  authDomain: "YOUR_AUTH_DOMAIN",       // ← Paste from Firebase Console
  projectId: "YOUR_PROJECT_ID",         // ← Paste from Firebase Console
  storageBucket: "YOUR_STORAGE_BUCKET", // ← Paste from Firebase Console
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Paste from Firebase Console
  appId: "YOUR_APP_ID"                  // ← Paste from Firebase Console
};
```

### 7. Test Your Setup

1. Run the app: `npm run dev`
2. Register a new account
3. Create a post with an image
4. Check Firebase Console:
   - Authentication > Users (you should see your user)
   - Firestore Database > posts (you should see your post)
   - Storage > posts (you should see your image)

## 🎯 Features Implemented

### ✅ Authentication
- Email/password registration
- Secure login with Firebase Auth
- Guest mode (view-only, no database)
- Auto session management

### ✅ Database (Firestore)
- Users collection with profile data
- Posts collection with metadata
- Real-time data sync
- Filtered queries by country/category

### ✅ Storage
- Image uploads to Firebase Storage
- Automatic file organization by user
- Download URL generation
- Secure access rules

### ✅ User Roles
- **Guest**: View-only, no create button shown
- **Regular User**: Create, delete own posts, share
- **Admin**: Manage all users/posts, customize theme

### ✅ Post Features
- Create with image upload from device
- Delete own posts (with confirmation)
- Share posts (native share API or clipboard)
- Filter by country and category

### ✅ Admin Dashboard
- User management (view, disable, delete)
- Post management (view, hide, delete)
- Theme customization (colors, fonts, sizes)

## 📁 File Structure

```
src/
├── lib/
│   ├── firebase.ts          ← ADD YOUR CONFIG HERE
│   ├── firebase-auth.ts     ← Authentication service
│   └── firebase-data.ts     ← Database & Storage service
├── components/
│   ├── Navbar.tsx           ← Hides Create Post for guests
│   └── PostCard.tsx         ← Shows edit/delete for owners
├── pages/
│   ├── Login.tsx            ← Firebase Auth
│   ├── Feed.tsx             ← Load from Firestore
│   ├── CreatePost.tsx       ← Upload to Firebase Storage
│   ├── Profile.tsx          ← User's posts from Firestore
│   └── Admin.tsx            ← Manage users/posts/theme
```

## 🚀 Deploy to Firebase Hosting (Optional)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build your app
npm run build

# Deploy
firebase deploy
```

## 🔒 Security Best Practices

✅ **Implemented:**
- Firestore security rules (users can only edit their own data)
- Storage security rules (users can only upload to their own folder)
- Client-side validation
- Admin-only routes

⚠️ **Remember:**
- Never commit `firebase.ts` with real keys to public repos
- Use environment variables for production
- Regular security audits in Firebase Console

## 🐛 Troubleshooting

### "Permission denied" errors
- Check Firestore rules are published
- Ensure user is authenticated
- Verify user ID matches in rules

### Images not uploading
- Check Storage rules are published
- Verify file size limits
- Check browser console for errors

### Can't create posts as guest
- This is intentional! Guests are view-only
- Register an account to create posts

## 📚 Next Steps

1. **Add your Firebase config** to `src/lib/firebase.ts`
2. **Test authentication** by registering
3. **Create a post** with image upload
4. **Test admin features** (you'll need to manually set `isAdmin: true` in Firestore for a user)

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
