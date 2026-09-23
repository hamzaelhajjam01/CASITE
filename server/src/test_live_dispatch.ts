import 'dotenv/config';
import { sendApprovalEmail } from './services/emailService.js';

console.log('--- 🚀 TESTING LIVE EMAIL DISPATCH FROM HOSTINGER ---');

async function testLiveEmail() {
  const recipient = 'polarguardtransfers@outlook.com';
  const customerName = 'Hamza (Test)';
  const policyNumber = 'PG-VERIFY-2026';

  console.log(`Sending live verification email from contact@polarguardbrokerage.ca to ${recipient}...`);

  const success = await sendApprovalEmail(recipient, customerName, policyNumber);

  if (success) {
    console.log('\n🎉 SUCCESS! The email has been sent through Hostinger SMTP.');
    console.log(`👉 Please check the inbox of ${recipient} to confirm receipt!`);
  } else {
    console.error('\n❌ Email failed to send. Check the error logs above.');
  }
}

testLiveEmail();
