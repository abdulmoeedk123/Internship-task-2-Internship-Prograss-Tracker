import { useEffect, useState } from 'react';
import {
  Users, ListChecks, CheckCircle2, Clock, Plus, Trash2, MessageSquare, X,
} from 'lucide-react';
import api from '../api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';

export default function AdminDashboard() {
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState('');
  const [error, setError] = useState('');
  const [showOnboard, setShowOnboard] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [feedbackTask, setFeedbackTask] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const [onboard, setOnboard] = useState({
    name: '', email: '', password: '', department: '', mentor: '',
  });
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', assignedTo: '', deadline: '',
  });

  async function loadInterns() {
    const res = await api.get('/interns');
    setInterns(res.data.interns);
  }

  async function loadTasks() {
    const params = selectedIntern ? { internId: selectedIntern } : {};
    const res = await api.get('/tasks', { params });
    setTasks(res.data.tasks);
  }

  useEffect(() => { loadInterns(); }, []);
  useEffect(() => { loadTasks(); /* eslint-disable-next-line */ }, [selectedIntern]);

  async function handleOnboard(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/onboard', onboard);
      setOnboard({ name: '', email: '', password: '', department: '', mentor: '' });
      setShowOnboard(false);
      loadInterns();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to onboard intern');
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tasks', taskForm);
      setTaskForm({ title: '', description: '', assignedTo: '', deadline: '' });
      setShowTaskForm(false);
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  }

  async function submitFeedback() {
    if (!feedbackTask) return;
    await api.put(`/tasks/${feedbackTask._id}`, { feedback: feedbackText });
    setFeedbackTask(null);
    setFeedbackText('');
    loadTasks();
  }

  async function markStatus(taskId, status) {
    await api.put(`/tasks/${taskId}`, { status });
    loadTasks();
  }

  async function removeIntern(id) {
    if (!window.confirm('Remove this intern and all their tasks?')) return;
    await api.delete(`/interns/${id}`);
    loadInterns();
    loadTasks();
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-[#f7f9f7]">
      <Navbar links={[{ label: 'Dashboard', href: '#', active: true }]} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
            <p className="text-sm text-ink-500">Manage interns, assign tasks, and review progress.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowOnboard(true)} className="btn-secondary">
              <Users size={16} /> Onboard Intern
            </button>
            <button onClick={() => setShowTaskForm(true)} className="btn-primary">
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Interns" value={interns.length} icon={Users} accent="brand" />
          <StatCard label="Total Tasks" value={tasks.length} icon={ListChecks} accent="slate" />
          <StatCard label="In Progress" value={inProgressCount} icon={Clock} accent="amber" />
          <StatCard label="Completed" value={completedCount} icon={CheckCircle2} accent="brand" />
        </div>

        {/* Interns table */}
        <section className="card mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">Interns</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-ink-500">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {interns.map((i) => (
                  <tr key={i._id}>
                    <td className="py-3 font-medium text-ink-900">{i.name}</td>
                    <td className="py-3 text-ink-500">{i.email}</td>
                    <td className="py-3 text-ink-500">{i.department || '—'}</td>
                    <td className="py-3"><StatusBadge status={i.status} /></td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => removeIntern(i._id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        title="Remove intern"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {interns.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-ink-500">No interns onboarded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tasks table */}
        <section className="card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-ink-900">Tasks</h2>
            <select
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              className="field-input w-auto py-2 text-sm"
            >
              <option value="">All interns</option>
              {interns.map((i) => (
                <option key={i._id} value={i._id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-ink-500">
                  <th className="pb-3 font-semibold">Task</th>
                  <th className="pb-3 font-semibold">Intern</th>
                  <th className="pb-3 font-semibold">Deadline</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Progress</th>
                  <th className="pb-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.map((t) => (
                  <tr key={t._id}>
                    <td className="py-3 font-medium text-ink-900">{t.title}</td>
                    <td className="py-3 text-ink-500">{t.assignedTo?.name}</td>
                    <td className="py-3 text-ink-500">
                      {t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3"><StatusBadge status={t.status} /></td>
                    <td className="py-3 w-32"><ProgressBar value={t.progress} size="sm" /></td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => { setFeedbackTask(t); setFeedbackText(t.feedback?.text || ''); }}
                          className="rounded-lg p-2 text-ink-500 hover:bg-slate-50"
                          title="Give feedback"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => markStatus(t._id, 'completed')}
                          className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"
                          title="Mark complete"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-ink-500">No tasks found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Onboard modal */}
      {showOnboard && (
        <Modal title="Onboard New Intern" onClose={() => setShowOnboard(false)}>
          <form onSubmit={handleOnboard} className="space-y-3.5">
            <Field label="Full name" value={onboard.name} onChange={(v) => setOnboard({ ...onboard, name: v })} required />
            <Field label="Email" type="email" value={onboard.email} onChange={(v) => setOnboard({ ...onboard, email: v })} required />
            <Field label="Temporary password" value={onboard.password} onChange={(v) => setOnboard({ ...onboard, password: v })} required />
            <Field label="Department" value={onboard.department} onChange={(v) => setOnboard({ ...onboard, department: v })} />
            <Field label="Mentor" value={onboard.mentor} onChange={(v) => setOnboard({ ...onboard, mentor: v })} />
            <button type="submit" className="btn-primary w-full">Add Intern</button>
          </form>
        </Modal>
      )}

      {/* New task modal */}
      {showTaskForm && (
        <Modal title="Assign New Task" onClose={() => setShowTaskForm(false)}>
          <form onSubmit={handleCreateTask} className="space-y-3.5">
            <Field label="Task title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} required />
            <div>
              <label className="field-label">Description</label>
              <textarea
                className="field-input mt-1.5 min-h-[80px]"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Assign to</label>
              <select
                className="field-input mt-1.5"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                required
              >
                <option value="">Select intern...</option>
                {interns.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
            </div>
            <Field label="Deadline" type="date" value={taskForm.deadline} onChange={(v) => setTaskForm({ ...taskForm, deadline: v })} />
            <button type="submit" className="btn-primary w-full">Create Task</button>
          </form>
        </Modal>
      )}

      {/* Feedback modal */}
      {feedbackTask && (
        <Modal title={`Feedback — ${feedbackTask.title}`} onClose={() => setFeedbackTask(null)}>
          <textarea
            className="field-input min-h-[120px]"
            placeholder="Write feedback for this intern's submission..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <button onClick={submitFeedback} className="btn-primary mt-3.5 w-full">Send Feedback</button>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type={type}
        className="field-input mt-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-500 hover:bg-slate-50">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
