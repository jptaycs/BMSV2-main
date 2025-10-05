package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type ResidentController struct{}

func (ResidentController) Get(ctx *gin.Context) {
	id := ctx.Param("id")
	if id != "" {
		var resident models.Resident
		if err := lib.Database.First(&resident, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Resident not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"resident": resident})
	} else {
		var residents []models.Resident
		if err := lib.Database.Find(&residents).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"residents": residents})
	}
}

func (ResidentController) Post(ctx *gin.Context) {
	residentReq := struct {
		Firstname             string    `json:"Firstname" binding:"required"`
		Middlename            *string   `json:"Middlename"`
		Lastname              string    `json:"Lastname" binding:"required"`
		CivilStatus           string    `json:"CivilStatus" binding:"required"`
		Gender                string    `json:"Gender" binding:"required"`
		Nationality           string    `json:"Nationality" binding:"required"`
		Religion              string    `json:"Religion" binding:"required"`
		Status                string    `json:"Status" binding:"required"`
		Birthplace            string    `json:"Birthplace" binding:"required"`
		Zone                  uint      `json:"Zone" binding:"required"`
		Barangay              string    `json:"barangay" binding:"required"`
		Town                  string    `json:"town" binding:"required"`
		Province              string    `json:"province" binding:"required"`
		EducationalAttainment string    `json:"EducationalAttainment" binding:"required"`
		Birthday              time.Time `json:"Birthday" binding:"required"`
		IsVoter               bool      `json:"IsVoter"`
		IsPwd                 bool      `json:"IsPwd"`
		IsSenior              bool      `json:"IsSenior"`
		IsSolo                bool      `json:"IsSolo"`
		Image                 *[]byte   `json:"Image"`
		Suffix                *string   `json:"Suffix"`
		Occupation            *string   `json:"Occupation"`
		AvgIncome             *float64  `json:"AvgIncome"`
		MobileNumber          *string   `json:"MobileNumber"`
	}{}

	if err := ctx.ShouldBindBodyWithJSON(&residentReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resident := models.Resident{
		Firstname:             &residentReq.Firstname,
		Middlename:            residentReq.Middlename,
		Lastname:              &residentReq.Lastname,
		CivilStatus:           &residentReq.CivilStatus,
		Gender:                &residentReq.Gender,
		Nationality:           &residentReq.Nationality,
		Religion:              &residentReq.Religion,
		Status:                &residentReq.Status,
		Birthplace:            &residentReq.Birthplace,
		EducationalAttainment: &residentReq.EducationalAttainment,
		Birthday:              &residentReq.Birthday,
		IsVoter:               &residentReq.IsVoter,
		IsPWD:                 &residentReq.IsPwd,
		IsSenior:              &residentReq.IsSenior,
		IsSolo:                &residentReq.IsSolo,
		Image:                 residentReq.Image,
		Zone:                  &residentReq.Zone,
		Barangay:              &residentReq.Barangay,
		Town:                  &residentReq.Town,
		Province:              &residentReq.Province,
		Suffix:                residentReq.Suffix,
		Occupation:            residentReq.Occupation,
		AvgIncome:             residentReq.AvgIncome,
		MobileNumber:          residentReq.MobileNumber,
	}

	if err := lib.Database.Create(&resident).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"resident": resident})
}

func (ResidentController) Delete(ctx *gin.Context) {
	residentReq := struct {
		Residents []int `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&residentReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(residentReq.Residents) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select a resident"})
		return
	}

	if err := lib.Database.Delete(&models.Resident{}, residentReq.Residents).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}

func (ResidentController) Patch(ctx *gin.Context) {
	var resident models.Resident

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide resident id"})
		return
	}

	if err := lib.Database.First(&resident, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Resident not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := lib.Database.Model(&resident).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, resident)
}
