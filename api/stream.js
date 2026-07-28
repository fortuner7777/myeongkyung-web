export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { systemPrompt, prompt } = req.body;
    
    // Vercel 환경 변수에서 키를 가져오도록 설정 (앞서 세팅하신 GEMINI_API_KEY 사용)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Vercel에 GEMINI_API_KEY 환경 변수가 등록되지 않았습니다.' });
    }
    
    // 유료 계정(Tier 1)과 완벽하게 호환되는 최신 2.5 플래시 표준 엔드포인트
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
      return res.status(500).json({ error: data.error?.message || 'AI 응답 구조 오류 (candidates 없음)' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}
