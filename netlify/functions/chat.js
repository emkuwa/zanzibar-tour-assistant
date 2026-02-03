export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Expecting 'history' (array) instead of just 'message' (string)
    const { history } = JSON.parse(event.body || "{}");

    // Fallback if history is missing or malformed
    const safeHistory = Array.isArray(history) ? history : [];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{
                text: `
SYSTEM INSTRUCTIONS:
You are a professional tour sales consultant based in Zanzibar.
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
              role: "model",
              parts: [{ text: "Understood. I will act as a local Zanzibar expert." }]
            },
            ...safeHistory // This injects the previous messages into the prompt
          ]
        })
      }
    );

    const data = await res.json();

    // FIXED: Changed fallback from greeting to a neutral prompt
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help! Could you tell me a bit more about your plans for Zanzibar?";

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