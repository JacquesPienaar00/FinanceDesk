'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  LogOut,
  Home,
  Shield,
  AlertTriangle,
  Activity,
  FileText,
  MessageCircleMore,
  SquarePen,
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { FormSubmissionsView } from './components/FormSubmissions';
import AdminChatLogs from './components/admin-chat-logs';
import Usermanagement from './components/user-management';

const useAdminRoute = (redirectTo = '/auth') => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push(redirectTo);
    } else {
      setLoading(false);
    }
  }, [session, status, redirectTo, router]);

  return { session, loading };
};

const useIsLogedIn = () => {
  const { data: session, status } = useSession();
  if (status === 'authenticated') {
    return session;
  }
  return false;
};

const navItems = [
  {
    name: 'Admin Dashboard',
    icon: LayoutDashboard,
    content: (
      <div>
        <AdminDashboardContent />
      </div>
    ),
  },
  { name: 'User Management', icon: Users, content: <Usermanagement /> },
  { name: 'System Settings', icon: Settings, content: <div>System Settings Content</div> },
  { name: 'Chat', icon: MessageCircleMore, content: <AdminChatLogs /> },
  {
    name: 'Form Submissions',
    icon: SquarePen,
    content: (
      <div>
        <FormSubmissionsView />
      </div>
    ),
  },
  { name: 'File Management', icon: FileText, content: <div></div> },
];

const Sidebar = ({
  setActiveContent,
}: {
  setActiveContent: React.Dispatch<React.SetStateAction<JSX.Element | JSX.Element[] | null>>;
}) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-red-600 text-lg font-semibold text-white md:h-8 md:w-8 md:text-base"
        >
          <Shield className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Admin Dashboard</span>
        </Link>
        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:h-8 md:w-8"
                onClick={() => setActiveContent(item.content)}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.name}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => signOut()}
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-8 md:w-8"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Log out</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};

const UserProfile = () => {
  const session = useIsLogedIn();

  if (!session) return null;

  return (
    <>
      <div className="flex items-center gap-4 border-t bg-background p-4">
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium">{session.user.name}</span>
          <span className="text-xs text-muted-foreground">{session.user.email}</span>
          <Badge variant="destructive" className="mt-1 w-fit">
            Admin
          </Badge>
        </div>
      </div>
      <Link href="/">
        <Button variant="ghost" className="w-full justify-start">
          <Home className="mr-2 h-4 w-4" />
          Return to main site
        </Button>
      </Link>
    </>
  );
};

function AdminDashboardContent() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">+20% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">423</div>
          <p className="text-xs text-muted-foreground">+5% from last hour</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Load</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">65%</div>
          <p className="text-xs text-muted-foreground">-3% from last 15 minutes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">2 critical, 5 warnings</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<JSX.Element | JSX.Element[] | null>(null);
  const { loading } = useAdminRoute();
  const session = useIsLogedIn();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Access Denied. Please log in as an admin.</div>;
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar setActiveContent={setActiveContent} />

        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
                        <Shield className="h-6 w-6 text-red-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="-mr-4 h-8 w-10 bg-secondary">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Close</span>
                        </Button>
                      </SheetClose>
                    </div>
                    <div className="space-y-1 p-2">
                      {navItems.map((item, index) => (
                        <Button
                          key={index}
                          onClick={() => {
                            setActiveContent(item.content);
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
                    <UserProfile />
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="#">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="#">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="relative ml-auto flex-1 md:grow-0">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                  <Avatar>
                    <AvatarImage src="/admin-avatar.svg" alt="Admin Avatar" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Security</DropdownMenuItem>
                <Link href="/">
                  <DropdownMenuItem>Return to Main Site</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto px-6">
            <div className="mx-auto mt-12 md:mt-0">
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  You are accessing an admin dashboard. Exercise caution and ensure you have the
                  necessary permissions.
                </AlertDescription>
              </Alert>
              {activeContent ? (
                Array.isArray(activeContent) ? (
                  <div className="">{activeContent}</div>
                ) : (
                  activeContent
                )
              ) : (
                <AdminDashboardContent />
              )}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
