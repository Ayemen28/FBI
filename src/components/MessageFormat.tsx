
import React from 'react';

export interface MessageFormatProps {}
export const MessageFormat: React.FC<MessageFormatProps> = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">تنسيق الرسائل</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نمط الرسالة
          </label>
          <textarea
            className="w-full p-2 border rounded-lg"
            rows={4}
            placeholder="أدخل نمط الرسالة هنا..."
          />
        </div>
      </div>
    </div>
  );
};
