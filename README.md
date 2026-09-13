# Como funciona a estruturação?

## Na pasta de <b> Back-end:</b>

Ficam o Node, o Express e o acesso ao banco.

routes/: define as URLs da API
controllers/: recebe a requisição e devolve a resposta
models/: dados e tabela
services/: regras de negócio
database/: conexão e configuração do banco

o arquivo .js que inicia o servidor deve ficar fora dessas pastas

## Na pasta de <b>Front-end:</b>

Fica o React.

components/: componentes reutilizáveis como Navbar, Tabela, Button
pages/: telas do sistema, como Home, Login, etc.
services/: comunicação com a API do backend
assets/: imagens, ícones, etc.

## Na pasta de <b>database:</b>

ficam o create.sql e o insert.sql

## No caso da primeira Sprint:

Faremos apenas o CRUD dos módulos Cliente e Insumo

então, dentro da pasta controller no backend, ficariam arquivos como:

    clienteController.js
    insumoController.js

Na pasta models:

    clienteModel.js
    insumoModel.js

Na routes:

    clienteRoutes.js
    insumoRoutes.js

Na database(do backend):

    connection.js

Já na parte de frontend, ficam nos componentes a Navbar.jsx e etc, nas pages: home.jsx, clientes.jsx, produtos.jsx

E, na pasta services:

    clienteService.js
    produtoService.js

