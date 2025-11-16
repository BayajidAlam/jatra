/**
 * Hash utility functions
 *
 * Installation required in service implementations:
 * npm install bcrypt @types/bcrypt
 */
export class HashUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash password using bcrypt
   * Implementation note: Use bcrypt package in actual service
   */
  static async hashPassword(password: string): Promise<string> {
    // TODO: Implement using bcrypt in service
    // const bcrypt = require('bcrypt');
    // return bcrypt.hash(password, this.SALT_ROUNDS);

    // Placeholder - DO NOT use in production
    return `hashed_${password}_${this.SALT_ROUNDS}`;
  }

  /**
   * Compare password with hash
   * Implementation note: Use bcrypt package in actual service
   */
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    // TODO: Implement using bcrypt in service
    // const bcrypt = require('bcrypt');
    // return bcrypt.compare(password, hash);

    // Placeholder - DO NOT use in production
    return hash === `hashed_${password}_${this.SALT_ROUNDS}`;
  }

  /**
   * Generate random hash (for tokens, IDs, etc.)
   */
  static generateRandomHash(length: number = 32): string {
    // Simple random string generation
    const chars = "abcdef0123456789";
    let result = "";
    for (let i = 0; i < length * 2; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate SHA256 hash
   * Implementation note: Use crypto module in actual service
   */
  static sha256(data: string): string {
    // TODO: Implement using crypto module in service
    // const crypto = require('crypto');
    // return crypto.createHash('sha256').update(data).digest('hex');

    // Placeholder
    return `sha256_${data.length}_${data.substring(0, 10)}`;
  }

  /**
   * Generate HMAC signature
   * Implementation note: Use crypto module in actual service
   */
  static hmacSha256(data: string, secret: string): string {
    // TODO: Implement using crypto module in service
    // const crypto = require('crypto');
    // return crypto.createHmac('sha256', secret).update(data).digest('hex');

    // Placeholder
    return `hmac_${data.length}_${secret.length}`;
  }

  /**
   * Verify HMAC signature
   */
  static verifyHmac(data: string, signature: string, secret: string): boolean {
    const computedSignature = this.hmacSha256(data, secret);
    return signature === computedSignature;
  }
}
