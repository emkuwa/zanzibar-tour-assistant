const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    // 1. Setup API Key and Model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const body = JSON.parse(event.body);
        // 2. Get the history from the request
        const history = body.history || [];
        
        // 3. Extract the very last message the user sent
        const userMessage = history[history.length - 1].parts[0].text;

        // 4. Start the chat with the provided history (minus the last message)
        const chat = model.startChat({
            history: history.slice(0, -1), // Everything except the current message
            generationConfig: { maxOutputTokens: 500 },
        });

        // 5. Send the message to Gemini
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