# FutGestor

## Sistema para gerenciamento de campeonatos de futebol

### Desenvolvimento

Nome: Clarissa Cesar Tomaz

Matrícula: 22.1.8026

---

## Sobre o projeto

O FutGestor é um sistema web desenvolvido para auxiliar na organização
de campeonatos de futebol.

O sistema permitirá cadastrar campeonatos, times, jogadores, estádios,
partidas e gols.

Também será possível inscrever times em campeonatos, montar os elencos,
registrar resultados e consultar a classificação e a artilharia.

A aplicação será desenvolvida utilizando Node.js, Express, EJS e
PostgreSQL.

A comunicação com o banco de dados será realizada pelo driver pg.
Todos os comandos e consultas serão escritos diretamente em SQL,
sem utilização de ORM.

---

## Requisitos e regras de negócio

### Campeonatos

1. O sistema deverá permitir o cadastro de campeonatos.

2. Cada campeonato deverá possuir nome, ano, data de início, data de
término e status.

3. Os possíveis status de um campeonato serão: planejado, em andamento
e finalizado.

### Times

4. O sistema deverá permitir o cadastro de times.

5. Cada time deverá possuir nome, cidade e estado.

6. Um time poderá participar de vários campeonatos.

7. Um campeonato poderá possuir vários times.

8. Um time não poderá ser inscrito duas vezes no mesmo campeonato.

### Jogadores e elencos

9. O sistema deverá permitir o cadastro de jogadores.

10. Cada jogador deverá possuir nome, data de nascimento e posição.

11. Um jogador poderá participar de campeonatos diferentes.

12. Um jogador poderá representar apenas um time em cada campeonato.

13. O vínculo entre jogador, time e campeonato deverá registrar o
número da camisa.

14. Dois jogadores não poderão utilizar o mesmo número de camisa no
mesmo time e campeonato.

### Estádios

15. O sistema deverá permitir o cadastro de estádios.

16. Cada estádio deverá possuir nome, cidade e capacidade.

17. Um estádio poderá receber várias partidas.

### Partidas

18. O sistema deverá permitir o cadastro de partidas.

19. Cada partida deverá pertencer a um campeonato.

20. Cada partida deverá possuir time mandante, time visitante, estádio,
rodada, data, horário e status.

21. O time mandante deverá ser diferente do time visitante.

22. Os times da partida deverão estar inscritos no campeonato.

23. Os possíveis status de uma partida serão: agendada, finalizada e
cancelada.

24. Quando uma partida for finalizada, o placar deverá ser informado.

### Gols

25. O sistema deverá permitir o registro dos gols de uma partida.

26. Cada gol deverá indicar o jogador, o minuto e o tipo.

27. Os possíveis tipos de gol serão: normal, pênalti, falta e contra.

28. O jogador vinculado ao gol deverá fazer parte do elenco de um dos
times da partida.

### Consultas

29. O sistema deverá permitir consultar os times inscritos em um
campeonato.

30. O sistema deverá permitir consultar o elenco de cada time.

31. O sistema deverá permitir consultar as partidas cadastradas.

32. O sistema deverá apresentar a classificação do campeonato.

33. Uma vitória valerá três pontos.

34. Um empate valerá um ponto.

35. Uma derrota não acrescentará pontos.

36. O sistema deverá apresentar a artilharia do campeonato.

37. A artilharia será calculada pela quantidade de gols registrados
para cada jogador.