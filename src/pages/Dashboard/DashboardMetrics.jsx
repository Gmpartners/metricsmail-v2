import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Eye, MousePointer, Activity, BarChart2, BadgePercent, Inbox, Mail, CalendarRange } from 'lucide-react';
import DateRangePicker from '../../components/DateRangeSelector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DashboardMetrics = ({ data, filteredData, dateRange, setDateRange }) => {
  const COLORS = ['#FF9800', '#F57C00', '#FF5722', '#FFA726', '#FFB74D'];

  const calculateTotals = () => {
    if (!filteredData) return { 
      sent: 0, opened: 0, uniqueOpened: 0, clicked: 0, bounced: 0, 
      ctr: 0, clickPercentage: 0, openPercentage: 0 
    };
    
    const sent = filteredData.reduce((sum, item) => sum + item.sent, 0);
    const opened = filteredData.reduce((sum, item) => sum + item.opened, 0);
    const uniqueOpened = filteredData.reduce((sum, item) => sum + item.uniqueOpened, 0);
    const clicked = filteredData.reduce((sum, item) => sum + item.clicked, 0);
    const bounced = filteredData.reduce((sum, item) => sum + item.bounced, 0);
    
    return {
      sent,
      opened,
      uniqueOpened,
      clicked,
      bounced,
      ctr: opened > 0 ? (clicked / opened * 100).toFixed(2) : 0,
      clickPercentage: sent > 0 ? (clicked / sent * 100).toFixed(2) : 0,
      openPercentage: sent > 0 ? (opened / sent * 100).toFixed(2) : 0
    };
  };
  
  const totals = calculateTotals();
  
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Visão Geral</h1>
          <p className="text-slate-400">Visualize o desempenho das campanhas de email</p>
        </div>
        
        <div className="filter-container py-2 px-3 sm:px-4 bg-slate-800/40 rounded-lg border border-slate-700 ml-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg bg-slate-800/70 border border-slate-700">
              <CalendarRange className="h-4 w-4 text-orange-400 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm text-slate-300">Período:</span>
            </div>
            <DateRangePicker 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
              compact={window.innerWidth < 768}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-8">
        <Card className="card-modern shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-start">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-orange-500" />
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-400 font-medium">Taxa de Abertura</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 text-transparent bg-clip-text">
                  {totals.openPercentage}%
                </div>
                <div className="text-xs text-slate-500">
                  {formatNumber(totals.opened)} de {formatNumber(totals.sent)} emails
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-modern shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-start">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <MousePointer className="h-6 w-6 text-orange-500" />
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-400 font-medium">Taxa de Clique</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
                  {totals.clickPercentage}%
                </div>
                <div className="text-xs text-slate-500">
                  {formatNumber(totals.clicked)} de {formatNumber(totals.sent)} emails
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-modern shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-start">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-orange-500" />
              </div>
              <div className="space-y-1">
                <div className="text-sm text-slate-400 font-medium">CTR</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 text-transparent bg-clip-text">
                  {totals.ctr}%
                </div>
                <div className="text-xs text-slate-500">
                  {formatNumber(totals.clicked)} de {formatNumber(totals.opened)} aberturas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="card-modern shadow-lg">
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg font-semibold text-white">CTR por Campanha</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-[300px] md:h-[350px] chart-modern">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.campaigns.map(campaign => {
                    const campaignData = filteredData.filter(item => item.campaign === campaign);
                    const opened = campaignData.reduce((sum, item) => sum + item.opened, 0);
                    const clicked = campaignData.reduce((sum, item) => sum + item.clicked, 0);
                    const ctr = opened > 0 ? (clicked / opened * 100).toFixed(2) : 0;
                    return { name: campaign, ctr: parseFloat(ctr) };
                  })}
                  margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{fontSize: 12}}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(40, 40, 40, 0.95)', 
                      borderColor: 'rgba(255, 152, 0, 0.3)',
                      borderRadius: '10px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Bar 
                    dataKey="ctr" 
                    name="CTR (%)" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationBegin={300}
                  >
                    {data.campaigns.map((_, index) => (
                      <Cell
                        key={`cell-${index}`} 
                        fill={index % 2 === 0 ? "#FF9800" : "#F57C00"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-modern shadow-lg">
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg font-semibold text-white">Métricas por Conta Mautic</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-[300px] md:h-[350px] chart-modern">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.mauticAccounts.map(account => {
                    const accountData = filteredData.filter(item => item.mauticAccount === account);
                    const sent = accountData.reduce((sum, item) => sum + item.sent, 0);
                    const opened = accountData.reduce((sum, item) => sum + item.opened, 0);
                    const clicked = accountData.reduce((sum, item) => sum + item.clicked, 0);
                    return { 
                      name: account, 
                      openRate: sent > 0 ? parseFloat((opened / sent * 100).toFixed(2)) : 0,
                      clickRate: sent > 0 ? parseFloat((clicked / sent * 100).toFixed(2)) : 0,
                      ctr: opened > 0 ? parseFloat((clicked / opened * 100).toFixed(2)) : 0
                    };
                  })}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number" 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#9CA3AF" 
                    width={100}
                    tick={{fontSize: 12}}
                  />
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(40, 40, 40, 0.95)', 
                      borderColor: 'rgba(255, 152, 0, 0.3)',
                      borderRadius: '10px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="openRate" 
                    name="Taxa de Abertura" 
                    fill="#FF9800"
                    radius={[0, 4, 4, 0]}
                    animationDuration={1500}
                    barSize={20}
                  />
                  <Bar 
                    dataKey="clickRate" 
                    name="Taxa de Clique" 
                    fill="#F57C00" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1500}
                    animationBegin={300}
                    barSize={20}
                  />
                  <Bar 
                    dataKey="ctr" 
                    name="CTR" 
                    fill="#FF5722" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1500}
                    animationBegin={600}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        <Card className="card-modern shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <BadgePercent className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-white">Conversão Final</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">2.6%</div>
              <div className="flex items-center text-xs text-slate-400 mb-3">
                <span className="text-green-400 font-medium">+0.8%</span>
                <span className="ml-1">vs período anterior</span>
              </div>
              <div className="flex items-end space-x-1 h-12 mt-auto">
                {[30, 45, 25, 60, 40, 75, 65].map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-orange-800 to-orange-500 rounded-t-md"
                    style={{ height: `${value}%`, transition: 'all 0.3s ease' }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-modern shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <Inbox className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-white">Taxa de Entrega</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">98.7%</div>
              <div className="flex items-center text-xs text-slate-400 mb-3">
                <span className="text-green-400 font-medium">+1.2%</span>
                <span className="ml-1">vs período anterior</span>
              </div>
              <div className="flex items-end space-x-1 h-12 mt-auto">
                {[85, 90, 88, 92, 95, 93, 98].map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-orange-700 to-orange-400 rounded-t-md"
                    style={{ height: `${value}%`, transition: 'all 0.3s ease' }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-modern shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-white">Receita por Email</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">R$ 0.42</div>
              <div className="flex items-center text-xs text-slate-400 mb-3">
                <span className="text-green-400 font-medium">+0.12</span>
                <span className="ml-1">vs período anterior</span>
              </div>
              <div className="flex items-end space-x-1 h-12 mt-auto">
                {[25, 35, 30, 42, 38, 60, 70].map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-orange-600 to-orange-300 rounded-t-md"
                    style={{ height: `${value}%`, transition: 'all 0.3s ease' }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;