async function testGroupNotification() {
  const token = '8952394310:AAHaQ2Ap69V9goclo3beWwz1_Fgr02V6Wo8';
  const chatId = '-1003584220577';
  
  const caption = `📋 *New Payment Submission*\n\n*Policy:* \`PG-LIVE-TEST\`\n*Amount:* $226 CAD\n*Coverage:* Basic — 1m\n*Deductible:* $500\n\n*Vehicle:* 2003 Honda Accord\n*VIN:* \`1HGCM82633A004352\`\n\n*Status:* ⏳ Pending Admin Verification`;

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', caption);
  form.append('parse_mode', 'Markdown');
  form.append('reply_markup', JSON.stringify({
    inline_keyboard: [
      [
        { text: '✅ Approve & Activate', callback_data: 'approve:PG-LIVE-TEST' },
        { text: '❌ Reject', callback_data: 'reject:PG-LIVE-TEST' }
      ]
    ]
  }));

  const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  form.append('photo', new Blob([imageBuffer], { type: 'image/png' }), 'receipt.png');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form
  });

  const data = await res.json();
  console.log('Group send result:', data);
}

testGroupNotification();
