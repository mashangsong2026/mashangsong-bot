const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

const CHANNEL_SECRET = 'f98835e84e7343478d5a5f910a843b96';
const CHANNEL_ACCESS_TOKEN = 'D13H1tTdt4FmL23zM7LPXk02a4OSrl1ictslxuT/3lncJSyolnq+8NwR4xGRSYAx/bYYktDLYU4Kry5X0gOaKKyI8wNFvHqdslh78v25eSErCgJq9yCXsf6QeQKwavbUXK8T6A28FHcHZ2y9mnYKcQdB04t89/1O/w1cDnyilFU=';

app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
async function replyMessage(replyToken, messages) {
  await axios.post('https://api.line.me/v2/bot/message/reply', {
    replyToken,
    messages
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
    }
  });
}

function getMainMenu() {
  return {
    type: 'template',
    altText: '馬上送 - 主選單',
    template: {
      type: 'buttons',
      title: '🛵 馬上送',
      text: '請選擇服務類型',
      actions: [
        { type: 'message', label: '📦 一般代送', text: '一般代送' },
        { type: 'message', label: '⚡ 急送／文件', text: '急送' },
        { type: 'message', label: '💰 收費說明', text: '收費說明' },
        { type: 'message', label: '📋 注意事項', text: '注意事項' }
      ]
    }
  };
}
function getPriceInfo() {
  return {
    type: 'text',
    text: `💰 馬上送收費說明\n\n【一般代送】\n・0-3公里：100元\n・3-5公里：130元\n・5-8公里：160元\n・8公里以上：200元起\n\n【急送／文件】\n・0-3公里：150元\n・3-5公里：180元\n・5-8公里：220元\n・8公里以上：280元起\n\n【加價】\n・夜間+30元・上樓+10元・等待+20元・雨天+30元\n\n✅ 先付款再出發\n💳 轉帳 或 LINE Pay`
  };
}

function getNotice() {
  return {
    type: 'text',
    text: `📋 注意事項\n\n1. 客人自行向店家購買付款\n2. 只負責取貨送達\n3. 先付款才出發\n4. 付款後傳截圖給我\n\n叫單請告訴我：\n・取貨地點\n・送達地點\n・是否急送\n・是否送上樓`
  };
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-line-signature'];
  const body = req.body;
  const hash = crypto.createHmac('SHA256', CHANNEL_SECRET).update(body).digest('base64');
  if (hash !== signature) return res.status(401).send('Unauthorized');

  const events = JSON.parse(body).events;
  events.forEach(async (event) => {
    if (event.type !== 'message' || event.message.type !== 'text') return;
    const text = event.message.text.trim();
    const replyToken = event.replyToken;

    if (['你好','hi','Hi','開始','選單'].includes(text)) {
      await replyMessage(replyToken, [getMainMenu()]);
    } else if (['收費說明','費用','多少錢'].includes(text)) {
      await replyMessage(replyToken, [getPriceInfo()]);
    } else if (['注意事項','規則'].includes(text)) {
      await replyMessage(replyToken, [getNotice()]);
    } else if (['一般代送','叫單','代送'].includes(text)) {
      await replyMessage(replyToken, [{ type: 'text', text: '📦 一般代送\n\n請告訴我：\n1️⃣ 取貨地點\n2️⃣ 送達地點\n3️⃣ 商品已付款了嗎？\n4️⃣ 需要送上樓嗎？\n\n收到後我會回覆預估費用 💰' }]);
    } else if (['急送','急件','文件'].includes(text)) {
      await replyMessage(replyToken, [{ type: 'text', text: '⚡ 急送／文件\n\n30分鐘內出發！\n\n請告訴我：\n1️⃣ 取貨地點\n2️⃣ 送達地點\n3️⃣ 商品已付款了嗎？\n4️⃣ 需要送上樓嗎？\n\n收到後我會回覆預估費用 💰' }]);
    } else {
      await replyMessage(replyToken, [{ type: 'text', text: '收到！我會盡快回覆你 🛵\n\n查詢服務請輸入「選單」' }]);
    }
  });
  res.status(200).send('OK');
});

app.get('/', (req, res) => res.send('馬上送機器人運行中 🛵'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`馬上送啟動！Port: ${PORT}`));
