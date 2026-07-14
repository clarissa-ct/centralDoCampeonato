-- =====================================================
-- FUTGESTOR
-- Sistema de Gerenciamento de Campeonatos de Futebol
-- Principais consultas do sistema
-- =====================================================


-- =====================================================
-- CONSULTA 1
-- Listar os campeonatos cadastrados
-- =====================================================

SELECT
    C.id_campeonato,
    C.nome,
    C.ano,
    C.data_inicio,
    C.data_fim,
    C.status
FROM campeonato C
ORDER BY
    C.ano DESC,
    C.nome;


-- =====================================================
-- CONSULTA 2
-- Listar os times cadastrados
-- =====================================================

SELECT
    T.id_time,
    T.nome,
    T.cidade,
    T.estado
FROM time T
ORDER BY T.nome;


-- =====================================================
-- CONSULTA 3
-- Listar os jogadores cadastrados
-- =====================================================

SELECT
    J.id_jogador,
    J.nome,
    J.data_nascimento,
    J.posicao
FROM jogador J
ORDER BY J.nome;


-- =====================================================
-- CONSULTA 4
-- Listar os times inscritos no campeonato 1
-- =====================================================

SELECT
    C.nome AS campeonato,
    C.ano,
    T.nome AS time,
    T.cidade,
    T.estado
FROM
    campeonato C,
    inscricao_time I,
    time T
WHERE
    C.id_campeonato = I.id_campeonato
    AND I.id_time = T.id_time
    AND C.id_campeonato = 1
ORDER BY T.nome;


-- =====================================================
-- CONSULTA 5
-- Listar o elenco do campeonato 1
-- =====================================================

SELECT
    C.nome AS campeonato,
    C.ano,
    T.nome AS time,
    E.numero_camisa,
    J.nome AS jogador,
    J.posicao
FROM
    campeonato C,
    time T,
    jogador J,
    elenco E
WHERE
    E.id_campeonato = C.id_campeonato
    AND E.id_time = T.id_time
    AND E.id_jogador = J.id_jogador
    AND C.id_campeonato = 1
ORDER BY
    T.nome,
    E.numero_camisa;


-- =====================================================
-- CONSULTA 6
-- Listar todas as partidas
-- =====================================================

SELECT
    P.id_partida,
    C.nome AS campeonato,
    C.ano,
    P.rodada,
    M.nome AS time_mandante,
    V.nome AS time_visitante,
    P.gols_mandante,
    P.gols_visitante,
    P.data_hora,
    E.nome AS estadio,
    P.status
FROM
    partida P,
    campeonato C,
    time M,
    time V,
    estadio E
WHERE
    P.id_campeonato = C.id_campeonato
    AND P.id_time_mandante = M.id_time
    AND P.id_time_visitante = V.id_time
    AND P.id_estadio = E.id_estadio
ORDER BY P.data_hora;


-- =====================================================
-- CONSULTA 7
-- Listar as partidas finalizadas
-- =====================================================

SELECT
    P.id_partida,
    C.nome AS campeonato,
    P.rodada,
    M.nome AS time_mandante,
    P.gols_mandante,
    P.gols_visitante,
    V.nome AS time_visitante,
    P.data_hora
FROM
    partida P,
    campeonato C,
    time M,
    time V
WHERE
    P.id_campeonato = C.id_campeonato
    AND P.id_time_mandante = M.id_time
    AND P.id_time_visitante = V.id_time
    AND P.status = 'finalizada'
ORDER BY P.data_hora;


-- =====================================================
-- CONSULTA 8
-- Listar as partidas agendadas
-- =====================================================

SELECT
    P.id_partida,
    C.nome AS campeonato,
    P.rodada,
    M.nome AS time_mandante,
    V.nome AS time_visitante,
    P.data_hora,
    E.nome AS estadio
FROM
    partida P,
    campeonato C,
    time M,
    time V,
    estadio E
WHERE
    P.id_campeonato = C.id_campeonato
    AND P.id_time_mandante = M.id_time
    AND P.id_time_visitante = V.id_time
    AND P.id_estadio = E.id_estadio
    AND P.status = 'agendada'
ORDER BY P.data_hora;


-- =====================================================
-- CONSULTA 9
-- Listar os gols registrados
-- =====================================================

SELECT
    G.id_gol,
    C.nome AS campeonato,
    M.nome AS time_mandante,
    V.nome AS time_visitante,
    J.nome AS jogador,
    T.nome AS time_jogador,
    G.minuto,
    G.tipo
FROM
    gol G,
    partida P,
    campeonato C,
    jogador J,
    elenco E,
    time T,
    time M,
    time V
WHERE
    G.id_partida = P.id_partida
    AND P.id_campeonato = C.id_campeonato
    AND G.id_jogador = J.id_jogador
    AND E.id_campeonato = P.id_campeonato
    AND E.id_jogador = G.id_jogador
    AND E.id_time = T.id_time
    AND P.id_time_mandante = M.id_time
    AND P.id_time_visitante = V.id_time
ORDER BY
    P.id_partida,
    G.minuto,
    G.id_gol;


