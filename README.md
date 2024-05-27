# Projeto Back End API de Perguntas, Respostas e Comentários

Aqui está o README para o projeto de back-end de uma API de perguntas e respostas com comentários. O projeto é construído com Nest.js como framework principal, usando Prisma como ORM para interagir com o banco de dados PostgreSQL. Todo o código é desenvolvido em TypeScript para garantir um desenvolvimento mais seguro e eficiente. <br /><br />
### Tecnologias Utilizadas:
  - Framework: Nest.js
  - ORM: Prisma
  - Linguagem: TypeScript
  - Banco de Dados: PostgreSQL
  - Autenticação: JWT (JSON Web Tokens)
  - Containerização: Docker
  - Validação de Dados: Zod
  - Testes Automatizados: Vitest
  - Armazenamento de Arquivos: AWS S3 API, integrada com Cloudflare R2

<br /><br />
## Descrição
- Na nossa aplicação, você poderá participar de uma plataforma de perguntas e respostas, onde poderá criar, responder e discutir sobre diversos temas. Com a opção de incluir arquivos para contextualizar suas perguntas, editar e gerenciar suas respostas, além de interagir através de comentários, promovendo uma troca de conhecimento dinâmica e colaborativa entre os usuários.


<br /><br />
## Possibilidades de Uso
- Criação de Perguntas e Respostas: Os usuários podem criar novas perguntas sobre uma variedade de tópicos e também responder às perguntas de outros usuários, promovendo a troca de conhecimento e experiências.

- Inclusão de Arquivos: Os usuários têm a opção de incluir arquivos relevantes, como imagens ou documentos, ao criar suas perguntas, fornecendo mais contexto e facilitando a compreensão por parte dos outros usuários.

- Edição e Gerenciamento de Conteúdo: Os usuários podem editar suas próprias perguntas e respostas, bem como gerenciar suas contribuições, garantindo a precisão e relevância do conteúdo na plataforma.

- Comentários e Discussões: Cada pergunta e resposta possui uma seção de comentários, permitindo aos usuários discutir e esclarecer aspectos adicionais sobre o tema abordado, promovendo debates construtivos e troca de ideias.

- Seleção da Melhor Resposta: Os autores das perguntas têm a opção de selecionar a melhor resposta entre as respostas recebidas, ajudando outros usuários a encontrar a solução mais eficaz para seus problemas.

- Gerenciamento de Conteúdo: Os usuários podem remover suas próprias perguntas e respostas, garantindo a qualidade e relevância do conteúdo disponível na plataforma.

- Contas de Usuário: Os usuários podem criar contas personalizadas para acessar todas as funcionalidades da plataforma de forma integrada e personalizada.


<br /><br />
## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env

`DATABASE_URL` - *URL utilizada para se conectar com o banco de dados.*

`JWT_PRIVATE_KEY` - *Esta chave é usada para assinar os tokens JWT no lado do servidor.*

`JWT_PUBLIC_KEY` - *Esta chave é usada pelo lado cliente ou outros serviços que desejam validar tokens JWT assinados pelo servidor.*

`CLOUDFLARE_ACC_ID`- *Consiste no ID da conta do Cloudflare utilizado pela API do AWS S3 para se conectar ao banco de Upload*

`AWS_BUCKET_NAME` - *Consiste no nome do bucket onde seu cloudflare R2 foi configurado*

`AWS_ACCESS_KEY_ID` - *Consiste no ID do bucket onde seu cloudflare R2 foi configurado*

`AWS_SECRET_ACCESS_KEY` - *Consiste no Token da API de acesso do bucket onde seu cloudflare R2 foi configurado*


<br /><br />
## Instalação

#### Versões necessárias: 
- Node: 20.12.1
- Docker: 26.1.1
- Docker-Compose: 2.24.6
 
<br /><br />
#### Passo a Passo: *(Com docker)*
```bash
  git clone https://github.com/arthu0x07/node-emr.git

  npm install
  
  docker build -t node-emr-backend:latest . --no-cache
  
  docker run -p 3000:3000 --env-file .env -d node-emr-backend:latest

  docker-compose up

  * Após executar 'docker-compose up' se atente aos logs para conferir se a aplicação executou corretamente *

```
<br />

#### Passo a Passo: *(Desenvolvimento)*

```bash
  git clone https://github.com/arthu0x07/node-emr.git

  npm install

  npx prisma migrate dev

  npm run start:dev

  * Lembre-se de rodar e configurar o banco de dados *

```

<br /><br />
## Rodando os testes

Para rodar os testes, faça o processo de instalação do projeto e rode o seguinte comando:

```bash

  npm run test:e2e
```

<br /><br />
## Funcionalides

- Utilização de JWT para autenticação.

- Senhas armazenadas em Hashs MD5 no banco de dados.

- EsLint e Prettier para melhor organização e padronização do projeto.

- Containerização com Docker para facilitar a execução da aplicação.

- Upload de arquivos com Cloudflare R2 e API do AWS S3.

- Persistência em banco de dados utilizando volumes.

- Banco de dados separados para execução dos testes.

- Criação, edição, remoção e listagem de 6 entidades diferentes.


<br /><br />
## Relacionamentos

#### 1xN (Um para Muitos):

  - Um usuário pode ter várias respostas (User -> Answer)
  - Uma pergunta pode ter várias respostas (Question -> Answer)
  - Uma pergunta pode ter vários comentários (Question -> Comment)
  - Uma resposta pode ter vários comentários (Answer -> Comment)
  - Um usuário pode ter vários comentários (User -> Comment)
  - Uma pergunta pode ter vários anexos (Question -> Attachment)
  - Uma resposta pode ter vários anexos (Answer -> Attachment)

> .
#### 1x1 (Um para Um):

  - Uma pergunta pode ter uma melhor resposta (Question -> Answer, bestAnswer)
  - Um comentário pode estar associado a uma pergunta (Comment -> Question)
  - Um comentário pode estar associado a uma resposta (Comment -> Answer)
  - Um anexo pode estar associado a uma pergunta (Attachment -> Question)
  - Um anexo pode estar associado a uma resposta (Attachment -> Answer)
  - 
> .
#### N para N (Muitos para Muitos):

- Uma pergunta pode ter várias tags e uma tag pode estar associada a várias perguntas (Question <-> Tag)

<br /><br />
## Deploy
*in comming...*

