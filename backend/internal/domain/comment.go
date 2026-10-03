package domain

import (
	"strings"
	"time"
)

// Comment represents a reflection note, blocker update, or progress log on a goal.
type Comment struct {
	ID        string    `json:"id"`
	GoalID    string    `json:"goalId"`
	Author    string    `json:"author"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

// NewComment validates and creates a new comment on a goal.
func NewComment(id, goalID, author, content string) (*Comment, error) {
	id = strings.TrimSpace(id)
	goalID = strings.TrimSpace(goalID)
	content = strings.TrimSpace(content)
	author = strings.TrimSpace(author)

	if id == "" || goalID == "" || content == "" {
		return nil, ErrCommentEmpty
	}

	if author == "" {
		author = "User"
	}

	return &Comment{
		ID:        id,
		GoalID:    goalID,
		Author:    author,
		Content:   content,
		CreatedAt: time.Now().UTC(),
	}, nil
}
