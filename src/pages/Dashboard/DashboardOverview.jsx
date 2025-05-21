import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMetrics } from '../../contexts/MetricsContext';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, 
  AreaChart, Area 
} from 'recharts';
import { metricsMailApi } from '../../services/MetricsMailApiService';
import MetricsFilter from '../../components/MetricsFilter.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// Importar o StatCard componente modernizado
import StatCard from '../../components/StatCard';
import {
  AreaChart as AreaChartIcon, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  CalendarRange, Mail, MousePointerClick, Share2, ChevronDown, ChevronUp, 
  Info, ArrowUpRight, ArrowDownRight, TrendingUp, Users, Eye
} from 'lucide-react';

// Cores modernas para gráficos
const CHART_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#a855f7', // Violet
  '#f43f5e', // Rose
  '#f59e0b'  // Amber
];

const CHART_GRID_COLOR = 'rgba(255, 255, 255, 0.05)';
const CHART_LABEL_COLOR = 'rgba(255, 255, 255, 0.6)';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num === 0) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return '0%';
  return value.toFixed(1) + '%';
};

const EmailPerformanceCard = ({ email, index }) => {
  const metrics = email.metrics || {};
  
  return (
    <Card className="bg-gradient-to-br from-[#202942] to-[#2a3452] border border-white/8 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <Badge 
            variant="outline" 
            className="bg-indigo-600/40 text-indigo-300 border-indigo-500/30 rounded-lg shadow-sm mb-2"
          >
            {email.account?.name || 'Conta não especificada'}
          </Badge>
        </div>
        <CardTitle className="text-base line-clamp-1 text-white" title={email.subject}>
          {email.subject || 'Email sem assunto'}
        </CardTitle>
        <CardDescription className="text-blue-300/70 text-xs">
          Enviado em {new Date(email.sentDate || Date.now()).toLocaleDateString('pt-BR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex flex-col">
            <span className="text-blue-300/70 text-xs">Enviados</span>
            <span className="text-lg font-semibold text-white">{formatNumber(metrics.sentCount || 0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-blue-300/70 text-xs">Taxa de Abertura</span>
            <span className="text-lg font-semibold text-white">{formatPercent(metrics.openRate || 0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-blue-300/70 text-xs">Cliques</span>
            <span className="text-lg font-semibold text-white">{formatNumber(metrics.clickCount || 0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-blue-300/70 text-xs">Taxa de Clique</span>
            <span className="text-lg font-semibold text-white">{formatPercent(metrics.clickToOpenRate || 0)}</span>
          </div>
        </div>
        
        <div className="w-full mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-300/70">Progresso da Conversão</span>
            <span className="text-xs font-medium text-white">
              {formatPercent(metrics.clickToOpenRate || 0)}
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mt-1 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" 
              style={{ width: `${Math.min(100, metrics.clickToOpenRate || 0)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ModernTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-lg bg-[#202942]/80 border border-white/10 rounded-lg p-3 shadow-2xl">
        <p className="text-white font-medium mb-2">
          {typeof label === 'string' && label.includes('-') 
            ? new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between my-1">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
              <span className="text-white/80">{entry.name}:</span>
            </div>
            <span className="font-semibold ml-4 text-white">
              {typeof entry.value === 'number' && entry.dataKey.toLowerCase().includes('rate')
                ? `${entry.value.toFixed(1)}%`
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardOverview = (props) => {
  const { 
    data, 
    dateRange, 
    setDateRange,
    refreshData,
    isFiltering,
    resetFiltersAndRetry,
    fetchEvents,
    sendsData,
    opensData,
    clicksData,
    ratesData,
    accounts
  } = useMetrics();
  
  const [selectedAccounts, setSelectedAccounts] = useState(['all']);
  const [selectedEmails, setSelectedEmails] = useState(['none']);
  const [compareData, setCompareData] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [comparisonMetric, setComparisonMetric] = useState('openRate');
  const [isMobile, setIsMobile] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);
  const [prevPeriodData, setPrevPeriodData] = useState(null);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState(null);
  
  const [totals, setTotals] = useState({
    sentCount: 0,
    openCount: 0,
    clickCount: 0,
    clickToOpenRate: 0
  });
  
  const calculateTotalsFromDailyData = useCallback(() => {
    if (!sendsData || !opensData || !clicksData) return null;
    
    const totalSends = sendsData.reduce((sum, item) => sum + (item.totalSends || 0), 0);
    const totalOpens = opensData.reduce((sum, item) => sum + (item.totalOpens || 0), 0);
    const totalClicks = clicksData.reduce((sum, item) => sum + (item.totalClicks || 0), 0);
    const clickToOpenRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;
    
    return {
      sentCount: totalSends,
      openCount: totalOpens,
      clickCount: totalClicks,
      clickToOpenRate
    };
  }, [sendsData, opensData, clicksData]);
  
  useEffect(() => {
    if (data && data.totals) {
      let calculatedTotals = {
        sentCount: data.totals.sentCount || 0,
        openCount: data.totals.openCount || 0,
        clickCount: data.totals.clickCount || 0,
        clickToOpenRate: data.averages?.clickToOpenRate || 0
      };
      
      if (calculatedTotals.sentCount === 0 && calculatedTotals.openCount === 0 && calculatedTotals.clickCount === 0) {
        const dailyTotals = calculateTotalsFromDailyData();
        if (dailyTotals && (dailyTotals.sentCount > 0 || dailyTotals.openCount > 0 || dailyTotals.clickCount > 0)) {
          calculatedTotals = dailyTotals;
          console.log('📊 Totais calculados a partir dos dados diários:', calculatedTotals);
        }
      }
      
      setTotals(calculatedTotals);
    }
  }, [data, calculateTotalsFromDailyData]);
  
  useEffect(() => {
    console.log('🔍 [DashboardOverview] Dados recebidos:', {
      data,
      sendsData,
      opensData,
      clicksData,
      ratesData
    });
    
    if (accounts && accounts.length > 0) {
      console.table(accounts.map(acc => ({
        id: acc.id,
        accountId: acc.accountId,
        name: acc.name,
        provider: acc.provider || 'desconhecido'
      })));
    }
  }, [accounts, data, sendsData, opensData, clicksData, ratesData]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const encodeIds = useCallback((ids) => {
    if (!ids || !Array.isArray(ids)) return '';
    
    const encoded = ids.map(id => encodeURIComponent(id)).join(',');
    console.log('🔍 [DashboardOverview] IDs codificados:', { original: ids, encoded });
    return encoded;
  }, []);

  const mapAccountNamesToIds = useCallback((accountNames) => {
    console.log('🔍 [DashboardOverview] Mapeando nomes de contas para IDs:', accountNames);
    
    if (!accountNames || !Array.isArray(accountNames) || accountNames.includes('all')) {
      console.log('🔍 [DashboardOverview] Seleção "all" detectada ou array inválido, retornando ["all"]');
      return ['all'];
    }

    const accountIds = accountNames.map(accountName => {
      const account = accounts.find(acc => acc.name === accountName);
      const accountId = account?.accountId || account?.id || null;
      console.log(`🔍 [DashboardOverview] Mapeando conta: "${accountName}" -> ${accountId || 'não encontrada'}`);
      return accountId;
    }).filter(id => id !== null);

    console.log('🔍 [DashboardOverview] IDs de contas mapeados:', accountIds);
    
    if (accountIds.length === 0) {
      console.warn('⚠️ [DashboardOverview] Nenhum ID de conta válido encontrado após mapeamento. Usando "all" como fallback.');
      return ['all'];
    }
    
    return accountIds;
  }, [accounts]);
  
  useEffect(() => {
    const loadCompareData = async () => {
      console.log('🔄 [DashboardOverview] Iniciando carregamento de dados comparativos...');
      
      setIsLoadingCompare(true);
      setCompareError(null);
      
      try {
        const userId = localStorage.getItem('userId') || 'wBnoxuKZfUUluhg8jwUtQBB3Jgo2';
        console.log('🔍 [DashboardOverview] UserID para requisição:', userId);
        
        let compareType = 'accounts';
        let ids = [];
        
        if (!selectedEmails.includes('none')) {
          compareType = 'emails';
          ids = selectedEmails;
          console.log('🔍 [DashboardOverview] Comparando emails:', ids);
        } else if (!selectedAccounts.includes('all')) {
          compareType = 'accounts';
          ids = mapAccountNamesToIds(selectedAccounts);
          console.log('🔍 [DashboardOverview] Comparando contas:', { 
            nomes: selectedAccounts, 
            ids: ids 
          });
        }
        
        if (ids.length === 0) {
          console.log('🔍 [DashboardOverview] Nenhum item selecionado para comparação, pulando requisição');
          setCompareData(null);
          setIsLoadingCompare(false);
          return;
        }
        
        const filters = {
          startDate: dateRange.from,
          endDate: dateRange.to
        };
        
        if (compareType === 'emails') {
          filters.emailIds = encodeIds(ids);
        } else {
          filters.accountIds = encodeIds(ids);
        }
        
        console.log('🔍 [DashboardOverview] Parâmetros finais da requisição:', { 
          compareType,
          filters,
          endpoint: `/api/users/${userId}/metrics/compare`
        });
        
        const response = await metricsMailApi.getMetricsCompare(userId, compareType, filters);
        
        console.log('✅ [DashboardOverview] Resposta da API de comparação:', response);
        
        if (response && response.success && response.data) {
          setCompareData(response.data);
          
          const daysInCurrentRange = Math.floor(
            (new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24)
          );
          
          const prevEndDate = new Date(dateRange.from);
          prevEndDate.setDate(prevEndDate.getDate() - 1);
          
          const prevStartDate = new Date(prevEndDate);
          prevStartDate.setDate(prevStartDate.getDate() - daysInCurrentRange);
          
          const prevFilters = {
            ...filters,
            startDate: prevStartDate.toISOString().split('T')[0],
            endDate: prevEndDate.toISOString().split('T')[0]
          };
          
          console.log('🔍 [DashboardOverview] Buscando dados do período anterior:', { 
            prevFilters,
            daysInRange: daysInCurrentRange
          });
          
          const prevResponse = await metricsMailApi.getMetricsCompare(userId, compareType, prevFilters);
          if (prevResponse && prevResponse.success && prevResponse.data) {
            setPrevPeriodData(prevResponse.data);
            console.log('✅ [DashboardOverview] Dados do período anterior recebidos:', prevResponse.data);
          }
        }
      } catch (error) {
        console.error('❌ [DashboardOverview] Erro ao buscar dados comparativos:', error);
        setCompareError(error.toString());
      } finally {
        setIsLoadingCompare(false);
        console.log('🔄 [DashboardOverview] Carregamento de dados comparativos finalizado');
      }
    };
    
    loadCompareData();
  }, [selectedAccounts, selectedEmails, dateRange, encodeIds, mapAccountNamesToIds]);
  
  useEffect(() => {
    const loadRecentEvents = async () => {
      console.log('🔄 [DashboardOverview] Carregando eventos recentes...');
      
      const events = await fetchEvents({
        eventTypes: 'open,click',
        limit: 20
      });
      
      if (events && events.events) {
        setRecentEvents(events.events);
        console.log(`✅ [DashboardOverview] ${events.events.length} eventos recentes carregados`);
      } else {
        console.log('ℹ️ [DashboardOverview] Nenhum evento recente encontrado');
      }
    };
    
    loadRecentEvents();
  }, [fetchEvents]);
  
  const dailyChartData = useMemo(() => {
    console.log('🔄 [DashboardOverview] Processando dados diários para gráficos', {
      sendsData,
      opensData,
      clicksData
    });
    
    if (!sendsData && !opensData && !clicksData) {
      console.log('ℹ️ [DashboardOverview] Dados diários incompletos, retornando array vazio');
      return [];
    }
    
    const datesToAdd = {};
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      datesToAdd[dateStr] = {
        date: dateStr,
        sends: 0,
        opens: 0,
        clicks: 0
      };
    }
    
    if (Array.isArray(sendsData)) {
      sendsData.forEach(item => {
        if (item && item.date) {
          const dateStr = new Date(item.date).toISOString().split('T')[0];
          if (datesToAdd[dateStr]) {
            const sendValue = item.totalSends || item.sends || item.count || 0;
            datesToAdd[dateStr].sends = sendValue;
            console.log(`✅ Processado dado de envio: ${dateStr} = ${sendValue}`);
          }
        }
      });
    }
    
    if (Array.isArray(opensData)) {
      opensData.forEach(item => {
        if (item && item.date) {
          const dateStr = new Date(item.date).toISOString().split('T')[0];
          if (datesToAdd[dateStr]) {
            const openValue = item.totalOpens || item.opens || item.count || 0;
            datesToAdd[dateStr].opens = openValue;
            console.log(`✅ Processado dado de abertura: ${dateStr} = ${openValue}`);
          }
        }
      });
    }
    
    if (Array.isArray(clicksData)) {
      clicksData.forEach(item => {
        if (item && item.date) {
          const dateStr = new Date(item.date).toISOString().split('T')[0];
          if (datesToAdd[dateStr]) {
            const clickValue = item.totalClicks || item.clicks || item.count || 0;
            datesToAdd[dateStr].clicks = clickValue;
            console.log(`✅ Processado dado de clique: ${dateStr} = ${clickValue}`);
          }
        }
      });
    }
    
    const result = Object.values(datesToAdd).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    console.log(`✅ [DashboardOverview] Dados diários processados: ${result.length} dias`, result);
    return result;
  }, [sendsData, opensData, clicksData, dateRange]);
  
  const comparisonChartData = useMemo(() => {
    console.log('🔄 [DashboardOverview] Processando dados comparativos para gráficos');
    
    if (!compareData || !compareData.items) {
      console.log('ℹ️ [DashboardOverview] Sem dados comparativos, retornando array vazio');
      return [];
    }
    
    const result = compareData.items.map(item => {
      const itemName = (compareData.compareType === 'emails') 
        ? (item.subject || `Email ${item.id}`) 
        : (item.name || `Conta ${item.id}`);
      
      return {
        name: itemName,
        openRate: item.metrics?.openRate || 0,
        clickRate: item.metrics?.clickRate || 0,
        clickToOpenRate: item.metrics?.clickToOpenRate || 0,
        bounceRate: item.metrics?.bounceRate || 0,
        unsubscribeRate: item.metrics?.unsubscribeRate || 0,
        sentCount: item.metrics?.sentCount || 0,
        openCount: item.metrics?.openCount || 0,
        clickCount: item.metrics?.clickCount || 0
      };
    });
    
    console.log(`✅ [DashboardOverview] Dados comparativos processados: ${result.length} itens`);
    return result;
  }, [compareData]);
  
  const getPreviousMetric = (metric) => {
    if (!prevPeriodData || !prevPeriodData.totals) return undefined;
    
    if (metric.includes('Rate')) {
      return prevPeriodData.averages?.[metric];
    }
    return prevPeriodData.totals?.[metric];
  };
  
  const formatDateTick = (value) => {
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };
  
  const logDebugState = useCallback(() => {
    console.group('🔍 [DashboardOverview] Estado atual');
    console.log('Contas selecionadas:', selectedAccounts);
    console.log('Emails selecionados:', selectedEmails);
    console.log('Período:', dateRange);
    console.log('Contas disponíveis:', accounts);
    console.log('Dados diários:', {
      sendsData,
      opensData,
      clicksData
    });
    console.log('Dados de métricas API:', {
      data,
      totais: data?.totals,
      médias: data?.averages
    });
    console.log('Dados de comparação:', compareData);
    console.log('Eventos recentes:', recentEvents);
    console.groupEnd();
  }, [selectedAccounts, selectedEmails, dateRange, accounts, sendsData, opensData, clicksData, data, compareData, recentEvents]);
  
  return (
    <div className="px-6 py-8 w-full overflow-auto bg-gradient-to-b from-[#0c1020] to-[#131a32]">
      <div className="mx-auto max-w-full">
        {/* Header com efeito de fundo */}
        <div className="relative mb-8 animate-fade-in">
          {/* Efeito de luz de background */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-30 bg-indigo-600 blur-3xl"></div>
          <div className="absolute -top-10 right-40 w-32 h-32 rounded-full opacity-20 bg-purple-600 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center">
              <div className="mr-3 h-8 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard de Métricas</h1>
            </div>
            <p className="text-blue-300/80 mt-2 ml-4">
              Visualize e compare o desempenho das suas campanhas de email marketing
            </p>
          </div>
        </div>
        
        {/* Debug Button - mantenha para desenvolvimento */}
        <button 
          onClick={logDebugState}
          className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-lg opacity-70 hover:opacity-100 shadow-md shadow-purple-600/20 transition-all hover:shadow-lg hover:shadow-purple-600/30"
        >
          Debug: Ver estado no console
        </button>
        
        {/* Filtros */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-[#202942]/60 backdrop-blur-md border border-white/8 rounded-xl p-5 shadow-xl">
            <h3 className="text-lg font-medium text-white mb-4">Filtros e Configurações</h3>
            <MetricsFilter 
              data={data}
              selectedAccounts={selectedAccounts}
              setSelectedAccounts={setSelectedAccounts}
              selectedEmails={selectedEmails}
              setSelectedEmails={setSelectedEmails}
              dateRange={dateRange}
              setDateRange={setDateRange}
              isFiltering={isFiltering || isLoadingCompare}
              refreshData={refreshData}
              resetFiltersAndRetry={resetFiltersAndRetry}
              isMobile={isMobile}
            />
          </div>
        </div>
        
        {/* Estatísticas - com efeitos de stagger e hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="animate-fade-in-up transform transition-all duration-500" style={{ animationDelay: '0.1s' }}>
            <StatCard 
              title="Total de Envios" 
              value={formatNumber(totals.sentCount)}
              previousValue={getPreviousMetric('sentCount')}
              icon={Mail}
              colorScheme="blue"
            />
          </div>
          
          <div className="animate-fade-in-up transform transition-all duration-500" style={{ animationDelay: '0.2s' }}>
            <StatCard 
              title="Total de Aberturas" 
              value={formatNumber(totals.openCount)}
              previousValue={getPreviousMetric('openCount')}
              icon={Eye}
              colorScheme="teal"
            />
          </div>
          
          <div className="animate-fade-in-up transform transition-all duration-500" style={{ animationDelay: '0.3s' }}>
            <StatCard 
              title="Total de Cliques" 
              value={formatNumber(totals.clickCount)}
              previousValue={getPreviousMetric('clickCount')}
              icon={MousePointerClick}
              colorScheme="orange"
            />
          </div>
          
          <div className="animate-fade-in-up transform transition-all duration-500" style={{ animationDelay: '0.4s' }}>
            <StatCard 
              title="Taxa de Clique em Abertura" 
              value={formatPercent(totals.clickToOpenRate)}
              previousValue={getPreviousMetric('clickToOpenRate')}
              icon={TrendingUp}
              colorScheme="purple"
            />
          </div>
        </div>
        
        {/* Abas de conteúdo - com novos estilos */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="bg-[#202942]/60 backdrop-blur-md border border-white/8 rounded-xl p-1 shadow-xl mb-4">
            <Tabs defaultValue="time-series">
              <div className="flex justify-between items-center mb-4 px-3 pt-3">
                <TabsList className="bg-[#1a2240] rounded-lg p-1">
                  <TabsTrigger 
                    value="time-series" 
                    className="rounded-lg py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Série Temporal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comparison"
                    className="rounded-lg py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Comparativo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="emails"
                    className="rounded-lg py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Emails
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[130px] h-9 bg-[#1a2240] border-white/10 rounded-lg text-white">
                      <SelectValue placeholder="Tipo de Gráfico" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#202942] border-white/10 text-white rounded-lg shadow-xl">
                      <SelectItem value="bar">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          <span>Barras</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="line">
                        <div className="flex items-center">
                          <LineChartIcon className="w-4 h-4 mr-2" />
                          <span>Linha</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="area">
                        <div className="flex items-center">
                          <AreaChartIcon className="w-4 h-4 mr-2" />
                          <span>Área</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pie">
                        <div className="flex items-center">
                          <PieChartIcon className="w-4 h-4 mr-2" />
                          <span>Pizza</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {chartType !== 'pie' && (
                    <Select value={comparisonMetric} onValueChange={setComparisonMetric}>
                      <SelectTrigger className="w-[150px] h-9 bg-[#1a2240] border-white/10 rounded-lg text-white">
                        <SelectValue placeholder="Métrica" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#202942] border-white/10 text-white rounded-lg shadow-xl">
                        <SelectItem value="openRate">Taxa de Abertura</SelectItem>
                        <SelectItem value="clickRate">Taxa de Clique</SelectItem>
                        <SelectItem value="clickToOpenRate">Clique em Abertura</SelectItem>
                        <SelectItem value="sentCount">Envios</SelectItem>
                        <SelectItem value="openCount">Aberturas</SelectItem>
                        <SelectItem value="clickCount">Cliques</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              <TabsContent value="time-series" className="px-4 pb-4">
                <Card className="bg-gradient-to-br from-[#202942] to-[#2a3452] border border-white/8 rounded-xl overflow-hidden shadow-xl">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg text-white tracking-tight">Evolução de Métricas</CardTitle>
                        <CardDescription className="text-blue-300/70">
                          {dateRange.from} até {dateRange.to}
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                          Envios
                        </Badge>
                        <Badge variant="outline" className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                          Aberturas
                        </Badge>
                        <Badge variant="outline" className="bg-pink-600/20 text-pink-400 border-pink-500/30">
                          Cliques
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {dailyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyChartData}>
                            <defs>
                              {/* Gradientes para as áreas sob as linhas */}
                              <linearGradient id="sendsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="opensGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDateTick}
                              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }} 
                              stroke="rgba(255, 255, 255, 0.1)"
                              axisLine={false}
                              tickLine={false}
                              padding={{ left: 10, right: 10 }}
                            />
                            <YAxis 
                              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }} 
                              stroke="rgba(255, 255, 255, 0.1)"
                              axisLine={false}
                              tickLine={false}
                              width={40}
                            />
                            <Tooltip 
                              content={<ModernTooltip />} 
                              cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: 20 }}
                              iconType="circle"
                              iconSize={8}
                            />
                            
                            {/* Áreas sob as linhas com opacidade baixa */}
                            <Area 
                              type="monotone" 
                              dataKey="sends" 
                              stroke="#3b82f6" 
                              fillOpacity={0.1}
                              fill="url(#sendsGradient)"
                              strokeWidth={0}
                              activeDot={false}
                              stackId="1"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="opens" 
                              stroke="#8b5cf6" 
                              fillOpacity={0.1}
                              fill="url(#opensGradient)"
                              strokeWidth={0}
                              activeDot={false}
                              stackId="2"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="clicks" 
                              stroke="#ec4899" 
                              fillOpacity={0.1}
                              fill="url(#clicksGradient)"
                              strokeWidth={0}
                              activeDot={false}
                              stackId="3"
                            />
                            
                            {/* Linhas principais */}
                            <Line 
                              type="monotone" 
                              dataKey="sends" 
                              stroke="#3b82f6" 
                              name="Envios"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{ r: 6, strokeWidth: 2, stroke: '#0c1020' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="opens" 
                              stroke="#8b5cf6" 
                              name="Aberturas"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{ r: 6, strokeWidth: 2, stroke: '#0c1020' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="clicks" 
                              stroke="#ec4899" 
                              name="Cliques"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{ r: 6, strokeWidth: 2, stroke: '#0c1020' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-[#1a2240]/40 rounded-lg">
                          <div className="w-16 h-16 mb-4 text-indigo-400 opacity-80">
                            <BarChart3 className="w-16 h-16" />
                          </div>
                          <p className="text-white mb-1">Nenhum dado disponível para o período selecionado</p>
                          <p className="text-blue-300/70 text-sm text-center max-w-md">
                            Tente ajustar seus filtros ou selecionar outro período para visualizar dados
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comparison" className="px-4 pb-4">
                <Card className="bg-gradient-to-br from-[#202942] to-[#2a3452] border border-white/8 rounded-xl overflow-hidden shadow-xl">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg text-white tracking-tight">
                          Comparativo de {comparisonChartData.length} {compareData?.compareType === 'emails' ? 'Emails' : 'Contas'}
                        </CardTitle>
                        <CardDescription className="text-blue-300/70">
                          Métrica: {
                            comparisonMetric === 'openRate' ? 'Taxa de Abertura' :
                            comparisonMetric === 'clickRate' ? 'Taxa de Clique' :
                            comparisonMetric === 'clickToOpenRate' ? 'Clique em Abertura' :
                            comparisonMetric === 'sentCount' ? 'Envios' :
                            comparisonMetric === 'openCount' ? 'Aberturas' :
                            comparisonMetric === 'clickCount' ? 'Cliques' : ''
                          }
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {isLoadingCompare ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center gap-4">
                            <div className="spinner-modern"></div>
                            <p className="text-blue-300/70">Carregando dados de comparação...</p>
                          </div>
                        </div>
                      ) : compareError ? (
                        <div className="flex items-center justify-center h-full flex-col gap-2">
                          <p className="text-blue-300/70">Erro ao carregar dados comparativos</p>
                          <p className="text-sm text-blue-300/50">{compareError}</p>
                          <button 
                            onClick={() => {
                              console.log('🔄 [DashboardOverview] Tentando novamente após erro:', compareError);
                              refreshData();
                            }}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-300"
                          >
                            Tentar novamente
                          </button>
                        </div>
                      ) : comparisonChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === 'bar' ? (
                            <BarChart data={comparisonChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
                                stroke="rgba(255, 255, 255, 0.1)"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                                stroke="rgba(255, 255, 255, 0.1)"
                                domain={
                                  comparisonMetric.includes('Rate') ? [0, 100] : [0, 'auto']
                                }
                                tickFormatter={
                                  comparisonMetric.includes('Rate') ? 
                                    (value) => `${value}%` : 
                                    (value) => value
                                }
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<ModernTooltip />} />
                              <Legend 
                                wrapperStyle={{ paddingTop: 20 }}
                                iconType="circle"
                                iconSize={8}
                              />
                              <Bar 
                                dataKey={comparisonMetric} 
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                                name={
                                  comparisonMetric === 'openRate' ? 'Taxa de Abertura' :
                                  comparisonMetric === 'clickRate' ? 'Taxa de Clique' :
                                  comparisonMetric === 'clickToOpenRate' ? 'Clique em Abertura' :
                                  comparisonMetric === 'sentCount' ? 'Envios' :
                                  comparisonMetric === 'openCount' ? 'Aberturas' :
                                  comparisonMetric === 'clickCount' ? 'Cliques' : ''
                                }
                              >
                                {comparisonChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          ) : chartType === 'line' ? (
                            <LineChart data={comparisonChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
                                stroke="rgba(255, 255, 255, 0.1)"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                                stroke="rgba(255, 255, 255, 0.1)"
                                domain={
                                  comparisonMetric.includes('Rate') ? [0, 100] : [0, 'auto']
                                }
                                tickFormatter={
                                  comparisonMetric.includes('Rate') ? 
                                    (value) => `${value}%` : 
                                    (value) => value
                                }
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<ModernTooltip />} />
                              <Legend 
                                wrapperStyle={{ paddingTop: 20 }}
                                iconType="circle"
                                iconSize={8}
                              />
                              <Line 
                                type="monotone"
                                dataKey={comparisonMetric} 
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                name={
                                  comparisonMetric === 'openRate' ? 'Taxa de Abertura' :
                                  comparisonMetric === 'clickRate' ? 'Taxa de Clique' :
                                  comparisonMetric === 'clickToOpenRate' ? 'Clique em Abertura' :
                                  comparisonMetric === 'sentCount' ? 'Envios' :
                                  comparisonMetric === 'openCount' ? 'Aberturas' :
                                  comparisonMetric === 'clickCount' ? 'Cliques' : ''
                                }
                                dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 2, stroke: '#1a2240' }}
                                activeDot={{ r: 8, strokeWidth: 2, stroke: '#1a2240' }}
                              />
                            </LineChart>
                          ) : chartType === 'pie' ? (
                            <PieChart>
                              <Pie
                                data={comparisonChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                innerRadius={60}
                                fill="#8884d8"
                                dataKey={comparisonMetric}
                                nameKey="name"
                                paddingAngle={2}
                              >
                                {comparisonChartData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                    stroke="#1a2240"
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<ModernTooltip />} />
                              <Legend 
                                wrapperStyle={{ paddingTop: 20 }}
                                iconType="circle"
                                iconSize={8}
                              />
                            </PieChart>
                          ) : (
                            <AreaChart data={comparisonChartData}>
                              <defs>
                                {comparisonChartData.map((entry, index) => (
                                  <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.1} />
                                  </linearGradient>
                                ))}
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
                                stroke="rgba(255, 255, 255, 0.1)"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                                stroke="rgba(255, 255, 255, 0.1)"
                                domain={
                                  comparisonMetric.includes('Rate') ? [0, 100] : [0, 'auto']
                                }
                                tickFormatter={
                                  comparisonMetric.includes('Rate') ? 
                                    (value) => `${value}%` : 
                                    (value) => value
                                }
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip content={<ModernTooltip />} />
                              <Legend 
                                wrapperStyle={{ paddingTop: 20 }}
                                iconType="circle"
                                iconSize={8}
                              />
                              <Area 
                                type="monotone"
                                dataKey={comparisonMetric} 
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="url(#colorGradient0)"
                                fillOpacity={0.6}
                                name={
                                  comparisonMetric === 'openRate' ? 'Taxa de Abertura' :
                                  comparisonMetric === 'clickRate' ? 'Taxa de Clique' :
                                  comparisonMetric === 'clickToOpenRate' ? 'Clique em Abertura' :
                                  comparisonMetric === 'sentCount' ? 'Envios' :
                                  comparisonMetric === 'openCount' ? 'Aberturas' :
                                  comparisonMetric === 'clickCount' ? 'Cliques' : ''
                                }
                              />
                            </AreaChart>
                          )}
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-[#1a2240]/40 rounded-lg">
                          <div className="w-16 h-16 mb-4 text-indigo-400 opacity-80">
                            <BarChart3 className="w-16 h-16" />
                          </div>
                          <p className="text-white mb-1">Nenhum dado comparativo disponível</p>
                          <p className="text-blue-300/70 text-sm text-center max-w-md">
                            Selecione múltiplas contas ou emails no filtro para visualizar comparações
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="emails" className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data?.emailData?.length > 0 ? (
                    data.emailData.map((email, index) => (
                      <div 
                        key={email.id || email.emailId || index}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                      >
                        <EmailPerformanceCard
                          email={email}
                          index={index}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center h-60 bg-[#1a2240]/40 rounded-xl text-blue-300/70">
                      <div className="w-16 h-16 mb-4 text-indigo-400 opacity-80">
                        <Mail className="w-16 h-16" />
                      </div>
                      <p className="text-white mb-1">Nenhum email encontrado para os filtros selecionados</p>
                      <p className="text-blue-300/70 text-sm text-center">Modifique os filtros ou selecione outro período</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Cards de atividade e melhor desempenho */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {/* Card de Atividades Recentes - 2 colunas */}
          <Card className="bg-gradient-to-br from-[#202942] to-[#2a3452] border border-white/8 rounded-xl shadow-xl overflow-hidden col-span-1 lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg text-white tracking-tight">Atividades Recentes</CardTitle>
                  <CardDescription className="text-blue-300/70">
                    Últimas interações com seus emails
                  </CardDescription>
                </div>
                
                <Badge variant="outline" className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 rounded-lg">
                  Últimas {recentEvents.length} atividades
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => (
                    <div 
                      key={event.id || index} 
                      className="flex items-start gap-3 p-4 rounded-xl bg-[#1a2240]/60 backdrop-blur-sm border border-white/5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className={`p-2.5 rounded-lg ${
                        event.eventType === 'open' ? 'bg-green-900/50 text-green-400' : 
                        event.eventType === 'click' ? 'bg-orange-500/30 text-orange-400' :
                        'bg-blue-900/50 text-blue-400'
                      } ring-1 ring-white/10`}>
                        {event.eventType === 'open' ? (
                          <Eye className="h-5 w-5" />
                        ) : event.eventType === 'click' ? (
                          <MousePointerClick className="h-5 w-5" />
                        ) : (
                          <Mail className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm text-white">
                            {event.contactEmail || 'Usuário'}
                          </p>
                          <p className="text-xs text-blue-300/60 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            {new Date(event.timestamp).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className="text-xs text-blue-300/80 mt-1">
                          {event.eventType === 'open' ? 'Abriu' : 
                           event.eventType === 'click' ? 'Clicou em' : 
                           'Interagiu com'} <span className="font-medium text-white">"{event.email?.subject || 'Email'}"</span>
                        </p>
                        <p className="text-xs text-blue-300/60 mt-1">
                          {event.account?.name || 'Conta não especificada'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 bg-[#1a2240]/40 rounded-lg">
                    <div className="w-12 h-12 mb-4 text-indigo-400 opacity-80">
                      <Info className="w-12 h-12" />
                    </div>
                    <p className="text-white mb-1">Nenhum evento recente encontrado</p>
                    <p className="text-blue-300/70 text-sm">Envie emails para gerar eventos de interação</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Card de Melhor Desempenho */}
          <Card className="bg-gradient-to-br from-[#202942] to-[#2a3452] border border-white/8 rounded-xl shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg text-white tracking-tight">Melhor Desempenho</CardTitle>
              <CardDescription className="text-blue-300/70">
                {compareData?.compareType === 'emails' ? 'Email' : 'Conta'} com os melhores resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {compareData?.bestPerformer ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-600 opacity-20 blur-xl rounded-full"></div>
                    <div className="p-4 mb-4 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white relative z-10 shadow-lg shadow-indigo-600/30">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white text-center mb-1">
                    {compareData.bestPerformer.name}
                  </h3>
                  
                  <p className="text-sm text-blue-300/70 mb-5 text-center">
                    {compareData.compareType === 'emails' 
                      ? 'Email com melhor taxa de conversão' 
                      : 'Conta com melhor desempenho geral'}
                  </p>
                  
                  <div className="w-full space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-blue-300/70">Taxa de Abertura</span>
                        <span className="text-sm font-medium text-white">
                          {formatPercent(compareData.bestPerformer.metrics.openRate || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, compareData.bestPerformer.metrics.openRate || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-blue-300/70">Taxa de Clique</span>
                        <span className="text-sm font-medium text-white">
                          {formatPercent(compareData.bestPerformer.metrics.clickRate || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, compareData.bestPerformer.metrics.clickRate || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-blue-300/70">Clique em Abertura</span>
                        <span className="text-sm font-medium text-white">
                          {formatPercent(compareData.bestPerformer.metrics.clickToOpenRate || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, compareData.bestPerformer.metrics.clickToOpenRate || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-60 bg-[#1a2240]/40 rounded-lg">
                  <div className="w-16 h-16 mb-4 text-indigo-400 opacity-80">
                    <TrendingUp className="w-16 h-16" />
                  </div>
                  <p className="text-white mb-1 text-center">Selecione múltiplos emails ou contas</p>
                  <p className="text-blue-300/70 text-sm text-center">
                    O comparativo será calculado automaticamente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;