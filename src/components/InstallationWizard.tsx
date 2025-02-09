import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Database, Check } from 'lucide-react';
import { useAppStore } from '../store';
import { DatabaseManager } from '../db';
import type { BotConfig } from '../types';

const steps = [
  {
    title: 'إعداد قاعدة البيانات',
    icon: Database,
    description: 'تهيئة قاعدة البيانات وإنشاء المخازن المطلوبة'
  },
  {
    title: 'إعداد البوت',
    icon: Bot,
    description: 'إدخال توكن البوت ومعرفات المجموعات'
  },
  {
    title: 'تأكيد الإعدادات',
    icon: Check,
    description: 'مراجعة وتأكيد جميع الإعدادات'
  }
];

export function InstallationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Partial<BotConfig>>({});
  const { setInstalled, setBotConfig } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBotConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newConfig = {
      token: formData.get('token') as string,
      sourceGroup: formData.get('sourceGroup') as string,
      targetGroup: formData.get('targetGroup') as string,
      isActive: true
    };
    setConfig(newConfig);
    setCurrentStep(2);
  };

  const initializeDatabase = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const db = DatabaseManager.getInstance();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initialization
      setCurrentStep(1);
    } catch (err) {
      setError('فشل في تهيئة قاعدة البيانات. الرجاء المحاولة مرة أخرى.');
      console.error('Database initialization error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (config.token && config.sourceGroup && config.targetGroup) {
      setIsProcessing(true);
      setError(null);
      try {
        const db = DatabaseManager.getInstance();
        const fullConfig: BotConfig = {
          token: config.token,
          sourceGroup: config.sourceGroup,
          targetGroup: config.targetGroup,
          isActive: true
        };
        
        await db.saveBotConfig(fullConfig);
        setBotConfig(fullConfig);
        setInstalled(true);
        navigate('/dashboard');
      } catch (err) {
        setError('فشل في حفظ الإعدادات. الرجاء المحاولة مرة أخرى.');
        console.error('Config save error:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">تثبيت نظام إدارة البوت</h1>
        
        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                <step.icon size={24} />
              </div>
              <span className="text-sm font-medium text-gray-600">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {currentStep === 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">إعداد قاعدة البيانات</h2>
              <p className="text-gray-600 mb-6">سيتم إنشاء قاعدة بيانات محلية وتهيئة المخازن المطلوبة.</p>
              <button
                onClick={initializeDatabase}
                disabled={isProcessing}
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2`}
              >
                {isProcessing && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isProcessing ? 'جاري التهيئة...' : 'بدء التهيئة'}
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={handleBotConfig}>
              <h2 className="text-xl font-bold mb-4">إعداد البوت</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    توكن البوت
                  </label>
                  <input
                    required
                    name="token"
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="أدخل توكن البوت"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    معرف المجموعة المصدر
                  </label>
                  <input
                    required
                    name="sourceGroup"
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="مثال: -100123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    معرف المجموعة الهدف
                  </label>
                  <input
                    required
                    name="targetGroup"
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="مثال: -100987654321"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  التالي
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">تأكيد الإعدادات</h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="mb-2"><strong>توكن البوت:</strong> {config.token}</p>
                <p className="mb-2"><strong>المجموعة المصدر:</strong> {config.sourceGroup}</p>
                <p className="mb-2"><strong>المجموعة الهدف:</strong> {config.targetGroup}</p>
              </div>
              <button
                onClick={handleComplete}
                disabled={isProcessing}
                className={`bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center gap-2`}
              >
                {isProcessing && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isProcessing ? 'جاري الإكمال...' : 'إكمال التثبيت'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}