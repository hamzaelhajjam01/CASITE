async function testTelegramChatId(chatId) {
  const token = '8952394310:AAHaQ2Ap69V9goclo3beWwz1_Fgr02V6Wo8';
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  console.log(`Testing chat_id: ${chatId}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔔 Test message to chat ${chatId}`
      })
    });
    const data = await res.json();
    console.log(`Result for ${chatId}:`, data);
  } catch (e) {
    console.error(`Error testing ${chatId}:`, e);
  }
}

async function runTests() {
  const testIds = [
    '-1973732398',
    '1973732398',
    '-1001973732398',
    '-100197373239'
  ];
  for (const id of testIds) {
    await testTelegramChatId(id);
  }
}

runTests();
