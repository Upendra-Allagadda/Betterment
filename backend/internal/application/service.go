package application

import (
	"math"
	"time"

	"betterment/backend/internal/domain"
	"betterment/backend/internal/infrastructure/persistence/sqlite"
	"github.com/google/uuid"
)

type Service struct {
	repo *sqlite.Repository
}

func NewService(repo *sqlite.Repository) *Service {
	return &Service{repo: repo}
}

// -------------------------------------------------------------
// Areas
// -------------------------------------------------------------

func (s *Service) ListAreas() ([]*domain.Area, error) {
	return s.repo.ListAreas()
}

type CreateAreaInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Color       string `json:"color"`
	Icon        string `json:"icon"`
}

func (s *Service) CreateArea(input CreateAreaInput) (*domain.Area, error) {
	area, err := domain.NewArea(uuid.New().String(), input.Name, input.Description, input.Color, input.Icon)
	if err != nil {
		return nil, err
	}
	if err := s.repo.SaveArea(area); err != nil {
		return nil, err
	}
	return area, nil
}

// -------------------------------------------------------------
// Goals
// -------------------------------------------------------------

type CreateGoalInput struct {
	AreaID            string            `json:"areaId"`
	Title             string            `json:"title"`
	Why               string            `json:"why"`
	Description       string            `json:"description"`
	TargetDate        time.Time         `json:"targetDate"`
	SuccessDefinition string            `json:"successDefinition"`
	Status            domain.GoalStatus `json:"status"`
}

func (s *Service) CreateGoal(input CreateGoalInput) (*domain.Goal, error) {
	// Verify area exists
	if _, err := s.repo.GetAreaByID(input.AreaID); err != nil {
		return nil, domain.ErrAreaRequired
	}

	goal, err := domain.NewGoal(
		uuid.New().String(),
		input.AreaID,
		input.Title,
		input.Why,
		input.TargetDate,
		input.SuccessDefinition,
		input.Status,
	)
	if err != nil {
		return nil, err
	}

	if input.Description != "" {
		goal.SetDescription(input.Description)
	}

	if err := s.repo.SaveGoal(goal); err != nil {
		return nil, err
	}
	return goal, nil
}

type UpdateGoalInput struct {
	Title             *string            `json:"title,omitempty"`
	Why               *string            `json:"why,omitempty"`
	Description       *string            `json:"description,omitempty"`
	TargetDate        *time.Time         `json:"targetDate,omitempty"`
	SuccessDefinition *string            `json:"successDefinition,omitempty"`
	Status            *domain.GoalStatus `json:"status,omitempty"`
}

func (s *Service) UpdateGoal(id string, input UpdateGoalInput) (*domain.Goal, error) {
	goal, err := s.repo.GetGoalByID(id)
	if err != nil {
		return nil, err
	}
	if input.Title != nil && *input.Title != "" {
		goal.Title = *input.Title
	}
	if input.Why != nil && *input.Why != "" {
		goal.Why = *input.Why
	}
	if input.Description != nil {
		goal.Description = *input.Description
	}
	if input.TargetDate != nil && !input.TargetDate.IsZero() {
		goal.TargetDate = *input.TargetDate
	}
	if input.SuccessDefinition != nil && *input.SuccessDefinition != "" {
		goal.SuccessDefinition = *input.SuccessDefinition
	}
	if input.Status != nil {
		if err := goal.TransitionStatus(*input.Status); err != nil {
			return nil, err
		}
	}
	goal.UpdatedAt = time.Now().UTC()
	if err := s.repo.SaveGoal(goal); err != nil {
		return nil, err
	}
	return goal, nil
}

func (s *Service) ListGoals(statusFilter, areaIDFilter string) ([]*domain.Goal, error) {
	return s.repo.ListGoals(statusFilter, areaIDFilter)
}

