package sqlite

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

type DB struct {
	SQL *sql.DB
}

// NewDB initializes SQLite with WAL mode, foreign keys, and executes the baseline schema.
func NewDB(dbPath string) (*DB, error) {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create db directory: %w", err)
	}

	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	// Pragmas for performance and data integrity
	pragmas := []string{
		"PRAGMA foreign_keys = ON;",
		"PRAGMA journal_mode = WAL;",
		"PRAGMA busy_timeout = 5000;",
		"PRAGMA synchronous = NORMAL;",
	}

	for _, p := range pragmas {
		if _, err := conn.Exec(p); err != nil {
			conn.Close()
			return nil, fmt.Errorf("failed to set pragma %q: %w", p, err)
		}
	}

	// Execute Schema
	if _, err := conn.Exec(Schema); err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to execute schema: %w", err)
	}

	return &DB{SQL: conn}, nil
}

func (db *DB) Close() error {
	if db.SQL != nil {
		return db.SQL.Close()
	}
	return nil
}
