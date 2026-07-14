const express = require('express');
const pool = require('../config/database');

const router = express.Router();

const tiposPermitidos = [
    'normal',
    'pênalti',
    'falta',
    'contra'
];

async function carregarOpcoes() {
    const partidasResultado = await pool.query(`
        SELECT
            P.id_partida,
            P.id_campeonato,
            P.id_time_mandante,
            P.id_time_visitante,
            P.gols_mandante,
            P.gols_visitante,
            P.rodada,
            C.nome AS campeonato,
            C.ano,
            M.nome AS time_mandante,
            V.nome AS time_visitante
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
        ORDER BY P.data_hora DESC
    `);

    const jogadoresResultado = await pool.query(`
        SELECT
            P.id_partida,
            J.id_jogador,
            J.nome AS jogador,
            J.posicao,
            T.id_time,
            T.nome AS time
        FROM
            partida P,
            elenco E,
            jogador J,
            time T
        WHERE
            E.id_campeonato = P.id_campeonato
            AND (
                E.id_time = P.id_time_mandante
                OR E.id_time = P.id_time_visitante
            )
            AND E.id_jogador = J.id_jogador
            AND E.id_time = T.id_time
            AND P.status = 'finalizada'
        ORDER BY
            P.id_partida,
            T.nome,
            J.nome
    `);

    return {
        partidas: partidasResultado.rows,
        jogadores: jogadoresResultado.rows
    };
}

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                G.id_gol,
                G.id_partida,
                C.nome AS campeonato,
                C.ano,
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
                G.id_gol
        `);

        res.render('gols/index', {
            titulo: 'Gols',
            gols: resultado.rows,
            sucesso: req.query.sucesso === '1'
        });
    } catch (erro) {
        console.error(
            'Erro ao listar gols:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar os gols.'
        );
    }
});

router.get('/novo', async (req, res) => {
    try {
        const opcoes = await carregarOpcoes();

        res.render('gols/novo', {
            titulo: 'Registrar gol',
            partidas: opcoes.partidas,
            jogadores: opcoes.jogadores,
            erro: null,
            dados: {}
        });
    } catch (erro) {
        console.error(
            'Erro ao carregar formulário de gol:',
            erro
        );

        res.status(500).send(
            'Não foi possível carregar o formulário.'
        );
    }
});

router.post('/', async (req, res) => {
    const {
        id_partida,
        id_jogador,
        minuto,
        tipo
    } = req.body;

    const dados = {
        id_partida,
        id_jogador,
        minuto,
        tipo
    };

    try {
        const opcoes = await carregarOpcoes();

        const idPartida = Number(id_partida);
        const idJogador = Number(id_jogador);
        const minutoNumero = Number(minuto);

        if (
            !Number.isInteger(idPartida) ||
            !Number.isInteger(idJogador) ||
            !Number.isInteger(minutoNumero) ||
            idPartida <= 0 ||
            idJogador <= 0 ||
            minutoNumero < 0 ||
            !tiposPermitidos.includes(tipo)
        ) {
            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Registrar gol',
                    partidas: opcoes.partidas,
                    jogadores: opcoes.jogadores,
                    erro:
                        'Preencha todos os campos corretamente.',
                    dados
                }
            );
        }

        const partidaResultado = await pool.query(
            `
                SELECT
                    P.id_partida,
                    P.id_campeonato,
                    P.id_time_mandante,
                    P.id_time_visitante,
                    P.gols_mandante,
                    P.gols_visitante,
                    P.status,
                    E.id_time AS id_time_jogador
                FROM
                    partida P,
                    elenco E
                WHERE
                    P.id_partida = $1
                    AND E.id_campeonato
                        = P.id_campeonato
                    AND E.id_jogador = $2
                    AND (
                        E.id_time
                            = P.id_time_mandante
                        OR E.id_time
                            = P.id_time_visitante
                    )
            `,
            [
                idPartida,
                idJogador
            ]
        );

        if (partidaResultado.rowCount === 0) {
            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Registrar gol',
                    partidas: opcoes.partidas,
                    jogadores: opcoes.jogadores,
                    erro:
                        'O jogador não pertence a um dos times da partida.',
                    dados
                }
            );
        }

        const partida =
            partidaResultado.rows[0];

        if (partida.status !== 'finalizada') {
            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Registrar gol',
                    partidas: opcoes.partidas,
                    jogadores: opcoes.jogadores,
                    erro:
                        'Somente partidas finalizadas podem receber gols.',
                    dados
                }
            );
        }

        const golsRegistradosResultado =
            await pool.query(
                `
                    SELECT
                        G.tipo,
                        E.id_time
                            AS id_time_jogador
                    FROM
                        gol G,
                        partida P,
                        elenco E
                    WHERE
                        P.id_partida = $1
                        AND G.id_partida
                            = P.id_partida
                        AND E.id_campeonato
                            = P.id_campeonato
                        AND E.id_jogador
                            = G.id_jogador
                        AND (
                            E.id_time
                                = P.id_time_mandante
                            OR E.id_time
                                = P.id_time_visitante
                        )
                `,
                [idPartida]
            );

        let golsMandanteRegistrados = 0;
        let golsVisitanteRegistrados = 0;

        const idTimeMandante = Number(
            partida.id_time_mandante
        );

        const idTimeVisitante = Number(
            partida.id_time_visitante
        );

        golsRegistradosResultado.rows.forEach(
            (gol) => {
                const idTimeJogador = Number(
                    gol.id_time_jogador
                );

                const jogadorEhMandante =
                    idTimeJogador
                    === idTimeMandante;

                let golParaMandante;

                if (gol.tipo === 'contra') {
                    golParaMandante =
                        !jogadorEhMandante;
                } else {
                    golParaMandante =
                        jogadorEhMandante;
                }

                if (golParaMandante) {
                    golsMandanteRegistrados += 1;
                } else {
                    golsVisitanteRegistrados += 1;
                }
            }
        );

        const idTimeJogador = Number(
            partida.id_time_jogador
        );

        const jogadorEhMandante =
            idTimeJogador === idTimeMandante;

        let novoGolParaMandante;

        if (tipo === 'contra') {
            novoGolParaMandante =
                !jogadorEhMandante;
        } else {
            novoGolParaMandante =
                jogadorEhMandante;
        }

        const golsMandantePartida = Number(
            partida.gols_mandante
        );

        const golsVisitantePartida = Number(
            partida.gols_visitante
        );

        if (
            novoGolParaMandante &&
            golsMandanteRegistrados
                >= golsMandantePartida
        ) {
            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Registrar gol',
                    partidas: opcoes.partidas,
                    jogadores: opcoes.jogadores,
                    erro:
                        'Todos os gols do time mandante já foram registrados.',
                    dados
                }
            );
        }

        if (
            !novoGolParaMandante &&
            golsVisitanteRegistrados
                >= golsVisitantePartida
        ) {
            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Registrar gol',
                    partidas: opcoes.partidas,
                    jogadores: opcoes.jogadores,
                    erro:
                        'Todos os gols do time visitante já foram registrados.',
                    dados
                }
            );
        }

        const resultadoId = await pool.query(`
            SELECT
                MAX(id_gol) AS maior_id
            FROM gol
        `);

        let novoId = 1;

        if (
            resultadoId.rows[0].maior_id
            !== null
        ) {
            novoId =
                Number(
                    resultadoId.rows[0].maior_id
                ) + 1;
        }

        await pool.query(
            `
                INSERT INTO gol (
                    id_gol,
                    id_partida,
                    id_jogador,
                    minuto,
                    tipo
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
            `,
            [
                novoId,
                idPartida,
                idJogador,
                minutoNumero,
                tipo
            ]
        );

        return res.redirect(
            '/gols?sucesso=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao registrar gol:',
            erro
        );

        let mensagem =
            'Não foi possível registrar o gol.';

        if (
            erro.constraint
            === 'fk_gol_partida'
        ) {
            mensagem =
                'A partida selecionada não existe.';
        }

        if (
            erro.constraint
            === 'fk_gol_jogador'
        ) {
            mensagem =
                'O jogador selecionado não existe.';
        }

        if (
            erro.constraint
            === 'ck_gol_minuto'
        ) {
            mensagem =
                'O minuto do gol não pode ser negativo.';
        }

        if (
            erro.constraint
            === 'ck_gol_tipo'
        ) {
            mensagem =
                'O tipo do gol informado é inválido.';
        }

        try {
            const opcoes =
                await carregarOpcoes();

            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Registrar gol',
                    partidas: opcoes.partidas,
                    jogadores: opcoes.jogadores,
                    erro: mensagem,
                    dados
                }
            );
        } catch (erroConsulta) {
            console.error(
                'Erro ao recarregar formulário:',
                erroConsulta
            );

            return res.status(500).send(
                'Não foi possível carregar o formulário.'
            );
        }
    }
});

module.exports = router;