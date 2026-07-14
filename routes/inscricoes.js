const express = require('express');
const pool = require('../config/database');

const router = express.Router();

async function carregarOpcoes() {
    const campeonatosResultado = await pool.query(`
        SELECT
            C.id_campeonato,
            C.nome,
            C.ano
        FROM campeonato C
        ORDER BY C.ano DESC, C.nome
    `);

    const timesResultado = await pool.query(`
        SELECT
            T.id_time,
            T.nome,
            T.cidade,
            T.estado
        FROM time T
        ORDER BY T.nome
    `);

    return {
        campeonatos: campeonatosResultado.rows,
        times: timesResultado.rows
    };
}

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                I.id_campeonato,
                I.id_time,
                C.nome AS campeonato,
                C.ano,
                T.nome AS time,
                T.cidade,
                T.estado
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

        res.render('inscricoes/index', {
            titulo: 'Inscrições de times',
            inscricoes: resultado.rows,
            sucesso: req.query.sucesso === '1'
        });
    } catch (erro) {
        console.error(
            'Erro ao listar inscrições:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar as inscrições.'
        );
    }
});

router.get('/nova', async (req, res) => {
    try {
        const opcoes = await carregarOpcoes();

        res.render('inscricoes/novo', {
            titulo: 'Nova inscrição',
            campeonatos: opcoes.campeonatos,
            times: opcoes.times,
            erro: null,
            dados: {}
        });
    } catch (erro) {
        console.error(
            'Erro ao carregar formulário de inscrição:',
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
        id_time
    } = req.body;

    const dados = {
        id_campeonato,
        id_time
    };

    try {
        const opcoes = await carregarOpcoes();

        const campeonatoNumero = Number(
            id_campeonato
        );

        const timeNumero = Number(
            id_time
        );

        if (
            !Number.isInteger(campeonatoNumero) ||
            campeonatoNumero <= 0 ||
            !Number.isInteger(timeNumero) ||
            timeNumero <= 0
        ) {
            return res.status(400).render(
                'inscricoes/novo',
                {
                    titulo: 'Nova inscrição',
                    campeonatos: opcoes.campeonatos,
                    times: opcoes.times,
                    erro:
                        'Selecione o campeonato e o time.',
                    dados
                }
            );
        }

        await pool.query(
            `
                INSERT INTO inscricao_time (
                    id_campeonato,
                    id_time
                )
                VALUES (
                    $1,
                    $2
                )
            `,
            [
                campeonatoNumero,
                timeNumero
            ]
        );

        return res.redirect(
            '/inscricoes?sucesso=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao realizar inscrição:',
            erro
        );

        let mensagem =
            'Não foi possível realizar a inscrição.';

        if (
            erro.constraint
            === 'pk_inscricao_time'
        ) {
            mensagem =
                'Esse time já está inscrito no campeonato selecionado.';
        }

        if (erro.code === '23503') {
            mensagem =
                'O campeonato ou o time selecionado não existe.';
        }

        try {
            const opcoes = await carregarOpcoes();

            return res.status(400).render(
                'inscricoes/novo',
                {
                    titulo: 'Nova inscrição',
                    campeonatos: opcoes.campeonatos,
                    times: opcoes.times,
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