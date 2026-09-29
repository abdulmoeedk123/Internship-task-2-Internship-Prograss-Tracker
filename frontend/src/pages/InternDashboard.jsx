import { useEffect, useState } from 'react';
import { ListChecks, CheckCircle2, Clock, Link as LinkIcon } from 'lucide-react';
import api from '../api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';

export default function InternDashboard() {
  const [tasks, setTasks] = useState([]);
  const [drafts, setDrafts] = useState({});

  async function loadTasks() {
    const res = await api.get('/tasks');
    setTasks(res.data.tasks);
  }

  useEffect(() => { loadTasks(); }, []);

  function updateDraft(taskId, field, value) {
    setDrafts((prev) => ({ ...prev, [taskId]: { ...prev[taskId], [field]: value } }));
  }

  async function updateProgress(taskId, progress) {
    await api.put(`/tasks/${taskId}`, { progress, status: 'in_progress' });
    loadTasks();
  }

  async function submitWork(taskId) {
    const draft = drafts[taskId] || {};
    await api.put(`/tasks/${taskId}`, {
      submissionText: draft.text || '',
      submissionLink: draft.link || '',
      status: 'submitted',
      progress: 100,
    });
    loadTasks();
  }

  const overallAvg = tasks.length
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
    : 0;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'not_started' || t.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-[#f7f9f7]">
      <Navbar links={[{ label: 'My Tasks', href: '#', active: true }]} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-ink-900">My Tasks</h1>
          <p className="text-sm text-ink-500">Track your assignments and submit your work.</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Tasks" value={tasks.length} icon={ListChecks} accent="slate" />
          <StatCard label="Pending" value={pendingCount} icon={Clock} accent="amber" />
          <StatCard label="Completed" value={completedCount} icon={CheckCircle2} accent="brand" />
          <div className="card flex flex-col justify-center">
            <p className="mb-1.5 text-sm text-ink-500">Overall Progress</p>
            <ProgressBar value={overallAvg} />
            <p className="mt-1.5 text-right text-xs font-semibold text-brand-700">{overallAvg}%</p>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((t) => (
            <div className="card" key={t._id}>
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900">{t.title}</h3>
                  {t.deadline && (
                    <p className="text-xs text-ink-500">
                      Due {new Date(t.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <StatusBadge status={t.status} />
              </div>

              {t.description && <p className="mb-4 text-sm text-ink-700">{t.description}</p>}

              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-ink-500">
                  <span>Progress</span>
                  <span className="font-semibold text-brand-700">{t.progress}%</span>
                </div>
                <ProgressBar value={t.progress} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={t.progress}
                  onChange={(e) => updateProgress(t._id, Number(e.target.value))}
                  className="mt-2.5 w-full accent-brand-600"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <textarea
                  placeholder="Describe your work / notes"
                  className="field-input min-h-[80px] sm:col-span-2"
                  value={drafts[t._id]?.text ?? t.submission?.text ?? ''}
                  onChange={(e) => updateDraft(t._id, 'text', e.target.value)}
                />
                <div className="relative sm:col-span-2">
                  <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                  <input
                    placeholder="Link to your work (repo, doc, etc.)"
                    className="field-input pl-9"
                    value={drafts[t._id]?.link ?? t.submission?.link ?? ''}
                    onChange={(e) => updateDraft(t._id, 'link', e.target.value)}
                  />
                </div>
              </div>

              <button onClick={() => submitWork(t._id)} className="btn-primary mt-3.5">
                Submit Work
              </button>

              {t.feedback?.text && (
                <div className="mt-4 rounded-lg border-l-4 border-brand-500 bg-brand-50/60 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Admin Feedback</p>
                  <p className="mt-1 text-sm text-ink-700">{t.feedback.text}</p>
                </div>
              )}
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="card text-center text-ink-500">No tasks assigned yet. Check back soon.</div>
          )}
        </div>
      </main>
    </div>
  );
}
