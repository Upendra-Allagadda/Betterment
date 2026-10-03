import { useState, type FC } from 'react';
import {
  Plus,
  Calendar,
  Compass,
  HelpCircle,
} from 'lucide-react';
import type { Area, Goal, GoalStatus } from '../types';

interface GoalsViewProps {
  goals: Goal[];
  areas: Area[];
  onSelectGoal: (id: string) => void;
  onOpenNewGoal: () => void;
  onTransitionStatus: (id: string, status: GoalStatus) => void;
}

export const GoalsView: FC<GoalsViewProps> = ({
  goals,
  areas,
  onSelectGoal,
  onOpenNewGoal,
  onTransitionStatus,
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredGoals = goals.filter((g) => {
    if (selectedAreaId !== 'all' && g.areaId !== selectedAreaId) return false;
    if (selectedStatus !== 'all' && g.status !== selectedStatus) return false;
    return true;
  });

  const getArea = (areaId: string) => areas.find((a) => a.id === areaId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-active">Define & Plan</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Outcomes & Commitments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '600px' }}>
            Transform intentions into measurable outcomes structured by Area, Milestones, and daily Actions.
          </p>
        </div>

        <button onClick={onOpenNewGoal} className="btn btn-primary" id="btn-create-goal">
          <Plus size={18} />
          <span>Define New Goal</span>
        </button>
      </div>

      {/* Area Selector Filter Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setSelectedAreaId('all')}
          className={`btn ${selectedAreaId === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
        >
          All Areas ({goals.length})
        </button>
        {areas.map((area) => {
          const count = goals.filter((g) => g.areaId === area.id).length;
          const isSelected = selectedAreaId === area.id;
          return (
            <button
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-full)',
                borderColor: isSelected ? undefined : area.color,
                color: isSelected ? '#fff' : 'var(--text-main)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: area.color,
                  marginRight: 4,
                }}
              />
              {area.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Status Filter Selector */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Lifecycle Status:</span>
        {(['all', 'Active', 'Draft', 'Paused', 'Completed', 'Abandoned'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`btn ${selectedStatus === st ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-full)',
              borderColor: selectedStatus === st ? 'var(--primary)' : undefined,
              fontWeight: selectedStatus === st ? 700 : 500,
            }}
          >
            {st === 'all' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      {/* Goal Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {filteredGoals.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              gridColumn: '1 / -1',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Compass size={40} color="var(--primary)" style={{ opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.15rem' }}>No goals found matching criteria</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Create your first goal to begin the Define → Plan → Execute loop.
            </p>
            <button onClick={onOpenNewGoal} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Plus size={16} />
              <span>Define New Goal</span>
            </button>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const area = getArea(goal.areaId);
            const targetDateStr = new Date(goal.targetDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={goal.id}
                className="glass-panel interactive-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  cursor: 'pointer',
                  borderTop: area ? `3px solid ${area.color}` : '3px solid var(--primary)',
                }}
                onClick={() => onSelectGoal(goal.id)}
              >
                {/* Header: Area & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {area ? (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: area.color,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {area.name}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>General</span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className={`badge ${
                        goal.status === 'Active'
                          ? 'badge-active'
                          : goal.status === 'Completed'
                          ? 'badge-completed'
                          : goal.status === 'Paused'
                          ? 'badge-paused'
                          : 'badge-priority-low'
                      }`}
                    >
                      {goal.status}
                    </span>

                    {/* Quick status dropdown */}
                    <select
                      value={goal.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onTransitionStatus(goal.id, e.target.value as GoalStatus)}
                      style={{
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        padding: '0.1rem 0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Paused">Paused</option>
                      <option value="Completed">Completed</option>
                      <option value="Abandoned">Abandoned</option>
                    </select>
                  </div>
                </div>

                {/* Outcome Title (What) */}
                <div>
                  <h2 style={{ fontSize: '1.18rem', lineHeight: 1.35, marginBottom: '0.35rem' }}>
                    {goal.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    <strong style={{ color: 'var(--text-dim)' }}>Why: </strong>
                    {goal.why}
                  </p>
                </div>

                {/* Success Definition Snapshot (How will I know) */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <HelpCircle size={13} color="var(--primary)" />
                    <span>Success Definition:</span>
                  </div>
                  <p style={{ lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {goal.successDefinition}
                  </p>
                </div>

                {/* Progress & Target Date */}
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      Target: {targetDateStr}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{goal.progress}%</span>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
