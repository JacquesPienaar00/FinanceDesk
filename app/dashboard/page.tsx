'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LayoutDashboard, Users, ShoppingCart, Settings } from 'lucide-react';
import Forms from '@/app/dashboard/forms/components/FormIndex';
import { SupportContent } from './components/support-content';
import UserSettings from './components/user-profile';
import DashboardPage from './components/dashboardCards';
import Sidebar from './components/sidebar';
import Header from './components/header';

export default function DashboardSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWiderSidebar, setIsWiderSidebar] = useState(true);
  const { data: session } = useSession();

  const navItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      content: <DashboardPage />,
    },
    { name: 'Support', icon: Users, content: <SupportContent /> },
    {
      name: 'Services',
      icon: ShoppingCart,
      content: <Forms key="forms" />,
    },
    { name: 'Settings', icon: Settings, content: <UserSettings /> },
  ];

  const [activeContent, setActiveContent] = useState<React.ReactNode>(navItems[0].content);
  const [activePage, setActivePage] = useState(navItems[0].name);

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

  useEffect(() => {
    setActivePage(navItems[0].name);
  }, []);

  const handleNavItemClick = (item: { name: string; content: React.ReactNode }) => {
    setActiveContent(item.content);
    setActivePage(item.name);
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar
          navItems={navItems}
          isWiderSidebar={isWiderSidebar}
          setIsWiderSidebar={setIsWiderSidebar}
          handleNavItemClick={handleNavItemClick}
          session={session}
          signOut={signOut}
        />
        <div
          className={`flex flex-col sm:gap-4 ${
            isWiderSidebar ? 'sm:pl-44' : 'sm:pl-14'
          } transition-all duration-300`}
        >
          <Header
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            navItems={navItems}
            handleNavItemClick={handleNavItemClick}
            activePage={activePage}
            session={session}
            signOut={signOut}
          />
          <main className="p-4">{activeContent}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
