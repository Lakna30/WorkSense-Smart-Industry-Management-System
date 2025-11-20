import React, { useState, useEffect } from 'react';

export default function EmployeeForm({ employee, onSubmit, onCancel, departments = [], jobTitles = [] }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    photo_url: null,
    gender: '',
    department: '',
    position: '',
    salary: '',
    job_title: '',
    rfid_uid: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    hire_date: '',
    birth_date: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form for editing
  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        photo_url: employee.photo_url || null,
        gender: employee.gender || '',
        department: employee.department || '',
        position: employee.position || '',
        salary: employee.salary || '',
        job_title: employee.job_title || '',
        rfid_uid: employee.rfid_uid || '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        emergency_contact_relationship: employee.emergency_contact_relationship || '',
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
        birth_date: employee.birth_date ? employee.birth_date.split('T')[0] : '',
        address: employee.address || '',
        city: employee.city || '',
        state: employee.state || '',
        zip_code: employee.zip_code || '',
        country: employee.country || ''
      });
    }
  }, [employee]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Basic validations
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.department?.trim()) newErrors.department = 'Department is required';
    if (!formData.job_title?.trim()) newErrors.job_title = 'Job title is required';
    
    // Numeric field validation
    if (formData.salary && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Salary must be a valid number';
    }
    
    // Phone number validation (if provided)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Emergency contact phone validation (if provided)
    if (formData.emergency_contact_phone && !/^[0-9+\-\s()]+$/.test(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = 'Please enter a valid phone number';
    }
    
    // Date validations
    const today = new Date();
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      if (birthDate > today) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      }
    }
    
    if (formData.hire_date) {
      const hireDate = new Date(formData.hire_date);
      if (hireDate > today) {
        newErrors.hire_date = 'Hire date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler (builds FormData)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Create a new FormData object
    const formDataToSend = new FormData();
    
    // Process each form field
    Object.entries(formData).forEach(([key, value]) => {
      // Skip null or undefined values
      if (value === null || value === undefined) {
        return;
      }

      // Handle file uploads
      if (key === 'photo_url') {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (typeof value === 'string' && value) {
          formDataToSend.append(key, value);
        }
      } 
      // Convert salary to number
      else if (key === 'salary') {
        formDataToSend.append(key, Number(value) || 0);
      }
      // Handle date fields
      else if (key.endsWith('_date')) {
        if (value && value.trim()) {
          formDataToSend.append(key, new Date(value).toISOString().split('T')[0]);
        }
        // Skip empty date fields - let them be null in the database
      }
      // Handle other fields
      else {
        formDataToSend.append(key, value);
      }
    });

    // Call the parent's onSubmit handler with the processed form data
    onSubmit(formDataToSend);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] p-8 relative animate-slideUp overflow-y-auto">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 transform duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">{employee ? 'Edit Employee' : 'Add Employee'}</h2>
        <p className="text-gray-600 mb-6">Fill out the employee details below</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Photo</label>
                <input
                  type="file"
                  name="photo_url"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer"
                />
                {formData.photo_url && (
                  typeof formData.photo_url === 'string' ? (
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="mt-2 w-20 h-20 object-cover rounded-full border border-gray-200"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(formData.photo_url)}
                      alt="Preview"
                      className="mt-2 w-20 h-20 object-cover rounded-full border border-gray-200"
                    />
                  )
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP/Postal Code</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship</label>
                <input
                  type="text"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                >
                  <option value="">Select Department</option>
                  {(departments.length ? departments : ['HR','IT','Sales','Marketing','Finance']).map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineer, HR Manager"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">RFID UID</label>
                <input
                  type="text"
                  name="rfid_uid"
                  value={formData.rfid_uid}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890ABCD"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">Unique identifier for RFID card</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="number"
                  name="salary"
                  min="0"
                  value={formData.salary}
                  onChange={(e) => {
                    const value = Math.max(0, e.target.value);
                    handleChange({ target: { name: 'salary', value } });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
}
