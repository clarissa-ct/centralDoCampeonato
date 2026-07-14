# Central do Campeonato

Sistema web para gerenciamento de campeonatos de futebol, desenvolvido como projeto prático da disciplina de Banco de Dados.

O sistema permite cadastrar campeonatos, times, jogadores, estádios, inscrições, elencos, partidas e gols. Também permite registrar resultados e consultar a classificação e a artilharia dos campeonatos.

## Funcionalidades

O sistema possui as seguintes funcionalidades:

- cadastro e listagem de campeonatos;
- cadastro e listagem de times;
- cadastro e listagem de jogadores;
- cadastro e listagem de estádios;
- inscrição de times em campeonatos;
- formação dos elencos;
- cadastro de partidas;
- registro dos resultados;
- registro dos gols;
- consulta da classificação;
- consulta da artilharia.

## Tecnologias utilizadas

- Node.js;
- Express;
- EJS;
- PostgreSQL;
- HTML;
- CSS;
- JavaScript;
- pacote `pg` para conexão com o PostgreSQL;
- pacote `dotenv` para leitura das variáveis de ambiente;
- Nodemon para execução durante o desenvolvimento.

## Banco de dados

O banco de dados utilizado pelo sistema se chama:

```text
futgestor
```

Os scripts SQL estão localizados na pasta:

```text
sql/
```

Os arquivos devem ser executados nesta ordem:

```text
00_limpeza.sql
01_criacao.sql
02_povoamento.sql
03_consultas.sql
```

### `00_limpeza.sql`

Remove as tabelas existentes na ordem correta das dependências.

Esse arquivo deve ser executado quando for necessário reconstruir o banco de dados do zero.

### `01_criacao.sql`

Cria as tabelas, chaves primárias, chaves estrangeiras, restrições de unicidade e restrições `CHECK`.

### `02_povoamento.sql`

Insere os dados utilizados para testes e demonstração do sistema.

### `03_consultas.sql`

Contém as principais consultas utilizadas no projeto, incluindo:

- listagem de campeonatos;
- listagem de times;
- listagem de jogadores;
- times inscritos;
- elencos;
- partidas;
- gols;
- artilharia;
- classificação.

## Modelo de dados

O sistema possui oito tabelas:

```text
campeonato
time
jogador
estadio
inscricao_time
elenco
partida
gol
```

### Campeonato

Armazena as informações dos campeonatos:

- identificador;
- nome;
- ano;
- data de início;
- data de término;
- status.

### Time

Armazena os times cadastrados:

- identificador;
- nome;
- cidade;
- estado.

### Jogador

Armazena os jogadores:

- identificador;
- nome;
- data de nascimento;
- posição.

### Estádio

Armazena os locais das partidas:

- identificador;
- nome;
- cidade;
- capacidade.

### Inscrição de time

Relaciona os times aos campeonatos dos quais participam.

A chave primária é composta por:

```text
id_campeonato
id_time
```

### Elenco

Relaciona campeonato, time e jogador.

Também armazena o número da camisa do jogador naquele campeonato.

### Partida

Armazena:

- campeonato;
- estádio;
- time mandante;
- time visitante;
- rodada;
- data e horário;
- placar;
- status.

### Gol

Armazena:

- partida;
- jogador;
- minuto;
- tipo do gol.

## Principais relacionamentos

- um campeonato pode possuir vários times inscritos;
- um time pode participar de vários campeonatos;
- um campeonato pode possuir várias partidas;
- um time pode disputar várias partidas;
- uma partida possui um time mandante e um time visitante;
- uma partida ocorre em um estádio;
- um jogador pode participar de um elenco;
- um jogador pode marcar vários gols;
- uma partida pode possuir vários gols registrados.

## Regras implementadas

O banco de dados e a aplicação possuem validações para garantir a consistência dos dados.

As principais regras são:

