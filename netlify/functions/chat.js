export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "system",
              parts: [{
                text: `
You are a professional tour sales consultant based in Zanzibar.

RULES:
- Never use Swahili.
- Always respond in English unless the guest writes in French, German, Italian, or Arabic.
- Sound natural and human.
- Ask only one or two questions.
- Be helpful, not pushy.
- If the guest wants to book, guide gently toward confirmation.
- Do not mention you are an AI.
                `
              }]
            },
            {
              role: "user",
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await res.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Welcome to Zanzibar 🌴 How can I help you today?";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
