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
import { Users, RefreshCw } from 'lucide-react';

const LeadChart = ({ 
  selectedAccount = 'all', 
  selectedPeriod = '30',
  customDateRange = null,
  className = '' 
}) => {
  const { user } = useAuthContext();
  const [leadData, setLeadData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar dados de leads
  const fetchLeadData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      // Preparar filtros de data
      const filters = {};
      
      if (customDateRange && customDateRange.startDate && customDateRange.endDate) {
        filters.startDate = customDateRange.startDate;
        filters.endDate = customDateRange.endDate;
      } else {
        const endDate = new Date();
        const startDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000);
        filters.startDate = startDate.toISOString().split('T')[0];
        filters.endDate = endDate.toISOString().split('T')[0];
      }

      // Usar userId "teste-certo" e conta específica como no exemplo
      const testUserId = 'teste-certo';
      
      if (selectedAccount && selectedAccount !== 'all') {
        filters.accountIds = selectedAccount;
      } else {
        filters.accountIds = '682e5d60a408065db40b8938';
      }

      console.log('🔍 Buscando dados de leads:', filters);

      const response = await metricsMailApi.getLeadStats(testUserId, filters);

      if (response.success && response.data) {
        const chartData = [];
        
        if (response.data.datasets && response.data.datasets.length > 0) {
          const dateMap = new Map();
          
          response.data.datasets.forEach(dataset => {
            dataset.data.forEach(item => {
              const date = item.date;
              const count = item.count || 0;
              
              if (dateMap.has(date)) {
                dateMap.set(date, dateMap.get(date) + count);
              } else {
                dateMap.set(date, count);
              }
            });
          });

          // Converter para array ordenado
          for (const [date, count] of dateMap) {
            chartData.push({
              date: new Date(date).toLocaleDateString('pt-BR', { 
                day: '2-digit',
                month: '2-digit'
              }),
              leads: count,
              fullDate: date
            });
          }

          chartData.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
        }

        setLeadData(chartData);
        console.log('✅ Dados de leads processados:', chartData);
      } else {
        setError('Nenhum dado encontrado');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar dados de leads:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [user?.uid, selectedAccount, selectedPeriod, customDateRange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          <p className="text-sm text-blue-600">
            {`${payload[0].value} leads`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Entrada de Leads</h3>
            <p className="text-sm text-gray-600">Leads cadastrados por dia</p>
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

      {/* Gráfico */}
      {error ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-red-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <p className="font-medium">Erro ao carregar dados</p>
            <button
              onClick={fetchLeadData}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
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
      ) : leadData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={leadData}>
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
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#3B82F6' }}
              name="Leads"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="font-medium">Nenhum lead no período</p>
            <p className="text-sm text-gray-500 mt-1">
              Dados aparecerão quando houver leads cadastrados
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadChart;