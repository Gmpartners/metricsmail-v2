import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { metricsMailApi } from '../services/MetricsMailApiService';
import { useMetrics } from '../contexts/MetricsContext';
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
  const { accounts } = useMetrics();
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
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(selectedPeriod));
        
        filters.startDate = startDate.toISOString().split('T')[0];
        filters.endDate = endDate.toISOString().split('T')[0];
      }

      if (selectedAccount && selectedAccount !== 'all') {
        filters.accountIds = selectedAccount;
      }

      console.log('📅 LeadChart - Filtros aplicados:', filters);

      const response = await metricsMailApi.getLeadStats(user.uid, filters);

      if (response.success && response.data) {
        setLeadData(response.data);
        const processedData = processChartData(response.data, filters);
        setChartData(processedData);
        setLastUpdate(new Date());
      } else {
        const errorMsg = response.message || 'Nenhum dado de lead encontrado';
        setError(errorMsg);
        setLeadData(null);
        setChartData([]);
      }
    } catch (err) {
      setError('Erro ao carregar dados de leads');
      setLeadData(null);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  const formatDateTooltip = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  const processChartData = (apiData, filters) => {
    if (!apiData || !apiData.datasets || apiData.datasets.length === 0) {
      return [];
    }

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    console.log('📊 Processando dados do gráfico:', {
      startDate: filters.startDate,
      endDate: filters.endDate,
      datasets: apiData.datasets.length
    });

    const allDates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const chartPoints = allDates.map(dateStr => {
      const isToday = dateStr === todayStr;
      const isRecent = Math.abs(new Date(dateStr) - new Date(todayStr)) <= 2 * 24 * 60 * 60 * 1000;
      
      const dataPoint = {
        date: formatDateDisplay(dateStr),
        fullDate: dateStr,
        leads: 0,
        isRealTime: isToday || isRecent,
        isToday: isToday,
        accountsData: []
      };

      apiData.datasets.forEach(dataset => {
        const dayData = dataset.data?.find(item => item.date === dateStr);
        if (dayData) {
          const count = dayData.count || 0;
          dataPoint.leads += count;
          dataPoint.isRealTime = dataPoint.isRealTime || dayData.isRealTime || false;
          
          dataPoint.accountsData.push({
            accountName: dataset.accountName || 'Conta sem nome',
            count: count,
            color: dataset.color || '#3B82F6'
          });
        } else {
          dataPoint.accountsData.push({
            accountName: dataset.accountName || 'Conta sem nome',
            count: 0,
            color: dataset.color || '#3B82F6'
          });
        }
      });

      console.log(`📈 Data ${dateStr} (exibida como ${dataPoint.date}): ${dataPoint.leads} leads`);

      return dataPoint;
    });

    return chartPoints;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-medium text-gray-900 mb-2">
            {`Data: ${formatDateTooltip(data.fullDate)}`}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-blue-600">
              {`${data.leads} leads total`}
              {data.isToday && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Hoje
                </span>
              )}
              {data.isRealTime && !data.isToday && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Tempo Real
                </span>
              )}
            </p>
            
            {data.accountsData && data.accountsData.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Por conta:</p>
                {data.accountsData
                  .filter(account => account.count > 0)
                  .map((account, idx) => (
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
        
        <button
          onClick={fetchLeadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
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
                dot={(props) => {
                  const { payload } = props;
                  if (payload.isToday) {
                    return (
                      <circle
                        {...props}
                        r={6}
                        fill="#10B981"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  if (payload.isRealTime) {
                    return (
                      <circle
                        {...props}
                        r={5}
                        fill="#3B82F6"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return <circle {...props} fill="#3B82F6" strokeWidth={2} r={4} />;
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

          <div className="mt-6 pt-4 border-t border-gray-100">
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
              <span>Verifique se há leads cadastrados no período selecionado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadChart;