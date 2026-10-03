import { useState, useEffect, useCallback, type FC } from 'react';
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
  TrendingUp,
  RotateCw,
} from 'lucide-react';
import type {
  Goal,
  Area,
  ActionItem,
  PerformanceTrendsResponse,
  TrendPoint,
} from '../types';
import { api } from '../api/client';

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
  const [trends, setTrends] = useState<PerformanceTrendsResponse | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [hoveredCompPoint, setHoveredCompPoint] = useState<TrendPoint | null>(null);
  const [hoveredMsPoint, setHoveredMsPoint] = useState<TrendPoint | null>(null);

  const loadTrends = useCallback(async () => {
    try {
      setTrendsLoading(true);
      const data = await api.getPerformanceTrends();
      setTrends(data);
    } catch (err) {
      console.error('Failed to load performance trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

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

      {/* ------------------------------------------------------------- */}
      {/* GOAL PERFORMANCE TRENDS & UPCOMING CHECKPOINTS (Mockup 1)     */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        {/* Left Column: GOAL PERFORMANCE TRENDS */}
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(20, 28, 45, 0.85))',
          }}
        >
          {/* Header with Title and Sync */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-active" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                  Execution Telemetry
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Velocity & Cadence</span>
              </div>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0,
                }}
              >
                <TrendingUp size={20} color="var(--primary)" />
                <span>Goal Performance Trends</span>
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={loadTrends}
                disabled={trendsLoading}
                className="btn btn-ghost"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}
                title="Refresh telemetry stream"
              >
                <RotateCw size={14} className={trendsLoading ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Dual Charts Grid (Completion % and Milestone Progress) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Chart 1: Completion % */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', textAlign: 'left' }}>
                    Completion %
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textAlign: 'left' }}>
                    System execution velocity
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#06b6d4',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {trends?.averageCompletion ?? 0}%
                </span>
              </div>

              {trends && trends.completionTrends && trends.completionTrends.length > 0 ? (
                (() => {
                  const pts = trends.completionTrends;
                  const leftM = 36;
                  const rightM = 445;
                  const topM = 20;
                  const bottomM = 135;
                  const cW = rightM - leftM;
                  const cH = bottomM - topM;

                  const coords = pts.map((p, i) => {
                    const x = leftM + (i * cW) / Math.max(1, pts.length - 1);
                    const val = Math.max(0, Math.min(100, p.completionRate));
                    const y = bottomM - (val / 100) * cH;
                    return { x, y, point: p };
                  });

                  let pathD = `M ${coords[0].x} ${coords[0].y}`;
                  for (let i = 0; i < coords.length - 1; i++) {
                    const p0 = coords[i];
                    const p1 = coords[i + 1];
                    const cx = (p0.x + p1.x) / 2;
                    pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
                  }

                  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${bottomM} L ${coords[0].x} ${bottomM} Z`;

                  const gridY = [
                    { label: '100', y: topM },
                    { label: '75', y: topM + cH * 0.25 },
                    { label: '50', y: topM + cH * 0.5 },
                    { label: '25', y: topM + cH * 0.75 },
                    { label: '0', y: bottomM },
                  ];

                  return (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <svg
                        viewBox="0 0 460 165"
                        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
                      >
                        <defs>
                          <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                          </linearGradient>
                          <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#06b6d4" floodOpacity="0.8" />
                          </filter>
                        </defs>

                        {/* Grid lines */}
                        {gridY.map((g) => (
                          <g key={g.label}>
                            <text
                              x={leftM - 8}
                              y={g.y + 3.5}
                              textAnchor="end"
                              fontSize="9.5"
                              fill="rgba(255, 255, 255, 0.35)"
                              fontFamily="var(--font-mono, monospace)"
                            >
                              {g.label}
                            </text>
                            <line
                              x1={leftM}
                              y1={g.y}
                              x2={rightM}
                              y2={g.y}
                              stroke="rgba(255, 255, 255, 0.06)"
                              strokeDasharray="3 3"
                            />
                          </g>
                        ))}

                        {/* Area */}
                        <path d={areaD} fill="url(#compGrad)" />

                        {/* Glow Line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#glowCyan)"
                        />

                        {/* Ticks and Dots */}
                        {coords.map((c, i) => {
                          const isHovered = hoveredCompPoint?.date === c.point.date;
                          return (
                            <g key={i}>
                              <text
                                x={c.x}
                                y={bottomM + 18}
                                textAnchor="middle"
                                fontSize="10"
                                fill={isHovered ? '#06b6d4' : 'rgba(255, 255, 255, 0.45)'}
                                fontFamily="var(--font-mono, monospace)"
                                fontWeight={isHovered ? '700' : '400'}
                              >
                                {c.point.label}
                              </text>
                              {isHovered && (
                                <line
                                  x1={c.x}
                                  y1={topM}
                                  x2={c.x}
                                  y2={bottomM}
                                  stroke="#06b6d4"
                                  strokeWidth="1"
                                  strokeDasharray="2 2"
                                  opacity="0.6"
                                />
                              )}
                              <circle
                                cx={c.x}
                                cy={c.y}
                                r={isHovered ? 6 : 4}
                                fill="#0d1422"
                                stroke="#06b6d4"
                                strokeWidth={isHovered ? 3 : 2}
                                onMouseEnter={() => setHoveredCompPoint(c.point)}
                                onMouseLeave={() => setHoveredCompPoint(null)}
                                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {hoveredCompPoint && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '8px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(6, 182, 212, 0.5)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.25rem 0.55rem',
                            fontSize: '0.72rem',
                            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            zIndex: 10,
                          }}
                        >
                          <span style={{ color: 'var(--text-dim)' }}>{hoveredCompPoint.label}:</span>
                          <span style={{ color: '#06b6d4', fontWeight: 800 }}>{hoveredCompPoint.completionRate}%</span>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Loading telemetry stream...
                </div>
              )}
            </div>

            {/* Chart 2: Milestone Progress */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', textAlign: 'left' }}>
                    Milestone Progress
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textAlign: 'left' }}>
                    Checkpoints achievement rate
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#a855f7',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {trends?.completedMilestones ?? 0}/{trends?.totalMilestones ?? 0}
                </span>
              </div>

              {trends && trends.milestoneTrends && trends.milestoneTrends.length > 0 ? (
                (() => {
                  const pts = trends.milestoneTrends;
                  const leftM = 36;
                  const rightM = 445;
                  const topM = 20;
                  const bottomM = 135;
                  const cW = rightM - leftM;
                  const cH = bottomM - topM;

                  const coords = pts.map((p, i) => {
                    const x = leftM + (i * cW) / Math.max(1, pts.length - 1);
                    const val = Math.max(0, Math.min(100, p.milestoneRate));
                    const y = bottomM - (val / 100) * cH;
                    return { x, y, point: p };
                  });

                  let pathD = `M ${coords[0].x} ${coords[0].y}`;
                  for (let i = 0; i < coords.length - 1; i++) {
                    const p0 = coords[i];
                    const p1 = coords[i + 1];
                    const cx = (p0.x + p1.x) / 2;
                    pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
                  }

                  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${bottomM} L ${coords[0].x} ${bottomM} Z`;

                  const gridY = [
                    { label: '100', y: topM },
                    { label: '75', y: topM + cH * 0.25 },
                    { label: '50', y: topM + cH * 0.5 },
                    { label: '25', y: topM + cH * 0.75 },
                    { label: '0', y: bottomM },
                  ];

                  return (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <svg
                        viewBox="0 0 460 165"
                        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
                      >
                        <defs>
                          <linearGradient id="msGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                          </linearGradient>
                          <filter id="glowPurple" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#a855f7" floodOpacity="0.8" />
                          </filter>
                        </defs>

                        {/* Grid lines */}
                        {gridY.map((g) => (
                          <g key={g.label}>
                            <text
                              x={leftM - 8}
                              y={g.y + 3.5}
                              textAnchor="end"
                              fontSize="9.5"
                              fill="rgba(255, 255, 255, 0.35)"
                              fontFamily="var(--font-mono, monospace)"
                            >
                              {g.label}
                            </text>
                            <line
                              x1={leftM}
                              y1={g.y}
                              x2={rightM}
                              y2={g.y}
                              stroke="rgba(255, 255, 255, 0.06)"
                              strokeDasharray="3 3"
                            />
                          </g>
                        ))}

                        {/* Area */}
                        <path d={areaD} fill="url(#msGrad)" />

                        {/* Glow Line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#glowPurple)"
                        />

                        {/* Ticks and Dots */}
                        {coords.map((c, i) => {
                          const isHovered = hoveredMsPoint?.date === c.point.date;
                          return (
                            <g key={i}>
                              <text
                                x={c.x}
                                y={bottomM + 18}
                                textAnchor="middle"
                                fontSize="10"
                                fill={isHovered ? '#a855f7' : 'rgba(255, 255, 255, 0.45)'}
                                fontFamily="var(--font-mono, monospace)"
                                fontWeight={isHovered ? '700' : '400'}
                              >
                                {c.point.label}
                              </text>
                              {isHovered && (
                                <line
                                  x1={c.x}
                                  y1={topM}
                                  x2={c.x}
                                  y2={bottomM}
                                  stroke="#a855f7"
                                  strokeWidth="1"
                                  strokeDasharray="2 2"
                                  opacity="0.6"
                                />
                              )}
                              <circle
                                cx={c.x}
                                cy={c.y}
                                r={isHovered ? 6 : 4}
                                fill="#0d1422"
                                stroke="#a855f7"
                                strokeWidth={isHovered ? 3 : 2}
                                onMouseEnter={() => setHoveredMsPoint(c.point)}
                                onMouseLeave={() => setHoveredMsPoint(null)}
                                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {hoveredMsPoint && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '8px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(168, 85, 247, 0.5)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.25rem 0.55rem',
                            fontSize: '0.72rem',
                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            zIndex: 10,
                          }}
                        >
                          <span style={{ color: 'var(--text-dim)' }}>{hoveredMsPoint.label}:</span>
                          <span style={{ color: '#a855f7', fontWeight: 800 }}>{hoveredMsPoint.milestoneRate}%</span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            ({hoveredMsPoint.completedMilestones} reached)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Loading telemetry stream...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: UPCOMING MILESTONES (Matching Mockup 1) */}
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(20, 28, 45, 0.85))',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.04em' }}>
                Checkpoints Radar
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em', marginTop: '0.2rem', textAlign: 'left', margin: 0 }}>
                Upcoming Milestones
              </h3>
            </div>
            <span
              className="badge badge-active"
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
            >
              {trends?.upcomingMilestones?.length || 0} Queued
            </span>
          </div>

          {(!trends || trends.upcomingMilestones.length === 0) ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              All milestone checkpoints are complete!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {trends.upcomingMilestones.slice(0, 4).map((m) => {
                const isUrgent = m.health === 'Urgent';
                const isAtRisk = m.health === 'At Risk';
                const badgeColor = isUrgent ? 'var(--danger)' : isAtRisk ? 'var(--warning)' : 'var(--success)';
                const badgeBg = isUrgent ? 'rgba(239, 68, 68, 0.15)' : isAtRisk ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
                const badgeBorder = isUrgent ? 'rgba(239, 68, 68, 0.35)' : isAtRisk ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)';

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectGoal(m.goalId)}
                    className="interactive-card"
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `3px solid ${badgeColor}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: badgeColor,
                          background: badgeBg,
                          border: `1px solid ${badgeBorder}`,
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {isUrgent ? <Bell size={10} /> : isAtRisk ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                        {m.health}
                      </span>

                      <span style={{ fontSize: '0.72rem', color: isUrgent ? 'var(--danger)' : 'var(--text-dim)', fontWeight: 600 }}>
                        {m.daysRemaining < 0 ? `${Math.abs(m.daysRemaining)}d overdue` : `${m.daysRemaining}d left`}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3, textAlign: 'left' }}>
                      {m.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: m.areaColor,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.goalTitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
