/**
 * Random generation utility functions
 */
export class RandomUtil {
  /**
   * Generate random OTP code
   */
  static generateOTP(length: number = 6): string {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  }

  /**
   * Generate random alphanumeric string
   */
  static generateAlphanumeric(length: number = 8): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }

    return result;
  }

  /**
   * Generate UUID v4
   * Implementation note: Use crypto.randomUUID() in Node.js 16+ or uuid package
   */
  static generateUUID(): string {
    // Simple UUID v4 generation (not cryptographically secure)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate PNR (Passenger Name Record) - 10 characters
   */
  static generatePNR(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = this.generateAlphanumeric(4).toUpperCase();
    return `${timestamp}${random}`.substring(0, 10);
  }

  /**
   * Generate booking reference
   */
  static generateBookingRef(): string {
    const prefix = "BK";
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}${timestamp}`;
  }

  /**
   * Generate transaction ID
   */
  static generateTransactionId(): string {
    const prefix = "TXN";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
    return `${prefix}${timestamp}${random}`;
  }
}
