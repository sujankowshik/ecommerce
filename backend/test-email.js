import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;

console.log('==================================================');
console.log('      ANTIGRAVITY SMTP LIVE DIAGNOSTICS          ');
console.log('==================================================');
console.log('SMTP Host :', host);
console.log('SMTP Port :', port);
console.log('SMTP User :', user);
console.log('SMTP Pass :', pass ? '••••••••' + ` (length: ${pass.length} chars)` : 'MISSING');
console.log('SMTP From :', from);
console.log('--------------------------------------------------');

if (!host || !user || !pass) {
  console.error('❌ ERROR: Missing SMTP configurations in your .env file!');
  process.exit(1);
}

const cleanPass = pass.replace(/\s+/g, ''); // Try both options: original or stripped of spaces
console.log(`Password length stripped of spaces: ${cleanPass.length} chars`);

const testTransporter = async (passwordToTest, label) => {
  console.log(`\nTesting connection using: ${label}...`);
  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: {
        user,
        pass: passwordToTest
      },
      // Timeout settings to prevent freezing
      connectionTimeout: 10000,
      greetingTimeout: 10000
    });

    await transporter.verify();
    console.log('✅ CONNECTION VERIFIED: Authentication succeeded!');

    console.log('Sending test email...');
    // In Gmail, SMTP_FROM should match the authenticated user
    const finalFrom = from && !from.includes('your-email@example.com') ? from : `"Antigravity Store" <${user}>`;
    
    const info = await transporter.sendMail({
      from: finalFrom,
      to: user,
      subject: 'Antigravity Real-Time SMTP Test Success',
      text: 'Congratulations! Your real-time SMTP email verification is fully working.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #4f46e5;">SMTP Test Success!</h2>
          <p>If you received this message, your SMTP real-time OTP server is working perfectly.</p>
        </div>
      `
    });
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY! Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Authentication failed! Error: ${error.message}`);
    if (error.code) console.error(`Error Code: ${error.code}`);
    return false;
  }
};

const runDiagnostics = async () => {
  // Test 1: Try with spaces
  let success = await testTransporter(pass, 'Original Password (with spaces)');
  
  // Test 2: Try without spaces if Test 1 failed and pass had spaces
  if (!success && pass.includes(' ')) {
    success = await testTransporter(cleanPass, 'Password without spaces');
  }
  
  if (success) {
    console.log('\n==================================================');
    console.log('🎉 DIAGNOSTICS SUCCESSFUL! YOUR SMTP CONFIG IS OK.');
    console.log('==================================================');
  } else {
    console.log('\n==================================================');
    console.log('❌ DIAGNOSTICS FAILED. PLEASE SEE ERRORS ABOVE.');
    console.log('==================================================');
  }
};

runDiagnostics();
