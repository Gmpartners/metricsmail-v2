import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Um componente de card para exibição de estatísticas com design moderno
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Título da estatística
 * @param {string|number} props.value - Valor principal a ser exibido
 * @param {string|number} props.previousValue - Valor do período anterior (opcional)
 * @param {React.Component} props.icon - Componente de ícone Lucide
 * @param {string} props.colorScheme - Esquema de cores (blue, purple, teal, pink, orange)
 * @param {string} props.className - Classes adicionais
 */
const StatCard = ({ 
  title, 
  value, 
  previousValue, 
  icon: Icon, 
  colorScheme = 'blue',
  className = '' 
}) => {
  // Calcular a mudança percentual
  const changePercent = previousValue ? ((value - previousValue) / previousValue * 100) : 0;
  const isPositive = changePercent >= 0;
  
  // Configurações de cores baseadas no esquema
  const colorConfig = {
    blue: {
      gradient: 'from-blue-600 to-indigo-600',
      glow: 'rgba(59, 130, 246, 0.3)',
      bgOpacity: 'bg-blue-600/10',
      textColor: 'text-blue-400'
    },
    purple: {
      gradient: 'from-purple-600 to-indigo-600',
      glow: 'rgba(139, 92, 246, 0.3)',
      bgOpacity: 'bg-purple-600/10',
      textColor: 'text-purple-400'
    },
    teal: {
      gradient: 'from-teal-500 to-blue-500',
      glow: 'rgba(20, 184, 166, 0.3)',
      bgOpacity: 'bg-teal-600/10',
      textColor: 'text-teal-400'
    },
    pink: {
      gradient: 'from-pink-600 to-purple-600',
      glow: 'rgba(236, 72, 153, 0.3)',
      bgOpacity: 'bg-pink-600/10',
      textColor: 'text-pink-400'
    },
    orange: {
      gradient: 'from-orange-500 to-pink-600',
      glow: 'rgba(249, 115, 22, 0.3)',
      bgOpacity: 'bg-orange-600/10',
      textColor: 'text-orange-400'
    }
  };
  
  const colors = colorConfig[colorScheme] || colorConfig.blue;
  
  return (
    <Card className={`bg-gradient-to-br from-[#202942] to-[#2a3452] border border-white/8 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      <CardContent className="p-6 relative">
        {/* Efeito de luz de fundo */}
        <div 
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-3xl" 
          style={{ background: `linear-gradient(135deg, ${colors.glow} 0%, rgba(0,0,0,0) 70%)` }}
        ></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className={`text-sm font-medium ${colors.textColor} mb-1`}>{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            
            {previousValue !== undefined && (
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    <span className="font-medium">{Math.abs(changePercent).toFixed(1)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full text-xs">
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                    <span className="font-medium">{Math.abs(changePercent).toFixed(1)}%</span>
                  </div>
                )}
                <span className="text-xs text-blue-300/50 ml-2">vs. anterior</span>
              </div>
            )}
          </div>
          
          <div 
            className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient} ring-1 ring-white/10 shadow-lg`} 
            style={{ boxShadow: `0 8px 16px ${colors.glow}` }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;