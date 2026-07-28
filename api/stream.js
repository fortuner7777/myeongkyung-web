export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const { systemPrompt, prompt } = await req.json();
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.6,
        maxOutputTokens: 2000 // ★ AI가 중간에 끊기지 않고 충분히 길게 쓸 수 있도록 출력 허용치를 넉넉하게 늘려줍니다 ★
      } 
    })
  });
  
  return new Response(response.body, { 
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } 
  });
}
