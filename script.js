// link e chave do Supabase
const SUPABASE_URL = 'https://nvnibcxzoswtclimqmzu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bmliY3h6b3N3dGNsaW1xbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MDczMzUsImV4cCI6MjA5Mjk4MzMzNX0.ZCtUg9qQvHwfP_8g382nrT7qynG6e3bOwjeFGirJb8I';

let idEdicao = null;

const form = document.querySelector('#meuForm');
const statusMsg = document.querySelector('#statusMsg');
const btnSalvar = document.querySelector('#btnSalvar');

//READ do CRUD

//Mostra os dados que estão armazenados na tabela produtos no banco
async function carregarRegistros() {
    const listaProdutos = document.querySelector('#listaProdutos');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/produtos?select=*&order=id.desc`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        const dados = await response.json();
        listaProdutos.innerHTML = '';

        dados.forEach(produto => {
            const div = document.createElement('div');
            div.className = 'produto-card';

            const statusBanco = produto.quantidade || '...';
            const corStatus = statusBanco <= 5 ? '#dc3545' : '#61a728';

            const quantidade = produto.quantidade || 0;
            const precoUni = produto.preco_unidade || 0

            div.innerHTML = `
                <div class="info">
                    <strong>${produto.nome}</strong><br>
                    <h4>Categoria: ${produto.categoria}</h4>
                    <span>Valor Total: R$${produto.valor_total.toFixed(2)}</span>
                    <span style="color: ${corStatus}; font-weight: bold; margin-left: 10px;">Estoque: ${statusBanco}</span>
                </div>
                <div class="acoes">
                    <button class="btn-editar" onclick="window.prepararEdicao(${produto.id}, '${produto.nome}', ${produto.quantidade}, ${produto.preco_unidade}, '${produto.categoria}')">Editar</button>
                    <button class="btn-excluir" onclick="window.excluirRegistro(${produto.id})">Excluir</button>
                </div>
            `;
            listaProdutos.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
}

//-----------------------------------------------------------------------------------------------------------------

// CREATE do CRUD

// Enviar dados do formulário para o banco, pega os dados do html
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.querySelector('#nomeProduto').value;
    const quantidade = parseFloat(document.querySelector('#quantidade').value) || 0;
    const precoUni = parseFloat(document.querySelector('#precoUni').value) || 0;
    const categoria = document.querySelector('#categoria').value;

    // Cálculo do valor total
    const valorTotal = quantidade * precoUni;

    const metodo = idEdicao ? 'PATCH' : 'POST';
    const url = idEdicao
        ? `${SUPABASE_URL}/rest/v1/produtos?id=eq.${idEdicao}`
        : `${SUPABASE_URL}/rest/v1/produtos`;

    statusMsg.textContent = "Processando...";

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                nome: nome,
                quantidade: quantidade,
                preco_unitario: precoUni,
                categoria: categoria,
                valor_total: valorTotal
            })
        });

        if (response.ok) {
            statusMsg.textContent = "Sucesso!";
            apagarCampos();
            carregarRegistros();
        } else {
            const erro = await response.json();
            statusMsg.textContent = "Erro: " + erro.message;
        }
    } catch (error) {
        statusMsg.textContent = "Erro de conexão.";
    }
});

//-------------------------------------------------------------------------------------------------------------

//UPDATE do CRUD

//Traz os dados do banco para o formulário e edita o botão do formulário para edição
window.prepararEdicao = function (id, nome, quantidade, preco_unidade, categoria) {
    idEdicao = id;
    document.querySelector('#nomeProduto').value = nome;
    document.querySelector('#quantidade').value = quantidade;
    document.querySelector('#precoUni').value = preco_unidade;
    document.querySelector('#categoria').value = categoria;

    btnSalvar.textContent = "Atualizar Dados";
    btnSalvar.style.backgroundColor = "#28a792"; 
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

//------------------------------------------------------------------------------------------------------------------

//DELETE do CRUD

//Deleta o produto selecionado da tabela de produtos no banco
window.excluirRegistro = async function (id) {
    if (!confirm("Deseja excluir este registro?")) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/produtos?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        carregarRegistros();
    } catch (e) { alert("Erro ao excluir"); }
};

window.apagarCampos = function () {
    form.reset();
    idEdicao = null;
    btnSalvar.textContent = "Calcular e Salvar";
    btnSalvar.style.backgroundColor = "";
    statusMsg.textContent = "☆*: .｡. o(≧▽≦)o .｡.:*☆";
};

carregarRegistros();