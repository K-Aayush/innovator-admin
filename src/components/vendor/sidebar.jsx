"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Settings,
  Users,
  Bell,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const navigation = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/vendor/dashboard/products", icon: ShoppingBag },
  {
    name: "Categories",
    href: "/vendor/dashboard/categories",
    icon: FolderTree,
  },
  { name: "Customers", href: "/vendor/dashboard/customers", icon: Users },
  {
    name: "Notifications",
    href: "/vendor/dashboard/notifications",
    icon: Bell,
  },
  { name: "Settings", href: "/vendor/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 flex flex-col transition-all duration-300 bg-white border-r border-gray-200",
        isExpanded ? "w-72" : "w-20"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        {isExpanded ? (
          <img className="h-8 w-auto" src="/logo.jpg" alt="Logo" />
        ) : (
          <div className="w-8" /> // Placeholder for spacing
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronLeft className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      <nav className="flex-1 px-6 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? "bg-gray-50 text-orange-600"
                          : "text-gray-700 hover:text-orange-600 hover:bg-gray-50",
                        "group flex items-center rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                        !isExpanded && "justify-center px-3"
                      )}
                      title={!isExpanded ? item.name : undefined}
                    >
                      <Icon
                        className={cn(
                          pathname === item.href
                            ? "text-orange-600"
                            : "text-gray-400 group-hover:text-orange-600",
                          "h-6 w-6 shrink-0",
                          isExpanded && "mr-3"
                        )}
                        aria-hidden="true"
                      />
                      {isExpanded && item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
