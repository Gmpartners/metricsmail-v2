import { useState, useEffect } from 'react';
import { useMetrics } from '../contexts/MetricsContext';
import { 
  Plus,
  Server,
  Globe,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  X,
  Check,
  Link
} from 'lucide-react';

const Accounts = () => {
  const { 
    accounts, 
    accountsLoading, 
    error,
    loading,
    fetchAccounts,
    createAccount,
    getAccountWebhook,
    deleteAccount,
    updateAccount,
    getUserId
  } = useMetrics();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    provider: 'mautic',
    url: '',
    username: '',
    password: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
    status: 'active'
  });
  
  const [formError, setFormError] = useState('');
  const [editFormError, setEditFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [showWebhook, setShowWebhook] = useState(null);
  const [webhookData, setWebhookData] = useState(null);

  // Estado para armazenar webhooks de cada conta
  const [accountWebhooks, setAccountWebhooks] = useState({});
  const [loadingWebhooks, setLoadingWebhooks] = useState({});

  // Sistema de notificação
  const [notification, setNotification] = useState(null);

  // Função para mostrar notificação
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Buscar webhook para uma conta específica
  const fetchAccountWebhook = async (accountId) => {
    if (accountWebhooks[accountId] || loadingWebhooks[accountId]) {
      return; // Já tem o webhook ou está carregando
    }

    setLoadingWebhooks(prev => ({ ...prev, [accountId]: true }));

    try {
      const result = await getAccountWebhook(accountId);
      if (result.success) {
        setAccountWebhooks(prev => ({
          ...prev,
          [accountId]: result.data.webhookUrl
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar webhook:', error);
    } finally {
      setLoadingWebhooks(prev => ({ ...prev, [accountId]: false }));
    }
  };

  // Buscar webhooks para todas as contas
  useEffect(() => {
    if (accounts.length > 0) {
      accounts.forEach(account => {
        fetchAccountWebhook(account._id || account.id);
      });
    }
  }, [accounts]);

  // Copy webhook URL
  const copyWebhookUrl = (url) => {
    navigator.clipboard.writeText(url);
    showNotification('URL do webhook copiada!', 'success');
  };

  // Handle form submission para criar conta
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    // Validações
    if (!formData.name.trim()) {
      setFormError('Nome da conta é obrigatório');
      setFormLoading(false);
      return;
    }

    if (!formData.url.trim()) {
      setFormError('URL do Mautic é obrigatória');
      setFormLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setFormError('Usuário é obrigatório');
      setFormLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setFormError('Senha é obrigatória');
      setFormLoading(false);
      return;
    }

    try {
      new URL(formData.url);
    } catch {
      setFormError('URL inválida');
      setFormLoading(false);
      return;
    }

    try {
      const result = await createAccount(formData);
      
      if (result.success) {
        setShowAddForm(false);
        setFormData({
          name: '',
          provider: 'mautic',
          url: '',
          username: '',
          password: ''
        });
        showNotification('Conta criada e conectada com sucesso!', 'success');
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError('Erro inesperado ao criar conta');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle form submission para editar conta
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError('');
    setEditFormLoading(true);

    // Validações
    if (!editFormData.name.trim()) {
      setEditFormError('Nome da conta é obrigatório');
      setEditFormLoading(false);
      return;
    }

    if (!editFormData.url.trim()) {
      setEditFormError('URL do Mautic é obrigatória');
      setEditFormLoading(false);
      return;
    }

    if (!editFormData.username.trim()) {
      setEditFormError('Usuário é obrigatório');
      setEditFormLoading(false);
      return;
    }

    try {
      new URL(editFormData.url);
    } catch {
      setEditFormError('URL inválida');
      setEditFormLoading(false);
      return;
    }

    try {
      const result = await updateAccount(editingAccount._id || editingAccount.id, editFormData);
      
      if (result.success) {
        setShowEditForm(false);
        setEditingAccount(null);
        setEditFormData({
          name: '',
          url: '',
          username: '',
          password: '',
          status: 'active'
        });
        showNotification('Conta atualizada com sucesso!', 'success');
      } else {
        setEditFormError(result.message);
      }
    } catch (error) {
      setEditFormError('Erro inesperado ao atualizar conta');
    } finally {
      setEditFormLoading(false);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // Abrir modal de edição
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setEditFormData({
      name: account.name || '',
      url: account.url || '',
      username: account.username || '',
      password: '', // Senha sempre vazia por segurança
      status: account.status || 'active'
    });
    setShowEditForm(true);
  };

  // Show webhook
  const handleShowWebhook = async (accountId) => {
    const result = await getAccountWebhook(accountId);
    if (result.success) {
      setWebhookData(result.data);
      setShowWebhook(accountId);
    } else {
      showNotification('Erro ao obter webhook: ' + result.message, 'error');
    }
  };

  // Delete account
  const handleDeleteAccount = async (accountId, accountName) => {
    if (window.confirm(`Tem certeza que deseja deletar a conta "${accountName}"?\n\nEsta ação irá remover todos os dados relacionados (emails, eventos, etc.) e não pode ser desfeita.`)) {
      const result = await deleteAccount(accountId);
      if (result.success) {
        showNotification('Conta deletada com sucesso!', 'success');
      } else {
        showNotification('Erro ao deletar conta: ' + result.message, 'error');
      }
    }
  };

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
      {/* Notificação */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contas Mautic</h2>
          <p className="text-gray-600">Gerencie suas conexões com instâncias Mautic</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAccounts}
            disabled={accountsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${accountsLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>User ID:</strong> {getUserId() || 'Não autenticado'} |
          <strong> Contas encontradas:</strong> {accounts.length}
        </p>
      </div>

      {/* Lista de Contas */}
      {accounts.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow border text-center">
          <Server className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma conta conectada
          </h3>
          <p className="text-gray-600 mb-6">
            Conecte sua primeira instância Mautic para começar a ver suas métricas
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-5 w-5" />
            Conectar Primeira Conta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const accountId = account._id || account.id;
            const webhookUrl = accountWebhooks[accountId];
            const isLoadingWebhook = loadingWebhooks[accountId];
            
            return (
              <div key={accountId} className="bg-white p-6 rounded-lg shadow border">
                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {account.status === 'active' ? 'Ativo' : 'Conectado'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShowWebhook(accountId)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Ver Webhook Detalhado"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditAccount(account)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Editar Conta"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAccount(accountId, account.name)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Deletar Conta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Info da Conta */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">ID: {accountId}</p>
                  </div>

                  {account.url && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{new URL(account.url).hostname}</span>
                    </div>
                  )}

                  {account.provider && (
                    <div>
                      <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {account.provider}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  {account.stats && (
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500">Emails:</span>
                        <span className="font-medium ml-1">{account.stats.emailCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Enviados:</span>
                        <span className="font-medium ml-1">{account.stats.sentCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Aberturas:</span>
                        <span className="font-medium ml-1">{account.stats.openRate?.toFixed(1) || 0}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cliques:</span>
                        <span className="font-medium ml-1">{account.stats.clickRate?.toFixed(1) || 0}%</span>
                      </div>
                    </div>
                  )}

                  {/* Webhook Section */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Link className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Webhook URL</span>
                    </div>
                    
                    {isLoadingWebhook ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-purple-600"></div>
                        <span>Carregando webhook...</span>
                      </div>
                    ) : webhookUrl ? (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <input
                          type="text"
                          value={webhookUrl}
                          readOnly
                          className="flex-1 text-xs bg-transparent border-none focus:outline-none text-gray-600"
                        />
                        <button
                          onClick={() => copyWebhookUrl(webhookUrl)}
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Copiar URL do Webhook"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Webhook não disponível</p>
                    )}
                  </div>

                  {/* Última sincronização */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Última sincronização: {account.lastSync || 'Nunca'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                      Ver Métricas
                    </button>
                    <button className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Testar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form para Adicionar Conta */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Conta Mautic</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Conta *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Mautic Produção"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Mautic *
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://mautic.exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="admin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Sua senha do Mautic"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError('');
                    setFormData({
                      name: '',
                      provider: 'mautic',
                      url: '',
                      username: '',
                      password: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Conectando...
                    </>
                  ) : (
                    'Conectar'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> A API testará a conexão com o Mautic e criará automaticamente o webhook necessário.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form para Editar Conta */}
      {showEditForm && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editar Conta: {editingAccount.name}
            </h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Conta *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  placeholder="Ex: Mautic Produção"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Mautic *
                </label>
                <input
                  type="url"
                  name="url"
                  value={editFormData.url}
                  onChange={handleEditChange}
                  placeholder="https://mautic.exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário *
                </label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditChange}
                  placeholder="admin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha (deixe vazio para manter a atual)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditChange}
                    placeholder="Nova senha (opcional)"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="error">Com Erro</option>
                </select>
              </div>

              {editFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{editFormError}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingAccount(null);
                    setEditFormError('');
                    setEditFormData({
                      name: '',
                      url: '',
                      username: '',
                      password: '',
                      status: 'active'
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={editFormLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={editFormLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {editFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Alterar as credenciais irá testar a nova conexão com o Mautic.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Webhook */}
      {showWebhook && webhookData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook da Conta</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Webhook
                </label>
                <input
                  type="text"
                  value={webhookData.webhookId}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Webhook
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webhookData.webhookUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => copyWebhookUrl(webhookData.webhookUrl)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    title="Copiar URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <input
                  type="text"
                  value={webhookData.provider}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Instruções de Configuração:</h4>
                <p className="text-sm text-yellow-800">
                  {webhookData.instructions}
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Eventos Monitorados:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• email_on_send - Quando um email é enviado</li>
                  <li>• email_on_open - Quando um email é aberto</li>
                  <li>• email_on_click - Quando um link é clicado</li>
                  <li>• email_on_bounce - Quando um email retorna</li>
                  <li>• email_on_unsubscribe - Quando alguém se descadastra</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowWebhook(null);
                  setWebhookData(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas das Contas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{accounts.length}</p>
            <p className="text-sm text-gray-600">Contas Conectadas</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {accounts.filter(acc => acc.status !== 'error').length}
            </p>
            <p className="text-sm text-gray-600">Contas Ativas</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {accounts.filter(acc => acc.status === 'error').length}
            </p>
            <p className="text-sm text-gray-600">Com Problemas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;