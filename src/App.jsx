import { useState, useMemo } from 'react';
import { RefreshCw, Users, TrendingUp, BookOpen, FileCheck, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSheetData } from './hooks/useSheetData';
import { KPICard } from './components/KPICard';
import { StatusDistributionChart } from './components/StatusDistributionChart';
import { InadimplenciaChart } from './components/InadimplenciaChart';
import { PilarsStatusChart } from './components/PilarsStatusChart';
import { StudentTable } from './components/StudentTable';
import { StudentDetailModal } from './components/StudentDetailModal';
import './App.css';

function App() {
  const { 
    students, 
    kpis, 
    isLoading, 
    error, 
    refreshData, 
    lastUpdate 
  } = useSheetData();
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  // Dados derivados para os gráficos
  const chartData = useMemo(() => {
    // Distribuição por status
    const statusCounts = students.reduce((acc, student) => {
      acc[student.statusInscricao] = (acc[student.statusInscricao] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Inadimplência
    const inadimplenciaCategories = {
      'Em dia': 0,
      'Atraso leve': 0,
      'Atraso médio': 0,
      'Inadimplente grave': 0
    };

    students.forEach(student => {
      const [pagas, total] = student.cobrancas.split('/').map(Number);
      if (!isNaN(pagas) && !isNaN(total) && total > 0) {
        const ratio = pagas / total;
        
        if (ratio === 1) inadimplenciaCategories['Em dia']++;
        else if (ratio >= 0.8) inadimplenciaCategories['Atraso leve']++;
        else if (ratio >= 0.5) inadimplenciaCategories['Atraso médio']++;
        else inadimplenciaCategories['Inadimplente grave']++;
      }
    });

    const inadimplenciaData = Object.entries(inadimplenciaCategories).map(([category, count]) => ({
      category,
      count,
      percentage: students.length > 0 ? (count / students.length) * 100 : 0
    }));

    // Pilares
    const pilarData = [
      { pilar: 'Financeiro', OK: 0, X: 0, 'Não encontrado': 0 },
      { pilar: 'Avaliação', OK: 0, X: 0, 'Não encontrado': 0 },
      { pilar: 'Tempo Mín.', OK: 0, X: 0, 'Não encontrado': 0 },
      { pilar: 'Documentos', OK: 0, X: 0, 'Não encontrado': 0 }
    ];

    students.forEach(student => {
      pilarData[0][student.financeiro]++;
      pilarData[1][student.avaliacao]++;
      pilarData[2][student.tempoMinimo]++;
      pilarData[3][student.documentos]++;
    });

    return {
      statusDistribution,
      inadimplenciaData,
      pilarData
    };
  }, [students]);

  // Mostrar loading inicial
  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold">Carregando dados da planilha...</p>
          <p className="text-sm text-muted-foreground">Aguarde enquanto buscamos os dados do Google Sheets</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error && students.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-lg font-semibold text-destructive mb-2">Erro ao carregar dados</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard de Controle Acadêmico
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Última atualização: {kpis.ultimaAtualizacao.toLocaleString('pt-BR')}
              {error && (
                <span className="text-warning ml-2">
                  ⚠️ Erro na última atualização
                </span>
              )}
            </span>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(isRefreshing || isLoading) ? 'animate-spin' : ''}`} />
          {isRefreshing || isLoading ? 'Atualizando...' : 'Forçar Atualização'}
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Alunos"
          value={kpis.totalAlunos.toLocaleString()}
          icon={<Users className="h-4 w-4" />}
          variant="default"
        />
        <KPICard
          title="Taxa de Inadimplência"
          value={`${kpis.percentualInadimplente.toFixed(1)}%`}
          subtitle={`${kpis.percentualEmDia.toFixed(1)}% em dia`}
          icon={<AlertCircle className="h-4 w-4" />}
          variant={kpis.percentualInadimplente > 30 ? "destructive" : "success"}
        />
        <KPICard
          title="Progresso Médio"
          value={`${kpis.progressoMedioDisciplinas.toFixed(1)}%`}
          subtitle="disciplinas cursadas"
          icon={<BookOpen className="h-4 w-4" />}
          variant="default"
        />
        <KPICard
          title="Documentos Completos"
          value={`${kpis.taxaDocumentosCompletos.toFixed(1)}%`}
          icon={<FileCheck className="h-4 w-4" />}
          variant={kpis.taxaDocumentosCompletos > 80 ? "success" : "warning"}
        />
      </div>

      {/* KPIs de Certificados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Certificados (7 dias)"
          value={kpis.solicitacoesCertificados7d}
          subtitle="solicitações"
          icon={<TrendingUp className="h-4 w-4" />}
          variant="default"
        />
        <KPICard
          title="Certificados (30 dias)"
          value={kpis.solicitacoesCertificados30d}
          subtitle="solicitações"
          icon={<TrendingUp className="h-4 w-4" />}
          variant="default"
        />
        <KPICard
          title="Certificados (90 dias)"
          value={kpis.solicitacoesCertificados90d}
          subtitle="solicitações"
          icon={<TrendingUp className="h-4 w-4" />}
          variant="default"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionChart data={chartData.statusDistribution} />
        <InadimplenciaChart data={chartData.inadimplenciaData} />
        <PilarsStatusChart data={chartData.pilarData} />
      </div>

      {/* Tabela de Estudantes */}
      <div className="space-y-4">
        <StudentTable
          students={students}
          onStudentSelect={handleStudentSelect}
        />
      </div>

      {/* Modal de Detalhes do Estudante */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}

export default App;
