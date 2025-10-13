package models

import "time"

type GovDocs struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"`
	Title       string    `gorm:"not null"`
	Type        string    `gorm:"not null"` // Executive Order, Resolution, Ordinance
	Description string    `gorm:"type:text"`
	DateIssued  time.Time `gorm:"type:date;not null"`
	Image       string    `gorm:"type:text"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
