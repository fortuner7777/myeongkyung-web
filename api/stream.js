export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { systemPrompt, prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Vercel에 GEMINI_API_KEY 환경 변수가 등록되지 않았습니다.' });
    }

    // 최신 정식 프로덕션 모델인 gemini-3.6-flash 적용
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 2000 }
    };

    let response;
    let data;
    let retries = 5; // 과부하 대비 최대 5번까지 지연 재시도

    while (retries > 0) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      data = await response.json();

      if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
        break;
      }

      // 과부하(High demand / 503) 에러 발생 시 대기 시간을 늘려가며 재시도
      if (data.error && (response.status === 503 || String(data.error.message).includes('high demand'))) {
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 대기 후 재시도
        continue;
      }

      break;
    }
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: data.error?.message || 'AI 응답 생성 실패 (서버 과부하 지속)' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}
