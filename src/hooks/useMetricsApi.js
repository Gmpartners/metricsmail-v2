import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient, { buildUrl } from '../services/api/apiClient';

// Função auxiliar para construir a URL com parâmetros
const buildQueryParams = (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });
  return queryParams.toString();
};

// Hook base para fazer requisições à API
const useApiRequest = (endpoint, initialParams = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const previousParamsRef = useRef(null);
  const requestCountRef = useRef(0);
  
  // Verifica se parâmetros mudaram
  const areParamsEqual = (prevParams, nextParams) => {
    if (!prevParams) return false;
    
    const prevKeys = Object.keys(prevParams);
    const nextKeys = Object.keys(nextParams);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => 
      prevParams[key] === nextParams[key] || 
      (prevParams[key] === undefined && nextParams[key] === undefined) ||
      (prevParams[key] === null && nextParams[key] === null)
    );
  };
  
  const fetchData = useCallback(async (params = {}) => {
    // Evita chamadas duplicadas com os mesmos parâmetros
    if (areParamsEqual(previousParamsRef.current, params) && data !== null) {
      return { data };
    }
    
    const currentRequestId = ++requestCountRef.current;
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryParams(params);
      const url = buildUrl(`${endpoint}${queryString ? `?${queryString}` : ''}`);
      const response = await apiClient.get(url);
      
      // Verificar se ainda é a requisição mais recente antes de atualizar o estado
      if (isMountedRef.current && currentRequestId === requestCountRef.current) {
        setData(response.data.data);
        setLoading(false);
        previousParamsRef.current = params;
      }
      
      return response.data;
    } catch (err) {
      // Verificar se ainda é a requisição mais recente antes de atualizar o estado
      if (isMountedRef.current && currentRequestId === requestCountRef.current) {
        setError(err.message || 'Ocorreu um erro na requisição');
        setLoading(false);
      }
      throw err;
    }
  }, [endpoint, data]);
  
  // Efeito de limpeza quando o componente é desmontado
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return { data, loading, error, refetch: fetchData };
};

// Hook para buscar contas
export const useAccounts = () => {
  const { data, loading, error, refetch } = useApiRequest('/accounts');
  
  return { 
    accounts: data, 
    loading, 
    error, 
    refetch 
  };
};

// Hook para buscar campanhas de uma conta
export const useAccountCampaigns = (accountId) => {
  const { data, loading, error, refetch } = useApiRequest(
    accountId ? `/accounts/${accountId}/campaigns` : null
  );
  
  return { 
    campaigns: data?.campaigns || [], 
    loading, 
    error, 
    refetch 
  };
};

// Hook para buscar emails de uma conta
export const useAccountEmails = (accountId) => {
  const { data, loading, error, refetch } = useApiRequest(
    accountId ? `/accounts/${accountId}/emails` : null
  );
  
  return { 
    emails: data?.emails || [], 
    loading, 
    error, 
    refetch 
  };
};

// Hook para métricas por email
export const useMetricsByEmail = (params = {}) => {
  const { data, loading, error, refetch } = useApiRequest('/metrics/by-email', params);
  
  // O primeiro fetch é feito apenas quando o componente é montado
  const initialFetchRef = useRef(false);
  
  useEffect(() => {
    if (!initialFetchRef.current) {
      refetch(params);
      initialFetchRef.current = true;
    }
  }, [refetch, params]);
  
  return { 
    metrics: data || [], 
    loading, 
    error, 
    refetch 
  };
};

