package models

type Health struct {
	Resident       Resident
	ResidentID     uint   `gorm:"not null"`
	DisabilityType string `gorm:"not null"`
	ID             uint
}