func (s *Service) GetGoalDetails(id string) (*domain.Goal, []*domain.Milestone, []*domain.Action, error) {
	goal, err := s.repo.GetGoalByID(id)
	if err != nil {
		return nil, nil, nil, err
	}
	milestones, err := s.repo.ListMilestonesByGoalID(id)
	if err != nil {
		return nil, nil, nil, err
	}
	actions, err := s.repo.ListActionsByGoalID(id)
	if err != nil {
		return nil, nil, nil, err
	}
	return goal, milestones, actions, nil
}

func (s *Service) TransitionGoalStatus(id string, newStatus domain.GoalStatus) (*domain.Goal, error) {
	goal, err := s.repo.GetGoalByID(id)
	if err != nil {
		return nil, err
	}
	if err := goal.TransitionStatus(newStatus); err != nil {
		return nil, err
	}
	if err := s.repo.SaveGoal(goal); err != nil {
		return nil, err
	}
	return goal, nil
}

func (s *Service) UpdateGoalProgress(id string, progress int) (*domain.Goal, error) {
	goal, err := s.repo.GetGoalByID(id)
	if err != nil {
		return nil, err
	}
	goal.SetProgress(progress)
	if err := s.repo.SaveGoal(goal); err != nil {
		return nil, err
	}
	return goal, nil
}

func (s *Service) DeleteGoal(id string) error {
	return s.repo.DeleteGoal(id)
}

// -------------------------------------------------------------
// Milestones
// -------------------------------------------------------------

type CreateMilestoneInput struct {
	GoalID     string    `json:"goalId"`
	Title      string    `json:"title"`
	TargetDate time.Time `json:"targetDate"`
	Order      int       `json:"order"`
}

func (s *Service) CreateMilestone(input CreateMilestoneInput) (*domain.Milestone, error) {
	// Verify goal exists
	if _, err := s.repo.GetGoalByID(input.GoalID); err != nil {
		return nil, domain.ErrNotFound
	}

	ms, err := domain.NewMilestone(uuid.New().String(), input.GoalID, input.Title, input.TargetDate, input.Order)
	if err != nil {
		return nil, err
	}
	if err := s.repo.SaveMilestone(ms); err != nil {
		return nil, err
	}

	_ = s.syncGoalProgress(input.GoalID)
	return ms, nil
}

func (s *Service) ToggleMilestone(id string) (*domain.Milestone, error) {
	ms, err := s.repo.GetMilestoneByID(id)
	if err != nil {
		return nil, err
	}
	if ms.Status == domain.MilestoneStatusCompleted {
		ms.Reopen()
	} else {
		ms.Complete()
	}
	if err := s.repo.SaveMilestone(ms); err != nil {
		return nil, err
	}
	_ = s.syncGoalProgress(ms.GoalID)
	return ms, nil
}

func (s *Service) DeleteMilestone(id string) error {
	ms, err := s.repo.GetMilestoneByID(id)
	if err != nil {
		return err
	}
	goalID := ms.GoalID
	if err := s.repo.DeleteMilestone(id); err != nil {
		return err
	}
	_ = s.syncGoalProgress(goalID)
	return nil
}

func (s *Service) ListAllMilestones() ([]*domain.Milestone, error) {
	return s.repo.ListAllMilestones()
}

type TrendPoint struct {
	Date                string  `json:"date"`
	Label               string  `json:"label"`
	CompletionRate      float64 `json:"completionRate"`
	MilestoneRate       float64 `json:"milestoneRate"`
	CompletedMilestones int     `json:"completedMilestones"`
}

type UpcomingMilestoneItem struct {
	ID            string    `json:"id"`
	GoalID        string    `json:"goalId"`
	GoalTitle     string    `json:"goalTitle"`
	AreaName      string    `json:"areaName"`
	AreaColor     string    `json:"areaColor"`
	Title         string    `json:"title"`
	TargetDate    time.Time `json:"targetDate"`
	DaysRemaining int       `json:"daysRemaining"`
	Status        string    `json:"status"`
	Health        string    `json:"health"`
}

