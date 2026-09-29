const express = require('express');
const Task = require('../models/Task');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks - admin sees all (optionally filtered by intern), intern sees own
router.get('/', authenticate, async (req, res) => {
  const filter = {};

  if (req.user.role === 'intern') {
    filter.assignedTo = req.user.id;
  } else if (req.query.internId) {
    filter.assignedTo = req.query.internId;
  }

  if (req.query.status) filter.status = req.query.status;

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({ tasks });
});

// GET /api/tasks/:id
router.get('/:id', authenticate, async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (req.user.role === 'intern' && String(task.assignedTo._id) !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json({ task });
});

// POST /api/tasks  (admin only) - create/assign a task
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, assignedTo, deadline } = req.body;
    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assignedTo are required' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      deadline,
      createdBy: req.user.id,
    });

    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/tasks/:id - admin can edit anything; intern can only update status/progress/submission on own task
router.put('/:id', authenticate, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const isOwner = String(task.assignedTo) === req.user.id;
  if (req.user.role === 'intern' && !isOwner) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.user.role === 'admin') {
    // Admin can update task details and give feedback
    const { title, description, deadline, status, feedback } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (deadline !== undefined) task.deadline = deadline;
    if (status !== undefined) task.status = status;
    if (feedback !== undefined) {
      task.feedback = {
        text: feedback,
        givenAt: new Date(),
        givenBy: req.user.id,
      };
    }
  } else {
    // Intern can update progress, status (limited), and submission
    const { progress, status, submissionText, submissionLink } = req.body;
    if (progress !== undefined) task.progress = Math.max(0, Math.min(100, progress));
    if (status !== undefined && ['in_progress', 'submitted'].includes(status)) {
      task.status = status;
    }
    if (submissionText !== undefined || submissionLink !== undefined) {
      task.submission = {
        text: submissionText ?? task.submission.text,
        link: submissionLink ?? task.submission.link,
        submittedAt: new Date(),
      };
      if (task.status === 'not_started') task.status = 'in_progress';
    }
  }

  await task.save();
  res.json({ task });
});

// DELETE /api/tasks/:id  (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
