import knex from '../../knexfile.js';

const db = knex.development;

export const getAllEmployees = async (req, res) => {
  try {
    const { search, department, role } = req.query;
    
    let query = db('employees').select('*').where('is_active', true);
    
    // Search by name or email
    if (search) {
      query = query.where(function() {
        this.where('first_name', 'ilike', `%${search}%`)
          .orWhere('last_name', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`);
      });
    }
    
    // Filter by department
    if (department) {
      query = query.where('department', department);
    }
    
    // Filter by job title
    if (role) {
      query = query.where('job_title', 'ilike', `%${role}%`);
    }
    
    const employees = await query.orderBy('first_name', 'asc');
    
    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await db('employees')
      .select('*')
      .where('id', id)
      .where('is_active', true)
      .first();
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'job_title', 'department'];
    for (const field of requiredFields) {
      if (!employeeData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // Check if email already exists
    const existingEmployee = await db('employees')
      .where('email', employeeData.email)
      .first();
    
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }
    
    const [newEmployee] = await db('employees')
      .insert(employeeData)
      .returning('*');
    
    res.status(201).json({
      success: true,
      data: newEmployee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if employee exists
    const existingEmployee = await db('employees')
      .where('id', id)
      .where('is_active', true)
      .first();
    
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if email is being updated and if it conflicts with another employee
    if (updateData.email && updateData.email !== existingEmployee.email) {
      const emailConflict = await db('employees')
        .where('email', updateData.email)
        .where('id', '!=', id)
        .first();
      
      if (emailConflict) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists for another employee'
        });
      }
    }
    
    const [updatedEmployee] = await db('employees')
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    res.json({
      success: true,
      data: updatedEmployee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if employee exists
    const existingEmployee = await db('employees')
      .where('id', id)
      .where('is_active', true)
      .first();
    
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Soft delete - set is_active to false
    await db('employees')
      .where('id', id)
      .update({ is_active: false });
    
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await db('employees')
      .select('department')
      .where('is_active', true)
      .distinct()
      .orderBy('department', 'asc');
    
    const departmentList = departments.map(dept => dept.department);
    
    res.json({
      success: true,
      data: departmentList
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    });
  }
};

export const getJobTitles = async (req, res) => {
  try {
    const jobTitles = await db('employees')
      .select('job_title')
      .where('is_active', true)
      .distinct()
      .orderBy('job_title', 'asc');
    
    const titleList = jobTitles.map(job => job.job_title);
    
    res.json({
      success: true,
      data: titleList
    });
  } catch (error) {
    console.error('Error fetching job titles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job titles',
      error: error.message
    });
  }
};
