import { useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

const Settings = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie suas configurações de conta e preferências.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white dark:bg-gray-800 shadow-theme-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Informações da Conta
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  User ID
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={user?.uid || ''}
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 font-mono text-sm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Use este ID para configurar dados no backend.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white dark:bg-gray-800 shadow-theme-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Configuração da API
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL da API
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    value="https://metrics.devoltaaojogo.com"
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Key
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    value="MAaDylN2bs0Y01Ep66"
                    disabled
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 shadow-theme-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Ações da Conta
            </h3>
          </div>
          <div className="p-6">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-error-500 hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saindo...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair da Conta
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-brand-800 dark:text-brand-400">
                Como configurar dados no backend
              </h3>
              <div className="mt-2 text-sm text-brand-700 dark:text-brand-300">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Copie seu User ID acima</li>
                  <li>Use esse ID para criar dados no backend em produção</li>
                  <li>Configure suas contas Mautic usando a API</li>
                  <li>Os dados aparecerão automaticamente no dashboard</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;