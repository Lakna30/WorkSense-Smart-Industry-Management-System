import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

// Get all tasks for a user
export async function getTasks(req, res, next) {
  try {
    const userId = req.user.sub;
    const { page = 1, limit = 20, status, priority, category, search } = req.query;
    
    let query = db('tasks')
      .where('user_id', userId)
      .where('is_archived', false);
    
    // Apply filters
    if (status) query = query.where('status', status);
    if (priority) query = query.where('priority', priority);
    if (category) query = query.where('category', category);
    if (search) {
      query = query.where(function() {
        this.where('title', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`)
            .orWhere('notes', 'ilike', `%${search}%`);
      });
    }
    
    // Get total count for pagination
    const totalCountResult = await query.clone().count('* as count').first();
    const totalCount = parseInt(totalCountResult.count) || 0;
    
    // Apply pagination and ordering
    const tasks = await query
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));
    
    // Parse JSON fields
    const tasksWithParsedData = tasks.map(task => {
      let parsedChecklist = [];
      let parsedAttachments = [];
      
      if (task.checklist) {
        try {
          parsedChecklist = typeof task.checklist === 'string' 
            ? JSON.parse(task.checklist) 
            : task.checklist;
        } catch (error) {
          console.error('Error parsing checklist for task', task.id, ':', error);
          parsedChecklist = [];
        }
      }
      
      if (task.attachments) {
        try {
          parsedAttachments = typeof task.attachments === 'string' 
            ? JSON.parse(task.attachments) 
            : task.attachments;
        } catch (error) {
          console.error('Error parsing attachments for task', task.id, ':', error);
          parsedAttachments = [];
        }
      }
      
      return {
        ...task,
        checklist: parsedChecklist,
        attachments: parsedAttachments
      };
    });
    
    res.json({
      tasks: tasksWithParsedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get task by ID
export async function getTaskById(req, res, next) {
  try {
    const userId = req.user.sub;
    const { taskId } = req.params;
    
    const task = await db('tasks')
      .where('id', taskId)
      .where('user_id', userId)
      .where('is_archived', false)
      .first();
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Parse JSON fields
    let parsedChecklist = [];
    let parsedAttachments = [];
    
    if (task.checklist) {
      try {
        parsedChecklist = typeof task.checklist === 'string' 
          ? JSON.parse(task.checklist) 
          : task.checklist;
      } catch (error) {
        console.error('Error parsing checklist for task', task.id, ':', error);
        parsedChecklist = [];
      }
    }
    
    if (task.attachments) {
      try {
        parsedAttachments = typeof task.attachments === 'string' 
          ? JSON.parse(task.attachments) 
          : task.attachments;
      } catch (error) {
        console.error('Error parsing attachments for task', task.id, ':', error);
        parsedAttachments = [];
      }
    }
    
    const taskWithParsedData = {
      ...task,
      checklist: parsedChecklist,
      attachments: parsedAttachments
    };
    
    res.json({ task: taskWithParsedData });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Create new task
export async function createTask(req, res, next) {
  try {
    const userId = req.user.sub;
    const { title, description, status, priority, due_date, checklist, category, notes, attachments } = req.body;
    
    const newTask = await db('tasks')
      .insert({
        user_id: userId,
        title,
        description,
        status: status || 'pending',
        priority: priority || 'medium',
        due_date,
        checklist: checklist ? JSON.stringify(checklist) : null,
        category,
        notes,
        attachments: attachments ? JSON.stringify(attachments) : null
      })
      .returning('*');
    
    // Parse JSON fields for response
    let parsedChecklist = [];
    let parsedAttachments = [];
    
    if (newTask[0].checklist) {
      try {
        parsedChecklist = typeof newTask[0].checklist === 'string' 
          ? JSON.parse(newTask[0].checklist) 
          : newTask[0].checklist;
      } catch (error) {
        console.error('Error parsing checklist for new task:', error);
        parsedChecklist = [];
      }
    }
    
    if (newTask[0].attachments) {
      try {
        parsedAttachments = typeof newTask[0].attachments === 'string' 
          ? JSON.parse(newTask[0].attachments) 
          : newTask[0].attachments;
      } catch (error) {
        console.error('Error parsing attachments for new task:', error);
        parsedAttachments = [];
      }
    }
    
    const taskWithParsedData = {
      ...newTask[0],
      checklist: parsedChecklist,
      attachments: parsedAttachments
    };
    
    res.status(201).json({
      message: 'Task created successfully',
      task: taskWithParsedData
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Update task
export async function updateTask(req, res, next) {
  try {
    const userId = req.user.sub;
    const { taskId } = req.params;
    const { title, description, status, priority, due_date, checklist, category, notes, attachments } = req.body;
    
    const updateData = {
      title,
      description,
      status,
      priority,
      due_date,
      checklist: checklist ? JSON.stringify(checklist) : null,
      category,
      notes,
      attachments: attachments ? JSON.stringify(attachments) : null,
      updated_at: new Date()
    };
    
    // If status is being changed to completed, set completed_at
    if (status === 'completed') {
      updateData.completed_at = new Date();
    } else if (status !== 'completed') {
      updateData.completed_at = null;
    }
    
    const updatedTask = await db('tasks')
      .where('id', taskId)
      .where('user_id', userId)
      .update(updateData)
      .returning('*');
    
    if (!updatedTask.length) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Parse JSON fields for response
    let parsedChecklist = [];
    let parsedAttachments = [];
    
    if (updatedTask[0].checklist) {
      try {
        parsedChecklist = typeof updatedTask[0].checklist === 'string' 
          ? JSON.parse(updatedTask[0].checklist) 
          : updatedTask[0].checklist;
      } catch (error) {
        console.error('Error parsing checklist for updated task:', error);
        parsedChecklist = [];
      }
    }
    
    if (updatedTask[0].attachments) {
      try {
        parsedAttachments = typeof updatedTask[0].attachments === 'string' 
          ? JSON.parse(updatedTask[0].attachments) 
          : updatedTask[0].attachments;
      } catch (error) {
        console.error('Error parsing attachments for updated task:', error);
        parsedAttachments = [];
      }
    }
    
    const taskWithParsedData = {
      ...updatedTask[0],
      checklist: parsedChecklist,
      attachments: parsedAttachments
    };
    
    res.json({
      message: 'Task updated successfully',
      task: taskWithParsedData
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Delete task
export async function deleteTask(req, res, next) {
  try {
    const userId = req.user.sub;
    const { taskId } = req.params;
    
    const deleted = await db('tasks')
      .where('id', taskId)
      .where('user_id', userId)
      .del();
    
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Archive task
export async function archiveTask(req, res, next) {
  try {
    const userId = req.user.sub;
    const { taskId } = req.params;
    
    const updated = await db('tasks')
      .where('id', taskId)
      .where('user_id', userId)
      .update({ is_archived: true });
    
    if (!updated) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task archived successfully' });
  } catch (error) {
    console.error('Error archiving task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Update checklist item
export async function updateChecklistItem(req, res, next) {
  try {
    const userId = req.user.sub;
    const { taskId } = req.params;
    const { itemId, completed } = req.body;
    
    // Get current task
    const task = await db('tasks')
      .where('id', taskId)
      .where('user_id', userId)
      .first();
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Parse and update checklist
    const checklist = task.checklist ? JSON.parse(task.checklist) : [];
    const updatedChecklist = checklist.map(item => 
      item.id === itemId ? { ...item, completed } : item
    );
    
    // Update task with new checklist
    await db('tasks')
      .where('id', taskId)
      .where('user_id', userId)
      .update({ checklist: JSON.stringify(updatedChecklist) });
    
    res.json({ 
      message: 'Checklist item updated successfully',
      checklist: updatedChecklist
    });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get task statistics
export async function getTaskStats(req, res, next) {
  try {
    const userId = req.user.sub;
    
    const stats = await db('tasks')
      .where('user_id', userId)
      .where('is_archived', false)
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as pending', ['pending']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as in_progress', ['in_progress']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as completed', ['completed']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as cancelled', ['cancelled']),
        db.raw('COUNT(CASE WHEN due_date < ? THEN 1 END) as overdue', [new Date()])
      )
      .first();
    
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
