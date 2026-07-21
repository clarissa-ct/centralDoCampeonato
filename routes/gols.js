const express = require('express');
const pool = require('../config/database');

const router = express.Router();

const tiposPermitidos = [
    'normal',
    'pênalti',
    'falta',
    'contra'
];

function formatarDataHora(dataHora) {
    if (!dataHora) {
        return '';
    }

    const data = new Date(dataHora);

    return data.toLocaleString(
        'pt-BR',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    );
}

async function buscarPartidasAbertas() {
    const resultado = await pool.query(`
        SELECT
            P.id_partida,
            P.rodada,
            P.data_hora,
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
            AND P.status = 'agendada'
        ORDER BY
            P.data_hora,
            P.id_partida
    `);

    return resultado.rows.map((partida) => {
        return {
            ...partida,
            data_hora_formatada:
                formatarDataHora(partida.data_hora)
        };
    });
}

async function buscarPartidaAberta(idPartida) {
    const resultado = await pool.query(
        `
            SELECT
                P.id_partida,
                P.id_campeonato,
                P.id_time_mandante,
                P.id_time_visitante,
                P.rodada,
                P.data_hora,
                P.status,
                C.nome AS campeonato,
                C.ano,
                M.nome AS time_mandante,
                V.nome AS time_visitante,
                SUM(
                    CASE
                        WHEN GD.id_time_creditado
                            = P.id_time_mandante
                            THEN 1
                        ELSE 0
                    END
                )::INTEGER
                    AS gols_mandante,
                SUM(
                    CASE
                        WHEN GD.id_time_creditado
                            = P.id_time_visitante
                            THEN 1
                        ELSE 0
                    END
                )::INTEGER
                    AS gols_visitante
            FROM
                partida P
                JOIN campeonato C
                    ON C.id_campeonato = P.id_campeonato
                JOIN time M
                    ON M.id_time = P.id_time_mandante
                JOIN time V
                    ON V.id_time = P.id_time_visitante
                LEFT JOIN vw_gol_detalhado GD
                    ON GD.id_partida = P.id_partida
            WHERE
                P.id_partida = $1
                AND P.status = 'agendada'
            GROUP BY
                P.id_partida,
                P.id_campeonato,
                P.id_time_mandante,
                P.id_time_visitante,
                P.rodada,
                P.data_hora,
                P.status,
                C.nome,
                C.ano,
                M.nome,
                V.nome
        `,
        [idPartida]
    );

    if (resultado.rowCount === 0) {
        return null;
    }

    return {
        ...resultado.rows[0],
        data_hora_formatada:
            formatarDataHora(resultado.rows[0].data_hora)
    };
}

async function buscarJogadoresDaPartida(idPartida) {
    const resultado = await pool.query(
        `
            SELECT
                J.id_jogador,
                J.nome AS jogador,
                J.posicao,
                E.numero_camisa,
                T.id_time,
                T.nome AS time
            FROM
                partida P,
                elenco E,
                jogador J,
                time T
            WHERE
                P.id_partida = $1
                AND E.id_campeonato = P.id_campeonato
                AND E.id_time IN (
                    P.id_time_mandante,
                    P.id_time_visitante
                )
                AND E.id_jogador = J.id_jogador
                AND E.id_time = T.id_time
            ORDER BY
                T.nome,
                E.numero_camisa,
                J.nome
        `,
        [idPartida]
    );

    return resultado.rows;
}

async function buscarGolsDaPartida(idPartida) {
    const resultado = await pool.query(
        `
            SELECT
                GD.id_gol,
                GD.minuto,
                GD.tipo,
                J.nome AS jogador,
                TJ.nome AS time_jogador,
                TC.nome AS time_creditado
            FROM
                vw_gol_detalhado GD,
                jogador J,
                time TJ,
                time TC
            WHERE
                GD.id_partida = $1
                AND GD.id_jogador = J.id_jogador
                AND GD.id_time_jogador = TJ.id_time
                AND GD.id_time_creditado = TC.id_time
            ORDER BY
                GD.minuto,
                GD.id_gol
        `,
        [idPartida]
    );

    return resultado.rows;
}

