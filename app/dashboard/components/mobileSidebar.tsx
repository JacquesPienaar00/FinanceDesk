import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import UserProfile from './mini-info-user';

interface NavItem {
  name: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface MobileMenuButtonProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navItems: NavItem[];
  handleNavItemClick: (item: NavItem) => void;
  session: any;
}

export default function MobileMenuButton({
  isSidebarOpen,
  setIsSidebarOpen,
  navItems,
  handleNavItemClick,
  session,
}: MobileMenuButtonProps) {
  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <ScrollArea className="h-full">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center justify-between border-b px-6">
              <Link href="#" className="flex items-center gap-2 font-semibold">
                <LayoutDashboard className="h-6 w-6" />
                <span>The Finance Desk</span>
              </Link>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="-mr-4 h-8 w-10 bg-secondary">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetClose>
            </div>
            <div className="flex flex-grow flex-col justify-between overflow-y-auto">
              <div className="space-y-1 p-2">
                {navItems.map((item, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      handleNavItemClick(item);
                      setIsSidebarOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                ))}
              </div>
              <div className="mt-auto p-4">
                <UserProfile session={session} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
