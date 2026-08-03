const token = '8952394310:AAHaQ2Ap69V9goclo3beWwz1_Fgr02V6Wo8';

async function findGroupId() {
  console.log('1. Temporarily deleting webhook...');
  await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);

  console.log('2. Fetching updates to find group ID...');
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const data = await res.json();

  console.log('3. Restoring webhook...');
  await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://casite-pink.vercel.app/api/notify/telegram-webhook' })
  });

  console.log('\n--- GET UPDATES RESULT ---');
  console.log(JSON.stringify(data, null, 2));

  if (data.ok && data.result.length > 0) {
    console.log('\nFound Chats:');
    for (const update of data.result) {
      const chat = update.message?.chat || update.my_chat_member?.chat || update.channel_post?.chat;
      if (chat) {
        console.log(`- Title/Name: "${chat.title || chat.first_name}" | Type: ${chat.type} | ID: ${chat.id}`);
      }
    }
  } else {
    console.log('\nNo recent updates found. Please send a message in the Telegram group (e.g. "hello bot") so the bot records it!');
  }
}

findGroupId();
