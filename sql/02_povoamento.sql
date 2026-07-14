-- =====================================================
-- FUTGESTOR
-- Sistema de Gerenciamento de Campeonatos de Futebol
-- Script de povoamento do banco de dados
-- =====================================================


-- =====================================================
-- CAMPEONATO
-- =====================================================

INSERT INTO campeonato (
    id_campeonato,
    nome,
    ano,
    data_inicio,
    data_fim,
    status
)
VALUES (
    1,
    'Copa Vale do Aço',
    2026,
    '2026-03-01',
    '2026-06-30',
    'em andamento'
);


-- =====================================================
-- TIMES
-- =====================================================

INSERT INTO time (
    id_time,
    nome,
    cidade,
    estado
)
VALUES (
    1,
    'União Itabira',
    'Itabira',
    'MG'
);

INSERT INTO time (
    id_time,
    nome,
    cidade,
    estado
)
VALUES (
    2,
    'Atlético Monlevade',
    'João Monlevade',
    'MG'
);

INSERT INTO time (
    id_time,
    nome,
    cidade,
    estado
)
VALUES (
    3,
    'Real Bela Vista',
    'Ipatinga',
    'MG'
);

INSERT INTO time (
    id_time,
    nome,
    cidade,
    estado
)
VALUES (
    4,
    'Esporte Nova Era',
    'Nova Era',
    'MG'
);


-- =====================================================
-- JOGADORES
-- =====================================================

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    1,
    'Lucas Ferreira',
    '1998-05-12',
    'goleiro'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    2,
    'Rafael Souza',
    '2000-02-18',
    'atacante'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    3,
    'Bruno Lima',
    '1999-11-03',
    'meio-campo'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    4,
    'Pedro Martins',
    '1997-08-22',
    'goleiro'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    5,
    'Gabriel Rocha',
    '2001-01-30',
    'atacante'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    6,
    'Matheus Alves',
    '1998-04-15',
    'volante'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    7,
    'João Ribeiro',
    '1999-06-10',
    'goleiro'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    8,
    'Daniel Costa',
    '2000-09-25',
    'atacante'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    9,
    'Felipe Gomes',
    '1998-12-05',
    'zagueiro'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    10,
    'André Silva',
    '1997-03-17',
    'goleiro'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    11,
    'Vinícius Melo',
    '2001-07-11',
    'atacante'
);

INSERT INTO jogador (
    id_jogador,
    nome,
    data_nascimento,
    posicao
)
VALUES (
    12,
    'Thiago Nunes',
    '1999-10-21',
    'lateral'
);


-- =====================================================
-- ESTÁDIOS
-- =====================================================

INSERT INTO estadio (
    id_estadio,
    nome,
    cidade,
    capacidade
)
VALUES (
    1,
    'Estádio Municipal de João Monlevade',
    'João Monlevade',
    10000
);

INSERT INTO estadio (
    id_estadio,
    nome,
    cidade,
    capacidade
)
VALUES (
    2,
    'Estádio Vale do Aço',
    'Ipatinga',
    15000
);


-- =====================================================
-- INSCRIÇÕES DOS TIMES
-- =====================================================

INSERT INTO inscricao_time (
    id_campeonato,
    id_time
)
VALUES (
    1,
    1
);

INSERT INTO inscricao_time (
    id_campeonato,
    id_time
)
VALUES (
    1,
    2
);

INSERT INTO inscricao_time (
    id_campeonato,
    id_time
)
VALUES (
    1,
    3
);

INSERT INTO inscricao_time (
    id_campeonato,
    id_time
)
VALUES (
    1,
    4
);


-- =====================================================
-- ELENCOS
-- =====================================================

-- União Itabira

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    1,
    1,
    1
);

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    1,
    2,
    9
);

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    1,
    3,
    10
);


-- Atlético Monlevade

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    2,
    4,
    1
);

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    2,
    5,
    9
);

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    2,
    6,
    5
);


