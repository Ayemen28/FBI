
import React, { useState, useEffect } from 'react';
import { DatabaseManager } from '../db';
import { Database, Table, Trash2, Edit2, Plus } from 'lucide-react';

export type DatabaseSettings = React.FC;

type TableInfo = {
  name: string;
  columns: Array<{
    name: string;
    type: string;
  }>;
};

export const DatabaseSettings: DatabaseSettings = () => {
  const [status, setStatus] = useState({ connected: false, error: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    checkConnection();
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

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

  const loadTables = async () => {
    const db = DatabaseManager.getInstance();
    const tables: TableInfo[] = [
      {
        name: 'bot_configs',
        columns: [
          { name: 'id', type: 'uuid' },
          { name: 'token', type: 'text' },
          { name: 'source_group', type: 'text' },
          { name: 'target_group', type: 'text' }
        ]
      },
      {
        name: 'messages',
        columns: [
          { name: 'id', type: 'uuid' },
          { name: 'source_message_id', type: 'bigint' },
          { name: 'content', type: 'text' },
          { name: 'status', type: 'text' }
        ]
      }
    ];
    setTables(tables);
  };

  const loadTableData = async (tableName: string) => {
    const db = DatabaseManager.getInstance();
    if (tableName === 'messages') {
      const data = await db.fetchChannelData('all');
      setTableData(data);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    // Implementation for delete operation would go here
    console.log('Deleting record:', id);
  };

  const handleAdd = async () => {
    // Implementation for add operation would go here
    console.log('Adding new record:', formData);
    setShowAddForm(false);
    setFormData({});
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
          <div className="space-y-6">
            <div className={`p-4 rounded-lg mb-4 ${status.connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <p className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {status.connected ? 'متصل بقاعدة البيانات' : 'غير متصل بقاعدة البيانات'}
              </p>
              {status.error && <p className="mt-2 text-sm">{status.error}</p>}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 border-l">
                <h3 className="font-bold mb-4">الجداول</h3>
                <ul className="space-y-2">
                  {tables.map(table => (
                    <li
                      key={table.name}
                      onClick={() => handleTableSelect(table.name)}
                      className={`cursor-pointer p-2 rounded ${selectedTable === table.name ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Table size={16} />
                        {table.name}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-3">
                {selectedTable && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold">{selectedTable}</h3>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus size={16} />
                        إضافة سجل جديد
                      </button>
                    </div>

                    {showAddForm && (
                      <div className="mb-4 p-4 border rounded-lg">
                        <h4 className="font-bold mb-4">إضافة سجل جديد</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {tables.find(t => t.name === selectedTable)?.columns.map(column => (
                            <div key={column.name}>
                              <label className="block mb-1 text-sm">{column.name}</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded"
                                onChange={e => setFormData({ ...formData, [column.name]: e.target.value })}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="px-3 py-1 border rounded"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={handleAdd}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            حفظ
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            {tables.find(t => t.name === selectedTable)?.columns.map(column => (
                              <th key={column.name} className="text-right p-2 border-b">{column.name}</th>
                            ))}
                            <th className="border-b">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((row, index) => (
                            <tr key={index}>
                              {tables.find(t => t.name === selectedTable)?.columns.map(column => (
                                <td key={column.name} className="p-2 border-b">{row[column.name]}</td>
                              ))}
                              <td className="p-2 border-b">
                                <div className="flex gap-2">
                                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(row.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