-- =====================================================
-- CONSULTA 10
-- Apresentar a artilharia do campeonato 1
-- Gols contra não são contabilizados
-- =====================================================

SELECT
    J.id_jogador,
    J.nome AS jogador,
    T.nome AS time,
    COUNT(G.id_gol) AS quantidade_gols
FROM
    gol G,
    jogador J,
    partida P,
    elenco E,
    time T
WHERE
    G.id_jogador = J.id_jogador
    AND G.id_partida = P.id_partida
    AND E.id_campeonato = P.id_campeonato
    AND E.id_jogador = G.id_jogador
    AND E.id_time = T.id_time
    AND P.id_campeonato = 1
    AND G.tipo <> 'contra'
GROUP BY
    J.id_jogador,
    J.nome,
    T.nome
ORDER BY
    quantidade_gols DESC,
    J.nome;


-- =====================================================
-- CONSULTA 11
-- Apresentar a classificação do campeonato 1
--
-- Critérios:
-- vitória = 3 pontos
-- empate = 1 ponto
-- derrota = 0 pontos
-- =====================================================

SELECT
    T.id_time,
    T.nome AS time,

    COUNT(R.id_partida) AS jogos,

    SUM(R.vitoria) AS vitorias,

    SUM(R.empate) AS empates,

    SUM(R.derrota) AS derrotas,

    SUM(R.gols_pro) AS gols_pro,

    SUM(R.gols_contra) AS gols_contra,

    SUM(R.gols_pro)
        - SUM(R.gols_contra)
        AS saldo_gols,

    SUM(R.pontos) AS pontos

FROM
    time T,

    (
        -- Inclui todos os times inscritos,
        -- mesmo aqueles que ainda não jogaram.

        SELECT
            I.id_campeonato,
            I.id_time,
            NULL AS id_partida,
            0 AS vitoria,
            0 AS empate,
            0 AS derrota,
            0 AS gols_pro,
            0 AS gols_contra,
            0 AS pontos
        FROM inscricao_time I


        UNION ALL


        -- Time mandante venceu.

        SELECT
            P.id_campeonato,
            P.id_time_mandante AS id_time,
            P.id_partida,
            1 AS vitoria,
            0 AS empate,
            0 AS derrota,
            P.gols_mandante AS gols_pro,
            P.gols_visitante AS gols_contra,
            3 AS pontos
        FROM partida P
        WHERE
            P.status = 'finalizada'
            AND P.gols_mandante
                > P.gols_visitante


        UNION ALL


        -- Time visitante perdeu.

        SELECT
            P.id_campeonato,
            P.id_time_visitante AS id_time,
            P.id_partida,
            0 AS vitoria,
            0 AS empate,
            1 AS derrota,
            P.gols_visitante AS gols_pro,
            P.gols_mandante AS gols_contra,
            0 AS pontos
        FROM partida P
        WHERE
            P.status = 'finalizada'
            AND P.gols_mandante
                > P.gols_visitante


        UNION ALL


        -- Time visitante venceu.

        SELECT
            P.id_campeonato,
            P.id_time_visitante AS id_time,
            P.id_partida,
            1 AS vitoria,
            0 AS empate,
            0 AS derrota,
            P.gols_visitante AS gols_pro,
            P.gols_mandante AS gols_contra,
            3 AS pontos
        FROM partida P
        WHERE
            P.status = 'finalizada'
            AND P.gols_visitante
                > P.gols_mandante


        UNION ALL


        -- Time mandante perdeu.

        SELECT
            P.id_campeonato,
            P.id_time_mandante AS id_time,
            P.id_partida,
            0 AS vitoria,
            0 AS empate,
            1 AS derrota,
            P.gols_mandante AS gols_pro,
            P.gols_visitante AS gols_contra,
            0 AS pontos
        FROM partida P
        WHERE
            P.status = 'finalizada'
            AND P.gols_visitante
                > P.gols_mandante


        UNION ALL


        -- Empate do time mandante.

        SELECT
            P.id_campeonato,
            P.id_time_mandante AS id_time,
            P.id_partida,
            0 AS vitoria,
            1 AS empate,
            0 AS derrota,
            P.gols_mandante AS gols_pro,
            P.gols_visitante AS gols_contra,
            1 AS pontos
        FROM partida P
        WHERE
            P.status = 'finalizada'
            AND P.gols_mandante
                = P.gols_visitante


        UNION ALL


        -- Empate do time visitante.

        SELECT
            P.id_campeonato,
            P.id_time_visitante AS id_time,
            P.id_partida,
            0 AS vitoria,
            1 AS empate,
            0 AS derrota,
            P.gols_visitante AS gols_pro,
            P.gols_mandante AS gols_contra,
            1 AS pontos
        FROM partida P
        WHERE
            P.status = 'finalizada'
            AND P.gols_mandante
                = P.gols_visitante

    ) R

WHERE
    T.id_time = R.id_time
    AND R.id_campeonato = 1

GROUP BY
    T.id_time,
    T.nome

ORDER BY
    pontos DESC,
    saldo_gols DESC,
    gols_pro DESC,
    T.nome;