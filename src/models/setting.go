package models

type Setting struct {
	Barangay     string `gorm:"not null"`
	Municipality string `gorm:"not null"`
	Province     string `gorm:"not null"`
	PhoneNumber  string `gorm:"not null"`
	Email        string `gorm:"not null"`
	ImageB       string `gorm:"type:longtext"`
	ImageM       string `gorm:"type:longtext"`
	ID           uint
}
