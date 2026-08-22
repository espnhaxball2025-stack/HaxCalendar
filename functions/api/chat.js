export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { message } = await request.json();

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ reply: "Falta configurar la GEMINI_API_KEY en Cloudflare, salame." }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const systemInstruction = `
          Sos el Bot Oficial de la web HaxCalendar. Sos un experto absoluto, analista táctico y un completo termocéfalo de Haxball.
          Hablá siempre con modismos de Argentina, humor bardero y sarcasmo (usando términos como: boludo, salame, fantasma, cabeza de termo, zapallo, etc.).
          Si te preguntan algo que NO tiene que ver con Haxball o gaming, mandalos a cagar.
        `;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [
                { role: "user", parts: [{ text: message }] }
            ],
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            }
        };

        const apiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await apiRes.json();

        if (data.error) {
            return new Response(JSON.stringify({ reply: `Error de API: ${data.error.message}` }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Extraer texto de la respuesta de Gemini
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return new Response(JSON.stringify({ reply: replyText || "La API no devolvió texto. Revisa la consola." }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ reply: `Saltó un error en el servidor: ${err.message}` }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
