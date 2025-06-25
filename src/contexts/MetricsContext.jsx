import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { metricsMailApi } from '../services/MetricsMailApiService';

const MetricsContext = createContext();

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};

export const MetricsProvider = ({ children }) => {
  const { user } = useAuthContext();
  
  const [accounts, setAccounts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [emails, setEmails] = useState([]);
  const [events, setEvents] = useState([]);
  const [generalRates, setGeneralRates] = useState(null);
  const [lastSendDate, setLastSendDate] = useState(null);
  const [metricsByAccount, setMetricsByAccount] = useState([]);
  const [dailySends, setDailySends] = useState([]);
  const [dailyOpens, setDailyOpens] = useState([]);
  const [dailyClicks, setDailyClicks] = useState([]);

  const [accountsLoading, setAccountsLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [selectedAccountCache, setSelectedAccountCache] = useState(() => {
    return localStorage.getItem('metricsmail_selected_account') || 'all';
  });

  const needsRefresh = useCallback(() => {
    const now = new Date();
    const diffMinutes = (now - lastRefresh) / 1000 / 60;
    return diffMinutes > 5;
  }, [lastRefresh]);

  const updateSelectedAccount = useCallback((accountId) => {
    setSelectedAccountCache(accountId);
    localStorage.setItem('metricsmail_selected_account', accountId);
  }, []);

  const getSelectedAccount = useCallback(() => {
    return selectedAccountCache;
  }, [selectedAccountCache]);

  const getUserId = useCallback(() => {
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return null;
    }
    return user.uid;
  }, [user]);

  // ✅ FUNÇÃO HELPER CORRIGIDA - Agrupar dados por data
  const agruparMetricasPorData = useCallback((dados) => {
    console.log('📊 Dados recebidos do backend:', dados.length, 'registros');
    
    const agrupados = dados.reduce((acc, item) => {
      const dataKey = item.date;
      
      if (!acc[dataKey]) {
        acc[dataKey] = {
          date: dataKey,
          sentCount: 0,
          openCount: 0,
          clickCount: 0,
          uniqueOpenCount: 0,
          uniqueClickCount: 0,
          bounceCount: 0,
          unsubscribeCount: 0,
          accounts: []
        };
      }
      
      // Somar métricas das contas do mesmo dia
      acc[dataKey].sentCount += item.metrics?.sentCount || 0;
      acc[dataKey].openCount += item.metrics?.openCount || 0;
      acc[dataKey].clickCount += item.metrics?.clickCount || 0;
      acc[dataKey].uniqueOpenCount += item.metrics?.uniqueOpenCount || 0;
      acc[dataKey].uniqueClickCount += item.metrics?.uniqueClickCount || 0;
      acc[dataKey].bounceCount += item.metrics?.bounceCount || 0;
      acc[dataKey].unsubscribeCount += item.metrics?.unsubscribeCount || 0;
      
      // Para debug - manter referência das contas
      acc[dataKey].accounts.push({
        name: item.account?.name || 'Desconhecida',
        provider: item.account?.provider || 'N/A'
      });
      
      return acc;
    }, {});

    const diasUnicos = Object.keys(agrupados).length;
    console.log(`✅ Métricas diárias processadas: ${diasUnicos} dias`);
    
    return agrupados;
  }, []);

  const fetchAccounts = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    setAccountsLoading(true);
    setError(null);
    
    try {
      console.log('📋 Buscando contas para userId:', userId);
      const response = await metricsMailApi.listAccounts(userId);
      
      if (response.success && response.data) {
        setAccounts(response.data);
        console.log('✅ Contas carregadas:', response.data.length);
      } else {
        setAccounts([]);
        console.log('⚠️ Nenhuma conta encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar contas:', error);
      setError('Erro ao carregar contas');
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  }, [getUserId]);

  const fetchMetrics = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      console.log('📊 Buscando métricas gerais com filtros:', filters);
      const response = await metricsMailApi.getMetrics(userId, filters);
      
      if (response.success && response.data) {
        setMetrics(response.data);
        setLastSendDate(response.data.lastSendDate);
        console.log('✅ Métricas gerais carregadas');
      } else {
        setMetrics(null);
        console.log('⚠️ Nenhuma métrica encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar métricas:', error);
      setError('Erro ao carregar métricas');
    }
  }, [getUserId]);

  const fetchGeneralRates = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      console.log('📈 Buscando taxas gerais com filtros:', filters);
      const response = await metricsMailApi.getMetrics(userId, filters);
      
      if (response.success && response.data) {
        setGeneralRates(response.data);
        console.log('✅ Taxas gerais carregadas');
      } else {
        setGeneralRates(null);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar taxas gerais:', error);
    }
  }, [getUserId]);

  const fetchMetricsByAccount = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      console.log('📊 Buscando métricas por conta com filtros:', filters);
      const response = await metricsMailApi.getMetricsByAccount(userId, filters);
      
      if (response.success && response.data) {
        setMetricsByAccount(response.data);
        console.log('✅ Métricas por conta carregadas:', response.data.length);
      } else {
        setMetricsByAccount([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar métricas por conta:', error);
    }
  }, [getUserId]);

  // ✅ FUNÇÃO CORRIGIDA - fetchDailyMetrics com agrupamento por data
  const fetchDailyMetrics = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      console.log('📅 Buscando métricas diárias com filtros:', filters);
      
      const response = await metricsMailApi.getMetricsByDate(userId, filters);

      if (response.success && response.data) {
        const dailyData = response.data;
        
        // ✅ CORREÇÃO: Agrupar por data primeiro, depois processar
        const dadosAgrupados = agruparMetricasPorData(dailyData);
        
        // Converter para arrays para compatibilidade com componentes existentes
        const processedSends = Object.values(dadosAgrupados).map(day => ({
          date: day.date,
          count: day.sentCount
        }));
        
        const processedOpens = Object.values(dadosAgrupados).map(day => ({
          date: day.date,
          totalOpens: day.openCount,
          uniqueOpens: day.uniqueOpenCount
        }));
        
        const processedClicks = Object.values(dadosAgrupados).map(day => ({
          date: day.date,
          totalClicks: day.clickCount,
          uniqueClicks: day.uniqueClickCount
        }));

        setDailySends(processedSends);
        setDailyOpens(processedOpens);
        setDailyClicks(processedClicks);
        
        // ✅ LOG CORRIGIDO - Agora mostra dias únicos, não registros
        const diasUnicos = Object.keys(dadosAgrupados).length;
        console.log(`✅ Métricas diárias processadas: ${diasUnicos} dias`);
        
        // Debug detalhado
        console.log('📊 Dados agrupados por data:', dadosAgrupados);
      } else {
        setDailySends([]);
        setDailyOpens([]);
        setDailyClicks([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar métricas diárias:', error);
    }
  }, [getUserId, agruparMetricasPorData]);

  const fetchEmails = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      console.log('✉️ Buscando emails com filtros:', filters);
      const response = await metricsMailApi.getEmails(userId, filters);
      
      if (response.success && response.data) {
        setEmails(response.data);
        console.log('✅ Emails carregados:', response.data.length);
      } else {
        setEmails([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar emails:', error);
    }
  }, [getUserId]);

  const fetchEvents = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      console.log('🎯 Buscando eventos com filtros:', filters);
      const response = await metricsMailApi.getEvents(userId, { limit: 10, ...filters });
      
      if (response.success && response.data) {
        setEvents(response.data);
        console.log('✅ Eventos carregados:', response.data.length);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
    }
  }, [getUserId]);

  const createAccount = useCallback(async (accountData) => {
    const userId = getUserId();
    if (!userId) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    try {
      console.log('🆕 Criando nova conta:', accountData);
      const response = await metricsMailApi.createAccount(userId, accountData);
      
      if (response.success) {
        await fetchAccounts();
        console.log('✅ Conta criada e lista atualizada');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao criar conta' 
      };
    }
  }, [getUserId, fetchAccounts]);

  const updateAccount = useCallback(async (accountId, accountData) => {
    const userId = getUserId();
    if (!userId) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    try {
      console.log('🔄 Atualizando conta:', accountId, accountData);
      const response = await metricsMailApi.updateAccount(userId, accountId, accountData);
      
      if (response.success) {
        await fetchAccounts();
        console.log('✅ Conta atualizada e lista recarregada');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao atualizar conta:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao atualizar conta' 
      };
    }
  }, [getUserId, fetchAccounts]);

  const deleteAccount = useCallback(async (accountId) => {
    const userId = getUserId();
    if (!userId) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    try {
      console.log('🗑️ Deletando conta:', accountId);
      const response = await metricsMailApi.deleteAccount(userId, accountId);
      
      if (response.success) {
        await fetchAccounts();
        console.log('✅ Conta deletada e lista atualizada');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao deletar conta:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao deletar conta' 
      };
    }
  }, [getUserId, fetchAccounts]);

  const getAccountWebhook = useCallback(async (accountId) => {
    const userId = getUserId();
    if (!userId) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    try {
      console.log('🔗 Obtendo webhook da conta:', accountId);
      const response = await metricsMailApi.getAccountWebhook(userId, accountId);
      
      if (response.success) {
        console.log('✅ Webhook obtido:', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao obter webhook:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao obter webhook' 
      };
    }
  }, [getUserId]);

  const fetchMetricsByEmail = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return null;

    try {
      console.log('📧 Buscando métricas por email com filtros:', filters);
      const response = await metricsMailApi.getMetricsByEmail(userId, filters);
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar métricas por email:', error);
      return { success: false, data: null, message: error.message };
    }
  }, [getUserId]);

  const loadDashboardData = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return;

    setDashboardLoading(true);
    setError(null);

    try {
      const refreshedFilters = {
        ...filters,
        _refresh: Date.now()
      };
      
      console.log('🚀 Carregando dashboard com filtros:', refreshedFilters);
      
      await Promise.all([
        fetchMetrics(refreshedFilters),
        fetchGeneralRates(refreshedFilters),
        fetchMetricsByAccount(refreshedFilters),
        fetchEmails(refreshedFilters),
        fetchEvents(refreshedFilters)
      ]);

      setLastRefresh(new Date());
      console.log('✅ Dashboard carregado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, [getUserId, fetchMetrics, fetchGeneralRates, fetchMetricsByAccount, fetchEmails, fetchEvents]);

  const fetchMetricsByDate = useCallback(async (filters = {}) => {
    const userId = getUserId();
    if (!userId) return null;

    try {
      console.log('📅 Buscando métricas por data com filtros:', filters);
      const response = await metricsMailApi.getMetricsByDate(userId, filters);
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar métricas por data:', error);
      return { success: false, data: [], message: error.message };
    }
  }, [getUserId]);

  const refreshData = useCallback(async () => {
    console.log('🔄 Refresh iniciado...');
    await fetchAccounts();
    console.log('✅ Refresh concluído');
  }, [fetchAccounts]);

  const forceRefresh = useCallback(async () => {
    console.log('🔥 Force refresh iniciado...');
    
    metricsMailApi.clearCache();
    
    setMetrics(null);
    setGeneralRates(null);
    setMetricsByAccount([]);
    setDailySends([]);
    setDailyOpens([]);
    setDailyClicks([]);
    setEmails([]);
    setEvents([]);
    
    await fetchAccounts();
    await loadDashboardData();
    await fetchDailyMetrics();
    
    console.log('✅ Force refresh concluído');
  }, [fetchAccounts, loadDashboardData, fetchDailyMetrics]);

  useEffect(() => {
    if (user && user.uid) {
      console.log('👤 Usuário autenticado:', user.uid);
      fetchAccounts();
    } else {
      console.log('❌ Nenhum usuário autenticado');
      setAccounts([]);
      setMetrics(null);
      setEmails([]);
      setEvents([]);
    }
  }, [user, fetchAccounts]);

  useEffect(() => {
    if (!user?.uid) return;
    
    const interval = setInterval(() => {
      if (needsRefresh()) {
        console.log('⏰ Auto-refresh: atualizando dados...');
        loadDashboardData();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user, needsRefresh, loadDashboardData]);

  // ✅ DADOS CALCULADOS CORRIGIDOS - Agora usa dados agrupados corretamente
  const calculatedData = {
    totals: {
      sentCount: (() => {
        if (dailySends.length > 0) {
          const dailyTotal = dailySends.reduce((sum, day) => sum + (day.count || 0), 0);
          console.log(`📊 [CORRETO] Usando dados diários: ${dailyTotal} (${dailySends.length} dias)`);
          return dailyTotal;
        }
        
        const generalTotal = metrics?.counts?.sentCount || generalRates?.counts?.sentCount || 0;
        console.log(`⚠️ [FALLBACK] Usando dados gerais: ${generalTotal}`);
        return generalTotal;
      })(),
      
      openCount: (() => {
        if (dailyOpens.length > 0) {
          const dailyTotal = dailyOpens.reduce((sum, day) => sum + (day.totalOpens || 0), 0);
          console.log(`📊 [CORRETO] Aberturas diárias: ${dailyTotal}`);
          return dailyTotal;
        }
        return metrics?.counts?.openCount || generalRates?.counts?.openCount || 0;
      })(),
        
      clickCount: (() => {
        if (dailyClicks.length > 0) {
          const dailyTotal = dailyClicks.reduce((sum, day) => sum + (day.totalClicks || 0), 0);
          console.log(`📊 [CORRETO] Cliques diários: ${dailyTotal}`);
          return dailyTotal;
        }
        return metrics?.counts?.clickCount || generalRates?.counts?.clickCount || 0;
      })(),
        
      uniqueOpens: metrics?.counts?.uniqueOpenCount || generalRates?.counts?.uniqueOpenCount || 0,
      uniqueClicks: metrics?.counts?.uniqueClickCount || generalRates?.counts?.uniqueClickCount || 0,
      
      bounceCount: metrics?.counts?.bounceCount || generalRates?.counts?.bounceCount || 0,
      unsubscribeCount: metrics?.counts?.unsubscribeCount || generalRates?.counts?.unsubscribeCount || 0,
      deliveredCount: metrics?.counts?.deliveredCount || generalRates?.counts?.deliveredCount || 0
    },
    averages: {
      openRate: metrics?.rates?.openRate || generalRates?.rates?.openRate || 0,
      clickRate: metrics?.rates?.clickRate || generalRates?.rates?.clickRate || 0,
      bounceRate: metrics?.rates?.bounceRate || generalRates?.rates?.bounceRate || 0,
      deliveryRate: generalRates?.rates?.deliveryRate || 0,
      unsubscribeRate: metrics?.rates?.unsubscribeRate || generalRates?.rates?.unsubscribeRate || 0,
      clickToOpenRate: metrics?.rates?.ctr || generalRates?.rates?.ctr || 0
    },
    stats: {
      totalAccounts: accounts.length || 0,
      totalEmails: emails.length || 0,
      lastSendDate: metrics?.lastSendDate || lastSendDate
    }
  };

  const value = {
    accounts,
    metrics,
    emails,
    events,
    generalRates,
    lastSendDate,
    metricsByAccount,
    dailySends,
    dailyOpens,
    dailyClicks,
    
    accountsLoading,
    dashboardLoading,
    loading,
    error,
    
    data: calculatedData,
    
    fetchAccounts,
    fetchMetrics,
    fetchGeneralRates,
    fetchMetricsByAccount,
    fetchDailyMetrics,
    fetchEmails,
    fetchEvents,
    fetchMetricsByEmail,
    fetchMetricsByDate,
    loadDashboardData,
    refreshData,
    forceRefresh,
    getUserId,
    
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountWebhook,
    
    updateSelectedAccount,
    getSelectedAccount,
    
    // ✅ NOVA FUNÇÃO HELPER DISPONÍVEL PARA COMPONENTES
    agruparMetricasPorData,
    
    lastRefresh,
    needsRefresh
  };

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
};
