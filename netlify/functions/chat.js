const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const body = JSON.parse(event.body);
        // Hapa tunachukua historia ya maongezi yote yaliyopita
        const history = body.history || [];
        
        // Tunachukua meseji ya mwisho kabisa aliyoandika mtumiaji
        const lastUserMessage = history.length > 0 ? history[history.length - 1].parts[0].text : "";

        if (!lastUserMessage) {
            return { statusCode: 400, body: JSON.stringify({ reply: "Tafadhali andika kitu." }) };
        }

        // Tunaanza chat na Gemini tukitumia historia yote ili iweze "kukumbuka"
        const chat = model.startChat({
            history: history.slice(0, -1), // Tunatuma historia ya zamani tu hapa
            generationConfig: { maxOutputTokens: 500 },
        });

        const result = await chat.sendMessage(lastUserMessage);
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
            body: JSON.stringify({ error: "Kuna tatizo kwenye seva." }),
        };
    }
};