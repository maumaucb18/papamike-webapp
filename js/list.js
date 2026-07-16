const ADMIN_PASS_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
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
    if (type === 'hidden') {
        status.textContent = '';
        status.className = 'hidden';
        return;
    }
    status.textContent = message;
    status.className = 'mb-4 text-sm ' + (type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-300' : 'text-gray-300');
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function setAdminModeHint() {
    const adminMode = document.getElementById('admin-mode');
    if (!adminMode) return;
    adminMode.textContent = usingSupabase ? 'Admin em modo Supabase: alterações salvam no banco.' : 'Admin em modo local: alterações salvam no localStorage.';
}

// --- Admin password storage helpers ---
function getStoredAdminHash() {
    return localStorage.getItem('admin_pass_hash') || ADMIN_PASS_HASH;
}

function setStoredAdminHash(hash) {
    localStorage.setItem('admin_pass_hash', hash);
}

async function changeAdminPassword() {
    const current = document.getElementById('current-pass').value.trim();
    const np = document.getElementById('new-pass').value.trim();
    const conf = document.getElementById('confirm-pass').value.trim();
    if (!current || !np || !conf) return alert('Preencha todos os campos.');
    if (np !== conf) return alert('Confirmação não confere.');
    const curHash = await sha256(current);
    const stored = getStoredAdminHash();
    if (curHash !== stored) return alert('Senha atual incorreta.');
    const newHash = await sha256(np);
    setStoredAdminHash(newHash);
    alert('Senha alterada com sucesso.');
    document.getElementById('current-pass').value='';
    document.getElementById('new-pass').value='';
    document.getElementById('confirm-pass').value='';
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

        if (products.length === 0) {
            setStatus('Tabela `products` vazia no Supabase.', 'info');
        } else {
            setStatus('', 'hidden');
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
    setStatus('', 'hidden');
    if (usingSupabase) {
        fetchProductsFromSupabase();
    } else {
        renderProducts();
        renderAdminList();
    }
    renderCart();

    const productsTab = document.getElementById('admin-tab-products');
    const securityTab = document.getElementById('admin-tab-security');
    if (productsTab && securityTab) {
        productsTab.addEventListener('click', () => activateAdminTab('products'));
        securityTab.addEventListener('click', () => activateAdminTab('security'));
    }
    // Sanitiza e limita o campo de telefone para 11 dígitos
    const phoneInput = document.getElementById('contact-phone');
    if (phoneInput) {
        phoneInput.setAttribute('maxlength', '11');
        phoneInput.setAttribute('inputmode', 'numeric');
        phoneInput.addEventListener('input', (e) => {
            const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
            if (e.target.value !== cleaned) e.target.value = cleaned;
        });
    }
}

// --- Gestão de Produtos (Admin) ---
async function loginAdmin() {
    const passInput = document.getElementById('admin-password');
    const error = document.getElementById('admin-login-error');
    if (!passInput || !error) return;

    const pass = passInput.value.trim();
    if (!pass) {
        error.textContent = 'Informe a senha administrativa.';
        error.classList.remove('hidden');
        return;
    }

    const hashed = await sha256(pass);
    const storedHash = getStoredAdminHash();
    if (hashed !== storedHash) {
        error.textContent = 'Senha incorreta!';
        error.classList.remove('hidden');
        passInput.value = '';
        return;
    }

    error.textContent = '';
    error.classList.add('hidden');
    passInput.value = '';
    document.getElementById('admin-login-pane').classList.add('hidden');
    document.getElementById('admin-content-pane').classList.remove('hidden');
    document.getElementById('modal-admin').classList.remove('hidden');
    setAdminModeHint();
    activateAdminTab('products');
    renderAdminList();
}

function activateAdminTab(tab) {
    const productsTab = document.getElementById('admin-tab-products');
    const securityTab = document.getElementById('admin-tab-security');
    const productsPanel = document.getElementById('admin-tab-products-panel');
    const securityPanel = document.getElementById('admin-tab-security-panel');
    if (!productsTab || !securityTab || !productsPanel || !securityPanel) return;

    const isProducts = tab === 'products';
    productsTab.classList.toggle('text-blue-500', isProducts);
    productsTab.classList.toggle('border-b-2', isProducts);
    productsTab.classList.toggle('border-blue-500', isProducts);
    productsTab.classList.toggle('text-gray-400', !isProducts);
    productsTab.classList.toggle('hover:text-white', !isProducts);
    productsTab.setAttribute('aria-selected', isProducts.toString());

    securityTab.classList.toggle('text-blue-500', !isProducts);
    securityTab.classList.toggle('border-b-2', !isProducts);
    securityTab.classList.toggle('border-blue-500', !isProducts);
    securityTab.classList.toggle('text-gray-400', isProducts);
    securityTab.classList.toggle('hover:text-white', isProducts);
    securityTab.setAttribute('aria-selected', (!isProducts).toString());

    productsPanel.classList.toggle('hidden', !isProducts);
    securityPanel.classList.toggle('hidden', isProducts);
}

function openAdmin() {
    document.getElementById('modal-admin').classList.remove('hidden');
    document.getElementById('admin-login-pane').classList.remove('hidden');
    document.getElementById('admin-content-pane').classList.add('hidden');
    document.getElementById('admin-login-error').classList.add('hidden');
}

function logoutAdmin() {
    document.getElementById('admin-login-pane').classList.remove('hidden');
    document.getElementById('admin-content-pane').classList.add('hidden');
    document.getElementById('modal-admin').classList.remove('hidden');
}

function closeAdmin() {
    document.getElementById('modal-admin').classList.add('hidden');
}

async function saveProduct() {
    const nameEl = document.getElementById('new-prod-name');
    const priceEl = document.getElementById('new-prod-price');
    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);
    if (!name || isNaN(price)) return alert("Dados inválidos");

    if (usingSupabase) {
        try {
            const created = await addProductToSupabase(name, price);
            products.push({ id: created.id, name: created.name, price: parseFloat(created.price) });
            setStatus('Produto adicionado com sucesso.', 'success');
        } catch (err) {
            alert('Erro ao adicionar no Supabase');
            console.error(err);
            setStatus(`Erro ao adicionar produto: ${err.message}`, 'error');
            return;
        }
    } else {
        products.push({ name, price });
        localStorage.setItem('products', JSON.stringify(products));
        setStatus('Produto adicionado ao localStorage.', 'success');
    }

    renderProducts();
    renderAdminList();
    nameEl.value = '';
    priceEl.value = '';
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
    if (!select) return;
    select.innerHTML = products.map(p => `<option value="${p.name}">${p.name} - R$ ${p.price.toFixed(2)}</option>`).join('');
}

function renderAdminList() {
    const list = document.getElementById('admin-prod-list');
    if (!list) return;
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
    if (!container) return;
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
    
    const totalEl = document.getElementById('total-price');
    if (totalEl) totalEl.textContent = `Total: R$ ${totalGeral.toFixed(2)}`;
}

// --- Envio e Excel ---
function preSendCheck() {
    const raw = document.getElementById('contact-phone').value;
    const phone = raw.replace(/\D/g, '');
    if (!phone || phone.length !== 11) return alert("Por favor, informe o telefone de contato com 11 dígitos.");
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
    const data = cart.map(item => ({
        "Escrita da Estampa": item.estampa,
        "Produto": item.produto,
        "Tamanho": item.tamanho,
        "Qtd": item.quantidade,
        "Vlr Unit": item.precoUnit.toFixed(2),
        "Subtotal": item.total.toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedido");

    const fileName = `Pedido_${clientPhone.replace(/\D/g,'')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    setTimeout(() => {
        const msg = encodeURIComponent(`Olá! Estou enviando meu pedido (Telefone: ${clientPhone}). A planilha com os detalhes foi gerada e baixada. Vou anexá-la a seguir.`);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    }, 1500);
}

init();
