# Guia do Desenvolvedor: Videoconferência (ConferenceModal)

Seja bem-vindo ao guia técnico da funcionalidade de Videoconferência do Flash. Este documento foi estruturado para que você possa entender, realizar manutenção ou replicar este recurso em outros módulos do projeto.

---

## 1. Visão Geral

O componente principal é o `ConferenceModal.tsx`. Ele encapsula o SDK do Jitsi Meet e gerencia todo o ciclo de vida de uma chamada: desde a entrada do usuário até o encerramento seguro (saída limpa).

---

## 2. Estrutura de Dados (Interfaces)

Para facilitar a comunicação com o SDK do Jitsi (que é escrito em JavaScript), definimos algumas "contas" (interfaces) no TypeScript:

- **`ConferenceModalProps`**: O que esse componente recebe do pai (ex: `roomName`, `userName`).
- **`JitsiApi`**: O que o Jitsi nos devolve para que possamos controlá-lo (ex: método para listar participantes).
- **`JitsiEvent`**: O formato dos "avisos" (eventos) que o Jitsi nos envia (ex: "alguém entrou na sala").

---

## 3. O "Cérebro" do Componente: Estados e Refs

Aqui está como o componente "pensa":

### Estados (useState)

- **`isTerminated`**: Quando vira `true`, esconde o vídeo e mostra a "Tela Azul" de sucesso.
- **`isReconnecting`**: Quando vira `true`, mostra o aviso de "Oscilação na conexão".
- **`mountKey`**: Um truque técnico! Se mudarmos esse número, o Jitsi é forçado a recarregar do zero (usado no botão "Retorne Já").

### Referências (useRef) - [CRÍTICO]

Referenciamos valores que não podem "esperar" a renderização do React:

- **`intentionalExitRef`**: Este é o mais importante. Ele marca se o usuário CLICOU para sair.
  - **Por que existe?** Porque quando você sai da internet, o Jitsi avisa que a conexão caiu. Quando você clica em Sair, a conexão *também* cai. Usamos essa Ref para saber se a queda foi um **erro** ou um **comando seu**.

---

## 4. Configuração do Jitsi

Ao instanciar o componente `<JitsiMeeting />`, passamos dois blocos de configuração:

1. **`configOverwrite`**: Define o comportamento técnico.
    - Iniciamos com microfone e câmera desligados por padrão.
    - Desativamos páginas de "lobby" para que a entrada seja instantânea.
2. **`interfaceConfigOverwrite`**: Define o visual.
    - Removemos marcas d'água do Jitsi e definimos cores de fundo customizadas.

---

## 5. Fluxo de Saída Determinístico (Passo a Passo)

Implementamos uma lógica que não depende de "tentativa e erro" por tempo, mas sim de fatos:

1. **Ação de Sair**: O usuário clica no **(X)** do modal ou no **Telefone Vermelho** do Jitsi.
2. **Marcação de Intenção**: O sistema marca `intentionalExitRef = true`.
3. **Evento de Saída**: O Jitsi dispara o evento `videoConferenceLeft`.
4. **Decisão**:
    - Se `intentionalExitRef` for `true` -> Direciona para a tela de **"Conferência Encerrada"**.
    - Se for `false` -> Entende como uma **queda de sinal** e mostra "Reconectando...".

---

## 6. Tratamento de Erros e Quedas

Se a conexão falhar de verdade:

- O evento `conferenceFailed` ou `suspended` é disparado.
- O sistema mostra o overlay de reconexão.
- Um cronômetro de 10 segundos é iniciado. Se a internet não voltar nesse tempo, o sistema encerra a sala automaticamente por segurança.

---

## 7. Como Replicar este Componente

Para usar a videoconferência em outro lugar:

1. Importe o `ConferenceModal`.
2. Passe um `roomName` (nome único da sala).
3. Passe o `userName` para identificação no chat do Jitsi.
4. Certifique-se de que o sistema de estilos (variáveis CSS) esteja disponível, pois o modal usa variáveis como `--bg-primary` e `--accent-primary`.

---

> [!TIP]
> **Dica de Ouro:** Sempre use a `intentionalExitRef` antes de disparar qualquer aviso de erro. Isso evita que o sistema registre falhas de conexão quando o usuário estava apenas saindo da sala voluntariamente.
