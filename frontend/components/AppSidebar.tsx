"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Image,
  FileText,
  ListTodo,
  Film,
  Calendar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/references", label: "References", icon: Image },
  { href: "/prompts", label: "Prompts", icon: FileText },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/media", label: "Media", icon: Film },
  { href: "/planner", label: "Planner", icon: Calendar },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-700 flex flex-col min-h-screen">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <Sparkles className="h-6 w-6 text-indigo-400" />
        <span className="text-lg font-bold text-gray-100 tracking-tight">
          AI Model Studio
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-600">MVP v0.1</p>
      </div>
    </aside>
  );
}
