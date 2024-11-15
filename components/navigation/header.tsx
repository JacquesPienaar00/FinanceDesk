'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSession } from 'next-auth/react';
import CartButton from '../eCommerce/cartButton';
import Search from '@/components/ui/searchButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { ScrollArea } from '@/components/ui/scroll-area';

import imagesBusiness from '@/public/icons/businessAdministation';
import imagesFinancial from '@/public/icons/financialAdvisory';
import imagesTax from '@/public/icons/taxAdministration';
import imagesPackages from '@/public/icons/servicesPackages';
import { ModeToggle } from '../ModeToggle';

const Logo = ({ className, ...props }: { className: string }) => (
  <svg
    className={className}
    width={225}
    height={225}
    viewBox="0 0 417 146"
    fill="currentColor"
    {...props}
  >
    <path d="M182.134 1.911c.042 1.837.068 1.851.673.348.362-.903 1.225-1.564 2.041-1.564 1.301 0 1.412.434 1.412 5.509 0 4.662-.187 5.558-1.216 5.827-.669.175.172.354 1.87.398 2.661.07 2.92-.041 1.876-.804-.99-.724-1.173-1.768-1.002-5.734.188-4.353.362-4.87 1.702-5.061 1.101-.157 1.68.3 2.204 1.737l.711 1.951.055-2.259.055-2.259H182.09l.044 1.911M203.461.46c1.211.489 1.211 11.101 0 11.59-.478.193.383.339 1.911.325 1.529-.015 2.233-.169 1.564-.344-.898-.235-1.216-1.032-1.216-3.047 0-2.721.009-2.729 2.78-2.729 2.77 0 2.78.01 2.78 2.722 0 1.527-.381 2.876-.869 3.073-.478.193.382.35 1.911.35s2.39-.157 1.912-.35c-.591-.239-.869-2.09-.869-5.795s.278-5.556.869-5.795c.478-.193-.383-.35-1.912-.35s-2.389.157-1.911.35c.478.193.869 1.419.869 2.725 0 2.307-.079 2.375-2.78 2.375-2.702 0-2.78-.066-2.78-2.382 0-1.683.356-2.474 1.216-2.699.669-.175-.035-.329-1.564-.344-1.528-.014-2.389.132-1.911.325m22.24 0c1.211.489 1.211 11.101 0 11.59-.478.193 1.399.375 4.17.405l5.039.055-.01-2.259-.01-2.259-.875 1.738c-.657 1.305-1.519 1.791-3.465 1.953l-2.59.216V8.996c0-2.722.108-2.882 1.737-2.571 1.088.208 1.738.014 1.738-.518 0-.531-.65-.725-1.738-.517-1.594.305-1.737.125-1.737-2.181 0-2.473.046-2.514 2.802-2.514 2.257 0 2.925.305 3.431 1.564.605 1.503.631 1.489.673-.348L234.91 0l-5.039.055c-2.771.03-4.648.212-4.17.405M62.192 5.337c-1.769 2.17-3.847 5.185-4.62 6.699-.772 1.514-3.819 6.697-6.769 11.517-11.241 18.363-21.033 36.34-25.799 47.364-2.72 6.292-5.471 11.978-6.113 12.636-.643.657-5.129 3.323-9.97 5.924L.12 94.206l1.736 1.547c2.016 1.796 3.234 1.863 8.916.491 2.294-.554 4.383-1.012 4.643-1.018.259-.006-.145 2.1-.898 4.68-3.763 12.887-6.872 26.507-6.872 30.108 0 4.311 1.439 9.204 3.32 11.285 1.664 1.843 7.397 4.651 9.495 4.651 3.394 0 9.037-3.154 12.284-6.866 3.694-4.223 9.168-14.849 10.365-20.12 2.563-11.289-5.353-25.815-15.063-27.636-2.026-.38-2.307-.663-1.922-1.928.248-.815.961-2.079 1.584-2.809 1.324-1.547 12.867-7.142 21.661-10.498 5.577-2.128 19.885-5.7 20.448-5.104.129.137-.332 2.468-1.025 5.18-2.239 8.766-2.361 10.846-.755 12.887.784.997 2.497 2.321 3.808 2.943 4.701 2.231 9.293 1.124 15.346-3.702 3.78-3.013 13.917-14.189 16.892-18.623 1.347-2.007 2.556-3.649 2.688-3.649.131 0-.427 1.642-1.241 3.649-3.139 7.74-5.431 14.855-5.43 16.853 0 1.384.814 3.021 2.419 4.865l2.419 2.78 1.466-1.73c.807-.952 2.211-3.2 3.121-4.996 2.901-5.723 12.137-17.327 20.906-26.262 4.676-4.764 8.699-8.466 8.94-8.225.241.241.856 3.827 1.368 7.968.512 4.142 1.583 9.275 2.381 11.408 1.763 4.71 5.505 9.239 9.188 11.117 1.503.767 3.022 2.155 3.375 3.085.356.936 1.431 1.887 2.41 2.133 3.129.785 5.847-1.684 16.699-15.172 3.833-4.763 8.755-10.013 10.973-11.704 2.213-1.687 4.845-3.927 5.849-4.978 2.841-2.974 3.186-2.274 1.025 2.085-8.195 16.536-8.688 23.236-2.049 27.886 3.53 2.473 11.279.503 19.049-4.843 2.616-1.8 3.165-1.983 2.753-.918-.284.732-.667 2.739-.851 4.459-.303 2.823-.095 3.398 2.131 5.907l2.466 2.78 1.22-1.519c.671-.836 2.268-3.382 3.551-5.657 3.105-5.511 9.843-14.373 16.64-21.886 5.451-6.024 12.575-12.598 13.092-12.081.144.145.747 3.988 1.34 8.541 1.184 9.101 2.868 13.698 6.559 17.901 3.462 3.943 5.673 4.886 8.594 3.666 1.296-.542 2.569-1.33 2.83-1.751.909-1.472 1.781-.748 1.796 1.493.037 5.501 5.86 13.19 11.984 15.824 6.615 2.846 19.072 1.141 30.964-4.237 5.372-2.43 18.432-10.774 14.548-9.295-2.412.918-1.119-.419 4.17-4.314 2.963-2.182 7.654-6.169 10.425-8.861 2.772-2.691 5.039-4.64 5.039-4.33 0 1.098-8.731 9.637-13.368 13.075-2.586 1.917-4.702 3.63-4.702 3.806 0 .671 8.208-5.557 12.942-9.821l4.949-4.458-.29 3.265c-.159 1.795-.393 3.991-.519 4.879-.158 1.114.645 2.574 2.591 4.713 4.307 4.733 6.521 5.836 11.684 5.827 7.833-.015 13.678-2.249 24.847-9.499 10.735-6.967 27.983-25.419 28.839-30.851.322-2.043-.332-1.553-8.118 6.09-8.48 8.324-17.74 16.198-19.048 16.198-.384 0-1.444.743-2.356 1.652-2.443 2.434-14.863 8.444-20.12 9.736-5.523 1.358-9.686 1.436-11.359.213-1.114-.815-.72-1.14 3.799-3.136 13.619-6.016 24.979-16.671 24.979-23.431 0-4.422-5.279-9.381-11.446-10.751-5.567-1.237-5.298-1.42-15.836 10.774-.346.401-.386.106-.094-.695.278-.764-2.021 1.582-5.111 5.213-12.129 14.258-32.959 28.14-50.218 33.466-10.548 3.256-20.628 1.567-23.218-3.891-2.414-5.086-.418-14.985 4.96-24.601 9.731-17.401 33.482-35.511 41.174-31.394 1.365.73 1.529 1.248 1.231 3.888-.549 4.873-9.334 18.201-14.524 22.036-1.722 1.273-1.952 1.288-3.456.235-2.492-1.746-4.777-1.484-4.777.547 0 2.483 3.65 5.274 6.899 5.274 5.17 0 12.279-7.457 18.133-19.019 3.459-6.831 3.659-10.081.799-12.942-4.686-4.686-12.714-4.402-23.051.816-9.476 4.783-21.267 17.096-28.178 29.425-2.185 3.898-7.677 9.448-11.218 11.336-.834.445-2.492.809-3.684.809-3.007 0-3.939-2.554-5.251-14.393-.878-7.917-1.319-9.841-2.593-11.301-2.556-2.929-3.463-3.496-5.596-3.496-1.685 0-3.473 1.434-10.174 8.166-4.472 4.492-9.45 9.714-11.063 11.606-1.919 2.25-2.707 2.85-2.279 1.737 1.682-4.374 7.86-16.841 10.774-21.74 1.78-2.994 3.237-5.632 3.237-5.862 0-.968-2.952-6.417-3.476-6.417-1.458 0-13.708 22.247-17.895 32.5-.822 2.011-2.057 3.869-2.745 4.128-.688.259-3.441 2.147-6.117 4.196-5.273 4.036-13.826 8.521-16.253 8.521-3.268 0-2.739-2.932 3.385-18.765 4.739-12.253 4.736-13.173-.055-18.148-6.108-6.341-7.411-6.652-12.83-3.054-4.516 2.997-7.877 6.766-15.154 16.99-8.302 11.666-12.356 15.324-16.987 15.329-1.938.003-2.442-.352-3.25-2.286-.526-1.259-1.297-5.559-1.714-9.556-1.201-11.532-1.355-12.128-3.828-14.828-3.825-4.176-5.475-3.701-13.242 3.813-3.599 3.482-8.334 8.48-10.522 11.107-2.189 2.628-4.11 4.647-4.269 4.487-.614-.613 6.685-15.39 12.744-25.803 1.216-2.09 1.208-2.218-.325-5.386-.864-1.785-1.782-3.245-2.041-3.245-.522 0-6.532 9.462-9.594 15.106-1.086 2.002-2.384 3.643-2.884 3.649-.512.006-.693-.341-.414-.792.308-.499.19-.614-.31-.305-.443.274-2.023 2.277-3.51 4.451-9.419 13.77-26.887 30.956-33.03 32.498-1.888.474-1.898.458-1.547-2.566.369-3.19 2.791-11.406 3.836-13.019.458-.705.953-.757 1.981-.207 1.031.552 1.743.474 2.869-.315 1.927-1.35 1.887-2.225-.205-4.408l-1.702-1.776 4.48-7.992c2.464-4.395 4.481-8.646 4.482-9.446.003-1.988-4.376-4.396-6.09-3.349-.663.405-3.389 4.983-6.058 10.173l-4.853 9.437-3.487.435c-6.161.768-17.713 3.91-25.651 6.975-8.195 3.165-11.544 4.157-11.544 3.421 0-1.277 6.454-14.879 11.301-23.818 6.179-11.395 22.198-38.57 26.43-44.836l2.767-4.096-1.658-1.275c-2.837-2.181-4.427-1.651-7.923 2.642m35.25 15.923c-2.18 2.259-5.181 5.894-6.668 8.077-2.63 3.862-2.672 4.018-1.548 5.734 1.576 2.405 4.212 2.338 5.749-.147.65-1.051 2.847-4.435 4.881-7.52 3.86-5.852 4.425-7.866 2.625-9.36-.915-.759-1.661-.283-5.039 3.216m91.572 27.807c-1.042 2.74-1.69 3.515-11.929 14.27-5.227 5.492-10.185 10.862-11.017 11.933-2.479 3.194-2.336 1.581.163-1.842 1.269-1.738 3.48-4.996 4.914-7.24 4.242-6.639 15.706-18.625 18.052-18.874.277-.03.194.759-.183 1.753m187.722.997c3.199 1.713.509 7.775-6.21 13.996-4.819 4.462-16.045 12.653-16.591 12.106-.147-.147.969-2.723 2.48-5.725 3.136-6.229 7.643-12.582 12.503-17.624 3.406-3.534 5.187-4.161 7.818-2.753m-266.659 8.468c-2.262 3.612-5.132 7.132-5.132 6.293 0-.336.947-1.898 2.104-3.472 1.157-1.573 2.017-3.277 1.911-3.785-.106-.509.213-.842.709-.741.496.102.85-.211.787-.695-.064-.484-.069-1.349-.012-1.922.084-.849.233-.821.8.152.527.905.245 1.915-1.167 4.17m72.013 2.195c0 .145-.547.692-1.216 1.217-1.103.864-1.127.84-.263-.263.908-1.157 1.479-1.526 1.479-.954M68.284 67.875c-.478.193-1.26.193-1.738 0s-.087-.35.869-.35 1.347.157.869.35m-4.17.695c-.478.193-1.26.193-1.738 0s-.087-.35.869-.35 1.347.157.869.35m-3.142.655c-.231.231-.831.256-1.332.055-.555-.222-.39-.387.42-.42.732-.03 1.143.134.912.365m-2.78.695c-.231.231-.831.256-1.332.055-.555-.222-.39-.387.42-.42.732-.03 1.143.134.912.365m-32.8 9.263c-.607 1.173-1.402 2.132-1.769 2.132-.366 0 .015-1.306.847-2.901.831-1.596 1.627-2.555 1.768-2.132.141.423-.24 1.728-.846 2.901m2.755 15.406c1.53.415 3.632 1.559 4.673 2.54 4.051 3.821 5.479 13.782 3.113 21.716-3.21 10.762-16.023 25.053-19.418 21.658-2.335-2.335-.998-13.896 3.391-29.303 1.36-4.778 2.555-9.313 2.654-10.078.29-2.247 1.949-7.297 2.396-7.293.226.002 1.662.344 3.191.76m-10.344 6.663c-.99 2.987-2.719 8.871-3.842 13.075-2.12 7.939-2.889 8.8-1.106 1.239.56-2.377.839-4.879.619-5.56-.27-.837-.199-.961.219-.384.758 1.046 3.278-7.813 2.556-8.983-.265-.428-.167-.581.22-.342.388.24 1.077-.828 1.546-2.392.465-1.554 1.013-2.658 1.217-2.454.205.204-.439 2.814-1.429 5.801m202.034 7.681c-1.483 1.002-2.319 4.217-1.592 6.128.488 1.284 2.019 2.37 5.526 3.919 5.302 2.341 6.485 3.967 4.491 6.17-2.69 2.972-6.851 1.289-9.572-3.873l-1.099-2.085-.028 3.376c-.022 2.618.191 3.292.947 3.002.536-.206 1.553.063 2.259.598.706.535 2.59.983 4.187.995 2.323.018 3.191-.344 4.344-1.809 2.832-3.601 1.268-6.288-5.163-8.868-3.474-1.394-4.207-1.982-4.393-3.522-.654-5.394 6.208-4.929 8.607.584l.945 2.169.027-3.127c.024-2.743-.165-3.147-1.537-3.283-.86-.086-2.815-.33-4.344-.543-1.529-.213-3.151-.137-3.605.169m-64.331.672c1.513.292 1.564.559 1.564 8.268 0 7.612-.07 7.995-1.564 8.595-1.128.454.042.641 4.205.673 6.656.051 9.272-.955 10.958-4.215 2.337-4.521.783-11.345-2.974-13.057-.911-.415-4.377-.711-7.704-.659-3.327.052-5.345.23-4.485.395m32.665 0c1.513.292 1.564.559 1.564 8.268 0 7.612-.07 7.995-1.564 8.595-1.085.437.709.642 5.865.673l7.429.044.474-3.16c.541-3.613-.019-4.971-.725-1.756-.617 2.808-2.766 4.221-6.421 4.221h-2.973v-4.216c0-4.181.016-4.215 1.895-3.996a3.558 3.558 0 0 1 2.77 1.957c.797 1.584.873 1.37.857-2.433-.017-4.09-.037-4.133-1.055-2.258-.699 1.288-1.595 1.911-2.752 1.911-1.616 0-1.715-.222-1.715-3.823v-3.822h3.856c3.686 0 3.899.1 4.838 2.259l.982 2.258.027-2.606.027-2.606-7.471.095c-4.109.052-6.768.23-5.908.395m58.38 0c1.513.292 1.564.559 1.564 8.268 0 7.612-.07 7.995-1.564 8.595-1.191.479-.569.629 2.606.629 3.176 0 3.798-.15 2.607-.629-1.288-.517-1.564-1.165-1.564-3.67 0-2.103.406-3.41 1.316-4.233 1.264-1.145 1.4-1.044 3.475 2.583 2.488 4.348 2.619 5.12.943 5.558-.669.175.66.332 2.953.35 2.343.017 3.619-.186 2.913-.465-.691-.272-2.621-2.83-4.288-5.684l-3.032-5.19 2.551-2.673c1.403-1.471 3.177-2.937 3.941-3.258 1.003-.42.422-.58-2.085-.572-1.911.006-3.084.168-2.606.361 1.564.631.922 1.972-2.606 5.447l-3.475 3.423v-4.269c0-3.875.144-4.297 1.564-4.571.86-.165-.313-.301-2.607-.301-2.293 0-3.466.136-2.606.301m-79.185 1.936c1.844 2.344 2.431 6.002 1.512 9.415-1.098 4.077-2.834 5.534-6.596 5.534h-3.127v-16.68h3.425c2.821 0 3.664.305 4.786 1.731M11.595 123.84c-.222.555-.387.39-.42-.42-.03-.732.134-1.143.365-.912.231.231.256.831.055 1.332" />
  </svg>
);

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center">
            <Logo className={`h-24 w-44 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <NavigationMenu className="hidden rounded-full border bg-background px-5 py-2 xl:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="">Services</NavigationMenuTrigger>
                <NavigationMenuContent className="p-4">
                  <div className="absolute right-3 top-3">
                    <Link href="/services">
                      <Button className="">View All</Button>
                    </Link>
                  </div>

                  <h4 className="flex justify-start pl-3 pt-3 text-lg font-semibold">
                    Powerful and Simple Packages
                  </h4>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {imagesPackages.map((component) => (
                      <li
                        key={component.alt}
                        className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                      >
                        <a href={component.link} className="flex items-center gap-2">
                          <Image
                            src={component.src}
                            alt={component.alt}
                            width={50}
                            height={50}
                            className="h-10 w-10 rounded-md"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{component.text}</span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="">
                    <Tabs defaultValue="business" className=" ">
                      <TabsList className="w-full justify-around">
                        <TabsTrigger value="business">Business Administration</TabsTrigger>
                        <TabsTrigger value="tax">Tax Administration</TabsTrigger>
                        <TabsTrigger value="financial">Financial Advisory</TabsTrigger>
                      </TabsList>

                      <TabsContent value="business">
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {imagesBusiness.map((component) => (
                            <li
                              key={component.alt}
                              className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                            >
                              <a href={component.link} className="flex items-center gap-2">
                                <Image
                                  src={component.src}
                                  alt={component.alt}
                                  width={50}
                                  height={50}
                                  className="h-10 w-10 rounded-md"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{component.text}</span>
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </TabsContent>

                      <TabsContent value="tax">
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {imagesTax.map((component) => (
                            <li
                              key={component.alt}
                              className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                            >
                              <a href={component.link} className="flex items-center gap-2">
                                <Image
                                  src={component.src}
                                  alt={component.alt}
                                  width={50}
                                  height={50}
                                  className="h-10 w-10 rounded-md"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{component.text}</span>
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </TabsContent>

                      <TabsContent value="financial">
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {imagesFinancial.map((component) => (
                            <li
                              key={component.alt}
                              className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                            >
                              <a href={component.link} className="flex items-center gap-2">
                                <Image
                                  src={component.src}
                                  alt={component.alt}
                                  width={50}
                                  height={50}
                                  className="h-10 w-10 rounded-md"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{component.text}</span>
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                    </Tabs>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Contact Us
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <Search />
              <ModeToggle />
              <CartButton />
            </NavigationMenuList>
          </NavigationMenu>

          {status === 'authenticated' ? (
            <Link href="/dashboard">
              <Button className="hidden rounded-full bg-primary px-10 py-7 text-primary-foreground xl:inline-flex">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button className="hidden rounded-full bg-primary px-10 py-7 text-primary-foreground xl:inline-flex">
                Sign In
              </Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 xl:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <MobileNav session={session} status={status} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ session, status }: { session: any; status: string }) {
  return (
    <div className="flex h-screen flex-col">
      <ScrollArea className="flex-grow pr-5">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex w-full items-center rounded-md px-2 py-4 text-sm hover:bg-accent"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="flex w-full items-center rounded-md px-2 py-4 text-sm hover:bg-accent"
          >
            About
          </Link>
          <Accordion type="single" collapsible>
            <AccordionItem value="services">
              <AccordionTrigger className="hover:textwhite rounded-md px-2 text-white hover:bg-accent dark:text-white">
                Services
              </AccordionTrigger>
              <AccordionContent className="bg-secondary px-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Packages</AccordionTrigger>
                    <AccordionContent>
                      <ul className="grid grid-cols-1 gap-2">
                        {imagesPackages.map((component) => (
                          <li
                            key={component.alt}
                            className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                          >
                            <a href={component.link} className="flex items-center gap-2">
                              <Image
                                src={component.src}
                                alt={component.alt}
                                width={50}
                                height={50}
                                className="h-8 w-8 rounded-md"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{component.text}</span>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Business Administration</AccordionTrigger>
                    <AccordionContent>
                      <ul className="grid grid-cols-1 gap-2">
                        {imagesBusiness.map((component) => (
                          <li
                            key={component.alt}
                            className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                          >
                            <a href={component.link} className="flex items-center gap-2">
                              <Image
                                src={component.src}
                                alt={component.alt}
                                width={50}
                                height={50}
                                className="h-8 w-8 rounded-md"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{component.text}</span>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Tax Administration</AccordionTrigger>
                    <AccordionContent>
                      <ul className="grid grid-cols-1 gap-2">
                        {imagesTax.map((component) => (
                          <li
                            key={component.alt}
                            className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                          >
                            <a href={component.link} className="flex items-center gap-2">
                              <Image
                                src={component.src}
                                alt={component.alt}
                                width={50}
                                height={50}
                                className="h-8 w-8 rounded-md"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{component.text}</span>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Financial Advisory</AccordionTrigger>
                    <AccordionContent>
                      <ul className="grid grid-cols-1 gap-2">
                        {imagesFinancial.map((component) => (
                          <li
                            key={component.alt}
                            className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                          >
                            <a href={component.link} className="flex items-center gap-2">
                              <Image
                                src={component.src}
                                alt={component.alt}
                                width={50}
                                height={50}
                                className="h-8 w-8 rounded-md"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{component.text}</span>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Link
            href="/contact"
            className="flex w-full items-center rounded-md px-2 py-4 text-sm hover:bg-accent"
          >
            Contact Us
          </Link>
        </div>
      </ScrollArea>
      <div className="mb-12 border-t">
        <div className="mb-4">
          <CartButton />
        </div>
        {status === 'authenticated' ? (
          <Link href="/dashboard">
            <Button className="w-full bg-primary text-primary-foreground">Dashboard</Button>
          </Link>
        ) : (
          <Link href="/dashboard">
            <Button className="w-full bg-primary text-primary-foreground">Sign In</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  },
);
ListItem.displayName = 'ListItem';
