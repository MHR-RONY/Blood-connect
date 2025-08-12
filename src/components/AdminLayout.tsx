
import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Heart,
  ClipboardList,
  Package,
  AlertTriangle,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar 
} from '@/components/ui/sidebar';

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: BarChart3,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Donors",
    url: "/admin/donors",
    icon: Heart,
  },
  {
    title: "Requests",
    url: "/admin/requests",
    icon: ClipboardList,
  },
  {
    title: "Inventory",
    url: "/admin/inventory",
    icon: Package,
  },
  {
    title: "Emergency",
    url: "/admin/emergency",
    icon: AlertTriangle,
  },
  {
    title: "Donations",
    url: "/admin/donations", 
    icon: DollarSign,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-primary">Admin Panel</h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger />
              <div className="ml-auto">
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