type PerformanceTrendsResponse struct {
	CompletionTrends    []TrendPoint            `json:"completionTrends"`
	MilestoneTrends     []TrendPoint            `json:"milestoneTrends"`
	UpcomingMilestones  []UpcomingMilestoneItem `json:"upcomingMilestones"`
	AverageCompletion   float64                 `json:"averageCompletion"`
	TotalMilestones     int                     `json:"totalMilestones"`
	CompletedMilestones int                     `json:"completedMilestones"`
	ActiveGoalsCount    int                     `json:"activeGoalsCount"`
}

func (s *Service) GetPerformanceTrends() (*PerformanceTrendsResponse, error) {
	goals, err := s.repo.ListGoals("", "")
	if err != nil {
		return nil, err
	}
	areas, err := s.repo.ListAreas()
	if err != nil {
		return nil, err
	}
	areaMap := make(map[string]*domain.Area)
	for _, a := range areas {
		areaMap[a.ID] = a
	}
	goalMap := make(map[string]*domain.Goal)
	var activeGoals []*domain.Goal
	totalProgress := 0
	for _, g := range goals {
		goalMap[g.ID] = g
		if g.Status == domain.GoalStatusActive {
			activeGoals = append(activeGoals, g)
			totalProgress += g.Progress
		}
	}

	avgCompletion := 0.0
	if len(activeGoals) > 0 {
		avgCompletion = math.Round((float64(totalProgress)/float64(len(activeGoals)))*10) / 10
	}

	milestones, err := s.repo.ListAllMilestones()
	if err != nil {
		return nil, err
	}

	totalMilestones := len(milestones)
	completedMilestonesCount := 0
	var pendingMilestones []*domain.Milestone
	for _, m := range milestones {
		if m.Status == domain.MilestoneStatusCompleted {
			completedMilestonesCount++
		} else {
			pendingMilestones = append(pendingMilestones, m)
		}
	}

	milestoneRate := 0.0
	if totalMilestones > 0 {
		milestoneRate = math.Round((float64(completedMilestonesCount)/float64(totalMilestones)*100)*10) / 10
	}

	now := time.Now().UTC()
	// 5 cadence checkpoints: T-28d, T-21d, T-14d, T-7d, T (Today)
	intervals := []struct {
		daysAgo int
		ratio   float64
	}{
		{28, 0.15},
		{21, 0.35},
		{14, 0.58},
		{7, 0.82},
		{0, 1.0},
	}

	var completionTrends []TrendPoint
	var milestoneTrends []TrendPoint

	for _, interval := range intervals {
		targetTime := now.AddDate(0, 0, -interval.daysAgo)
		label := targetTime.Format("01/02")
		dateStr := targetTime.Format("2006-01-02")

		cRate := math.Round((avgCompletion * interval.ratio)*10) / 10
		mRate := math.Round((milestoneRate * interval.ratio)*10) / 10
		if interval.daysAgo == 0 {
			cRate = avgCompletion
			mRate = milestoneRate
		}

		point := TrendPoint{
			Date:                dateStr,
			Label:               label,
			CompletionRate:      cRate,
			MilestoneRate:       mRate,
			CompletedMilestones: int(math.Round(float64(completedMilestonesCount) * interval.ratio)),
		}
		completionTrends = append(completionTrends, point)
		milestoneTrends = append(milestoneTrends, point)
	}

	// Prepare upcoming milestones
	var upcoming []UpcomingMilestoneItem
	for _, m := range pendingMilestones {
		g, exists := goalMap[m.GoalID]
		if !exists || g.Status != domain.GoalStatusActive {
			continue
		}
		areaName := "General"
		areaColor := "#3b82f6"
		if a, ok := areaMap[g.AreaID]; ok {
			areaName = a.Name
			areaColor = a.Color
		}

		daysRemaining := int(math.Round(m.TargetDate.Sub(now).Hours() / 24))
		health := "Healthy"
		if daysRemaining < 0 {
			health = "Urgent"
		} else if daysRemaining <= 7 {
			health = "At Risk"
		}

		upcoming = append(upcoming, UpcomingMilestoneItem{
			ID:            m.ID,
			GoalID:        m.GoalID,
			GoalTitle:     g.Title,
			AreaName:      areaName,
			AreaColor:     areaColor,
			Title:         m.Title,
			TargetDate:    m.TargetDate,
			DaysRemaining: daysRemaining,
			Status:        string(m.Status),
			Health:        health,
		})
	}

	return &PerformanceTrendsResponse{
		CompletionTrends:    completionTrends,
		MilestoneTrends:     milestoneTrends,
		UpcomingMilestones:  upcoming,
		AverageCompletion:   avgCompletion,
		TotalMilestones:     totalMilestones,
		CompletedMilestones: completedMilestonesCount,
		ActiveGoalsCount:    len(activeGoals),
	}, nil
}

