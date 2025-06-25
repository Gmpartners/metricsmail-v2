import { useState, useEffect } from 'react';
import { useMetrics } from '../contexts/MetricsContext';
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
  RefreshCw
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

  const [selectedAccount, setSelectedAccount] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [emailMetrics, setEmailMetrics] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0
  });
  
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');

  const loadEmailMetrics = async (page = 1) => {
    const userId = getUserId();
    if (!userId) return;

    setTableLoading(true);
    setTableError('');

    try {
      const filters = {
        page: page,
        limit: pagination.pageSize
      };

      if (selectedAccount && selectedAccount !== 'all') {
        filters.accountIds = selectedAccount;
      }
      
      if (startDate) {
        filters.startDate = startDate;
      }
      
      if (endDate) {
        filters.endDate = endDate;
      }
      
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      console.log('🔄 Carregando métricas por email com filtros:', filters);
      
      const response = await fetchMetricsByEmail(filters);
      
      if (response && response.success && response.data) {
        setEmailMetrics(response.data.emails || []);
        setPagination({
          page: response.data.pagination?.page || 1,
          pageSize: response.data.pagination?.pageSize || 20,
          totalItems: response.data.pagination?.totalItems || 0,
          totalPages: response.data.pagination?.totalPages || 0
        });
        console.log('✅ Métricas carregadas:', response.data.emails?.length || 0, 'emails');
      } else {
        setEmailMetrics([]);
        setPagination({ page: 1, pageSize: 20, totalItems: 0, totalPages: 0 });
        console.log('📝 Nenhuma métrica encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error);
      setTableError('Erro ao carregar métricas');
      setEmailMetrics([]);
    } finally {
      setTableLoading(false);
    }
  };

  const applyFilters = () => {
    loadEmailMetrics(1);
  };

  const clearFilters = () => {
    setSelectedAccount('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setTimeout(() => loadEmailMetrics(1), 100);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadEmailMetrics(newPage);
    }
  };

  useEffect(() => {
    loadEmailMetrics(1);
  }, []);

  useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      setEndDate(today.toISOString().split('T')[0]);
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }
  }, []);

  const calculateCTR = (clicks, opens) => {
    if (!opens || opens === 0) return 0;
    return ((clicks / opens) * 100);
  };

  if (accountsLoading && !accounts.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Metrics</h2>
          <p className="text-gray-600">Detailed performance analysis of your email campaigns</p>
        </div>
        <button
          onClick={() => loadEmailMetrics(pagination.page)}
          disabled={tableLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${tableLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {(error || tableError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || tableError}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Accounts</option>
              {accounts.map(account => (
                <option key={account._id || account.id} value={account._id || account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={applyFilters}
              disabled={tableLoading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Email Performance ({pagination.totalItems} total)
          </h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {tableLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading metrics...</p>
            </div>
          </div>
        ) : emailMetrics.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No email metrics found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or date range</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opens
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unique Opens
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Open Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unique Clicks
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Click Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bounces
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unsubscribes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emailMetrics.map((email, index) => {
                    const metrics = email.metrics || {};
                    const sentCount = metrics.sentCount || 0;
                    const openCount = metrics.openCount || 0;
                    const uniqueOpenCount = metrics.uniqueOpenCount || 0;
                    const clickCount = metrics.clickCount || 0;
                    const uniqueClickCount = metrics.uniqueClickCount || 0;
                    const bounceCount = metrics.bounceCount || 0;
                    const unsubscribeCount = metrics.unsubscribeCount || 0;
                    
                    const openRate = sentCount > 0 ? (openCount / sentCount * 100) : 0;
                    const clickRate = sentCount > 0 ? (clickCount / sentCount * 100) : 0;
                    const ctr = calculateCTR(clickCount, openCount);
                    
                    return (
                      <tr key={email.id || email.emailId || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {email.name || email.subject || `Email ${index + 1}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {email.account?.name || 'Unknown Account'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={email.subject}>
                            {email.subject || 'No Subject'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {email.sentDate ? new Date(email.sentDate).toLocaleDateString() : 
                             email.campaign?.name ? `Campaign: ${email.campaign.name}` :
                             'Unknown Date'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                          {sentCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {openCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {uniqueOpenCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={`${
                            openRate >= 25 ? 'text-green-600' :
                            openRate >= 15 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {openRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {clickCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {uniqueClickCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={`${
                            clickRate >= 5 ? 'text-green-600' :
                            clickRate >= 2 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {clickRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={`${
                            ctr >= 20 ? 'text-green-600' :
                            ctr >= 10 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {ctr.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {bounceCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {unsubscribeCount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
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
                          className={`px-3 py-1 text-sm rounded ${
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
                          className={`px-3 py-1 text-sm rounded ${
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
                    disabled={pagination.page >= pagination.totalPages}
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
  );
};

export default Metrics;
