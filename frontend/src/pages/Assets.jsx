import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineAdjustments, HiOutlineClock, 
         HiOutlineLocationMarker, HiOutlineTag, HiOutlineCurrencyDollar, 
         HiOutlineCalendar, HiOutlineClipboardCheck, HiOutlineDocumentDownload,
         HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh,
         HiOutlineFilter, HiOutlineViewGrid, HiOutlineViewList,
         HiOutlineCog, HiOutlineChartBar, HiOutlinePrinter, HiOutlineTrendingUp,
         HiOutlineTrendingDown, HiOutlineCheckCircle,
         HiOutlineXCircle, HiOutlineSelector, HiOutlineDuplicate, HiOutlineArchive,
         HiOutlineChartPie, HiOutlineTable, HiOutlineDocumentReport } from 'react-icons/hi';
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { FaBuilding, FaTools, FaCar, FaLaptop, FaChair, FaDesktop, FaChartLine } from 'react-icons/fa';
import AssetActionModal from '../components/ui/AssetActionModal';
import api from '../lib/api.js';
import { exportAssetsToPDF } from '../utils/pdfExport.js';

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'type', 'status', 'location'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Backend integration states
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assets from backend (authenticated)
  useEffect(() => {
    async function fetchAssets() {
      setLoading(true);
      try {
        const { data } = await api.get('/assets');
        setAssets(data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch assets');
      }
      setLoading(false);
    }
    fetchAssets();
  }, []);

  // Add new asset to backend (authenticated)
  async function handleAddAsset(newAsset) {
    try {
      const { data } = await api.post('/assets', newAsset);
      setAssets(prev => [...prev, data.data]);
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Error adding asset: ' + (err.response?.data?.message || err.message));
    }
  }

  // Get icon for asset type
  const getAssetTypeIcon = (type) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('building') || typeLower.includes('office')) return <FaBuilding className="w-5 h-5" />;
    if (typeLower.includes('tool') || typeLower.includes('equipment')) return <FaTools className="w-5 h-5" />;
    if (typeLower.includes('vehicle') || typeLower.includes('car')) return <FaCar className="w-5 h-5" />;
    if (typeLower.includes('laptop') || typeLower.includes('computer')) return <FaLaptop className="w-5 h-5" />;
    if (typeLower.includes('chair') || typeLower.includes('furniture')) return <FaChair className="w-5 h-5" />;
    if (typeLower.includes('desktop') || typeLower.includes('monitor')) return <FaDesktop className="w-5 h-5" />;
    return <HiOutlineTag className="w-5 h-5" />;
  };

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await exportAssetsToPDF(filteredAssets, {
        total: assets.length,
        available: assets.filter(a => a.status === 'available').length,
        rented: assets.filter(a => a.status === 'rented').length,
        maintenance: assets.filter(a => a.status === 'maintenance').length
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle asset actions
  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
    setIsActionModalOpen(true);
  };

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setIsActionModalOpen(true);
  };

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await api.delete(`/assets/${assetId}`);
        setAssets(prev => prev.filter(asset => asset.id !== assetId));
      } catch (err) {
        alert('Error deleting asset: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Bulk operations
  const handleSelectAsset = (assetId) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedAssets.length === 0) return;
    
    try {
      switch (bulkAction) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedAssets.length} assets?`)) {
            await Promise.all(selectedAssets.map(id => api.delete(`/assets/${id}`)));
            setAssets(prev => prev.filter(asset => !selectedAssets.includes(asset.id)));
            setSelectedAssets([]);
            setShowBulkActions(false);
          }
          break;
        case 'status':
          // Update status for selected assets
          await Promise.all(selectedAssets.map(id => 
            api.put(`/assets/${id}`, { status: 'maintenance' })
          ));
          setAssets(prev => prev.map(asset => 
            selectedAssets.includes(asset.id) 
              ? { ...asset, status: 'maintenance' }
              : asset
          ));
          setSelectedAssets([]);
          setShowBulkActions(false);
          break;
        case 'export':
          const selectedAssetsData = assets.filter(asset => selectedAssets.includes(asset.id));
          await exportAssetsToPDF(selectedAssetsData, {
            total: selectedAssetsData.length,
            available: selectedAssetsData.filter(a => a.status === 'available').length,
            rented: selectedAssetsData.filter(a => a.status === 'rented').length,
            maintenance: selectedAssetsData.filter(a => a.status === 'maintenance').length
          });
          break;
      }
    } catch (err) {
      alert('Error performing bulk action: ' + (err.response?.data?.message || err.message));
    }
  };

  // Analytics functions
  const generateAnalyticsData = () => {
    const total = assets.length;
    const available = assets.filter(a => a.status === 'available').length;
    const rented = assets.filter(a => a.status === 'rented').length;
    const maintenance = assets.filter(a => a.status === 'maintenance').length;
    
    // Asset type distribution
    const typeDistribution = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1;
      return acc;
    }, {});
    
    // Location distribution
    const locationDistribution = assets.reduce((acc, asset) => {
      acc[asset.location] = (acc[asset.location] || 0) + 1;
      return acc;
    }, {});
    
    // Maintenance due soon
    const maintenanceDue = assets.filter(asset => {
      if (!asset.next_maintenance) return false;
      const maintenanceDate = new Date(asset.next_maintenance);
      const today = new Date();
      const diffTime = maintenanceDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= 0;
    });
    
    return {
      total,
      available,
      rented,
      maintenance,
      typeDistribution,
      locationDistribution,
      maintenanceDue: maintenanceDue.length,
      utilizationRate: total > 0 ? Math.round(((total - available) / total) * 100) : 0
    };
  };

  const handleShowAnalytics = () => {
    setAnalyticsData(generateAnalyticsData());
    setShowAnalytics(true);
  };

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

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Assets', 
              value: assets.length, 
              color: 'bg-blue-500',
              icon: <HiOutlineChartBar className="w-6 h-6" />,
              trend: '+12%'
            },
            { 
              label: 'Available', 
              value: assets.filter(a => a.status === 'available').length, 
              color: 'bg-green-500',
              icon: <HiOutlineCheckCircle className="w-6 h-6" />,
              trend: '+5%'
            },
            { 
              label: 'Rented Out', 
              value: assets.filter(a => a.status === 'rented').length, 
              color: 'bg-yellow-500',
              icon: <HiOutlineCalendar className="w-6 h-6" />,
              trend: '+8%'
            },
            { 
              label: 'In Maintenance', 
              value: assets.filter(a => a.status === 'maintenance').length, 
              color: 'bg-red-500',
              icon: <HiOutlineExclamationTriangle className="w-6 h-6" />,
              trend: '-3%'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                  <span className={`text-xl ${stat.color.replace('bg-', 'text-')}`}>
                    {stat.icon}
                  </span>
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <HiOutlineTrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && analyticsData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Asset Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiOutlineXCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Utilization Rate</p>
                    <p className="text-2xl font-bold text-blue-900">{analyticsData.utilizationRate}%</p>
                  </div>
                  <FaChartLine className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Maintenance Due</p>
                    <p className="text-2xl font-bold text-yellow-900">{analyticsData.maintenanceDue}</p>
                  </div>
                  <HiOutlineClock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Asset Types</p>
                    <p className="text-2xl font-bold text-green-900">{Object.keys(analyticsData.typeDistribution).length}</p>
                  </div>
                  <HiOutlineTag className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Types Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.typeDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{type}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / analyticsData.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.locationDistribution).map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{location}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(count / analyticsData.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets by name, type, or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <HiOutlineFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">All Assets</option>
                  <option value="available">Available</option>
                  <option value="rented">Rented Out</option>
                  <option value="maintenance">In Maintenance</option>
                </select>
              </div>

              <div className="relative">
                <select
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="type">Sort by Type</option>
                  <option value="status">Sort by Status</option>
                  <option value="location">Sort by Location</option>
                </select>
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <HiOutlineRefresh className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <HiOutlineViewGrid className="w-4 h-4 mr-2" />
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <HiOutlineViewList className="w-4 h-4 mr-2" />
                List View
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleShowAnalytics}
                className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <HiOutlineChartPie className="w-4 h-4 mr-2" />
                Analytics
              </button>

              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <HiOutlineRefresh className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <HiOutlineDocumentDownload className="w-4 h-4 mr-2" />
                )}
                {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <HiOutlinePlus className="w-4 h-4 mr-2" />
                Add Asset
              </button>
            </div>
          </div>
        </div>

        {/* Add Asset Modal (example, you may need to implement this) */}
        {isAddModalOpen && (
          <AssetActionModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleAddAsset}
            asset={null}
          />
        )}

        {/* Modals */}
        <AssetActionModal 
          isOpen={isActionModalOpen}
          onClose={() => {
            setIsActionModalOpen(false);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
        />

        {/* Loading/Error States */}
        {loading && <div className="text-center py-8 text-gray-500">Loading assets...</div>}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}

        {/* Bulk Operations */}
        {selectedAssets.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HiOutlineSelector className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-blue-700 font-medium">
                  {selectedAssets.length} asset{selectedAssets.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-blue-200 rounded-lg text-sm"
                >
                  <option value="">Select Action</option>
                  <option value="status">Mark as Maintenance</option>
                  <option value="export">Export Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Execute
                </button>
                <button
                  onClick={() => {
                    setSelectedAssets([]);
                    setBulkAction('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assets Display */}
        {!loading && !error && (
          <>
            {/* Select All Header */}
            {filteredAssets.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                      onChange={handleSelectAll}
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({filteredAssets.length} assets)
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedAssets.length} of {filteredAssets.length} selected
                  </div>
                </div>
              </div>
            )}

            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group ${
                  viewMode === 'list' ? 'flex items-center justify-between' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => handleSelectAsset(asset.id)}
                          className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          {getAssetTypeIcon(asset.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                          <p className="text-sm text-gray-500">{asset.type}</p>
                        </div>
                      </div>
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
                        <HiOutlineLocationMarker className="w-5 h-5 mr-2 text-gray-400" />
                        <span>{asset.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <HiOutlineClock className="w-5 h-5 mr-2 text-gray-400" />
                        <span>Next Maintenance: {asset.next_maintenance || 'Not scheduled'}</span>
                      </div>

                      {asset.status === 'rented' && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center text-yellow-800">
                            <HiOutlineCalendar className="w-5 h-5 mr-2" />
                            <div>
                              <p className="font-medium">{asset.rented_to || 'Unknown'}</p>
                              <p className="text-sm">Until: {asset.rented_until || 'Unknown'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handleViewAsset(asset)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            <HiOutlineEye className="w-4 h-4 mr-2" />
                            View
                          </button>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="p-2 text-gray-400 hover:text-blue-500"
                              title="Edit Asset"
                            >
                              <HiOutlinePencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => console.log('View maintenance history:', asset.id)}
                              className="p-2 text-gray-400 hover:text-green-500"
                              title="Maintenance History"
                            >
                              <HiOutlineClipboardCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => console.log('View financial details:', asset.id)}
                              className="p-2 text-gray-400 hover:text-yellow-500"
                              title="Financial Details"
                            >
                              <HiOutlineCurrencyDollar className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="p-2 text-gray-400 hover:text-red-500"
                              title="Delete Asset"
                            >
                              <HiOutlineTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={() => handleSelectAsset(asset.id)}
                        className="mr-4 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                        {getAssetTypeIcon(asset.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            asset.status === 'available' ? 'bg-green-100 text-green-800' :
                            asset.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <HiOutlineTag className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="mr-4">{asset.type}</span>
                          <HiOutlineLocationMarker className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{asset.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewAsset(asset)}
                        className="p-2 text-gray-400 hover:text-blue-500"
                        title="View Asset"
                      >
                        <HiOutlineEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditAsset(asset)}
                        className="p-2 text-gray-400 hover:text-blue-500"
                        title="Edit Asset"
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => console.log('View maintenance history:', asset.id)}
                        className="p-2 text-gray-400 hover:text-green-500"
                        title="Maintenance History"
                      >
                        <HiOutlineClipboardCheck className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        title="Delete Asset"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            </div>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
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


