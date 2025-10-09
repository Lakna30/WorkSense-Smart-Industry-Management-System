import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineAdjustments, HiOutlineClock, 
         HiOutlineLocationMarker, HiOutlineTag, HiOutlineCurrencyDollar, 
         HiOutlineCalendar, HiOutlineClipboardCheck } from 'react-icons/hi';
import AssetActionModal from '../components/ui/AssetActionModal';

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Mock data
  const assets = [
    {
      id: 1,
      name: 'Excavator XL2000',
      type: 'Heavy Equipment',
      status: 'available',
      location: 'Main Warehouse',
      condition: 'Excellent',
      lastMaintenance: '2025-09-15',
      nextMaintenance: '2025-10-15',
      purchaseDate: '2024-05-20',
      purchasePrice: 150000,
      maintenanceHistory: [
        { date: '2025-09-15', type: 'Regular Service', cost: 1200 },
        { date: '2025-08-15', type: 'Oil Change', cost: 500 },
      ]
    },
    {
      id: 2,
      name: 'Forklift F100',
      type: 'Warehouse Equipment',
      status: 'rented',
      location: 'Construction Site A',
      condition: 'Good',
      rentedTo: 'ABC Construction',
      rentedUntil: '2025-11-01',
      lastMaintenance: '2025-09-01',
      nextMaintenance: '2025-10-01',
      purchaseDate: '2024-06-15',
      purchasePrice: 75000,
      maintenanceHistory: [
        { date: '2025-09-01', type: 'Regular Service', cost: 800 },
        { date: '2025-08-01', type: 'Tire Replacement', cost: 1200 },
      ]
    },
    // Add more mock assets as needed
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'available') return matchesSearch && asset.status === 'available';
    if (selectedFilter === 'rented') return matchesSearch && asset.status === 'rented';
    if (selectedFilter === 'maintenance') return matchesSearch && asset.status === 'maintenance';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Asset Management</h1>
          <p className="text-gray-600">Track and manage your company's valuable assets</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Assets', value: assets.length, color: 'bg-blue-500' },
            { label: 'Available', value: assets.filter(a => a.status === 'available').length, color: 'bg-green-500' },
            { label: 'Rented Out', value: assets.filter(a => a.status === 'rented').length, color: 'bg-yellow-500' },
            { label: 'In Maintenance', value: assets.filter(a => a.status === 'maintenance').length, color: 'bg-red-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                  <span className={`text-xl ${stat.color.replace('bg-', 'text-')}`}>
                    {stat.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets by name, type, or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Assets</option>
            <option value="available">Available</option>
            <option value="rented">Rented Out</option>
            <option value="maintenance">In Maintenance</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <HiOutlinePlus className="mr-2" />
            Add New Asset
          </button>
        </div>

        {/* Modals */}
      <AssetActionModal 
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
      />

      {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  asset.status === 'available' ? 'bg-green-100 text-green-800' :
                  asset.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <HiOutlineTag className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{asset.type}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <HiOutlineLocationMarker className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{asset.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <HiOutlineClock className="w-5 h-5 mr-2 text-gray-400" />
                  <span>Next Maintenance: {asset.nextMaintenance}</span>
                </div>

                {asset.status === 'rented' && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center text-yellow-800">
                      <HiOutlineCalendar className="w-5 h-5 mr-2" />
                      <div>
                        <p className="font-medium">{asset.rentedTo}</p>
                        <p className="text-sm">Until: {asset.rentedUntil}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setSelectedAsset(asset);
                        setIsActionModalOpen(true);
                      }}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <HiOutlineAdjustments className="w-4 h-4 mr-2" />
                      Manage
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => console.log('View maintenance history:', asset.id)}
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title="Maintenance History"
                      >
                        <HiOutlineClipboardCheck className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => console.log('View financial details:', asset.id)}
                        className="p-2 text-gray-400 hover:text-gray-500"
                        title="Financial Details"
                      >
                        <HiOutlineCurrencyDollar className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}


