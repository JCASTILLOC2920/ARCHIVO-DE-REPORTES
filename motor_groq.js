// motor_groq.js
// PROTOCOLO ACTOR-CRITICO: Módulo aislado de transcripción Groq O(1)

const GROQ_API_KEYS = [
    "gsk_ENV_GROQ_KEY_01",
    "gsk_ENV_GROQ_KEY_02",
    "gsk_ENV_GROQ_KEY_03",
    "gsk_ENV_GROQ_KEY_04"
];

let activeKeyIndex = 0;

window.dictadoGroqActivo = true; // Variable global para desactivarlo rápidamente si es necesario

// Función para grabar audio y enviarlo a Groq
window.ejecutarMotorGroq = function(tiempoGrabacionMs = 5000) {
    return new Promise((resolve, reject) => {
        if (!window.dictadoGroqActivo) {
            return reject(new Error("Módulo Groq desactivado manualmente."));
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", async () => {
                    // Detener el uso del micrófono
                    stream.getTracks().forEach(track => track.stop());

                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const file = new File([audioBlob], "dictado.webm", { type: 'audio/webm' });

                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("model", "whisper-large-v3");
                    formData.append("language", "es");
                    formData.append("temperature", "0.0");

                    try {
                        const transcripcion = await fetchConLlaveRotativa(formData);
                        resolve(transcripcion);
                    } catch (err) {
                        reject(err);
                    }
                });

                mediaRecorder.start();

                // Grabación limitada a un tiempo específico para clínica (Ej. 5 segundos)
                // O podría detenerse por evento del usuario. Por simplicidad en este módulo aislado, 
                // grabamos ráfagas cortas, o delegamos el stop a la interfaz.
                // Aquí usaremos 5 segundos por ráfaga automática:
                setTimeout(() => {
                    if (mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                    }
                }, tiempoGrabacionMs);
            })
            .catch(error => {
                reject(new Error("No se pudo acceder al micrófono: " + error.message));
            });
    });
};

async function fetchConLlaveRotativa(formData) {
    let intentos = 0;
    while (intentos < GROQ_API_KEYS.length) {
        const key = GROQ_API_KEYS[activeKeyIndex];
        try {
            const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                return data.text;
            } else if (response.status === 401 || response.status === 429) {
                console.warn(`Llave Groq ${activeKeyIndex} falló. Rotando llave...`);
                activeKeyIndex = (activeKeyIndex + 1) % GROQ_API_KEYS.length;
                intentos++;
            } else {
                throw new Error(`Error API Groq: ${response.status}`);
            }
        } catch (error) {
            throw error; // Falla de red
        }
    }
    throw new Error("Todas las llaves de Groq fallaron o se agotaron.");
}
