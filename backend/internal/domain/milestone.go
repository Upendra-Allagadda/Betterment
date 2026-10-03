package domain

import (
	"strings"
	"time"
)

type MilestoneStatus string

const (
	MilestoneStatusPending   MilestoneStatus = "Pending"
	MilestoneStatusCompleted MilestoneStatus = "Completed"
)

// Milestone represents a meaningful checkpoint toward a goal (FDR §5).
type Milestone struct {
	ID          string          `json:"id"`
	GoalID      string          `json:"goalId"`
	Title       string          `json:"title"`
	TargetDate  time.Time       `json:"targetDate"`
	Status      MilestoneStatus `json:"status"`
	Order       int             `json:"order"`
	CompletedAt *time.Time      `json:"completedAt,omitempty"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

func NewMilestone(id, goalID, title string, targetDate time.Time, order int) (*Milestone, error) {
	title = strings.TrimSpace(title)
	goalID = strings.TrimSpace(goalID)
	if title == "" || goalID == "" {
		return nil, ErrInvalidInput
	}
	now := time.Now().UTC()
	return &Milestone{
		ID:         id,
		GoalID:     goalID,
		Title:      title,
		TargetDate: targetDate,
		Status:     MilestoneStatusPending,
		Order:      order,
		CreatedAt:  now,
		UpdatedAt:  now,
	}, nil
}

func (m *Milestone) Complete() {
	now := time.Now().UTC()
	m.Status = MilestoneStatusCompleted
	m.CompletedAt = &now
	m.UpdatedAt = now
}

func (m *Milestone) Reopen() {
	m.Status = MilestoneStatusPending
	m.CompletedAt = nil
	m.UpdatedAt = time.Now().UTC()
}
