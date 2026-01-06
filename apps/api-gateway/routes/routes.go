package routes

import (
	"github.com/BayajidAlam/jatra/api-gateway/config"
	"github.com/BayajidAlam/jatra/api-gateway/middleware"
	"github.com/BayajidAlam/jatra/api-gateway/proxy"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "service": "api-gateway"})
	})

	api := router.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			auth.POST("/login", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			auth.POST("/refresh-token", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			auth.POST("/logout", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			auth.GET("/me", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
		}

		users := api.Group("/users")
		users.Use(middleware.JWTAuth())
		{
			users.GET("/me", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
			users.PATCH("/me", proxy.ProxyRequest(config.AppConfig.AuthServiceURL))
		}

		trains := api.Group("/trains")
		{
			trains.GET("", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			trains.GET("/:id", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			trains.GET("/number/:trainNumber", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			trains.POST("", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
		}

		stations := api.Group("/stations")
		{
			stations.GET("", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			stations.GET("/:id", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			stations.GET("/code/:code", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			stations.POST("", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
		}

		routes := api.Group("/routes")
		{
			routes.GET("", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			routes.GET("/:id", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			routes.POST("", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
		}

		journeys := api.Group("/journeys")
		{
			journeys.GET("/search", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			journeys.GET("/:id", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			journeys.GET("/train/:trainId", proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
			journeys.POST("", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.ScheduleServiceURL))
		}

		locks := api.Group("/locks")
		locks.Use(middleware.JWTAuth())
		{
			locks.POST("/acquire", proxy.ProxyRequest(config.AppConfig.SeatReservationServiceURL))
			locks.GET("/availability/:journeyId", proxy.ProxyRequest(config.AppConfig.SeatReservationServiceURL))
			locks.GET("/check/:id", proxy.ProxyRequest(config.AppConfig.SeatReservationServiceURL))
			locks.POST("/extend/:id", proxy.ProxyRequest(config.AppConfig.SeatReservationServiceURL))
			locks.POST("/release/:id", proxy.ProxyRequest(config.AppConfig.SeatReservationServiceURL))
			locks.GET("/user/me", proxy.ProxyRequest(config.AppConfig.SeatReservationServiceURL))
		}

		bookings := api.Group("/bookings")
		bookings.Use(middleware.JWTAuth())
		{
			bookings.POST("/create", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.GET("", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.GET("/:id", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.GET("/user/:userId", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.POST("/:id/confirm", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
			bookings.POST("/:id/cancel", proxy.ProxyRequest(config.AppConfig.BookingServiceURL))
		}

		tickets := api.Group("/tickets")
	{
		// Public endpoints (no auth required for PDF download)
		tickets.GET("/:id/pdf", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
		
		// Protected endpoints
		tickets.Use(middleware.JWTAuth())
		tickets.POST("/generate", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
		tickets.GET("/:id", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
		tickets.POST("/:id/email", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
		tickets.GET("/booking/:bookingId", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
		tickets.GET("/user/:userId", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
		tickets.GET("/:id/qr", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
		tickets.POST("/validate", proxy.ProxyRequest(config.AppConfig.TicketServiceURL))
	}

		notifications := api.Group("/notifications")
		notifications.Use(middleware.JWTAuth())
		{
			notifications.GET("/user/:userId", proxy.ProxyRequest(config.AppConfig.NotificationServiceURL))
			notifications.PATCH("/:id/read", proxy.ProxyRequest(config.AppConfig.NotificationServiceURL))
			notifications.PATCH("/user/:userId/read-all", proxy.ProxyRequest(config.AppConfig.NotificationServiceURL))
		}

		payments := api.Group("/payments")
		payments.Use(middleware.JWTAuth())
		{
			payments.POST("/initiate", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
			payments.POST("/confirm", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
			payments.GET("/:id", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
			payments.GET("/reservation/:reservationId", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
			payments.GET("/user/:userId", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
			payments.POST("/:id/refund", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
			payments.POST("/:id/cancel", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
		}

		gateway := api.Group("/gateway")
		{
			gateway.POST("/webhook/sslcommerz/ipn", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
			gateway.POST("/webhook", proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
			gateway.GET("/status/:transactionId", middleware.JWTAuth(), proxy.ProxyRequest(config.AppConfig.PaymentServiceURL))
		}

		user := api.Group("/user")
		user.Use(middleware.JWTAuth())
		{
			user.GET("/profile", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
			user.PATCH("/profile", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
			user.POST("/change-password", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
			user.GET("/passengers", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
			user.POST("/passengers", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
			user.PATCH("/passengers/:id", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
			user.DELETE("/passengers/:id", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
			user.GET("/preferences", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
			user.PATCH("/preferences", proxy.ProxyRequest(config.AppConfig.UserServiceURL))
		}

		search := api.Group("/search")
		{
			search.GET("/journeys", proxy.ProxyRequest(config.AppConfig.SearchServiceURL))
			search.GET("/autocomplete", proxy.ProxyRequest(config.AppConfig.SearchServiceURL))
			search.GET("/suggestions", proxy.ProxyRequest(config.AppConfig.SearchServiceURL))
			search.POST("/cache/invalidate", middleware.JWTAuth(), middleware.RequireRole("ADMIN"), proxy.ProxyRequest(config.AppConfig.SearchServiceURL))
			search.GET("/cache/stats", middleware.JWTAuth(), middleware.RequireRole("ADMIN"), proxy.ProxyRequest(config.AppConfig.SearchServiceURL))
		}

		admin := api.Group("/admin")
		admin.Use(middleware.JWTAuth(), middleware.RequireRole("ADMIN"))
		{
			admin.GET("/users", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/users/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/users/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/trains", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/trains/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.POST("/trains", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/trains/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.DELETE("/trains/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/stations", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/stations/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.POST("/stations", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/stations/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.DELETE("/stations/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/routes", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.POST("/routes", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/routes/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.DELETE("/routes/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/journeys", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/journeys/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.POST("/journeys", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/journeys/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.DELETE("/journeys/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/bookings", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/bookings/:id/status", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))

			// Coach Management
			admin.GET("/coaches", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/coaches/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.POST("/coaches", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/coaches/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.DELETE("/coaches/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))

			// Seat Management
			admin.GET("/seats", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/seats/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.POST("/seats", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.POST("/seats/bulk", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/seats/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.DELETE("/seats/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))

			// Global Settings
			admin.GET("/settings", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/settings/:key", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.POST("/settings", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.PATCH("/settings/:key", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.DELETE("/settings/:key", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))

			// Payment Management
			admin.GET("/payments", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/payments/stats", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
			admin.GET("/payments/:id", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))

			// Dashboard Stats
			admin.GET("/stats/dashboard", proxy.ProxyRequest(config.AppConfig.AdminServiceURL))
		}

		reports := api.Group("/reports")
		reports.Use(middleware.JWTAuth(), middleware.RequireRole("ADMIN", "MANAGER"))
		{
			reports.GET("/bookings", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/bookings/export", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/revenue", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/revenue/export", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/trains", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/trains/export", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/users", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/users/export", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/daily", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/weekly", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/monthly", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
			reports.GET("/dashboard", proxy.ProxyRequest(config.AppConfig.ReportingServiceURL))
		}
	}
}
