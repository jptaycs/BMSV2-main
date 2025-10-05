package models

import "time"

type Income struct {
	Category     string    `gorm:"not null"`
	Type         string    `gorm:"not null"`
	Amount       float64   `gorm:"not null"`
	OR           string    `gorm:"not null"`
	ReceivedFrom string    `gorm:"not null"`
	ReceivedBy   string    `gorm:"not null"`
	DateReceived time.Time `gorm:"type:date;not null"`
	ID           uint
}
