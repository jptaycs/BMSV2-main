package seeder

import "server/src/models"

var Users = []models.User{
	{
		Role:     "captain",
		Username: "captain",
		Password: "captain",
	},
	{
		Role:     "secretary",
		Username: "secretary",
		Password: "secretary",
	},
	{
		Role:     "treasurer",
		Username: "treasurer",
		Password: "treasurer",
	},
}
