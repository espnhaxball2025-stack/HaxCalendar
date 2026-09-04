export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { message } = await request.json();

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ reply: "No se ha configurado la clave de API (GEMINI_API_KEY) en el servidor." }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const systemInstruction = `
          Sos el asistente virtual e inteligencia artificial oficial del sitio web HaxCalendar.
          Tu función es responder dudas sobre la agenda de partidos, torneos, novedades de streamers y tácticas del juego Haxball.
          Debes responder siempre de forma educada, amable, clara y profesional.
          Si el usuario pregunta sobre temas ajenos a Haxball o creación de contenido/gaming, explícale de forma respetuosa que solo puedes responder consultas relacionadas a HaxCalendar y Haxball.
        `;

       const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

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

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return new Response(JSON.stringify({ reply: replyText || "No se pudo obtener una respuesta del servidor." }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ reply: `Error en el servidor: ${err.message}` }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