async function carregarTela(idPartida) {
    const partidas = await buscarPartidasAbertas();

    if (!idPartida) {
        return {
            partidas,
            partida: null,
            jogadores: [],
            gols: []
        };
    }

    const partida = await buscarPartidaAberta(idPartida);

    if (!partida) {
        return {
            partidas,
            partida: null,
            jogadores: [],
            gols: []
        };
    }

    const [jogadores, gols] = await Promise.all([
        buscarJogadoresDaPartida(idPartida),
        buscarGolsDaPartida(idPartida)
    ]);

    return {
        partidas,
        partida,
        jogadores,
        gols
    };
}

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                GD.id_gol,
                GD.id_partida,
                C.nome AS campeonato,
                C.ano,
                M.nome AS time_mandante,
                V.nome AS time_visitante,
                J.nome AS jogador,
                TJ.nome AS time_jogador,
                TC.nome AS time_creditado,
                GD.minuto,
                GD.tipo,
                P.status
            FROM
                vw_gol_detalhado GD,
                partida P,
                campeonato C,
                jogador J,
                time TJ,
                time TC,
                time M,
                time V
            WHERE
                GD.id_partida = P.id_partida
                AND P.id_campeonato = C.id_campeonato
                AND GD.id_jogador = J.id_jogador
                AND GD.id_time_jogador = TJ.id_time
                AND GD.id_time_creditado = TC.id_time
                AND P.id_time_mandante = M.id_time
                AND P.id_time_visitante = V.id_time
            ORDER BY
                P.id_partida,
                GD.minuto,
                GD.id_gol
        `);

        res.render('gols/index', {
            titulo: 'Gols',
            gols: resultado.rows,
            sucesso: req.query.sucesso === '1',
            partidaFinalizada:
                req.query.finalizada === '1'
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
    const idPartida = Number(req.query.id_partida);
    const possuiPartida =
        Number.isInteger(idPartida) &&
        idPartida > 0;

    try {
        const tela = await carregarTela(
            possuiPartida ? idPartida : null
        );

        let erro = null;

        if (possuiPartida && !tela.partida) {
            erro =
                'A partida selecionada não está disponível para receber gols.';
        }

        res.render('gols/novo', {
            titulo: 'Gerenciar gols',
            ...tela,
            erro,
            sucesso: req.query.sucesso === '1',
            dados: {
                id_partida:
                    possuiPartida ? idPartida : ''
            }
        });
    } catch (erro) {
        console.error(
            'Erro ao carregar gerenciamento de gols:',
            erro
        );

        res.status(500).send(
            'Não foi possível carregar o gerenciamento de gols.'
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

    const idPartida = Number(id_partida);
    const idJogador = Number(id_jogador);
    const minutoNumero = Number(minuto);

    try {
        if (
            !Number.isInteger(idPartida) ||
            !Number.isInteger(idJogador) ||
            !Number.isInteger(minutoNumero) ||
            idPartida <= 0 ||
            idJogador <= 0 ||
            minutoNumero < 0 ||
            !tiposPermitidos.includes(tipo)
        ) {
            const tela = await carregarTela(
                Number.isInteger(idPartida) &&
                idPartida > 0
                    ? idPartida
                    : null
            );

            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Gerenciar gols',
                    ...tela,
                    erro:
                        'Preencha todos os campos corretamente.',
                    sucesso: false,
                    dados
                }
            );
        }

        const partida = await buscarPartidaAberta(
            idPartida
        );

        if (!partida) {
            const tela = await carregarTela(null);

            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Gerenciar gols',
                    ...tela,
                    erro:
                        'A partida não está disponível para receber gols.',
                    sucesso: false,
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
            `/gols/novo?id_partida=${idPartida}&sucesso=1`
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
            const tela = await carregarTela(
                Number.isInteger(idPartida) &&
                idPartida > 0
                    ? idPartida
                    : null
            );

            return res.status(400).render(
                'gols/novo',
                {
                    titulo: 'Gerenciar gols',
                    ...tela,
                    erro: mensagem,
                    sucesso: false,
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

router.post('/:id/finalizar', async (req, res) => {
    const idPartida = Number(req.params.id);

    if (
        !Number.isInteger(idPartida) ||
        idPartida <= 0
    ) {
        return res.status(400).send(
            'Partida inválida.'
        );
    }

    try {
        const resultado = await pool.query(
            `
                UPDATE partida
                SET status = 'finalizada'
                WHERE
                    id_partida = $1
                    AND status = 'agendada'
            `,
            [idPartida]
        );

        if (resultado.rowCount === 0) {
            return res.status(400).send(
                'A partida não está disponível para finalização.'
            );
        }

        return res.redirect(
            '/gols?finalizada=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao finalizar partida:',
            erro
        );

        return res.status(500).send(
            'Não foi possível finalizar a partida.'
        );
    }
});

module.exports = router;
