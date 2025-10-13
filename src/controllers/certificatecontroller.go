package controllers

import (
	"net/http"
	"server/lib"
	"server/src/models"

	"github.com/gin-gonic/gin"
)

type CertificateController struct{}

// GET /certificates or /certificates/:id
func (CertificateController) Get(ctx *gin.Context) {
	id := ctx.Param("id")

	if id != "" {
		var cert models.Certificate
		if err := lib.Database.First(&cert, id).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Certificate not found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"certificate": cert})
	} else {
		var certs []models.Certificate
		if err := lib.Database.Find(&certs).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"certificates": certs})
	}
}

// POST /certificates
func (CertificateController) Post(ctx *gin.Context) {
	var certReq models.Certificate
	if err := ctx.ShouldBindJSON(&certReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := lib.Database.Create(&certReq).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"certificate": certReq})
}

// PATCH /certificates/:id
func (CertificateController) Patch(ctx *gin.Context) {
	var cert models.Certificate

	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide certificate id"})
		return
	}

	if err := lib.Database.First(&cert, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Certificate not found"})
		return
	}

	var patchData map[string]interface{}
	if err := ctx.ShouldBindJSON(&patchData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := lib.Database.Model(&cert).Updates(patchData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, cert)
}

// DELETE /certificates
func (CertificateController) Delete(ctx *gin.Context) {
	certReq := struct {
		Certificates []int `json:"ids" binding:"required"`
	}{}

	if err := ctx.ShouldBindJSON(&certReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(certReq.Certificates) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please select a certificate"})
		return
	}

	if err := lib.Database.Delete(&models.Certificate{}, certReq.Certificates).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	ctx.JSON(http.StatusNoContent, gin.H{})
}
