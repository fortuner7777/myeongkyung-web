module.exports = async function handler(req, res) {
  // POST 요청이 아니면 차단
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { systemPrompt, prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    // API 키 확인
    if (!apiKey) {
      return res.status(500).json({ error: 'Vercel에 GEMINI_API_KEY 환경 변수가 등록되지 않았습니다.' });
    }

    // 🚨 수정 완료: 존재하지 않는 3.5 대신 빠르고 가성비 좋은 공식 모델(1.5-flash) 적용
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 8000 }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // 정상적으로 텍스트를 받아왔을 경우
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      // 구글 서버 에러 처리
      return res.status(500).json({ error: data.error?.message || 'AI 응답 생성 실패' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
};
