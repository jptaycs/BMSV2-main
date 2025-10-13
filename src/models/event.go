package models

import "time"

type Event struct {
	Name     string    `gorm:"not null"`
	Type     string    `gorm:"not null"`
	Venue    string    `gorm:"not null"`
	Audience string    `gorm:"not null"`
	Notes    string    `gorm:"not null"`
	Status   string    `gorm:"not null"`
	Date     time.Time `gorm:"type:date;not null"`
	ID       uint
}
