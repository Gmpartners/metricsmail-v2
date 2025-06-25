import { useState, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import { metricsMailApi } from '../services/MetricsMailApiService';

/**
 * Custom Hook para Dashboard
 * Gerencia estado e dados do dashboard de forma unificada
 * Substitui a lógica complexa do MetricsContext para o dashboard
 */
export const useDashboard = () => {
  const { user } = useAuthContext();
  
  // Estados do dashboard
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  /**
   * Busca dados do dashboard através do endpoint unificado
   * @param {Object} filters - Filtros para aplicar (startDate, endDate, accountIds)
   */
  const fetchDashboard = useCallback(async (filters = {}) => {
    if (!user?.uid) {
      setError('Usuário não autenticado');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🎯 [${timestamp}] Dashboard fetch iniciado com filtros:`, filters);
    
    try {
      // UMA ÚNICA CHAMADA para o endpoint unificado
      const response = await metricsMailApi.getDashboardMetrics(user.uid, filters);
      
      if (response.success && response.data) {
        setDashboardData(response.data);
        setLastUpdate(new Date());
        setError(null);
        
        console.log(`✅ [${timestamp}] Dashboard carregado com sucesso:`);
        console.log(`   - Enviados: ${response.data.totals?.sentCount || 0}`);
        console.log(`   - Taxa Abertura: ${(response.data.rates?.openRate || 0).toFixed(1)}%`);
        console.log(`   - Taxa Clique: ${(response.data.rates?.clickRate || 0).toFixed(1)}%`);
        console.log(`   - Contas: ${response.data.stats?.totalAccounts || 0}`);
        console.log(`   - Dias: ${response.data.period?.days || 0}`);
      } else {
        const errorMsg = response.message || 'Erro ao carregar dados do dashboard';
        setError(errorMsg);
        setDashboardData(null);
        console.error(`❌ [${timestamp}] Erro no dashboard:`, errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Erro ao conectar com o servidor';
      setError(errorMsg);
      setDashboardData(null);
      console.error(`❌ [${timestamp}] Erro no dashboard:`, err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);
  
  /**
   * Força atualização dos dados (útil para botão refresh)
   * @param {Object} filters - Filtros para aplicar
   */
  const refreshDashboard = useCallback(async (filters = {}) => {
    console.log('🔄 Dashboard refresh forçado...');
    await fetchDashboard({ ...filters, _refresh: Date.now() });
  }, [fetchDashboard]);
  
  /**
   * Limpa dados do dashboard
   */
  const resetDashboard = useCallback(() => {
    setDashboardData(null);
    setError(null);
    setLastUpdate(null);
    console.log('🧹 Dashboard resetado');
  }, []);
  
  /**
   * Verifica se os dados precisam ser atualizados
   * @param {number} minutes - Minutos para considerar dados desatualizados
   */
  const needsRefresh = useCallback((minutes = 5) => {
    if (!lastUpdate) return true;
    const now = new Date();
    const diffMinutes = (now - lastUpdate) / 1000 / 60;
    return diffMinutes > minutes;
  }, [lastUpdate]);
  
  /**
   * Obtém informações de status do dashboard
   */
  const getStatus = useCallback(() => {
    return {
      hasData: !!dashboardData,
      isLoading: loading,
      hasError: !!error,
      lastUpdate,
      needsRefresh: needsRefresh(),
      dataAge: lastUpdate ? Math.floor((new Date() - lastUpdate) / 1000 / 60) : null
    };
  }, [dashboardData, loading, error, lastUpdate, needsRefresh]);
  
  return {
    // Dados
    dashboardData,
    
    // Estados
    loading,
    error,
    lastUpdate,
    
    // Ações
    fetchDashboard,
    refreshDashboard,
    resetDashboard,
    
    // Utilitários
    needsRefresh,
    getStatus,
    
    // Computed values para fácil acesso
    totals: dashboardData?.totals || {},
    rates: dashboardData?.rates || {},
    chartData: dashboardData?.chartData || {},
    period: dashboardData?.period || {},
    stats: dashboardData?.stats || {},
    
    // Status helpers
    hasData: !!dashboardData,
    isEmpty: !loading && !dashboardData,
    isStale: needsRefresh(5)
  };
};

export default useDashboard;
