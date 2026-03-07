'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut, CreditCard, ChevronDown, Coins, Sparkles, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (!session?.user) {
    return (
      <Link href="/auth/signin" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
        <User size={16} /> Sign In
      </Link>
    );
  }

  const credits = (session.user as { credits?: number }).credits ?? 0;
  const initals = session.user.name?.substring(0, 2).toUpperCase() || session.user.email?.substring(0, 2).toUpperCase() || "??";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-border bg-background p-1 pr-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-7 w-7">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || "User avatar"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initals}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left leading-none">
            <span className="text-[13px] font-semibold">{session.user.name || session.user.email?.split('@')[0]}</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <Coins size={10} className="text-yellow-500" /> {credits} tokens
            </span>
          </div>
          <ChevronDown size={14} className="text-muted-foreground ml-1 opacity-50 transition-transform dropdown-open-rotate" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-2 py-1.5 text-sm">
            <span className="flex items-center text-muted-foreground">
              <CreditCard className="mr-2 h-4 w-4" /> Balance
            </span>
            <span className="font-bold text-primary">{credits}</span>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard?purchase=true" className="cursor-pointer text-primary focus:text-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Get AI Tokens</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/signin' })} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
