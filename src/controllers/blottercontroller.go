package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type BlotterController struct{}

func (BlotterController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var blotter models.Blotter
		if err := lib.Database.First(&blotter, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Blotter not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"blotters": blotter})
	} else {
		var blotters []models.Blotter
		if err := lib.Database.Find(&blotters).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"blotters": blotters})
	}
}

func (BlotterController) Post(ctx *gin.Context) {
	blotterReq := struct {
		Type         string    `json:"Type" binding:"required"`
		ReportedBy   string    `json:"ReportedBy" binding:"required"`
		Involved     string    `json:"Involved" binding:"required"`
		IncidentDate time.Time `json:"IncidentDate" binding:"required"`
		Location     string    `json:"Location" binding:"required"`
		Zone         string    `json:"Zone" binding:"required"`
		Status       string    `json:"Status" binding:"required"`
		Narrative    string    `json:"Narrative" binding:"required"`
		Action       string    `json:"Action" binding:"required"`
		Witnesses    string    `json:"Witnesses" binding:"required"`
		Evidence     string    `json:"Evidence" binding:"required"`
		Resolution   string    `json:"Resolution" binding:"required"`
		HearingDate  time.Time `json:"HearingDate" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&blotterReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	blotter := models.Blotter{
		Type:         blotterReq.Type,
		ReportedBy:   blotterReq.ReportedBy,
		Involved:     blotterReq.Involved,
		IncidentDate: blotterReq.IncidentDate,
		Location:     blotterReq.Location,
		Zone:         blotterReq.Zone,
		Status:       blotterReq.Status,
		Narrative:    blotterReq.Narrative,
		Action:       blotterReq.Action,
		Witnesses:    blotterReq.Witnesses,
		Evidence:     blotterReq.Evidence,
		Resolution:   blotterReq.Resolution,
		HearingDate:  blotterReq.HearingDate,
	}

	if err := lib.Database.Create(&blotter).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"blotter": blotter})
}

func (BlotterController) Patch(ctx *gin.Context) {
	var blotter models.Blotter

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide blotter id"})
		return
	}

	if err := lib.Database.First(&blotter, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Blotter not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if dateStr, ok := patchData["IncidentDate"].(string); ok {
		parsedData, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid IncidentDate format"})
			return
		}
		patchData["IncidentDate"] = parsedData
	}
	if dateStr, ok := patchData["HearingDate"].(string); ok {
		parsedData, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid HearingDate format"})
			return
		}
		patchData["HearingDate"] = parsedData
	}
	if err := lib.Database.Model(&blotter).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, blotter)
}

func (BlotterController) Delete(ctx *gin.Context) {
	blotterReq := struct {
		Blotters []int `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&blotterReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(blotterReq.Blotters) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select a blotter"})
		return
	}

	if err := lib.Database.Delete(&models.Blotter{}, blotterReq.Blotters).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	ctx.JSON(http.StatusNoContent, gin.H{})
}
