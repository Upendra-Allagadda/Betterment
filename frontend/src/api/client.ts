import type {
  Area,
  Goal,
  Milestone,
  ActionItem,
  GoalDetail,
  GoalComment,
  WeeklyReview,
  CapacityAssessment,
  GoalStatus,
  ActionPriority,
} from '../types';

const BASE_URL = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const errObj = await res.json();
      if (errObj && errObj.error) {
        errMsg = errObj.error;
      }
    } catch {
      // non-JSON error
    }
    throw new Error(errMsg);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Areas
  async getAreas(): Promise<Area[]> {
    const res = await fetch(`${BASE_URL}/areas`);
    return handleResponse<Area[]>(res);
  },

  async createArea(data: { name: string; description: string; color: string; icon: string }): Promise<Area> {
    const res = await fetch(`${BASE_URL}/areas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Area>(res);
  },

  // Goals
  async getGoals(status?: string, areaId?: string): Promise<Goal[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (areaId) params.set('areaId', areaId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/goals${qs}`);
    return handleResponse<Goal[]>(res);
  },

  async getGoalDetail(id: string): Promise<GoalDetail> {
    const res = await fetch(`${BASE_URL}/goals/${id}`);
    return handleResponse<GoalDetail>(res);
  },

  async createGoal(data: {
    areaId: string;
    title: string;
    why: string;
    targetDate: string;
    successDefinition: string;
    status: GoalStatus;
  }): Promise<Goal> {
    const res = await fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Goal>(res);
  },

  async transitionGoalStatus(id: string, status: GoalStatus): Promise<Goal> {
    const res = await fetch(`${BASE_URL}/goals/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Goal>(res);
  },

  async updateGoalProgress(id: string, progress: number): Promise<Goal> {
    const res = await fetch(`${BASE_URL}/goals/${id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    });
    return handleResponse<Goal>(res);
  },

  async updateGoal(id: string, data: Partial<Goal>): Promise<Goal> {
    const res = await fetch(`${BASE_URL}/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Goal>(res);
  },

  async deleteGoal(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/goals/${id}`, { method: 'DELETE' });
    return handleResponse<void>(res);
  },

  // Goal Comments & Activity Updates
  async getComments(goalId: string): Promise<GoalComment[]> {
    const res = await fetch(`${BASE_URL}/goals/${goalId}/comments`);
    return handleResponse<GoalComment[]>(res);
  },

  async addComment(goalId: string, data: { content: string; author?: string }): Promise<GoalComment> {
    const res = await fetch(`${BASE_URL}/goals/${goalId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<GoalComment>(res);
  },

  // Milestones
  async createMilestone(data: {
    goalId: string;
    title: string;
    targetDate: string;
    order: number;
  }): Promise<Milestone> {
    const res = await fetch(`${BASE_URL}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Milestone>(res);
  },

  async toggleMilestone(id: string): Promise<Milestone> {
    const res = await fetch(`${BASE_URL}/milestones/${id}/toggle`, { method: 'PATCH' });
    return handleResponse<Milestone>(res);
  },

  async deleteMilestone(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/milestones/${id}`, { method: 'DELETE' });
    return handleResponse<void>(res);
  },

  // Actions
  async getDailyActions(): Promise<ActionItem[]> {
    const res = await fetch(`${BASE_URL}/actions/daily`);
    return handleResponse<ActionItem[]>(res);
  },

  async createAction(data: {
    goalId: string;
    milestoneId: string;
    title: string;
    dueDate?: string;
    priority: ActionPriority;
    estimatedEffort: string;
    notes?: string;
  }): Promise<ActionItem> {
    const res = await fetch(`${BASE_URL}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ActionItem>(res);
  },

  async toggleAction(id: string): Promise<ActionItem> {
    const res = await fetch(`${BASE_URL}/actions/${id}/toggle`, { method: 'PATCH' });
    return handleResponse<ActionItem>(res);
  },

  async deleteAction(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/actions/${id}`, { method: 'DELETE' });
    return handleResponse<void>(res);
  },

  // Weekly Reviews
  async getReviews(): Promise<WeeklyReview[]> {
    const res = await fetch(`${BASE_URL}/reviews`);
    return handleResponse<WeeklyReview[]>(res);
  },

  async startWeeklyReview(): Promise<WeeklyReview> {
    const res = await fetch(`${BASE_URL}/reviews/start`, { method: 'POST' });
    return handleResponse<WeeklyReview>(res);
  },

  async completeWeeklyReview(
    id: string,
    data: {
      whatWorked: string;
      whatDidNotWork: string;
      whatToChangeNextWeek: string;
      keyLearnings: string;
    }
  ): Promise<WeeklyReview> {
    const res = await fetch(`${BASE_URL}/reviews/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<WeeklyReview>(res);
  },

  // Capacity Assessment (FDR §16)
  async getCapacity(): Promise<CapacityAssessment> {
    const res = await fetch(`${BASE_URL}/capacity`);
    return handleResponse<CapacityAssessment>(res);
  },

  // Seed Data
  async seedData(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/seed`, { method: 'POST' });
    return handleResponse<{ message: string }>(res);
  },
};
