const express = require('express');
const pool = require('../config/database');

const router = express.Router();

const posicoesPermitidas = [
    'goleiro',
    'zagueiro',
    'lateral',
    'volante',
    'meio-campo',
    'atacante'
];

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
                id_jogador,
                nome,
                data_nascimento,
                posicao
            FROM jogador
            ORDER BY nome
        `);

        const jogadores = resultado.rows.map(
            (jogador) => {
                return {
                    ...jogador,
                    data_nascimento: formatarData(
                        jogador.data_nascimento
                    )
                };
            }
        );

        res.render('jogadores/index', {
            titulo: 'Jogadores',
            jogadores,
            sucesso: req.query.sucesso === '1'
        });
    } catch (erro) {
        console.error(
            'Erro ao listar jogadores:',
            erro
        );

        res.status(500).send(
            'Não foi possível consultar os jogadores.'
        );
    }
});

router.get('/novo', (req, res) => {
    res.render('jogadores/novo', {
        titulo: 'Novo jogador',
        erro: null,
        dados: {},
        posicoes: posicoesPermitidas
    });
});

router.post('/', async (req, res) => {
    const {
        nome,
        data_nascimento,
        posicao
    } = req.body;

    const dados = {
        nome,
        data_nascimento,
        posicao
    };

    if (
        !nome ||
        !data_nascimento ||
        !posicao
    ) {
        return res.status(400).render(
            'jogadores/novo',
            {
                titulo: 'Novo jogador',
                erro: 'Preencha todos os campos.',
                dados,
                posicoes: posicoesPermitidas
            }
        );
    }

    if (!posicoesPermitidas.includes(posicao)) {
        return res.status(400).render(
            'jogadores/novo',
            {
                titulo: 'Novo jogador',
                erro: 'A posição informada é inválida.',
                dados,
                posicoes: posicoesPermitidas
            }
        );
    }

    try {
        const resultadoId = await pool.query(`
            SELECT
                MAX(id_jogador) AS maior_id
            FROM jogador
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
                INSERT INTO jogador (
                    id_jogador,
                    nome,
                    data_nascimento,
                    posicao
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
                data_nascimento,
                posicao
            ]
        );

        return res.redirect(
            '/jogadores?sucesso=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao cadastrar jogador:',
            erro
        );

        let mensagem =
            'Não foi possível cadastrar o jogador.';

        if (
            erro.constraint
            === 'ck_jogador_posicao'
        ) {
            mensagem =
                'A posição informada é inválida.';
        }

        return res.status(400).render(
            'jogadores/novo',
            {
                titulo: 'Novo jogador',
                erro: mensagem,
                dados,
                posicoes: posicoesPermitidas
            }
        );
    }
});

module.exports = router;