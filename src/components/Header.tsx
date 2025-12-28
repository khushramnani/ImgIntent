"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, History, Image, Moon, Sun, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Default to dark mode
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navLinks = [
    { path: '/', label: 'Editor', icon: Image },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl gradient-primary glow-primary-sm group-hover:animate-pulse-glow transition-all">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            <span className="gradient-text">Image</span>
            <span className="text-foreground">Intent</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {session && navLinks.map(({ path, label, icon: Icon }) => (
            <Link key={path} href={path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 transition-all",
                  pathname === path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}

          {session && (
            <>
              <div className="w-px h-6 bg-border mx-2" />
              
              <div className="flex items-center gap-2 px-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {session.user?.email}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          )}

          <div className="w-px h-6 bg-border mx-2" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
