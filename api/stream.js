export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { systemPrompt, prompt } = req.body;
    
    // Vercel 환경 변수 세팅 문제를 피하기 위해 API 키를 직접 입력 (하드코딩)
    const apiKey = "AQ.Ab8RN6J1bV4ssqLeNRtKjBjGKQtYdg8jRMf9qHVZxbwI8G0UzA";
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 2000 } 
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      // Gemini API가 뱉어낸 진짜 에러 메시지를 프론트엔드로 전달
      return res.status(500).json({ error: data.error?.message || 'AI 응답 구조 오류' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}
