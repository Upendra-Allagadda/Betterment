import { useState, type FC } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Plus,
  Flame,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { ActionItem, Goal } from '../types';

interface DailyFocusViewProps {
  actions: ActionItem[];
  goals: Goal[];
  onToggleAction: (id: string) => void;
  onOpenNewAction: () => void;
  onSelectGoal: (goalId: string) => void;
}

export const DailyFocusView: FC<DailyFocusViewProps> = ({
  actions,
  goals,
  onToggleAction,
  onOpenNewAction,
  onSelectGoal,
}) => {
  const [filter, setFilter] = useState<'pending' | 'all' | 'completed'>('pending');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

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

  const completedTodayCount = actions.filter(
    (a) => a.status === 'Completed' && a.completedAt && new Date(a.completedAt).toISOString().split('T')[0] === todayStr
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(14, 20, 34, 0.95), rgba(26, 35, 60, 0.8))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-active">Execution Mode</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>What should I focus on today?</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '600px' }}>
              Everyday actions connected to meaningful outcomes. Execute with focus, avoid task accumulation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onOpenNewAction} className="btn btn-primary" id="btn-add-action-daily">
              <Plus size={18} />
              <span>Add Action</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={16} color="var(--primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Focus</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{actions.filter((a) => a.status === 'Pending').length}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={16} color="var(--success)" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed Today</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>{completedTodayCount}</p>
            </div>
          </div>

          {overdueActions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={16} color="var(--danger)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overdue Needs Care</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)' }}>{overdueActions.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overdue Action Banner (FDR §8, §14) */}
      {overdueActions.length > 0 && (
        <div
          className="glass-panel"
          style={{
            borderLeft: '4px solid var(--danger)',
            padding: '1.1rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(239, 68, 68, 0.05)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertTriangle size={22} color="var(--danger)" />
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                {overdueActions.length} Overdue {overdueActions.length === 1 ? 'Action' : 'Actions'} Requiring Attention
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Commitments fallen behind schedule. Either complete or adjust realistic dates to prevent execution fatigue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
          {(['pending', 'all', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`btn ${filter === tab ? 'btn-secondary' : 'btn-ghost'}`}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: filter === tab ? 700 : 500,
                borderColor: filter === tab ? 'var(--primary)' : undefined,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredActions.length} {filter} {filteredActions.length === 1 ? 'action' : 'actions'}
        </span>
      </div>

      {/* Action List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredActions.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <CheckCircle2 size={42} color="var(--success)" style={{ opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.2rem' }}>No pending actions in daily view</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px' }}>
              {filter === 'completed'
                ? 'No completed actions logged yet for this period.'
                : 'All daily focus items are up to date! Create a new action or review your goal milestones.'}
            </p>
            <button onClick={onOpenNewAction} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Plus size={16} />
              <span>Schedule Next Action</span>
            </button>
          </div>
        ) : (
          filteredActions.map((action) => {
            const isCompleted = action.status === 'Completed';
            const isOverdue =
              !isCompleted &&
              action.dueDate &&
              new Date(action.dueDate).toISOString().split('T')[0] < todayStr;

            return (
              <div
                key={action.id}
                className="glass-panel interactive-card"
                style={{
                  padding: '1.1rem 1.35rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  opacity: isCompleted ? 0.65 : 1,
                  borderLeft: isOverdue
                    ? '3px solid var(--danger)'
                    : action.priority === 'High'
                    ? '3px solid var(--warning)'
                    : '3px solid transparent',
                }}
              >
                {/* 1-Click Completion Checkbox (FDR §8: minimal friction) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                  <button
                    onClick={() => onToggleAction(action.id)}
                    aria-label={`Toggle action: ${action.title}`}
                    style={{
                      marginTop: '0.15rem',
                      color: isCompleted ? 'var(--success)' : 'var(--text-muted)',
                      transition: 'transform var(--transition-fast)',
                    }}
                    title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={24} color="var(--success)" />
                    ) : (
                      <Circle size={24} style={{ strokeWidth: 1.75 }} />
                    )}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                        }}
                      >
                        {action.title}
                      </span>

                      {action.estimatedEffort && (
                        <span className="effort-tag">{action.estimatedEffort}</span>
                      )}

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

                      {isOverdue && <span className="badge badge-overdue">Overdue</span>}
                    </div>

                    {/* Traceability Breadcrumb (FDR §12 Principle 4: Context everywhere) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-dim)',
                        flexWrap: 'wrap',
                      }}
                    >
                      {action.areaName && (
                        <span style={{ color: action.areaColor || 'var(--primary)', fontWeight: 600 }}>
                          {action.areaName}
                        </span>
                      )}
                      {action.goalTitle && (
                        <>
                          <ChevronRight size={12} />
                          <span
                            onClick={() => onSelectGoal(action.goalId)}
                            style={{
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              textDecoration: 'underline dotted',
                            }}
                            title="View Goal Details"
                          >
                            {action.goalTitle}
                          </span>
                        </>
                      )}
                      {action.milestoneTitle && (
                        <>
                          <ChevronRight size={12} />
                          <span>{action.milestoneTitle}</span>
                        </>
                      )}
                    </div>

                    {action.notes && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {action.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Due Date Indicator */}
                {action.dueDate && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
                      fontWeight: isOverdue ? 700 : 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Due {new Date(action.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Active Goals Needing Attention (FDR §8) */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Flame size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem' }}>Active Outcomes in Motion</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {goals
            .filter((g) => g.status === 'Active')
            .map((goal) => (
              <div
                key={goal.id}
                onClick={() => onSelectGoal(goal.id)}
                className="glass-panel interactive-card"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-active">{goal.status}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {goal.progress}%
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', lineHeight: 1.35 }}>{goal.title}</h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  "{goal.why}"
                </p>

                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
