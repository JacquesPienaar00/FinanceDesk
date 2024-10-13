import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "@/components/ui/command";
import { JSX, SVGProps } from "react";
import Link from "next/link"; 

export default function Component() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-none">
          <SearchIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <Command>
          <CommandInput placeholder="Search for a service" />
          <CommandList>
            <CommandEmpty>No services found.</CommandEmpty>
            <CommandItem>
              <Link href="/services">
                <a className="text-primary">Business Startup package</a>
              </Link>
            </CommandItem>
            <CommandItem>
              <Link href="/services">
                <a className="text-primary">Comprehensive Business package</a>
              </Link>
            </CommandItem>
            <CommandItem>
              <Link href="/services">
                <a className="text-primary">Non-profit Organization package</a>
              </Link>
            </CommandItem>
            <CommandItem>
              <Link href="/services">
                <a className="text-primary">Tax Compliance and Maintenance package</a>
              </Link>
            </CommandItem>
            <CommandSeparator />
            <CommandGroup heading="Categories">
              <CommandItem>
                <span>Activity</span>
              </CommandItem>
              <CommandItem>
                <span>Alerts</span>
              </CommandItem>
              <CommandItem>
                <span>Arrows</span>
              </CommandItem>
              <CommandItem>
                <span>Devices</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function SearchIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}