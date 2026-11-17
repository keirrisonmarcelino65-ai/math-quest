# Math Quest - mini-GDD (Game Design Document)

> Projeto Final: criando um clássico 2D no Canvas. **Opção A (jogo do zero)**: plataforma 2D com desafios de matemática.
> Integrantes: Gustavo Gonçalves Pereira e Keirrison Marcelino da Cruz (dupla).

## 1. Identidade

| Item | Definição |
| --- | --- |
| Nome | **Math Quest** |
| Gênero | Plataforma 2D com quebra-cabeças de matemática |
| Plataforma | Navegador (Chrome, Edge, Firefox), no computador |
| Tecnologias | HTML5, CSS3, JavaScript puro (ES6), Canvas 2D, LocalStorage, Git e GitHub Pages |
| Público | Estudantes do ensino fundamental II e médio, e quem curte plataforma clássico |
| Duração | 3 fases; a corrida pura leva cerca de 20 a 30 s por fase (medido por um robô de teste), e o resto do tempo depende das perguntas |

**Pitch em uma frase:** corra e pule por fases de pixel art; cada portão trancado só abre se você resolver uma conta.

## 2. Mecânica principal

1. O jogador anda para os lados e pula (gravidade e colisões com blocos).
2. No caminho há **portões** que ocupam a altura toda da tela. Ao chegar perto, abre a janela de desafio.
3. Resposta certa abre o portão. Resposta errada conta como erro; **depois de 3 erros aparece uma dica** e o jogador continua tentando.
4. Perigos tiram uma vida: espinhos, inimigos e buracos. Dá para derrotar inimigos pulando em cima.
5. Moedas dão pontos e ficam em lugares arriscados (sobre espinhos, buracos e inimigos).
6. O objetivo é chegar à bandeira de chegada. Concluir as 3 fases vence o jogo.

## 3. Regras e balanceamento

| Regra | Valor |
| --- | --- |
| Vidas | 3 por fase; sem vidas, a fase reinicia |
| Moeda | 10 pontos |
| Resposta certa | 50 pontos (+25 se acertar de primeira) |
| Inimigo derrotado | 20 pontos |
| Vida restante no fim da fase | 100 pontos cada |
| Erros antes da dica | 3 |
| Checkpoints | Um depois de cada portão |
| Desbloqueio | Fases em sequência; progresso e recordes no LocalStorage |

**Física (tudo em pixels; o bloco mede 32 px; a simulação roda a 60 passos por segundo):**

| Parâmetro | Valor | Efeito no jogo |
| --- | --- | --- |
| Velocidade de corrida | 3,4 px/passo (cerca de 204 px/s) | cruza uma tela de 960 px em pouco mais de 4 s |
| Gravidade | 0,56 px/passo² | queda firme, sem "flutuar" |
| Impulso do pulo | -11,6 px/passo | altura de cerca de 120 px (3,75 blocos) e alcance de cerca de 4,4 blocos |
| Pulo variável | soltar o botão corta o pulo | toque rápido = pulo baixo, segurar = pulo alto |
| Coyote time e buffer | 6 passos cada | perdoa pulos um pouco atrasados ou adiantados |
| Queda máxima | 13 px/passo | menor que um bloco, então ninguém atravessa o chão |

**Regras de projeto das fases (para a dificuldade ser justa):** buracos de no máximo 3 blocos e grupos de espinhos de no máximo 2 blocos, sempre dentro do alcance do pulo. Portões e a meta têm altura total, para não dar para passar por cima. Plataformas são "atravessáveis por baixo", para nunca travar um pulo.

## 4. Progressão

| Fase | Tema | Perguntas | Tamanho | Portões | Moedas | Inimigos |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Floresta dos Números | soma, subtração, multiplicação e divisão | 140 blocos | 6 | 57 | 4 |
| 2 | Templo das Frações | fração equivalente, comparação, soma, simplificação, fração de um número, multiplicação | 160 blocos | 7 | 74 | 5 |
| 3 | Castelo das Equações | `x + a = b`, `ax = b`, `ax + b = c`, `x/a + b = c`, `a(x + b) = c`, `ax + b = cx + d` | 180 blocos | 8 | 84 | 4 |

As perguntas são sorteadas a cada partida (com números diferentes), então jogar de novo não repete as contas.

## 5. Arte e áudio

- **Pixel art desenhada por código** no Canvas (personagem com animações de parado, andando e pulando; inimigo que muda de cor em cada fase; blocos, espinhos, moedas, bandeiras e portões).
- **Cenários com parallax:** floresta (colinas, pinheiros, nuvens), templo (dunas, colunas, sol) e castelo (noite estrelada, lua, torres e tochas).
- **Interface** simples: vidas em coração, moedas, pontos, portões abertos, barra de progresso da fase.
- **Som** gerado por código (Web Audio): pulo, moeda, acerto, erro, checkpoint, vitória e derrota. Dá para desligar (tecla M).

## 6. Telas e máquina de estados

```
MENU --jogar--> JOGANDO --perto do portão--> PERGUNTA --acertou/fechou--> JOGANDO
                  |  ^                                
              Esc |  | Esc                           JOGANDO --chegou na bandeira--> FASE CONCLUÍDA / VITÓRIA
                  v  |                               JOGANDO --0 vidas--> GAME OVER --reiniciar--> JOGANDO
                PAUSADO
```

Telas: menu principal, seleção de fases, como jogar, jogo com HUD, janela de desafio, pausa, fase concluída/vitória e game over.

## 7. Arquitetura técnica

