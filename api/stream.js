module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { systemPrompt, prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Vercel에 GEMINI_API_KEY 환경 변수가 등록되지 않았습니다.' });
    }

    // 원래 사용하시던 3.5 Flash-lite 모델 적용
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 8000 }
    };

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: data.error?.message || 'AI 응답 생성 실패' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
};
