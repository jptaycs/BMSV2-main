package models

import "time"

type Resident struct {
	Firstname             *string `gorm:"not null"`
	Middlename            *string
	Lastname              *string    `gorm:"not null"`
	CivilStatus           *string    `gorm:"not null"`
	Gender                *string    `gorm:"not null"`
	Nationality           *string    `gorm:"not null"`
	Religion              *string    `gorm:"not null"`
	Status                *string    `gorm:"not null"`
	Birthplace            *string    `gorm:"not null"`
	EducationalAttainment *string    `gorm:"not null"`
	Zone                  *uint      `gorm:"not null"`
	Barangay              *string    `gorm:"not null"`
	Town                  *string    `gorm:"not null"`
	Province              *string    `gorm:"not null"`
	Birthday              *time.Time `gorm:"type:date;not null"`
	IsVoter               *bool      `gorm:"type:tinyint(1);default:0"`
	IsPWD                 *bool      `gorm:"type:tinyint(1)"`
	IsSolo                *bool      `gorm:"type:tinyint(1)"`
	IsSenior              *bool      `gorm:"type:tinyint(1)"`
	Image                 *[]byte    `gorm:"type:blob"`
	Suffix                *string
	Occupation            *string
	AvgIncome             *float64
	MobileNumber          *string
	ID                    uint
}
