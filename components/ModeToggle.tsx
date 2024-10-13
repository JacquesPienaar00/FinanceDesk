import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Ensure component is mounted (fixes hydration mismatch issues)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR issues by rendering only after mounted
  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="border-none">
        <Button variant="outline" size="icon">
          {resolvedTheme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}