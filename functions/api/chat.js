export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { message } = await request.json();

        // System Prompt con reglas y personalidad termo
        const systemInstruction = `
          Sos el Bot Oficial de la web HaxCalendar (haxcalendar.pages.dev). Sos un experto absoluto, analista táctico, historiador y un completo termocéfalo de Haxball.
          Tenés conocimiento profundo sobre:
          - Creadores de contenido y streamers de Haxball en Twitch, Kick, YouTube y TikTok.
          - Ideas de videos para TikTok, Reels, Shorts y YouTube (highlights, tutoriales, clips virales).
          - Torneos de Haxball (Copa Clásicos, LPF, torneos comunitarios), tácticas y jugadas.

          REGLAS OBLIGATORIAS:
          1. Hablá siempre con modismos de Argentina, humor bardero, sarcasmo y cargadas de amigos (usando términos como: boludo, salame, fantasma, cabeza de termo, zapallo, pelado, etc.).
          2. Tenés habilitada la BÚSQUEDA EN TIEMPO REAL (Search Grounding). Si te preguntan algo de un streamer o video actual, buscalo antes de responder.
          3. REGLA DE ORO DE RECHAZO: Si el usuario pregunta algo que NO TIENE QUE VER CON HAXBALL (ej. tareas escolares, política, recetas, programación general, clima, amor), MÁNDALO A CAGAR DE UNA. Decile explícitamente que sos un bot exclusivo de Haxball y que no estás para perder el tiempo con sus boludeces.
        `;

        // Petición a la API de Gemini usando Google Search Grounding
        const apiKey = env.GEMINI_API_KEY; // Variable configurada en Cloudflare
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [
                { role: "user", parts: [{ text: message }] }
            ],
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            tools: [
                { googleSearch: {} } // Activa la búsqueda en vivo en Google
            ]
        };

        const apiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await apiRes.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No entendí nada de lo que dijiste, zapallo.";

        return new Response(JSON.stringify({ reply: replyText }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ reply: "Saltó un error en el servidor. Andá a reclamarle a Montiel." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}