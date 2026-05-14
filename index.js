const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

const CHANNEL_SECRET = process.env.CHANNEL_SECRET;
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

function verifySignature(req) {
  const signature = req.headers["x-line-signature"];
  const hash = crypto
    .createHmac("sha256", CHANNEL_SECRET)
    .update(req.rawBody)
    .digest("base64");
  return hash === signature;
}

async function replyMessage(replyToken, text) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
    }
  );
}

app.post("/callback", async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(400).send("Invalid signature");
  }

  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMsg = event.message.text.trim();
      const replyToken = event.replyToken;
      let reply = "";

      if (userMsg.includes("一般代送")) {
        reply =
          "📦 一般代送服務\n\n" +
          "✅ 服務範圍：桃園市\n" +
          "✅ 付款方式：先付款再出發\n\n" +
          "請告訴我們：\n" +
          "1️⃣ 取件地點\n" +
          "2️⃣ 送達地點\n" +
          "3️⃣ 物品內容\n" +
          "4️⃣ 您的聯絡電話";
      } else if (userMsg.includes("急送")) {
        reply =
          "⚡ 急送服務\n\n" +
          "🚀 最快30分鐘送達\n" +
          "✅ 服務範圍：桃園市\n" +
          "✅ 付款方式：先付款再出發\n\n" +
          "請告訴我們：\n" +
          "1️⃣ 取件地點\n" +
          "2️⃣ 送達地點\n" +
          "3️⃣ 物品內容\n" +
          "4️⃣ 您的聯絡電話";
      } else if (userMsg.includes("收費") || userMsg.includes("費用")) {
        reply =
          "💰 收費說明\n\n" +
          "• 0~3 公里：$60\n" +
          "• 3~6 公里：$90\n" +
          "• 6~10 公里：$120\n" +
          "• 10 公里以上：另行報價\n\n" +
          "⚡ 急送加收 $30\n" +
          "🌙 夜間（22:00後）加收 $20";
      } else if (userMsg.includes("注意")) {
        reply =
          "📋 注意事項\n\n" +
          "1. 本服務採先付款再出發\n" +
          "2. 違禁品、危險物品恕不代送\n" +
          "3. 易碎品請事先告知\n" +
          "4. 服務範圍限桃園市\n" +
          "5. 如有問題請直接留言詢問";
      } else {
        reply =
          "🛵 馬上送服務選單\n\n" +
          "請輸入以下關鍵字：\n\n" +
          "📦 一般代送\n" +
          "⚡ 急送\n" +
          "💰 收費說明\n" +
          "📋 注意事項";
      }

      await replyMessage(replyToken, reply);
    }
  }

  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`馬上送 Bot 啟動中，Port: ${PORT}`);
});
