import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/dashboard/app-sidebar";
import {  Outlet } from "react-router-dom";

export default function DashboardLayout(){
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
