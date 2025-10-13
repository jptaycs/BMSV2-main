package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"
	"time"

	"github.com/gin-gonic/gin"
)

type YouthController struct{}

// GET /youth or /youth/:id
func (YouthController) Get(ctx *gin.Context) {
	id := ctx.Param("id")
	if id != "" {
		var youth models.Youth
		if err := lib.Database.First(&youth, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Youth not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"youth": youth})
	} else {
		var youths []models.Youth
		if err := lib.Database.Find(&youths).Error; err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"youths": youths})
	}
}

// POST /youth
func (YouthController) Post(ctx *gin.Context) {
	youthReq := struct {
		Firstname              string     `json:"Firstname"`
		Middlename             *string    `json:"Middlename"`
		Lastname               string     `json:"Lastname"`
		Suffix                 *string    `json:"Suffix"`
		Gender                 string     `json:"Gender"`
		Birthday               *time.Time `json:"Birthday"`
		Zone                   *uint      `json:"Zone"`
		Address                *string    `json:"Address"`
		EmailAddress           *string    `json:"EmailAddress"`
		ContactNumber          *string    `json:"ContactNumber"`
		EducationalBackground  string     `json:"EducationalBackground"`
		WorkStatus             string     `json:"WorkStatus"`
		InSchoolYouth          bool       `json:"InSchoolYouth"`
		OutOfSchoolYouth       bool       `json:"OutOfSchoolYouth"`
		WorkingYouth           bool       `json:"WorkingYouth"`
		YouthWithSpecificNeeds bool       `json:"YouthWithSpecificNeeds"`
		IsSKVoter              bool       `json:"IsSKVoter"`
		Image                  *[]byte    `json:"Image"`
	}{}

	if err := ctx.ShouldBindJSON(&youthReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	youth := models.Youth{
		Firstname:              &youthReq.Firstname,
		Middlename:             youthReq.Middlename,
		Lastname:               &youthReq.Lastname,
		Suffix:                 youthReq.Suffix,
		Gender:                 &youthReq.Gender,
		Birthday:               youthReq.Birthday,
		Zone:                   youthReq.Zone,
		Address:                youthReq.Address,
		EmailAddress:           youthReq.EmailAddress,
		ContactNumber:          youthReq.ContactNumber,
		EducationalBackground:  &youthReq.EducationalBackground,
		WorkStatus:             &youthReq.WorkStatus,
		InSchoolYouth:          youthReq.InSchoolYouth,
		OutOfSchoolYouth:       youthReq.OutOfSchoolYouth,
		WorkingYouth:           youthReq.WorkingYouth,
		YouthWithSpecificNeeds: youthReq.YouthWithSpecificNeeds,
		IsSKVoter:              youthReq.IsSKVoter,
		Image:                  youthReq.Image,
	}

	if err := lib.Database.Create(&youth).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"youth": youth})
}

// DELETE /youth
func (YouthController) Delete(ctx *gin.Context) {
	req := struct {
		IDs []int `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.IDs) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select at least one youth"})
		return
	}

	if err := lib.Database.Delete(&models.Youth{}, req.IDs).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}

// PATCH /youth/:id
func (YouthController) Patch(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide youth id"})
		return
	}

	var youth models.Youth
	if err := lib.Database.First(&youth, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Youth not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := lib.Database.Model(&youth).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"youth": youth})
}
