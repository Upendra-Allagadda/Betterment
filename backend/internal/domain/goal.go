package domain

import (
	"strings"
	"time"
)

type GoalStatus string

const (
	GoalStatusDraft     GoalStatus = "Draft"
	GoalStatusActive    GoalStatus = "Active"
	GoalStatusPaused    GoalStatus = "Paused"
	GoalStatusCompleted GoalStatus = "Completed"
	GoalStatusAbandoned GoalStatus = "Abandoned"
)

// Goal represents a meaningful outcome the user wants to achieve (FDR §5, §6, §11).
// It must answer: What, Why, By when, and How will I know I succeeded?
type Goal struct {
	ID                string     `json:"id"`
	AreaID            string     `json:"areaId"`
	Title             string     `json:"title"`             // What: Meaningful outcome
	Why               string     `json:"why"`               // Why: Core motivation & importance
	TargetDate        time.Time  `json:"targetDate"`        // By when
	SuccessDefinition string     `json:"successDefinition"` // How will I know I succeeded (measurable or qualitative)
	Status            GoalStatus `json:"status"`
	Progress          int        `json:"progress"` // 0 - 100%
	StartDate         time.Time  `json:"startDate"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}

// NewGoal creates and validates a new goal. Enforces FDR §6 (What, Why, By when, Success Definition).
func NewGoal(id, areaID, title, why string, targetDate time.Time, successDef string, status GoalStatus) (*Goal, error) {
	title = strings.TrimSpace(title)
	why = strings.TrimSpace(why)
	successDef = strings.TrimSpace(successDef)
	areaID = strings.TrimSpace(areaID)

	if title == "" || why == "" || successDef == "" || areaID == "" || targetDate.IsZero() {
		return nil, ErrGoalIncomplete
	}

	if status == "" {
		status = GoalStatusDraft
	}
	if !isValidGoalStatus(status) {
		return nil, ErrInvalidStatus
	}

	now := time.Now().UTC()
	return &Goal{
		ID:                id,
		AreaID:            areaID,
		Title:             title,
		Why:               why,
		TargetDate:        targetDate,
		SuccessDefinition: successDef,
		Status:            status,
		Progress:          0,
		StartDate:         now,
		CreatedAt:         now,
		UpdatedAt:         now,
	}, nil
}

func isValidGoalStatus(s GoalStatus) bool {
	switch s {
	case GoalStatusDraft, GoalStatusActive, GoalStatusPaused, GoalStatusCompleted, GoalStatusAbandoned:
		return true
	default:
		return false
	}
}

// TransitionStatus validates and transitions the goal lifecycle (FDR §11).
func (g *Goal) TransitionStatus(newStatus GoalStatus) error {
	if !isValidGoalStatus(newStatus) {
		return ErrInvalidStatus
	}

	// Validate allowed transitions
	switch g.Status {
	case GoalStatusDraft:
		if newStatus != GoalStatusActive && newStatus != GoalStatusAbandoned {
			return ErrInvalidStatus
		}
	case GoalStatusActive:
		if newStatus != GoalStatusPaused && newStatus != GoalStatusCompleted && newStatus != GoalStatusAbandoned {
			return ErrInvalidStatus
		}
		if newStatus == GoalStatusCompleted {
			g.Progress = 100
		}
	case GoalStatusPaused:
		if newStatus != GoalStatusActive && newStatus != GoalStatusAbandoned {
			return ErrInvalidStatus
		}
	case GoalStatusCompleted:
		// Historical record; can only be reopened to active if explicitly adjusted
		if newStatus != GoalStatusActive {
			return ErrInvalidStatus
		}
	case GoalStatusAbandoned:
		// Historical learning record; can be resurrected to Draft or Active
		if newStatus != GoalStatusDraft && newStatus != GoalStatusActive {
			return ErrInvalidStatus
		}
	}

	g.Status = newStatus
	g.UpdatedAt = time.Now().UTC()
	return nil
}

// SetProgress updates the progress percentage (0 - 100), ensuring boundaries.
func (g *Goal) SetProgress(progress int) {
	if progress < 0 {
		progress = 0
	}
	if progress > 100 {
		progress = 100
	}
	g.Progress = progress
	if progress == 100 && g.Status == GoalStatusActive {
		g.Status = GoalStatusCompleted
	}
	g.UpdatedAt = time.Now().UTC()
}
