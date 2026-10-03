package domain

import (
	"strings"
	"time"
)

type ReviewStatus string

const (
	ReviewStatusDraft     ReviewStatus = "Draft"
	ReviewStatusCompleted ReviewStatus = "Completed"
)

// WeeklyReview is a first-class domain entity representing the weekly reflection ritual (FDR §10).
// Enforces the core product loop: Define → Plan → Execute → Review → Adjust.
type WeeklyReview struct {
	ID                    string       `json:"id"`
	StartDate             time.Time    `json:"startDate"`
	EndDate               time.Time    `json:"endDate"`
	Status                ReviewStatus `json:"status"`
	CompletedActionsCount int          `json:"completedActionsCount"`
	MissedActionsCount    int          `json:"missedActionsCount"`
	GoalsReviewedCount    int          `json:"goalsReviewedCount"`
	WhatWorked            string       `json:"whatWorked"`            // What worked this week?
	WhatDidNotWork        string       `json:"whatDidNotWork"`        // What did not work?
	WhatToChangeNextWeek  string       `json:"whatToChangeNextWeek"`  // What should change next week?
	KeyLearnings          string       `json:"keyLearnings"`          // Additional insights
	CompletedAt           *time.Time   `json:"completedAt,omitempty"`
	CreatedAt             time.Time    `json:"createdAt"`
	UpdatedAt             time.Time    `json:"updatedAt"`
}

func NewWeeklyReview(id string, startDate, endDate time.Time) (*WeeklyReview, error) {
	if startDate.IsZero() || endDate.IsZero() || endDate.Before(startDate) {
		return nil, ErrInvalidInput
	}
	now := time.Now().UTC()
	return &WeeklyReview{
		ID:        id,
		StartDate: startDate,
		EndDate:   endDate,
		Status:    ReviewStatusDraft,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// Complete saves reflection insights and finalizes the review.
func (r *WeeklyReview) Complete(whatWorked, whatDidNotWork, whatToChange, learnings string) error {
	if r.Status == ReviewStatusCompleted {
		return ErrReviewAlreadyClosed
	}
	now := time.Now().UTC()
	r.WhatWorked = strings.TrimSpace(whatWorked)
	r.WhatDidNotWork = strings.TrimSpace(whatDidNotWork)
	r.WhatToChangeNextWeek = strings.TrimSpace(whatToChange)
	r.KeyLearnings = strings.TrimSpace(learnings)
	r.Status = ReviewStatusCompleted
	r.CompletedAt = &now
	r.UpdatedAt = now
	return nil
}
