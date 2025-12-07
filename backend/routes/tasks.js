import express from 'express';
import Task from '../models/Task.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes here require authentication
router.use(authMiddleware);

// GET /api/tasks - list tasks with optional status and search filters
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { user: req.user.id };

    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    } else {
      // By default, exclude "done" tasks unless explicitly requested
      query.status = { $ne: 'done' };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { description: regex }];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    return res.status(500).json({ message: 'Failed to load tasks.' });
  }
});

// POST /api/tasks - create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      status: status || 'todo',
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ message: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id - update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, status } = req.body;

    const task = await Task.findOne({ _id: id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    await task.save();
    return res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ message: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id - delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.json({ message: 'Task deleted.' });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
});

export default router;


