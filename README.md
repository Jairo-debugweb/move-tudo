# Move Tudo 🚚

**Pequenos fretes e mudanças, sem complicação.**

O Move Tudo é uma plataforma em construção para aproximar pessoas que precisam transportar móveis, eletrodomésticos, caixas e itens de pequenas mudanças de profissionais que realizam fretes locais.

## Problema que queremos resolver

Encontrar alguém para levar um único móvel ou fazer uma pequena mudança ainda pode exigir procurar indicações pessoalmente. A proposta é facilitar a solicitação, organizar os detalhes do transporte e, nas próximas etapas, ajudar o cliente a encontrar profissionais disponíveis.

## O que existe nesta primeira versão

- Página inicial responsiva para celular e computador.
- Explicação de como a plataforma deverá funcionar.
- Formulário para registrar tipo de carga, origem, destino, data e contato.
- Lista dos pedidos guardados localmente no navegador.
- Validação básica de campos e escape de texto exibido na página.

## Como testar

1. Abra `index.html` no navegador ou publique o repositório com o GitHub Pages.
2. Vá até **Pedir frete** e preencha o formulário.
3. Salve o pedido e confira a seção **Seus pedidos**.

## Limitações importantes

Esta etapa é somente um protótipo de interface com armazenamento local no navegador. Os pedidos **não** são enviados para uma central nem ficam disponíveis em outros celulares. Ainda não existem cadastro/login, banco de dados, localização em mapa, notificações, chat, pagamentos, verificação de profissionais ou cotações automáticas. Não use dados pessoais reais neste protótipo.

## Próximas etapas sugeridas

1. Definir o fluxo do cliente e do profissional de frete.
2. Implementar backend e banco de dados com regras de acesso.
3. Criar cadastro, autenticação e perfis de usuários.
4. Fazer o pedido chegar aos profissionais e permitir propostas de preço.
5. Adicionar acompanhamento do pedido, avaliações e mecanismos de segurança.
6. Testar em celulares e preparar a publicação.

## Estrutura

- `index.html` — estrutura e conteúdo da página.
- `styles.css` — visual e layout responsivo.
- `app.js` — validação do formulário e armazenamento local.
- `.gitignore` — arquivos locais que não devem ser versionados.

## Privacidade e segurança

Não inclua senhas, tokens, chaves privadas ou credenciais no repositório. Antes de lançar o serviço, será necessário definir como os dados de contato e os endereços serão armazenados, protegidos e apagados.

---

Projeto em fase inicial. O objetivo é evoluir por etapas, validando a experiência antes de conectar serviços reais.
