// Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => console.log('ServiceWorker registrado'))
        .catch(error => console.error('Erro no ServiceWorker:', error));
}

// Inicializar banco de dados
const db = new FormDatabase();

// Gerenciar status de conexão
function updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    if (navigator.onLine) {
        statusElement.textContent = 'Online - Dados serão sincronizados automaticamente';
        statusElement.classList.remove('alert-warning');
        statusElement.classList.add('alert-success');
        syncData();
    } else {
        statusElement.textContent = 'Offline - Dados serão salvos localmente';
        statusElement.classList.remove('alert-success');
        statusElement.classList.add('alert-warning');
    }
}

// Atualizar tabela de dados pendentes
async function updatePendingDataTable() {
    const tableBody = document.getElementById('pendingDataTable');
    const data = await db.getAllData();
    
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add(item.synced ? 'synced-row' : 'pending-row');
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.email}</td>
            <td>${item.phone}</td>
            <td>${item.synced ? 'Sincronizado' : 'Pendente'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Sincronizar dados com o servidor
async function syncData() {
    if (!navigator.onLine) return;

    const data = await db.getAllData();
    const unsynced = data.filter(item => !item.synced);

    for (const item of unsynced) {
        try {
            // Simular envio para o servidor
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Dados enviados para o servidor:', item);
            
            await db.markAsSynced(item.id);
            await updatePendingDataTable();
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
        }
    }
}

// Event Listeners
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    await db.addData(formData);
    await updatePendingDataTable();
    
    if (navigator.onLine) {
        syncData();
    }
    
    e.target.reset();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus();
    updatePendingDataTable();
});