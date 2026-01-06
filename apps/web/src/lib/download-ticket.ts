import apiClient from "./axios-client";
import { toast } from "sonner";

/**
 * Handles PDF download for a booking/ticket with automatic ticket generation
 * @param bookingId - The booking ID
 * @param bookingStatus - Optional booking status to check if confirmed
 */
export async function downloadTicketPDF(bookingId: string, bookingStatus?: string) {
  try {
    // Access ticket service directly (bypass API Gateway for now)
    const ticketServiceUrl = 'http://localhost:3006';
    const response = await fetch(`${ticketServiceUrl}/tickets/booking/${bookingId}`);
    
    if (response.ok) {
      const ticketData = await response.json();
      
      if (ticketData && ticketData.id) {
        // Download PDF using ticket ID
        const ticketId = ticketData.id;
        const pdfUrl = `${ticketServiceUrl}/tickets/${ticketId}/pdf`;
        window.open(pdfUrl, "_blank");
        return true;
      }
    }
    
    toast.error("Ticket not found. Please ensure your booking is confirmed.");
    return false;
  } catch (error: any) {
    toast.error("Failed to download ticket. Please try again.");
    console.error("Download error:", error);
    return false;
  }
}
