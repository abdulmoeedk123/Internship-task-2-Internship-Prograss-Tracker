const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'completed', 'revise'],
      default: 'not_started',
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },

    // Intern's submitted work
    submission: {
      text: { type: String, default: '' },
      link: { type: String, default: '' },
      submittedAt: { type: Date },
    },

    // Admin feedback
    feedback: {
      text: { type: String, default: '' },
      givenAt: { type: Date },
      givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
