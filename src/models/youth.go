package models

import "time"

type Youth struct {
	ID                     uint       `gorm:"primaryKey" json:"ID"`
	Firstname              *string    `json:"Firstname"`
	Middlename             *string    `json:"Middlename"`
	Lastname               *string    `json:"Lastname"`
	Suffix                 *string    `json:"Suffix"`
	Gender                 *string    `json:"Gender"`
	CivilStatus            string     `json:"CivilStatus"`
	Birthday               *time.Time `json:"Birthday"`
	Zone                   *uint      `json:"Zone"`
	Address                *string    `json:"Address"`
	EmailAddress           *string    `json:"EmailAddress"`
	ContactNumber          *string    `json:"ContactNumber"`
	EducationalBackground  *string    `json:"EducationalBackground"`
	WorkStatus             *string    `json:"WorkStatus"`
	InSchoolYouth          bool       `json:"InSchoolYouth"`
	OutOfSchoolYouth       bool       `json:"OutOfSchoolYouth"`
	WorkingYouth           bool       `json:"WorkingYouth"`
	YouthWithSpecificNeeds bool       `json:"YouthWithSpecificNeeds"`
	IsSKVoter              bool       `json:"IsSKVoter"`
	Image                  *[]byte    `json:"Image"`
	CreatedAt              time.Time  `json:"CreatedAt"`
	UpdatedAt              time.Time  `json:"UpdatedAt"`
}
