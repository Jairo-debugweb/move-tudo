# Move Tudo 🚚

**Pequenos fretes e mudanças, sem complicação.**

O Move Tudo está sendo desenvolvido para aproximar pessoas que precisam transportar móveis, eletrodomésticos, caixas e itens de pequenas mudanças de profissionais que realizam fretes locais.

## Funcionalidades preparadas

- Página responsiva para celular e computador.
- Formulário de solicitação com origem, destino, distância, data e tipo de carga.
- Estimativa ilustrativa de preço (não é cotação real).
- Histórico local de pedidos no navegador.
- Interface de cadastro para clientes e motoristas.
- Login e cadastro via Supabase Auth, ativados depois da configuração do projeto.
- Estrutura SQL inicial para perfis, solicitações e propostas com Row Level Security (RLS).

## Configurar cadastro e login com Supabase

**A autenticação não funcionará até concluir estes passos.** O arquivo `supabase-config.js` contém valores de exemplo, não credenciais reais.

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No painel do projeto, abra as configurações da API e copie a **Project URL** e a **publishable key** (ou a chave pública anon legada, se for a opção disponível).
3. Edite `supabase-config.js` e substitua `https://SEU-PROJETO.supabase.co` pela Project URL e `SUA_CHAVE_PUBLICA_ANON` pela chave pública.
4. No painel do Supabase, abra **SQL Editor**, crie uma consulta e execute todo o conteúdo de `supabase/schema.sql`.
5. Em **Authentication → URL Configuration**, configure a URL principal do site publicado e adicione a URL do site à lista de redirecionamentos permitidos. Se o GitHub Pages ainda não estiver publicado, conclua essa configuração quando ele estiver disponível.
6. Publique as alterações e teste o cadastro com um e-mail seu. Se a confirmação de e-mail estiver habilitada, abra o e-mail de confirmação antes de tentar entrar.

### Segurança

- Use somente a chave pública/publishable no frontend. **Nunca** coloque a chave `service_role`, senha do banco ou segredos privados no GitHub.
- O banco usa políticas RLS para limitar perfis e solicitações.
- A seleção do perfil motorista ainda não comprova identidade, documentos, veículo ou seguro. A verificação dos profissionais precisa ser implementada antes do lançamento.
- Não use dados pessoais reais até que as configurações de segurança, privacidade e acesso estejam revisadas.
- Antes de um lançamento público, o esquema e as políticas precisam passar por revisão e testes de segurança.

## O que ainda não está conectado

- O formulário de frete ainda salva os pedidos apenas no navegador. Ele ainda não grava em `freight_requests`.
- O painel de motorista ainda não lista pedidos do banco nem envia propostas.
- Não existem ainda redefinição de senha personalizada, notificações, chat, mapas, pagamentos ou verificação de profissionais.
- A faixa de preço é demonstrativa; não representa pesquisa de mercado ou orçamento de um motorista.

## Testar a versão local

Abra `index.html` por um servidor web local ou publique com GitHub Pages. Para testar módulos JavaScript e autenticação, use um servidor HTTP/HTTPS; abrir o HTML diretamente por `file://` pode bloquear módulos.

## Estrutura

- `index.html` — página e formulários.
- `styles.css` — visual responsivo.
- `app.js` — estimativa ilustrativa e armazenamento local de pedidos.
- `auth.js` — interface de cadastro/login conectada ao Supabase quando configurado.
- `supabase-config.js` — URL e chave pública do Supabase.
- `supabase/schema.sql` — tabelas e políticas RLS.
- `manifest.webmanifest`, `sw.js`, `icons/` — suporte básico a instalação/offline.

## Próximas etapas

1. Configurar e testar Supabase Auth.
2. Conectar o formulário de pedidos ao banco compartilhado.
3. Criar o painel do motorista e o envio de propostas.
4. Permitir que o cliente compare e aceite uma proposta com regras seguras.
5. Testar em dispositivos reais e preparar o lançamento.

---

Projeto em desenvolvimento. Não está pronto para operação comercial nem para receber pagamentos.
