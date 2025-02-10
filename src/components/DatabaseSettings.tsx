
import React, { useState, useEffect } from 'react';
import { DatabaseManager } from '../db';

export type DatabaseSettings = React.FC;
export const DatabaseSettings: DatabaseSettings = () => {
  const [status, setStatus] = useState({ connected: false, error: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      const db = DatabaseManager.getInstance();
      const isConnected = await db.checkConnection();
      setStatus({ connected: isConnected, error: '' });
    } catch (error) {
      setStatus({ connected: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات قاعدة البيانات</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            <div className={`p-4 rounded-lg mb-4 ${status.connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <p className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {status.connected ? 'متصل بقاعدة البيانات' : 'غير متصل بقاعدة البيانات'}
              </p>
              {status.error && <p className="mt-2 text-sm">{status.error}</p>}
            </div>
            
            <button
              onClick={checkConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              إعادة فحص الاتصال
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
