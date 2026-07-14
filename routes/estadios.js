const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id_estadio,
                nome,
                cidade,
                capacidade
            FROM estadio
            ORDER BY nome
        `);

        res.render('estadios/index', {
            titulo: 'Estádios',
            estadios: resultado.rows,
            sucesso: req.query.sucesso === '1'
        });
    } catch (erro) {
        console.error(
            'Erro ao listar estádios:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar os estádios.'
        );
    }
});

router.get('/novo', (req, res) => {
    res.render('estadios/novo', {
        titulo: 'Novo estádio',
        erro: null,
        dados: {}
    });
});

router.post('/', async (req, res) => {
    const {
        nome,
        cidade,
        capacidade
    } = req.body;

    const dados = {
        nome,
        cidade,
        capacidade
    };

    if (
        !nome ||
        !cidade ||
        !capacidade
    ) {
        return res.status(400).render(
            'estadios/novo',
            {
                titulo: 'Novo estádio',
                erro: 'Preencha todos os campos.',
                dados
            }
        );
    }

    const capacidadeNumero = Number(capacidade);

    if (
        !Number.isInteger(capacidadeNumero) ||
        capacidadeNumero <= 0
    ) {
        return res.status(400).render(
            'estadios/novo',
            {
                titulo: 'Novo estádio',
                erro:
                    'A capacidade deve ser um número inteiro maior que zero.',
                dados
            }
        );
    }

    try {
        const resultadoId = await pool.query(`
            SELECT
                MAX(id_estadio) AS maior_id
            FROM estadio
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
                INSERT INTO estadio (
                    id_estadio,
                    nome,
                    cidade,
                    capacidade
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
                capacidadeNumero
            ]
        );

        return res.redirect(
            '/estadios?sucesso=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao cadastrar estádio:',
            erro
        );

        let mensagem =
            'Não foi possível cadastrar o estádio.';

        if (
            erro.constraint
            === 'uk_estadio_nome_cidade'
        ) {
            mensagem =
                'Já existe um estádio com esse nome nessa cidade.';
        }

        if (
            erro.constraint
            === 'ck_estadio_capacidade'
        ) {
            mensagem =
                'A capacidade deve ser maior que zero.';
        }

        return res.status(400).render(
            'estadios/novo',
            {
                titulo: 'Novo estádio',
                erro: mensagem,
                dados
            }
        );
    }
});

module.exports = router;