- um campeonato não pode possuir o mesmo nome e ano de outro campeonato;
- a data de término não pode ser anterior à data de início;
- o estado do time deve possuir duas letras;
- a capacidade do estádio deve ser maior que zero;
- um time não pode ser inscrito duas vezes no mesmo campeonato;
- um jogador não pode pertencer a dois times no mesmo campeonato;
- dois jogadores do mesmo elenco não podem utilizar o mesmo número de camisa;
- o número da camisa deve estar entre 1 e 99;
- o time mandante deve ser diferente do time visitante;
- os dois times de uma partida devem estar inscritos no campeonato;
- a rodada deve ser maior que zero;
- os gols não podem possuir valores negativos;
- partidas agendadas ou canceladas não possuem placar;
- partidas finalizadas devem possuir placar;
- somente partidas finalizadas podem receber registros de gols;
- o jogador selecionado para um gol deve pertencer a um dos times da partida;
- a quantidade de gols registrados não pode ultrapassar o placar da partida;
- gols contra não são contabilizados na artilharia.

## Pontuação da classificação

A classificação utiliza as seguintes regras:

```text
Vitória: 3 pontos
Empate: 1 ponto
Derrota: 0 pontos
```

Os critérios de ordenação são:

1. maior quantidade de pontos;
2. maior saldo de gols;
3. maior quantidade de gols marcados;
4. nome do time.

A aplicação recupera os times inscritos e as partidas finalizadas por meio de consultas SQL.

Depois, o JavaScript calcula:

- jogos;
- vitórias;
- empates;
- derrotas;
- gols pró;
- gols contra;
- saldo de gols;
- pontos.

O arquivo `sql/03_consultas.sql` também possui uma consulta completa de classificação utilizando `UNION ALL`, `SUM`, `GROUP BY` e `ORDER BY`.

## Artilharia

A artilharia é calculada no PostgreSQL.

A consulta utiliza:

- `COUNT`;
- `GROUP BY`;
- `ORDER BY`;
- relacionamentos entre as tabelas na cláusula `WHERE`.

Os gols do tipo `contra` não são contabilizados.

## Identificadores

Os identificadores das tabelas principais são do tipo `INTEGER`.

Nos dados de povoamento, os identificadores são informados diretamente nos comandos `INSERT`.

Nos cadastros realizados pela aplicação, o próximo identificador é obtido por meio da função `MAX`.

Exemplo:

```sql
SELECT
    MAX(id_time) AS maior_id
FROM time;
```

A aplicação soma uma unidade ao maior identificador encontrado e executa o novo cadastro:

```sql
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
);
```

Esse procedimento também é utilizado para:

- campeonatos;
- jogadores;
- estádios;
- partidas;
- gols.

As tabelas `inscricao_time` e `elenco` utilizam chaves compostas e, por isso, não precisam gerar um identificador isolado.

## Acesso ao banco de dados

A aplicação utiliza o pacote `pg` para se conectar ao PostgreSQL.

Os comandos SQL estão escritos diretamente nos arquivos da pasta:

```text
routes/
```

Não foi utilizado ORM.

Os valores recebidos dos formulários são enviados separadamente por meio de parâmetros:

```javascript
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
        nome,
        cidade,
        capacidade
    ]
);
```

Os parâmetros `$1`, `$2`, `$3` e `$4` são substituídos pelo pacote `pg`.

Dessa forma, os valores não são concatenados diretamente no comando SQL.

## Pré-requisitos

Para executar o projeto, é necessário possuir:

- Node.js;
- npm;
- PostgreSQL;
- pgAdmin ou outro programa para executar os scripts SQL.

## Configuração do projeto

### 1. Instalar as dependências

Abra o terminal dentro da pasta do projeto e execute:

```bash
npm install
```

### 2. Criar o banco de dados

No PostgreSQL ou pgAdmin, crie um banco chamado:

```text
futgestor
```

### 3. Executar os scripts SQL

No Query Tool do pgAdmin, execute os arquivos nesta ordem:

```text
sql/00_limpeza.sql
sql/01_criacao.sql
sql/02_povoamento.sql
```

O arquivo `00_limpeza.sql` só deve ser executado quando as tabelas já existirem e for necessário reconstruir o banco.

