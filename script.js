        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { initializeFirestore, persistentLocalCache, collection, onSnapshot, setDoc, deleteDoc, getDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // CONFIGURAÇÃO FIREBASE
        const firebaseConfig = {
            apiKey: "AIzaSyCQ_MSZ1sIli8PRda5bQVYMKwgmHJLtKwA",
            authDomain: "gestao-leitos.firebaseapp.com",
            projectId: "gestao-leitos",
            storageBucket: "gestao-leitos.firebasestorage.app",
            messagingSenderId: "594249273990",
            appId: "1:594249273990:web:6c601f868ad9b0a4157707"
        };

        const appId = "gestao-leitos-web";
        let db, auth, userId;
        let units = [];
        let chartInstances = {};

        // Templates de unidades pré-cadastradas
        const templatesUnidades = {
            // SPAs - agora com estrutura de sub-leitos
            "spa-alvorada": { nome: "SPA ALVORADA", categoria: "SPA" },
            "spa-coroado": { nome: "SPA COROADO", categoria: "SPA" },
            "spa-zona-sul": { nome: "SPA ZONA SUL", categoria: "SPA" },
            "spa-eliameme": { nome: "SPA ELIAMEME RODRIGUES MADY", categoria: "SPA" },
            "spa-joventina": { nome: "SPA JOVENTINA DIAS", categoria: "SPA" },
            "spa-chapot": { nome: "SPA CHAPOT PREVOST", categoria: "SPA" },
            "spa-jose-lins": { nome: "SPA JOSE LINS", categoria: "SPA" },
            "spa-danilo": { nome: "SPA DANILO CORREA", categoria: "SPA" },
            "spa-sao-raimundo": { nome: "SPA SÃO RAIMUNDO", categoria: "SPA" },

            // Fundações - com tipos CNES pré-definidos
            "fundacao-hemoam": {
                nome: "FUNDAÇÃO HEMOAM",
                categoria: "Fundação",
                tiposLeitos: ["ESPEC - CLINICO", "PEDIATRICO", "HOSPITAL DIA", "COMPLEMENTAR", "ESPEC - CIRURGICO"]
            },
            "fuham": {
                nome: "FUHAM",
                categoria: "Fundação",
                tiposLeitos: ["HOSPITAL DIA"]
            },
            "fundacao-adriano-jorge": {
                nome: "FUNDAÇÃO HOSPITAL ADRIANO JORGE",
                categoria: "Fundação",
                tiposLeitos: ["HOSPITAL DIA", "ESPEC - CIRURGICO", "OUTRAS ESPECIALIDADES", "COMPLEMENTAR", "ESPEC - CLINICO"]
            },
            "fundacao-medicina-tropical": {
                nome: "FUNDAÇÃO DE MEDICINA TROPICAL",
                categoria: "Fundação",
                tiposLeitos: ["COMPLEMENTAR", "PEDIATRICO", "ESPEC - CLINICO", "OUTRAS ESPECIALIDADES", "HOSPITAL DIA"]
            },

            // Maternidades - com tipos CNES pré-definidos
            "maternidade-antenor-barbosa": {
                nome: "Maternidade Antenor Barbosa",
                categoria: "Maternidade",
                tiposLeitos: ["OBSTETRICO", "PEDIATRICO", "COMPLEMENTAR", "ESPEC - CIRURGICO"]
            },
            "maternidade-ana-braga": {
                nome: "Maternidade Ana Braga",
                categoria: "Maternidade",
                tiposLeitos: ["OBSTETRICO", "ESPEC - CLINICO", "COMPLEMENTAR", "ESPEC - CIRURGICO"]
            },
            "maternidade-azilda-marreiro": {
                nome: "Maternidade Azilda Marreiro",
                categoria: "Maternidade",
                tiposLeitos: ["OBSTETRICO", "ESPEC - CLINICO", "COMPLEMENTAR", "PEDIATRICO", "ESPEC - CIRURGICO"]
            },
            "maternidade-nazira-daou": {
                nome: "Maternidade Nazira Daou",
                categoria: "Maternidade",
                tiposLeitos: ["OBSTETRICO", "ESPEC - CLINICO", "COMPLEMENTAR", "PEDIATRICO", "ESPEC - CIRURGICO"]
            },
            "maternidade-balbina-mestrinho": {
                nome: "Maternidade Balbina Mestrinho",
                categoria: "Maternidade",
                tiposLeitos: ["OBSTETRICO", "ESPEC - CLINICO", "COMPLEMENTAR", "PEDIATRICO", "ESPEC - CIRURGICO"]
            },
            "maternidade-chapot-prevost": {
                nome: "Maternidade Chapot Prevost",
                categoria: "Maternidade",
                tiposLeitos: ["UNIDADE ISOLAMENTO", "OBSTETRICO", "ESPEC - CIRURGICO", "PEDIATRICO"]
            },
            "maternidade-alvorada": {
                nome: "Maternidade Alvorada",
                categoria: "Maternidade",
                tiposLeitos: ["OBSTETRICO", "COMPLEMENTAR", "ESPEC - CIRURGICO", "PEDIATRICO"]
            },

            // HPS's
            "hps-28-de-agosto": {
                nome: "HPS 28 DE AGOSTO",
                categoria: "HPS",
                tiposLeitos: ["ESPEC - CIRURGICO", "ESPEC - CLINICO", "OUTRAS ESPECIALIDADES", "COMPLEMENTAR"]
            },
            "hps-zona-norte-delphina-aziz": {
                nome: "HPS ZONA NORTE DELPHINA AZIZ",
                categoria: "HPS",
                tiposLeitos: ["ESPEC - CIRURGICO", "ESPEC - CLINICO", "HOSPITAL DIA", "COMPLEMENTAR", "PEDIATRICO", "OUTRAS ESPECIALIDADES"]
            },
            "hps-joao-lucio": {
                nome: "HPS JOAO LUCIO",
                categoria: "HPS",
                tiposLeitos: ["ESPEC - CLINICO", "COMPLEMENTAR", "ESPEC - CIRURGICO"]
            },
            "hps-platao-araujo": {
                nome: "HPS PLATAO ARAUJO",
                categoria: "HPS",
                tiposLeitos: ["ESPEC - CLINICO", "COMPLEMENTAR", "ESPEC - CIRURGICO"]
            },
            "hospital-geraldo-da-rocha": {
                nome: "HOSPITAL GERALDO DA ROCHA",
                categoria: "HPS",
                tiposLeitos: ["ESPEC - CLINICO", "ESPEC - CIRURGICO"]
            },

            // HPSC's
            "hpsc-zona-oeste": { nome: "HPSC ZONA OESTE", categoria: "HPSC" },
            "hpsc-zona-sul": { nome: "HPSC ZONA SUL", categoria: "HPSC" },
            "hpsc-zona-leste": { nome: "HPSC ZONA LESTE", categoria: "HPSC" },

            // UPA's
            "upa-jose-rodrigues": { nome: "UPA José Rodrigues", categoria: "UPA" },
            "upa-campos-sales": { nome: "Upa Campos Sales", categoria: "UPA" }
        };


        // DOM Elements

        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("overlay-backdrop");
        const modal = document.getElementById("add-unit-modal");
        const form = document.getElementById("add-unit-form");
        const bedInputs = document.getElementById("bed-inventory-inputs");
        const unitNameInput = document.getElementById("unit-name");
        const nameFeedback = document.createElement("small");
        nameFeedback.style.display = "block"; nameFeedback.style.marginTop = "4px"; nameFeedback.style.fontWeight = "600";
        unitNameInput.parentNode.appendChild(nameFeedback);

        // INIT
        async function init() {
            try {
                const app = initializeApp(firebaseConfig);
                db = initializeFirestore(app, { localCache: persistentLocalCache() });
                auth = getAuth(app);

                onAuthStateChanged(auth, async (user) => {
                    if (!user) {
                        await signInAnonymously(auth);
                    }
                    userId = auth.currentUser.uid;
                    document.getElementById('user-id-display').textContent = 'ID: ' + userId.substring(0, 8);
                    loadData();
                });
            } catch (e) {
                console.error("ERROR IN INIT:", e);
            }
        }

        function loadData() {
            try {
                const col = collection(db, `artifacts/${appId}/public/data/hospital_inventory`);
                onSnapshot(col, (snap) => {
                    units = [];
                    snap.forEach(d => units.push({ id: d.id, ...d.data() }));
                    render();
                    document.getElementById('loading-state').style.display = 'none';
                }, (err) => {
                    console.error("SNAPSHOT ERROR:", err);
                });
            } catch (e) {
                console.error("ERROR IN LOAD DATA:", e);
            }
        }

        // RENDER
        let filter = 'all';
        let search = '';

        function render() {
            const filtered = units.filter(u => {
                const matchFilter = filter === 'all' || u.category === filter;
                const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                    (u.inventory && u.inventory.some(i =>
                        i.type && i.type.toLowerCase().includes(search.toLowerCase())
                    ));
                return matchFilter && matchSearch;
            }).sort((a, b) => (b.totalBeds || 0) - (a.totalBeds || 0));

            if (filtered.length === 0) {
                document.getElementById('empty-state').style.display = 'block';
                document.getElementById('grid-view').style.display = 'none';
            } else {
                document.getElementById('empty-state').style.display = 'none';
                document.getElementById('grid-view').style.display = 'grid';
            }

            const grid = document.getElementById('grid-view');
            grid.innerHTML = '';

            filtered.forEach(unit => {
                const card = document.createElement('div');
                card.className = 'unit-card';

                const total = unit.inventory ? unit.inventory.reduce((a, b) => a + (+b.quantity || 0), 0) : 0;
                const totalNaoCad = unit.inventory ? unit.inventory.reduce((a, b) => a + (+b.naoCadastrados || 0), 0) : 0;

                card.innerHTML = `
            <div class="card-header-row">
                <div class="unit-info">
                    <h3>${unit.name || 'Sem nome'}</h3>
                    <span class="unit-cat">${unit.category || 'Sem categoria'}</span>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <div class="total-badge">${total}<span>Leitos</span></div>
                    ${totalNaoCad > 0 ? `<div class="total-badge" style="background: #fee2e2; color: #dc2626;">${totalNaoCad}<span style="color: #dc2626;">Não Cad.</span></div>` : ''}
                </div>
            </div>

            <div class="types-list">
                ${unit.inventory ? unit.inventory.map(i => {
                    let detalhamento = `<b>${i.quantity || 0}</b>`;
                    if (i.cadastrados !== undefined) {
                        detalhamento = `<b>${i.quantity || 0}</b> <span style="font-size:10px; color:#64748b;">(${i.cadastrados} Cad. / ${i.naoCadastrados || 0} Não Cad.)</span>`;
                    }
                    return `<span class="type-tag ${i.type && i.type.toLowerCase().includes('uti') ? 'tag-uti' : 'tag-cli'}">
                        ${i.type || 'Sem tipo'}: ${detalhamento}
                    </span>`;
                }).join('') : ''}
            </div>

            <!-- RODAPÉ COM ÍCONES CORRETOS -->
            <div style="margin-top:auto; padding-top:15px; border-top:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:10px; color:#94a3b8;">Ref: ${unit.id?.substring(0, 8) || 'temp'}</span>
                <div class="card-actions">
                    <button class="btn-icon-card btn-edit" title="Editar / Excluir Leitos">✏️</button>
                    <button class="btn-icon-card btn-del" title="Excluir Unidade">🗑️</button>
                </div>
            </div>
        `;

                // Eventos dos botões
                card.querySelector('.btn-edit').onclick = () => openEditModal(unit);
                card.querySelector('.btn-del').onclick = () => confirmDelete(unit.id, unit.name || unit.id);

                grid.appendChild(card);
            });
        }



        // --- EDIT & DELETE LOGIC ---
        window.confirmDelete = async (id, name) => {
            if (confirm(`Tem certeza que deseja EXCLUIR a unidade "${name}"?\nIsso não pode ser desfeito.`)) {
                try {
                    await deleteDoc(doc(db, `artifacts/${appId}/public/data/hospital_inventory`, id));
                } catch (e) { alert('Erro ao excluir: ' + e.message); }
            }
        }

        window.openEditModal = (unit) => {
            document.getElementById('modal-title').textContent = "Editar / Excluir Leitos";
            document.getElementById('unit-id-hidden').value = unit.id;
            document.getElementById('unit-name').value = unit.name;
            document.getElementById('unit-category').value = unit.category;

            bedInputs.innerHTML = '';

            // Sempre usar estrutura com sub-leitos para todos os casos
            // Agrupar por tipo principal (antes do " - ")
            const grupos = {};
            unit.inventory.forEach(item => {
                const partes = item.type.split(' - ');
                const tipoPrincipal = partes[0];
                const subTipo = partes.slice(1).join(' - ');
                if (!grupos[tipoPrincipal]) grupos[tipoPrincipal] = [];
                grupos[tipoPrincipal].push({
                    nome: subTipo,
                    cadastrados: item.cadastrados || item.quantity || 0,
                    naoCadastrados: item.naoCadastrados || 0
                });
            });

            // Recriar grupos de tipos com sub-leitos
            Object.keys(grupos).forEach(tipoPrincipal => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'bed-type-group';
                groupDiv.dataset.tipo = tipoPrincipal;

                groupDiv.innerHTML = `
                    <div class="bed-type-header">${tipoPrincipal}</div>
                    <div class="inventory-section-header">
                        <span>Nome do Sub-Leito</span>
                        <span>Cad.</span>
                        <span>Não Cad.</span>
                        <span></span>
                    </div>
                    <div class="sub-bed-container"></div>
                    <button type="button" class="add-sub-bed-btn">+ Adicionar sub-leito</button>
                  `;

                const subContainer = groupDiv.querySelector('.sub-bed-container');
                const addSubBtn = groupDiv.querySelector('.add-sub-bed-btn');

                // Função para adicionar sub-leito
                const addSubBed = (nome = '', cad = 0, naoCad = 0) => {
                    const subRow = document.createElement('div');
                    subRow.className = 'sub-bed-row';
                    subRow.innerHTML = `
                        <input type="text" class="form-input sub-bed-name" placeholder="Nome do sub-leito (ex: Enfermaria, UCI)" value="${nome}">
                        <div class="number-field">
                            <label class="number-label">Cadastrados</label>
                            <input type="number" class="form-input" placeholder="0" value="${cad}" min="0" onfocus="this.select()">
                        </div>
                        <div class="number-field">
                            <label class="number-label">Não Cad.</label>
                            <input type="number" class="form-input" placeholder="0" value="${naoCad}" min="0" onfocus="this.select()">
                        </div>
                        <button type="button" class="remove-bed-btn" title="Remover">&times;</button>
                      `;
                    subRow.querySelector('.remove-bed-btn').onclick = () => subRow.remove();
                    subContainer.appendChild(subRow);
                };

                addSubBtn.onclick = () => addSubBed();

                // Adicionar sub-leitos existentes
                grupos[tipoPrincipal].forEach(sub => {
                    addSubBed(sub.nome, sub.cadastrados, sub.naoCadastrados);
                });

                bedInputs.appendChild(groupDiv);
            });

            nameFeedback.textContent = '';
            modal.classList.add('active');
        }

        // --- FORM & SAVING ---
        function addBedRow(type = '', qtd = '') {
            const div = document.createElement('div');
            div.className = 'bed-input-row';
            div.innerHTML = `
             <input type="text" class="form-input bed-type" placeholder="Tipo (Ex: UTI)" value="${type}" required>
             <input type="number" class="form-input bed-qtd" placeholder="Qtd" value="${qtd}" required>
             <button type="button" class="remove-bed-btn" title="Excluir este leito">&times;</button>
          `;
            div.querySelector('.remove-bed-btn').onclick = () => div.remove();
            bedInputs.appendChild(div);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-save');
            const oldText = btn.textContent;
            btn.textContent = "Salvando..."; btn.disabled = true;

            const name = document.getElementById('unit-name').value.trim();
            const cat = document.getElementById('unit-category').value;

            let id = document.getElementById('unit-id-hidden').value;
            if (!id) id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            const newInv = [];

            // Verificar se há estrutura hierárquica (grupos de tipos)
            const typeGroups = document.querySelectorAll('.bed-type-group');
            if (typeGroups.length > 0) {
                // Estrutura hierárquica: processar sub-leitos por tipo
                typeGroups.forEach(group => {
                    const tipoPrincipal = group.dataset.tipo;
                    const subRows = group.querySelectorAll('.sub-bed-row');
                    subRows.forEach(subRow => {
                        const inputs = subRow.querySelectorAll('.form-input');
                        const subTipo = inputs[0].value.trim();
                        const cadastrados = parseInt(inputs[1].value) || 0;
                        const naoCadastrados = parseInt(inputs[2].value) || 0;
                        const total = cadastrados + naoCadastrados;

                        if (subTipo && total > 0) {
                            newInv.push({
                                type: `${tipoPrincipal} - ${subTipo}`,
                                quantity: total,
                                cadastrados: cadastrados,
                                naoCadastrados: naoCadastrados
                            });
                        }
                    });
                });
            } else {
                // Estrutura plana: modo livre (SPAs ou manual)
                document.querySelectorAll('.bed-input-row').forEach(row => {
                    const t = row.querySelector('.bed-type').value.trim();
                    const q = parseInt(row.querySelector('.bed-qtd').value);
                    if (t && q > 0) newInv.push({ type: t, quantity: q });
                });
            }



            const total = newInv.reduce((a, b) => a + b.quantity, 0);

            try {
                await setDoc(doc(db, `artifacts/${appId}/public/data/hospital_inventory`, id), {
                    name: name, category: cat, inventory: newInv, totalBeds: total,
                    lastUpdated: serverTimestamp(), userId: userId
                });
                modal.classList.remove('active');
            } catch (err) {
                alert("Erro ao salvar: " + err.message);
            } finally {
                btn.textContent = oldText; btn.disabled = false;
            }
        });

        // AUTO-PREENCHIMENTO
        unitNameInput.addEventListener('input', () => {
            if (document.getElementById('unit-id-hidden').value) return;

            const typed = unitNameInput.value.trim();
            const sid = typed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (!sid) { nameFeedback.textContent = ''; return; }

            const found = units.find(u => u.id === sid);
            if (found) {
                nameFeedback.textContent = "✅ Unidade existente! Dados carregados.";
                nameFeedback.style.color = "#4C9A2A";
                document.getElementById('unit-category').value = found.category;
                bedInputs.innerHTML = '';
                found.inventory.forEach(i => addBedRow(i.type, i.quantity));
            } else {
                nameFeedback.textContent = "✨ Nova Unidade";
                nameFeedback.style.color = "#64748b";
            }
        });

        // EXPORT
        document.getElementById('btn-export').onclick = () => {
            let csv = "Unidade;Categoria;Tipo de Leito;Quantidade\n";
            units.forEach(u => {
                if (u.inventory.length === 0) {
                    csv += `${u.name};${u.category};Sem leitos;0\n`;
                } else {
                    u.inventory.forEach(i => {
                        csv += `${u.name};${u.category};${i.type};${i.quantity}\n`;
                    });
                }
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'relatorio_leitos.csv';
            a.click();
        };

        // UI EVENTS

        // Abre o Menu
        document.getElementById('menu-toggle').onclick = () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        };

        // Fecha o Menu (Botão X ou clicando fora)
        function closeSidebar() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
        document.getElementById('close-sidebar').onclick = closeSidebar;
        overlay.onclick = closeSidebar;

        document.getElementById('modal-close-btn').onclick = () => modal.classList.remove('active');
        document.getElementById('add-bed-input').onclick = () => createBedTypeGroup('Novo Tipo de Leito');

        // Auto-preenchimento ao selecionar template de unidade
        document.getElementById('unit-template').onchange = (e) => {
            const templateId = e.target.value;
            const unitNameInput = document.getElementById('unit-name');
            const unitCategorySelect = document.getElementById('unit-category');

            if (templateId && templatesUnidades[templateId]) {
                const template = templatesUnidades[templateId];
                unitNameInput.value = template.nome;
                unitCategorySelect.value = template.categoria;
                unitNameInput.readOnly = true;
                unitCategorySelect.disabled = true;
                unitNameInput.style.backgroundColor = '#f1f5f9';
                unitCategorySelect.style.backgroundColor = '#f1f5f9';

                // Sempre criar estrutura hierárquica com sub-leitos
                bedInputs.innerHTML = '';
                if (template.tiposLeitos && template.tiposLeitos.length > 0) {
                    template.tiposLeitos.forEach(tipo => {
                        createBedTypeGroup(tipo);
                    });
                } else {
                    // Para SPAs ou sem tipos: adicionar um tipo vazio com sub-leitos
                    createBedTypeGroup('Tipo Personalizado');
                }
            } else {
                unitNameInput.readOnly = false;
                unitCategorySelect.disabled = false;
                unitNameInput.style.backgroundColor = '';
                unitCategorySelect.style.backgroundColor = '';
                bedInputs.innerHTML = '';
                createBedTypeGroup('Tipo Personalizado'); // Sempre sub-leitos no manual
            }
        };

        // Função para criar grupo de tipo com sub-leitos (agora usada para todos)
        function createBedTypeGroup(tipoPrincipal) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'bed-type-group';
            groupDiv.dataset.tipo = tipoPrincipal || 'Tipo Personalizado';

            groupDiv.innerHTML = `
            <div class="bed-type-header">${tipoPrincipal || 'Tipo Personalizado'}</div>
            <div class="inventory-section-header">
              <span>Nome do Sub-Leito</span>
              <span>Cad.</span>
              <span>Não Cad.</span>
              <span></span>
            </div>
            <div class="sub-bed-container"></div>
            <button type="button" class="add-sub-bed-btn">+ Adicionar sub-leito</button>
          `;

            const subContainer = groupDiv.querySelector('.sub-bed-container');
            const addSubBtn = groupDiv.querySelector('.add-sub-bed-btn');

            // Função para adicionar sub-leito
            const addSubBed = () => {
                const subRow = document.createElement('div');
                subRow.className = 'sub-bed-row';
                subRow.innerHTML = `
                <input type="text" class="form-input sub-bed-name" placeholder="Nome do sub-leito (ex: Enfermaria, UCI)">
                <div class="number-field">
                    <label class="number-label">Cadastrados</label>
                    <input type="number" class="form-input" placeholder="0" value="0" min="0" onfocus="this.select()">
                </div>
                <div class="number-field">
                    <label class="number-label">Não Cad.</label>
                    <input type="number" class="form-input" placeholder="0" value="0" min="0" onfocus="this.select()">
                </div>
                <button type="button" class="remove-bed-btn" title="Remover">&times;</button>
              `;
                subRow.querySelector('.remove-bed-btn').onclick = () => subRow.remove();
                subContainer.appendChild(subRow);
            };


            addSubBtn.onclick = addSubBed;

            // NÃO adicionar sub-leito inicial - permitir tipos vazios

            bedInputs.appendChild(groupDiv);
        }




        document.getElementById('add-unit-btn').onclick = () => {
            document.getElementById('unit-id-hidden').value = '';
            document.getElementById('modal-title').textContent = "Adicionar Unidade";
            form.reset(); bedInputs.innerHTML = '';
            nameFeedback.textContent = '';

            // Resetar dropdown de templates e desbloquear campos
            document.getElementById('unit-template').value = '';
            document.getElementById('unit-name').readOnly = false;
            document.getElementById('unit-category').disabled = false;
            document.getElementById('unit-name').style.backgroundColor = '';
            document.getElementById('unit-category').style.backgroundColor = '';

            // Adicionar um grupo inicial para manual
            createBedTypeGroup('Tipo Personalizado');

            closeSidebar();
            modal.classList.add('active');
        };


        document.getElementById('search-input').oninput = (e) => { search = e.target.value; render(); };

        document.querySelectorAll('.nav-item').forEach(el => {
            el.onclick = () => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                el.classList.add('active');
                filter = el.dataset.filter;
                closeSidebar();
                render();
            };
        });

        init();
