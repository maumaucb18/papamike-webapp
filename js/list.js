const ADMIN_PASS = "1234";
        const WHATSAPP_NUMBER = "+5551991138469"; // COLOQUE O NUMERO DA EMPRESA AQUI
        
        let products = JSON.parse(localStorage.getItem('products')) || [
            { name: "Camiseta Algodão", price: 49.90 },
            { name: "Camiseta Dry Fit", price: 59.90 }
        ];
        
        let cart = [];

        // --- Inicialização ---
        function init() {
            renderProducts();
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

        function saveProduct() {
            const name = document.getElementById('new-prod-name').value;
            const price = parseFloat(document.getElementById('new-prod-price').value);
            if (!name || isNaN(price)) return alert("Dados inválidos");
            
            products.push({ name, price });
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts();
            renderAdminList();
            document.getElementById('new-prod-name').value = '';
            document.getElementById('new-prod-price').value = '';
        }

        function deleteProduct(index) {
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
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
                    <span>${p.name}</span>
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