O arquivo `03_consultas.sql` pode ser utilizado para testar as consultas do projeto.

É recomendado executar uma consulta por vez.

### 4. Configurar as variáveis de ambiente

Na raiz do projeto, crie um arquivo chamado:

```text
.env
```

Utilize o arquivo `.env.example` como modelo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=SUA_SENHA
DB_NAME=futgestor
PORT=3000
```

Substitua:

```text
SUA_SENHA
```

pela senha configurada no PostgreSQL.

O arquivo `.env` não deve ser compartilhado, pois contém a senha do banco de dados.

### 5. Executar o sistema

Para executar normalmente:

```bash
npm start
```

Para executar durante o desenvolvimento:

```bash
npm run dev
```

Depois, acesse:

```text
http://localhost:3000
```

## Páginas do sistema

### Página inicial

```text
http://localhost:3000
```

### Campeonatos

```text
http://localhost:3000/campeonatos
```

### Times

```text
http://localhost:3000/times
```

### Jogadores

```text
http://localhost:3000/jogadores
```

### Estádios

```text
http://localhost:3000/estadios
```

### Inscrições

```text
http://localhost:3000/inscricoes
```

### Elencos

```text
http://localhost:3000/elencos
```

### Partidas

```text
http://localhost:3000/partidas
```

### Gols

```text
http://localhost:3000/gols
```

### Classificação e artilharia

```text
http://localhost:3000/consultas
```

## Estrutura do projeto

```text
futgestor/
├── config/
│   └── database.js
│
├── documentacao/
│   ├── diagramas/
│   │   ├── diagrama_conceitual_futgestor.drawio
│   │   ├── diagrama_conceitual_futgestor.pdf
│   │   └── diagrama_conceitual_futgestor.png
│   ├── checklist_demonstracao.md
│   ├── etapa1.md
│   ├── etapa3_modelo_logico.md
│   └── roteiro_apresentacao.md
│
├── public/
│   └── css/
│       └── style.css
│
├── routes/
│   ├── campeonatos.js
│   ├── consultas.js
│   ├── elencos.js
│   ├── estadios.js
│   ├── gols.js
│   ├── inscricoes.js
│   ├── jogadores.js
│   ├── partidas.js
│   └── times.js
│
├── sql/
│   ├── 00_limpeza.sql
│   ├── 01_criacao.sql
│   ├── 02_povoamento.sql
│   └── 03_consultas.sql
│
├── views/
│   ├── campeonatos/
│   ├── consultas/
│   ├── elencos/
│   ├── estadios/
│   ├── gols/
│   ├── inscricoes/
│   ├── jogadores/
│   ├── partidas/
│   ├── times/
│   └── index.ejs
│
├── .env.example
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
└── README.md
```

## Dados de demonstração

O arquivo `02_povoamento.sql` insere:

| Tabela | Quantidade |
|---|---:|
| campeonato | 1 |
| time | 4 |
| jogador | 12 |
| estadio | 2 |
| inscricao_time | 4 |
| elenco | 12 |
| partida | 6 |
| gol | 11 |

Esses dados permitem demonstrar:

- listagens;
- relacionamentos;
- partidas finalizadas e agendadas;
- resultados;
- gols;
- classificação;
- artilharia.

## Reconstrução do banco

Para reconstruir o banco:

1. execute `00_limpeza.sql`;
2. execute `01_criacao.sql`;
3. execute `02_povoamento.sql`;
4. inicie a aplicação;
5. acesse `http://localhost:3000`.

## Entrega do projeto

A pasta de entrega deve conter:

```text
config/
documentacao/
public/
routes/
sql/
views/
.env.example
.gitignore
app.js
package.json
package-lock.json
README.md
```

Não devem ser entregues:

```text
.env
node_modules/
.git/
```

As dependências podem ser instaladas novamente por meio do comando:

```bash
npm install
```

## Autor

Projeto desenvolvido por Clarissa para a disciplina de Banco de Dados.