import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSignup } from "../../hooks/useSignup";
import { cn } from "@/lib/utils.js";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Icons
import { 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle,
  ShieldCheck,
  X,
  Flame
} from 'lucide-react';

// Password strength component
const PasswordStrength = ({ password }) => {
  const calculateStrength = (pass) => {
    if (!pass) return 0;
    
    let strength = 0;
    
    // Length check
    if (pass.length >= 8) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(pass)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(pass)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(pass)) strength += 1;
    
    // Contains special char
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    
    return strength;
  };
  
  const strength = calculateStrength(password);
  
  const getColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getLabel = () => {
    if (strength <= 1) return 'Fraca';
    if (strength <= 3) return 'Média';
    return 'Forte';
  };
  
  return (
    <div className="mt-1">
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor()} transition-all duration-300`} 
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>
        <span className={`text-xs font-medium ${
          strength <= 1 ? 'text-red-400' : 
          strength <= 3 ? 'text-yellow-400' : 
          'text-green-400'
        }`}>
          {getLabel()}
        </span>
      </div>
    </div>
  );
};

export default function Signup() {
  const { signup, isPending, error } = useSignup();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Removed states for phoneNumber, companyName, and jobTitle
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
    general: ""
    // Removed validation for phoneNumber and companyName
  });

  // Animação na carga da página
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);
  }, []);

  // Validação de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação do formulário
  const validateForm = () => {
    const errors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
      general: ""
      // Removed validation fields for phoneNumber and companyName
    };
    let isValid = true;

    // Validação de nome completo
    if (!fullName) {
      errors.fullName = "O nome completo é obrigatório";
      isValid = false;
    } else if (fullName.length < 3) {
      errors.fullName = "O nome deve ter pelo menos 3 caracteres";
      isValid = false;
    }

    // Validação de email
    if (!email) {
      errors.email = "O email é obrigatório";
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = "Digite um email válido";
      isValid = false;
    }

    // Removed validation for phoneNumber and companyName

    // Validação de senha
    if (!password) {
      errors.password = "A senha é obrigatória";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    // Validação de confirmação de senha
    if (password !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }

    // Validação dos termos
    if (!isTermsAccepted) {
      errors.terms = "Você precisa aceitar os termos e condições";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Manipulador de cadastro
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Call signup hook with only email, password, and fullName
      await signup(email, password, fullName);
      
    } catch (err) {
      console.error("Erro ao fazer cadastro:", err);
      setValidationErrors({
        ...validationErrors,
        general: "Ocorreu um erro ao tentar criar sua conta. Tente novamente."
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] overflow-auto">
      {/* Background e efeitos */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Partículas */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, index) => (
            <div 
              key={index} 
              className="absolute rounded-full bg-orange-500/10"
              style={{
                width: `${Math.random() * 6 + 1}px`,
                height: `${Math.random() * 6 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
                animation: `float ${Math.random() * 50 + 20}s infinite alternate ease-in-out`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Gradientes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-gradient-to-r from-orange-500/10 to-orange-500/0 blur-[100px] opacity-30 animate-pulse"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-r from-amber-600/10 to-amber-600/0 blur-[100px] opacity-20 animate-pulse" style={{animationDuration: '12s'}}></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-r from-orange-700/10 to-orange-700/0 blur-[100px] opacity-20 animate-pulse" style={{animationDuration: '15s'}}></div>
        </div>

        {/* Grid background */}
        <div className="absolute inset-0 bg-[url('https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/grid-pattern-dark.svg')] bg-repeat opacity-[0.03]"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto relative z-10 px-4 py-8 flex flex-col items-center justify-center flex-grow">
        {/* Header com link de retorno */}
        <div className={cn(
          "w-full max-w-md mb-8",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          "transition-all duration-500"
        )}>
          <Link to="/" className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para página inicial
          </Link>
        </div>

        {/* Logo */}
        <div className={cn(
          "mb-8 flex items-center justify-center gap-3",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          "transition-all duration-500 delay-100"
        )}>
          <Flame className="h-10 w-10 text-orange-500" />
          <h1 className="text-3xl font-bold text-white">Email<span className="text-orange-500">Insights</span></h1>
        </div>

        {/* Signup Card */}
        <Card className={cn(
          "w-full max-w-md bg-[#1a1a1a]/90 border-[#333333] text-white rounded-xl backdrop-blur-sm shadow-xl",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          "transition-all duration-500 delay-200"
        )}>
          {/* Orange highlight border */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-700"></div>
          
          <CardHeader className="space-y-1 pt-8 pb-2">
            <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-white to-slate-300 text-transparent bg-clip-text">
              Criar nova conta
            </CardTitle>
            <p className="text-center text-base text-gray-400">
              Preencha os dados para acessar o Email Insights
            </p>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-1">
                <div className={cn(
                  "relative",
                  "rounded-lg",
                  validationErrors.fullName ? "ring-2 ring-red-500/50" : ""
                )}>
                  <User className={cn(
                    "absolute left-3 top-3 h-5 w-5 text-orange-400",
                    validationErrors.fullName ? "text-red-400" : ""
                  )} />
                  
                  <Input
                    type="text"
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (validationErrors.fullName) {
                        setValidationErrors({ ...validationErrors, fullName: "" });
                      }
                    }}
                    className={cn(
                      "pl-10 border rounded-lg py-6",
                      "bg-[#282828]/50 border-[#333333] text-white placeholder:text-gray-500 focus:border-orange-500",
                      validationErrors.fullName ? "border-red-500/50" : "",
                      "transition-all duration-300"
                    )}
                  />
                </div>
                
                {validationErrors.fullName && (
                  <p className="text-red-400 text-xs flex items-center ml-2">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5 inline-block"></span>
                    {validationErrors.fullName}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <div className={cn(
                  "relative",
                  "rounded-lg",
                  validationErrors.email ? "ring-2 ring-red-500/50" : ""
                )}>
                  <Mail className={cn(
                    "absolute left-3 top-3 h-5 w-5 text-orange-400",
                    validationErrors.email ? "text-red-400" : ""
                  )} />
                  
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: "" });
                      }
                    }}
                    className={cn(
                      "pl-10 border rounded-lg py-6",
                      "bg-[#282828]/50 border-[#333333] text-white placeholder:text-gray-500 focus:border-orange-500",
                      validationErrors.email ? "border-red-500/50" : "",
                      "transition-all duration-300"
                    )}
                  />
                </div>
                
                {validationErrors.email && (
                  <p className="text-red-400 text-xs flex items-center ml-2">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5 inline-block"></span>
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className={cn(
                  "relative",
                  "rounded-lg",
                  validationErrors.password ? "ring-2 ring-red-500/50" : ""
                )}>
                  <Lock className={cn(
                    "absolute left-3 top-3 h-5 w-5 text-orange-400",
                    validationErrors.password ? "text-red-400" : ""
                  )} />
                  
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: "" });
                      }
                    }}
                    className={cn(
                      "pl-10 pr-10 border rounded-lg py-6",
                      "bg-[#282828]/50 border-[#333333] text-white placeholder:text-gray-500 focus:border-orange-500",
                      validationErrors.password ? "border-red-500/50" : "",
                      "transition-all duration-300"
                    )}
                  />
                  
                  {/* Toggle password visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 transition-all duration-300 text-slate-400 hover:text-orange-400"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {password && <PasswordStrength password={password} />}
                
                {validationErrors.password && (
                  <p className="text-red-400 text-xs flex items-center ml-2">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5 inline-block"></span>
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <div className={cn(
                  "relative",
                  "rounded-lg",
                  validationErrors.confirmPassword ? "ring-2 ring-red-500/50" : ""
                )}>
                  <Lock className={cn(
                    "absolute left-3 top-3 h-5 w-5 text-orange-400",
                    validationErrors.confirmPassword ? "text-red-400" : ""
                  )} />
                  
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationErrors.confirmPassword) {
                        setValidationErrors({ ...validationErrors, confirmPassword: "" });
                      }
                    }}
                    className={cn(
                      "pl-10 border rounded-lg py-6",
                      "bg-[#282828]/50 border-[#333333] text-white placeholder:text-gray-500 focus:border-orange-500",
                      validationErrors.confirmPassword ? "border-red-500/50" : "",
                      "transition-all duration-300"
                    )}
                  />
                  
                  {/* Password match indicator */}
                  {confirmPassword && (
                    <div className="absolute right-3 top-3">
                      {password === confirmPassword ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                
                {validationErrors.confirmPassword && (
                  <p className="text-red-400 text-xs flex items-center ml-2">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5 inline-block"></span>
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and conditions */}
              <div className="space-y-1">
                <div className="flex items-start space-x-2">
                  <div className="relative inline-flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={isTermsAccepted}
                      onChange={() => {
                        setIsTermsAccepted(!isTermsAccepted);
                        if (validationErrors.terms) {
                          setValidationErrors({ ...validationErrors, terms: "" });
                        }
                      }}
                      className={cn(
                        "w-4 h-4 rounded transition-colors duration-300 focus:ring-2 focus:ring-offset-2 cursor-pointer",
                        "border-2 appearance-none relative",
                        isTermsAccepted ? "bg-orange-600 border-orange-600" : "bg-[#282828] border-[#333333]",
                        "focus:ring-orange-500 focus:ring-offset-[#1a1a1a]",
                        validationErrors.terms ? "ring-2 ring-red-500/50" : ""
                      )}
                    />
                    {isTermsAccepted && (
                      <svg 
                        className="w-2.5 h-2.5 text-white absolute left-[3px] pointer-events-none" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    Eu concordo com os <Link to="/terms" className="text-orange-400 hover:text-orange-300 transition-colors">Termos e Condições</Link> e <Link to="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">Política de Privacidade</Link>
                  </label>
                </div>
                
                {validationErrors.terms && (
                  <p className="text-red-400 text-xs flex items-center ml-2">
                    <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5 inline-block"></span>
                    {validationErrors.terms}
                  </p>
                )}
              </div>

              {/* Error message */}
              {(error || validationErrors.general) && (
                <div className="rounded-lg p-4 text-center border bg-red-500/10 border-red-500/30 text-red-400">
                  <p className="text-sm font-medium">
                    {error || validationErrors.general}
                  </p>
                </div>
              )}

              {/* Email Security Notice */}
              <div className="rounded-lg p-3 bg-orange-500/5 border border-orange-500/10 flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">
                  Nossa plataforma segue as melhores práticas de segurança para email marketing. Seus dados estão seguros e são tratados de acordo com as regulamentações de proteção de dados.
                </p>
              </div>

              {/* Signup Button */}
              <div className="pt-2">
                <Button 
                  type="submit"
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-lg",
                    "font-medium text-white py-6",
                    "transition-all duration-300",
                    "bg-orange-600 hover:bg-orange-700",
                    "shadow-lg shadow-orange-600/20",
                    isPending ? "opacity-90 cursor-not-allowed" : ""
                  )}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Criando conta...</span>
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </div>
              
              {/* Login link */}
              <div className="text-center pt-3">
                <p className="text-sm text-gray-400">
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                  >
                    Faça login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className={cn(
          "mt-8 mb-4 text-center text-xs text-slate-600",
          isLoaded ? "opacity-100" : "opacity-0",
          "transition-opacity duration-500 delay-300"
        )}>
          <p>&copy; 2025 Email Insights. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx="true">{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(10px, 10px); }
        }
        
        @keyframes pulse {
          0% { opacity: var(--opacity, 0.3); }
          50% { opacity: calc(var(--opacity, 0.3) * 0.6); }
          100% { opacity: var(--opacity, 0.3); }
        }
      `}</style>
    </div>
  );
}