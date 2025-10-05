package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type OfficialController struct{}

func (OfficialController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var official models.Official
		if err := lib.Database.First(&official, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Official not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"officials": official})
	} else {
		var officials []models.Official
		if err := lib.Database.Find(&officials).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"officials": officials})
	}
}

func (OfficialController) Post(ctx *gin.Context) {
	officialReq := struct {
		Name      string    `json:"Name" binding:"required"`
		Role      string    `json:"Role" binding:"required"`
		Image     string    `json:"Image"`
		Section   string    `json:"Section"`
		Age       int       `json:"Age"`
		Contact   string    `json:"Contact"`
		TermStart time.Time `json:"TermStart" binding:"required"`
		TermEnd   time.Time `json:"TermEnd" binding:"required"`
		Zone      string    `json:"Zone"`
	}{}

	if err := ctx.ShouldBindJSON(&officialReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	official := models.Official{
		Name:      officialReq.Name,
		Role:      officialReq.Role,
		Image:     officialReq.Image,
		Section:   officialReq.Section,
		Age:       officialReq.Age,
		Contact:   officialReq.Contact,
		TermStart: officialReq.TermStart,
		TermEnd:   officialReq.TermEnd,
		Zone:      officialReq.Zone,
	}

	if err := lib.Database.Create(&official).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"official": official})
}

func (OfficialController) Patch(ctx *gin.Context) {
	var official models.Official

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide official id"})
		return
	}

	if err := lib.Database.First(&official, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Official not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if dateStr, ok := patchData["TermStart"].(string); ok {
		parsedData, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		patchData["TermStart"] = parsedData.Format("2006-01-02")
	}
	if dateStr, ok := patchData["TermEnd"].(string); ok {
		parsedData, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		patchData["TermEnd"] = parsedData.Format("2006-01-02")
	}

	if err := lib.Database.Model(&official).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, official)
}

func (OfficialController) Delete(ctx *gin.Context) {
	officialReq := struct {
		Officials []int `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&officialReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(officialReq.Officials) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select an official"})
		return
	}

	if err := lib.Database.Delete(&models.Official{}, officialReq.Officials).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	ctx.JSON(http.StatusNoContent, gin.H{})
}
