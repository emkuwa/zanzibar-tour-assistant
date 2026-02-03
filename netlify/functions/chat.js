export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    const prompt = `
IMPORTANT:
Never use Swahili.
Always respond in English unless the guest writes in French, German, Italian, or Arabic.
You are a professional tour consultant living in Zanzibar.
Be friendly, natural, and practical.
Ask one or two clear questions.
Do not mention you are an AI.

Guest message:
"${message}"
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ]
        })
      }
    );

    const data = await res.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Welcome to Zanzibar 🌴 How can I help you plan your trip?";

    return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  },
  body: JSON.stringify({ reply })
};

  }
}
