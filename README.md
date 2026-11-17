# Math Quest

Jogo educativo de plataforma 2D feito com HTML, CSS e JavaScript puro (Canvas 2D), sem bibliotecas nem frameworks.

## Como jogar no computador

1. Abra a pasta `math-quest`.
2. Dê dois cliques em `index.html` (funciona direto no Chrome, Edge ou Firefox, sem internet e sem servidor).

## Controles

| Tecla | Ação |
| --- | --- |
| Setas esquerda/direita ou A/D | Andar |
| Espaço, seta para cima ou W | Pular (segure para pular mais alto) |
| Esc ou P | Pausar / fechar a pergunta |
| M | Ligar/desligar o som |

## Fases

| Fase | Assunto | Dificuldade |
| --- | --- | --- |
| 1 - Floresta dos Números | Adição, subtração, multiplicação e divisão | Fácil |
| 2 - Templo das Frações | Identificação e operações com frações | Média |
| 3 - Castelo das Equações | Equações de primeiro grau | Difícil |

## Regras

- O jogador começa cada fase com 3 vidas. Espinhos, inimigos e buracos tiram uma vida.
- Portões trancados bloqueiam o caminho: responder certo abre a passagem.
- Cada pergunta permite 3 tentativas erradas antes de mostrar uma dica (depois da dica, dá para continuar tentando).
- Pontos: moeda = 10, resposta certa = 50 (+25 se acertar de primeira), inimigo derrotado = 20, cada vida restante ao fim da fase = 100.
- Os checkpoints (bandeiras) aparecem logo depois de cada portão.
- Sem vidas, a fase precisa ser reiniciada.
- As fases são liberadas em sequência e é preciso concluir as três para vencer.
- Recordes e progresso ficam salvos no navegador (LocalStorage).

## Estrutura do projeto

```
math-quest/
├── index.html
├── css/style.css          telas e menus
├── js/
│   ├── main.js            telas, menus, janela de perguntas e laço principal
│   ├── game.js            regras da partida (vidas, portões, inimigos, checkpoints)
│   ├── player.js          personagem
│   ├── physics.js         gravidade e movimento
│   ├── collision.js       colisões com blocos e retângulos
│   ├── levels.js          as 3 fases + construtor reutilizável de mapas
│   ├── math.js            frações, MDC, leitura de respostas
│   ├── questions.js       geração das perguntas e validação das respostas
│   ├── score.js           pontuação
│   ├── storage.js         LocalStorage (progresso e recordes)
│   ├── render.js          desenho do cenário, personagem e HUD
│   ├── sprites.js         pixel art feita por código
│   ├── input.js           teclado
│   └── audio.js           efeitos sonoros gerados por código
├── assets/images, assets/sounds   (vazias: tudo é desenhado/gerado por código)
└── tests/test.js          testes automáticos
```

## Testes automáticos

Com o Node instalado, rode na pasta do projeto:

```
node tests/test.js
```

O teste confere milhares de perguntas geradas, a estrutura das fases e coloca um robô para jogar as três fases do início ao fim.

## Como criar ou editar uma fase

Em `js/levels.js`, cada fase é uma função que usa o `Builder`:

```js
b.ground(0, 139);          // chão do bloco 0 ao 139
b.pit(28, 29);             // buraco
b.gate(22);                // portão com pergunta (cria também um checkpoint)
b.spikes(36, 2);           // espinhos
b.enemy(38, 45);           // inimigo que patrulha entre os blocos 38 e 45
b.plat(11, 11, 4);         // plataforma (dá para atravessar por baixo)
b.coins(11, 10, 4);        // fileira de moedas
```

Para trocar os tipos de pergunta de uma fase, edite `PLANS` em `js/questions.js`.
