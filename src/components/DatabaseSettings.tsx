
import React, { useState, useEffect } from 'react';
import { DatabaseManager } from '../db';
import { Database, Table, Trash2, Edit2, Plus, Search, Download, Filter, Eye } from 'lucide-react';

export interface DatabaseSettingsProps {}
export const DatabaseSettings: React.FC<DatabaseSettingsProps> = () => {

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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
          { name: 'target_group', type: 'text' },
          { name: 'is_active', type: 'boolean' },
          { name: 'created_at', type: 'timestamp' }
        ]
      },
      {
        name: 'messages',
        columns: [
          { name: 'id', type: 'uuid' },
          { name: 'source_message_id', type: 'bigint' },
          { name: 'content', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'processed_at', type: 'timestamp' }
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
    setSearchTerm('');
    setSortField('');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      console.log('Deleting record:', id);
      // Implementation for delete operation
    }
  };

  const handleAdd = async () => {
    console.log('Adding new record:', formData);
    setShowAddForm(false);
    setFormData({});
  };

  const handleExport = () => {
    const csv = tableData
      .map(row => Object.values(row).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}.csv`;
    a.click();
  };

  const filteredData = tableData.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    return sortDirection === 'asc' ? 
      String(aVal).localeCompare(String(bVal)) :
      String(bVal).localeCompare(String(aVal));
  });

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
              <div className="col-span-1 border-l p-4">
                <h3 className="font-bold mb-4">الجداول</h3>
                <ul className="space-y-2">
                  {tables.map(table => (
                    <li
                      key={table.name}
                      onClick={() => handleTableSelect(table.name)}
                      className={`cursor-pointer p-3 rounded transition-colors ${
                        selectedTable === table.name 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Table size={16} />
                        {table.name}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-3 p-4">
                {selectedTable && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">{selectedTable}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={handleExport}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Download size={20} />
                        </button>
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus size={16} />
                          إضافة سجل
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="بحث..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                      </div>
                      <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
                        <Filter size={16} />
                        تصفية
                      </button>
                    </div>

                    {showAddForm && (
                      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-bold mb-4">إضافة سجل جديد</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {tables.find(t => t.name === selectedTable)?.columns.map(column => (
                            <div key={column.name}>
                              <label className="block mb-1 text-sm font-medium">{column.name}</label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                onChange={e => setFormData({ ...formData, [column.name]: e.target.value })}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 border rounded-lg"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={handleAdd}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                          >
                            حفظ
                          </button>
                        </div>
                      </div>
                    )}

                    {viewMode === 'table' ? (
                      <div className="overflow-x-auto shadow-sm rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              {tables.find(t => t.name === selectedTable)?.columns.map(column => (
                                <th 
                                  key={column.name} 
                                  className="text-right p-3 border-b cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleSort(column.name)}
                                >
                                  <div className="flex items-center gap-1">
                                    {column.name}
                                    {sortField === column.name && (
                                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                  </div>
                                </th>
                              ))}
                              <th className="border-b p-3">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedData.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {tables.find(t => t.name === selectedTable)?.columns.map(column => (
                                  <td key={column.name} className="p-3 border-b">{row[column.name]}</td>
                                ))}
                                <td className="p-3 border-b">
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
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {sortedData.map((row, index) => (
                          <div key={index} className="p-4 border rounded-lg hover:shadow-md">
                            {tables.find(t => t.name === selectedTable)?.columns.map(column => (
                              <div key={column.name} className="mb-2">
                                <span className="font-medium">{column.name}: </span>
                                <span>{row[column.name]}</span>
                              </div>
                            ))}
                            <div className="mt-4 flex gap-2">
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
                          </div>
                        ))}
                      </div>
                    )}
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
