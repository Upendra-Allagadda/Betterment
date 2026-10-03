import { useState, useEffect, type FC, type FormEvent } from 'react';
import { X, CheckSquare } from 'lucide-react';
import type { Goal, Milestone, ActionPriority } from '../types';
import { api } from '../api/client';

interface NewActionModalProps {
  goals: Goal[];
  onClose: () => void;
  onActionCreated: () => void;
}

export const NewActionModal: FC<NewActionModalProps> = ({
  goals,
  onClose,
  onActionCreated,
}) => {
  const activeGoals = goals.filter((g) => g.status === 'Active');
  const [selectedGoalId, setSelectedGoalId] = useState(activeGoals[0]?.id || '');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('Medium');
  const [effort, setEffort] = useState('30m');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  // Load milestones when goal changes
  useEffect(() => {
    if (!selectedGoalId) return;
    setLoadingMilestones(true);
    api
      .getGoalDetail(selectedGoalId)
      .then((detail) => {
        setMilestones(detail.milestones);
        if (detail.milestones.length > 0) {
          setSelectedMilestoneId(detail.milestones[0].id);
        } else {
          setSelectedMilestoneId('');
        }
      })
      .catch((err) => console.error('Failed to load milestones:', err))
      .finally(() => setLoadingMilestones(false));
  }, [selectedGoalId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedGoalId || !selectedMilestoneId) return;

    try {
      await api.createAction({
        goalId: selectedGoalId,
        milestoneId: selectedMilestoneId,
        title: title.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        priority,
        estimatedEffort: effort.trim(),
        notes: notes.trim(),
      });
      onActionCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create action:', err);
      alert('Failed to create action: ' + (err as Error).message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px' }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.4rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckSquare size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Add Concrete Action</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                FDR §9: Actions must remain traceable to parent milestone & goal
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-icon btn-ghost" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Goal Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Parent Outcome / Goal:
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
              }}
              required
            >
              {activeGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Milestone Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Parent Checkpoint / Milestone:
            </label>
            {loadingMilestones ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading milestones...</p>
            ) : milestones.length === 0 ? (
              <div style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--danger)' }}>
                This goal has no milestones yet. Please add a milestone in the Goal Details view first!
              </div>
            ) : (
              <select
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                }}
                required
              >
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Action Description:
            </label>
            <input
              type="text"
              placeholder="e.g. Implement Kafka consumer worker pool using Sarama"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
              }}
              required
            />
          </div>

          {/* Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Priority:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActionPriority)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Estimated Effort:
              </label>
              <input
                type="text"
                placeholder="e.g. 30m, 1h, 2h"
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Due Date:
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Execution Notes / Invariants (optional):
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Reference Sarama consumer group docs; ensure context cancellation is tested."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={milestones.length === 0}
              className="btn btn-primary"
              id="btn-submit-action"
            >
              Add to Daily Focus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
