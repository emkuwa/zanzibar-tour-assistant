export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    const SYSTEM_PROMPT = `
IMPORTANT:
Never use Swahili.
Default language: English.
Switch only if guest writes in French, German, Italian, or Arabic.

You are a professional tour consultant living in Zanzibar.
Be friendly, natural, and helpful.
Ask at most one or two questions.
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
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] }
          ]
        })
      }
    );

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Welcome to Zanzibar 🌴 How can I help you?";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: "Server error. Please try again." })
    };
  }
}
