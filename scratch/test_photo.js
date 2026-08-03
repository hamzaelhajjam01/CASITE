async function testNotifyWithPositiveId() {
  // Let's call the API directly or test with fetch
  const token = '8952394310:AAHaQ2Ap69V9goclo3beWwz1_Fgr02V6Wo8';
  const chatId = '1973732398';
  
  const caption = `📋 *New Payment Submission*\n\n*Policy:* \`PG-TEST-999\`\n*Amount:* $226 CAD\n*Status:* ⏳ Pending Admin Verification`;

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', caption);
  form.append('parse_mode', 'Markdown');
  form.append('reply_markup', JSON.stringify({
    inline_keyboard: [
      [
        { text: '✅ Approve & Activate', callback_data: 'approve:PG-TEST-999' },
        { text: '❌ Reject', callback_data: 'reject:PG-TEST-999' }
      ]
    ]
  }));

  // Dummy 1x1 image blob
  const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  form.append('photo', new Blob([imageBuffer], { type: 'image/png' }), 'receipt.png');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form
  });

  const data = await res.json();
  console.log('Telegram API result with positive ID (1973732398):', data);
}

testNotifyWithPositiveId();
