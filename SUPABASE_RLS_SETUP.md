# ⚠️ Configuração de RLS no Supabase - RESOLUÇÃO DO ERRO

## **O que causou o erro?**

> **Erro:** `new row violates row-level security policy`

Este erro significa que a tabela no Supabase tem políticas de segurança (RLS) muito restritivas que impedem inserções anônimas.

---

## **SOLUÇÃO - Passo a Passo**

### **PASSO 1: Acessar o Supabase Dashboard**

1. Acesse https://supabase.com
2. Faça login com sua conta
3. Selecione o projeto papamike-webapp
4. Vá para **SQL Editor**

---

### **PASSO 2: Criar a Tabela de Pedidos**

Execute este código SQL:

```sql
-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_client TEXT NOT NULL,
  estampa TEXT NOT NULL,
  produto TEXT NOT NULL,
  tamanho TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unit DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### **PASSO 3: Desabilitar RLS (Opção Rápida - Desenvolvimento)**

Se está em desenvolvimento e quer testar rápido:

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

⚠️ **NÃO recomendado para produção!**

---

### **PASSO 4: Configurar RLS com Política (Produção - Seguro)**

Se prefere usar RLS corretamente:

```sql
-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT para usuários anônimos
CREATE POLICY "Permitir inserção anônima" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Permitir SELECT para usuários anônimos  
CREATE POLICY "Permitir leitura anônima" ON orders
  FOR SELECT
  USING (true);

-- Permitir DELETE para usuários anônimos (opcional)
CREATE POLICY "Permitir exclusão anônima" ON orders
  FOR DELETE
  USING (true);
```

---

### **PASSO 5: Verificar no Dashboard**

1. Vá para **Authentication > Policies**
2. Selecione a tabela `orders`
3. Confirme que as políticas foram criadas
4. Se houver políticas antigas conflitantes, DELETE elas

---

### **PASSO 6: Testar no Seu App**

1. Acesse seu app em `http://localhost:3000` (ou seu servidor)
2. Tente enviar um pedido
3. Abra o **console do navegador** (F12)
4. Se tudo ok, verá a mensagem de sucesso ✅

---

## **Checklist de Verificação**

- [ ] Tabela `orders` criada no Supabase
- [ ] RLS está **desabilitado** OU políticas foram criadas
- [ ] Arquivo [list.js](js/list.js) atualizado com a função `saveOrdersToSupabase`
- [ ] Testou enviar um pedido via app
- [ ] Verificou no Supabase Dashboard → Table Editor que os dados foram salvos

---

## **Se Ainda Houver Erro**

### Verifique no console do navegador:

```javascript
// Abra F12 → Console → Cole isto:
console.log(SUPABASE_CLIENT);
console.log(SUPABASE_URL);
console.log(SUPABASE_ANON_KEY);
```

Todos os 3 devem estar **definidos**, não `undefined`.

### Limpe o cache:

```
Ctrl + Shift + Delete → Limpar cookies/cache
```

### Verifique as políticas no SQL:

```sql
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

---

## **Links Úteis**

- [Documentação de RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Políticas de Segurança - Tutorial](https://supabase.com/docs/guides/auth/row-level-security/examples)

