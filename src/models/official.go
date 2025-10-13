package models

import "time"

type Official struct {
	ID        uint
	Name      string    `gorm:"not null"`
	Role      string    `gorm:"not null"`
	Image     string    `gorm:"type:longtext"`
	Section   string    `gorm:"not null"`
	Age       int       `gorm:"not null"`
	Contact   string    `gorm:"not null"`
	TermStart time.Time `gorm:"type:date;not null"`
	TermEnd   time.Time `gorm:"type:date;not null"`
	Zone      string    `gorm:"not null"`
}
