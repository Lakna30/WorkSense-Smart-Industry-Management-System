import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

// ✅ Get all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await db('schedules')
      .leftJoin('employees', 'schedules.employee_id', 'employees.id')
      .select(
        'schedules.id',
        'schedules.title',
        'schedules.description',
        'schedules.deadline',
        'schedules.priority',
        'schedules.status',
        'employees.first_name',
        'employees.last_name'
      )
      .orderBy('schedules.deadline', 'asc');

    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
  }
};

// ✅ Create new schedule
export const createSchedule = async (req, res) => {
  try {
    const { title, description, employee_id, deadline, priority } = req.body;

    if (!title || !employee_id || !deadline) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const [newSchedule] = await db('schedules')
      .insert({ title, description, employee_id, deadline, priority })
      .returning('*');

    res.status(201).json({
      success: true,
      data: newSchedule,
      message: 'Schedule created successfully'
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to create schedule' });
  }
};

// ✅ Update schedule status or details
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await db('schedules').where('id', id).first();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const [updated] = await db('schedules')
      .where('id', id)
      .update(updateData)
      .returning('*');

    res.json({ success: true, data: updated, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
};

// ✅ Delete schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db('schedules').where('id', id).first();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await db('schedules').where('id', id).del();
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to delete schedule' });
  }
};

// ✅ Get employee list for dropdown
export const getEmployeeList = async (req, res) => {
  try {
    const employees = await db('employees')
      .select('id', 'first_name', 'last_name')
      .where('is_active', true)
      .orderBy('first_name', 'asc');

    res.json({
      success: true,
      data: employees.map(e => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name}`
      }))
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employees' });
  }
};

// ✅ Checklist helpers
export const getChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await db('schedule_checklist_items')
      .where('schedule_id', id)
      .orderBy([{ column: 'position', order: 'asc' }, { column: 'id', order: 'asc' }]);

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch checklist' });
  }
};

export const addChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const schedule = await db('schedules').where('id', id).first();
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const [{ maxPosition }] = await db('schedule_checklist_items')
      .where('schedule_id', id)
      .max({ maxPosition: 'position' });

    const nextPosition =
      maxPosition !== null && maxPosition !== undefined
        ? Number(maxPosition) + 1
        : 0;

    const [item] = await db('schedule_checklist_items')
      .insert({
        schedule_id: id,
        title,
        position: nextPosition
      })
      .returning('*');

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Error adding checklist item:', error);
    res.status(500).json({ success: false, message: 'Failed to add checklist item' });
  }
};

export const updateChecklistItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const updateData = req.body;

    const existing = await db('schedule_checklist_items')
      .where({ id: itemId, schedule_id: id })
      .first();

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }

    const [updated] = await db('schedule_checklist_items')
      .where('id', itemId)
      .update({ ...updateData, updated_at: db.fn.now() })
      .returning('*');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ success: false, message: 'Failed to update checklist item' });
  }
};

export const deleteChecklistItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const deleted = await db('schedule_checklist_items')
      .where({ id: itemId, schedule_id: id })
      .del();

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }

    res.json({ success: true, message: 'Checklist item deleted' });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete checklist item' });
  }
};
