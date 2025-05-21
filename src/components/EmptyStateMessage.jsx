import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RefreshCcw, Send, LineChart, Database, AlertTriangle } from 'lucide-react';

/**
 * EmptyStateMessage - Componente para exibir estados de "sem dados" de forma amigável
 */
const EmptyStateMessage = ({ 
  icon = 'chart', 
  title = 'Nenhum dado encontrado',
  message = 'Não encontramos dados para o período selecionado.',
  actionText = 'Atualizar',
  onAction,
  children,
  secondaryAction,
  secondaryActionText
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'chart':
        return <LineChart className="h-16 w-16 text-gray-300 mb-4" />;
      case 'send':
        return <Send className="h-16 w-16 text-gray-300 mb-4" />;
      case 'database':
        return <Database className="h-16 w-16 text-gray-300 mb-4" />; // Substituído DatabaseX por Database
      case 'error':
        return <AlertTriangle className="h-16 w-16 text-amber-400 mb-4" />;
      default:
        return <LineChart className="h-16 w-16 text-gray-300 mb-4" />;
    }
  };

  return (
    <Card className="w-full py-8 px-4 flex flex-col items-center justify-center border-dashed border-gray-200 bg-gray-50">
      {renderIcon()}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{message}</p>
      
      {children}
      
      <div className="flex gap-4">
        {onAction && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onAction}
          >
            <RefreshCcw className="h-4 w-4" />
            {actionText}
          </Button>
        )}
        
        {secondaryAction && (
          <Button 
            variant="default"
            className="flex items-center gap-2"
            onClick={secondaryAction}
          >
            {secondaryActionText}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EmptyStateMessage;