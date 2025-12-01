import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FirebaseAuthService, User } from '@/lib/firebase-auth';
import { LogOut, Globe, User as UserIcon, Shield, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for guest user first
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      setCurrentUser(JSON.parse(guestUser));
      return;
    }

    // Then check Firebase auth
    const unsubscribe = FirebaseAuthService.onAuthChange((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = currentUser?.isAdmin || false;
  const isGuest = currentUser?.isGuest || false;

  const handleLogout = async () => {
    localStorage.removeItem('guestUser');
    await FirebaseAuthService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/feed" className="flex items-center gap-2 group">
          <Globe className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-serif font-bold bg-gradient-primary bg-clip-text text-transparent">
            WorldNews
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {currentUser && (
            <>
              <Link to="/feed">
                <Button variant="ghost" size="sm">
                  Feed
                </Button>
              </Link>

              {/* Only show Create Post button if not guest */}
              {!isGuest && (
                <Link to="/create-post">
                  <Button size="sm" className="gap-2 gradient-primary">
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Create Post</span>
                  </Button>
                </Link>
              )}
              
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {currentUser.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {isGuest ? 'Guest Account (View Only)' : 'My Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isGuest && (
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
