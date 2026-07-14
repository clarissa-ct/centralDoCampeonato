const express = require('express');
const pool = require('../config/database');

const router = express.Router();

async function carregarOpcoes() {
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

    const jogadoresResultado = await pool.query(`
        SELECT
            J.id_jogador,
            J.nome,
            J.posicao
        FROM jogador J
        ORDER BY J.nome
    `);

    return {
        inscricoes: inscricoesResultado.rows,
        jogadores: jogadoresResultado.rows
    };
}

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                E.id_campeonato,
                E.id_time,
                E.id_jogador,
                C.nome AS campeonato,
                C.ano,
                T.nome AS time,
                J.nome AS jogador,
                J.posicao,
                E.numero_camisa
            FROM
                elenco E,
                campeonato C,
                time T,
                jogador J
            WHERE
                E.id_campeonato = C.id_campeonato
                AND E.id_time = T.id_time
                AND E.id_jogador = J.id_jogador
            ORDER BY
                C.ano DESC,
                C.nome,
                T.nome,
                E.numero_camisa
        `);

        res.render('elencos/index', {
            titulo: 'Elencos',
            elencos: resultado.rows,
            sucesso: req.query.sucesso === '1'
        });
    } catch (erro) {
        console.error(
            'Erro ao listar elencos:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar os elencos.'
        );
    }
});

router.get('/novo', async (req, res) => {
    try {
        const opcoes = await carregarOpcoes();

        res.render('elencos/novo', {
            titulo: 'Adicionar jogador ao elenco',
            inscricoes: opcoes.inscricoes,
            jogadores: opcoes.jogadores,
            erro: null,
            dados: {}
        });
    } catch (erro) {
        console.error(
            'Erro ao carregar formulário:',
            erro
        );

        res.status(500).send(
            'Não foi possível carregar o formulário.'
        );
    }
});

router.post('/', async (req, res) => {
    const {
        inscricao,
        id_jogador,
        numero_camisa
    } = req.body;

    const dados = {
        inscricao,
        id_jogador,
        numero_camisa
    };

    try {
        const opcoes = await carregarOpcoes();

        if (
            !inscricao ||
            !inscricao.includes(':')
        ) {
            return res.status(400).render(
                'elencos/novo',
                {
                    titulo:
                        'Adicionar jogador ao elenco',
                    inscricoes: opcoes.inscricoes,
                    jogadores: opcoes.jogadores,
                    erro:
                        'Selecione o campeonato e o time.',
                    dados
                }
            );
        }

        const partes = inscricao.split(':');

        const idCampeonato = Number(partes[0]);
        const idTime = Number(partes[1]);
        const idJogador = Number(id_jogador);
        const numeroCamisa = Number(numero_camisa);

        if (
            !Number.isInteger(idCampeonato) ||
            !Number.isInteger(idTime) ||
            !Number.isInteger(idJogador) ||
            !Number.isInteger(numeroCamisa) ||
            idCampeonato <= 0 ||
            idTime <= 0 ||
            idJogador <= 0 ||
            numeroCamisa < 1 ||
            numeroCamisa > 99
        ) {
            return res.status(400).render(
                'elencos/novo',
                {
                    titulo:
                        'Adicionar jogador ao elenco',
                    inscricoes: opcoes.inscricoes,
                    jogadores: opcoes.jogadores,
                    erro:
                        'Preencha todos os campos corretamente.',
                    dados
                }
            );
        }

        await pool.query(
            `
                INSERT INTO elenco (
                    id_campeonato,
                    id_time,
                    id_jogador,
                    numero_camisa
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                )
            `,
            [
                idCampeonato,
                idTime,
                idJogador,
                numeroCamisa
            ]
        );

        return res.redirect(
            '/elencos?sucesso=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao adicionar jogador ao elenco:',
            erro
        );

        let mensagem =
            'Não foi possível adicionar o jogador ao elenco.';

        if (
            erro.constraint === 'pk_elenco'
        ) {
            mensagem =
                'Esse jogador já pertence a um time nesse campeonato.';
        }

        if (
            erro.constraint
            === 'uk_elenco_numero_camisa'
        ) {
            mensagem =
                'Esse número de camisa já está sendo utilizado no elenco.';
        }

        if (
            erro.constraint
            === 'fk_elenco_inscricao_time'
        ) {
            mensagem =
                'O time selecionado não está inscrito nesse campeonato.';
        }

        if (
            erro.constraint
            === 'fk_elenco_jogador'
        ) {
            mensagem =
                'O jogador selecionado não existe.';
        }

        if (
            erro.constraint
            === 'ck_elenco_numero_camisa'
        ) {
            mensagem =
                'O número da camisa deve estar entre 1 e 99.';
        }

        try {
            const opcoes = await carregarOpcoes();

            return res.status(400).render(
                'elencos/novo',
                {
                    titulo:
                        'Adicionar jogador ao elenco',
                    inscricoes: opcoes.inscricoes,
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