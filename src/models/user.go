package models

type User struct {
	Username string `gorm:"not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"not null"`
	ID       uint
}
