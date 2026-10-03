import { useState, useEffect, type FC, type FormEvent } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Layers,
  MessageSquare,
  ListTodo,
  FileText,
  Send,
  Edit3,
  Check,
  X,
  User,
} from 'lucide-react';
import type { Goal, Area, GoalDetail, GoalStatus, ActionPriority } from '../types';
import { api } from '../api/client';
import { ProgressRing } from './UI/ProgressRing';

interface GoalsViewProps {
  goals: Goal[];
  areas: Area[];
  onOpenNewGoal: () => void;
  onTransitionStatus: (id: string, status: GoalStatus) => void;
  selectedGoalId?: string;
  onSelectGoal?: (id: string) => void;
}

export const GoalsView: FC<GoalsViewProps> = ({
  goals,
  areas,
  onOpenNewGoal,
  onTransitionStatus,
  selectedGoalId: externalSelectedGoalId,
  onSelectGoal,
}) => {
  const activeGoals = goals.filter((g) => g.status === 'Active');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    externalSelectedGoalId || activeGoals[0]?.id || goals[0]?.id || ''
  );

  useEffect(() => {
    if (externalSelectedGoalId) {
      setSelectedGoalId(externalSelectedGoalId);
    }
  }, [externalSelectedGoalId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'comments'>('overview');
  const [goalDetail, setGoalDetail] = useState<GoalDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Description editing
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState('');

  // New task form state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMilestoneId, setTaskMilestoneId] = useState('');
  const [taskPriority, setTaskPriority] = useState<ActionPriority>('Medium');
  const [taskEffort, setTaskEffort] = useState('45m');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Comment form state
  const [commentContent, setCommentContent] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Load selected goal detail
  const loadGoalDetail = async (id: string) => {
    if (!id) return;
    try {
      setLoadingDetail(true);
      const detail = await api.getGoalDetail(id);
      setGoalDetail(detail);
      setEditDesc(detail.goal.description || '');
      if (detail.milestones.length > 0) {
        setTaskMilestoneId(detail.milestones[0].id);
      }
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

  // Countdown calculation
  const now = new Date();
  const targetDateObj = currentGoal ? new Date(currentGoal.targetDate) : now;
  const daysRemaining = Math.round((targetDateObj.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const isOverdue = daysRemaining < 0;

  const handleSelectGoalInternal = (id: string) => {
    setSelectedGoalId(id);
    if (onSelectGoal) onSelectGoal(id);
  };

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

  const handleSaveDescription = async () => {
    if (!selectedGoalId) return;
    try {
      await api.updateGoal(selectedGoalId, { description: editDesc });
      setIsEditingDesc(false);
      loadGoalDetail(selectedGoalId);
    } catch (err) {
      console.error('Failed to update description:', err);
    }
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedGoalId) return;
    try {
      await api.createAction({
        goalId: selectedGoalId,
        milestoneId: taskMilestoneId,
        title: taskTitle.trim(),
        priority: taskPriority,
        estimatedEffort: taskEffort.trim(),
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      });
      setTaskTitle('');
      setShowAddTaskModal(false);
      loadGoalDetail(selectedGoalId);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !selectedGoalId) return;
    try {
      setPostingComment(true);
      await api.addComment(selectedGoalId, {
        author: 'Me',
        content: commentContent.trim(),
      });
      setCommentContent('');
      loadGoalDetail(selectedGoalId);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
      {/* Top Goal Switcher Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {goals.map((g) => {
            const isSelected = g.id === selectedGoalId;
            return (
              <button
                key={g.id}
                onClick={() => handleSelectGoalInternal(g.id)}
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
                  transition: 'all var(--transition-fast)',
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
          {/* Goal Header (Matching Mockup 2) */}
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem 2rem',
              background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(22, 32, 50, 0.9))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ flex: '1 1 360px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {currentArea && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      background: `${currentArea.color}20`,
                      color: currentArea.color,
                      border: `1px solid ${currentArea.color}40`,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <Layers size={12} />
                    <span>{currentArea.name}</span>
                  </span>
                )}

                <select
                  value={currentGoal.status}
                  onChange={(e) => onTransitionStatus(currentGoal.id, e.target.value as GoalStatus)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.76rem',
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

                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <CheckCircle2 size={12} /> On Track
                </span>
              </div>

              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.45rem', letterSpacing: '-0.02em', textAlign: 'left' }}>
                {currentGoal.title}
              </h1>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', textAlign: 'left', fontStyle: 'italic', maxWidth: '680px' }}>
                "{currentGoal.why}"
              </p>
            </div>

            {/* Right Telemetry Widget: Progress & Countdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Timeline
                </span>
                <span
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: isOverdue ? 'var(--danger)' : 'var(--text-main)',
                  }}
                >
                  {isOverdue ? `${Math.abs(daysRemaining)}d Overdue` : `${daysRemaining} days left`}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                  Target: {new Date(currentGoal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <ProgressRing progress={currentGoal.progress} size={84} strokeWidth={7} color="var(--primary)" />
            </div>
          </div>

          {/* Sub-Tabs Navigation (Matching Mockup 2: Overview | Tasks | Comments) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.25rem',
            }}
          >
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                fontSize: '0.9rem',
                fontWeight: activeTab === 'overview' ? 700 : 500,
                color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                transition: 'all var(--transition-fast)',
              }}
            >
              <FileText size={16} />
              <span>Overview & Contract</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                fontSize: '0.9rem',
                fontWeight: activeTab === 'tasks' ? 700 : 500,
                color: activeTab === 'tasks' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'tasks' ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                transition: 'all var(--transition-fast)',
              }}
            >
              <ListTodo size={16} />
              <span>Tasks & Checkpoints</span>
              {goalDetail && (
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.05rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {goalDetail.actions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                fontSize: '0.9rem',
                fontWeight: activeTab === 'comments' ? 700 : 500,
                color: activeTab === 'comments' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                transition: 'all var(--transition-fast)',
              }}
            >
              <MessageSquare size={16} />
              <span>Comments & Activity</span>
              {goalDetail && goalDetail.comments && goalDetail.comments.length > 0 && (
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-main)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.05rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {goalDetail.comments.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Overview & Contract */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Goal Contract 4-Quadrants */}
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                  Goal Contract (FDR §6)
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
                      padding: '1.1rem',
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
                      padding: '1.1rem',
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
                      padding: '1.1rem',
                    }}
                  >
                    <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      3. BY WHEN
                    </span>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.4rem', lineHeight: 1.45 }}>
                      {new Date(currentGoal.targetDate).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
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
                      padding: '1.1rem',
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

              {/* Rich Overview & Detailed Description */}
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Overview & Execution Notes
                  </h3>
                  {!isEditingDesc ? (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    >
                      <Edit3 size={14} />
                      <span>Edit Description</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={handleSaveDescription}
                        className="btn btn-primary"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                      >
                        <Check size={14} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setIsEditingDesc(false)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {isEditingDesc ? (
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Add detailed execution background, reference links, architecture blueprints, or guidelines..."
                    rows={5}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-active)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                ) : (
                  <p style={{ fontSize: '0.88rem', color: currentGoal.description ? 'var(--text-muted)' : 'var(--text-dim)', lineHeight: 1.55 }}>
                    {currentGoal.description || 'No detailed description provided yet. Click "Edit Description" to document your technical plan, resources, and strategy.'}
                  </p>
                )}
              </div>

              {/* Milestone Stepper */}
              {goalDetail && goalDetail.milestones.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Milestone Journey Roadmap ({goalDetail.milestones.filter((m) => m.status === 'Completed').length} of {goalDetail.milestones.length} Completed)
                  </h3>

                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {goalDetail.milestones.map((ms, index) => {
                      const isDone = ms.status === 'Completed';
                      return (
                        <div
                          key={ms.id}
                          style={{
                            minWidth: '220px',
                            padding: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                            border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleToggleMilestone(ms.id)}
                              style={{ color: isDone ? 'var(--success)' : 'var(--text-dim)', display: 'flex' }}
                            >
                              {isDone ? <CheckCircle2 size={18} color="var(--success)" /> : <Circle size={18} />}
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              Phase {index + 1}: {ms.title}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                            Target: {new Date(ms.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Tasks & Checkpoints (Matching Mockup 2 Left Pane) */}
          {activeTab === 'tasks' && (
            <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'left' }}>
                    Active Tasks ({goalDetail ? goalDetail.actions.filter((a) => a.status === 'Completed').length : 0}/{goalDetail ? goalDetail.actions.length : 0})
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'left' }}>
                    Concrete execution steps connected directly to this goal's milestones.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.84rem' }}
                >
                  <Plus size={15} />
                  <span>+ Add New Task</span>
                </button>
              </div>

              {/* Task Checklist Grouped by Milestone */}
              {loadingDetail ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tasks...</div>
              ) : goalDetail && goalDetail.actions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {goalDetail.milestones.map((ms) => {
                    const msActions = goalDetail.actions.filter((a) => a.milestoneId === ms.id);
                    return (
                      <div key={ms.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.35rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>
                            Milestone: {ms.title}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            ({msActions.filter((a) => a.status === 'Completed').length}/{msActions.length})
                          </span>
                        </div>

                        {msActions.length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '0.4rem 0' }}>
                            No tasks under this milestone yet. Click "+ Add New Task" to schedule one.
                          </div>
                        ) : (
                          msActions.map((act) => {
                            const isCompleted = act.status === 'Completed';
                            return (
                              <div
                                key={act.id}
                                className="interactive-card"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.75rem 1rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '1rem',
                                  opacity: isCompleted ? 0.6 : 1,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                  <button
                                    onClick={() => handleToggleAction(act.id)}
                                    style={{ color: isCompleted ? 'var(--success)' : 'var(--text-dim)', display: 'flex' }}
                                  >
                                    {isCompleted ? <CheckCircle2 size={19} color="var(--success)" /> : <Circle size={19} />}
                                  </button>

                                  <span
                                    style={{
                                      fontSize: '0.88rem',
                                      fontWeight: 500,
                                      color: isCompleted ? 'var(--text-dim)' : 'var(--text-main)',
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      flex: 1,
                                    }}
                                  >
                                    {act.title}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                                  <span
                                    className={`badge ${
                                      act.priority === 'High'
                                        ? 'badge-priority-high'
                                        : act.priority === 'Medium'
                                        ? 'badge-priority-medium'
                                        : 'badge-priority-low'
                                    }`}
                                    style={{ fontSize: '0.72rem' }}
                                  >
                                    {act.priority === 'High' ? 'P1: High' : act.priority === 'Medium' ? 'P2: Med' : 'P3: Low'}
                                  </span>

                                  {act.dueDate && (
                                    <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                                      due {new Date(act.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}

                                  {act.estimatedEffort && (
                                    <span className="effort-chip">{act.estimatedEffort}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tasks assigned to this goal yet. Add your first execution task above!
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Comments & Updates Activity Feed (Matching Mockup 2 Right Pane) */}
          {activeTab === 'comments' && (
            <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'left', marginBottom: '0.25rem' }}>
                  Comments & Progress Journal
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'left' }}>
                  Document reflections, velocity shifts, architectural decisions, and weekly blockers.
                </p>
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handlePostComment} style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                  }}
                >
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Add a new reflection update, execution milestone note, or blocker..."
                    rows={3}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      resize: 'none',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <button
                      type="submit"
                      disabled={postingComment || !commentContent.trim()}
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}
                    >
                      <Send size={13} />
                      <span>{postingComment ? 'Posting...' : 'Post Update'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Chronological Comments Stream */}
              {goalDetail && goalDetail.comments && goalDetail.comments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {goalDetail.comments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            <User size={13} />
                          </div>
                          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {comment.author}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, paddingLeft: '2rem' }}>
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No updates posted for this goal yet. Share your first milestone reflection above!
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No goals found. Define your first goal to open the workspace.
        </div>
      )}

      {/* Add Task Modal Dialog */}
      {showAddTaskModal && currentGoal && (
        <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>+ Add Task under Goal</h2>
              <button onClick={() => setShowAddTaskModal(false)} className="btn btn-icon btn-ghost">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Read chapter 4 and write executive synthesis"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              {goalDetail && goalDetail.milestones.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Milestone Phase
                  </label>
                  <select
                    value={taskMilestoneId}
                    onChange={(e) => setTaskMilestoneId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                    }}
                  >
                    {goalDetail.milestones.map((ms) => (
                      <option key={ms.id} value={ms.id}>
                        {ms.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as ActionPriority)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option value="High">P1: High</option>
                    <option value="Medium">P2: Medium</option>
                    <option value="Low">P3: Low</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Est. Effort
                  </label>
                  <input
                    type="text"
                    placeholder="30m, 1h, 2h"
                    value={taskEffort}
                    onChange={(e) => setTaskEffort(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