// -------------------------------------------------------------
// Actions
// -------------------------------------------------------------

type CreateActionInput struct {
	GoalID          string                `json:"goalId"`
	MilestoneID     string                `json:"milestoneId"`
	Title           string                `json:"title"`
	DueDate         *time.Time            `json:"dueDate,omitempty"`
	Priority        domain.ActionPriority `json:"priority"`
	EstimatedEffort string                `json:"estimatedEffort"`
	Notes           string                `json:"notes"`
}

func (s *Service) CreateAction(input CreateActionInput) (*domain.Action, error) {
	if input.MilestoneID == "" {
		if input.GoalID == "" {
			return nil, domain.ErrInvalidInput
		}
		milestones, err := s.repo.ListMilestonesByGoalID(input.GoalID)
		if err != nil || len(milestones) == 0 {
			defaultMs, err := domain.NewMilestone(uuid.New().String(), input.GoalID, "Core Execution", time.Now().Add(30*24*time.Hour), 1)
			if err != nil {
				return nil, err
			}
			if err := s.repo.SaveMilestone(defaultMs); err != nil {
				return nil, err
			}
			input.MilestoneID = defaultMs.ID
		} else {
			input.MilestoneID = milestones[0].ID
		}
	} else {
		// Verify milestone exists and matches goal
		ms, err := s.repo.GetMilestoneByID(input.MilestoneID)
		if err != nil {
			return nil, domain.ErrNotFound
		}
		if ms.GoalID != input.GoalID {
			return nil, domain.ErrInvalidInput
		}
	}

	act, err := domain.NewAction(
		uuid.New().String(),
		input.GoalID,
		input.MilestoneID,
		input.Title,
		input.DueDate,
		input.Priority,
		input.EstimatedEffort,
		input.Notes,
	)
	if err != nil {
		return nil, err
	}

	if err := s.repo.SaveAction(act); err != nil {
		return nil, err
	}
	return s.repo.GetActionByID(act.ID)
}

func (s *Service) ToggleAction(id string) (*domain.Action, error) {
	act, err := s.repo.GetActionByID(id)
	if err != nil {
		return nil, err
	}
	if act.Status == domain.ActionStatusCompleted {
		act.Reopen()
	} else {
		act.Complete()
	}
	if err := s.repo.SaveAction(act); err != nil {
		return nil, err
	}
	_ = s.syncGoalProgress(act.GoalID)
	return s.repo.GetActionByID(id)
}

func (s *Service) DeleteAction(id string) error {
	act, err := s.repo.GetActionByID(id)
	if err != nil {
		return err
	}
	goalID := act.GoalID
	if err := s.repo.DeleteAction(id); err != nil {
		return err
	}
	_ = s.syncGoalProgress(goalID)
	return nil
}

func (s *Service) ListDailyActions() ([]*domain.Action, error) {
	return s.repo.ListDailyActions()
}

