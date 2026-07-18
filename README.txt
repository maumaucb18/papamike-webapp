# Sistema de Pedidos PAPA MIKE 📋🦅

Web App dinâmico desenvolvido para automação, triagem e catalogação de pedidos e estampas de segurança. O sistema permite que o cliente monte sua lista de itens personalizados, gere automaticamente uma planilha Excel (.xlsx) hospedada em nuvem e compartilhe o link de acesso direto via WhatsApp com a central de atendimento da empresa.

## 🚀 Tecnologias Utilizadas

- **Front-end:** HTML5, CSS3, JavaScript Avançado (ES6+)
- **Hospedagem & Deploy:** [Vercel](https://vercel.com) (Arquitetura Serverless de alta performance)
- **Banco de Dados & Storage:** [Supabase](https://supabase.com) (Hospedagem em nuvem dos arquivos gerados)
- **Manipulação de Planilhas:** [SheetJS (XLSX)](https://sheetjs.com) (Geração dinâmica de arquivos Excel em tempo de execução)
- **Integração de Comunicação:** WhatsApp Web Link API (`wa.me`)

## 🛠️ Arquitetura do Fluxo de Envio

1. **Entrada de Dados:** O usuário seleciona o produto, tamanho (P ao G2), quantidade e insere o texto da estampa.
2. **Processamento Local:** Ao clicar em "GERAR PLANILHA E ENVIAR", o JavaScript compila a lista dinâmica em memória do navegador.
3. **Persistência em Nuvem:** O arquivo é convertido em `Blob` e enviado diretamente para o bucket público do **Supabase Storage**.
4. **Redirecionamento:** O Supabase retorna a URL pública do arquivo e o Web App redireciona o cliente para o WhatsApp da empresa com o link encurtado pronto para envio.

---

## ⚖️ Direitos Autorais e Propriedade Intelectual

**Copyright © 2026 PAPA MIKE. Todos os direitos reservados.**

Todo o código-fonte, interface de usuário (UI/UX), fluxo lógico de automação via Supabase/WhatsApp, logotipos, marcas e scripts contidos neste repositório e hospedados no domínio `papamike-webapp.vercel.app` são de propriedade intelectual exclusiva da **PAPA MIKE**.

### Termos de Uso do Código:
- **Proibida a reprodução:** É estritamente proibida a cópia, duplicação, distribuição ou comercialização deste software (ou partes do seu código) sem autorização prévia por escrito da administração da PAPA MIKE.
- **Uso Comercial Interno:** O software foi projetado e licenciado exclusivamente para a operação comercial interna da empresa detentora da marca.
- **Infrações:** A engenharia reversa do sistema ou uso indevido da API do Supabase atrelada a este projeto resultará na revogação imediata dos acessos e estará sujeita às sanções legais cabíveis sob as leis de proteção de propriedade intelectual e direitos autorais de software.

