const ADMIN_PASS = "1234";
const WHATSAPP_NUMBER = "+5551991138469"; // COLOQUE O NUMERO DA EMPRESA AQUI

// Se existir, `js/supabase-config.js` pode definir SUPABASE_URL e SUPABASE_ANON_KEY.
// Caso não configure, o app usa localStorage como fallback.
let products = JSON.parse(localStorage.getItem('products')) || [
    { name: "Camiseta Algodão", price: 49.90 },
    { name: "Camiseta Dry Fit", price: 59.90 }
];

let cart = [];

const usingSupabase = typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL && typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY;

function setStatus(message, type = 'info') {
    const status = document.getElementById('supabase-status');
    if (!status) return;
    status.textContent = message;
    status.className = 'mb-4 text-sm ' + (type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-300' : 'text-gray-300');
}

function setDataSource(message) {
    const source = document.getElementById('data-source');
    if (!source) return;
    source.textContent = message;
}

function setAdminModeHint() {
    const adminMode = document.getElementById('admin-mode');
    if (!adminMode) return;
    adminMode.textContent = usingSupabase ? 'Admin em modo Supabase: alterações salvam no banco.' : 'Admin em modo local: alterações salvam no localStorage.';
}

function refreshProducts() {
    if (usingSupabase) {
        fetchProductsFromSupabase();
    } else {
        renderProducts();
        renderAdminList();
        setStatus('Atualizado a partir do localStorage.', 'success');
    }
}

async function fetchProductsFromSupabase() {
    setStatus('Conectando ao Supabase...');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`${res.status} ${res.statusText} - ${errorText}`);
        }

        const data = await res.json();
        products = data.map(p => ({ id: p.id, name: p.name, price: parseFloat(p.price) }));
        renderProducts();
        renderAdminList();

        if (products.length > 0) {
            setStatus(`Sucesso! ${products.length} produto(s) carregado(s) do Supabase.`, 'success');
        } else {
            setStatus('Conectado ao Supabase, mas não existem produtos na tabela `products`.', 'info');
        }
    } catch (err) {
        console.error('Supabase fetch error:', err);
        setStatus(`Erro ao conectar no Supabase: ${err.message}`, 'error');
        renderProducts();
        renderAdminList();
    }
}