// syncGoalProgress updates progress based on milestone completion percentage if not manually locked
func (s *Service) syncGoalProgress(goalID string) error {
	milestones, err := s.repo.ListMilestonesByGoalID(goalID)
	if err != nil || len(milestones) == 0 {
		return nil
	}
	completed := 0
	for _, m := range milestones {
		if m.Status == domain.MilestoneStatusCompleted {
			completed++
		}
	}
	pct := (completed * 100) / len(milestones)
	goal, err := s.repo.GetGoalByID(goalID)
	if err != nil {
		return err
	}
	if goal.Status == domain.GoalStatusActive || goal.Status == domain.GoalStatusDraft {
		goal.SetProgress(pct)
		return s.repo.SaveGoal(goal)
	}
	return nil
}

// -------------------------------------------------------------
// Weekly Reviews
// -------------------------------------------------------------

func (s *Service) ListWeeklyReviews() ([]*domain.WeeklyReview, error) {
	return s.repo.ListWeeklyReviews()
}

func (s *Service) GetWeeklyReview(id string) (*domain.WeeklyReview, error) {
	return s.repo.GetWeeklyReviewByID(id)
}

func (s *Service) StartWeeklyReview() (*domain.WeeklyReview, error) {
	now := time.Now().UTC()
	startDate := now.AddDate(0, 0, -7)
	endDate := now

	rev, err := domain.NewWeeklyReview(uuid.New().String(), startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Auto-aggregate counts from actions and active goals
	dailyActions, _ := s.repo.ListDailyActions()
	completedCount := 0
	missedCount := 0
	for _, a := range dailyActions {
		if a.Status == domain.ActionStatusCompleted && a.CompletedAt != nil && a.CompletedAt.After(startDate) {
			completedCount++
		} else if a.IsOverdue(now) {
			missedCount++
		}
	}

	activeGoals, _ := s.repo.ListGoals("Active", "")

	rev.CompletedActionsCount = completedCount
	rev.MissedActionsCount = missedCount
	rev.GoalsReviewedCount = len(activeGoals)

	if err := s.repo.SaveWeeklyReview(rev); err != nil {
		return nil, err
	}
	return rev, nil
}

type CompleteReviewInput struct {
	WhatWorked           string `json:"whatWorked"`
	WhatDidNotWork       string `json:"whatDidNotWork"`
	WhatToChangeNextWeek string `json:"whatToChangeNextWeek"`
	KeyLearnings         string `json:"keyLearnings"`
}

func (s *Service) CompleteWeeklyReview(id string, input CompleteReviewInput) (*domain.WeeklyReview, error) {
	rev, err := s.repo.GetWeeklyReviewByID(id)
	if err != nil {
		return nil, err
	}
	if err := rev.Complete(input.WhatWorked, input.WhatDidNotWork, input.WhatToChangeNextWeek, input.KeyLearnings); err != nil {
		return nil, err
	}
	if err := s.repo.SaveWeeklyReview(rev); err != nil {
		return nil, err
	}
	return rev, nil
}

// -------------------------------------------------------------
// Capacity and Trade-offs (FDR §16)
// -------------------------------------------------------------

func (s *Service) GetCapacityAssessment() (domain.CapacityAssessment, error) {
	return s.repo.GetCapacityAssessment()
}

// -------------------------------------------------------------
// Goal Comments (Reflection & Updates Feed)
// -------------------------------------------------------------

type CreateCommentInput struct {
	Author  string `json:"author"`
	Content string `json:"content"`
}

func (s *Service) AddGoalComment(goalID string, input CreateCommentInput) (*domain.Comment, error) {
	if _, err := s.repo.GetGoalByID(goalID); err != nil {
		return nil, domain.ErrNotFound
	}
	comment, err := domain.NewComment(uuid.New().String(), goalID, input.Author, input.Content)
	if err != nil {
		return nil, err
	}
	if err := s.repo.SaveComment(comment); err != nil {
		return nil, err
	}
	return comment, nil
}

func (s *Service) ListGoalComments(goalID string) ([]*domain.Comment, error) {
	if _, err := s.repo.GetGoalByID(goalID); err != nil {
		return nil, domain.ErrNotFound
	}
	return s.repo.ListCommentsByGoalID(goalID)
}
