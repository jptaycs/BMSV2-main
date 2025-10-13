package models

import "time"

type Logbook struct {
	ID         uint
	Name       string    `gorm:"not null"`
	Date       time.Time `gorm:"type:date;not null"`
	TimeInAm   *string   `gorm:"type:varchar(10)"`
	TimeOutAm  *string   `gorm:"type:varchar(10)"`
	TimeInPm   *string   `gorm:"type:varchar(10)"`
	TimeOutPm  *string   `gorm:"type:varchar(10)"`
	Remarks    *string   `gorm:"type:text"`
	Status     *string   `gorm:"type:varchar(50)"`
	TotalHours *int
}
