package domain

import (
	"strings"
	"time"
)

type ActionPriority string

const (
	ActionPriorityLow    ActionPriority = "Low"
	ActionPriorityMedium ActionPriority = "Medium"
	ActionPriorityHigh   ActionPriority = "High"
)

type ActionStatus string

const (
	ActionStatusPending   ActionStatus = "Pending"
	ActionStatusCompleted ActionStatus = "Completed"
)

// Action is a concrete thing the user can do (execution layer, FDR §5, §8, §9).
// Actions MUST remain traceable to their parent milestone and goal.
type Action struct {
	ID              string         `json:"id"`
	GoalID          string         `json:"goalId"`
	MilestoneID     string         `json:"milestoneId"`
	Title           string         `json:"title"`
	DueDate         *time.Time     `json:"dueDate,omitempty"`
	Priority        ActionPriority `json:"priority"`
	EstimatedEffort string         `json:"estimatedEffort"` // e.g., "30m", "1h", "2h"
	Status          ActionStatus   `json:"status"`
	Notes           string         `json:"notes"`
	CompletedAt     *time.Time     `json:"completedAt,omitempty"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`

	// Traceability Context (hydrated for UI views per FDR §12 Principle 4)
	AreaName       string `json:"areaName,omitempty"`
	AreaColor      string `json:"areaColor,omitempty"`
	GoalTitle      string `json:"goalTitle,omitempty"`
	MilestoneTitle string `json:"milestoneTitle,omitempty"`
}

func NewAction(id, goalID, milestoneID, title string, dueDate *time.Time, priority ActionPriority, effort, notes string) (*Action, error) {
	title = strings.TrimSpace(title)
	goalID = strings.TrimSpace(goalID)
	milestoneID = strings.TrimSpace(milestoneID)

	if title == "" || goalID == "" || milestoneID == "" {
		return nil, ErrMilestoneRequired
	}

	if priority == "" {
		priority = ActionPriorityMedium
	}

	now := time.Now().UTC()
	return &Action{
		ID:              id,
		GoalID:          goalID,
		MilestoneID:     milestoneID,
		Title:           title,
		DueDate:         dueDate,
		Priority:        priority,
		EstimatedEffort: strings.TrimSpace(effort),
		Status:          ActionStatusPending,
		Notes:           strings.TrimSpace(notes),
		CreatedAt:       now,
		UpdatedAt:       now,
	}, nil
}

func (a *Action) Complete() {
	now := time.Now().UTC()
	a.Status = ActionStatusCompleted
	a.CompletedAt = &now
	a.UpdatedAt = now
}

func (a *Action) Reopen() {
	a.Status = ActionStatusPending
	a.CompletedAt = nil
	a.UpdatedAt = time.Now().UTC()
}

func (a *Action) IsOverdue(now time.Time) bool {
	if a.Status == ActionStatusCompleted || a.DueDate == nil {
		return false
	}
	// Check if due date was before beginning of today
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	return a.DueDate.Before(todayStart)
}

func (a *Action) IsDueToday(now time.Time) bool {
	if a.DueDate == nil {
		return false
	}
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayEnd := todayStart.Add(24 * time.Hour)
	return !a.DueDate.Before(todayStart) && a.DueDate.Before(todayEnd)
}
