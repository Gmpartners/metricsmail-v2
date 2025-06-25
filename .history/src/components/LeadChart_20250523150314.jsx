import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { metricsMailApi } from '../services/MetricsMailApiService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Users, RefreshCw, TrendingUp, Calendar } from 'lucide-react';

const LeadChart = ({ 
  selectedAccount = 'all', 
  selectedPeriod = '30',
  customDateRange = null,
  className = ''
}) => {
  const { user } = useAuthContext();
  const [leadData, setLeadData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchLeadData = async () => {
    if (!user?.uid) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filters = {};
      
      if (customDateRange && customDateRange.startDate && customDateRange.endDate) {
        filters.startDate = customDateRange.startDate;
        filters.endDate = customDateRange.endDate;
      } else {
        const hoje = new Date();
        const diasAtras = new Date(hoje.getTime() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000);
        
        filters.startDate = diasAtras.toISOString().split('T')[0];
        filters.endDate = hoje.toISOString().split('T')[0];
      }

      if (selectedAccount && selectedAccount !== 'all') {
        filters.accountIds = selectedAccount;
      }

      console.log('🔍 Filtros enviados para API:', filters);
      console.log('📱 UserID:', user.uid);

      const response = await metricsMailApi.getLeadStats(user.uid, filters);
      console.log('📊 Resposta da API:', response);

      if (response.success && response.data) {
        setLeadData(response.data);
        
        const processedData = processChartData(response.data);
        console.log('📈 Dados processados para gráfico:', processedData);
        
        setChartData(processedData);
        setLastUpdate(new Date());
        
      } else {
        const errorMsg = response.message || 'Nenhum dado de lead encontrado';
        console.log('⚠️ Sem dados:', errorMsg);
        setError(errorMsg);
        setLeadData(null);
        setChartData([]);
      }
    } catch (err) {
      console.error('❌ Erro completo:', err);
      setError('Erro ao carregar dados de leads');
      setLeadData(null);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (apiData) => {
    console.log('🔄 Processando dados da API:', apiData);
    
    if (!apiData || !apiData.datasets || apiData.datasets.length === 0) {
      console.log('⚠️ Sem datasets para processar');
      return [];
    }

    const allDates = new Set();
    apiData.datasets.forEach(dataset => {
      if (dataset.data && Array.isArray(dataset.data)) {
        dataset.data.forEach(item => {
          if (item.date) {
            allDates.add(item.date);
          }
        });
      }
    });

    const sortedDates = Array.from(allDates).sort();
    console.log('📅 Datas encontradas:', sortedDates);

    const chartPoints = sortedDates.map(date => {
      const dataPoint = {
        date: new Date(date).toLocaleDateString('pt-BR', { 
          day: '2-digit',
          month: '2-digit'
        }),
        fullDate: date,
        leads: 0,
        isRealTime: false,
        accountsData: []
      };

      apiData.datasets.forEach(dataset => {
        const dayData = dataset.data?.find(item => item.date === date);
        if (dayData) {
          const count = dayData.count || 0;
          dataPoint.leads += count;
          dataPoint.isRealTime = dataPoint.isRealTime || dayData.isRealTime || false;
          
          if (count > 0) {
            dataPoint.accountsData.push({
              accountName: dataset.accountName || 'Conta sem nome',
              count: count,
              color: dataset.color || '#3B82F6'
            });
          }
        }
      });

      return dataPoint;
    });

    console.log('📊 Pontos do gráfico criados:', chartPoints);
    return chartPoints;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-900 mb-2">{`Data: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-600">
              {`${data.leads} leads total`}
              {data.isRealTime && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Tempo Real
                </span>
              )}
            </p>
            
            {data.accountsData && data.accountsData.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Por conta:</p>
                {data.accountsData.map((account, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: account.color }}
                    ></div>
                    <span className="text-gray-700">
                      {account.accountName}: {account.count} leads
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchLeadData();
  }, [user?.uid, selectedAccount, selectedPeriod, customDateRange]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getTotalLeads = () => {
    if (leadData?.summary?.totalLeads) {
      return leadData.summary.totalLeads;
    }
    return chartData.reduce((sum, point) => sum + point.leads, 0);
  };

  const getAveragePerDay = () => {
    if (leadData?.summary?.averagePerDay) {
      return leadData.summary.averagePerDay;
    }
    const total = getTotalLeads();
    const days = chartData.length || 1;
    return (total / days).toFixed(1);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Entrada de Leads</h3>
            <p className="text-sm text-gray-600">
              Leads cadastrados por dia
              {lastUpdate && (
                <span className="ml-2 text-xs text-gray-400">
                  • Atualizado às {lastUpdate.toLocaleTimeString('pt-BR')}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right mr-4">
            <div className="text-sm font-medium text-gray-900">
              {formatNumber(getTotalLeads())} leads
            </div>
            <div className="text-xs text-gray-500">
              {getAveragePerDay()}/dia
            </div>
          </div>
          
          <button
            onClick={fetchLeadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {selectedAccount !== 'all' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <TrendingUp className="h-4 w-4" />
            <span>Dados filtrados por conta específica</span>
          </div>
        </div>
      )}

      {error ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-red-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <p className="font-medium mb-2">Erro ao carregar dados</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchLeadData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
            <p>Carregando dados de leads...</p>
          </div>
        </div>
      ) : chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ 
                  fill: '#3B82F6', 
                  strokeWidth: 2, 
                  r: 4
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#3B82F6',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(getTotalLeads())}
              </div>
              <div className="text-sm text-gray-600">Total de Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getAveragePerDay()}
              </div>
              <div className="text-sm text-gray-600">Média por Dia</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {leadData?.datasets?.length || 0}
              </div>
              <div className="text-sm text-gray-600">
                {(leadData?.datasets?.length || 0) === 1 ? 'Conta' : 'Contas'}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Nenhum lead no período</p>
            <p className="text-sm text-gray-500 mt-1">
              Dados aparecerão quando houver leads cadastrados
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>Tente ajustar o período ou verificar as contas conectadas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadChart;