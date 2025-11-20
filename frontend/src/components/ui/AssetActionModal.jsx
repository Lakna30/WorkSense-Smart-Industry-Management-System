import React, { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineCheck } from 'react-icons/hi';

export default function AssetActionModal({ isOpen, onClose, asset, onSave }) {
  const isAddMode = !asset;
  const [form, setForm] = useState({
    name: '',
    type: '',
    status: 'available',
    location: '',
    condition: '',
    nextMaintenance: '',
    // Add other fields as needed
  });

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name || '',
        type: asset.type || '',
        status: asset.status || 'available',
        location: asset.location || '',
        condition: asset.condition || '',
        nextMaintenance: asset.nextMaintenance || '',
        // ...other fields...
      });
    } else {
      setForm({
        name: '',
        type: '',
        status: 'available',
        location: '',
        condition: '',
        nextMaintenance: '',
        // ...other fields...
      });
    }
  }, [asset, isOpen]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (onSave) onSave(form);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">
          {isAddMode ? 'Add New Asset' : 'Asset Details'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
              disabled={!isAddMode && !onSave}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
              disabled={!isAddMode && !onSave}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
              disabled={!isAddMode && !onSave}
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
              disabled={!isAddMode && !onSave}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Condition</label>
            <input
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
              disabled={!isAddMode && !onSave}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Next Maintenance</label>
            <input
              name="nextMaintenance"
              type="date"
              value={form.nextMaintenance}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
              disabled={!isAddMode && !onSave}
            />
          </div>
          {/* Add more fields as needed */}
          {isAddMode && (
            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
            >
              Save Asset
            </button>
          )}
        </form>
      </div>
    </div>
  );
}