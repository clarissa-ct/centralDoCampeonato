require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function criarAdministrador() {
    const nome = 'Administrador';
    const email = 'admin@sumula.com';
    const senha = 'admin123';

    try {
        const usuarioExistente = await pool.query(
            `
                SELECT
                    id_usuario
                FROM usuario
                WHERE email = $1
            `,
            [email]
        );

        if (usuarioExistente.rowCount > 0) {
            console.log(
                'O usuário administrador já está cadastrado.'
            );

            return;
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
                nome,
                email,
                senhaCriptografada
            ]
        );

        console.log(
            'Usuário administrador criado com sucesso.'
        );

        console.log('E-mail: admin@sumula.com');
        console.log('Senha: admin123');
    } catch (erro) {
        console.error(
            'Erro ao criar usuário administrador:',
            erro
        );
    } finally {
        await pool.end();
    }
}

criarAdministrador();