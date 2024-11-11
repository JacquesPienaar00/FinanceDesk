import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Package2, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import UserProfile from './mini-info-user';

interface NavItem {
  name: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  isWiderSidebar: boolean;
  setIsWiderSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  handleNavItemClick: (item: NavItem) => void;
  session: any;
  signOut: () => void;
}

export default function Sidebar({
  navItems,
  isWiderSidebar,
  setIsWiderSidebar,
  handleNavItemClick,
  session,
  signOut,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background transition-all duration-300 sm:flex ${
        isWiderSidebar ? 'w-44' : 'w-14'
      }`}
    >
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href=""
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">The Finance Desk</span>
        </Link>
        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isWiderSidebar ? 'default' : 'icon'}
                className={`flex justify-center ${
                  isWiderSidebar ? 'flex w-full justify-start px-3' : 'h-9 w-9 md:h-8 md:w-8'
                }`}
                onClick={() => handleNavItemClick(item)}
              >
                <item.icon className={`h-5 w-5 ${isWiderSidebar ? 'mr-2' : ''}`} />
                {isWiderSidebar && <span>{item.name}</span>}
                {!isWiderSidebar && <span className="sr-only">{item.name}</span>}
              </Button>
            </TooltipTrigger>
            {!isWiderSidebar && <TooltipContent side="right">{item.name}</TooltipContent>}
          </Tooltip>
        ))}
      </nav>
      <div
        className={`mt-auto flex flex-col items-center gap-4 px-2 sm:py-5 ${
          isWiderSidebar ? 'justify-between' : 'justify-center'
        }`}
      >
        <div className={`flex items-center gap-2 ${isWiderSidebar ? 'flex-row' : 'flex-col'}`}>
          <ModeToggle />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsWiderSidebar((prev) => !prev)}
            className="h-8 w-8"
          >
            {isWiderSidebar ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => signOut()}
              variant="ghost"
              size={isWiderSidebar ? 'default' : 'icon'}
              className={`flex justify-center ${isWiderSidebar ? 'w-full px-3' : 'h-9 w-9 md:h-8 md:w-8'}`}
            >
              <LogOut className={`h-4 w-4 ${isWiderSidebar ? 'mr-2' : ''}`} />
              {isWiderSidebar && <span>Log out</span>}
              {!isWiderSidebar && <span className="sr-only">Log out</span>}
            </Button>
          </TooltipTrigger>
          {!isWiderSidebar && <TooltipContent side="right">Log out</TooltipContent>}
        </Tooltip>
        {isWiderSidebar && <UserProfile session={session} />}
      </div>
    </aside>
  );
}
