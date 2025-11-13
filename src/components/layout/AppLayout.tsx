import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background font-inter overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-8 max-w-full">
        {children || <Outlet />}
      </main>
    </div>
  );
};
