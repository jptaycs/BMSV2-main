package models

import "time"

type Expense struct {
	Category string    `gorm:"not null"`
	Type     string    `gorm:"not null"`
	Amount   float64   `gorm:"not null"`
	OR       string    `gorm:"not null"`
	PaidTo   string    `gorm:"not null"`
	PaidBy   string    `gorm:"not null"`
	Date     time.Time `gorm:"type:date;not null"`
	ID       uint
}
