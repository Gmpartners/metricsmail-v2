import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMetrics } from '../contexts/MetricsContext';
import { useAccountCache } from '../hooks/useAccountCache';
import { 
  Search,
  Calendar,
  Filter,
  Download,
  Mail,
  Eye,
  MousePointer,
  AlertTriangle,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Server,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';

const Metrics = () => {
  const { 
    accounts,
    accountsLoading,
    loading,
    error,
    fetchMetricsByEmail,
    getUserId
  } = useMetrics();

  const { saveSelectedAccount, getSelectedAccount } = useAccountCache();

  // Estados principais
  const [selectedAccount, setSelectedAccount] = useState(() => getSelectedAccount());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Estados de pesquisa simplificados
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  
  // Estados de ordenação
  const [sortField, setSortField] = useState('sentCount');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Estados de dados
  const [emailMetrics, setEmailMetrics] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0
  });
  
  // Estados de UI
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');
  const [hasFilters, setHasFilters] = useState(false);
  
  // Refs para controle
  const debounceTimeoutRef = useRef(null);
  const isSearchingRef = useRef(false);

  // ✅ NOVO: Filtro local de emails - SOLUÇÃO PRINCIPAL
  const filteredEmailMetrics = useMemo(() => {
    if (!emailMetrics || emailMetrics.length === 0) return emailMetrics;
    
    // Se não há busca ativa, retorna todos os emails
    if (!activeSearch || !activeSearch.trim()) {
      return emailMetrics;
    }
    
    const searchTerm = activeSearch.toLowerCase().trim();
    console.log('🔍 Aplicando filtro local para:', searchTerm);
    
    // Filtra emails que contêm o termo de busca no nome, assunto ou ID
    const filtered = emailMetrics.filter(email => {
      const emailName = (email.name || '').toLowerCase();
      const emailSubject = (email.subject || '').toLowerCase();
      const emailId = (email.id || email.emailId || '').toString().toLowerCase();
      
      return emailName.includes(searchTerm) || 
             emailSubject.includes(searchTerm) ||
             emailId.includes(searchTerm);
    });
    
    console.log(`✅ Filtro local: ${filtered.length} de ${emailMetrics.length} emails`);
    return filtered;
  }, [emailMetrics, activeSearch]);

  // ✅ CORREÇÃO: Implementação correta do debounce
  const debouncedSetSearch = useCallback((value) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setActiveSearch(value.trim());
    }, 300); // Reduzido para 300ms para resposta mais rápida
  }, []);

  // ✅ FUNÇÃO: Carregamento de dados simplificado (sem busca na API)
  const loadEmailMetrics = useCallback(async (page = 1, customFilters = {}, skipLoading = false) => {
    const userId = getUserId();
    if (!userId) {
      console.warn('❌ Usuário não autenticado');
      return;
    }

    // Evita múltiplas chamadas simultâneas
    if (isSearchingRef.current && !skipLoading) {
      console.log('🔄 Carregamento já em andamento, ignorando...');
      return;
    }

    if (!skipLoading) {
      setTableLoading(true);
      isSearchingRef.current = true;
    }
    
    setTableError('');

    try {
      const filters = {
        page: page,
        limit: pagination.pageSize,
        ...customFilters
      };

      // Adiciona filtros apenas se existirem
      if (selectedAccount && selectedAccount !== 'all') {
        filters.accountIds = selectedAccount;
      }
      
      if (startDate) {
        filters.startDate = startDate;
      }
      
      if (endDate) {
        filters.endDate = endDate;
      }
      
      // ✅ NOVO: Busca é feita apenas localmente, não na API
      console.log('🔄 Carregando métricas por email com filtros:', filters);
      
      const response = await fetchMetricsByEmail(filters);
      
      if (response && response.success && response.data) {
        setEmailMetrics(response.data.emails || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          pageSize: response.data.pagination?.limit || 20,
          totalItems: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.pages || 0
        });
        console.log('✅ Métricas carregadas:', response.data.emails?.length || 0, 'emails');
      } else {
        setEmailMetrics([]);
        setPagination({ page: 1, pageSize: 20, totalItems: 0, totalPages: 0 });
        console.log('📝 Nenhuma métrica encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error);
      setTableError('Erro ao carregar métricas de email');
      setEmailMetrics([]);
    } finally {
      if (!skipLoading) {
        setTableLoading(false);
        isSearchingRef.current = false;
      }
    }
  }, [getUserId, selectedAccount, startDate, endDate, pagination.pageSize, fetchMetricsByEmail]);

  // ✅ VERIFICAÇÃO: Filtros ativos
  const checkHasFilters = useCallback(() => {
    const hasActiveFilters = !!(
      (selectedAccount && selectedAccount !== 'all') ||
      startDate ||
      endDate ||
      (activeSearch && activeSearch.trim())
    );
    setHasFilters(hasActiveFilters);
  }, [selectedAccount, startDate, endDate, activeSearch]);

  // ✅ FUNÇÃO: Aplicar filtros de data/conta
  const applyFilters = useCallback(() => {
    console.log('🎯 Aplicando filtros de data/conta...');
    loadEmailMetrics(1);
  }, [loadEmailMetrics]);

  // ✅ FUNÇÃO: Limpar todos os filtros
  const clearFilters = useCallback(() => {
    console.log('🧹 Limpando todos os filtros...');
    
    setSelectedAccount('all');
    saveSelectedAccount('all');
    setStartDate('');
    setEndDate('');
    setSearchInput('');
    setActiveSearch('');
    setSortField('sentCount');
    setSortDirection('desc');
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setTimeout(() => {
      loadEmailMetrics(1, {
        accountIds: null,
        startDate: null,
        endDate: null,
        search: null
      });
    }, 100);
  }, [loadEmailMetrics, saveSelectedAccount]);

  // ✅ HANDLERS: Eventos de interface
  const handleAccountChange = useCallback((accountId) => {
    console.log('🏢 Mudando conta para:', accountId);
    setSelectedAccount(accountId);
    saveSelectedAccount(accountId);
  }, [saveSelectedAccount]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('🔍 Busca manual:', searchInput);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setActiveSearch(searchInput.trim());
  }, [searchInput]);

  const handleSearchClear = useCallback(() => {
    console.log('🧹 Limpando busca...');
    setSearchInput('');
    setActiveSearch('');
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  const handleSort = useCallback((field) => {
    console.log('📊 Ordenando por:', field);
    
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  // ✅ FUNÇÃO: Ordenação dos emails filtrados
  const sortEmailMetrics = useMemo(() => {
    if (!filteredEmailMetrics || filteredEmailMetrics.length === 0) return filteredEmailMetrics;

    return [...filteredEmailMetrics].sort((a, b) => {
      const aMetrics = a.metrics || {};
      const bMetrics = b.metrics || {};
      
      let aValue, bValue;

      switch (sortField) {
        case 'name':
          aValue = (a.name || a.subject || '').toLowerCase();
          bValue = (b.name || b.subject || '').toLowerCase();
          break;
        case 'subject':
          aValue = (a.subject || '').toLowerCase();
          bValue = (b.subject || '').toLowerCase();
          break;
        case 'sentCount':
          aValue = aMetrics.sentCount || 0;
          bValue = bMetrics.sentCount || 0;
          break;
        case 'openCount':
          aValue = aMetrics.openCount || 0;
          bValue = bMetrics.openCount || 0;
          break;
        case 'uniqueOpenCount':
          aValue = aMetrics.uniqueOpenCount || 0;
          bValue = bMetrics.uniqueOpenCount || 0;
          break;
        case 'openRate':
          aValue = (aMetrics.sentCount > 0) ? (aMetrics.openCount / aMetrics.sentCount * 100) : 0;
          bValue = (bMetrics.sentCount > 0) ? (bMetrics.openCount / bMetrics.sentCount * 100) : 0;
          break;
        case 'uniqueOpenRate':
          aValue = aMetrics.sentCount > 0 ? (aMetrics.uniqueOpenCount / aMetrics.sentCount * 100) : 0;
          bValue = bMetrics.sentCount > 0 ? (bMetrics.uniqueOpenCount / bMetrics.sentCount * 100) : 0;
          break;
        case 'clickCount':
          aValue = aMetrics.clickCount || 0;
          bValue = bMetrics.clickCount || 0;
          break;
        case 'uniqueClickCount':
          aValue = aMetrics.uniqueClickCount || 0;
          bValue = bMetrics.uniqueClickCount || 0;
          break;
        case 'clickRate':
          aValue = (aMetrics.sentCount > 0) ? (aMetrics.clickCount / aMetrics.sentCount * 100) : 0;
          bValue = (bMetrics.sentCount > 0) ? (bMetrics.clickCount / bMetrics.sentCount * 100) : 0;
          break;
        case 'uniqueClickRate':
          aValue = aMetrics.sentCount > 0 ? (aMetrics.uniqueClickCount / aMetrics.sentCount * 100) : 0;
          bValue = bMetrics.sentCount > 0 ? (bMetrics.uniqueClickCount / bMetrics.sentCount * 100) : 0;
          break;
        case 'ctr':
          aValue = (aMetrics.openCount > 0) ? (aMetrics.clickCount / aMetrics.openCount * 100) : 0;
          bValue = (bMetrics.openCount > 0) ? (bMetrics.clickCount / bMetrics.openCount * 100) : 0;
          break;
        case 'bounceCount':
          aValue = aMetrics.bounceCount || 0;
          bValue = bMetrics.bounceCount || 0;
          break;
        case 'unsubscribeCount':
          aValue = aMetrics.unsubscribeCount || 0;
          bValue = bMetrics.unsubscribeCount || 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });
  }, [filteredEmailMetrics, sortField, sortDirection]);

  // ✅ NOVO: Contador e status da busca
  const displayCount = useMemo(() => {
    if (activeSearch && activeSearch.trim()) {
      return filteredEmailMetrics.length;
    }
    return pagination.totalItems;
  }, [activeSearch, filteredEmailMetrics.length, pagination.totalItems]);

  const searchStatus = useMemo(() => {
    if (!activeSearch || !activeSearch.trim()) return '';
    
    const totalEmails = emailMetrics.length;
    const filteredCount = filteredEmailMetrics.length;
    
    if (filteredCount === 0) {
      return `Nenhum resultado encontrado para "${activeSearch}"`;
    } else if (filteredCount === totalEmails) {
      return `Todos os ${filteredCount} emails correspondem à busca`;
    } else {
      return `${filteredCount} de ${totalEmails} emails encontrados`;
    }
  }, [activeSearch, emailMetrics.length, filteredEmailMetrics.length]);

  // ✅ FUNÇÕES: Utilitárias
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !tableLoading) {
      console.log('📄 Mudando para página:', newPage);
      loadEmailMetrics(newPage);
    }
  }, [pagination.totalPages, tableLoading, loadEmailMetrics]);

  const calculateCTR = useCallback((clicks, opens) => {
    if (!opens || opens === 0) return 0;
    return ((clicks / opens) * 100);
  }, []);

  const isAccountSelected = useMemo(() => {
    return selectedAccount !== 'all';
  }, [selectedAccount]);

  // ✅ EFFECTS: Lifecycle
  useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const endDateStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
        .toISOString().split('T')[0];
      const startDateStr = new Date(thirtyDaysAgo.getTime() - (thirtyDaysAgo.getTimezoneOffset() * 60000))
        .toISOString().split('T')[0];
      
      setEndDate(endDateStr);
      setStartDate(startDateStr);
    }
  }, []);

  useEffect(() => {
    if (searchInput !== activeSearch) {
      debouncedSetSearch(searchInput);
    }
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchInput, activeSearch, debouncedSetSearch]);

  useEffect(() => {
    checkHasFilters();
  }, [checkHasFilters]);

  useEffect(() => {
    if (selectedAccount) {
      console.log('🏢 Conta mudou, recarregando...');
      loadEmailMetrics(1);
    }
  }, [selectedAccount, loadEmailMetrics]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // ✅ RENDER: Loading state
  if (accountsLoading && !accounts.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando contas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Metrics</h2>
            <p className="text-gray-600">Análise detalhada de performance das suas campanhas de email</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Conta:</span>
            <select
              value={selectedAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm min-w-[180px] font-medium"
            >
              <option value="all">Selecione uma conta</option>
              {accounts.map(account => (
                <option key={account._id || account.id} value={account._id || account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={() => loadEmailMetrics(pagination.page)}
          disabled={tableLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${tableLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Overlay para conta não selecionada */}
        {!isAccountSelected && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Server className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Selecione uma Conta
              </h2>
              <p className="text-gray-600 mb-6">
                Para visualizar as métricas detalhadas, você precisa selecionar uma conta específica do Mautic no seletor acima.
              </p>
              <div className="text-sm text-gray-500">
                Use o seletor "Conta" ao lado do título para escolher uma conta conectada.
              </div>
            </div>
          </div>
        )}

        <div className={`space-y-6 ${!isAccountSelected ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Error Display */}
          {(error || tableError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-800">{error || tableError}</p>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              {hasFilters && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Filtros ativos
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Data Inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Data Final */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Busca de emails - MELHORADA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar emails
                  <span className="text-xs text-gray-500 ml-1">(busca local instantânea)</span>
                </label>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="filtre seus e-mails aqui"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    {searchInput && (
                      <button
                        type="button"
                        onClick={handleSearchClear}
                        className="p-1 text-gray-400 hover:text-gray-600 mr-1"
                        title="Limpar busca"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="p-2 text-gray-400 hover:text-purple-600"
                      title="Buscar"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </form>
                {activeSearch && (
                  <p className="text-xs text-purple-600 mt-1 font-medium">
                    🔍 Buscando: "{activeSearch}"
                  </p>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2 items-end">
                <button
                  onClick={applyFilters}
                  disabled={tableLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  title="Aplicar filtros de data"
                >
                  <Filter className="h-4 w-4" />
                  Aplicar
                </button>
                <button
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  title="Limpar todos os filtros"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Performance dos Emails ({displayCount.toLocaleString()} 
                    {activeSearch ? ' filtrados' : ' total'})
                  </h3>
                  {searchStatus && (
                    <p className="text-sm text-purple-600 mt-1 font-medium">{searchStatus}</p>
                  )}
                </div>
                <button 
                  disabled={sortEmailMetrics.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
              </div>
            </div>

            {/* Loading State */}
            {tableLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Carregando métricas...</p>
                </div>
              </div>
            ) : sortEmailMetrics.length === 0 ? (
              /* Empty State Melhorado */
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500 text-lg font-medium">
                  {activeSearch && activeSearch.trim() 
                    ? `Nenhum email encontrado para "${activeSearch}"` 
                    : hasFilters 
                      ? 'Nenhum email encontrado com os filtros aplicados' 
                      : 'Nenhuma métrica de email encontrada'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {activeSearch && activeSearch.trim()
                    ? 'Tente um termo de busca diferente ou verifique a ortografia'
                    : hasFilters 
                      ? 'Tente ajustar os filtros ou limpar a busca' 
                      : 'Tente ajustar o período de datas ou verificar se há dados'}
                </p>
                {(hasFilters || activeSearch) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    {activeSearch ? '🧹 Limpar busca' : '🧹 Limpar filtros'}
                  </button>
                )}
              </div>
            ) : (
              /* Data Table - Com dados filtrados */
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* Cabeçalhos da tabela com ordenação */}
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Nome do Email
                            {sortField === 'name' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </div>
                        </th>
                        
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('subject')}
                        >
                          <div className="flex items-center gap-1">
                            Assunto
                            {sortField === 'subject' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </div>
                        </th>
                        
                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('sentCount')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Enviados
                            {sortField === 'sentCount' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </div>
                        </th>
                        
                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('openCount')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Aberturas
                            {sortField === 'openCount' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </div>
                        </th>

                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('openRate')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Taxa de Abertura
                            {sortField === 'openRate' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </div>
                        </th>

                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('clickCount')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Cliques
                            {sortField === 'clickCount' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </div>
                        </th>

                        <th 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('clickRate')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Taxa de Clique
                            {sortField === 'clickRate' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortEmailMetrics.map((email, index) => {
                        const metrics = email.metrics || {};
                        const sentCount = metrics.sentCount || 0;
                        const openCount = metrics.openCount || 0;
                        const clickCount = metrics.clickCount || 0;
                        
                        const openRate = sentCount > 0 ? (openCount / sentCount * 100) : 0;
                        const clickRate = sentCount > 0 ? (clickCount / sentCount * 100) : 0;
                        
                        return (
                          <tr key={email.id || email.emailId || index} className="hover:bg-gray-50">
                            {/* Nome do Email */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {email.name || email.subject || `Email ${index + 1}`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {email.account?.name || 'Conta Desconhecida'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            {/* Assunto */}
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={email.subject}>
                                {email.subject || 'Sem Assunto'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {email.sentDate ? new Date(email.sentDate).toLocaleDateString('pt-BR') : 
                                 email.campaign?.name ? `Campanha: ${email.campaign.name}` :
                                 'Data Desconhecida'}
                              </div>
                            </td>
                            
                            {/* Enviados */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                              {sentCount.toLocaleString()}
                            </td>
                            
                            {/* Aberturas */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {openCount.toLocaleString()}
                            </td>
                            
                            {/* Taxa de Abertura */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <span className={`${
                                openRate >= 25 ? 'text-green-600' :
                                openRate >= 15 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {openRate.toFixed(1)}%
                              </span>
                            </td>
                            
                            {/* Cliques */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {clickCount.toLocaleString()}
                            </td>
                            
                            {/* Taxa de Clique */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <span className={`${
                                clickRate >= 5 ? 'text-green-600' :
                                clickRate >= 2 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {clickRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginação - Oculta quando há busca ativa */}
                {pagination.totalPages > 1 && !activeSearch && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} até{' '}
                      {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} de{' '}
                      {pagination.totalItems.toLocaleString()} resultados
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1 || tableLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={tableLoading}
                              className={`px-3 py-1 text-sm rounded disabled:opacity-50 ${
                                pageNum === pagination.page
                                  ? 'bg-purple-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {pagination.totalPages > 5 && (
                          <>
                            <span className="px-2 text-gray-500">...</span>
                            <button
                              onClick={() => handlePageChange(pagination.totalPages)}
                              disabled={tableLoading}
                              className={`px-3 py-1 text-sm rounded disabled:opacity-50 ${
                                pagination.totalPages === pagination.page
                                  ? 'bg-purple-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pagination.totalPages}
                            </button>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages || tableLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;