// Hook para métricas diárias
export const useDailyMetrics = (params = {}) => {
  const [sendsData, setSendsData] = useState(null);
  const [opensData, setOpensData] = useState(null);
  const [clicksData, setClicksData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialFetchRef = useRef(false);
  const previousParamsRef = useRef(null);
  
  // Verifica se parâmetros mudaram
  const areParamsEqual = (prevParams, nextParams) => {
    if (!prevParams) return false;
    
    const prevKeys = Object.keys(prevParams);
    const nextKeys = Object.keys(nextParams);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => 
      prevParams[key] === nextParams[key] || 
      (prevParams[key] === undefined && nextParams[key] === undefined) ||
      (prevParams[key] === null && nextParams[key] === null)
    );
  };
  
  const fetchData = useCallback(async (fetchParams = {}) => {
    // Evita chamadas duplicadas com os mesmos parâmetros
    if (areParamsEqual(previousParamsRef.current, fetchParams) && 
        sendsData !== null && opensData !== null && clicksData !== null) {
      return { sendsData, opensData, clicksData };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryParams(fetchParams);
      
      const [sendsResponse, opensResponse, clicksResponse] = await Promise.all([
        apiClient.get(buildUrl(`/metrics/daily-sends${queryString ? `?${queryString}` : ''}`)),
        apiClient.get(buildUrl(`/metrics/daily-opens${queryString ? `?${queryString}` : ''}`)),
        apiClient.get(buildUrl(`/metrics/daily-clicks${queryString ? `?${queryString}` : ''}`))
      ]);
      
      setSendsData(sendsResponse.data.data);
      setOpensData(opensResponse.data.data);
      setClicksData(clicksResponse.data.data);
      setLoading(false);
      previousParamsRef.current = fetchParams;
      
      return {
        sendsData: sendsResponse.data.data,
        opensData: opensResponse.data.data,
        clicksData: clicksResponse.data.data
      };
    } catch (err) {
      setError(err.message || 'Ocorreu um erro na requisição');
      setLoading(false);
      throw err;
    }
  }, [sendsData, opensData, clicksData]);
  
  // Primeiro fetch apenas quando o componente monta
  useEffect(() => {
    if (!initialFetchRef.current) {
      fetchData(params);
      initialFetchRef.current = true;
    }
  }, [fetchData, params]);
  
  return { 
    sendsData, 
    opensData, 
    clicksData, 
    loading, 
    error, 
    refetch: fetchData 
  };
};

// Hook para taxas (para gráficos)
export const useRatesMetrics = (params = {}) => {
  const { data, loading, error, refetch } = useApiRequest('/metrics/rates', params);
  const initialFetchRef = useRef(false);
  
  useEffect(() => {
    if (!initialFetchRef.current) {
      refetch(params);
      initialFetchRef.current = true;
    }
  }, [refetch, params]);
  
  return { 
    ratesData: data, 
    loading, 
    error, 
    refetch 
  };
};

// Hook para métricas por conta
export const useMetricsByAccount = (params = {}) => {
  const { data, loading, error, refetch } = useApiRequest('/metrics/by-account', params);
  const initialFetchRef = useRef(false);
  
  useEffect(() => {
    if (!initialFetchRef.current) {
      refetch(params);
      initialFetchRef.current = true;
    }
  }, [refetch, params]);
  
  return { 
    metrics: data || [], 
    loading, 
    error, 
    refetch 
  };
};

// Hook para métricas por campanha
export const useMetricsByCampaign = (params = {}) => {
  const { data, loading, error, refetch } = useApiRequest('/metrics/by-campaign', params);
  const initialFetchRef = useRef(false);
  
  useEffect(() => {
    if (!initialFetchRef.current) {
      refetch(params);
      initialFetchRef.current = true;
    }
  }, [refetch, params]);
  
  return { 
    metrics: data || [], 
    loading, 
    error, 
    refetch 
  };
};

// Hook para eventos
export const useEvents = (params = {}) => {
  const { data, loading, error, refetch } = useApiRequest('/metrics/events', params);
  const initialFetchRef = useRef(false);
  
  useEffect(() => {
    if (!initialFetchRef.current) {
      refetch(params);
      initialFetchRef.current = true;
    }
  }, [refetch, params]);
  
  return { 
    events: data || [], 
    loading, 
    error, 
    refetch 
  };
};