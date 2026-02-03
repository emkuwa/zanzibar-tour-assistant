const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are a Zanzibar resident expert. Give helpful advice. Do not repeat greetings if the conversation has already started."
    });

    try {
        const body = JSON.parse(event.body);
        const history = body.history || [];
        
        // Tunachukua ujumbe wa mwisho kutoka kwenye historia
        const userMessage = history[history.length - 1].parts[0].text;

        const chat = model.startChat({
            history: history.slice(0, -1),
            generationConfig: { maxOutputTokens: 500 },
        });

        // HAPA: Hakikisha mstari huu haukatwi (unapaswa kuwa mstari mmoja)
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: text }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to get AI response" }),
        };
    }
};