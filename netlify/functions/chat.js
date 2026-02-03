const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Tumeongeza 'systemInstruction' ili kuzuia salamu zinazojirudia
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are a Zanzibar resident expert. Give helpful advice. Don't repeat greetings if the conversation has already started."
    });

    try {
        const body = JSON.parse(event.body);
        const history = body.history || [];
        const userMessage = history[history.length - 1].parts[0].text;

        const chat = model.startChat({
            history: history.slice(0, -1),
            generationConfig: { maxOutputTokens: 500 },
        });

        // MSTARI MMOJA: Muhimu usivunje huu mstari
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: response.text() }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to get AI response" }),
        };
    }
};