import { createContext, useReducer, useEffect, useMemo, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

// Criando o contexto
export const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

// Ações do reducer
const AUTH_ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  AUTH_IS_READY: "AUTH_IS_READY",
  AUTH_ERROR: "AUTH_ERROR"
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return { 
        ...state, 
        user: action.payload,
        error: null 
      };
    case AUTH_ACTIONS.LOGOUT:
      return { 
        ...state, 
        user: null,
        error: null 
      };
    case AUTH_ACTIONS.AUTH_IS_READY:
      return { 
        ...state, 
        user: action.payload, 
        authIsReady: true,
        error: null
      };
    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  user: null,
  authIsReady: false,
  error: null
};

// Provider Component
export function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Ações comuns empacotadas em funções
  const actions = useMemo(() => ({
    login: (user) => dispatch({ type: AUTH_ACTIONS.LOGIN, payload: user }),
    logout: () => dispatch({ type: AUTH_ACTIONS.LOGOUT }),
    setError: (error) => dispatch({ type: AUTH_ACTIONS.AUTH_ERROR, payload: error }),
    setAuthReady: (user) => dispatch({ type: AUTH_ACTIONS.AUTH_IS_READY, payload: user })
  }), []);

  // Função para revalidar autenticação (forçar novo token)
  const revalidateAuth = async () => {
    if (auth.currentUser) {
      try {
        // Forçar obtenção de um novo token do Firebase
        await auth.currentUser.getIdToken(true);
        return true;
      } catch (error) {
        console.error('Erro ao revalidar autenticação:', error);
        return false;
      }
    }
    return false;
  };

  // Monitorar mudanças de auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      actions.setAuthReady(user);
    });

    return () => unsubscribe();
  }, [actions]);

  // Valores do contexto
  const value = useMemo(() => ({
    // Estado atual
    user: state.user,
    authIsReady: state.authIsReady,
    error: state.error,
    
    // Ações úteis
    actions,
    
    // Firebase auth instance (pode ser útil em alguns casos)
    auth,
    
    // Helpers
    isAuthenticated: !!state.user,
    
    // Nova função para revalidar autenticação
    revalidateAuth,
    
    // Dispatch original (caso seja necessário)
    dispatch
  }), [state, actions]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}