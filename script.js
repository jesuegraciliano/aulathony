document.addEventListener('DOMContentLoaded', () => {
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');

  // Função para adicionar mensagens ao chat
  function addMessage(sender, text) {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatMessages.appendChild(div);
    // Rola para a mensagem mais recente
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Função para enviar a mensagem para o webhook
  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return; // Não envia mensagem vazia

    addMessage("Você", message); // Adiciona a mensagem do usuário ao chat
    userInput.value = ''; // Limpa o campo de entrada

    try {
      // Faz a requisição POST para o seu webhook
      const resposta = await fetch("https://hook.jesue.site/webhook/aulathony", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, sessionId: "sessao001" }) // Corpo da requisição
      });

      // Verifica se a resposta foi bem-sucedida
      if (!resposta.ok) {
        throw new Error(`Erro HTTP! Status: ${resposta.status}`);
      }

      const json = await resposta.json(); // Pega a resposta JSON
      addMessage("Bot", json.output || "Resposta não recebida ou vazia."); // Adiciona a resposta do bot ao chat
    } catch (e) {
      console.error("Erro ao conectar com o webhook:", e);
      addMessage("Bot", "Erro na conexão com o webhook. Tente novamente mais tarde.");
    }
  }

  // Evento de clique no botão "Enviar"
  sendButton.addEventListener('click', sendMessage);

  // Evento de pressionar "Enter" no campo de texto
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
});
