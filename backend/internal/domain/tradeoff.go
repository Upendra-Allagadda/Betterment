package domain

// AreaCommitment summarizes the active workload for a specific area of life.
type AreaCommitment struct {
	AreaID           string `json:"areaId"`
	AreaName         string `json:"areaName"`
	AreaColor        string `json:"areaColor"`
	ActiveGoalsCount int    `json:"activeGoalsCount"`
	PendingActions   int    `json:"pendingActions"`
	OverdueActions   int    `json:"overdueActions"`
}

// CapacityAssessment provides trade-off visibility across life areas (FDR §16).
type CapacityAssessment struct {
	TotalActiveGoals  int              `json:"totalActiveGoals"`
	TotalPendingTasks int              `json:"totalPendingTasks"`
	TotalOverdueTasks int              `json:"totalOverdueTasks"`
	IsOvercommitted   bool             `json:"isOvercommitted"`
	OverloadWarning   string           `json:"overloadWarning,omitempty"`
	AreasBreakdown    []AreaCommitment `json:"areasBreakdown"`
}

const (
	// Healthy guideline: more than 5 concurrent active goals or 25 pending actions leads to execution fatigue
	MaxRecommendedActiveGoals   = 5
	MaxRecommendedPendingTasks = 20
)

// EvaluateCapacity inspects commitments and flags realistic execution trade-offs.
func EvaluateCapacity(breakdowns []AreaCommitment) CapacityAssessment {
	totalGoals := 0
	totalPending := 0
	totalOverdue := 0

	for _, a := range breakdowns {
		totalGoals += a.ActiveGoalsCount
		totalPending += a.PendingActions
		totalOverdue += a.OverdueActions
	}

	isOvercommitted := false
	var warning string

	if totalGoals > MaxRecommendedActiveGoals {
		isOvercommitted = true
		warning = "You have more active goals than recommended for focused execution. Consider pausing less urgent goals."
	} else if totalOverdue >= 5 {
		isOvercommitted = true
		warning = "Multiple commitments are falling behind. Consider reducing action scope before taking on new milestones."
	} else if totalPending > MaxRecommendedPendingTasks {
		isOvercommitted = true
		warning = "High pending task backlog. Focus on completing existing commitments before planning new ones."
	}

	return CapacityAssessment{
		TotalActiveGoals:  totalGoals,
		TotalPendingTasks: totalPending,
		TotalOverdueTasks: totalOverdue,
		IsOvercommitted:   isOvercommitted,
		OverloadWarning:   warning,
		AreasBreakdown:    breakdowns,
	}
}
