# Etapa 3 — Modelo Lógico

## Central do Campeonato — Sistema de Gerenciamento de Campeonatos de Futebol

O modelo lógico foi desenvolvido a partir do mapeamento do Diagrama Entidade-Relacionamento para o modelo relacional.

Nesta representação:

- `PK` indica chave primária;
- `FK` indica chave estrangeira;
- `UK` indica uma restrição de unicidade.

---

## Relações do banco de dados

### USUARIO

A relação `USUARIO` armazena os dados utilizados para cadastro e acesso ao sistema.

```text
USUARIO(
    id_usuario PK,
    nome,
    email,
    senha
)
```

Chave primária:

```text
PK(id_usuario)
```

Restrição de unicidade:

```text
UK(email)
```

O mesmo e-mail não poderá ser utilizado por dois usuários diferentes.

---

### CAMPEONATO

```text
CAMPEONATO(
    id_campeonato PK,
    nome,
    ano,
    data_inicio,
    data_fim,
    status
)
```

Chave primária:

```text
PK(id_campeonato)
```

Restrição de unicidade:

```text
UK(nome, ano)
```

A combinação entre nome e ano não poderá se repetir.

A data de término não poderá ser anterior à data de início.

Os possíveis valores para o status são:

```text
planejado
em andamento
finalizado
```

---

### TIME

```text
TIME(
    id_time PK,
    nome,
    cidade,
    estado
)
```

Chave primária:

```text
PK(id_time)
```

O estado deverá ser informado utilizando a sigla com duas letras.

---

### JOGADOR

```text
JOGADOR(
    id_jogador PK,
    nome,
    data_nascimento,
    posicao
)
```

Chave primária:

```text
PK(id_jogador)
```

---

### ESTADIO

```text
ESTADIO(
    id_estadio PK,
    nome,
    cidade,
    capacidade
)
```

Chave primária:

```text
PK(id_estadio)
```

A capacidade deverá ser maior que zero.

---

## Relação originada do relacionamento N:M

### INSCRICAO_TIME

O relacionamento entre `CAMPEONATO` e `TIME` possui cardinalidade N:M.

Um campeonato poderá possuir vários times, e um time poderá participar de vários campeonatos.

Por isso, o relacionamento origina a relação `INSCRICAO_TIME`.

```text
INSCRICAO_TIME(
    id_campeonato PK, FK,
    id_time PK, FK
)
```

Chave primária composta:

```text
PK(id_campeonato, id_time)
```

Chaves estrangeiras:

```text
FK(id_campeonato)
REFERENCIA CAMPEONATO(id_campeonato)
```

```text
FK(id_time)
REFERENCIA TIME(id_time)
```

A chave primária composta impede que o mesmo time seja inscrito duas vezes no mesmo campeonato.

---

## Relação originada do relacionamento ternário

### ELENCO

O relacionamento `INTEGRA_ELENCO` envolve as relações `CAMPEONATO`, `TIME` e `JOGADOR`.

Por isso, ele origina a relação `ELENCO`.

```text
ELENCO(
    id_campeonato PK, FK,
    id_jogador PK, FK,
    id_time FK,
    numero_camisa
)
```

Chave primária composta:

```text
PK(id_campeonato, id_jogador)
```

Essa chave garante que um jogador represente apenas um time em cada campeonato.

Chave estrangeira para jogador:

```text
FK(id_jogador)
REFERENCIA JOGADOR(id_jogador)
```

Chave estrangeira composta para a inscrição do time:

```text
FK(id_campeonato, id_time)
REFERENCIA INSCRICAO_TIME(id_campeonato, id_time)
```

Essa chave garante que somente times inscritos no campeonato possam possuir jogadores no elenco.

Restrição de unicidade:

```text
UK(id_campeonato, id_time, numero_camisa)
```

Essa restrição impede que dois jogadores utilizem o mesmo número de camisa no mesmo time e campeonato.

O número da camisa deverá estar entre 1 e 99.

---

## Relações que recebem chaves estrangeiras

### PARTIDA

A relação `PARTIDA` recebe as chaves estrangeiras provenientes dos relacionamentos com campeonato, estádio, time mandante e time visitante.

```text
PARTIDA(
    id_partida PK,
    id_campeonato FK,
    id_estadio FK,
    id_time_mandante FK,
    id_time_visitante FK,
    rodada,
    data_hora,
    gols_mandante,
    gols_visitante,
    status
)
```

Chave primária:

```text
PK(id_partida)
```

Chave estrangeira para campeonato:

```text
FK(id_campeonato)
REFERENCIA CAMPEONATO(id_campeonato)
```

Chave estrangeira para estádio:

```text
FK(id_estadio)
REFERENCIA ESTADIO(id_estadio)
```

Chave estrangeira composta para o time mandante:

```text
FK(id_campeonato, id_time_mandante)
REFERENCIA INSCRICAO_TIME(id_campeonato, id_time)
```

Chave estrangeira composta para o time visitante:

```text
FK(id_campeonato, id_time_visitante)
REFERENCIA INSCRICAO_TIME(id_campeonato, id_time)
```

Essas chaves garantem que os dois times estejam inscritos no campeonato da partida.

Restrições:

- o time mandante deverá ser diferente do time visitante;
- a rodada deverá ser maior que zero;
- os gols não poderão possuir valores negativos;
- partidas agendadas ou canceladas não deverão possuir placar;
- partidas finalizadas deverão possuir placar.

Os possíveis valores para o status são:

```text
agendada
finalizada
cancelada
```

---

### GOL

A relação `GOL` recebe as chaves estrangeiras provenientes dos relacionamentos com `PARTIDA` e `JOGADOR`.

```text
GOL(
    id_gol PK,
    id_partida FK,
    id_jogador FK,
    minuto,
    tipo
)
```

Chave primária:

```text
PK(id_gol)
```

Chave estrangeira para partida:

```text
FK(id_partida)
REFERENCIA PARTIDA(id_partida)
```

Chave estrangeira para jogador:

```text
FK(id_jogador)
REFERENCIA JOGADOR(id_jogador)
```

Restrições:

- o minuto do gol deverá ser maior ou igual a zero;
- somente partidas finalizadas poderão receber gols;
- a quantidade de gols registrados não poderá ultrapassar o placar da partida;
- o jogador deverá fazer parte do elenco de um dos times participantes da partida.

Os possíveis tipos de gol são:

```text
normal
pênalti
falta
contra
```

A verificação de que o jogador pertence ao elenco de um dos times da partida é realizada pela aplicação antes do registro do gol.

Os gols do tipo `contra` não são considerados na consulta de artilharia.