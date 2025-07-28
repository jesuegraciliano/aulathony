document.addEventListener('DOMContentLoaded', () => {
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');

  // **ATENÇÃO:** Esta é a URL do seu webhook do N8N Chat Trigger.
  // Certifique-se de que esta URL está correta e que seu workflow N8N está ativo.
  const N8N_WEBHOOK_URL = "https://hook.jesue.site/webhook/4e102f5e-e86e-4731-8aa8-9913de5fecc8/chat";

  // Função para adicionar mensagens ao chat (seu ou do bot)
  function addMessage(sender, text) {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Rola automaticamente para o final
  }

  // Função assíncrona para enviar a mensagem para o N8N Webhook
  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) {
      // Não faz nada se a mensagem estiver vazia ou só com espaços
      addMessage("Sistema", "Por favor, digite uma mensagem antes de enviar.");
      return;
    }

    addMessage("Você", message); // Exibe a mensagem digitada pelo usuário
    userInput.value = ''; // Limpa o campo de entrada após enviar
    userInput.focus(); // Coloca o foco de volta no campo para nova digitação

    try {
      // Realiza a requisição POST para o webhook do N8N
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json" // Indica que o corpo da requisição é JSON
        },
        // O corpo da requisição, conforme esperado pelo N8N Chat Trigger (geralmente com a chave 'text')
        body: JSON.stringify({
          text: message,
          // Você pode adicionar outros dados se o seu workflow N8N precisar,
          // por exemplo, para identificar o usuário ou a origem:
          // sessionId: "web_chat_user_session_abc",
          // source: "web_frontend"
        })
      });

      // Verifica se a resposta HTTP foi bem-sucedida (status 2xx)
      if (!response.ok) {
        // Se a resposta não for OK, tenta ler o texto do erro do servidor e lança uma exceção
        const errorText = await response.text();
        throw new Error(`Erro HTTP! Status: ${response.status} - ${response.statusText}. Resposta do servidor: ${errorText}`);
      }

      const jsonResponse = await response.json(); // Converte a resposta para JSON

      // Exibe a resposta do bot.
      // Prioriza 'output' (se configurado no N8N), depois 'text', ou uma mensagem padrão.
      addMessage("Bot", jsonResponse.output || jsonResponse.text || "Workflow N8N acionado. Nenhuma resposta específica retornada.");

    } catch (e) {
      // Captura e exibe erros que ocorrem durante a requisição ou processamento
      console.error("Erro ao comunicar com o N8N Webhook:", e);
      addMessage("Bot", `Erro na conexão com o N8N. Por favor, verifique o console para mais detalhes. (${e.message})`);
    }
  }

  // Adiciona um "listener" para o evento de clique no botão "Enviar"
  sendButton.addEventListener('click', sendMessage);

  // Adiciona um "listener" para o evento de pressionar tecla no campo de entrada
  userInput.addEventListener('keypress', (e) => {
    // Se a tecla pressionada for "Enter", chama a função sendMessage
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
});
