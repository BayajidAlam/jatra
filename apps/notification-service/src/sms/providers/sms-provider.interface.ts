export interface SmsProviderConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

export interface SendSmsParams {
  to: string;
  message: string;
  from?: string;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ISmsProvider {
  /**
   * Initialize the SMS provider with configuration
   */
  initialize(config: SmsProviderConfig): Promise<void>;

  /**
   * Check if the provider is properly configured and ready to send SMS
   */
  isConfigured(): boolean;

  /**
   * Send an SMS message
   */
  sendSms(params: SendSmsParams): Promise<SendSmsResult>;

  /**
   * Get the provider name for logging
   */
  getProviderName(): string;
}