async function addProductToSupabase(name, price) {
    const body = [{ name, price }];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}` ,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Failed to add product');
    const created = await res.json();
    return created[0];
}

async function deleteProductFromSupabase(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    if (!res.ok) throw new Error('Failed to delete product');
}

// --- Inicialização ---
function init() {
    setAdminModeHint();
    setDataSource(usingSupabase ? 'Dados vindos do Supabase.' : 'Dados vindos do localStorage.');
    if (usingSupabase) {
        fetchProductsFromSupabase();
    } else {
        renderProducts();
        renderAdminList();
    }
    renderCart();
}

        // --- Gestão de Produtos (Admin) ---
        function openAdmin() {
            const pass = prompt("Digite a senha administrativa:");
            if (pass === ADMIN_PASS) {
                document.getElementById('modal-admin').classList.remove('hidden');
                renderAdminList();
            } else {
                alert("Senha incorreta!");
            }
        }

        function closeAdmin() {
            document.getElementById('modal-admin').classList.add('hidden');
        }

async function saveProduct() {
    const name = document.getElementById('new-prod-name').value;
    const price = parseFloat(document.getElementById('new-prod-price').value);
    if (!name || isNaN(price)) return alert("Dados inválidos");

    if (usingSupabase) {
        try {
            const created = await addProductToSupabase(name, price);
            products.push({ id: created.id, name: created.name, price: parseFloat(created.price) });
        } catch (err) {
            alert('Erro ao adicionar no Supabase');
            console.error(err);
            return;
        }
    } else {
        products.push({ name, price });
        localStorage.setItem('products', JSON.stringify(products));
    }

    renderProducts();
    renderAdminList();
    document.getElementById('new-prod-name').value = '';
    document.getElementById('new-prod-price').value = '';
}

async function deleteProduct(index) {
    const prod = products[index];
    if (!prod) return;

    if (usingSupabase && prod.id) {
        try {
            await deleteProductFromSupabase(prod.id);
            products.splice(index, 1);
        } catch (err) {
            alert('Erro ao excluir no Supabase');
            console.error(err);
            return;
        }
    } else {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
    }

    renderProducts();
    renderAdminList();
}

function renderProducts() {
    const select = document.getElementById('select-product');
    select.innerHTML = products.map(p => `<option value="${p.name}">${p.name} - R$ ${p.price.toFixed(2)}</option>`).join('');
}

function renderAdminList() {
    const list = document.getElementById('admin-prod-list');
    list.innerHTML = products.map((p, i) => `
        <div class="flex justify-between py-1 border-b border-white/5">
            <span>${p.name} - R$ ${p.price.toFixed(2)}</span>
            <button onclick="deleteProduct(${i})" class="text-red-500">Excluir</button>
        </div>
    `).join('');
}

        // --- Carrinho / Lista ---
        function addToList() {
            const name = document.getElementById('input-name').value;
            const prodName = document.getElementById('select-product').value;
            const size = document.getElementById('select-size').value;
            const qty = parseInt(document.getElementById('input-qty').value);
            const product = products.find(p => p.name === prodName);

            if (!name) return alert("Preencha a escrita da estampa");

            cart.push({ 
                estampa: name, 
                produto: prodName, 
                tamanho: size, 
                quantidade: qty,
                precoUnit: product.price,
                total: product.price * qty
            });

            renderCart();
            document.getElementById('input-name').value = '';
        }

        function removeFromCart(index) {
            cart.splice(index, 1);
            renderCart();
        }

        function renderCart() {
            const container = document.getElementById('list-container');
            let totalGeral = 0;
            
            container.innerHTML = cart.map((item, i) => {
                totalGeral += item.total;
                return `
                <div class="bg-white/10 rounded-lg p-3 text-white flex justify-between items-center">
                    <div>
                        <p class="font-bold text-sm">${item.estampa}</p>
                        <p class="text-xs text-gray-300">${item.quantidade}x ${item.produto} (${item.tamanho})</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-bold">R$ ${item.total.toFixed(2)}</p>
                        <button onclick="removeFromCart(${i})" class="text-red-400 text-xs">Remover</button>
                    </div>
                </div>
            `}).join('');
            
            document.getElementById('total-price').textContent = `Total: R$ ${totalGeral.toFixed(2)}`;
        }

        // --- Envio e Excel ---
        function preSendCheck() {
            const phone = document.getElementById('contact-phone').value;
            if (!phone) return alert("Por favor, informe o telefone de contato.");
            if (cart.length === 0) return alert("Sua lista está vazia.");

            const confirmacao = confirm(
                "ATENÇÃO E CONFERÊNCIA:\n\n" +
                "Pedimos que confira com bastante atenção todas as informações do pedido, especialmente:\n" +
                "Nomes (ortografia e acentuação)\n" +
                "Tamanhos, quantidades e valores \n\n" +
                "Após a conferência e aprovação dos dados, o prazo de produção começará a contar somente a partir do pagamento de, no mínimo, 50% do valor total do pedido.\n\n" +
                "Qualquer ajuste deve ser informado antes da confirmação do pagamento, para evitar erros na produção."
            );

            if (confirmacao) {
                generateExcel(phone);
            }
        }

        function generateExcel(clientPhone) {
            // Preparar dados
            const data = cart.map(item => ({
                "Escrita da Estampa": item.estampa,
                "Produto": item.produto,
                "Tamanho": item.tamanho,
                "Qtd": item.quantidade,
                "Vlr Unit": item.precoUnit.toFixed(2),
                "Subtotal": item.total.toFixed(2)
            }));

            // Criar planilha
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Pedido");

            // Gerar arquivo e baixar
            const fileName = `Pedido_${clientPhone.replace(/\D/g,'')}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            // Abrir WhatsApp com aviso
            setTimeout(() => {
                const msg = encodeURIComponent(`Olá! Estou enviando meu pedido (Telefone: ${clientPhone}). A planilha com os detalhes foi gerada e baixada. Vou anexá-la a seguir.`);
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
            }, 1500);
        }

        init();