# Etapa 3 — Modelo Lógico

## FutGestor — Sistema de Gerenciamento de Campeonatos de Futebol

O modelo lógico foi obtido a partir do mapeamento do diagrama
Entidade-Relacionamento para o modelo relacional.

Nesta representação:

- PK indica chave primária;
- FK indica chave estrangeira;
- UK indica uma restrição de unicidade.

## Relações originadas das entidades regulares

### CAMPEONATO

CAMPEONATO(
    id_campeonato PK,
    nome,
    ano,
    data_inicio,
    data_fim,
    status
)

A combinação nome e ano não poderá se repetir:

UK(nome, ano)

---

### TIME

TIME(
    id_time PK,
    nome,
    cidade,
    estado
)

---

### JOGADOR

JOGADOR(
    id_jogador PK,
    nome,
    data_nascimento,
    posicao
)

---

### ESTADIO

ESTADIO(
    id_estadio PK,
    nome,
    cidade,
    capacidade
)

---

### PARTIDA

PARTIDA(
    id_partida PK,
    rodada,
    data_hora,
    gols_mandante,
    gols_visitante,
    status
)

---

### GOL

GOL(
    id_gol PK,
    minuto,
    tipo
)

## Relação originada do relacionamento N:M

### INSCRICAO_TIME

O relacionamento PARTICIPA entre CAMPEONATO e TIME possui
cardinalidade N:M. Por isso, ele origina uma nova relação.

INSCRICAO_TIME(
    id_campeonato PK, FK,
    id_time PK, FK
)

Chave primária:

PK(id_campeonato, id_time)

Chaves estrangeiras:

FK(id_campeonato) referencia CAMPEONATO(id_campeonato)

FK(id_time) referencia TIME(id_time)

## Relação originada do relacionamento ternário

### ELENCO

O relacionamento INTEGRA_ELENCO envolve as entidades CAMPEONATO,
TIME e JOGADOR. Por isso, ele origina uma nova relação.

ELENCO(
    id_campeonato PK, FK,
    id_jogador PK, FK,
    id_time FK,
    numero_camisa
)

Chave primária:

PK(id_campeonato, id_jogador)

Chaves estrangeiras:

FK(id_jogador) referencia JOGADOR(id_jogador)

FK(id_campeonato, id_time) referencia
INSCRICAO_TIME(id_campeonato, id_time)

Restrição de unicidade:

UK(id_campeonato, id_time, numero_camisa)

### PARTIDA

A relação PARTIDA recebe as chaves estrangeiras provenientes dos
relacionamentos POSSUI, OCORRE_EM, É_MANDANTE e É_VISITANTE.

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

Chave primária:

PK(id_partida)

Chaves estrangeiras:

FK(id_campeonato) referencia CAMPEONATO(id_campeonato)

FK(id_estadio) referencia ESTADIO(id_estadio)

FK(id_campeonato, id_time_mandante) referencia
INSCRICAO_TIME(id_campeonato, id_time)

FK(id_campeonato, id_time_visitante) referencia
INSCRICAO_TIME(id_campeonato, id_time)

Restrição:

id_time_mandante deve ser diferente de id_time_visitante.


### GOL

A relação GOL recebe as chaves estrangeiras provenientes dos
relacionamentos REGISTRA e MARCA.

GOL(
    id_gol PK,
    id_partida FK,
    id_jogador FK,
    minuto,
    tipo
)

Chave primária:

PK(id_gol)

Chaves estrangeiras:

FK(id_partida) referencia PARTIDA(id_partida)

FK(id_jogador) referencia JOGADOR(id_jogador)

Restrições:

O minuto do gol deverá ser maior ou igual a zero.

O tipo do gol deverá ser: normal, pênalti, falta ou contra.

O jogador relacionado ao gol deverá fazer parte do elenco de um dos
times participantes da partida.