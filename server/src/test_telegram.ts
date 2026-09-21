import 'dotenv/config';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log('Testing Telegram Bot connectivity...');
console.log('Bot Token:', botToken ? botToken.slice(0, 10) + '...' : 'Missing');
console.log('Chat ID:', chatId);

async function testTelegram() {
  if (!botToken || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
    return;
  }

  const caption = [
    `🧪 *PolarGuard Automation Test*`,
    ``,
    `*Policy:* \`TEST-POL-9999\``,
    `*Customer:* Test User`,
    `*Email:* test@example.com`,
    `*Amount:* $180 CAD`,
    `*Plan:* 6 Months — Popular`,
    ``,
    `*Status:* ⏳ Verification Test`,
  ].join('\n');

  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [
        { text: '✅ Approve (Test)', callback_data: 'approve:TEST-POL-9999' },
        { text: '❌ Reject (Test)', callback_data: 'reject:TEST-POL-9999' },
      ],
    ],
  });

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: caption,
        parse_mode: 'Markdown',
        reply_markup: JSON.parse(replyMarkup),
      }),
    });

    const data = await res.json();
    console.log('Telegram API Response:', data);
    if (data.ok) {
      console.log('🎉 SUCCESS: Test message delivered to Telegram chat!');
    } else {
      console.error('Telegram Error:', data.description);
    }
  } catch (err) {
    console.error('Network error calling Telegram:', (err as Error).message);
  }
}

testTelegram();
