-- =====================================================
-- FUTGESTOR
-- Sistema de Gerenciamento de Campeonatos de Futebol
-- Script de criação das tabelas
-- =====================================================

-- =====================================================
-- Usuários do sistema
-- =====================================================

CREATE TABLE usuario (
    id_usuario INTEGER,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,

    CONSTRAINT pk_usuario
        PRIMARY KEY (id_usuario),

    CONSTRAINT uk_usuario_email
        UNIQUE (email)
);

CREATE TABLE campeonato (
    id_campeonato INTEGER,
    nome VARCHAR(100) NOT NULL,
    ano INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT pk_campeonato
        PRIMARY KEY (id_campeonato),

    CONSTRAINT uk_campeonato_nome_ano
        UNIQUE (nome, ano),

    CONSTRAINT ck_campeonato_ano
        CHECK (ano >= 1900),

    CONSTRAINT ck_campeonato_datas
        CHECK (data_fim >= data_inicio),

    CONSTRAINT ck_campeonato_status
        CHECK (
            status IN (
                'planejado',
                'em andamento',
                'finalizado'
            )
        )
);


CREATE TABLE time (
    id_time INTEGER,
    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,

    CONSTRAINT pk_time
        PRIMARY KEY (id_time),

    CONSTRAINT uk_time_nome_cidade
        UNIQUE (nome, cidade)
);


CREATE TABLE jogador (
    id_jogador INTEGER,
    nome VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
    posicao VARCHAR(20) NOT NULL,

    CONSTRAINT pk_jogador
        PRIMARY KEY (id_jogador),

    CONSTRAINT ck_jogador_posicao
        CHECK (
            posicao IN (
                'goleiro',
                'zagueiro',
                'lateral',
                'volante',
                'meio-campo',
                'atacante'
            )
        )
);


CREATE TABLE estadio (
    id_estadio INTEGER,
    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    capacidade INTEGER NOT NULL,

    CONSTRAINT pk_estadio
        PRIMARY KEY (id_estadio),

    CONSTRAINT uk_estadio_nome_cidade
        UNIQUE (nome, cidade),

    CONSTRAINT ck_estadio_capacidade
        CHECK (capacidade > 0)
);


-- =====================================================
-- Tabela associativa entre campeonato e time
-- =====================================================

CREATE TABLE inscricao_time (
    id_campeonato INTEGER NOT NULL,
    id_time INTEGER NOT NULL,

    CONSTRAINT pk_inscricao_time
        PRIMARY KEY (id_campeonato, id_time),

    CONSTRAINT fk_inscricao_time_campeonato
        FOREIGN KEY (id_campeonato)
        REFERENCES campeonato (id_campeonato),

    CONSTRAINT fk_inscricao_time_time
        FOREIGN KEY (id_time)
        REFERENCES time (id_time)
);


-- =====================================================
-- Elenco dos times em cada campeonato
-- =====================================================

CREATE TABLE elenco (
    id_campeonato INTEGER NOT NULL,
    id_time INTEGER NOT NULL,
    id_jogador INTEGER NOT NULL,
    numero_camisa INTEGER NOT NULL,

    CONSTRAINT pk_elenco
        PRIMARY KEY (
            id_campeonato,
            id_jogador
        ),

    CONSTRAINT fk_elenco_inscricao_time
        FOREIGN KEY (
            id_campeonato,
            id_time
        )
        REFERENCES inscricao_time (
            id_campeonato,
            id_time
        ),

    CONSTRAINT fk_elenco_jogador
        FOREIGN KEY (id_jogador)
        REFERENCES jogador (id_jogador),

    CONSTRAINT uk_elenco_numero_camisa
        UNIQUE (
            id_campeonato,
            id_time,
            numero_camisa
        ),

    CONSTRAINT ck_elenco_numero_camisa
        CHECK (
            numero_camisa >= 1
            AND numero_camisa <= 99
        )
);


-- =====================================================
-- Partidas dos campeonatos
-- =====================================================

CREATE TABLE partida (
    id_partida INTEGER,
    id_campeonato INTEGER NOT NULL,
    id_estadio INTEGER NOT NULL,
    id_time_mandante INTEGER NOT NULL,
    id_time_visitante INTEGER NOT NULL,
    rodada INTEGER NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    gols_mandante INTEGER,
    gols_visitante INTEGER,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT pk_partida
        PRIMARY KEY (id_partida),

    CONSTRAINT fk_partida_campeonato
        FOREIGN KEY (id_campeonato)
        REFERENCES campeonato (id_campeonato),

    CONSTRAINT fk_partida_estadio
        FOREIGN KEY (id_estadio)
        REFERENCES estadio (id_estadio),

    CONSTRAINT fk_partida_mandante
        FOREIGN KEY (
            id_campeonato,
            id_time_mandante
        )
        REFERENCES inscricao_time (
            id_campeonato,
            id_time
        ),

    CONSTRAINT fk_partida_visitante
        FOREIGN KEY (
            id_campeonato,
            id_time_visitante
        )
        REFERENCES inscricao_time (
            id_campeonato,
            id_time
        ),

    CONSTRAINT ck_partida_times_diferentes
        CHECK (
            id_time_mandante
            <> id_time_visitante
        ),

    CONSTRAINT ck_partida_rodada
        CHECK (rodada > 0),

    CONSTRAINT ck_partida_gols_mandante
        CHECK (
            gols_mandante IS NULL
            OR gols_mandante >= 0
        ),

    CONSTRAINT ck_partida_gols_visitante
        CHECK (
            gols_visitante IS NULL
            OR gols_visitante >= 0
        ),

    CONSTRAINT ck_partida_status
        CHECK (
            status IN (
                'agendada',
                'finalizada',
                'cancelada'
            )
        ),

    CONSTRAINT ck_partida_placar
        CHECK (
            (
                status = 'finalizada'
                AND gols_mandante IS NOT NULL
                AND gols_visitante IS NOT NULL
            )
            OR
            (
                status IN (
                    'agendada',
                    'cancelada'
                )
                AND gols_mandante IS NULL
                AND gols_visitante IS NULL
            )
        )
);


-- =====================================================
-- Gols registrados nas partidas
-- =====================================================

CREATE TABLE gol (
    id_gol INTEGER,
    id_partida INTEGER NOT NULL,
    id_jogador INTEGER NOT NULL,
    minuto INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL,

    CONSTRAINT pk_gol
        PRIMARY KEY (id_gol),

    CONSTRAINT fk_gol_partida
        FOREIGN KEY (id_partida)
        REFERENCES partida (id_partida),

    CONSTRAINT fk_gol_jogador
        FOREIGN KEY (id_jogador)
        REFERENCES jogador (id_jogador),

    CONSTRAINT ck_gol_minuto
        CHECK (minuto >= 0),

    CONSTRAINT ck_gol_tipo
        CHECK (
            tipo IN (
                'normal',
                'pênalti',
                'falta',
                'contra'
            )
        )
);