import React from 'react';

export default function TaskFilters({
  employees,
  selectedEmployee,
  setSelectedEmployee,
  selectedPriority,
  setSelectedPriority,
  onClear
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Employee Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Employee
        </label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name || `${employee.first_name} ${employee.last_name}`}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Priority
        </label>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      <div className="flex items-end">
        <button
          onClick={onClear}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}