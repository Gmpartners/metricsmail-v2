import axios from 'axios';

class MetricsMailApiService {
  constructor() {
    this.BASE_URL = 'https://metrics.devoltaaojogo.com/api';
    this.API_KEY = 'MAaDylN2bs0Y01Ep66';
    
    this.api = axios.create({
      baseURL: this.BASE_URL,
      headers: {
        'x-api-key': this.API_KEY
      },
      timeout: 15000
    });
    
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.api.interceptors.request.use(
      config => {
        // Cache busters apenas nos parâmetros
        config.params = {
          ...config.params,
          _t: Date.now(),
          _v: '2.1.0'
        };
        
        // APENAS o header de API key - nada mais para evitar CORS
        config.headers = {
          'x-api-key': this.API_KEY
        };
        
        console.log(`🔍 [${new Date().toLocaleTimeString()}] API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );
    
    this.api.interceptors.response.use(
      response => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`✅ [${timestamp}] API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status
        });
        
        return response.data;
      },
      error => {
        const timestamp = new Date().toLocaleTimeString();
        console.error(`❌ [${timestamp}] API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, 
          error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  clearCache() {
    console.log('🧹 Limpando cache do API Service...');
    
    this.api = axios.create({
      baseURL: this.BASE_URL,
      headers: {
        'x-api-key': this.API_KEY
      },
      timeout: 15000
    });
    this.setupInterceptors();
    
    console.log('✅ Cache API limpo - nova instância criada');
  }

  async listAccounts(userId) {
    if (!userId) {
      return { success: false, data: [], message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/accounts`);
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }
  
  async createAccount(userId, accountData) {
    if (!userId) {
      return { success: false, message: "ID de usuário não fornecido" };
    }
    
    try {
      console.log('🔄 Criando conta:', accountData);
      const response = await this.api.post(`/users/${userId}/accounts`, accountData);
      console.log('✅ Conta criada com sucesso:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      
      if (error.response?.status === 400) {
        return { 
          success: false, 
          message: error.response.data?.message || "Dados inválidos para criação da conta" 
        };
      } else if (error.response?.status === 401) {
        return { 
          success: false, 
          message: "Credenciais do Mautic inválidas" 
        };
      } else if (error.response?.status === 404) {
        return { 
          success: false, 
          message: "URL do Mautic não encontrada ou inacessível" 
        };
      } else {
        return { 
          success: false, 
          message: error.response?.data?.message || error.message || "Erro ao conectar com o Mautic" 
        };
      }
    }
  }

  async getAccount(userId, accountId) {
    if (!userId || !accountId) {
      return { success: false, data: null, message: "ID de usuário ou conta não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/accounts/${accountId}`);
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  async getAccountWebhook(userId, accountId) {
    if (!userId || !accountId) {
      return { success: false, data: null, message: "ID de usuário ou conta não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/accounts/${accountId}/webhook`);
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  async compareAccounts(userId, accountIds) {
    if (!userId || !accountIds || accountIds.length === 0) {
      return { success: false, data: null, message: "Parâmetros não fornecidos" };
    }
    try {
      const accountIdsString = Array.isArray(accountIds) ? accountIds.join(',') : accountIds;
      return await this.api.get(`/users/${userId}/accounts/compare`, {
        params: { accountIds: accountIdsString }
      });
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  async updateAccount(userId, accountId, accountData) {
    if (!userId || !accountId) {
      return { success: false, message: "ID de usuário ou conta não fornecido" };
    }
    try {
      return await this.api.put(`/users/${userId}/accounts/${accountId}`, accountData);
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async deleteAccount(userId, accountId) {
    if (!userId || !accountId) {
      return { success: false, message: "ID de usuário ou conta não fornecido" };
    }
    try {
      return await this.api.delete(`/users/${userId}/accounts/${accountId}`);
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }

  async getMetrics(userId, filters = {}) {
    if (!userId) {
      return { success: false, data: null, message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/metrics`, { params: filters });
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  async getMetricsByDate(userId, filters = {}) {
    if (!userId) {
      return { success: false, data: [], message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/metrics/by-date`, { params: filters });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  async getMetricsByAccount(userId, filters = {}) {
    if (!userId) {
      return { success: false, data: [], message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/metrics/by-account`, { params: filters });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  async getMetricsByCampaign(userId, filters = {}) {
    if (!userId) {
      return { success: false, data: [], message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/metrics/by-campaign`, { params: filters });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  async getMetricsByEmail(userId, filters = {}) {
    if (!userId) {
      return { success: false, data: null, message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/metrics/by-email`, { params: filters });
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  async compareMetrics(userId, compareType, filters = {}) {
    if (!userId || !compareType) {
      return { success: false, data: null, message: "Parâmetros obrigatórios não fornecidos" };
    }
    try {
      return await this.api.get(`/users/${userId}/metrics/compare`, { 
        params: { compareType, ...filters } 
      });
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  async getEmailOpens(userId, filters = {}) {
    if (!userId) {
      return { success: false, data: [], message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/metrics/opens`, { params: filters });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  async getLastSendDate(userId) {
    if (!userId) {
      return { success: false, data: null, message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/metrics/last-send`);
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  async getEmails(userId, filters = {}) {
    if (!userId) {
      return { success: false, data: [], message: "ID de usuário não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/emails`, { params: filters });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  async getEmail(userId, emailId) {
    if (!userId || !emailId) {
      return { success: false, data: null, message: "ID de usuário ou email não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/emails/${emailId}`);
    } catch (error) {
      return { success: false, data: null, message: error.message };
    }
  }

  async getEvents(userId, filters = {}) {
    if (!userId) {
      return { success: false, data: [], message: "ID de usuário não fornecido" };
    }
    try {
      const params = {
        limit: 100,
        page: 1,
        ...filters
      };
      return await this.api.get(`/users/${userId}/metrics/events`, { params });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  async getMauticEmails(userId, accountId, filters = {}) {
    if (!userId || !accountId) {
      return { success: false, data: [], message: "ID de usuário ou conta não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/accounts/${accountId}/mautic/emails`, { params: filters });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  async getMauticCampaigns(userId, accountId, filters = {}) {
    if (!userId || !accountId) {
      return { success: false, data: [], message: "ID de usuário ou conta não fornecido" };
    }
    try {
      return await this.api.get(`/users/${userId}/accounts/${accountId}/mautic/campaigns`, { params: filters });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

async getLeadStats(userId, filters = {}) {
  if (!userId) {
    return { success: false, data: null, message: "ID de usuário não fornecido" };
  }
  
  try {
    const params = { ...filters };
    
    if (!params.startDate || !params.endDate) {
      const hoje = new Date();
      const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      if (!params.startDate) {
        params.startDate = trintaDiasAtras.toISOString().split('T')[0];
      }
      if (!params.endDate) {
        params.endDate = hoje.toISOString().split('T')[0];
      }
    }
    
    const originalEndDate = params.endDate;
    const endDate = new Date(params.endDate + 'T23:59:59.999Z');
    endDate.setDate(endDate.getDate() + 1);
    params.endDate = endDate.toISOString().split('T')[0];
    
    console.log(`🔄 Lead Stats - Original: ${originalEndDate} -> Ajustado: ${params.endDate}`);
    console.log('📅 Filtros finais:', params);
    
    const response = await this.api.get(`/users/${userId}/lead-stats`, { params });
    
    if (response.success && response.data) {
      console.log('✅ Dados recebidos:', response.data);
      
      if (!response.data.datasets || response.data.datasets.length === 0) {
        console.log('⚠️ Nenhum dataset encontrado');
        return {
          success: true,
          data: {
            datasets: [],
            summary: { totalLeads: 0, averagePerDay: 0 }
          }
        };
      }
      
      return response;
    } else {
      console.log('⚠️ Resposta sem sucesso:', response);
      return {
        success: true,
        data: {
          datasets: [],
          summary: { totalLeads: 0, averagePerDay: 0 }
        }
      };
    }
    
  } catch (error) {
    console.error('❌ Erro na API de leads:', error);
    
    if (error.response?.status === 404) {
      return { 
        success: false, 
        data: null, 
        message: "Dados de leads não encontrados para este período" 
      };
    } else if (error.response?.status === 401) {
      return { 
        success: false, 
        data: null, 
        message: "Acesso não autorizado - verifique as credenciais da conta" 
      };
    } else {
      return { 
        success: false, 
        data: null, 
        message: error.response?.data?.message || error.message || "Erro ao buscar dados de leads"
      };
    }
  }
}

  async searchEmailSuggestions(userId, search) {
    if (!userId || !search) {
      return { success: false, data: [], message: "Parâmetros de busca não fornecidos" };
    }
    try {
      return await this.api.get(`/users/${userId}/emails/search/suggestions`, { 
        params: { search, highlight: true } 
      });
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  async checkHealth() {
    try {
      const response = await this.api.get('/');
      return response.success !== false;
    } catch (error) {
      return false;
    }
  }
}

export const metricsMailApi = new MetricsMailApiService();

window.metricsMailApi = metricsMailApi;