export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { message } = await request.json();

        const apiKey = env.OPENAI_API_KEY; 
        if (!apiKey) {
            return new Response(JSON.stringify({ reply: "Che boludo, configurá la OPENAI_API_KEY en las variables, no seas rata." }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const githubUrl = "https://raw.githubusercontent.com/espnhaxball2025-stack/HaxCalendar/refs/heads/main/index.html"; 
        
        let agendaData = "La página está más caída que mis ganas de laburar, no hay agenda.";
        try {
            const githubRes = await fetch(githubUrl);
            if (githubRes.ok) {
                agendaData = await githubRes.text();
            } else {
                console.log("El fetch falló, tu GitHub debe estar prendido fuego.");
            }
        } catch (e) {
            console.log("Explotó la conexión a GitHub:", e);
        }

        const systemInstruction = `
          Sos el asistente virtual e inteligencia artificial oficial de HaxCalendar.
          Tu función es responder dudas sobre la agenda de partidos, torneos y tácticas del juego Haxball.
          
          A CONTINUACIÓN TE PASO EL CÓDIGO HTML DE LA PÁGINA CON LA AGENDA ACTUALIZADA:
          ${agendaData}
          
          Buscá en ese texto crudo los partidos, fechas y horarios para responderle al usuario. 
          Ignorá todo el código HTML (divs, scripts, estilos) y centrate estrictamente en la información de los eventos.
          Sé claro, no delires fechas y si te preguntan algo que no está ahí, decí que no hay información todavía.
        `;

        const url = 'https://api.openai.com/v1/chat/completions';

        const payload = {
            model: "gpt-4o-mini", 
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: message }
            ],
            temperature: 0.3 
        };

        const apiRes = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` 
            },
            body: JSON.stringify(payload)
        });

        const data = await apiRes.json();

        if (data.error) {
            return new Response(JSON.stringify({ reply: `Error de OpenAI: ${data.error.message}` }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const replyText = data.choices?.[0]?.message?.content;

        return new Response(JSON.stringify({ reply: replyText || "La IA se tildó leyendo tu código basofia." }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ reply: `Rompiste el servidor: ${err.message}` }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
