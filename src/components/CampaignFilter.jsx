import React, { useEffect, useState } from 'react';
import { FileText, Loader } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const CampaignFilter = ({ 
  campaigns = [], 
  selectedCampaign, 
  setSelectedCampaign,
  selectedAccount,
  isLoading = false,
  className = "",
  compact = false
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const isDisabled = !selectedAccount || selectedAccount === 'all' || isLoading;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!compact && (
        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg bg-slate-800/70 border border-slate-700">
          <FileText className="h-4 w-4 text-orange-400 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm text-slate-300">Campanha:</span>
        </div>
      )}
      
      <Select 
        value={selectedCampaign} 
        onValueChange={setSelectedCampaign}
        defaultValue="all"
        disabled={isDisabled}
      >
        <SelectTrigger 
          className={`${compact ? 'w-[120px]' : 'w-[180px]'} bg-slate-800/70 border-slate-700 text-white text-sm
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <SelectValue placeholder={
            isLoading ? "Carregando..." : 
            isDisabled ? "Selecione uma conta" : 
            "Todas campanhas"
          } />
          {isLoading && <Loader className="h-4 w-4 animate-spin ml-2" />}
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[300px] overflow-y-auto">
          <SelectItem value="all">Todas campanhas</SelectItem>
          {campaigns.map((campaign, index) => (
            <SelectItem 
              key={campaign.id || campaign || index} 
              value={campaign.id || campaign}
            >
              <div className="flex flex-col">
                <span>{campaign.name || campaign}</span>
                {campaign.description && (
                  <span className="text-xs text-slate-400 truncate">
                    {campaign.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CampaignFilter;