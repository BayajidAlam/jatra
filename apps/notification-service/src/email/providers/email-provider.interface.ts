export interface EmailProviderConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  /**
   * Initialize the email provider with configuration
   */
  initialize(config: EmailProviderConfig): Promise<void>;

  /**
   * Check if the provider is properly configured and ready to send emails
   */
  isConfigured(): boolean;

  /**
   * Send an email
   */
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>;

  /**
   * Verify the connection/configuration is valid
   */
  verify(): Promise<boolean>;

  /**
   * Get the provider name for logging
   */
  getProviderName(): string;
}
