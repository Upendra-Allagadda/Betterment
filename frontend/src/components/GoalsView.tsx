import { useState, useEffect, type FC } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Layers,
} from 'lucide-react';
import type { Goal, Area, GoalDetail, GoalStatus } from '../types';
import { api } from '../api/client';

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
  onOpenNewGoal,
  onTransitionStatus,
}) => {
  const activeGoals = goals.filter((g) => g.status === 'Active');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(activeGoals[0]?.id || goals[0]?.id || '');
  const [goalDetail, setGoalDetail] = useState<GoalDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // New action modal inside milestone
  const [newActionMilestoneId, setNewActionMilestoneId] = useState<string | null>(null);
  const [actionTitle, setActionTitle] = useState('');

  // Load selected goal detail
  const loadGoalDetail = async (id: string) => {
    if (!id) return;
    try {
      setLoadingDetail(true);
      const detail = await api.getGoalDetail(id);
      setGoalDetail(detail);
    } catch (err) {
      console.error('Failed to load goal detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedGoalId) {
      loadGoalDetail(selectedGoalId);
    }
  }, [selectedGoalId]);

  const currentGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];
  const currentArea = currentGoal ? areas.find((a) => a.id === currentGoal.areaId) : null;

  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      await api.toggleMilestone(milestoneId);
      if (selectedGoalId) loadGoalDetail(selectedGoalId);
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const handleToggleAction = async (actionId: string) => {
    try {
      await api.toggleAction(actionId);
      if (selectedGoalId) loadGoalDetail(selectedGoalId);
    } catch (err) {
      console.error('Failed to toggle action:', err);
    }
  };

  const handleCreateAction = async (milestoneId: string) => {
    if (!actionTitle.trim() || !selectedGoalId) return;
    try {
      await api.createAction({
        goalId: selectedGoalId,
        milestoneId,
        title: actionTitle.trim(),
        priority: 'Medium',
        estimatedEffort: '45m',
      });
      setActionTitle('');
      setNewActionMilestoneId(null);
      loadGoalDetail(selectedGoalId);
    } catch (err) {
      console.error('Failed to add action:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Goal Switcher & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {goals.map((g) => {
            const isSelected = g.id === selectedGoalId;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGoalId(g.id)}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 4px 12px var(--primary-glow)' : 'none',
                }}
              >
                {g.title.length > 32 ? g.title.substring(0, 30) + '...' : g.title}
              </button>
            );
          })}
        </div>

        <button onClick={onOpenNewGoal} className="btn btn-primary" id="btn-define-new-goal">
          <Plus size={16} />
          <span>Define New Goal</span>
        </button>
      </div>

      {currentGoal ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header Title & Badges (Matching Mockup 2) */}
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              {currentGoal.title}
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {currentArea && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.25rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <Layers size={13} />
                  <span>{currentArea.name}</span>
                </span>
              )}

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                }}
              >
                <Calendar size={13} />
                <span>
                  Target: {new Date(currentGoal.targetDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </span>

              <select
                value={currentGoal.status}
                onChange={(e) => onTransitionStatus(currentGoal.id, e.target.value as GoalStatus)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
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

          {/* Goal Contract Card (4 Distinct Quadrants - Matching Mockup 2) */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              background: 'var(--bg-surface)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Goal Contract
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* 1. WHAT */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem 1.1rem',
                }}
              >
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  1. WHAT (Outcome)
                </span>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.4rem', lineHeight: 1.45 }}>
                  {currentGoal.title}
                </p>
              </div>

              {/* 2. WHY */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem 1.1rem',
                }}
              >
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  2. WHY (Motivation)
                </span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.45 }}>
                  {currentGoal.why}
                </p>
              </div>

              {/* 3. BY WHEN */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem 1.1rem',
                }}
              >
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  3. BY WHEN
                </span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.4rem', lineHeight: 1.45 }}>
                  {new Date(currentGoal.targetDate).toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* 4. SUCCESS DEFINITION */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem 1.1rem',
                }}
              >
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  4. SUCCESS DEFINITION
                </span>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.45 }}>
                  {currentGoal.successDefinition}
                </p>
              </div>
            </div>
          </div>

          {/* Milestone Journey Roadmap (Matching Mockup 2) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Milestone journey roadmap</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progress: {currentGoal.progress}%</span>
            </div>

            {loadingDetail ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading roadmap...</div>
            ) : goalDetail && goalDetail.milestones.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  overflowX: 'auto',
                  paddingBottom: '1rem',
                  alignItems: 'flex-start',
                }}
              >
                {goalDetail.milestones.map((ms, index) => {
                  const isDone = ms.status === 'Completed';
                  const isActive = !isDone && (index === 0 || goalDetail.milestones[index - 1]?.status === 'Completed');
                  const milestoneActions = goalDetail.actions.filter((a) => a.milestoneId === ms.id);

                  return (
                    <div
                      key={ms.id}
                      className="glass-panel"
                      style={{
                        minWidth: '240px',
                        maxWidth: '280px',
                        flex: '1 0 240px',
                        padding: '1.25rem',
                        background: isDone
                          ? 'rgba(16, 185, 129, 0.04)'
                          : isActive
                          ? 'rgba(59, 130, 246, 0.06)'
                          : 'var(--bg-surface)',
                        border: isDone
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : isActive
                          ? '1px solid rgba(59, 130, 246, 0.5)'
                          : '1px solid var(--border-subtle)',
                        boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.15)' : 'none',
                        position: 'relative',
                      }}
                    >
                      {/* Checkpoint Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <button
                            onClick={() => handleToggleMilestone(ms.id)}
                            style={{ color: isDone ? 'var(--success)' : 'var(--text-dim)', display: 'flex' }}
                            title={isDone ? 'Mark incomplete' : 'Mark checkpoint complete'}
                          >
                            {isDone ? (
                              <CheckCircle2 size={20} color="var(--success)" />
                            ) : (
                              <Circle size={20} style={{ strokeWidth: 1.5 }} />
                            )}
                          </button>
                          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.35 }}>
                            {ms.title}
                          </span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        {isDone ? (
                          <span style={{ fontSize: '0.76rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={13} /> Done
                          </span>
                        ) : isActive ? (
                          <span style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 700 }}>
                            Active Step
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>Upcoming</span>
                        )}
                      </div>

                      {/* Milestone Actions List */}
                      {milestoneActions.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.6rem' }}>
                          {milestoneActions.map((act) => (
                            <div
                              key={act.id}
                              onClick={() => handleToggleAction(act.id)}
                              style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.55rem 0.75rem',
                                fontSize: '0.8rem',
                                color: act.status === 'Completed' ? 'var(--text-dim)' : 'var(--text-main)',
                                textDecoration: act.status === 'Completed' ? 'line-through' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>{act.title}</span>
                              {act.status === 'Completed' && <CheckCircle2 size={13} color="var(--success)" />}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Action inside Active Milestone */}
                      {isActive && (
                        <div style={{ marginTop: '0.85rem' }}>
                          {newActionMilestoneId === ms.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              <input
                                type="text"
                                placeholder="Concrete execution action"
                                value={actionTitle}
                                onChange={(e) => setActionTitle(e.target.value)}
                                style={{
                                  padding: '0.45rem 0.65rem',
                                  fontSize: '0.78rem',
                                  background: 'var(--bg-surface-elevated)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 4,
                                  color: 'var(--text-main)',
                                }}
                              />
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => handleCreateAction(ms.id)}
                                  className="btn btn-primary"
                                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setNewActionMilestoneId(null)}
                                  className="btn btn-ghost"
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setNewActionMilestoneId(ms.id)}
                              className="btn btn-ghost"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.74rem', color: 'var(--primary)' }}
                            >
                              <Plus size={13} />
                              <span>Add Action</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          No goals yet. Click <strong>Define New Goal</strong> to begin.
        </div>
      )}
    </div>
  );
};
