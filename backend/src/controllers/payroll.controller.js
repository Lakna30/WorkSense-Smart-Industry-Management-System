import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

// Get payroll status for an employee in a specific month
export const getPayrollStatus = async (req, res) => {
  try {
    const { employeeId, month } = req.params;
    
    const status = await db('payroll_status')
      .where('employee_id', employeeId)
      .where('month', month)
      .first();
    
    res.json({
      success: true,
      data: status || { status: 'Pending' }
    });
  } catch (error) {
    console.error('Error getting payroll status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payroll status',
      error: error.message
    });
  }
};

// Update payroll status for an employee in a specific month
export const updatePayrollStatus = async (req, res) => {
  try {
    const { employeeId, month } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['Pending', 'Paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Pending" or "Paid"'
      });
    }
    
    // Check if employee exists
    const employee = await db('employees').where('id', employeeId).first();
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if status already exists
    const existingStatus = await db('payroll_status')
      .where('employee_id', employeeId)
      .where('month', month)
      .first();
    
    let result;
    if (existingStatus) {
      // Update existing status
      [result] = await db('payroll_status')
        .where('employee_id', employeeId)
        .where('month', month)
        .update({ 
          status, 
          updated_at: new Date() 
        })
        .returning('*');
    } else {
      // Create new status
      [result] = await db('payroll_status')
        .insert({
          employee_id: employeeId,
          month,
          status
        })
        .returning('*');
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Payroll status updated successfully'
    });
  } catch (error) {
    console.error('Error updating payroll status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payroll status',
      error: error.message
    });
  }
};

// Get all payroll statuses for a specific month
export const getPayrollStatusesForMonth = async (req, res) => {
  try {
    const { month } = req.params;
    
    const statuses = await db('payroll_status')
      .select('payroll_status.*', 'employees.first_name', 'employees.last_name', 'employees.email')
      .join('employees', 'payroll_status.employee_id', 'employees.id')
      .where('payroll_status.month', month);
    
    res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    console.error('Error getting payroll statuses for month:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payroll statuses',
      error: error.message
    });
  }
};
