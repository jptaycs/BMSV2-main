package models

import "time"

type ProgramProject struct {
	ID             uint   `gorm:"primaryKey;autoIncrement"`
	Name           string `gorm:"not null"`
	Type           string `gorm:"not null"` // "Program" or "Project"
	Description    string
	StartDate      time.Time  `gorm:"type:date;not null"`
	EndDate        *time.Time `gorm:"type:date"`
	Location       string     `gorm:"not null"`
	Beneficiaries  string
	Budget         float64 `gorm:"not null"`
	SourceOfFunds  string
	ProjectManager string
	Status         string `gorm:"not null"` // Planned, Ongoing, Completed, Cancelled
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
