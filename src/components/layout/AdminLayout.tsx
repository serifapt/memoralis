import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children?: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background font-inter">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};