-- Real Bela Vista

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    3,
    7,
    1
);

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    3,
    8,
    9
);

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    3,
    9,
    4
);


-- Esporte Nova Era

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    4,
    10,
    1
);

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    4,
    11,
    9
);

INSERT INTO elenco (
    id_campeonato,
    id_time,
    id_jogador,
    numero_camisa
)
VALUES (
    1,
    4,
    12,
    2
);


-- =====================================================
-- PARTIDAS
-- =====================================================

INSERT INTO partida (
    id_partida,
    id_campeonato,
    id_estadio,
    id_time_mandante,
    id_time_visitante,
    rodada,
    data_hora,
    gols_mandante,
    gols_visitante,
    status
)
VALUES (
    1,
    1,
    1,
    1,
    2,
    1,
    '2026-03-15 15:00:00',
    2,
    0,
    'finalizada'
);

INSERT INTO partida (
    id_partida,
    id_campeonato,
    id_estadio,
    id_time_mandante,
    id_time_visitante,
    rodada,
    data_hora,
    gols_mandante,
    gols_visitante,
    status
)
VALUES (
    2,
    1,
    2,
    3,
    4,
    1,
    '2026-03-16 16:00:00',
    1,
    1,
    'finalizada'
);

INSERT INTO partida (
    id_partida,
    id_campeonato,
    id_estadio,
    id_time_mandante,
    id_time_visitante,
    rodada,
    data_hora,
    gols_mandante,
    gols_visitante,
    status
)
VALUES (
    3,
    1,
    1,
    2,
    4,
    2,
    '2026-03-22 15:00:00',
    3,
    2,
    'finalizada'
);

INSERT INTO partida (
    id_partida,
    id_campeonato,
    id_estadio,
    id_time_mandante,
    id_time_visitante,
    rodada,
    data_hora,
    gols_mandante,
    gols_visitante,
    status
)
VALUES (
    4,
    1,
    2,
    3,
    1,
    2,
    '2026-03-23 16:00:00',
    1,
    1,
    'finalizada'
);

INSERT INTO partida (
    id_partida,
    id_campeonato,
    id_estadio,
    id_time_mandante,
    id_time_visitante,
    rodada,
    data_hora,
    gols_mandante,
    gols_visitante,
    status
)
VALUES (
    5,
    1,
    1,
    1,
    4,
    3,
    '2026-03-29 15:00:00',
    NULL,
    NULL,
    'agendada'
);

INSERT INTO partida (
    id_partida,
    id_campeonato,
    id_estadio,
    id_time_mandante,
    id_time_visitante,
    rodada,
    data_hora,
    gols_mandante,
    gols_visitante,
    status
)
VALUES (
    6,
    1,
    2,
    2,
    3,
    3,
    '2026-03-30 16:00:00',
    NULL,
    NULL,
    'agendada'
);


-- =====================================================
-- GOLS
-- =====================================================

-- Partida 1
-- União Itabira 2 x 0 Atlético Monlevade

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    1,
    1,
    2,
    20,
    'normal'
);

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    2,
    1,
    3,
    70,
    'falta'
);


-- Partida 2
-- Real Bela Vista 1 x 1 Esporte Nova Era

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    3,
    2,
    8,
    33,
    'normal'
);

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    4,
    2,
    11,
    60,
    'normal'
);


-- Partida 3
-- Atlético Monlevade 3 x 2 Esporte Nova Era

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    5,
    3,
    5,
    10,
    'normal'
);

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    6,
    3,
    5,
    55,
    'pênalti'
);

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    7,
    3,
    6,
    80,
    'normal'
);

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    8,
    3,
    11,
    25,
    'normal'
);

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    9,
    3,
    12,
    68,
    'falta'
);


-- Partida 4
-- Real Bela Vista 1 x 1 União Itabira

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    10,
    4,
    8,
    44,
    'normal'
);

INSERT INTO gol (
    id_gol,
    id_partida,
    id_jogador,
    minuto,
    tipo
)
VALUES (
    11,
    4,
    2,
    77,
    'normal'
);