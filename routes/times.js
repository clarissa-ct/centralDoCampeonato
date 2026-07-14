const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id_time,
                nome,
                cidade,
                estado
            FROM time
            ORDER BY nome
        `);

        res.render('times/index', {
            titulo: 'Times',
            times: resultado.rows,
            sucesso: req.query.sucesso === '1'
        });
    } catch (erro) {
        console.error(
            'Erro ao listar times:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar os times.'
        );
    }
});

router.get('/novo', (req, res) => {
    res.render('times/novo', {
        titulo: 'Novo time',
        erro: null,
        dados: {}
    });
});

router.post('/', async (req, res) => {
    const {
        nome,
        cidade,
        estado
    } = req.body;

    const dados = {
        nome,
        cidade,
        estado
    };

    if (
        !nome ||
        !cidade ||
        !estado
    ) {
        return res.status(400).render(
            'times/novo',
            {
                titulo: 'Novo time',
                erro: 'Preencha todos os campos.',
                dados
            }
        );
    }

    if (estado.trim().length !== 2) {
        return res.status(400).render(
            'times/novo',
            {
                titulo: 'Novo time',
                erro:
                    'O estado deve possuir exatamente duas letras.',
                dados
            }
        );
    }

    try {
        const resultadoId = await pool.query(`
            SELECT
                MAX(id_time) AS maior_id
            FROM time
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
                INSERT INTO time (
                    id_time,
                    nome,
                    cidade,
                    estado
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                )
            `,
            [
                novoId,
                nome.trim(),
                cidade.trim(),
                estado.trim().toUpperCase()
            ]
        );

        return res.redirect(
            '/times?sucesso=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao cadastrar time:',
            erro
        );

        let mensagem =
            'Não foi possível cadastrar o time.';

        if (
            erro.constraint
            === 'uk_time_nome_cidade'
        ) {
            mensagem =
                'Já existe um time com esse nome nessa cidade.';
        }

        return res.status(400).render(
            'times/novo',
            {
                titulo: 'Novo time',
                erro: mensagem,
                dados
            }
        );
    }
});

module.exports = router;