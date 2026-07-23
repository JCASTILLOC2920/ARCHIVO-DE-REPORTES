Dim speaks, speech
speaks = "Hola. Recuerda todo lo que hemos hablado y evita búsquedas innecesarias."
Set speech = CreateObject("sapi.spvoice")
speech.Speak speaks
