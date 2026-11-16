CIRCUS GOURMET — AJUSTES CONFORME ESPECIFICACAO DE REQUISITOS
==========================================================
Base: frontend atualizado com TabelaGenerica e backend(10).zip.

ANTES DE APLICAR
1. Faça copia de seguranca de seu projeto e do banco MySQL.
2. Confira com 'git status' se nao ha outro merge em andamento.
3. Nao substitua pastas inteiras de outros modulos.

BANCO
Execute migracoes/atualizacao_requisitos_servico.sql UMA VEZ no banco buffet_eventos
ANTES de iniciar o backend atualizado. Nao use DROP DATABASE.
Adiciona em Servico:
 - preco_mao_obra DECIMAL(5,2) UNSIGNED NULL
 - visivel BOOLEAN NOT NULL DEFAULT TRUE
Se as colunas ja existirem, nao execute novamente.

ARQUIVOS
Copie o conteudo de 'frontend' e 'backend' para as pastas homonimas
na raiz de seu projeto.

ALTERACOES
- Servico RF001-003: preco da mao de obra, visibilidade (padrao ativo),
  edicao e consulta, mantidos os vinculos existentes.
- Evento RF009-012: cidade obrigatoria, exibicao de taxa por cidade,
  ID na tabela, horarios que atravessam meia-noite e verificacao de conflito.
- Insumo RF017-020: pesquisa por nome ou custo unitario, limites de
  nome e custo no formulario/validacao, mantendo CRUD.
- backend/server.js: remove marcadores de conflito do ZIP fornecido e
  registra Cliente, Insumo, Servico, Carrinho, Orcamento, Evento.

LIMITACOES IMPORTANTES
- Visao de calendario RF009 e disponibilidade real de carrinhos ainda
  NAO foram implementadas. Exigem interface/associacao Evento-Carrinho.
- A taxa de deslocamento e exibida a partir da cidade cadastrada,
  nao pode ser informada livremente no formulario de Evento.
- O codigo nao foi testado com MySQL real nem em build completo.
- A migracao foi escrita para a tabela Servico do create.sql enviado.
- Quando houver registros anteriores sem cidade vinculada, edite-os
  para escolher uma cidade; o campo nao foi convertido para NOT NULL
  no banco para nao invalidar registros antigos.

NAO ALTERA BRANCHES REMOTAS. Nao ha nenhum comando git push incluso.
