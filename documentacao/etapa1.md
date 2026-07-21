# Central do Campeonato

## Sistema para gerenciamento de campeonatos de futebol

### Desenvolvimento

**Integrantes:**

- Clarissa Cesar Tomaz  
- Eduardo Ferreira Satler  

**Matrícula:** 22.1.8026

---

## Sobre o projeto

O **Central do Campeonato** é um sistema web criado para facilitar a organização de campeonatos de futebol.

A ideia é reunir, em um só lugar, as principais informações de um campeonato. No sistema será possível cadastrar campeonatos, times, jogadores, estádios, partidas e gols.

Também será possível inscrever os times nos campeonatos, montar os elencos, registrar os gols, finalizar as partidas e acompanhar informações como a classificação e a artilharia.

O sistema será desenvolvido com **Node.js, Express, EJS e PostgreSQL**. A conexão com o banco de dados será feita utilizando o driver `pg`.

Os comandos utilizados para cadastrar, alterar, excluir e consultar os dados serão escritos diretamente em **SQL**, e poderão ser encontrados na pasta **sql** do projeto.

---

## Principais funcionalidades e regras

### Campeonatos

O sistema permitirá cadastrar campeonatos informando:

- nome;
- ano;
- data de início;
- data de término;
- status.

O campeonato poderá ter os seguintes status:

- planejado;
- em andamento;
- finalizado.

### Times

Será possível cadastrar os times participantes, informando o nome, a cidade e o estado.

Um time poderá participar de vários campeonatos, e um campeonato poderá ter vários times inscritos.

Para evitar registros repetidos, o mesmo time não poderá ser inscrito duas vezes no mesmo campeonato.

### Jogadores e elencos

Os jogadores serão cadastrados com nome, data de nascimento e posição.

Um jogador poderá participar de campeonatos diferentes, mas só poderá representar um time em cada campeonato.

Ao adicionar um jogador ao elenco, será necessário informar:

- o jogador;
- o time;
- o campeonato;
- o número da camisa.

Dentro do mesmo time e campeonato, dois jogadores não poderão utilizar o mesmo número de camisa.

### Estádios

O sistema também permitirá cadastrar os estádios onde as partidas serão realizadas.

Cada estádio terá nome, cidade e capacidade. Um mesmo estádio poderá receber várias partidas.

### Partidas

As partidas serão cadastradas com as seguintes informações:

- campeonato;
- time mandante;
- time visitante;
- estádio;
- rodada;
- data;
- horário;
- status.

O time mandante não poderá ser igual ao time visitante. Além disso, os dois times deverão estar inscritos no campeonato escolhido.

A partida poderá ter os seguintes status:

- agendada;
- finalizada;
- cancelada.

Os gols serão registrados enquanto a partida estiver agendada. Ao concluir os registros, o usuário finalizará a partida pela tela de gols. O placar será calculado automaticamente a partir dos gols cadastrados.

### Gols

O sistema permitirá registrar os gols marcados em cada partida.

Para cada gol, será informado:

- jogador;
- minuto;
- tipo do gol.

Os tipos de gol serão:

- normal;
- pênalti;
- falta;
- contra.

A interface mostrará somente os jogadores dos times que estão disputando a partida. Gols normais, de pênalti e de falta serão creditados ao time do jogador; gols contra serão creditados ao adversário.

### Consultas

O sistema permitirá consultar:

- os times inscritos em cada campeonato;
- o elenco de cada time;
- as partidas cadastradas;
- a classificação do campeonato;
- a artilharia.

Na classificação, a pontuação será calculada da seguinte forma:

- vitória: 3 pontos;
- empate: 1 ponto;
- derrota: 0 pontos.

A artilharia será organizada de acordo com a quantidade de gols registrados para cada jogador.