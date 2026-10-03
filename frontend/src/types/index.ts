export type GoalStatus = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Abandoned';
export type MilestoneStatus = 'Pending' | 'Completed';
export type ActionPriority = 'Low' | 'Medium' | 'High';
export type ActionStatus = 'Pending' | 'Completed';
export type ReviewStatus = 'Draft' | 'Completed';

export interface Area {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  areaId: string;
  title: string;
  why: string;
  description?: string;
  targetDate: string;
  successDefinition: string;
  status: GoalStatus;
  progress: number;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalComment {
  id: string;
  goalId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  targetDate: string;
  status: MilestoneStatus;
  order: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  goalId: string;
  milestoneId: string;
  title: string;
  dueDate?: string;
  priority: ActionPriority;
  estimatedEffort: string;
  status: ActionStatus;
  notes: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Hydrated traceability context (FDR §12 Principle 4)
  areaName?: string;
  areaColor?: string;
  goalTitle?: string;
  milestoneTitle?: string;
}

export interface GoalDetail {
  goal: Goal;
  milestones: Milestone[];
  actions: ActionItem[];
  comments?: GoalComment[];
}

export interface WeeklyReview {
  id: string;
  startDate: string;
  endDate: string;
  status: ReviewStatus;
  completedActionsCount: number;
  missedActionsCount: number;
  goalsReviewedCount: number;
  whatWorked: string;
  whatDidNotWork: string;
  whatToChangeNextWeek: string;
  keyLearnings: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AreaCommitment {
  areaId: string;
  areaName: string;
  areaColor: string;
  activeGoalsCount: number;
  pendingActions: number;
  overdueActions: number;
}

export interface CapacityAssessment {
  totalActiveGoals: number;
  totalPendingTasks: number;
  totalOverdueTasks: number;
  isOvercommitted: boolean;
  overloadWarning?: string;
  areasBreakdown: AreaCommitment[];
}

export interface TrendPoint {
  date: string;
  label: string;
  completionRate: number;
  milestoneRate: number;
  completedMilestones: number;
}

export interface UpcomingMilestoneItem {
  id: string;
  goalId: string;
  goalTitle: string;
  areaName: string;
  areaColor: string;
  title: string;
  targetDate: string;
  daysRemaining: number;
  status: string;
  health: 'Healthy' | 'At Risk' | 'Urgent' | string;
}

export interface PerformanceTrendsResponse {
  completionTrends: TrendPoint[];
  milestoneTrends: TrendPoint[];
  upcomingMilestones: UpcomingMilestoneItem[];
  averageCompletion: number;
  totalMilestones: number;
  completedMilestones: number;
  activeGoalsCount: number;
}
