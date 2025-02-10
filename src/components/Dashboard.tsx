import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { DatabaseSettings } from './DatabaseSettings';
import { MessageFormat } from './MessageFormat';
import type { DatabaseSettingsProps } from './DatabaseSettings';
import type { MessageFormatProps } from './MessageFormat';
import { 
  Settings, MessageSquare, Database, Layout, Users, FileText, Bell, Menu, X,
  BarChart2, Shield, UserPlus, Trash2, AlertTriangle, MessageCircle
} from 'lucide-react';
import { useAppStore } from '../store';
import { DatabaseManager } from '../db';
import { BotService } from '../services/bot';
import type { UserActivity, GroupMember } from '../types';

// مكون الإحصائيات المتقدمة
const StatsCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-blue-50 p-3 rounded-full">
        <Icon size={24} className="text-blue-600" />
      </div>
      {trend && (
        <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-600 mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const DashboardHome = ({ stats, botConfig }: { stats: any, botConfig: any }) => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [messageStats, setMessageStats] = useState({
    media: 0,
    text: 0,
    deleted: 0,
    links: 0,
    stickers: 0,
    voice: 0
  });
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const bot = BotService.getInstance();
      const db = DatabaseManager.getInstance();
      
      if (botConfig?.sourceGroup) {
        const messages = await bot.fetchChannelMessages(botConfig.sourceGroup);
        const stats = await db.getMessageStats();
        
        setActiveUsers(await bot.getChatMembersCount(botConfig.sourceGroup));
        setMessageStats({
          media: stats.media || 0,
          text: stats.text || 0,
          deleted: stats.deleted || 0,
          links: messages.filter(m => m.text?.includes('http')).length || 0,
          stickers: messages.filter(m => m.type === 'sticker').length || 0,
          voice: messages.filter(m => m.type === 'voice').length || 0
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [botConfig]);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">مرحباً بك</h1>
          <p className="text-gray-600">هذه نظرة عامة على نشاط البوت</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Bell size={18} />
            <span>التنبيهات</span>
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Shield size={18} />
            <span>حالة البوت</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="الرسائل اليوم" value={stats[0].value} icon={MessageSquare} trend={12} />
        <StatsCard title="المستخدمون النشطون" value={activeUsers} icon={Users} trend={5} />
        <StatsCard title="الوسائط المرسلة" value={messageStats.media} icon={FileText} trend={-3} />
        <StatsCard title="الرسائل المحذوفة" value={messageStats.deleted} icon={Trash2} trend={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">نشاط المجموعة</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>الرسائل النصية</span>
              <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>الوسائط</span>
              <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>الروابط</span>
              <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">آخر التنبيهات</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-yellow-600">
              <AlertTriangle size={20} />
              <span>تم حظر مستخدم جديد</span>
              <span className="text-sm text-gray-500">منذ 5 دقائق</span>
            </div>
            <div className="flex items-center gap-3 text-blue-600">
              <UserPlus size={20} />
              <span>انضمام 3 أعضاء جدد</span>
              <span className="text-sm text-gray-500">منذ 15 دقيقة</span>
            </div>
            <div className="flex items-center gap-3 text-red-600">
              <MessageCircle size={20} />
              <span>تم حذف 5 رسائل مخالفة</span>
              <span className="text-sm text-gray-500">منذ ساعة</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const BotSettings = ({ botConfig }: { botConfig: any }) => {
  const [settings, setSettings] = useState({
    ...botConfig,
    mediaScanEnabled: false,
    linkPreviewEnabled: true,
    userJoinRestriction: 'none',
    languageFilter: false,
    maxMessagesPerMinute: 20,
    autoArchiveInactive: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات البوت</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              توكن البوت
            </label>
            <input
              type="text"
              name="token"
              value={settings.token}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رسالة الترحيب
            </label>
            <textarea
              name="welcomeMessage"
              value={settings.welcomeMessage}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="antiSpam"
                checked={settings.antiSpam}
                onChange={handleChange}
                className="rounded text-blue-600"
              />
              <span>مكافحة السبام</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="antiFlood"
                checked={settings.antiFlood}
                onChange={handleChange}
                className="rounded text-blue-600"
              />
              <span>مكافحة الفيضان</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات المجموعة</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              قواعد المجموعة
            </label>
            <textarea
              name="rulesMessage"
              value={settings.rulesMessage}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحد الأقصى للتحذيرات
            </label>
            <input
              type="number"
              name="maxWarnings"
              value={settings.maxWarnings}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
          إلغاء
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<GroupMember[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const db = DatabaseManager.getInstance();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const loadedUsers = await db.getUsers();
      setUsers(loadedUsers);
      setActivities(loadedUsers.map(user => ({
        userId: user.userId,
        username: user.username,
        messageCount: 0,
        lastActive: new Date().toISOString(),
        warnings: 0,
        status: user.status || 'active',
        joinDate: user.joinDate
      })));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await db.deleteUser(userId);
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUpdateStatus = async (userId: number, status: string) => {
    try {
      await db.updateUserStatus(userId, status);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">المشرفون</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصلاحيات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الانضمام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.filter(user => user.isAdmin).map(admin => (
                <tr key={admin.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {admin.firstName[0]}
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{admin.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {admin.permissions.map(perm => (
                        <span key={perm} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.joinDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">تعديل</button>
                    <button className="text-red-600 hover:text-red-900 mr-4">إزالة</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">نشاط المستخدمين</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عدد الرسائل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر نشاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map(activity => (
                <tr key={activity.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">@{activity.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.messageCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.lastActive).toLocaleString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'active' ? 'bg-green-100 text-green-800' :
                      activity.status === 'restricted' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.status === 'active' ? 'نشط' :
                       activity.status === 'restricted' ? 'مقيد' : 'محظور'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button 
                      onClick={() => handleUpdateStatus(activity.userId, 'warning')}
                      className="text-yellow-600 hover:text-yellow-900">
                      تحذير
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(activity.userId, 'banned')}
                      className="text-red-600 hover:text-red-900 mr-4">
                      حظر
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(activity.userId)}
                      className="text-gray-600 hover:text-gray-900 mr-4">
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ActivityLog = () => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'message_delete',
      user: 'ahmad',
      details: 'تم حذف رسالة مخالفة',
      timestamp: '2024-02-06T15:30:00'
    },
    {
      id: 2,
      type: 'user_ban',
      user: 'mohammed',
      details: 'تم حظر المستخدم بسبب السبام',
      timestamp: '2024-02-06T14:45:00'
    },
    // المزيد من النشاطات...
  ]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">سجل الأنشطة</h2>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${
                activity.type === 'message_delete' ? 'bg-red-100 text-red-600' :
                activity.type === 'user_ban' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {activity.type === 'message_delete' ? <Trash2 size={20} /> :
                 activity.type === 'user_ban' ? <Shield size={20} /> :
                 <MessageSquare size={20} />}
              </div>
              <div>
                <p className="font-medium">@{activity.user}</p>
                <p className="text-gray-600">{activity.details}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(activity.timestamp).toLocaleString('ar-SA')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const { botConfig, messages, todayMessages, updateMessageStats } = useAppStore();
  const location = useLocation();

  const [dbStatus, setDbStatus] = useState({ connected: false, error: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const initializeServices = async () => {
      const db = DatabaseManager.getInstance();
      const bot = BotService.getInstance();
      
      try {
        const isConnected = await db.checkConnection();
        setDbStatus({ connected: isConnected, error: '' });

        const config = await db.getBotConfig();
        if (isConnected && config?.token) {
          const isBotInitialized = await bot.initialize(config.token);
          
          if (isBotInitialized) {
            // Get initial stats
            const stats = await db.getMessageStats();
            updateMessageStats(stats.total, stats.today);

            // Get group members count
            if (config.sourceGroup) {
              const membersCount = await bot.getChatMembersCount(config.sourceGroup);
              setActiveUsers(membersCount);

              const channelData = await db.fetchChannelData(botConfig.sourceGroup);
              console.log('Channel data loaded:', channelData.length, 'messages');
              
              // Get administrators
              const admins = await bot.getAdministrators(botConfig.sourceGroup);
              const adminUsers = admins.map(admin => ({
                userId: admin.user.id,
                username: admin.user.username || '',
                firstName: admin.user.first_name,
                lastName: admin.user.last_name || '',
                isAdmin: true,
                joinDate: new Date().toISOString(),
                permissions: ['delete_messages', 'ban_users', 'pin_messages']
              }));
              setUsers(adminUsers);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing services:', error);
        setDbStatus({ connected: false, error: error.message });
      }
    };

    initializeServices();
    
    // Set up periodic stats update
    const statsInterval = setInterval(async () => {
      const db = DatabaseManager.getInstance();
      const stats = await db.getMessageStats();
      updateMessageStats(stats.total, stats.today);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(statsInterval);
  }, [updateMessageStats, botConfig]);

  if (!dbStatus.connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">خطأ في الاتصال بقاعدة البيانات</p>
          <p className="text-gray-600">{dbStatus.error || 'يرجى التحقق من إعدادات قاعدة البيانات'}</p>
        </div>
      </div>
    );
  }

  if (!botConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">لم يتم العثور على إعدادات البوت</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: Layout, label: 'لوحة التحكم', path: '/dashboard' },
    { icon: Settings, label: 'إعدادات البوت', path: '/dashboard/settings' },
    { icon: Database, label: 'إعدادات قاعدة البيانات', path: '/dashboard/database' },
    { icon: MessageSquare, label: 'تنسيق الرسائل', path: '/dashboard/messages' },
    { icon: FileText, label: 'سجل الأنشطة', path: '/dashboard/activity' },
    { icon: Users, label: 'إدارة المستخدمين', path: '/dashboard/users' }
  ];

  const stats = [
    { label: 'الرسائل اليوم', value: todayMessages },
    { label: 'إجمالي الرسائل', value: messages },
    { label: 'حالة البوت', value: botConfig.isActive ? 'نشط' : 'متوقف', 
      color: botConfig.isActive ? 'text-green-600' : 'text-red-600' }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-right" dir="rtl">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className={`font-bold text-gray-800 ${!isSidebarOpen && 'hidden'}`}>لوحة التحكم</h2>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 p-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors
                ${location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<DashboardHome stats={stats} botConfig={botConfig} />} />
          <Route path="/settings" element={<BotSettings botConfig={botConfig} />} />
          <Route path="/database" element={<DatabaseSettings />} />
          <Route path="/messages" element={<MessageFormat />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </div>
  );
}