import { useEffect, useState } from 'react';
import { useMetrics } from '../contexts/MetricsContext';
import { useAuthContext } from '../hooks/useAuthContext';
import { 
  Mail, 
  Eye, 
  MousePointer, 
  TrendingUp,
  Server,
  Plus,
  RefreshCw,
  Activity,
  Users,
  Target,
  BarChart3,
  Calendar,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import DebugPanel from '../components/DebugPanel';
import LeadChart from '../components/LeadChart';

const Dashboard = () => {
  const { user } = useAuthContext();
  const { 
    metrics,
    accounts, 
    emails,
    events,
    accountsLoading, 
    dashboardLoading,
    loading,
    error,
    data,
    generalRates,
    lastSendDate,
    metricsByAccount,
    dailySends,
    dailyOpens,
    dailyClicks,
    refreshData,
    loadDashboardData,
    fetchDailyMetrics,
    fetchMetricsByDate,
    forceRefresh,
    fetchAccounts
  } = useMetrics();

  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedAccount, setSelectedAccount] = useState('all'); // 'all' ou accountId específico
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);

  // Cores do tema
  const colors = {
    primary: '#8B5CF6',   // purple-500
    success: '#10B981',   // emerald-500
    info: '#3B82F6',      // blue-500
    warning: '#F59E0B',   // amber-500
    danger: '#EF4444',    // red-500
    gray: '#6B7280'       // gray-500
  };

  // Dados de estatísticas principais (SEM dados fake)
  const mainStats = [
    {
      title: 'Total Enviados',
      value: data.totals.sentCount || 0,
      icon: Send,
      color: 'purple',
      subtitle: 'emails no período'
    },
    {
      title: 'Taxa de Abertura',
      value: data.totals.sentCount > 0 ? `${((data.totals.openCount / data.totals.sentCount) * 100).toFixed(1)}%` : '0.0%',
      icon: Eye,
      color: 'green',
      subtitle: 'do total enviado'
    },
    {
      title: 'Taxa de Clique',
      value: data.totals.sentCount > 0 ? `${((data.totals.clickCount / data.totals.sentCount) * 100).toFixed(1)}%` : '0.0%',
      icon: MousePointer,
      color: 'blue',
      subtitle: 'CTR do período'
    },
    {
      title: 'Taxa de Entrega',
      value: data.totals.sentCount > 0 ? `${((data.totals.deliveredCount || data.totals.sentCount) / data.totals.sentCount * 100).toFixed(1)}%` : '0.0%',
      icon: Target,
      color: 'orange',
      subtitle: 'deliverabilidade'
    }
  ];

  // KPIs secundários
  const secondaryStats = [
    { 
      label: 'Aberturas Totais', 
      value: data.totals.openCount || 0, 
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Cliques Totais', 
      value: data.totals.clickCount || 0, 
      icon: MousePointer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Aberturas Únicas', 
      value: data.totals.uniqueOpens || 0, 
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      label: 'Cliques Únicos', 
      value: data.totals.uniqueClicks || 0, 
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  // Preparar dados para gráficos
  const timelineData = dailySends.map((send, index) => {
    const opens = dailyOpens[index] || { totalOpens: 0, uniqueOpens: 0 };
    const clicks = dailyClicks[index] || { totalClicks: 0, uniqueClicks: 0 };
    
    return {
      date: new Date(send.date).toLocaleDateString('pt-BR', { 
        day: '2-digit',
        month: '2-digit'
      }),
      enviados: send.count || 0,
      aberturas: opens.totalOpens || 0,
      aberturasUnicas: opens.uniqueOpens || 0,
      cliques: clicks.totalClicks || 0,
      cliquesUnicos: clicks.uniqueClicks || 0,
      fullDate: send.date
    };
  }).slice(-parseInt(selectedPeriod));

  // Dados para gráfico de performance por conta
  const accountChartData = metricsByAccount.map((account, index) => ({
    name: account.account?.name?.substring(0, 15) || `Conta ${index + 1}`,
    enviados: account.metrics?.sentCount || 0,
    aberturas: account.metrics?.openCount || 0,
    cliques: account.metrics?.clickCount || 0,
    taxaAbertura: account.metrics?.openRate || 0
  }));

  // Função para obter filtros (datas + conta)
  const getFilters = () => {
    const dateFilters = showCustomRange && customDateRange.startDate && customDateRange.endDate
      ? {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate
        }
      : {
          startDate: new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        };

    // Adicionar filtro de conta se não for "all"
    if (selectedAccount !== 'all') {
      dateFilters.accountIds = selectedAccount;
    }

    return dateFilters;
  };

  // Função para obter datas do período (mantida para compatibilidade)
  const getDateRange = () => {
    return getFilters();
  };

  // 🔥 CORREÇÃO: Função para refresh igual ao DebugPanel
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔄 [${timestamp}] Dashboard refresh iniciado...`);
    
    try {
      // 🎯 CORREÇÃO: Mesmo código que funciona no DebugPanel
      const filters = getFilters(); // Agora inclui filtro de conta
      console.log('📅 Dashboard aplicando filtros:', filters);
      
      // Aplicar o mesmo refresh que o DebugPanel faz (que funciona)
      await Promise.all([
        fetchAccounts(), // Buscar contas primeiro
        loadDashboardData(filters), // COM filtros incluindo conta
        fetchDailyMetrics(filters) // COM filtros incluindo conta
      ]);
      
      // refreshData() sem filtros pode estar causando o problema
      // Chamando por último para não sobrescrever
      await refreshData();
      
      console.log(`✅ [${timestamp}] Dashboard refresh concluído`);
    } catch (error) {
      console.error(`❌ [${timestamp}] Erro no dashboard refresh:`, error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // 🔥 NOVA FUNÇÃO: Force refresh para casos extremos
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔥 [${timestamp}] Dashboard FORCE refresh iniciado...`);
    
    try {
      await forceRefresh();
      console.log(`✅ [${timestamp}] Dashboard FORCE refresh concluído`);
    } catch (error) {
      console.error(`❌ [${timestamp}] Erro no force refresh:`, error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 2000);
    }
  };

  // Aplicar filtros
  const applyFilters = async () => {
    const filters = getFilters(); // Inclui filtros de data e conta
    await Promise.all([
      loadDashboardData(filters),
      fetchDailyMetrics(filters)
    ]);
  };

  // Carregar dados quando período OU conta mudar
  useEffect(() => {
    if (!showCustomRange) {
      applyFilters();
    }
  }, [selectedPeriod, selectedAccount]); // Adicionado selectedAccount

  // Função para obter cor do card
  const getCardColor = (color) => {
    const colors = {
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`Data: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (accountsLoading && !accounts.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🐛 Debug Panel - apenas em desenvolvimento */}
      {import.meta.env.DEV && <DebugPanel />}
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Email Marketing
            </h1>
            <p className="text-gray-600 mt-1">
              Métricas detalhadas das suas campanhas Mautic
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || dashboardLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              title="Refresh com filtros de período aplicados"
            >
              <RefreshCw className={`h-4 w-4 ${(isRefreshing || dashboardLoading) ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            
            {/* Botão Force Refresh - apenas em DEV */}
            {import.meta.env.DEV && (
              <button
                onClick={handleForceRefresh}
                disabled={isRefreshing || dashboardLoading}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm"
                title="Force Refresh (limpa cache)"
              >
                🔥
              </button>
            )}
          </div>
        </div>

        {/* Filtros de Período e Conta */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            {/* Filtro de Conta */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Conta:</span>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm min-w-[140px]"
              >
                <option value="all">Todas as contas</option>
                {accounts.map((account) => (
                  <option key={account.id || account._id} value={account.id || account._id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro de Período */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Período:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  setShowCustomRange(false);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="15">Últimos 15 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="60">Últimos 60 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
              
              <button
                onClick={() => setShowCustomRange(!showCustomRange)}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                  showCustomRange 
                    ? 'bg-purple-100 border-purple-300 text-purple-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Customizado
              </button>
            </div>

            {showCustomRange && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <span className="text-gray-500">até</span>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <button
                  onClick={applyFilters}
                  disabled={!customDateRange.startDate || !customDateRange.endDate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  Aplicar
                </button>
              </div>
            )}

            {/* Indicador de filtro ativo */}
            {selectedAccount !== 'all' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                <span>Filtrando por: {accounts.find(acc => (acc.id || acc._id) === selectedAccount)?.name}</span>
                <button
                  onClick={() => setSelectedAccount('all')}
                  className="ml-1 hover:bg-purple-200 rounded-full p-1"
                  title="Remover filtro"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl ${getCardColor(stat.color)} bg-opacity-10 flex items-center justify-center`}>
                  <Icon className={`h-7 w-7 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de Leads - NOVA SEÇÃO */}
      <LeadChart 
        selectedAccount={selectedAccount}
        selectedPeriod={selectedPeriod}
        customDateRange={showCustomRange ? customDateRange : null}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Envios por Dia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Envios por Dia</h3>
              <p className="text-sm text-gray-600">Volume de emails enviados diariamente</p>
            </div>
          </div>
          
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorEnviados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="enviados"
                  stroke={colors.primary}
                  fillOpacity={1}
                  fill="url(#colorEnviados)"
                  strokeWidth={3}
                  name="Enviados"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum dado de envio disponível</p>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de Aberturas por Dia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Aberturas por Dia</h3>
              <p className="text-sm text-gray-600">Totais vs Únicas</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Totais</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Únicas</span>
              </div>
            </div>
          </div>
          
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
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
                  dataKey="aberturas"
                  stroke={colors.success}
                  strokeWidth={3}
                  dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                  name="Aberturas Totais"
                />
                <Line
                  type="monotone"
                  dataKey="aberturasUnicas"
                  stroke={colors.info}
                  strokeWidth={3}
                  dot={{ fill: colors.info, strokeWidth: 2, r: 4 }}
                  name="Aberturas Únicas"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum dado de abertura disponível</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Cliques por Dia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cliques por Dia</h3>
              <p className="text-sm text-gray-600">Totais vs Únicos</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Totais</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-gray-600">Únicos</span>
              </div>
            </div>
          </div>
          
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timelineData}>
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
                <Bar 
                  dataKey="cliques" 
                  fill={colors.info} 
                  name="Cliques Totais"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="cliquesUnicos" 
                  fill="#6366F1" 
                  name="Cliques Únicos"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MousePointer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum dado de clique disponível</p>
              </div>
            </div>
          )}
        </div>

        {/* Performance por Conta */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance por Conta</h3>
              <p className="text-sm text-gray-600">Comparativo de envios</p>
            </div>
            <Link to="/accounts" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Gerenciar
            </Link>
          </div>
          
          {accountChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accountChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="enviados" 
                  fill={colors.primary} 
                  name="Enviados"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Server className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2">Nenhuma conta conectada</p>
                <Link
                  to="/accounts"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Conectar Conta
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status e Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status do Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">Contas Ativas</span>
              </div>
              <span className="text-green-700 font-bold">{accounts.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">Emails Cadastrados</span>
              </div>
              <span className="text-blue-700 font-bold">{data.stats.totalEmails}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-900">Último Envio</span>
              </div>
              <span className="text-purple-700 font-bold text-sm">
                {lastSendDate ? new Date(lastSendDate).toLocaleDateString('pt-BR') : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">API Mautic</span>
              </div>
              <span className="text-green-700 font-bold">Online</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
            </div>
            <Link to="/metrics" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Ver todas
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 6).map((event, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.email?.subject || 'Email sem assunto'}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="capitalize">{event.eventType || 'evento'}</span> • {event.contactEmail || 'contato'}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {event.timestamp ? new Date(event.timestamp).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'agora'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade recente</h4>
              <p className="text-gray-600">As atividades de email aparecerão aqui</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg text-white p-6">
        <h3 className="text-xl font-bold mb-4">Resumo do Período</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{data.totals.sentCount.toLocaleString()}</p>
            <p className="text-purple-100 text-sm">Emails Enviados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{data.totals.uniqueOpens.toLocaleString()}</p>
            <p className="text-purple-100 text-sm">Aberturas Únicas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{data.totals.uniqueClicks.toLocaleString()}</p>
            <p className="text-purple-100 text-sm">Cliques Únicos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{accounts.length}</p>
            <p className="text-purple-100 text-sm">Contas Conectadas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;