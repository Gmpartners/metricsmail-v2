import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter, RefreshCw, Check, ChevronDown, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

// Importe o componente DateRangeSelector aprimorado
import DateRangeSelector from './DateRangeSelector';

const MetricsFilter = ({
  data,
  selectedAccounts,
  setSelectedAccounts,
  selectedEmails,
  setSelectedEmails,
  dateRange,
  setDateRange,
  isFiltering,
  refreshData,
  resetFiltersAndRetry,
  isMobile
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [isEmailSelectorOpen, setIsEmailSelectorOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [emails, setEmails] = useState([]);
  
  // Extrair contas únicas dos dados
  useEffect(() => {
    if (data) {
      // Extrair contas dos emails
      let accountList = [];
      if (data.emailData && Array.isArray(data.emailData)) {
        accountList = data.emailData
          .filter(email => email.account && email.account.name)
          .map(email => ({
            id: email.account.id || email.account.accountId,
            name: email.account.name,
          }));
      }
      
      // Adicionar contas específicas do objeto de contas, se disponível
      if (data.accounts && Array.isArray(data.accounts)) {
        accountList = [
          ...accountList,
          ...data.accounts.map(account => ({
            id: account.id || account.accountId,
            name: account.name,
          }))
        ];
      }
      
      // Remover duplicatas baseado no nome da conta
      const uniqueAccounts = Array.from(
        new Map(accountList.map(account => [account.name, account])).values()
      );
      
      setAccounts(uniqueAccounts);
      
      // Extrair dados de emails se disponíveis
      if (data.emailData && Array.isArray(data.emailData)) {
        setEmails(
          data.emailData.map(email => ({
            id: email.id || email.emailId,
            subject: email.subject || 'Email sem assunto',
            sentDate: email.sentDate,
            accountName: email.account?.name || 'Conta desconhecida'
          }))
        );
      }
    }
  }, [data]);
  
  const handleAccountSelection = (accountNames) => {
    setSelectedAccounts(accountNames);
    setSelectedEmails(['none']); // Reset email selection when account changes
  };
  
  const handleEmailSelection = (emailIds) => {
    setSelectedEmails(emailIds);
    setSelectedAccounts(['all']); // Reset account selection when emails are selected
  };
  
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setIsCalendarOpen(false);  // Fechar o popover ao selecionar
  };
  
  const handleFilter = () => {
    refreshData();
  };
  
  const handleClearFilters = () => {
    setSelectedAccounts(['all']);
    setSelectedEmails(['none']);
    setDateRange({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    });
    resetFiltersAndRetry();
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-6 w-1 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full mr-2"></div>
          <h3 className="text-lg font-medium text-white">Filtros e Configurações</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Seletor de intervalo de datas - Componente Aprimorado */}
        <div>
          <label className="text-sm font-medium text-blue-300/80 mb-1.5 block flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
            Intervalo de Datas
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gradient-to-r from-[#0f1631] to-[#192041] border-indigo-500/20 hover:border-indigo-500/40 text-white rounded-lg shadow-md",
                  !dateRange && "text-white"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-indigo-400" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0" 
              align="start"
            >
              {/* Aqui nós usamos o componente DateRangeSelector aprimorado */}
              <DateRangeSelector 
                dateRange={dateRange}
                onChange={handleDateRangeChange}
                onClose={() => setIsCalendarOpen(false)}
                isMobile={isMobile}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Seletor de contas */}
        <div>
          <label className="text-sm font-medium text-blue-300/80 mb-1.5 block">Contas</label>
          <Popover open={isAccountSelectorOpen} onOpenChange={setIsAccountSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between bg-gradient-to-r from-[#0f1631] to-[#192041] border-indigo-500/20 hover:border-indigo-500/40 text-white rounded-lg shadow-md"
              >
                {selectedAccounts.includes('all') ? (
                  <span>Todas as contas</span>
                ) : (
                  <div className="flex items-center gap-1 overflow-hidden max-w-full">
                    <span className="truncate">
                      {selectedAccounts.length} {selectedAccounts.length === 1 ? 'conta' : 'contas'}
                    </span>
                  </div>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-[#0f1631]/90 backdrop-blur-lg border border-indigo-500/20">
              <Command className="bg-transparent">
                <CommandInput placeholder="Buscar contas..." className="text-white" />
                <CommandList className="text-white">
                  <CommandEmpty className="py-6 text-center text-sm text-blue-300/70">
                    Nenhuma conta encontrada.
                  </CommandEmpty>
                  <CommandGroup className="overflow-auto max-h-[300px]">
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        handleAccountSelection(['all']);
                        setIsAccountSelectorOpen(false);
                      }}
                      className="flex items-center gap-2 cursor-pointer hover:bg-indigo-500/20"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span>Todas as contas</span>
                      </div>
                      {selectedAccounts.includes('all') && (
                        <Check className="h-4 w-4 text-indigo-500" />
                      )}
                    </CommandItem>
                    
                    {accounts.map((account) => (
                      <CommandItem
                        key={account.id || account.name}
                        value={account.name}
                        onSelect={() => {
                          const newSelection = selectedAccounts.includes(account.name)
                            ? selectedAccounts.filter(a => a !== account.name && a !== 'all')
                            : [...selectedAccounts.filter(a => a !== 'all'), account.name];
                          
                          // Se nenhuma conta selecionada, voltar para "todas"
                          if (newSelection.length === 0) {
                            handleAccountSelection(['all']);
                          } else {
                            handleAccountSelection(newSelection);
                          }
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-indigo-500/20"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span>{account.name}</span>
                        </div>
                        {selectedAccounts.includes(account.name) && (
                          <Check className="h-4 w-4 text-indigo-500" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                <div className="border-t border-indigo-500/20 p-2 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      handleAccountSelection(['all']);
                      setIsAccountSelectorOpen(false);
                    }}
                    className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    Limpar seleção
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setIsAccountSelectorOpen(false)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Aplicar
                  </Button>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Seletor de emails */}
        <div>
          <label className="text-sm font-medium text-blue-300/80 mb-1.5 block">Emails</label>
          <Popover open={isEmailSelectorOpen} onOpenChange={setIsEmailSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between bg-gradient-to-r from-[#0f1631] to-[#192041] border-indigo-500/20 hover:border-indigo-500/40 text-white rounded-lg shadow-md"
              >
                {selectedEmails.includes('none') ? (
                  <span>Selecione emails</span>
                ) : (
                  <div className="flex items-center gap-1 overflow-hidden max-w-full">
                    <span className="truncate">
                      {selectedEmails.length} {selectedEmails.length === 1 ? 'email' : 'emails'}
                    </span>
                  </div>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-[#0f1631]/90 backdrop-blur-lg border border-indigo-500/20">
              <Command className="bg-transparent">
                <CommandInput placeholder="Buscar emails..." className="text-white" />
                <CommandList className="text-white">
                  <CommandEmpty className="py-6 text-center text-sm text-blue-300/70">
                    Nenhum email encontrado.
                  </CommandEmpty>
                  <CommandGroup className="overflow-auto max-h-[300px]">
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        handleEmailSelection(['none']);
                        setIsEmailSelectorOpen(false);
                      }}
                      className="flex items-center gap-2 cursor-pointer hover:bg-indigo-500/20"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span>Nenhum email (usar contas)</span>
                      </div>
                      {selectedEmails.includes('none') && (
                        <Check className="h-4 w-4 text-indigo-500" />
                      )}
                    </CommandItem>
                    
                    {emails.map((email) => (
                      <CommandItem
                        key={email.id}
                        value={email.subject}
                        onSelect={() => {
                          const newSelection = selectedEmails.includes(email.id)
                            ? selectedEmails.filter(e => e !== email.id && e !== 'none')
                            : [...selectedEmails.filter(e => e !== 'none'), email.id];
                          
                          // Se nenhum email selecionado, voltar para "none"
                          if (newSelection.length === 0) {
                            handleEmailSelection(['none']);
                          } else {
                            handleEmailSelection(newSelection);
                          }
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-indigo-500/20"
                      >
                        <div className="flex flex-col flex-1">
                          <span className="truncate">{email.subject}</span>
                          <span className="text-xs text-blue-300/70">
                            {email.accountName} • {email.sentDate ? 
                              new Date(email.sentDate).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                          </span>
                        </div>
                        {selectedEmails.includes(email.id) && (
                          <Check className="h-4 w-4 text-indigo-500" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                <div className="border-t border-indigo-500/20 p-2 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      handleEmailSelection(['none']);
                      setIsEmailSelectorOpen(false);
                    }}
                    className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    Limpar seleção
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setIsEmailSelectorOpen(false)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Aplicar
                  </Button>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-2 items-end">
          <Button 
            onClick={handleFilter}
            disabled={isFiltering}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 border-0 hover:shadow-lg hover:shadow-indigo-600/30 text-white transition-all"
          >
            {isFiltering ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Filtrando...
              </>
            ) : (
              <>
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </>
            )}
          </Button>
          <Button 
            onClick={handleClearFilters}
            variant="outline" 
            className="bg-[#0f1631] border-indigo-500/20 hover:bg-[#192041] hover:border-indigo-500/40 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Badge de filtragem ativa */}
      <div className="mt-3 flex flex-wrap gap-2">
        {/* Badge para intervalo de datas */}
        {dateRange?.from && dateRange?.to && (
          <Badge 
            variant="outline" 
            className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 rounded-lg shadow-sm"
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            <span className="mr-1">Período:</span>
            {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
          </Badge>
        )}
        
        {/* Badge para contas selecionadas */}
        {!selectedAccounts.includes('all') && (
          <Badge 
            variant="outline" 
            className="bg-blue-500/20 text-blue-300 border-blue-400/30 rounded-lg shadow-sm"
          >
            <span className="mr-1">Contas:</span>
            {selectedAccounts.length} selecionadas
          </Badge>
        )}
        
        {/* Badge para emails selecionados */}
        {!selectedEmails.includes('none') && (
          <Badge 
            variant="outline" 
            className="bg-purple-500/20 text-purple-300 border-purple-400/30 rounded-lg shadow-sm"
          >
            <span className="mr-1">Emails:</span>
            {selectedEmails.length} selecionados
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MetricsFilter;