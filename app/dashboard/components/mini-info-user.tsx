'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Session {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
}

interface UserProfileProps {
  session: Session | null;
}

const TruncatedText: React.FC<{ text: string; maxLength: number; className?: string }> = ({
  text,
  maxLength,
  className,
}) => {
  if (!text || text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{text.slice(0, maxLength)}...</span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function UserProfile({ session }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col overflow-hidden">
        <TruncatedText
          text={session?.user?.name || 'Unknown User'}
          maxLength={15}
          className="text-sm font-medium leading-none"
        />
        <TruncatedText
          text={session?.user?.email || 'No email'}
          maxLength={25}
          className="text-xs text-muted-foreground"
        />
      </div>
    </div>
  );
}
