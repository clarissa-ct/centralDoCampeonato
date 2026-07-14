const express = require('express');
const pool = require('../config/database');

const router = express.Router();

function formatarData(data) {
    if (!data) {
        return '';
    }

    const dataFormatada = new Date(data);

    return dataFormatada.toLocaleDateString(
        'pt-BR',
        {
            timeZone: 'UTC'
        }
    );
}

router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id_campeonato,
                nome,
                ano,
                data_inicio,
                data_fim,
                status
            FROM campeonato
            ORDER BY ano DESC, nome
        `);

        const campeonatos = resultado.rows.map(
            (campeonato) => {
                return {
                    ...campeonato,
                    data_inicio: formatarData(
                        campeonato.data_inicio
                    ),
                    data_fim: formatarData(
                        campeonato.data_fim
                    )
                };
            }
        );

        res.render('campeonatos/index', {
            titulo: 'Campeonatos',
            campeonatos,
            sucesso: req.query.sucesso === '1'
        });
    } catch (erro) {
        console.error(
            'Erro ao listar campeonatos:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar os campeonatos.'
        );
    }
});

router.get('/novo', (req, res) => {
    res.render('campeonatos/novo', {
        titulo: 'Novo campeonato',
        erro: null,
        dados: {}
    });
});

router.post('/', async (req, res) => {
    const {
        nome,
        ano,
        data_inicio,
        data_fim,
        status
    } = req.body;

    const dados = {
        nome,
        ano,
        data_inicio,
        data_fim,
        status
    };

    if (
        !nome ||
        !ano ||
        !data_inicio ||
        !data_fim ||
        !status
    ) {
        return res.status(400).render(
            'campeonatos/novo',
            {
                titulo: 'Novo campeonato',
                erro: 'Preencha todos os campos.',
                dados
            }
        );
    }

    try {
        const resultadoId = await pool.query(`
            SELECT
                MAX(id_campeonato) AS maior_id
            FROM campeonato
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
                INSERT INTO campeonato (
                    id_campeonato,
                    nome,
                    ano,
                    data_inicio,
                    data_fim,
                    status
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
            `,
            [
                novoId,
                nome.trim(),
                Number(ano),
                data_inicio,
                data_fim,
                status
            ]
        );

        return res.redirect(
            '/campeonatos?sucesso=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao cadastrar campeonato:',
            erro
        );

        let mensagem =
            'Não foi possível cadastrar o campeonato.';

        if (
            erro.constraint
            === 'uk_campeonato_nome_ano'
        ) {
            mensagem =
                'Já existe um campeonato com esse nome e ano.';
        }

        if (erro.code === '23514') {
            mensagem =
                'Os dados informados não atendem às regras do campeonato.';
        }

        return res.status(400).render(
            'campeonatos/novo',
            {
                titulo: 'Novo campeonato',
                erro: mensagem,
                dados
            }
        );
    }
});

module.exports = router;