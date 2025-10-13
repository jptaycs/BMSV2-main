package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type LogbookController struct{}

func (LogbookController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var logbook models.Logbook
		if err := lib.Database.First(&logbook, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Logbook not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"logbooks": logbook})
	} else {
		var logbooks []models.Logbook
		if err := lib.Database.Find(&logbooks).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"logbooks": logbooks})
	}
}

func (LogbookController) Post(ctx *gin.Context) {
	logbookReq := struct {
		Name       string    `json:"Name" binding:"required"`
		Date       time.Time `json:"Date" binding:"required"`
		TimeInAm   *string   `json:"TimeInAm,omitempty"`
		TimeOutAm  *string   `json:"TimeOutAm,omitempty"`
		TimeInPm   *string   `json:"TimeInPm,omitempty"`
		TimeOutPm  *string   `json:"TimeOutPm,omitempty"`
		Remarks    *string   `json:"Remarks,omitempty"`
		Status     *string   `json:"Status,omitempty"`
		TotalHours *int      `json:"TotalHours,omitempty"`
	}{}

	if err := ctx.ShouldBindJSON(&logbookReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logbook := models.Logbook{
		Name:       logbookReq.Name,
		Date:       logbookReq.Date,
		TimeInAm:   logbookReq.TimeInAm,
		TimeOutAm:  logbookReq.TimeOutAm,
		TimeInPm:   logbookReq.TimeInPm,
		TimeOutPm:  logbookReq.TimeOutPm,
		Remarks:    logbookReq.Remarks,
		Status:     logbookReq.Status,
		TotalHours: logbookReq.TotalHours,
	}

	if err := lib.Database.Create(&logbook).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"logbook": logbook})
}

func (LogbookController) Patch(ctx *gin.Context) {
	var logbook models.Logbook

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide logbook id"})
		return
	}

	if err := lib.Database.First(&logbook, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Logbook not found"})
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

	if err := lib.Database.Model(&logbook).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, logbook)
}

func (LogbookController) Delete(ctx *gin.Context) {
	logbookReq := struct {
		Logbooks []int `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&logbookReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(logbookReq.Logbooks) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select a logbook"})
		return
	}

	if err := lib.Database.Delete(&models.Logbook{}, logbookReq.Logbooks).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	ctx.JSON(http.StatusNoContent, gin.H{})
}
