import { useEffect } from 'react';

const CACHE_KEY = 'metricsmail_selected_account';

export const useAccountCache = () => {
  const saveSelectedAccount = (accountId) => {
    if (accountId && accountId !== 'all') {
      localStorage.setItem(CACHE_KEY, accountId);
    }
  };

  const getSelectedAccount = () => {
    return localStorage.getItem(CACHE_KEY) || 'all';
  };

  const clearSelectedAccount = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  useEffect(() => {
    const savedAccount = getSelectedAccount();
    if (savedAccount && savedAccount !== 'all') {
      setTimeout(() => {
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
          const option = Array.from(select.options).find(opt => opt.value === savedAccount);
          if (option) {
            select.value = savedAccount;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }, 1000);
    }
  }, []);

  return {
    saveSelectedAccount,
    getSelectedAccount,
    clearSelectedAccount
  };
};
