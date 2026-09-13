o arquivo .gitignore armazena os nomes do que deve ser IGNORADO pelo github, de maneira que esses itens não serão inclusos nos commits.

# POR QUE?

node_modules/ é a pasta gerada quando rodamos o comando <b>npm install</b>, pra instalar as dependências do node. É uma pasta <b> ENORME</b>, e o envio dela ao github causaria problemas no repositório.

já o .env, são dados sigilosos do usuário, podendo conter senhas, emails. Mas, no nosso caso, seria a configuração de usuário do banco, o localhost, o root, a senha e o nome do banco. Então as configurações dos nossos computadores não serão enviadas ao Github, para não possivelmente comprometer a nossa privacidade.
