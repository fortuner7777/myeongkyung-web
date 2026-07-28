export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { systemPrompt, prompt } = await req.json();
  
  // ★ Vercel 환경 변수(금고)에서 안전하게 API 키를 꺼내옵니다 ★
  const apiKey = process.env.GEMINI_API_KEY;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      // AI 성능 향상을 위한 온도 상향
      generationConfig: { temperature: 0.6 } 
    })
  });
  
  return new Response(response.body, { 
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } 
  });
}
