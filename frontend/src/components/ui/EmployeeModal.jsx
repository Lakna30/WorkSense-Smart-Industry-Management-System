import React from 'react';

export default function EmployeeModal({ employee, isOpen, onClose, onEdit, isAdmin = false }) {
  if (!isOpen || !employee) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <img
              src={employee.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
              alt={`${employee.first_name} ${employee.last_name}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-lg text-gray-600">{employee.job_title}</p>
              <p className="text-gray-500">{employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <p className="text-gray-900">{employee.employee_id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{employee.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{employee.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                <p className="text-gray-900">{formatDate(employee.hire_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                <p className="text-gray-900">{formatDate(employee.birth_date)}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          {(employee.address || employee.city || employee.state) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Address</h3>
              <div className="text-gray-900">
                {employee.address && <p>{employee.address}</p>}
                {(employee.city || employee.state || employee.zip_code) && (
                  <p>
                    {[employee.city, employee.state, employee.zip_code].filter(Boolean).join(', ')}
                  </p>
                )}
                {employee.country && <p>{employee.country}</p>}
              </div>
            </div>
          )}

          {/* Skills */}
          {employee.skills && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {employee.skills.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {employee.certifications && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {employee.certifications.split(',').map((cert, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                  >
                    {cert.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {employee.emergency_contact_name && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-gray-900">
                  <span className="font-medium">{employee.emergency_contact_name}</span>
                  {employee.emergency_contact_relationship && (
                    <span className="text-gray-600"> ({employee.emergency_contact_relationship})</span>
                  )}
                </p>
                {employee.emergency_contact_phone && (
                  <p className="text-gray-900">{employee.emergency_contact_phone}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          {isAdmin && (
            <button
              onClick={() => onEdit(employee)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Edit Employee
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
