export * from "./email-provider.interface";
export * from "./mailgun.provider";
export * from "./mock.provider";

export enum EmailProvider {
  MAILGUN = "MAILGUN",
  MOCK = "MOCK",
}
