import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/dashboard/app-sidebar";
import { Outlet } from "react-router-dom";
import { TransactionsProvider } from "@/context/TransactionsContext";
import { CategoriesProvider } from "@/context/CategoriesContext";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TransactionsProvider>
          <CategoriesProvider>
            <Outlet />
          </CategoriesProvider>
        </TransactionsProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
