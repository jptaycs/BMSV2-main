package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type EventController struct{}

func (EventController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var event models.Event
		if err := lib.Database.First(&event).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}
	} else {
		var events []models.Event
		if err := lib.Database.Find(&events).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"events": events})
	}
}

func (EventController) Post(ctx *gin.Context) {
	eventReq := struct {
		Name     string    `json:"name" binding:"required"`
		Type     string    `json:"type" binding:"required"`
		Venue    string    `json:"venue" binding:"required"`
		Audience string    `json:"audience" binding:"required"`
		Notes    string    `json:"notes" binding:"required"`
		Status   string    `json:"status" binding:"required"`
		Date     time.Time `json:"date" binding:"required"`
	}{}

	if err := ctx.ShouldBindBodyWithJSON(&eventReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event := models.Event{
		Name:     eventReq.Name,
		Type:     eventReq.Type,
		Venue:    eventReq.Venue,
		Audience: eventReq.Audience,
		Notes:    eventReq.Notes,
		Status:   eventReq.Status,
		Date:     eventReq.Date,
	}

	if err := lib.Database.Create(&event).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"event": event})
}

func (EventController) Patch(ctx *gin.Context) {
	var event models.Event

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide event id"})
		return
	}

	if err := lib.Database.First(&event, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if dateStr, ok := patchData["Date"].(string); ok {
		parsedData, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		patchData["Date"] = parsedData
	}
	if err := lib.Database.Model(&event).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, event)
}

func (EventController) Delete(ctx *gin.Context) {
	eventReq := struct {
		Events []int `json:"ids" binding:"required"`
	}{}
	if err := ctx.ShouldBindJSON(&eventReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(eventReq.Events) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select an event"})
		return
	}

	if err := lib.Database.Delete(&models.Event{}, eventReq.Events).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}
