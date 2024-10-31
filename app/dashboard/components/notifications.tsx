'use client';

import { useState, useEffect } from 'react';
import { Bell, Trash2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  number: string;
  status: 'Open' | 'InProgress';
  createdAt: string;
  subject: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch notifications. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [toast]);

  const closeAllNotifications = () => {
    setNotifications([]);
    toast({
      title: 'Success',
      description: 'All notifications have been cleared from view.',
    });
  };

  const closeNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
    toast({
      title: 'Success',
      description: 'Notification has been cleared from view.',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-1 text-xs"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between p-4">
          <span className="text-lg font-semibold">Notifications</span>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={closeAllNotifications} className="h-8 px-2">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <AlertCircle className="mb-2 h-8 w-8" />
              <p>No open notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className="m-2 overflow-hidden">
                <DropdownMenuItem className="flex flex-col items-start p-4">
                  <div className="flex w-full items-start justify-between">
                    <div>
                      <h3 className="font-semibold">Ticket #{notification.number}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.subject}</p>
                      <Badge variant="outline" className="mt-2">
                        {notification.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeNotification(notification.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </DropdownMenuItem>
              </Card>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
