const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "process.env.OPENAI_API_KEY",
});
// const API_KEY = process.env.OPENAI_API_KEY;

async function getChatbotResponse(userMessage) {
  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o",
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for SportZone, an athletic events platform. Help users with sports events, bookings, and general sports information. Keep responses concise."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      extra_headers: {
        "HTTP-Referer": "https://mellifluous-caramel-bd2364.netlify.app/",
        "X-Title": "SportZone - Athletic Events Platform",
      }
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Chatbot error:', error);
    return "I'm sorry, I'm having trouble responding right now. Please try again later.";
  }
}

module.exports = { getChatbotResponse };
