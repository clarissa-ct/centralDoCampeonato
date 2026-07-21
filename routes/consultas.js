const express = require('express');
const pool = require('../config/database');

const router = express.Router();

async function buscarCampeonatos() {
    const resultado = await pool.query(`
        SELECT
            C.id_campeonato,
            C.nome,
            C.ano
        FROM campeonato C
        ORDER BY
            C.ano DESC,
            C.nome
    `);

    return resultado.rows;
}

async function buscarCampeonato(idCampeonato) {
    const resultado = await pool.query(
        `
            SELECT
                C.id_campeonato,
                C.nome,
                C.ano
            FROM campeonato C
            WHERE C.id_campeonato = $1
        `,
        [idCampeonato]
    );

    return resultado.rows[0];
}

router.get('/', async (req, res) => {
    try {
        const campeonatos =
            await buscarCampeonatos();

        res.render('consultas/index', {
            titulo: 'Consultas',
            campeonatos
        });
    } catch (erro) {
        console.error(
            'Erro ao carregar consultas:',
            erro
        );

        res.status(500).send(
            'Não foi possível carregar as consultas.'
        );
    }
});

router.get('/classificacao', async (req, res) => {
    const idCampeonato = Number(
        req.query.id_campeonato
    );

    if (
        !Number.isInteger(idCampeonato) ||
        idCampeonato <= 0
    ) {
        return res.status(400).send(
            'Selecione um campeonato válido.'
        );
    }

    try {
        const campeonato =
            await buscarCampeonato(
                idCampeonato
            );

        if (!campeonato) {
            return res.status(404).send(
                'Campeonato não encontrado.'
            );
        }

        const timesResultado = await pool.query(
            `
                SELECT
                    T.id_time,
                    T.nome AS time
                FROM
                    inscricao_time I,
                    time T
                WHERE
                    I.id_time = T.id_time
                    AND I.id_campeonato = $1
                ORDER BY T.nome
            `,
            [idCampeonato]
        );

        const partidasResultado =
            await pool.query(
                `
                    SELECT
                        P.id_partida,
                        P.id_time_mandante,
                        P.id_time_visitante,
                        P.gols_mandante,
                        P.gols_visitante
                    FROM vw_partida_placar P
                    WHERE
                        P.id_campeonato = $1
                        AND P.status = 'finalizada'
                    ORDER BY P.id_partida
                `,
                [idCampeonato]
            );

        const classificacao =
            timesResultado.rows.map(
                (time) => {
                    return {
                        id_time:
                            Number(time.id_time),
                        time:
                            time.time,
                        jogos: 0,
                        vitorias: 0,
                        empates: 0,
                        derrotas: 0,
                        gols_pro: 0,
                        gols_contra: 0,
                        saldo_gols: 0,
                        pontos: 0
                    };
                }
            );

        function encontrarTime(idTime) {
            return classificacao.find(
                (item) => {
                    return item.id_time
                        === Number(idTime);
                }
            );
        }

        partidasResultado.rows.forEach(
            (partida) => {
                const mandante = encontrarTime(
                    partida.id_time_mandante
                );

                const visitante = encontrarTime(
                    partida.id_time_visitante
                );

                if (!mandante || !visitante) {
                    return;
                }

                const golsMandante = Number(
                    partida.gols_mandante
                );

                const golsVisitante = Number(
                    partida.gols_visitante
                );

                mandante.jogos += 1;
                visitante.jogos += 1;

                mandante.gols_pro +=
                    golsMandante;

                mandante.gols_contra +=
                    golsVisitante;

                visitante.gols_pro +=
                    golsVisitante;

                visitante.gols_contra +=
                    golsMandante;

                if (
                    golsMandante
                    > golsVisitante
                ) {
                    mandante.vitorias += 1;
                    mandante.pontos += 3;

                    visitante.derrotas += 1;
                } else if (
                    golsVisitante
                    > golsMandante
                ) {
                    visitante.vitorias += 1;
                    visitante.pontos += 3;

                    mandante.derrotas += 1;
                } else {
                    mandante.empates += 1;
                    visitante.empates += 1;

                    mandante.pontos += 1;
                    visitante.pontos += 1;
                }
            }
        );

        classificacao.forEach((item) => {
            item.saldo_gols =
                item.gols_pro
                - item.gols_contra;
        });

        classificacao.sort((timeA, timeB) => {
            if (
                timeB.pontos
                !== timeA.pontos
            ) {
                return (
                    timeB.pontos
                    - timeA.pontos
                );
            }

            if (
                timeB.saldo_gols
                !== timeA.saldo_gols
            ) {
                return (
                    timeB.saldo_gols
                    - timeA.saldo_gols
                );
            }

            if (
                timeB.gols_pro
                !== timeA.gols_pro
            ) {
                return (
                    timeB.gols_pro
                    - timeA.gols_pro
                );
            }

            return timeA.time.localeCompare(
                timeB.time,
                'pt-BR'
            );
        });

        res.render(
            'consultas/classificacao',
            {
                titulo: 'Classificação',
                campeonato,
                classificacao
            }
        );
    } catch (erro) {
        console.error(
            'Erro ao consultar classificação:',
            erro
        );

        res.status(500).send(
            'Não foi possível calcular a classificação.'
        );
    }
});

router.get('/artilharia', async (req, res) => {
    const idCampeonato = Number(
        req.query.id_campeonato
    );

    if (
        !Number.isInteger(idCampeonato) ||
        idCampeonato <= 0
    ) {
        return res.status(400).send(
            'Selecione um campeonato válido.'
        );
    }

    try {
        const campeonato =
            await buscarCampeonato(
                idCampeonato
            );

        if (!campeonato) {
            return res.status(404).send(
                'Campeonato não encontrado.'
            );
        }

        const resultado = await pool.query(
            `
                SELECT
                    J.id_jogador,
                    J.nome AS jogador,
                    T.nome AS time,
                    COUNT(G.id_gol)
                        AS quantidade_gols
                FROM
                    gol G,
                    jogador J,
                    partida P,
                    elenco E,
                    time T
                WHERE
                    G.id_jogador
                        = J.id_jogador
                    AND G.id_partida
                        = P.id_partida
                    AND E.id_campeonato
                        = P.id_campeonato
                    AND E.id_jogador
                        = G.id_jogador
                    AND E.id_time
                        = T.id_time
                    AND P.id_campeonato = $1
                    AND P.status = 'finalizada'
                    AND G.tipo <> 'contra'
                GROUP BY
                    J.id_jogador,
                    J.nome,
                    T.nome
                ORDER BY
                    quantidade_gols DESC,
                    J.nome
            `,
            [idCampeonato]
        );

        res.render(
            'consultas/artilharia',
            {
                titulo: 'Artilharia',
                campeonato,
                artilharia: resultado.rows
            }
        );
    } catch (erro) {
        console.error(
            'Erro ao consultar artilharia:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar a artilharia.'
        );
    }
});

module.exports = router;