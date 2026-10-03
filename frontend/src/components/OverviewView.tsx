import { type FC } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Bell,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { Goal, Area, ActionItem } from '../types';

interface OverviewViewProps {
  goals: Goal[];
  areas: Area[];
  actions: ActionItem[];
  onSelectGoal: (id: string) => void;
  onOpenNewGoal: () => void;
  onNavigateToTab: (tab: 'goals' | 'daily' | 'templates') => void;
}

export type GoalHealth = 'On Track' | 'At Risk' | 'Lagging' | 'Completed' | 'Paused';

export interface GoalTelemetry {
  goal: Goal;
  area?: Area;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  timeElapsedPct: number;
  overdueActionsCount: number;
  pendingActionsCount: number;
  health: GoalHealth;
}

export const OverviewView: FC<OverviewViewProps> = ({
  goals,
  areas,
  actions,
  onSelectGoal,
  onOpenNewGoal,
  onNavigateToTab,
}) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Compute live telemetry for each goal
  const telemetryList: GoalTelemetry[] = goals.map((goal) => {
    const area = areas.find((a) => a.id === goal.areaId);
    const startDate = new Date(goal.startDate || goal.createdAt);
    const targetDate = new Date(goal.targetDate);

    const totalDays = Math.max(1, Math.round((targetDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    const daysElapsed = Math.max(0, Math.round((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    const daysRemaining = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    const timeElapsedPct = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

    const goalActions = actions.filter((a) => a.goalId === goal.id);
    const pendingActions = goalActions.filter((a) => a.status === 'Pending');
    const overdueActions = pendingActions.filter((a) => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate).toISOString().split('T')[0];
      return due < todayStr;
    });

    let health: GoalHealth = 'On Track';
    if (goal.status === 'Completed') {
      health = 'Completed';
    } else if (goal.status === 'Paused') {
      health = 'Paused';
    } else if (overdueActions.length > 0 || (timeElapsedPct > 70 && goal.progress < 30) || daysRemaining < 0) {
      health = 'Lagging';
    } else if (timeElapsedPct - goal.progress > 15 || (daysRemaining <= 14 && goal.progress < 60)) {
      health = 'At Risk';
    } else {
      health = 'On Track';
    }

    return {
      goal,
      area,
      daysRemaining,
      daysElapsed,
      totalDays,
      timeElapsedPct,
      overdueActionsCount: overdueActions.length,
      pendingActionsCount: pendingActions.length,
      health,
    };
  });

  const activeTelemetry = telemetryList.filter((t) => t.goal.status === 'Active');
  const onTrackCount = activeTelemetry.filter((t) => t.health === 'On Track').length;
  const atRiskCount = activeTelemetry.filter((t) => t.health === 'At Risk').length;
  const laggingCount = activeTelemetry.filter((t) => t.health === 'Lagging').length;
  const totalOverdueAlarms = activeTelemetry.reduce((acc, t) => acc + t.overdueActionsCount, 0);

  const getHealthBadgeStyle = (health: GoalHealth) => {
    switch (health) {
      case 'On Track':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)', icon: CheckCircle2 };
      case 'At Risk':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)', icon: AlertTriangle };
      case 'Lagging':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.35)', icon: Activity };
      case 'Completed':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)', icon: CheckCircle2 };
      case 'Paused':
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8', border: 'rgba(100, 116, 139, 0.35)', icon: Clock };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-active">Fleet Observability & Telemetry</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-Time Goal Health</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'left' }}>
            System Overview & Vital Signs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', textAlign: 'left' }}>
            Track in-flight trajectory, identify lagging commitments, and maintain realistic pacing across life dimensions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateToTab('templates')}
            className="btn btn-secondary"
            style={{ fontSize: '0.84rem' }}
          >
            <Sparkles size={15} color="#fbbf24" />
            <span>Browse Templates</span>
          </button>
          <button
            onClick={onOpenNewGoal}
            className="btn btn-primary"
            style={{ fontSize: '0.84rem' }}
          >
            <Target size={15} />
            <span>Define Goal</span>
          </button>
        </div>
      </div>

      {/* Goal Health Overview Vital Signs (Matching Mockup 1) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* 1. Total Active */}
        <div
          className="glass-panel interactive-card"
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(25, 35, 55, 0.85))',
            borderTop: '3px solid var(--primary)',
          }}
        >
          <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.04em' }}>
            Total Active Goals
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {activeTelemetry.length}
            </span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>in flight</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            {areas.length} Life Dimensions Active
          </div>
        </div>

        {/* 2. On Track */}
        <div
          className="glass-panel interactive-card"
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(16, 185, 129, 0.08))',
            borderTop: '3px solid var(--success)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.04em' }}>
              On Track
            </span>
            <span style={{ color: 'var(--success)' }}>
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.02em' }}>
              {onTrackCount}
            </span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>healthy pace</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Pacing matches target timeline
          </div>
        </div>

        {/* 3. At Risk */}
        <div
          className="glass-panel interactive-card"
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(245, 158, 11, 0.08))',
            borderTop: '3px solid var(--warning)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.04em' }}>
              At Risk
            </span>
            <span style={{ color: 'var(--warning)' }}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)', letterSpacing: '-0.02em' }}>
              {atRiskCount}
            </span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>lagging pace</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Time elapsed outpaces progress
          </div>
        </div>

        {/* 4. Lagging */}
        <div
          className="glass-panel interactive-card"
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(239, 68, 68, 0.08))',
            borderTop: '3px solid var(--danger)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.04em' }}>
              Lagging / Critical
            </span>
            <span style={{ color: 'var(--danger)' }}>
              <Activity size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: laggingCount > 0 ? 'var(--danger)' : 'var(--text-muted)', letterSpacing: '-0.02em' }}>
              {laggingCount}
            </span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>needs focus</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Overdue tasks or stalled progress
          </div>
        </div>

        {/* 5. Overdue Alarms */}
        <div
          className="glass-panel interactive-card"
          style={{
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(6, 182, 212, 0.08))',
            borderTop: '3px solid var(--info)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.04em' }}>
              Overdue Alarms
            </span>
            <span style={{ color: 'var(--info)' }}>
              <Bell size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: totalOverdueAlarms > 0 ? 'var(--danger)' : 'var(--info)', letterSpacing: '-0.02em' }}>
              {totalOverdueAlarms}
            </span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>alarms</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            Actions past their scheduled date
          </div>
        </div>
      </div>

      {/* Active Goals Monitor Telemetry Matrix (Matching Mockup 1) */}
      <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'left' }}>
              Active Goals Telemetry Monitor
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'left' }}>
              Pacing analysis: comparing elapsed time against execution completion.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('goals')}
            className="btn btn-ghost"
            style={{ fontSize: '0.82rem', color: 'var(--primary)' }}
          >
            <span>Open Goal Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {activeTelemetry.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No active goals monitored. Adopt a proven template or define a custom goal to start telemetry!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeTelemetry.map((t) => {
              const badge = getHealthBadgeStyle(t.health);
              const BadgeIcon = badge.icon;
              const isOverdue = t.daysRemaining < 0;

              return (
                <div
                  key={t.goal.id}
                  onClick={() => onSelectGoal(t.goal.id)}
                  className="interactive-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                        {t.area && (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: t.area.color,
                              background: `${t.area.color}15`,
                              border: `1px solid ${t.area.color}35`,
                              padding: '0.15rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Layers size={11} />
                            {t.area.name}
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: badge.text,
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                            padding: '0.15rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <BadgeIcon size={12} />
                          {t.health}
                        </span>

                        {t.overdueActionsCount > 0 && (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#ef4444',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              padding: '0.15rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Bell size={11} />
                            {t.overdueActionsCount} {t.overdueActionsCount === 1 ? 'Alarm' : 'Alarms'}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.35rem', textAlign: 'left' }}>
                        {t.goal.title}
                      </h3>

                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'left', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{t.goal.why}"
                      </p>
                    </div>

                    {/* Right Telemetry Snapshot */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>
                      {/* Days Remaining Countdown */}
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Target Countdown
                        </span>
                        <span
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: isOverdue ? 'var(--danger)' : 'var(--text-main)',
                          }}
                        >
                          {isOverdue ? `${Math.abs(t.daysRemaining)}d Overdue` : `${t.daysRemaining}d Left`}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>
                          Due {new Date(t.goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Completion Percentage */}
                      <div style={{ textAlign: 'right', minWidth: '70px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Progress
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {t.goal.progress}%
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>
                          {t.pendingActionsCount} pending tasks
                        </span>
                      </div>

                      <ChevronRight size={18} color="var(--text-dim)" />
                    </div>
                  </div>

                  {/* Dual Telemetry Progress Bars (Time Elapsed vs Execution) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      <span>
                        Time Elapsed: <strong>{t.daysElapsed} of {t.totalDays} days</strong> ({t.timeElapsedPct}%)
                      </span>
                      <span>
                        Completion: <strong style={{ color: 'var(--primary)' }}>{t.goal.progress}%</strong>
                      </span>
                    </div>

                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: 8,
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Execution Progress Bar */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${t.goal.progress}%`,
                          background: 'var(--primary-gradient)',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.4s ease',
                          zIndex: 2,
                        }}
                      />

                      {/* Ghost Time Marker */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${t.timeElapsedPct}%`,
                          background: 'rgba(255, 255, 255, 0.15)',
                          zIndex: 1,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
