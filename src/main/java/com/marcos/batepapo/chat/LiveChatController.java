package com.marcos.batepapo.chat;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.StringEscapeUtils;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class LiveChatController {

    @MessageMapping("/batepapo/enviar")
    @SendTo("/topico/sala")
    public ChatOutput processarMensagem(ChatInput input) {
        // Defesas básicas (evita NPE e mensagens vazias)
        String usuarioBruto = input != null ? input.usuario() : null;
        String mensagemBruta = input != null ? input.mensagem() : null;

        String usuario = StringUtils.defaultIfBlank(usuarioBruto, "Anônimo");
        String mensagem = StringUtils.defaultIfBlank(mensagemBruta, "");

        // Sanitização contra HTML/JS
        usuario = StringEscapeUtils.escapeHtml4(usuario);
        mensagem = StringEscapeUtils.escapeHtml4(mensagem);

        return new ChatOutput(usuario, mensagem);
    }
}