- **Loop principal:** `requestAnimationFrame` com passo fixo de 1/60 s (acumulador). A cada quadro o Canvas é totalmente redesenhado, então não ficam rastros do quadro anterior.
- **Física:** movimento separado por eixo (X e depois Y) com colisão contra a grade de blocos (hitboxes retangulares).
- **Código reutilizável:** as 3 fases usam o mesmo construtor de mapas (`Builder`) e o mesmo motor; só mudam os dados.
- **Teclado:** `keydown`/`keyup` com aceleração suave. O jogo só captura as teclas durante a partida, e pausa sozinho se a aba perde o foco.

| Arquivo | Responsabilidade |
| --- | --- |
| `main.js` | telas, menus, janela de perguntas, loop |
| `game.js` | regras da partida: vidas, portões, inimigos, checkpoints, fim de fase |
| `player.js`, `physics.js`, `collision.js` | personagem, gravidade e colisões |
| `levels.js` | as 3 fases e o construtor de mapas |
| `questions.js`, `math.js` | geração das perguntas, validação das respostas, frações |
| `score.js`, `storage.js` | pontuação e LocalStorage |
| `render.js`, `sprites.js` | desenho do cenário, personagem e HUD |
| `input.js`, `audio.js` | teclado e som |

## 8. Divisão de papéis da dupla

| Papel | Responsabilidades no projeto | Arquivos principais |
| --- | --- | --- |
| Game Designer & Artista Digital | regras modificadas, balanceamento (velocidades, pontos, dificuldade), formas, cores e sprites no Canvas | `levels.js`, `questions.js`, `score.js`, `sprites.js`, `render.js`, `style.css` |
| Programador(a) de Lógica e Física | `requestAnimationFrame`, movimento, aceleração, colisões (hitboxes), inimigos | `physics.js`, `collision.js`, `player.js`, loop em `main.js` |
| Programador(a) de Estado e Interface | teclado, pontuação, telas de Menu/Game Over/Vitória, reinício | `input.js`, `game.js`, `storage.js`, telas em `main.js`, `index.html` |

Como o grupo tem 2 integrantes, o Gustavo acumula os papéis de Game Designer & Artista Digital e de Estado e Interface; o Keirrison fica com Lógica e Física. _(Ajustar se a divisão real for outra.)_

## 9. Landing Page (rascunho visual)

```
+--------------------------------------------------------------+
| MATHQUEST                     Jogar  Como jogar  Fases  Créditos |
+--------------------------------------------------------------+
|  MATH QUEST                              +----------------+  |
|  texto de apresentação                   | ilustração     |  |
|  [Jogar agora] [Como jogar]              | do personagem  |  |
+--------------------------------------------------------------+
|                       JOGUE AGORA                            |
|            +------------------------------+                  |
|            |      CANVAS DO JOGO 960x544  |                  |
|            +------------------------------+                  |
+--------------------------------------------------------------+
|  COMO JOGAR:  [Controles] [Objetivo] [Vidas e pontos]        |
|  AS TRÊS FASES:  [1 Floresta] [2 Templo] [3 Castelo]         |
|  POR QUE É DIVERTIDO:  [3 cartões]                           |
|  CRÉDITOS:  [Designer] [Lógica e Física] [Estado e Interface]|
+--------------------------------------------------------------+
|  rodapé: projeto escolar, IFSP Itapetininga, 2026            |
+--------------------------------------------------------------+
```

## 10. Cronograma do projeto

| Data | Foco | Entrega |
| --- | --- | --- |
| 10/11 | Escopo e mini-GDD | este documento (primeira versão) |
| 17/11 | Git, Canvas, loop principal, movimento | repositório criado e primeiro push com `index.html`, `css/style.css` e `js/` |
| 24/11 | Colisões, inimigos, pontos e vidas, Landing Page, telas | jogo completo e deploy no GitHub Pages |
| 01/12 | Bugs de última hora e Feira de Jogos | jogo publicado e testado pelos colegas |

## 11. Desafios técnicos que apareceram

- **Plataformas que travavam o pulo:** uma plataforma baixa antes de um espinho batia na cabeça do personagem e ele não conseguia passar. Solução: plataformas atravessáveis por baixo (só seguram quem pousa por cima).
- **Meta que dava para pular por cima:** a bandeira era baixa e o robô de teste passou por cima. Solução: a zona da meta passou a ter a altura toda da tela, como os portões.
- **Atravessar o chão em quedas rápidas:** a velocidade máxima de queda (13 px/passo) é menor que o bloco (32 px).
- **Rastros no Canvas:** o quadro anterior é sempre apagado e o cenário desenhado de novo a cada passo do loop.
- **Fases impossíveis:** para garantir que dá para vencer, um robô joga as três fases do início ao fim nos testes automáticos (`node tests/test.js`).

## 12. Aprendizados com Git e Canvas _(preencher antes da retrospectiva)_

- Maior desafio com o Canvas/JavaScript: ...
- O que aprendemos usando o Git: ...

## 13. Checklist dos critérios de avaliação

| Critério | Como o projeto atende |
| --- | --- |
| Aplicação do Canvas | loop com `requestAnimationFrame`, quadro limpo e redesenhado a cada passo, física e colisões consistentes |
| Interatividade | teclado responde na hora; menu, jogo, pausa, vitória e game over funcionam |
| Intencionalidade de Design | a matemática abre o caminho; risco e recompensa nas moedas; dificuldade crescente nas 3 fases |
| Landing Page e UX | título, jogo integrado, "Como Jogar" e créditos com o papel de cada integrante |
| GitHub e Deploy | repositório com commits de ambos os integrantes e publicação no GitHub Pages (passos no `README.md`) |
| Trabalho em equipe e apresentação | papéis definidos na seção 8; cada um explica sua parte na Feira de Jogos |
