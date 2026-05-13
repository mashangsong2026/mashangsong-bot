require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

app.use(express.raw({ type: '*/*' }));

const CHANNEL_SECRET = process.env.LINE_SECRET;
const CHANNEL_TOKEN = process.env.LINE_TOKEN;

// ===== 回覆訊息 =====
async function reply(replyToken, messages) {
  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/reply',
      {
        replyToken,
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${CHANNEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    console.log('Reply Error:', err.response?.data || err.message);
  }
}

// ===== Quick Reply 主選單 =====
function mainMenu() {
  return {
    type: 'text',
    text:
      '🛵 馬上送｜桃園代送服務\n\n請選擇服務項目👇',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'message',
            label: '📦 一般代送',
            text: '一般代送'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '⚡ 急送文件',
            text: '急送'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '💰 收費說明',
            text: '收費說明'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '📋 注意事項',
            text: '注意事項'
          }
        }
      ]
    }
  };
}

// ===== webhook =====
app.post('/webhook', async (req, res) => {
  res.status(200).send('OK');

  try {
    // ===== LINE 簽名驗證 =====
    const signature = req.headers['x-line-signature'];

    const hash = crypto
      .createHmac('SHA256', CHANNEL_SECRET)
      .update(req.body)
      .digest('base64');

    if (hash !== signature) {
      console.log('❌ Signature 驗證失敗');
      return;
    }

    const body = JSON.parse(req.body);
    const events = body.events;

    for (const e of events) {
      if (e.type !== 'message') continue;
      if (e.message.type !== 'text') continue;

      const userId = e.source.userId;
      const text = e.message.text.trim();

      console.log('User:', userId);
      console.log('Message:', text);

      // ===== 主選單 =====
      if (
        text === '選單' ||
        text === 'menu' ||
        text === '你好' ||
        text === 'hi' ||
        text.includes('代送')
      ) {
        await reply(e.replyToken, [mainMenu()]);
      }

      // ===== 收費 =====
      else if (
        text.includes('收費') ||
        text.includes('費用') ||
        text.includes('多少')
      ) {
        await reply(e.replyToken, [
          {
            type: 'text',
            text:
`💰 馬上送 收費說明

📦 一般代送
0-3公里：100元
3-5公里：130元
5-8公里：160元
8km以上：200元起

⚡ 急送 / 文件
0-3公里：150元
3-5公里：180元
5-8公里：220元
8km以上：280元起

➕ 加價項目
🌙 夜間 +30
🌧️ 雨天 +30
🏢 上樓 +10
⏳ 等待 +20

💳 先付款再出發`
          }
        ]);
      }

      // ===== 注意事項 =====
      else if (
        text.includes('注意') ||
        text.includes('規則')
      ) {
        await reply(e.replyToken, [
          {
            type: 'text',
            text:
`📋 注意事項

1️⃣ 客人需自行向店家完成付款

2️⃣ 我們負責：
取貨 ➜ 配送 ➜ 送達

3️⃣ 需先付款才會出發

4️⃣ 匯款後請提供：
💳 匯款截圖
或
🔢 帳號後五碼

5️⃣ 禁送違法物品`
          }
        ]);
      }

      // ===== 一般代送 =====
      else if (
        text.includes('一般') ||
        text.includes('叫單')
      ) {
        await reply(e.replyToken, [
          {
            type: 'text',
            text:
`📦 一般代送訂單

請直接複製以下格式填寫👇

【取貨地點】
【送達地點】
【物品內容】
【聯絡電話】
【是否已付款】
【是否需要上樓】`
          }
        ]);
      }

      // ===== 急送 =====
      else if (
        text.includes('急送') ||
        text.includes('文件')
      ) {
        await reply(e.replyToken, [
          {
            type: 'text',
            text:
`⚡ 急送 / 文件配送

🚀 30分鐘內優先出發

請直接複製以下格式填寫👇

【取貨地點】
【送達地點】
【文件 / 物品內容】
【聯絡電話】
【是否已付款】
【是否需要上樓】`
          }
        ]);
      }

      // ===== 已付款 =====
      else if (
        text.includes('已付款') ||
        text.includes('轉帳') ||
        text.includes('匯款')
      ) {
        await reply(e.replyToken, [
          {
            type: 'text',
            text:
`💳 已收到付款資訊

🛵 正在安排配送員
請稍候，我們會盡快為您服務！`
          }
        ]);
      }

      // ===== fallback =====
      else {
        await reply(e.replyToken, [
          {
            type: 'text',
            text:
`🛵 馬上送

目前可使用功能：

📦 一般代送
⚡ 急送文件
💰 收費說明
📋 注意事項

請輸入「選單」查看服務`
          }
        ]);
      }
    }
  } catch (err) {
    console.log('Webhook Error:', err);
  }
});

// ===== 首頁 =====
app.get('/', (req, res) => {
  res.send('🛵 馬上送 Bot 運行中');
});

// ===== 啟動 =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
