const express = require('express');
const pool = require('../config/database');

const router = express.Router();

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

async function carregarOpcoes() {
    const campeonatosResultado = await pool.query(`
        SELECT
            C.id_campeonato,
            C.nome,
            C.ano
        FROM campeonato C
        ORDER BY
            C.ano DESC,
            C.nome
    `);

    const estadiosResultado = await pool.query(`
        SELECT
            E.id_estadio,
            E.nome,
            E.cidade
        FROM estadio E
        ORDER BY E.nome
    `);

    const inscricoesResultado = await pool.query(`
        SELECT
            I.id_campeonato,
            I.id_time,
            C.nome AS campeonato,
            C.ano,
            T.nome AS time
        FROM
            inscricao_time I,
            campeonato C,
            time T
        WHERE
            I.id_campeonato = C.id_campeonato
            AND I.id_time = T.id_time
        ORDER BY
            C.ano DESC,
            C.nome,
            T.nome
    `);

    return {
        campeonatos: campeonatosResultado.rows,
        estadios: estadiosResultado.rows,
        inscricoes: inscricoesResultado.rows
    };
}

async function buscarPartida(idPartida) {
    const resultado = await pool.query(
        `
            SELECT
                P.id_partida,
                P.rodada,
                P.status,
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
                AND P.id_partida = $1
        `,
        [idPartida]
    );

    return resultado.rows[0];
}

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
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
                vw_partida_placar P,
                campeonato C,
                time M,
                time V,
                estadio E
            WHERE
                P.id_campeonato = C.id_campeonato
                AND P.id_time_mandante = M.id_time
                AND P.id_time_visitante = V.id_time
                AND P.id_estadio = E.id_estadio
            ORDER BY P.data_hora
        `);

        const partidas = resultado.rows.map(
            (partida) => {
                return {
                    ...partida,
                    data_hora: formatarDataHora(
                        partida.data_hora
                    )
                };
            }
        );

        res.render('partidas/index', {
            titulo: 'Partidas',
            partidas,
            sucesso: req.query.sucesso === '1'
        });
    } catch (erro) {
        console.error(
            'Erro ao listar partidas:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar as partidas.'
        );
    }
});

router.get('/nova', async (req, res) => {
    try {
        const opcoes = await carregarOpcoes();

        res.render('partidas/nova', {
            titulo: 'Nova partida',
            campeonatos: opcoes.campeonatos,
            estadios: opcoes.estadios,
            inscricoes: opcoes.inscricoes,
            erro: null,
            dados: {}
        });
    } catch (erro) {
        console.error(
            'Erro ao carregar formulário de partida:',
            erro
        );

        res.status(500).send(
            'Não foi possível carregar o formulário.'
        );
    }
});

router.post('/', async (req, res) => {
    const {
        id_campeonato,
        id_estadio,
        id_time_mandante,
        id_time_visitante,
        rodada,
        data_hora
    } = req.body;

    const dados = {
        id_campeonato,
        id_estadio,
        id_time_mandante,
        id_time_visitante,
        rodada,
        data_hora
    };

    try {
        const opcoes = await carregarOpcoes();

        const campeonatoNumero = Number(
            id_campeonato
        );

        const estadioNumero = Number(
            id_estadio
        );

        const mandanteNumero = Number(
            id_time_mandante
        );

        const visitanteNumero = Number(
            id_time_visitante
        );

        const rodadaNumero = Number(
            rodada
        );

        if (
            !Number.isInteger(campeonatoNumero) ||
            !Number.isInteger(estadioNumero) ||
            !Number.isInteger(mandanteNumero) ||
            !Number.isInteger(visitanteNumero) ||
            !Number.isInteger(rodadaNumero) ||
            campeonatoNumero <= 0 ||
            estadioNumero <= 0 ||
            mandanteNumero <= 0 ||
            visitanteNumero <= 0 ||
            rodadaNumero <= 0 ||
            !data_hora
        ) {
            return res.status(400).render(
                'partidas/nova',
                {
                    titulo: 'Nova partida',
                    campeonatos:
                        opcoes.campeonatos,
                    estadios:
                        opcoes.estadios,
                    inscricoes:
                        opcoes.inscricoes,
                    erro:
                        'Preencha todos os campos corretamente.',
                    dados
                }
            );
        }

        if (mandanteNumero === visitanteNumero) {
            return res.status(400).render(
                'partidas/nova',
                {
                    titulo: 'Nova partida',
                    campeonatos:
                        opcoes.campeonatos,
                    estadios:
                        opcoes.estadios,
                    inscricoes:
                        opcoes.inscricoes,
                    erro:
                        'O time mandante deve ser diferente do visitante.',
                    dados
                }
            );
        }

        const inscricoesResultado =
            await pool.query(
                `
                    SELECT
                        COUNT(*) AS quantidade
                    FROM inscricao_time I
                    WHERE
                        I.id_campeonato = $1
                        AND I.id_time IN ($2, $3)
                `,
                [
                    campeonatoNumero,
                    mandanteNumero,
                    visitanteNumero
                ]
            );

        const quantidadeInscricoes = Number(
            inscricoesResultado
                .rows[0]
                .quantidade
        );

        if (quantidadeInscricoes !== 2) {
            return res.status(400).render(
                'partidas/nova',
                {
                    titulo: 'Nova partida',
                    campeonatos:
                        opcoes.campeonatos,
                    estadios:
                        opcoes.estadios,
                    inscricoes:
                        opcoes.inscricoes,
                    erro:
                        'Os dois times devem estar inscritos no campeonato.',
                    dados
                }
            );
        }

        const resultadoId = await pool.query(`
            SELECT
                MAX(id_partida) AS maior_id
            FROM partida
        `);

        let novoId = 1;

        if (
            resultadoId.rows[0].maior_id
            !== null
        ) {
            novoId =
                Number(
                    resultadoId
                        .rows[0]
                        .maior_id
                ) + 1;
        }

        await pool.query(
            `
                INSERT INTO partida (
                    id_partida,
                    id_campeonato,
                    id_estadio,
                    id_time_mandante,
                    id_time_visitante,
                    rodada,
                    data_hora,
                    status
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    'agendada'
                )
            `,
            [
                novoId,
                campeonatoNumero,
                estadioNumero,
                mandanteNumero,
                visitanteNumero,
                rodadaNumero,
                data_hora
            ]
        );

        return res.redirect(
            '/partidas?sucesso=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao cadastrar partida:',
            erro
        );

        let mensagem =
            'Não foi possível cadastrar a partida.';

        if (
            erro.constraint
            === 'fk_partida_campeonato'
        ) {
            mensagem =
                'O campeonato selecionado não existe.';
        }

        if (
            erro.constraint
            === 'fk_partida_estadio'
        ) {
            mensagem =
                'O estádio selecionado não existe.';
        }

        if (
            erro.constraint
                === 'fk_partida_mandante'
            ||
            erro.constraint
                === 'fk_partida_visitante'
        ) {
            mensagem =
                'Os times devem estar inscritos no campeonato.';
        }

        if (
            erro.constraint
            === 'ck_partida_times_diferentes'
        ) {
            mensagem =
                'O time mandante deve ser diferente do visitante.';
        }

        if (
            erro.constraint
            === 'ck_partida_rodada'
        ) {
            mensagem =
                'A rodada deve ser maior que zero.';
        }

        try {
            const opcoes = await carregarOpcoes();

            return res.status(400).render(
                'partidas/nova',
                {
                    titulo: 'Nova partida',
                    campeonatos:
                        opcoes.campeonatos,
                    estadios:
                        opcoes.estadios,
                    inscricoes:
                        opcoes.inscricoes,
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
