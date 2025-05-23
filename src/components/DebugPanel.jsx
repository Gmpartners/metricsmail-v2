import { useState } from 'react';
import { useMetrics } from '../contexts/MetricsContext';
import { useAuthContext } from '../hooks/useAuthContext';
import { metricsMailApi } from '../services/MetricsMailApiService';
import { 
  Bug, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Database,
  Filter,
  Calendar,
  User
} from 'lucide-react';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState({});
  const [testingApi, setTestingApi] = useState(false);
  
  const { user } = useAuthContext();
  const { 
    accounts,
    metrics,
    generalRates,
    dailySends,
    dailyOpens,
    dailyClicks,
    data,
    error,
    loading,
    dashboardLoading,
    refreshData,
    forceRefresh,
    fetchDailyMetrics,
    loadDashboardData
  } = useMetrics();

  const testApiEndpoint = async (endpoint, params = {}) => {
    setTestingApi(true);
    const userId = user?.uid || '1QJHAiuGWKltTQZkvs9RsBxuiavE';
    
    try {
      console.log(`🧪 Testando ${endpoint} com params:`, params);
      let response;
      
      switch(endpoint) {
        case 'metrics':
          response = await metricsMailApi.getMetrics(userId, params);
          break;
        case 'by-date':
          response = await metricsMailApi.getMetricsByDate(userId, params);
          break;
        case 'by-account':
          response = await metricsMailApi.getMetricsByAccount(userId, params);
          break;
        default:
          response = { success: false, message: 'Endpoint não suportado' };
      }
      
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: response.success,
          data: response.data,
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log(`✅ Resposta ${endpoint}:`, response);
    } catch (error) {
      console.error(`❌ Erro ${endpoint}:`, error);
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setTestingApi(false);
    }
  };

  const testDateFilters = async () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const testCases = [
      {
        name: 'Últimos 30 dias',
        params: {
          startDate: thirtyDaysAgo.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }
      },
      {
        name: 'Últimos 7 dias',
        params: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }
      },
      {
        name: 'Sem filtros',
        params: {}
      }
    ];

    for (const testCase of testCases) {
      console.log(`🧪 Testando: ${testCase.name}`);
      await testApiEndpoint('by-date', testCase.params);
      await testApiEndpoint('metrics', testCase.params);
    }
  };

  const testRefresh = async (useFilters = true) => {
    const filters = useFilters ? {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    } : {};
    
    console.log('🔄 Testando refresh com filtros:', filters);
    await loadDashboardData(filters);
    await fetchDailyMetrics(filters);
  };

  const calculateDiscrepancies = () => {
    const discrepancies = [];
    
    if (metrics?.counts?.sentCount !== undefined && generalRates?.counts?.sentCount !== undefined) {
      const diff = Math.abs(metrics.counts.sentCount - generalRates.counts.sentCount);
      if (diff > 0) {
        discrepancies.push({
          field: 'Total Enviados',
          metrics: metrics.counts.sentCount,
          rates: generalRates.counts.sentCount,
          difference: diff
        });
      }
    }
    
    if (dailySends.length > 0) {
      const dailyTotal = dailySends.reduce((sum, day) => sum + (day.count || 0), 0);
      const apiTotal = metrics?.counts?.sentCount || generalRates?.counts?.sentCount || 0;
      const diff = Math.abs(dailyTotal - apiTotal);
      
      if (diff > 0) {
        discrepancies.push({
          field: 'Enviados (Daily vs API)',
          daily: dailyTotal,
          api: apiTotal,
          difference: diff
        });
      }
    }
    
    return discrepancies;
  };

  const discrepancies = calculateDiscrepancies();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800"
      >
        <Bug className="h-4 w-4" />
        Debug Panel
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-[600px] max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-900 text-white p-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Panel - Dashboard Mautic
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              User ID: {user?.uid || 'Não autenticado'}
            </p>
          </div>

          <div className="flex border-b border-gray-200">
            {['overview', 'api-test', 'data', 'discrepancies'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="p-4 overflow-y-auto max-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">
                      {loading || dashboardLoading ? (
                        <span className="text-yellow-600">Carregando...</span>
                      ) : error ? (
                        <span className="text-red-600">Erro</span>
                      ) : (
                        <span className="text-green-600">OK</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Contas</p>
                    <p className="font-medium">{accounts.length}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Daily Sends</p>
                    <p className="font-medium">{dailySends.length} dias</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total (Daily)</p>
                    <p className="font-medium">
                      {dailySends.reduce((sum, day) => sum + (day.count || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => testRefresh(true)}
                    disabled={loading || dashboardLoading}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                  >
                    Refresh com Filtros
                  </button>
                  <button
                    onClick={() => testRefresh(false)}
                    disabled={loading || dashboardLoading}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Refresh sem Filtros
                  </button>
                  <button
                    onClick={forceRefresh}
                    disabled={loading || dashboardLoading}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Force Refresh
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'api-test' && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => testDateFilters()}
                    disabled={testingApi}
                    className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                  >
                    Testar Filtros de Data
                  </button>
                  <button
                    onClick={() => testApiEndpoint('metrics')}
                    disabled={testingApi}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Test Metrics
                  </button>
                  <button
                    onClick={() => testApiEndpoint('by-date')}
                    disabled={testingApi}
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Test By Date
                  </button>
                </div>

                <div className="space-y-2">
                  {Object.entries(testResults).map(([endpoint, result]) => (
                    <div key={endpoint} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{endpoint}</span>
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                      {result.data && (
                        <pre className="text-xs mt-2 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2).slice(0, 200)}...
                        </pre>
                      )}
                      {result.error && (
                        <p className="text-xs text-red-600 mt-2">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-2">Dados Calculados</h4>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-2">Metrics Raw</h4>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(metrics, null, 2).slice(0, 300)}...
                  </pre>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium mb-2">General Rates Raw</h4>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(generalRates, null, 2).slice(0, 300)}...
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'discrepancies' && (
              <div className="space-y-4">
                {discrepancies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>Nenhuma discrepância encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {discrepancies.map((disc, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 p-3 rounded">
                        <h4 className="font-medium text-red-900">{disc.field}</h4>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">
                              {disc.metrics !== undefined ? 'Metrics:' : 'Daily:'}
                            </span>
                            <p className="font-medium">
                              {(disc.metrics || disc.daily || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {disc.rates !== undefined ? 'Rates:' : 'API:'}
                            </span>
                            <p className="font-medium">
                              {(disc.rates || disc.api || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Diferença:</span>
                            <p className="font-medium text-red-600">
                              {disc.difference.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
