import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { OverviewView } from './components/OverviewView';
import { DailyFocusView } from './components/DailyFocusView';
import { GoalsView } from './components/GoalsView';
import { TemplatesView } from './components/TemplatesView';
import { GoalDetailModal } from './components/GoalDetailModal';
import { NewGoalModal } from './components/NewGoalModal';
import { NewActionModal } from './components/NewActionModal';
import { WeeklyReviewView } from './components/WeeklyReviewView';
import { BalanceView } from './components/BalanceView';
import { api } from './api/client';
import type {
  Area,
  Goal,
  ActionItem,
  GoalDetail,
  WeeklyReview,
  CapacityAssessment,
  GoalStatus,
  ActionPriority,
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'goals' | 'daily' | 'review' | 'templates' | 'balance'>('overview');
  const [areas, setAreas] = useState<Area[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyActions, setDailyActions] = useState<ActionItem[]>([]);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [capacity, setCapacity] = useState<CapacityAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Navigation state
  const [focusedGoalId, setFocusedGoalId] = useState<string>('');
  const [selectedGoalDetail, setSelectedGoalDetail] = useState<GoalDetail | null>(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showNewActionModal, setShowNewActionModal] = useState(false);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [areasRes, goalsRes, actionsRes, reviewsRes, capRes] = await Promise.all([
        api.getAreas(),
        api.getGoals(),
        api.getDailyActions(),
        api.getReviews(),
        api.getCapacity(),
      ]);

      setAreas(areasRes);
      setGoals(goalsRes);
      setDailyActions(actionsRes);
      setReviews(reviewsRes);
      setCapacity(capRes);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Goal in Workspace
  const handleSelectGoal = (goalId: string) => {
    setFocusedGoalId(goalId);
    setCurrentTab('goals');
  };

  // Toggle Action Status
  const handleToggleAction = async (actionId: string) => {
    try {
      // Optimistic local update
      setDailyActions((prev) =>
        prev.map((a) =>
          a.id === actionId
            ? { ...a, status: a.status === 'Completed' ? 'Pending' : 'Completed' }
            : a
        )
      );

      await api.toggleAction(actionId);

      // Refresh goal details if open
      if (selectedGoalDetail) {
        const detail = await api.getGoalDetail(selectedGoalDetail.goal.id);
        setSelectedGoalDetail(detail);
      }

      // Refresh capacity and goals progress
      const [goalsRes, capRes] = await Promise.all([api.getGoals(), api.getCapacity()]);
      setGoals(goalsRes);
      setCapacity(capRes);
    } catch (err) {
      console.error('Failed to toggle action:', err);
      loadData();
    }
  };

  // Toggle Milestone Status
  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      await api.toggleMilestone(milestoneId);
      if (selectedGoalDetail) {
        const detail = await api.getGoalDetail(selectedGoalDetail.goal.id);
        setSelectedGoalDetail(detail);
      }
      loadData();
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  // Create Milestone
  const handleCreateMilestone = async (title: string, targetDate: string) => {
    if (!selectedGoalDetail) return;
    try {
      await api.createMilestone({
        goalId: selectedGoalDetail.goal.id,
        title,
        targetDate,
        order: selectedGoalDetail.milestones.length + 1,
      });
      const detail = await api.getGoalDetail(selectedGoalDetail.goal.id);
      setSelectedGoalDetail(detail);
      loadData();
    } catch (err) {
      console.error('Failed to create milestone:', err);
    }
  };

  // Create Action under milestone
  const handleCreateActionUnderMilestone = async (
    milestoneId: string,
    title: string,
    priority: ActionPriority,
    effort: string,
    dueDate: string
  ) => {
    if (!selectedGoalDetail) return;
    try {
      await api.createAction({
        goalId: selectedGoalDetail.goal.id,
        milestoneId,
        title,
        priority,
        estimatedEffort: effort,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      const detail = await api.getGoalDetail(selectedGoalDetail.goal.id);
      setSelectedGoalDetail(detail);
      loadData();
    } catch (err) {
      console.error('Failed to create action:', err);
    }
  };

  // Create Goal
  const handleCreateGoal = async (data: {
    areaId: string;
    title: string;
    why: string;
    targetDate: string;
    successDefinition: string;
    status: GoalStatus;
  }) => {
    try {
      const created = await api.createGoal(data);
      setShowNewGoalModal(false);
      await loadData();
      handleSelectGoal(created.id);
    } catch (err) {
      console.error('Failed to create goal:', err);
      alert('Failed to create goal: ' + (err as Error).message);
    }
  };

  // Transition Goal Status
  const handleTransitionGoalStatus = async (goalId: string, newStatus: GoalStatus) => {
    try {
      await api.transitionGoalStatus(goalId, newStatus);
      if (selectedGoalDetail && selectedGoalDetail.goal.id === goalId) {
        const detail = await api.getGoalDetail(goalId);
        setSelectedGoalDetail(detail);
      }
      loadData();
    } catch (err) {
      console.error('Failed to transition goal:', err);
      alert('Failed to transition goal: ' + (err as Error).message);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.deleteGoal(goalId);
      setSelectedGoalDetail(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  // Start Weekly Review
  const handleStartWeeklyReview = async () => {
    try {
      const newRev = await api.startWeeklyReview();
      setReviews((prev) => [newRev, ...prev.filter((r) => r.id !== newRev.id)]);
      setCurrentTab('review');
    } catch (err) {
      console.error('Failed to start review:', err);
    }
  };

  // Complete Weekly Review
  const handleCompleteWeeklyReview = async (
    id: string,
    data: {
      whatWorked: string;
      whatDidNotWork: string;
      whatToChangeNextWeek: string;
      keyLearnings: string;
    }
  ) => {
    try {
      const completed = await api.completeWeeklyReview(id, data);
      setReviews((prev) => prev.map((r) => (r.id === id ? completed : r)));
      loadData();
    } catch (err) {
      console.error('Failed to complete review:', err);
    }
  };

  // Adopt Pre-built Template (FDR §12 Principle 1: Start Simple)
  const handleAdoptTemplate = async (data: {
    areaId: string;
    areaName: string;
    areaColor: string;
    areaIcon: string;
    title: string;
    why: string;
    targetDate: string;
    successDefinition: string;
    milestones: string[];
  }) => {
    try {
      let finalAreaId = data.areaId;
      if (!finalAreaId) {
        const createdArea = await api.createArea({
          name: data.areaName,
          description: `Life dimension for ${data.areaName}`,
          color: data.areaColor,
          icon: data.areaIcon,
        });
        finalAreaId = createdArea.id;
      }

      const createdGoal = await api.createGoal({
        areaId: finalAreaId,
        title: data.title,
        why: data.why,
        targetDate: data.targetDate,
        successDefinition: data.successDefinition,
        status: 'Active',
      });

      for (let i = 0; i < data.milestones.length; i++) {
        const msTitle = data.milestones[i];
        const msDate = new Date();
        msDate.setDate(msDate.getDate() + (i + 1) * 20);
        await api.createMilestone({
          goalId: createdGoal.id,
          title: msTitle,
          targetDate: msDate.toISOString(),
          order: i + 1,
        });
      }

      await loadData();
      await handleSelectGoal(createdGoal.id);
      setCurrentTab('goals');
    } catch (err) {
      console.error('Failed to adopt template:', err);
      alert('Could not adopt template: ' + (err as Error).message);
    }
  };

  // Create Custom Life Area
  const handleCreateArea = async (data: {
    name: string;
    description: string;
    color: string;
    icon: string;
  }) => {
    try {
      await api.createArea(data);
      await loadData();
    } catch (err) {
      console.error('Failed to create area:', err);
      alert('Could not create life area: ' + (err as Error).message);
    }
  };

  const pendingActionsCount = dailyActions.filter((a) => a.status === 'Pending').length;

  return (
    <Layout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      pendingCount={pendingActionsCount}
      onDataRefresh={loadData}
    >
      {loading && goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading personal goal execution system...
        </div>
      ) : (
        <>
          {currentTab === 'overview' && (
            <OverviewView
              goals={goals}
              areas={areas}
              actions={dailyActions}
              onSelectGoal={handleSelectGoal}
              onOpenNewGoal={() => setShowNewGoalModal(true)}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsView
              goals={goals}
              areas={areas}
              selectedGoalId={focusedGoalId}
              onSelectGoal={(id) => setFocusedGoalId(id)}
              onOpenNewGoal={() => setShowNewGoalModal(true)}
              onTransitionStatus={handleTransitionGoalStatus}
            />
          )}

          {currentTab === 'daily' && (
            <DailyFocusView
              actions={dailyActions}
              goals={goals}
              areas={areas}
              onToggleAction={handleToggleAction}
              onOpenNewAction={() => setShowNewActionModal(true)}
              onSelectGoal={handleSelectGoal}
            />
          )}

          {currentTab === 'review' && (
            <WeeklyReviewView
              reviews={reviews}
              onStartReview={handleStartWeeklyReview}
              onCompleteReview={handleCompleteWeeklyReview}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesView
              areas={areas}
              onAdoptTemplate={handleAdoptTemplate}
              onCreateArea={handleCreateArea}
              onOpenNewGoal={() => setShowNewGoalModal(true)}
            />
          )}

          {currentTab === 'balance' && (
            <BalanceView
              assessment={capacity}
              onNavigateToGoals={() => setCurrentTab('goals')}
            />
          )}
        </>
      )}

      {/* Goal Detail Modal */}
      {selectedGoalDetail && (
        <GoalDetailModal
          detail={selectedGoalDetail}
          onClose={() => setSelectedGoalDetail(null)}
          onToggleMilestone={handleToggleMilestone}
          onToggleAction={handleToggleAction}
          onCreateMilestone={handleCreateMilestone}
          onCreateAction={handleCreateActionUnderMilestone}
          onTransitionStatus={(status) =>
            handleTransitionGoalStatus(selectedGoalDetail.goal.id, status)
          }
          onDeleteGoal={() => handleDeleteGoal(selectedGoalDetail.goal.id)}
        />
      )}

      {/* New Goal Wizard Modal (FDR §6) */}
      {showNewGoalModal && (
        <NewGoalModal
          areas={areas}
          onClose={() => setShowNewGoalModal(false)}
          onCreateGoal={handleCreateGoal}
        />
      )}

      {/* New Action Modal (FDR §9) */}
      {showNewActionModal && (
        <NewActionModal
          goals={goals}
          onClose={() => setShowNewActionModal(false)}
          onActionCreated={loadData}
        />
      )}
    </Layout>
  );
}

export default App;
