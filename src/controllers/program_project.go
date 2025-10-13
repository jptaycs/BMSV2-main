package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type ProgramProjectController struct{}

func (ProgramProjectController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var programProject models.ProgramProject
		if err := lib.Database.First(&programProject, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Program/project not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"program_project": programProject})
	} else {
		var programProjects []models.ProgramProject
		if err := lib.Database.Find(&programProjects).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"program_projects": programProjects})
	}
}

func (ProgramProjectController) Post(ctx *gin.Context) {
	req := struct {
		Name           string     `json:"Name" binding:"required"`
		Type           string     `json:"Type" binding:"required"`
		Description    string     `json:"Description"`
		StartDate      time.Time  `json:"StartDate" binding:"required"`
		EndDate        *time.Time `json:"EndDate"`
		Location       string     `json:"Location" binding:"required"`
		Beneficiaries  string     `json:"Beneficiaries"`
		Budget         float64    `json:"Budget" binding:"required"`
		SourceOfFunds  string     `json:"SourceOfFunds"`
		ProjectManager string     `json:"ProjectManager"`
		Status         string     `json:"Status" binding:"required"`
	}{}

	if err := ctx.ShouldBindBodyWithJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	programProject := models.ProgramProject{
		Name:           req.Name,
		Type:           req.Type,
		Description:    req.Description,
		StartDate:      req.StartDate,
		EndDate:        req.EndDate,
		Location:       req.Location,
		Beneficiaries:  req.Beneficiaries,
		Budget:         req.Budget,
		SourceOfFunds:  req.SourceOfFunds,
		ProjectManager: req.ProjectManager,
		Status:         req.Status,
	}

	if err := lib.Database.Create(&programProject).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"program_project": programProject})
}

func (ProgramProjectController) Patch(ctx *gin.Context) {
	var programProject models.ProgramProject

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide program/project id"})
		return
	}

	if err := lib.Database.First(&programProject, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Program/project not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse StartDate and EndDate if present
	if startDateStr, ok := patchData["StartDate"].(string); ok {
		parsedStartDate, err := time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid StartDate format"})
			return
		}
		patchData["StartDate"] = parsedStartDate
	}
	if endDateStr, ok := patchData["EndDate"].(string); ok {
		if endDateStr == "" {
			patchData["EndDate"] = nil
		} else {
			parsedEndDate, err := time.Parse(time.RFC3339, endDateStr)
			if err != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid EndDate format"})
				return
			}
			patchData["EndDate"] = &parsedEndDate
		}
	}
	if err := lib.Database.Model(&programProject).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, programProject)
}

func (ProgramProjectController) Delete(ctx *gin.Context) {
	req := struct {
		ProgramProjects []int `json:"ids" binding:"required"`
	}{}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.ProgramProjects) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select a program/project"})
		return
	}

	if err := lib.Database.Delete(&models.ProgramProject{}, req.ProgramProjects).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}
