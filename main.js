const chatBoxEl = document.querySelector("#chat-box");
const inputEl = document.querySelector("input");
const buttonEl = document.querySelector("button");
const contactStatusEl = document.querySelector('.contact-status')

const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

const messages = [
    {
        text: "Ciao! Benvenuto da Osteria al Casale. Vuoi prenotare un tavolo?",
        time: new Date().toLocaleString(),
        type: "received"
    }

];

showMessages();
inputEl.addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
        sendMessage();
    }
});

buttonEl.addEventListener("click", sendMessage);

function showMessages() {

    chatBoxEl.innerHTML = "";

    for (const messaggio of messages) {

        chatBoxEl.innerHTML +=

            `<div class="chat-row ${messaggio.type}">
			<div class="chat-message">
				<p>${messaggio.text}</p>
				<time datetime="${messaggio.time}">
					${messaggio.time}
				</time>
			</div>
		</div>`;


    }

    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
}

function sendMessage() {

    const inputText = inputEl.value.trim();

    if (inputText == "") {
        return;
    }

    addMessage(inputText, "sent");

    inputEl.value = "";
    inputEl.focus();

    getAnswer();
}

function addMessage(messageText, messageType) {

    const adesso = new Date();
    const tempoStringa = adesso.toLocaleString();

    const newMessage = {
        text: messageText,
        time: tempoStringa,
        type: messageType
    };

    messages.push(newMessage);

    showMessages();
}

function getAnswer() {
    contactStatusEl.innerText = "Sta scrivendo..."

    const requestConfig = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer API_KEY`
        },
        body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: formatDataForOpenRouter()
        })
    };



    fetch(apiUrl, requestConfig).then(response => {
        return response.json();

    }).then(data => {

        console.log("risposta", data);

        if (data.error) {
            console.error("Errore API:", data.error);

            addMessage("Errore:" + (data.error.message || "Impossibile ottenere risposta"), "received");
        }
        else if (data.choices && data.choices.length > 0) {

            const risposta = data.choices[0].message.content;
            console.log(risposta);

            addMessage(risposta, "received");
        }
        contactStatusEl.innerText = 'Online 🟢';
    })

        .catch(error => {
            console.error("Errore di rete:", error);
            contactStatusEl.innerText = 'Online 🟢';

        });

}

function formatDataForOpenRouter() {
    const results = [
        {
            role: "system",
            content: `Sei l'assistente virtuale per le prenotazioni di "Osteria Al Casale". Sei caloroso, educato e professionale.
IL TUO OBIETTIVO PRINCIPALE:
Devi guidare tu attivamente la conversazione facendo domande al cliente, UNA ALLA VOLTA, fino a raccogliere tutti i dati necessari per la prenotazione.
REGOLE FONDAMENTALI DEL RISTORANTE:
1. Turni di cena: si cena SOLO in due turni: alle 19:30 o alle 21:30. Non accettare altri orari.
2. Giorno di chiusura: il MERCOLEDÌ siamo CHIUSI. Se chiedono di mercoledì, avvisa con gentilezza che siamo chiusi e chiedi per quale altro giorno preferiscono.
FLUSSO DELLE DOMANDE (Fai una sola domanda alla volta in questo ordine):
1. DATA: se non la conosci, chiedi per quale giorno desidera prenotare.
2. TURNO ORARIO: chiedi se preferisce il primo turno delle 19:30 o il secondo turno delle 21:30.
3. NUMERO OSPITI: chiedi per quante persone sarà il tavolo.
4. INTOLLERANZE: chiedi se qualcuno al tavolo ha intolleranze, allergie o preferenze particolari.
5. NOME: chiedi a che nome registrare la prenotazione.
6. RIEPILOGO: quando hai TUTTI i 5 dati, fai un riepilogo con data, orario, numero persone, intolleranze e nome, e conferma la prenotazione.
REGOLE DI RISPOSTA:
- Rispondi sempre in italiano, con messaggi brevi (massimo 2-3 frasi).
- REGOLA D'ORO: Non limitarti mai a ringraziare o rispondere in modo passivo. Termina SEMPRE ogni tuo messaggio con la prossima domanda del flusso!`
        }
    ];


    for (const messaggio of messages) {
        const oggettoFormattato = {
            content: messaggio.text,

        };

        if (messaggio.type == "sent") {
            oggettoFormattato.role = "user";

        } else {
            oggettoFormattato.role = "assistant";

        }

        results.push(oggettoFormattato);

    }
    return results;
}
