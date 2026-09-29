const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/interns  (admin only) - list all interns
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const interns = await User.find({ role: 'intern' }).sort({ createdAt: -1 });
  res.json({ interns });
});

// GET /api/interns/:id - admin can view any intern; intern can view self
router.get('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const intern = await User.findOne({ _id: req.params.id, role: 'intern' });
  if (!intern) return res.status(404).json({ message: 'Intern not found' });
  res.json({ intern });
});

// PUT /api/interns/:id  (admin only) - update intern profile
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const updates = { ...req.body };
  delete updates.password; // password changes should go through a dedicated flow
  delete updates.role;

  const intern = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'intern' },
    updates,
    { new: true, runValidators: true }
  );

  if (!intern) return res.status(404).json({ message: 'Intern not found' });
  res.json({ intern });
});

// DELETE /api/interns/:id  (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const intern = await User.findOneAndDelete({ _id: req.params.id, role: 'intern' });
  if (!intern) return res.status(404).json({ message: 'Intern not found' });

  // Clean up tasks belonging to this intern
  await Task.deleteMany({ assignedTo: req.params.id });

  res.json({ message: 'Intern removed' });
});

// GET /api/interns/:id/progress - overall completion % across all assigned tasks
router.get('/:id/progress', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const tasks = await Task.find({ assignedTo: req.params.id });
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const avgProgress = total
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total)
    : 0;

  res.json({ totalTasks: total, completedTasks: completed, avgProgress });
});

module.exports = router;
