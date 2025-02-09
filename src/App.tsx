import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InstallationWizard } from './components/InstallationWizard';
import { Dashboard } from './components/Dashboard';
import { useAppStore } from './store';

export default function App() {
  const { isInstalled, initializeStore } = useAppStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeStore();
        setError(null);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('حدث خطأ أثناء تهيئة التطبيق. يرجى تحديث الصفحة.');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [initializeStore]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
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