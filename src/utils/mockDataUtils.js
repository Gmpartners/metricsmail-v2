/**
 * Funções para gerar dados de testes para desenvolvimento
 */

/**
 * Gera dados diários simulados para testes
 * @param {number} days - Número de dias para gerar (padrão: 30)
 * @returns {Array} Array de objetos com dados diários
 */
export const generateMockDailyData = (days = 30) => {
  const today = new Date();
  const mockData = [];
  
  // Gerar dados para cada dia
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - i - 1));
    
    // Gerar números aleatórios com tendência crescente
    const baseSends = 100 + Math.floor(i * 3.5) + Math.floor(Math.random() * 50);
    const baseOpens = Math.floor(baseSends * (0.3 + Math.random() * 0.2));
    const baseClicks = Math.floor(baseOpens * (0.2 + Math.random() * 0.1));
    
    mockData.push({
      date: date.toISOString().split('T')[0],
      totalSends: baseSends,
      totalOpens: baseOpens,
      uniqueOpens: Math.floor(baseOpens * 0.8),
      totalClicks: baseClicks,
      uniqueClicks: Math.floor(baseClicks * 0.9)
    });
  }
  
  return mockData;
};

/**
 * Gera dados simulados de emails para testes
 * @param {Array} accounts - Array de contas para associar aos emails
 * @param {number} count - Número de emails para gerar
 * @returns {Array} Array de objetos com dados de emails
 */
export const generateMockEmails = (accounts = [], count = 10) => {
  if (!accounts || accounts.length === 0) {
    return [];
  }
  
  const subjects = [
    "Newsletter de Maio",
    "Convite Especial",
    "Novidades da Semana",
    "Promoção Exclusiva",
    "Relatório Mensal",
    "Anúncio de Lançamento",
    "Atualização Importante",
    "Evento Online",
    "Pesquisa de Satisfação",
    "Cupom de Desconto"
  ];
  
  const mockEmails = [];
  
  for (let i = 0; i < count; i++) {
    // Selecionar uma conta aleatória
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    // Gerar métricas realistas
    const sentCount = 100 + Math.floor(Math.random() * 500);
    const openCount = Math.floor(sentCount * (0.2 + Math.random() * 0.3));
    const clickCount = Math.floor(openCount * (0.1 + Math.random() * 0.2));
    const bounceCount = Math.floor(sentCount * (Math.random() * 0.03));
    const unsubscribeCount = Math.floor(sentCount * (Math.random() * 0.01));
    
    // Gerar datas realistas nas últimas 2 semanas
    const today = new Date();
    const sendDate = new Date(today);
    sendDate.setDate(today.getDate() - Math.floor(Math.random() * 14));
    
    mockEmails.push({
      id: `mockmail-${i}`,
      _id: `mockmail-${i}`,
      subject: `${subject} ${i + 1}`,
      name: `${subject} ${i + 1}`,
      accountId: account.id,
      account: {
        id: account.id,
        _id: account.id,
        name: account.name,
        provider: account.provider || 'mautic'
      },
      sendDate: sendDate.toISOString().split('T')[0],
      metrics: {
        sentCount,
        deliveredCount: sentCount - bounceCount,
        openCount,
        uniqueOpenCount: Math.floor(openCount * 0.9),
        clickCount,
        uniqueClickCount: Math.floor(clickCount * 0.9),
        bounceCount,
        unsubscribeCount,
        openRate: (openCount / (sentCount - bounceCount)) * 100,
        clickRate: (clickCount / (sentCount - bounceCount)) * 100,
        bounceRate: (bounceCount / sentCount) * 100,
        unsubscribeRate: (unsubscribeCount / sentCount) * 100,
        clickToOpenRate: (clickCount / openCount) * 100
      }
    });
  }
  
  return mockEmails;
};

/**
 * Gera dados simulados de taxas de conversão
 * @returns {Object} Objeto com taxas de conversão simuladas
 */
export const generateMockRates = () => {
  return {
    deliveryRate: 98 + Math.random() * 1.5,
    openRate: 25 + Math.random() * 10,
    clickRate: 10 + Math.random() * 5,
    bounceRate: 0.5 + Math.random() * 1.5,
    unsubscribeRate: 0.1 + Math.random() * 0.3,
    clickToOpenRate: 30 + Math.random() * 10
  };
};

/**
 * Gera uma resposta simulada de campanhas
 * @param {Array} accounts - Array de contas para associar às campanhas
 * @returns {Array} Array de objetos com dados de campanhas
 */
export const generateMockCampaigns = (accounts = []) => {
  if (!accounts || accounts.length === 0) {
    return [];
  }
  
  const campaignNames = [
    "Campanha de Boas-vindas",
    "Campanha de Reativação",
    "Lançamento de Produto",
    "Webinar Marketing Digital",
    "Campanha Sazonal",
    "Nutrição de Leads",
    "Anúncios Especiais",
    "Campanha de Fim de Ano",
    "Recuperação de Carrinho",
    "Programa de Fidelidade"
  ];
  
  const mockCampaigns = [];
  
  accounts.forEach(account => {
    // Gerar de 1 a 3 campanhas por conta
    const numCampaigns = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numCampaigns; i++) {
      const nameIndex = Math.floor(Math.random() * campaignNames.length);
      mockCampaigns.push({
        id: `mockcampaign-${account.id}-${i}`,
        _id: `mockcampaign-${account.id}-${i}`,
        name: `${campaignNames[nameIndex]} - ${account.name}`,
        accountId: account.id,
        account: {
          id: account.id,
          name: account.name,
          provider: account.provider || 'mautic'
        }
      });
    }
  });
  
  return mockCampaigns;
};

export default {
  generateMockDailyData,
  generateMockEmails,
  generateMockRates,
  generateMockCampaigns
};