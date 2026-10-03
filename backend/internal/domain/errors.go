package domain

import "errors"

var (
	ErrNotFound            = errors.New("resource not found")
	ErrInvalidInput        = errors.New("invalid input")
	ErrInvalidStatus       = errors.New("invalid status transition")
	ErrGoalIncomplete      = errors.New("goal must answer What, Why, By When, and Success Definition")
	ErrMilestoneRequired   = errors.New("action must belong to a milestone and goal")
	ErrAreaRequired        = errors.New("goal must belong to an area")
	ErrReviewAlreadyClosed = errors.New("review has already been completed")
)
