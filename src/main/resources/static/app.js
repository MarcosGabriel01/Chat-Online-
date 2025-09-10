const stompClient = new StompJs.Client({
  brokerURL: (location.protocol === 'https:' ? 'wss://' : 'ws://') +
             window.location.host + '/livechat-websocket', // Conexão WebSocket com o servidor
  connectHeaders: {},
  onConnect: (frame) => {
    setConnected(true); // Atualiza o estado para "conectado" após sucesso
    console.log('Conectado:', frame);

    stompClient.subscribe('/topico/sala', (message) => {
      const body = JSON.parse(message.body);
      console.log('Recebido:', body);
      updateLiveChat(body.usuario, body.mensagem);
    });
  },
  onWebSocketError: (error) => {
    console.error('Erro no WebSocket:', error);
  },
  onStompError: (frame) => {
    console.error('Erro do broker:', frame.headers['message']);
    console.error('Detalhes:', frame.body);
  }
});

let connected = false;

function setConnected(connectedState) {
  connected = connectedState;
  
  // Atualiza os botões conforme o estado de conexão
  $("#connect").prop("disabled", connected);   // Desabilita o botão de "Entrar" quando já conectado
  $("#disconnect").prop("disabled", !connected); // Desabilita o botão de "Sair" quando não conectado

  $("#conversation").toggle(connected);  // Exibe a área de chat somente quando conectado
}

function connect() {
  if (!connected) {
    stompClient.activate();  // Conecta o cliente STOMP ao WebSocket
  }
}

function disconnect() {
  if (connected) {
    stompClient.deactivate();  // Desconecta o cliente STOMP
    setConnected(false);  // Atualiza o estado para "desconectado"
    console.log("Desconectado");
  }
}

function sendMessage() {
  const usuario = $("#user").val();
  const mensagem = $("#msg").val();

  // Verifica se o cliente STOMP está conectado antes de enviar a mensagem
  if (!connected) {
    alert("Conecte-se primeiro");  // Alerta para o usuário se não estiver conectado
    return;
  }

  // Verifica se a mensagem não está vazia
  if (!mensagem.trim()) {
    alert("Escreva a sua mensagem");  // Alerta para o usuário se a mensagem estiver em branco
    return;
  }

  // Publica a mensagem no servidor WebSocket
  stompClient.publish({
    destination: "/app/batepapo/enviar", // Envia a mensagem para o destino apropriado
    body: JSON.stringify({ usuario, mensagem })
  });

  $("#msg").val("");  // Limpa o campo de mensagem após o envio
}

function updateLiveChat(usuario, mensagem) {
  const li = document.createElement("li");
  li.classList.add("other");  // Adiciona a classe "other" para as mensagens recebidas
  li.innerHTML = `<strong>${usuario}</strong>: ${mensagem}`;
  document.getElementById("livechat").appendChild(li);

  // Rola para o fundo automaticamente quando uma nova mensagem for adicionada
  const chat = document.getElementById("livechat");
  chat.scrollTop = chat.scrollHeight;
}

// Configuração dos eventos de clique
$(function () {
  $("form").on('submit', (e) => e.preventDefault());

  // Associa os botões de conectar e desconectar aos eventos
  $("#connect").click(connect);
  $("#disconnect").click(disconnect);

  // Envia mensagem ao clicar no botão "Enviar"
  $("#send").click(sendMessage);

  // Envia mensagem ao pressionar "Enter"
  $("#msg").keypress(function (e) {
    if (e.which === 13) {  // Verifica se a tecla pressionada foi "Enter"
      sendMessage();
    }
  });
});
