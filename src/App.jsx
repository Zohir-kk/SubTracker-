import { useState } from "react";
import { StoreProvider, useStore } from "./store/useStore";
import { LanguageProvider } from "./providers/LanguageProvider";
import { ToastProvider } from "./components/ui/Toast";
import { AppHeader } from "./components/layout/AppHeader";
import { AppSidebar } from "./components/layout/AppSidebar";
import { Dashboard } from "./pages/dashboard";
import { Parametres } from "./pages/Parametres";
import { AskSubDz } from "./components/ai/AskSubDz";
import { AuthScreen } from "./components/auth/AuthScreen";
import { ResetPasswordScreen } from "./components/auth/ResetPasswordScreen";
import { Skeleton } from "./components/ui/Skeleton";
import { usePushNotifications } from "./hooks/usePushNotifications";

function AppSkeleton() {
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="hidden md:flex flex-col w-[260px] bg-bg-2 border-r border-border-2 p-6 gap-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="w-24 h-5" />
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Skeleton className="w-full h-11 rounded-xl" />
          <Skeleton className="w-full h-11 rounded-xl" />
          <Skeleton className="w-full h-11 rounded-xl" />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[72px] border-b border-border-2 flex items-center px-4 md:px-8 justify-between bg-bg-2">
          <Skeleton className="w-32 h-6" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_340px]">
            <Skeleton className="h-[400px] rounded-[14px]" />
            <Skeleton className="h-[400px] rounded-[14px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, authLoading } = useStore();

  usePushNotifications();

  if (authLoading) {
    return <AppSkeleton />;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const oobCode = urlParams.get('oobCode');

  if (mode === 'resetPassword' && oobCode) {
    return <ResetPasswordScreen oobCode={oobCode} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <div className="flex min-h-screen bg-bg">
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <AppHeader onMenuClick={() => setSidebarOpen((v) => !v)} />
          {currentPage === "settings" ? <Parametres /> : <Dashboard />}
        </div>
      </div>
      <AskSubDz />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LanguageProvider>
    </StoreProvider>
  );
}
