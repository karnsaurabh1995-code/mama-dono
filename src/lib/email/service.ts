import nodemailer from 'nodemailer';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  devCode?: string;
  error?: string;
}

/**
 * Returns a configured Nodemailer transporter if valid SMTP credentials exist
 */
function getTransporter() {
  const host = process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_SERVER_PORT || '465', 10);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!user || !pass || pass === 'your_google_app_password' || pass.includes('placeholder')) {
    return null;
  }

  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
    // Reasonable connection timeouts
    connectionTimeout: 10000,
    greetingTimeout: 8000,
  });
}

/**
 * Generates branded HTML email for OTP sign-in verification
 */
function generateOtpHtml(code: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your sign-in verification code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF9F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #202124;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #EAE7E2; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #F3F1ED; text-align: center;">
              <span style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #202124;">
                do<span style="color: #EF4949;">kind</span>
              </span>
              <p style="margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #737A82; font-weight: 700;">
                Transparent Crowdfunding &amp; Giving
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #202124; text-align: center;">
                Your sign-in verification code
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #555B63; text-align: center;">
                Use the one-time verification code below to complete your login to Dokind.
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #FFF0EF; border: 1.5px solid #FFD3CE; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #EF4949; display: inline-block;">
                  ${code}
                </span>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #8F2D28; font-weight: 600;">
                  Valid for 10 minutes · Single use only
                </p>
              </div>

              <!-- Security Information -->
              <div style="background-color: #F8F9FA; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; font-size: 12px; line-height: 1.5; color: #666F7A;">
                <p style="margin: 0 0 6px 0; font-weight: 700; color: #202124;">Security Notice:</p>
                <p style="margin: 0;">
                  Never share this verification code with anyone. Dokind staff will never ask for your code over the phone or email. If you did not request this sign-in, you can safely disregard this email.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #737A82; text-align: center;">
                Need help? Contact our support team at <a href="mailto:support@dokind.org.in" style="color: #EF4949; text-decoration: none; font-weight: 600;">support@dokind.org.in</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FAF9F6; border-top: 1px solid #EAE7E2; text-align: center; font-size: 11px; color: #8C939D;">
              © ${new Date().getFullYear()} dokind Foundation · Section 80G Tax-Deductible Crowdfunding Platform
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Sends sign-in verification code email.
 * If SMTP credentials are configured, sends real email via Nodemailer.
 * If credentials are not yet configured or in local development, simulates delivery safely.
 */
export async function sendLoginVerificationCode(
  email: string,
  code: string
): Promise<EmailSendResult> {
  const cleanEmail = email.trim().toLowerCase();
  const transporter = getTransporter();

  // If real SMTP is configured, attempt real delivery
  if (transporter) {
    try {
      const fromAddress = process.env.EMAIL_FROM || `"dokind Foundation" <${process.env.EMAIL_SERVER_USER}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: cleanEmail,
        subject: 'Your sign-in verification code',
        text: `dokind — Transparent Crowdfunding\n\nYour sign-in verification code is: ${code}\n\nThis code is valid for 10 minutes. If you did not request this sign-in, please ignore this email.\n\n© ${new Date().getFullYear()} dokind Foundation`,
        html: generateOtpHtml(code),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('[DOKIND EMAIL SERVICE] Failed to deliver email via SMTP:', err.message);
      // If SMTP fails, in non-production allow fallback logging so developers aren't locked out
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DOKIND EMAIL OTP DEV FALLBACK] Verification code for ${cleanEmail}: ${code} (Expires in 10m)`);
        return {
          success: true,
          devCode: code,
        };
      }
      return {
        success: false,
        error: 'Failed to send verification email. Please check SMTP settings or try again.',
      };
    }
  }

  // Development simulation mode when SMTP credentials are not yet set
  console.log(`[DOKIND EMAIL OTP MOCK] Sent verification code to ${cleanEmail}: ${code} (Expires in 10m)`);
  return {
    success: true,
    devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
  };
}
