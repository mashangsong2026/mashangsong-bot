const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const app = express();
const SECRET = 'f98835e84e7343478d5a5f910a843b96';
const TOKEN = 'onm+bW0l7NNBYxM+llauWHBqzbve7gJfoH+0iiGJgIsiw49dm+o3cEhd9BgWGBJW/bYYktDLYU4Kry5X0gOaKKyI8wNFvHqdslh78v25eSGF8yHSlqXK8JVXqOcu94qD5AF1sBQvyrQwRV+0sljI4QdB04t89/1O/w1cDnyilFU=';
app.use('/webhook', express.raw({type:'application/json'}));
app.use(express.json());
async function reply(token, messages) {
  await axios.post('https://api.line.me/v2/bot/message/reply', {replyToken:token, messages}, {headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN}});
}
app.post('/webhook', (req, res) => {
  const sig = req.headers['x-line-signature'];
  const hash = crypto.createHmac('SHA256', SECRET).update(req.body).digest('base64');
  if (hash !== sig) return res.status(401).send('Unauthorized');
  const events = JSON.parse(req.body).events;
  events.forEach(async (e) => {
    if (e.type !== 'message' || e.message.type !== 'text') return;
    const t = e.message.text.trim();
    const r = e.replyToken;
    if (['你好','hi','Hi','開始','選單'].includes(t)) {
      await reply(r, [{type:'template',altText:'馬上送選單',template:{type:'buttons',title:'🛵 馬上送',text:'請選擇服務',actions:[{type:'message',label:'📦 一般代送',text:'一般代送'},{type:'message',label:'⚡ 急送文件',text:'急送'},{type:'message',label:'💰 收費說明',text:'收費說明'},{type:'message',label:'📋 注意事項',text:'注意事項'}]}}]);
    } else if (['收費說明','費用','多少錢'].includes(t)) {
      await reply(r, [{type:'text',text:'💰 收費說明\n\n一般代送\n0-3公里：100元\n3-5公里：130元\n5-8公里：160元\n8公里以上：200元起\n\n急送／文件\n0-3公里：150元\n3-5公里：180元\n5-8公里：220元\n8公里以上：280元起\n\n加價\n夜間+30 上樓+10 等待+20 雨天+30\n\n先付款再出發\n轉帳或LINE Pay'}]);
    } else if (['注意事項','規則'].includes(t)) {
      await reply(r, [{type:'text',text:'📋 注意事項\n\n1. 客人自行向店家購買付款\n2. 只負責取貨送達\n3. 先付款才出發\n4. 付款後傳截圖給我\n\n叫單請告訴我：\n取貨地點\n送達地點\n是否急送\n是否送上樓'}]);
    } else if (['一般代送','叫單','代送'].includes(t)) {
      await reply(r, [{type:'text',text:'📦 一般代送\n\n請告訴我：\n1. 取貨地點\n2. 送達地點\n3. 商品已付款了嗎？\n4. 需要送上樓嗎？\n\n收到後我會回覆預估費用💰'}]);
    } else if (['急送','急件','文件'].includes(t)) {
      await reply(r, [{type:'text',text:'⚡ 急送／文件\n\n30分鐘內出發！\n\n請告訴我：\n1. 取貨地點\n2. 送達地點\n3. 商品已付款了嗎？\n4. 需要送上樓嗎？\n\n收到後我會回覆預估費用💰'}]);
    } else {
      await reply(r, [{type:'text',text:'收到！我會盡快回覆你🛵\n\n查詢服務請輸入「選單」'}]);
    }
  });
  res.status(200).send('OK');
});
app.get('/', (req, res) => res.send('馬上送運行中🛵'));
app.listen(process.env.PORT || 3000, () => console.log('馬上送啟動！'));
