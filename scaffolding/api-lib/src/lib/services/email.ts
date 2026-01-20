import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { IApplication, IBaseDocument } from '@digitaldefiance/node-express-suite';

// Simple debugLog implementation
function debugLog(debug: boolean, type: 'log' | 'warn' | 'error', ...args: any[]): void {
  if (debug) {
    console[type](...args);
  }
}
import { Environment } from '../environment';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

/**
 * A generic service for sending emails using Amazon SES.
 */
export class EmailService<TID extends PlatformID> {
  private readonly sesClient: SESClient;
  private readonly emailSender: string;
  private readonly disableEmailSend: boolean;
  private readonly debug: boolean;
  private readonly application: IApplication<TID>;

  /**
   * Constructs an instance of EmailService.
   * @param config Configuration object containing AWS credentials, region, sender email, and debug/disable flags.
   */
  constructor(application: IApplication<TID>) {
    this.application = application;
    const environment = application.environment as Environment<TID>;
    this.emailSender = environment.emailSender;
    this.disableEmailSend = environment.disableEmailSend;
    this.debug = environment.debug;

    // Initialize the SES client with provided AWS credentials and region.
    this.sesClient = new SESClient({
      region: environment.aws.region,
      credentials: {
        accessKeyId: environment.aws.accessKeyId.value ?? '',
        secretAccessKey:
          environment.aws.secretAccessKey.value ?? '',
      },
    });
  }

  /**
   * Sends an email using Amazon SES.
   * @param to The recipient's email address.
   * @param subject The subject line of the email.
   * @param text The plain text body of the email.
   * @param html The HTML body of the email.
   * @returns A Promise that resolves when the email is sent successfully, or rejects on failure.
   * @throws Error if email sending is disabled or if SES encounters an error.
   */
  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    if (this.disableEmailSend) {
      debugLog(
        this.debug,
        'log',
        `Email sending disabled for: ${to} - Subject: ${subject}`,
      );
      return;
    }

    const sendCommand = new SendEmailCommand({
      Destination: {
        ToAddresses: [to], // Recipient email address
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html, // HTML content of the email
          },
          Text: {
            Charset: 'UTF-8',
            Data: text, // Plain text content of the email
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject, // Subject of the email
        },
      },
      Source: this.emailSender, // Sender email address (must be verified in SES)
    });

    try {
      await this.sesClient.send(sendCommand);
      debugLog(
        this.debug,
        'log',
        `Email sent successfully to ${to} with subject: ${subject}`,
      );
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw new Error(
        `Failed to send email: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
