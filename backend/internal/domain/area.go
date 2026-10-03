package domain

import (
	"strings"
	"time"
)

// Area represents a broad life area (Career, Health, Learning, Finance, etc.).
// Provides organization but does not represent achievement (FDR §5).
type Area struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Color       string    `json:"color"` // e.g. #3b82f6 for UI accents
	Icon        string    `json:"icon"`  // e.g. "briefcase", "activity", "book-open"
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func NewArea(id, name, description, color, icon string) (*Area, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, ErrInvalidInput
	}
	if color == "" {
		color = "#6366f1"
	}
	now := time.Now().UTC()
	return &Area{
		ID:          id,
		Name:        name,
		Description: strings.TrimSpace(description),
		Color:       color,
		Icon:        icon,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}
