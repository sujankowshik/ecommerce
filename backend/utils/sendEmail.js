import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"Antigravity Store" <noreply@antigravity-ecommerce.com>';

  const isConfigured = host && user && pass;

  if (isConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: parseInt(port) === 465, // true for 465, false for other ports
        auth: {
          user,
          pass
        }
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });

      console.log(`[SMTP Email] Email successfully dispatched to ${to}. Message ID: ${info.messageId}`);
      return { success: true, isMock: false };
    } catch (error) {
      console.error(`[SMTP Email Error] Failed to send email via SMTP: ${error.message}`);
      // Fallback to simulated log instead of crashing
      logSimulatedEmail(to, subject, text || html);
      return { success: true, isMock: true };
    }
  } else {
    logSimulatedEmail(to, subject, text || html);
    return { success: true, isMock: true };
  }
};

function logSimulatedEmail(to, subject, content) {
  console.log('\n' + '='.repeat(60));
  console.log(`✉️  [EMAIL SIMULATOR ACTIVE]`);
  console.log(`TO      : ${to}`);
  console.log(`SUBJECT : ${subject}`);
  console.log(`CONTENT :`);
  console.log(content);
  console.log('='.repeat(60) + '\n');
}
