const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const app = express();
app.use(express.raw({type:'*/*'}));
const S = 'f98835e84e7343478d5a5f910a843b96';
const T = '39zEzChCZQaWjSIpaPWc4mELUHzfHN2HbZaQVOFEW0czVgM+eUNAa4Ia9DbCpW+p/bYYktDLYU4Kry5X0gOaKKyI8wNFvHqdslh78v25eSFp1RYDLhazsQj4xvtEaoGjjIYFRuFmTuUIrviEKhhKNQdB04t89/1O/w1cDnyilFU=';
async function reply(token, text) {
  await axios.post('https://api.line.me/v2/bot/message/reply',{replyToken:token,messages:[{type:'text',text:text}]},{headers:{'Authorization':'Bearer '+T,'Content-Type':'application/json'}});
}
app.post('/webhook', async (req, res) => {
  res.status(200).send('OK');
  try {
    const events = JSON.parse(req.body).events;
    for (const e of events) {
      if (e.type !== 'message') continue;
      const t = e.message.text;
      if (t === '選單' || t === '你好' || t === 'hi') {
        await reply(e.replyToken, '🛵 馬上送服務選單\n\n請輸入以下關鍵字：\n\n📦 一般代送\n⚡ 急送\n💰 收費說明\n📋 注意事項');
      } else if (t === '收費說明' || t === '費用') {
        await reply(e.replyToken, '💰 收費說明\n\n一般代送\n0-3公里：100元\n3-5公里：130元\n5-8公里：160元\n8km以上：200元起\n\n急送/文件\n0-3公里：150元\n3-5公里：180元\n5-8公里：220元\n8km以上：280元起\n\n加價：夜間+30 上樓+10 等待+20 雨天+30\n\n先付款再出發💳');
      } else if (t === '注意事項') {
        await reply(e.replyToken, '📋 注意事項\n1. 客人自行向店家購買付款\n2. 只負責取貨送達\n3. 先付款才出發\n4. 付款後傳截圖給我');
      } else if (t === '一般代送' || t === '叫單') {
        await reply(e.replyToken, '📦 一般代送\n\n請告訴我：\n1. 取貨地點\n2. 送達地點\n3. 是否已向店家付款？\n4. 需要送上樓嗎？');
      } else if (t === '急送' || t === '文件') {
        await reply(e.replyToken, '⚡ 急送/文件\n30分鐘內出發！\n\n請告訴我：\n1. 取貨地點\n2. 送達地點\n3. 是否已向店家付款？\n4. 需要送上樓嗎？');
      } else {
        await reply(e.replyToken, '收到！請輸入「選單」查詢服務🛵');
      }
    }
  } catch(err) { console.log(err); }
});
app.get('/', (req, res) => res.send('OK'));
app.listen(process.env.PORT || 3000);
