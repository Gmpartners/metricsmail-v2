import React, { forwardRef, useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Componente de seleção de intervalo de datas para o dashboard de métricas.
 * Permite selecionar um período predefinido ou personalizado.
 */
const DateRangeSelector = forwardRef(({ 
  value, 
  onChange,
  presets = true,
  size = 'default',
  className
}, ref) => {
  // Converter string para objeto Date se necessário
  const parseDate = (dateStr) => {
    if (!dateStr) return undefined;
    
    if (typeof dateStr === 'string') {
      const date = new Date(dateStr);
      // Verificar se a data é válida
      return isNaN(date.getTime()) ? undefined : date;
    }
    
    return dateStr;
  };
  
  // Estado para controlar as datas
  const [dateRange, setDateRange] = useState({
    from: parseDate(value?.from),
    to: parseDate(value?.to)
  });
  
  // Estado para controlar o calendário aberto
  const [open, setOpen] = useState(false);
  
  // Efeito para atualizar o estado local quando o valor externo mudar
  useEffect(() => {
    if (value) {
      setDateRange({
        from: parseDate(value.from),
        to: parseDate(value.to)
      });
    }
  }, [value]);
  
  // Função para formatar a exibição do intervalo de datas
  const formatDateRange = (range) => {
    const { from, to } = range;
    
    if (!from || !to) {
      return 'Selecione um período';
    }
    
    return `${format(from, 'dd/MM/yyyy', { locale: ptBR })} a ${format(to, 'dd/MM/yyyy', { locale: ptBR })}`;
  };
  
  // Função para aplicar o intervalo de datas
  const applyDateRange = () => {
    if (dateRange.from && dateRange.to && onChange) {
      // FIX: Converter para string no formato ISO (YYYY-MM-DD) antes de chamar onChange
      const formattedRange = {
        from: format(dateRange.from, 'yyyy-MM-dd'),
        to: format(dateRange.to, 'yyyy-MM-dd')
      };
      
      onChange(formattedRange);
      setOpen(false);
    }
  };
  
  // Função para aplicar intervalo predefinido
  const applyPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    
    const newRange = { from, to };
    setDateRange(newRange);
    
    // FIX: Converter para string no formato ISO (YYYY-MM-DD) antes de chamar onChange
    const formattedRange = {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd')
    };
    
    onChange(formattedRange);
    setOpen(false);
  };
  
  return (
    <div className={cn("relative", className)} ref={ref}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={size}
            className="w-full sm:w-auto justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 border-b">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {presets && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyPreset(7)}
                  >
                    7d
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyPreset(15)}
                  >
                    15d
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyPreset(30)}
                  >
                    30d
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyPreset(90)}
                  >
                    90d
                  </Button>
                </>
              )}
            </div>
            <Calendar
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={ptBR}
            />
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setOpen(false)}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={applyDateRange}
                disabled={!dateRange.from || !dateRange.to}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

DateRangeSelector.displayName = 'DateRangeSelector';

export default DateRangeSelector;