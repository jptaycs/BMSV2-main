package main

import (
	"server/src/controllers"

	"github.com/gin-gonic/gin"
)

func APIRoutes(router *gin.Engine) {
	controller := &controllers.Controller{}

	api := router.Group("api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("login", controller.Auth.Login)
		}
		resident := api.Group("/residents")
		{
			resident.GET("", controller.Resident.Get)
			resident.GET("/:id", controller.Resident.Get)
			resident.POST("", controller.Resident.Post)
			resident.PATCH(":id", controller.Resident.Patch)
			resident.DELETE("", controller.Resident.Delete)
		}
		event := api.Group("/events")
		{
			event.GET("", controller.Event.Get)
			event.GET("/:id", controller.Event.Get)
			event.POST("", controller.Event.Post)
			event.PATCH("/:id", controller.Event.Patch)
			event.DELETE("", controller.Event.Delete)
		}
		certificate := api.Group("/certificates")
		{
			certificate.GET("", controller.Certificate.Get)
			certificate.GET("/:id", controller.Certificate.Get)
			certificate.POST("", controller.Certificate.Post)
			certificate.PATCH("/:id", controller.Certificate.Patch)
			certificate.DELETE("", controller.Certificate.Delete)
		}
		household := api.Group("/households")
		{
			household.GET("", controller.Household.Get)
			household.GET("/:id", controller.Household.GetOne)
			household.POST("", controller.Household.Post)
			household.PATCH("/:id", controller.Household.Patch)
			household.DELETE("", controller.Household.Delete)
		}
		income := api.Group("/incomes")
		{
			income.GET("", controller.Income.Get)
			income.GET("/:id", controller.Income.Get)
			income.POST("", controller.Income.Post)
			income.PATCH("/:id", controller.Income.Patch)
			income.DELETE("", controller.Income.Delete)
		}
		expense := api.Group("/expenses")
		{
			expense.GET("", controller.Expense.Get)
			expense.GET("/:id", controller.Expense.Get)
			expense.POST("", controller.Expense.Post)
			expense.PATCH("/:id", controller.Expense.Patch)
			expense.DELETE("", controller.Expense.Delete)
		}
		logbook := api.Group("/logbooks")
		{
			logbook.GET("", controller.Logbook.Get)
			logbook.GET("/:id", controller.Logbook.Get)
			logbook.POST("", controller.Logbook.Post)
			logbook.PATCH("/:id", controller.Logbook.Patch)
			logbook.DELETE("", controller.Logbook.Delete)
		}
		blotter := api.Group("/blotters")
		{
			blotter.GET("", controller.Blotter.Get)
			blotter.GET("/:id", controller.Blotter.Get)
			blotter.POST("", controller.Blotter.Post)
			blotter.PATCH("/:id", controller.Blotter.Patch)
			blotter.DELETE("", controller.Blotter.Delete)
		}
		official := api.Group("/officials")
		{
			official.GET("", controller.Official.Get)
			official.GET("/:id", controller.Official.Get)
			official.POST("", controller.Official.Post)
			official.PATCH("/:id", controller.Official.Patch)
			official.DELETE("", controller.Official.Delete)
		}
		setting := api.Group("/settings")
		{
			setting.GET("", controller.Setting.Get)
			setting.GET("/:id", controller.Setting.Get)
			setting.POST("", controller.Setting.Post)
			setting.PATCH("/:id", controller.Setting.Patch)
			setting.DELETE("", controller.Setting.Delete)
		}
		mapping := api.Group("/mappings")
		{
			mapping.GET("", controller.Mapping.Get)
			mapping.POST("", controller.Mapping.Post)
			mapping.DELETE("/:id", controller.Mapping.Delete)
		}
		programProject := api.Group("/program-projects")
		{
			programProject.GET("", controller.ProgramProject.Get)
			programProject.GET("/:id", controller.ProgramProject.Get)
			programProject.POST("", controller.ProgramProject.Post)
			programProject.PATCH("/:id", controller.ProgramProject.Patch)
			programProject.DELETE("", controller.ProgramProject.Delete)
		}
		govDocs := api.Group("/govdocs")
		{
			govDocs.GET("", controller.GovDocs.Get)
			govDocs.GET("/:id", controller.GovDocs.Get)
			govDocs.POST("", controller.GovDocs.Post)
			govDocs.PATCH("/:id", controller.GovDocs.Patch)
			govDocs.DELETE("", controller.GovDocs.Delete)
		}
		youth := api.Group("/youths")
		{
			youth.GET("", controller.Youth.Get)
			youth.GET("/:id", controller.Youth.Get)
			youth.POST("", controller.Youth.Post)
			youth.PATCH("/:id", controller.Youth.Patch)
			youth.DELETE("", controller.Youth.Delete)
		}
	}
}
