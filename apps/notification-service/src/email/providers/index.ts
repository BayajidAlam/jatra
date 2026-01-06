export * from "./email-provider.interface";
export * from "./mock.provider";
export * from "./mailgun.provider";
export * from "./resend.provider";

export enum EmailProvider {
  MOCK = "MOCK",
  MAILGUN = "MAILGUN",
  RESEND = "RESEND",
}
