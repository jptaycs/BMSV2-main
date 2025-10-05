package models

import "time"

type Blotter struct {
	ID           uint
	Type         string    `gorm:"not null"`
	ReportedBy   string    `gorm:"not null"`
	Involved     string    `gorm:"not null"`
	IncidentDate time.Time `gorm:"type:datetime;not null"`
	Location     string    `gorm:"not null"`
	Zone         string    `gorm:"not null"`
	Status       string    `gorm:"not null"`
	Narrative    string    `gorm:"not null"`
	Action       string    `gorm:"not null"`
	Witnesses    string    `gorm:"not null"`
	Evidence     string    `gorm:"not null"`
	Resolution   string    `gorm:"not null"`
	HearingDate  time.Time `gorm:"type:datetime;not null"`
}
