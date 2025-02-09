import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InstallationWizard } from './components/InstallationWizard';
import { Dashboard } from './components/Dashboard';
import { useAppStore } from './store';

export default function App() {
  const { isInstalled, initializeStore } = useAppStore();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeStore();
      setIsLoading(false);
    };
    init();
  }, [initializeStore]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            isInstalled ? 
              <Navigate to="/dashboard" replace /> : 
              <InstallationWizard />
          } 
        />
        <Route 
          path="/dashboard/*" 
          element={
            isInstalled ? 
              <Dashboard /> : 
              <Navigate to="/" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}