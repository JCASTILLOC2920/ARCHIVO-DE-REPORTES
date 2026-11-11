/**
 * Módulo Cliente de Cortana - Conectividad Blindada a Backend FastAPI (Puerto 8010)
 */
export const CortanaClient = {
    baseUrl: 'http://localhost:8010',
    isOnline: false,

    async checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${this.baseUrl}/cortana/health`, { signal: controller.signal });
            clearTimeout(timeoutId);
            this.isOnline = res.ok;
        } catch (e) {
            this.isOnline = false;
        }
        this.updateStatusUI();
        return this.isOnline;
    },

    updateStatusUI() {
        const badge = document.getElementById('cortana-status-badge');
        if (badge) {
            badge.style.background = this.isOnline ? '#10b981' : '#ef4444';
            badge.textContent = this.isOnline ? 'Cortana 8010: ONLINE' : 'Cortana 8010: OFFLINE';
        }
    },

    async ask(promptText, context = {}) {
        if (!this.isOnline) {
            const recheck = await this.checkHealth();
            if (!recheck) throw new Error('El microservicio Cortana en puerto 8010 no responde.');
        }

        const response = await fetch(`${this.baseUrl}/cortana/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptText, context })
        });

        if (!response.ok) throw new Error(`Error en Cortana (HTTP ${response.status})`);
        return await response.json();
    }
};

// Iniciar monitoreo de salud en segundo plano
setInterval(() => CortanaClient.checkHealth(), 15000);
CortanaClient.checkHealth();
