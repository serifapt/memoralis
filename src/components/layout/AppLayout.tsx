import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background font-inter">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};
