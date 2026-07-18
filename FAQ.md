# FAQ - Papa Mike Web App

## O que é este projeto?
Este projeto é um web app simples para criar pedidos de produtos personalizados, gerar uma planilha Excel com os itens selecionados e enviar o link da planilha para o WhatsApp da empresa.

## Como faço para inserir os dados do pedido?
1. Preencha o campo "Escrita da Estampa".
2. Selecione um produto.
3. Escolha o tamanho e a quantidade.
4. Clique em "ADICIONAR À LISTA".
5. Repita para todos os itens.

## Como funciona o envio da planilha?
Quando você clica em "GERAR PLANILHA E ENVIAR", o app:
- valida o telefone do cliente,
- gera a planilha Excel em memória,
- faz upload para o bucket `tabelas` do Supabase Storage,
- obtém um link público para o arquivo,
- abre o WhatsApp da empresa com a mensagem pronta e o link anexado.

## Qual é o formato correto do telefone do cliente?
O telefone deve conter 11 dígitos, no formato brasileiro: DDD + número. Exemplo: `51999999999`.

## Como o arquivo Excel é nomeado?
O arquivo é salvo no Supabase com o nome `tabela_<telefone>.xlsx`, onde `<telefone>` é o número informado pelo cliente sem formatação.

## O que preciso configurar no Supabase?
1. Crie um bucket de Storage chamado `tabelas`.
2. Marque o bucket como **Public**.
3. Garanta que as credenciais `SUPABASE_URL` e `SUPABASE_ANON_KEY` estejam corretas em `js/supabase-config.js`.

## O que preciso configurar no WhatsApp?
Atualize o valor de `WHATSAPP_NUMBER` em `js/list.js` com o número de atendimento da sua empresa, incluindo o código do país e DDD, por exemplo: `+5511999999999`.

## Posso usar Supabase no modo local?
Sim. Se `js/supabase-config.js` estiver vazio ou não definido, o app usa `localStorage` para salvar produtos localmente, mas a geração e o envio da planilha via Supabase não funcionarão.

## Posso apagar os arquivos antigos no bucket `tabelas`?
Sim. É recomendado configurar uma rotina para excluir arquivos mais antigos, para não consumir espaço desnecessário no seu plano gratuito.

## Onde posso editar a lista de produtos?
O projeto tem uma área administrativa acessível pelo botão de configurações. No painel admin, você pode adicionar e excluir produtos.

## Como faço para alterar a senha administrativa?
Abra o painel admin, vá para a aba "Segurança", e altere a senha usando o formulário disponível.

## O que fazer se o envio não funcionar?
1. Verifique as credenciais do Supabase.
2. Confirme se o bucket `tabelas` existe e é público.
3. Verifique se `WHATSAPP_NUMBER` está correto.
4. Veja se há erros no console do navegador.

## Existe um favicon no projeto?
Não necessariamente. Se quiser, adicione um arquivo `favicon.ico` na raiz do projeto para evitar erros 404 de ícone.
