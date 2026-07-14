const express = require('express');
const path = require('path');
const session = require('express-session');

require('dotenv').config();

const pool = require('./config/database');

const autenticacaoRoutes = require('./routes/autenticacao');
const campeonatosRoutes = require('./routes/campeonatos');
const timesRoutes = require('./routes/times');
const jogadoresRoutes = require('./routes/jogadores');
const estadiosRoutes = require('./routes/estadios');
const inscricoesRoutes = require('./routes/inscricoes');
const elencosRoutes = require('./routes/elencos');
const partidasRoutes = require('./routes/partidas');
const golsRoutes = require('./routes/gols');
const consultasRoutes = require('./routes/consultas');

const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        name: 'sumula.sid',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 2
        }
    })
);

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', autenticacaoRoutes);

function verificarAutenticacao(req, res, next) {
    if (req.session.usuario) {
        return next();
    }

    return res.redirect('/login');
}

app.use(verificarAutenticacao);

app.use('/campeonatos', campeonatosRoutes);
app.use('/times', timesRoutes);
app.use('/jogadores', jogadoresRoutes);
app.use('/estadios', estadiosRoutes);
app.use('/inscricoes', inscricoesRoutes);
app.use('/elencos', elencosRoutes);
app.use('/partidas', partidasRoutes);
app.use('/gols', golsRoutes);
app.use('/consultas', consultasRoutes);

app.get('/', (req, res) => {
    res.render('index', {
        titulo: 'FutGestor'
    });
});

app.use((req, res) => {
    res.status(404).send('Página não encontrada.');
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});