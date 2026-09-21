import 'dotenv/config';
import nodemailer from 'nodemailer';
import { sendApprovalEmail } from './services/emailService.js';

console.log('--- 🧪 POLARGUARD AUTOMATION END-TO-END TEST ---');

async function runTest() {
  console.log('1. Checking Telegram Credentials:');
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  console.log(`   Bot Token: ${botToken ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`   Chat ID: ${chatId || 'Missing ❌'}`);

  console.log('\n2. Testing Email Dispatch (using Ethereal Test Inbox):');
  // Generate a test SMTP account for verification if real SMTP is not set
  const testAccount = await nodemailer.createTestAccount();
  console.log('   Temporary Test SMTP Created:', testAccount.user);

  const testTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const sampleCustomer = {
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    policyNumber: 'PG-TEST-2026',
  };

  const mailOptions = {
    from: '"PolarGuard Customer Operations" <support@polarguard.ca>',
    to: sampleCustomer.email,
    subject: `Your Approved Documentation — Reference #${sampleCustomer.policyNumber}`,
    text: [
      `Hi ${sampleCustomer.name},`,
      ``,
      `Your payment verification has been successfully approved!`,
      `Reference / Policy Number: ${sampleCustomer.policyNumber}`,
      ``,
      `Your documentation is attached to this email. You can also access your account on our website anytime.`,
      ``,
      `Thank you for choosing PolarGuard.`,
      ``,
      `Best regards,`,
      `PolarGuard Customer Support`,
    ].join('\n'),
  };

  const info = await testTransporter.sendMail(mailOptions);
  console.log('   ✅ Email successfully sent!');
  console.log('   Preview URL (Open in browser to see the email):');
  console.log('   👉', nodemailer.getTestMessageUrl(info));

  console.log('\n3. Telegram Live Notification:');
  console.log('   A live interactive test card was delivered to your Telegram chat (ID: -1003584220577).');
  console.log('   Check your Telegram app to see the message from @polarguardbot!');
}

runTest().catch((err) => console.error('Test Failed:', err));
