import { useState, type FC, type FormEvent } from 'react';
import { X, Target } from 'lucide-react';
import type { Area, GoalStatus } from '../types';

interface NewGoalModalProps {
  areas: Area[];
  onClose: () => void;
  onCreateGoal: (data: {
    areaId: string;
    title: string;
    why: string;
    targetDate: string;
    successDefinition: string;
    status: GoalStatus;
  }) => void;
}

export const NewGoalModal: FC<NewGoalModalProps> = ({
  areas,
  onClose,
  onCreateGoal,
}) => {
  const [areaId, setAreaId] = useState(areas[0]?.id || '');
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [successDefinition, setSuccessDefinition] = useState('');
  const [status, setStatus] = useState<GoalStatus>('Active');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !why.trim() || !successDefinition.trim() || !targetDate) return;

    onCreateGoal({
      areaId,
      title: title.trim(),
      why: why.trim(),
      targetDate: new Date(targetDate).toISOString(),
      successDefinition: successDefinition.trim(),
      status,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
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
              <Target size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Define Meaningful Outcome</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                FDR Contract: Answer the 4 Essential Questions
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-icon btn-ghost" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Area Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Broad Life Area:
            </label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
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
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question 1: What? */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--primary)' }}>
              1. What outcome are you trying to create?
            </label>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Must represent a tangible outcome, not merely an activity. (e.g., "Become capable of building production-grade Go services")
            </span>
            <input
              type="text"
              placeholder="e.g. Run a 10K road race under 50 minutes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
              }}
              required
            />
          </div>

          {/* Question 2: Why? */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--primary)' }}>
              2. Why does this outcome matter to you?
            </label>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              The core motivation that will sustain execution when friction arises.
            </span>
            <textarea
              rows={2}
              placeholder="e.g. Rebuild cardiovascular endurance and mental stamina for sustained daily energy."
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                resize: 'vertical',
              }}
              required
            />
          </div>

          {/* Question 3: By When? */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--primary)' }}>
                3. By When?
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                }}
              >
                <option value="Active">Active (Part of daily planning)</option>
                <option value="Draft">Draft (Incubating idea)</option>
              </select>
            </div>
          </div>

          {/* Question 4: How will I know? */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--primary)' }}>
              4. How will you know you succeeded?
            </label>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Clear criteria for victory (can be quantitative or qualitative).
            </span>
            <textarea
              rows={2}
              placeholder="e.g. Official race timing mat records < 50:00 without post-race injury."
              value={successDefinition}
              onChange={(e) => setSuccessDefinition(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                resize: 'vertical',
              }}
              required
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-submit-goal">
              Commit Goal to Execution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
