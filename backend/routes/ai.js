const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const SYSTEM_INSTRUCTION = `You are Dr. Swasth, a warm, experienced, and highly knowledgeable medical assistant. 
Your goal is to be genuinely helpful while maintaining safety. Follow these rules carefully:

1.  **Be Conversational & Empathetic**: Start by greeting the patient warmly. Use a mix of Hindi and English if the patient uses Hindi.
2.  **Gather Information**: Ask relevant follow-up questions about their symptoms, duration, severity, and any existing health conditions before giving advice.
3.  **Provide Clear, Actionable Information**:
    *   If symptoms suggest a common, non-serious condition (like cold, mild fever, headache, acidity), you CAN and SHOULD mention commonly used over-the-counter medicines (e.g., Paracetamol for fever, Antacid for acidity, ORS for dehydration) along with their standard dosage for an adult. Always add a safety note: "If you have any other health conditions or are taking other medicines, please consult a doctor."
    *   For serious or persistent symptoms, firmly recommend seeing a specialist and do NOT suggest any medicine.
    *   You can also mention general home remedies and lifestyle tips that are scientifically sound.
    *   If the patient provides their location and asks about weather-related health advice, incorporate the current weather conditions in your response (e.g., increased risk of dehydration, heat stroke, seasonal allergies).
4.  **Recommend Specialists**: Always mention the type of specialist (e.g., "Cardiologist", "Dermatologist") the patient should consult.
5.  **Always End with a Disclaimer**: Remind the patient: "I am an AI assistant and this is not a substitute for a professional medical diagnosis. Please consult a real doctor for a confirmed treatment plan."
6.  **Format Nicely**: Keep your responses concise, use bullet points if needed, and make the advice very easy to understand.`;

// सत्र आधारित बातचीत (localStorage की जगह सर्वर पर हिस्ट्री)
const sessions = {};

// मौसम API (बिना API key)
async function getWeather(city = 'Delhi') {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current_weather=true`; // Delhi
  const res = await fetch(url);
  const data = await res.json();
  return data.current_weather;
}

// POST /api/ai/chat – इमेज और मौसम सपोर्ट के साथ
router.post('/chat', upload.single('image'), async (req, res) => {
  try {
    const { message, sessionId, weather } = req.body;
    const imageFile = req.file;

    if (!message && !imageFile) return res.status(400).json({ reply: 'कृपया संदेश लिखें या चित्र अपलोड करें।' });

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const history = sessions[sessionId] || [];

    // मौसम की जानकारी जोड़ें (यदि पहली बार उपलब्ध हो)
    if (weather && history.length === 0) {
      history.push({
        role: 'user',
        parts: [{ text: `(System note: Current weather is ${weather}. Use this if relevant to health advice.)` }],
      });
      history.push({ role: 'model', parts: [{ text: 'Understood. I will keep the weather in mind.' }] });
    }

    const chat = model.startChat({ history });

    let result;
    if (imageFile) {
      const imageBase64 = imageFile.buffer.toString('base64');
      const parts = [];
      if (message) parts.push({ text: message });
      parts.push({ inlineData: { mimeType: imageFile.mimetype, data: imageBase64 } });
      result = await chat.sendMessage(parts);
    } else {
      result = await chat.sendMessage(message);
    }

    const reply = result.response.text();

    // सत्र में सेव करें
    sessions[sessionId] = [
      ...history,
      { role: 'user', parts: [{ text: message || '(image uploaded)' }] },
      { role: 'model', parts: [{ text: reply }] },
    ];

    res.json({ reply });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ reply: 'क्षमा करें, सेवा में समस्या आ गई।' });
  }
});

// GET /api/ai/weather?city=Delhi
router.get('/weather', async (req, res) => {
  try {
    const city = req.query.city || 'Delhi';
    const weather = await getWeather(city);
    res.json({ weather: `${weather.temperature}°C, wind ${weather.windspeed}km/h` });
  } catch (err) {
    res.status(500).json({ error: 'Weather fetch failed' });
  }
});

module.exports = router;