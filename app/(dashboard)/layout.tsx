import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tf-app-shell tf-screen flex min-h-screen overflow-x-hidden">
      <Sidebar />

      <div className="relative flex min-w-0 w-full flex-1 flex-col">
        <Header />

        <main className="tf-main-stage relative flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
