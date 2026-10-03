import { useState, type FC, type FormEvent } from 'react';
import {
  X,
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from 'lucide-react';
import type { GoalDetail, GoalStatus, ActionPriority } from '../types';

interface GoalDetailModalProps {
  detail: GoalDetail;
  onClose: () => void;
  onToggleMilestone: (id: string) => void;
  onToggleAction: (id: string) => void;
  onCreateMilestone: (title: string, targetDate: string) => void;
  onCreateAction: (milestoneId: string, title: string, priority: ActionPriority, effort: string, dueDate: string) => void;
  onTransitionStatus: (status: GoalStatus) => void;
  onDeleteGoal: () => void;
}

export const GoalDetailModal: FC<GoalDetailModalProps> = ({
  detail,
  onClose,
  onToggleMilestone,
  onToggleAction,
  onCreateMilestone,
  onCreateAction,
  onTransitionStatus,
  onDeleteGoal,
}) => {
  const { goal, milestones, actions } = detail;

  // New Milestone State
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  // New Action State per Milestone
  const [activeMilestoneForAction, setActiveMilestoneForAction] = useState<string | null>(null);
  const [actionTitle, setActionTitle] = useState('');
  const [actionPriority, setActionPriority] = useState<ActionPriority>('Medium');
  const [actionEffort, setActionEffort] = useState('30m');
  const [actionDueDate, setActionDueDate] = useState('');

  const handleAddMilestoneSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    const target = newMilestoneDate ? new Date(newMilestoneDate).toISOString() : new Date().toISOString();
    onCreateMilestone(newMilestoneTitle.trim(), target);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
    setShowAddMilestone(false);
  };

  const handleAddActionSubmit = (e: FormEvent, milestoneId: string) => {
    e.preventDefault();
    if (!actionTitle.trim()) return;
    onCreateAction(milestoneId, actionTitle.trim(), actionPriority, actionEffort, actionDueDate);
    setActionTitle('');
    setActionDueDate('');
    setActiveMilestoneForAction(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '88vh' }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-active">{goal.status}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progress: {goal.progress}%</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', lineHeight: 1.3 }}>{goal.title}</h2>
          </div>

          <button onClick={onClose} className="btn btn-icon btn-ghost" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Progress bar */}
          <div>
            <div className="progress-bar-container" style={{ height: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${goal.progress}%` }} />
            </div>
          </div>

          {/* FDR §6: The 4 Questions Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                1. What (Outcome)
              </span>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: '0.2rem' }}>{goal.title}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                2. Why (Core Motivation)
              </span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{goal.why}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                3. By When (Target Date)
              </span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {new Date(goal.targetDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                4. How Will I Know I Succeeded?
              </span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{goal.successDefinition}</p>
            </div>
          </div>

          {/* Milestones & Actions Hierarchy (Goal -> Milestones -> Actions) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={18} color="var(--primary)" />
                <span>Milestones & Concrete Actions</span>
              </h3>

              <button
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                <Plus size={15} />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Add Milestone Form */}
            {showAddMilestone && (
              <form
                onSubmit={handleAddMilestoneSubmit}
                className="glass-panel"
                style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>New Checkpoint / Milestone:</span>
                <input
                  type="text"
                  placeholder="e.g. Master Go Concurrency Patterns & Channels"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                  }}
                  required
                />
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                    style={{
                      padding: '0.5rem 0.8rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                    }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Save Milestone
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMilestone(false)}
                    className="btn btn-ghost"
                    style={{ padding: '0.5rem 0.8rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Milestones List */}
            {milestones.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No checkpoints defined yet. Add milestones to break down this outcome.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {milestones.map((m) => {
                  const milestoneActions = actions.filter((a) => a.milestoneId === m.id);
                  const isCompleted = m.status === 'Completed';

                  return (
                    <div
                      key={m.id}
                      className="glass-panel"
                      style={{
                        padding: '1.1rem',
                        borderLeft: isCompleted ? '3px solid var(--success)' : '3px solid var(--border-subtle)',
                      }}
                    >
                      {/* Milestone Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <button
                            onClick={() => onToggleMilestone(m.id)}
                            style={{ color: isCompleted ? 'var(--success)' : 'var(--text-muted)' }}
                            title={isCompleted ? 'Mark incomplete' : 'Mark checkpoint complete'}
                          >
                            {isCompleted ? <CheckCircle2 size={22} color="var(--success)" /> : <Circle size={22} />}
                          </button>
                          <div>
                            <span
                              style={{
                                fontSize: '0.98rem',
                                fontWeight: 600,
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                              }}
                            >
                              {m.title}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                              Target: {new Date(m.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveMilestoneForAction(activeMilestoneForAction === m.id ? null : m.id)}
                          className="btn btn-ghost"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Plus size={14} />
                          <span>Add Action</span>
                        </button>
                      </div>

                      {/* Add Action Form inside Milestone */}
                      {activeMilestoneForAction === m.id && (
                        <form
                          onSubmit={(e) => handleAddActionSubmit(e, m.id)}
                          style={{
                            marginTop: '0.85rem',
                            padding: '0.85rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem',
                          }}
                        >
                          <input
                            type="text"
                            placeholder="What concrete action will you do? (e.g. Implement Kafka worker pool)"
                            value={actionTitle}
                            onChange={(e) => setActionTitle(e.target.value)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-main)',
                              fontSize: '0.85rem',
                            }}
                            required
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <select
                              value={actionPriority}
                              onChange={(e) => setActionPriority(e.target.value as ActionPriority)}
                              style={{
                                padding: '0.4rem 0.6rem',
                                background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)',
                                fontSize: '0.8rem',
                              }}
                            >
                              <option value="Low">Low Priority</option>
                              <option value="Medium">Medium Priority</option>
                              <option value="High">High Priority</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Effort (e.g. 30m, 1h)"
                              value={actionEffort}
                              onChange={(e) => setActionEffort(e.target.value)}
                              style={{
                                width: '90px',
                                padding: '0.4rem 0.6rem',
                                background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)',
                                fontSize: '0.8rem',
                              }}
                            />

                            <input
                              type="date"
                              value={actionDueDate}
                              onChange={(e) => setActionDueDate(e.target.value)}
                              style={{
                                padding: '0.4rem 0.6rem',
                                background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-main)',
                                fontSize: '0.8rem',
                              }}
                            />

                            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveMilestoneForAction(null)}
                              className="btn btn-ghost"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Nested Actions List */}
                      {milestoneActions.length > 0 && (
                        <div style={{ marginTop: '0.85rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {milestoneActions.map((act) => {
                            const actDone = act.status === 'Completed';
                            return (
                              <div
                                key={act.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  fontSize: '0.85rem',
                                  padding: '0.35rem 0',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                  opacity: actDone ? 0.6 : 1,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <button onClick={() => onToggleAction(act.id)} style={{ color: actDone ? 'var(--success)' : 'var(--text-muted)' }}>
                                    {actDone ? <CheckCircle2 size={16} color="var(--success)" /> : <Circle size={16} />}
                                  </button>
                                  <span style={{ textDecoration: actDone ? 'line-through' : 'none' }}>{act.title}</span>
                                  {act.estimatedEffort && <span className="effort-tag">{act.estimatedEffort}</span>}
                                </div>

                                {act.dueDate && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                    {new Date(act.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Goal Lifecycle Management (FDR §11) */}
          <div
            style={{
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Transition Status:</span>
              {(['Active', 'Paused', 'Completed', 'Abandoned'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => onTransitionStatus(st)}
                  className={`btn ${goal.status === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this goal? Completed history and actions will be removed.')) {
                  onDeleteGoal();
                }
              }}
              className="btn btn-ghost"
              style={{ color: 'var(--danger)', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Trash2 size={15} />
              <span>Delete Goal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
