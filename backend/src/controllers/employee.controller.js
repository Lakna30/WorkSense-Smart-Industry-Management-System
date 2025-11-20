import knex from 'knex';
import knexConfig from '../../knexfile.js';
import { v2 as cloudinary } from 'cloudinary';

const db = knex(knexConfig.development);

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
    const {
      first_name,
      last_name,
      email,
      job_title,
      department,
      gender,
      position,
      salary,
      rfid_uid,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      hire_date,
      birth_date,
      address,
      city,
      state,
      zip_code,
      country
    } = req.body;

    // ✅ Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'job_title', 'department'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // ✅ Check if email already exists
    const existingEmployee = await db('employees').where('email', email).first();
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // ✅ Check if RFID UID already exists (if provided)
    if (rfid_uid) {
      const existingUID = await db('employees').where('rfid_uid', rfid_uid).first();
      if (existingUID) {
        return res.status(400).json({
          success: false,
          message: 'RFID UID already assigned to another employee'
        });
      }
    }

    // ✅ Handle uploaded photo (if any) - upload to Cloudinary if configured
    let photo_url = null;
    if (req.file) {
      try {
        const folder = process.env.CLOUDINARY_FOLDER || 'worksense/employees';
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, res) => (error ? reject(error) : resolve(res))
          );
          stream.end(req.file.buffer);
        });
        photo_url = result.secure_url;
      } catch (_) {/* fallback below */}
    }
    // Fallback: if client sent a direct URL in photo_url string, accept it
    if (!photo_url && typeof req.body.photo_url === 'string' && req.body.photo_url) {
      photo_url = req.body.photo_url;
    }

    // ✅ Prepare data to insert
    const employeeData = {
      first_name,
      last_name,
      email,
      job_title,
      department,
      gender,
      position,
      salary,
      rfid_uid: rfid_uid || null,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      hire_date: hire_date || null,
      birth_date: birth_date || null,
      address,
      city,
      state,
      zip_code,
      country,
      photo_url,
      is_active: true,
      created_at: new Date()
    };

    // ✅ Insert into database
    const [newEmployee] = await db('employees').insert(employeeData).returning('*');

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
    
    // Image update handling
    if (req.file) {
      try {
        const folder = process.env.CLOUDINARY_FOLDER || 'worksense/employees';
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, res) => (error ? reject(error) : resolve(res))
          );
          stream.end(req.file.buffer);
        });
        updateData.photo_url = result.secure_url;
      } catch (e) {
        // ignore cloud upload error and continue without changing photo
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
