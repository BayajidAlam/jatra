import { Injectable, Logger } from "@nestjs/common";
import * as QRCode from "qrcode";

@Injectable()
export class QRCodeService {
  private readonly logger = new Logger(QRCodeService.name);

  /**
   * Generate QR code as Base64 string
   */
  async generateQRCode(data: string): Promise<string> {
    try {
      const options = {
        errorCorrectionLevel: process.env.QR_CODE_ERROR_CORRECTION || "M",
        margin: parseInt(process.env.QR_CODE_MARGIN) || 1,
        width: parseInt(process.env.QR_CODE_WIDTH) || 300,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      };

      const qrCodeBase64: string = await (QRCode.toDataURL as any)(
        data,
        options
      );
      this.logger.log(
        `✅ QR code generated for data: ${data.substring(0, 50)}...`
      );
      return qrCodeBase64;
    } catch (error) {
      this.logger.error("Failed to generate QR code", error);
      throw new Error("QR code generation failed");
    }
  }

  /**
   * Generate QR code as buffer for embedding in PDF
   */
  async generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const options = {
        errorCorrectionLevel: process.env.QR_CODE_ERROR_CORRECTION || "M",
        margin: parseInt(process.env.QR_CODE_MARGIN) || 1,
        width: parseInt(process.env.QR_CODE_WIDTH) || 300,
      };

      return await (QRCode.toBuffer as any)(data, options);
    } catch (error) {
      this.logger.error("Failed to generate QR code buffer", error);
      throw new Error("QR code buffer generation failed");
    }
  }

  /**
   * Validate QR code data format
   */
  validateQRData(ticketNumber: string, bookingId: string): string {
    const qrData = JSON.stringify({
      ticketNumber,
      bookingId,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
    return qrData;
  }
}
