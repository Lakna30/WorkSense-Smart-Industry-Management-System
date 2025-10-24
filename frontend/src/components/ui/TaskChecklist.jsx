import React, { useState } from 'react';
import { HiOutlineX, HiOutlinePlus, HiOutlineTrash, HiOutlineCheckCircle } from 'react-icons/hi';

export default function TaskChecklist({
  task,
  items,
  onToggle,
  onDelete,
  onAdd,
  onClose,
  saving,
  loading
}) {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  const completedCount = items.filter(item => item.is_completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Task Checklist</h3>
            <p className="text-sm text-gray-600 mt-1">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiOutlineX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{completedCount} of {totalCount} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{progress}% complete</div>
        </div>

        {/* Add New Item */}
        <div className="p-6 border-b border-gray-200">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add new checklist item"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving}
            />
            <button
              type="submit"
              disabled={saving || !newItem.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Add
            </button>
          </form>
        </div>

        {/* Checklist Items */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading checklist...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineCheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No checklist items</h3>
              <p className="text-gray-500">Add items to track task progress</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    item.is_completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => onToggle(item)}
                    disabled={saving}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      item.is_completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {item.is_completed && <HiOutlineCheckCircle className="w-3 h-3" />}
                  </button>
                  
                  <span className={`flex-1 text-sm ${
                    item.is_completed 
                      ? 'line-through text-gray-500' 
                      : 'text-gray-900'
                  }`}>
                    {item.title}
                  </span>
                  
                  <button
                    onClick={() => onDelete(item)}
                    disabled={saving}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {completedCount} of {totalCount} items completed
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}