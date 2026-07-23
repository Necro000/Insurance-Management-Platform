const Groq = require('groq-sdk');

let groqClient = null;

/**
 * Get a singleton Groq client instance.
 * @returns {Groq} Initialized Groq client
 */
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

/**
 * Send a prompt to Groq and get a completion.
 * @param {string} userMessage - The user message / prompt
 * @param {string} systemPrompt - Optional system instruction
 * @param {string} model - Groq model to use (default: llama3-8b-8192)
 * @returns {Promise<string>} AI response text
 */
const askGroq = async (userMessage, systemPrompt = '', model = 'llama3-8b-8192') => {
  const client = getGroqClient();

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userMessage });

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || '';
};

module.exports = { getGroqClient, askGroq };
