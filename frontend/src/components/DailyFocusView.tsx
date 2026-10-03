import { useState, type FC } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import type { ActionItem, Goal, Area } from '../types';
import { ProgressRing } from './UI/ProgressRing';

interface DailyFocusViewProps {
  actions: ActionItem[];
  goals: Goal[];
  areas: Area[];
  onToggleAction: (id: string) => void;
  onOpenNewAction: () => void;
  onSelectGoal: (goalId: string) => void;
}

export const DailyFocusView: FC<DailyFocusViewProps> = ({
  actions,
  goals,
  areas,
  onToggleAction,
  onOpenNewAction,
  onSelectGoal,
}) => {
  const [filter, setFilter] = useState<'pending' | 'all' | 'completed'>('pending');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Primary focus action: highest priority pending action
  const pendingActions = actions.filter((a) => a.status === 'Pending');
  const primeAction =
    pendingActions.find((a) => a.priority === 'High') ||
    pendingActions[0] ||
    actions[0];

  // Associated goal for prime action
  const primeGoal = primeAction ? goals.find((g) => g.id === primeAction.goalId) : null;

  const overdueActions = actions.filter((a) => {
    if (a.status === 'Completed' || !a.dueDate) return false;
    const due = new Date(a.dueDate).toISOString().split('T')[0];
    return due < todayStr;
  });

  const filteredActions = actions.filter((a) => {
    if (filter === 'pending') return a.status === 'Pending';
    if (filter === 'completed') return a.status === 'Completed';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Overdue Warning Notification if needed */}
      {overdueActions.length > 0 && (
        <div
          className="glass-panel"
          style={{
            borderLeft: '4px solid var(--danger)',
            padding: '0.9rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(239, 68, 68, 0.05)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {overdueActions.length} overdue {overdueActions.length === 1 ? 'commitment' : 'commitments'} requiring attention.
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Complete or adjust target dates to maintain execution flow.
          </span>
        </div>
      )}

      {/* Hero Top Grid: Today's Prime Focus & Goal Alignment (Matching Mockup 1) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
        className="daily-focus-hero-grid"
      >
        {/* Today's Prime Focus Card */}
        {primeAction ? (
          <div
            className="glass-panel interactive-card"
            style={{
              padding: '1.75rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(20, 28, 45, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  letterSpacing: '0.02em',
                }}
              >
                Today's Prime Focus
              </span>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      fontSize: '1.45rem',
                      lineHeight: 1.35,
                      fontWeight: 700,
                      marginBottom: '1rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    {primeAction.title}
                  </h2>

                  {/* Connected Goal Pill */}
                  {primeGoal && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <button
                        onClick={() => onSelectGoal(primeGoal.id)}
                        className="badge"
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          cursor: 'pointer',
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                        title="View Goal Roadmap"
                      >
                        Goal: {primeGoal.title}
                      </button>
                    </div>
                  )}

                  {/* Why Quote */}
                  {primeGoal && (
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontStyle: 'normal' }}>
                      <strong style={{ color: 'var(--text-dim)' }}>Why: </strong>
                      {primeGoal.why}
                    </p>
                  )}
                </div>

                {/* Progress Ring */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <ProgressRing progress={primeGoal ? primeGoal.progress : 65} size={92} strokeWidth={8} color="#3b82f6" />
                </div>
              </div>
            </div>

            {/* Quick Action Complete Button */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => onToggleAction(primeAction.id)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
              >
                <CheckCircle2 size={16} color={primeAction.status === 'Completed' ? 'var(--success)' : 'var(--text-muted)'} />
                <span>{primeAction.status === 'Completed' ? 'Marked Complete' : 'Mark Prime Focus Done'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            No prime focus selected. Add an action to start today's focus!
          </div>
        )}

        {/* Goal Alignment Widget (Matching Mockup 1) */}
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', fontWeight: 700 }}>
              Goal Alignment
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {areas.slice(0, 4).map((area) => {
                const areaGoals = goals.filter((g) => g.areaId === area.id);
                const avgProgress =
                  areaGoals.length > 0
                    ? Math.round(areaGoals.reduce((acc, g) => acc + g.progress, 0) / areaGoals.length)
                    : 50;

                return (
                  <div key={area.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{area.name.split('&')[0].trim()}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{avgProgress}%</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 6,
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${avgProgress}%`,
                          backgroundColor: area.color || 'var(--primary)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
              Balanced energy across active life areas
            </span>
          </div>
        </div>
      </div>

      {/* Daily Actions List Section (Matching Mockup 1) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Daily Actions</h2>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {(['pending', 'all', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-full)',
                    background: filter === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: filter === tab ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: filter === tab ? 700 : 500,
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button onClick={onOpenNewAction} className="btn btn-primary" id="btn-add-action-daily">
            <Plus size={16} />
            <span>Add Action</span>
          </button>
        </div>

        {/* Action Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredActions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No actions in this view. Schedule a new action or review your milestone roadmap.
            </div>
          ) : (
            filteredActions.map((action) => {
              const isCompleted = action.status === 'Completed';
              return (
                <div
                  key={action.id}
                  className="glass-panel interactive-card"
                  style={{
                    padding: '0.9rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'var(--bg-surface)',
                    opacity: isCompleted ? 0.65 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    {/* Circle Checkbox */}
                    <button
                      onClick={() => onToggleAction(action.id)}
                      style={{ color: isCompleted ? 'var(--success)' : 'var(--text-dim)', display: 'flex' }}
                      aria-label="Toggle action"
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={22} color="var(--success)" />
                      ) : (
                        <Circle size={22} style={{ strokeWidth: 1.5 }} />
                      )}
                    </button>

                    {/* Priority Pill */}
                    <span
                      className={`badge ${
                        action.priority === 'High'
                          ? 'badge-priority-high'
                          : action.priority === 'Medium'
                          ? 'badge-priority-medium'
                          : 'badge-priority-low'
                      }`}
                    >
                      {action.priority}
                    </span>

                    {/* Effort Chip */}
                    {action.estimatedEffort && (
                      <span className="effort-chip">{action.estimatedEffort}</span>
                    )}

                    {/* Action Title */}
                    <span
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 500,
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        flex: 1,
                      }}
                    >
                      {action.title}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isCompleted ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Completed</span>
                  ) : (
                    action.dueDate && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Due {new Date(action.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .daily-focus-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
