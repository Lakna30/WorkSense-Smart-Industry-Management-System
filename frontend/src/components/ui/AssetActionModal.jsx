import React, { useState } from 'react';
import { HiOutlineX, HiOutlineCheck } from 'react-icons/hi';

export default function AssetActionModal({ isOpen, onClose, asset }) {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'details', name: 'Details' },
                { id: 'maintenance', name: 'Maintenance' },
                { id: 'rental', name: 'Rental' },
                { id: 'financial', name: 'Financial' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="mb-6">
            {activeTab === 'details' && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asset Name</label>
                  <input
                    type="text"
                    defaultValue={asset.name}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <input
                    type="text"
                    defaultValue={asset.type}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    defaultValue={asset.location}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    defaultValue={asset.status}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">In Maintenance</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Maintenance</label>
                    <input
                      type="date"
                      defaultValue={asset.lastMaintenance}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Next Maintenance</label>
                    <input
                      type="date"
                      defaultValue={asset.nextMaintenance}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance History</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {asset.maintenanceHistory?.map((record, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{record.type}</p>
                          <p className="text-sm text-gray-500">{record.date}</p>
                        </div>
                        <p className="text-gray-900">${record.cost.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rental' && (
              <div className="space-y-6">
                {asset.status === 'rented' ? (
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-yellow-800 mb-4">Currently Rented</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-yellow-800">Rented To</label>
                        <input
                          type="text"
                          defaultValue={asset.rentedTo}
                          className="mt-1 block w-full rounded-lg border-yellow-300 bg-yellow-50 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-yellow-800">Until</label>
                        <input
                          type="date"
                          defaultValue={asset.rentedUntil}
                          className="mt-1 block w-full rounded-lg border-yellow-300 bg-yellow-50 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-800 mb-4">Available for Rent</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-green-800">Rent To</label>
                        <input
                          type="text"
                          placeholder="Client/Company Name"
                          className="mt-1 block w-full rounded-lg border-green-300 bg-green-50 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-800">Until</label>
                        <input
                          type="date"
                          className="mt-1 block w-full rounded-lg border-green-300 bg-green-50 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                    <input
                      type="date"
                      defaultValue={asset.purchaseDate}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        defaultValue={asset.purchasePrice?.toLocaleString()}
                        className="block w-full pl-7 rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Costs</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ${asset.maintenanceHistory?.reduce((total, record) => total + record.cost, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Total maintenance costs</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}