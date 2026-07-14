const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const router = express.Router();

router.get('/login', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/');
    }

    return res.render('autenticacao/login', {
        titulo: 'Entrar',
        erro: null,
        dados: {},
        cadastroRealizado:
            req.query.cadastro === '1'
    });
});

router.post('/login', async (req, res) => {
    const {
        email,
        senha
    } = req.body;

    const dados = {
        email
    };

    if (!email || !senha) {
        return res.status(400).render(
            'autenticacao/login',
            {
                titulo: 'Entrar',
                erro: 'Informe o e-mail e a senha.',
                dados,
                cadastroRealizado: false
            }
        );
    }

    try {
        const resultado = await pool.query(
            `
                SELECT
                    U.id_usuario,
                    U.nome,
                    U.email,
                    U.senha
                FROM usuario U
                WHERE U.email = $1
            `,
            [
                email.trim().toLowerCase()
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(401).render(
                'autenticacao/login',
                {
                    titulo: 'Entrar',
                    erro: 'E-mail ou senha incorretos.',
                    dados,
                    cadastroRealizado: false
                }
            );
        }

        const usuario = resultado.rows[0];

        const senhaCorreta =
            await bcrypt.compare(
                senha,
                usuario.senha
            );

        if (!senhaCorreta) {
            return res.status(401).render(
                'autenticacao/login',
                {
                    titulo: 'Entrar',
                    erro: 'E-mail ou senha incorretos.',
                    dados,
                    cadastroRealizado: false
                }
            );
        }

        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email
        };

        return res.redirect('/');
    } catch (erro) {
        console.error(
            'Erro ao realizar login:',
            erro
        );

        return res.status(500).render(
            'autenticacao/login',
            {
                titulo: 'Entrar',
                erro:
                    'Não foi possível realizar o login.',
                dados,
                cadastroRealizado: false
            }
        );
    }
});

router.get('/cadastro', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/');
    }

    return res.render(
        'autenticacao/cadastro',
        {
            titulo: 'Criar conta',
            erro: null,
            dados: {}
        }
    );
});

router.post('/cadastro', async (req, res) => {
    const {
        nome,
        email,
        senha,
        confirmar_senha
    } = req.body;

    const dados = {
        nome,
        email
    };

    if (
        !nome ||
        !email ||
        !senha ||
        !confirmar_senha
    ) {
        return res.status(400).render(
            'autenticacao/cadastro',
            {
                titulo: 'Criar conta',
                erro: 'Preencha todos os campos.',
                dados
            }
        );
    }

    if (senha.length < 6) {
        return res.status(400).render(
            'autenticacao/cadastro',
            {
                titulo: 'Criar conta',
                erro:
                    'A senha deve possuir pelo menos 6 caracteres.',
                dados
            }
        );
    }

    if (senha !== confirmar_senha) {
        return res.status(400).render(
            'autenticacao/cadastro',
            {
                titulo: 'Criar conta',
                erro: 'As senhas não são iguais.',
                dados
            }
        );
    }

    const emailFormatado =
        email.trim().toLowerCase();

    try {
        const usuarioExistente =
            await pool.query(
                `
                    SELECT
                        U.id_usuario
                    FROM usuario U
                    WHERE U.email = $1
                `,
                [emailFormatado]
            );

        if (usuarioExistente.rowCount > 0) {
            return res.status(400).render(
                'autenticacao/cadastro',
                {
                    titulo: 'Criar conta',
                    erro:
                        'Já existe um usuário cadastrado com esse e-mail.',
                    dados
                }
            );
        }

        const resultadoId = await pool.query(`
            SELECT
                MAX(id_usuario) AS maior_id
            FROM usuario
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

        const senhaCriptografada =
            await bcrypt.hash(senha, 10);

        await pool.query(
            `
                INSERT INTO usuario (
                    id_usuario,
                    nome,
                    email,
                    senha
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
                emailFormatado,
                senhaCriptografada
            ]
        );

        return res.redirect(
            '/login?cadastro=1'
        );
    } catch (erro) {
        console.error(
            'Erro ao cadastrar usuário:',
            erro
        );

        let mensagem =
            'Não foi possível realizar o cadastro.';

        if (
            erro.constraint
            === 'uk_usuario_email'
        ) {
            mensagem =
                'Já existe um usuário cadastrado com esse e-mail.';
        }

        return res.status(500).render(
            'autenticacao/cadastro',
            {
                titulo: 'Criar conta',
                erro: mensagem,
                dados
            }
        );
    }
});

router.post('/sair', (req, res) => {
    req.session.destroy((erro) => {
        if (erro) {
            console.error(
                'Erro ao encerrar sessão:',
                erro
            );

            return res.status(500).send(
                'Não foi possível encerrar a sessão.'
            );
        }

        res.clearCookie('sumula.sid');

        return res.redirect('/login');
    });
});

module.exports = router;