'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Check, ChevronUp, Globe, Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'af', name: 'Español', flag: '🇪🇸' },
  { code: 'xs', name: 'Français', flag: '🇫🇷' },
  { code: 'so', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ch', name: 'Italiano', flag: '🇮🇹' },
];

export default function LanguageSwitcher() {
  const [language, setLanguage] = React.useState<Language>(languages[0]);
  const [isVisible, setIsVisible] = React.useState(true);
  const [isExpanded, setIsExpanded] = React.useState(true);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200; // Adjust this value as needed
      if (window.scrollY > scrollThreshold && isVisible) {
        setIsVisible(false);
      } else if (window.scrollY <= scrollThreshold && !isVisible) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isVisible) {
      setIsVisible(true);
    }
  };

  // Don't render the component on excluded routes
  if (pathname === '/dashboard' || pathname === '/auth') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-1 z-40 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="relative flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-7 h-10 w-8 rounded-l-none rounded-r-full border-primary bg-background"
          onClick={toggleExpanded}
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">Toggle language switcher</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start gap-2 rounded-r-none border border-primary transition-all duration-300 ease-in-out ${isExpanded ? 'w-[75px] pl-4 pr-4 sm:w-[200px]' : 'w-0 border-0 p-0'}`}
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span
                className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
              >
                {language.flag}
              </span>
              <span
                className={`hidden transition-opacity duration-300 sm:inline-block ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
              >
                {language.name}
              </span>
              <ChevronUp
                className={`ml-auto h-4 w-4 flex-shrink-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                className="flex items-center gap-2"
                onSelect={() => setLanguage(lang)}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {language.code === lang.code && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
