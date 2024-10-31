'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  Menu,
  LogOut,
  Home,
  Package2,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Forms from '@/app/dashboard/forms/components/FormIndex';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { SupportContent } from './components/support-content';
import UserSettings from './components/user-profile';
import { Notifications } from './components/notifications';

export default function DashboardSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWiderSidebar, setIsWiderSidebar] = useState(true);
  const [activeContent, setActiveContent] = useState<React.ReactNode | null>(null);
  const [activePage, setActivePage] = useState('Dashboard');

  const { data: session } = useSession();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'b') {
        setIsWiderSidebar((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const navItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      content: <div>Dashboard Content</div>,
    },
    { name: 'Support', icon: Users, content: <SupportContent /> },
    {
      name: 'Services',
      icon: ShoppingCart,
      content: <Forms key="forms" />,
    },
    { name: 'Settings', icon: Settings, content: <UserSettings /> },
  ];

  const handleNavItemClick = (item: { name: string; content: React.ReactNode }) => {
    setActiveContent(item.content);
    setActivePage(item.name);
  };

  const Sidebar = () => (
    <aside
      className={`fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background transition-all duration-300 sm:flex ${isWiderSidebar ? 'w-64' : 'w-14'}`}
    >
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
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
                className={`flex justify-center ${isWiderSidebar ? 'flex w-full justify-start px-3' : 'h-9 w-9 md:h-8 md:w-8'}`}
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
        className={`mt-auto flex items-center gap-4 px-2 sm:py-5 ${isWiderSidebar ? 'mx-auto' : 'flex-col'}`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => signOut()}
              variant="ghost"
              size={isWiderSidebar ? 'default' : 'icon'}
              className={`flex justify-center ${isWiderSidebar ? 'px-3' : 'h-9 w-9 md:h-8 md:w-8'}`}
            >
              <LogOut className={`h-4 w-4 ${isWiderSidebar ? 'mr-2' : ''}`} />
              {isWiderSidebar && <span>Log out</span>}
              {!isWiderSidebar && <span className="sr-only">Log out</span>}
            </Button>
          </TooltipTrigger>
          {!isWiderSidebar && <TooltipContent side="right">Log out</TooltipContent>}
        </Tooltip>
        <ModeToggle />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsWiderSidebar((prev) => !prev)}
          className=""
        >
          {isWiderSidebar ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );

  const UserProfile = () => (
    <>
      <div className="flex items-center gap-4 border-t bg-background p-4">
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium">{session?.user?.name}</span>
          <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
        </div>
      </div>
      <Link href="/">
        <Button variant="ghost" className="w-full justify-center">
          <Home className="mr-2 h-4 w-4" />
          Return home
        </Button>
      </Link>
    </>
  );

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div
          className={`flex flex-col sm:gap-4 ${isWiderSidebar ? 'sm:pl-64' : 'sm:pl-14'} transition-all duration-300`}
        >
          <header className="shadow-3xl sticky top-0 z-30 flex h-14 w-full items-center gap-4 border-b bg-muted/50 p-3 px-4 backdrop-blur-md">
            {' '}
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
                    <div className="space-y-1 p-2">
                      {navItems.map((item, index) => (
                        <Button
                          key={index}
                          onClick={() => {
                            handleNavItemClick(item);
                            setIsSidebarOpen(false);
                          }}
                          variant="ghost"
                          className="w-full justify-center"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Button>
                      ))}
                    </div>
                    <UserProfile />
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="#">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activePage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[120px] lg:w-[336px]"
              />
            </div>
            <Notifications />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                  <Avatar>
                    <AvatarImage src="/thefinancedesk.svg" alt="User Avatar" />
                    <AvatarFallback>TFD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <Link href="/">
                  <DropdownMenuItem>Return Home</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto px-6">
            <div className="mx-auto mt-12 md:mt-0">
              {activeContent ? (
                activeContent
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to Your Dashboard</CardTitle>
                    <CardDescription>
                      Select an item from the sidebar to view content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Here you can manage your business services and access various tools.</p>
                    <p className="mt-2">
                      Press Ctrl+B to toggle the sidebar width, or use the button at the bottom of
                      the sidebar.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
