import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

// URL da planilha Google Sheets em formato CSV
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ25AYPgZEudDjhakxxgPNt4IjVlrKWmXzrjgcp7M95YPV23Iib4C7bQ8VAXi_AE49cIfg59Ie9z42X/pub?output=csv';

export const useSheetData = () => {
  const [students, setStudents] = useState([]);
  const [kpis, setKpis] = useState({
    totalAlunos: 0,
    percentualEmDia: 0,
    percentualInadimplente: 0,
    progressoMedioDisciplinas: 0,
    taxaDocumentosCompletos: 0,
    solicitacoesCertificados7d: 0,
    solicitacoesCertificados30d: 0,
    solicitacoesCertificados90d: 0,
    ultimaAtualizacao: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching data from Google Sheets CSV...');
      
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      if (!response.ok) {
        throw new Error(`Falha na busca do CSV: ${response.statusText}`);
      }
      const csvText = await response.text();

      const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      if (parsedData.errors.length > 0) {
        console.error("Erros de parse do CSV:", parsedData.errors);
        throw new Error("Erro ao fazer o parse do CSV.");
      }

      const rawStudents = parsedData.data;

      // Mapear os dados do CSV para o formato esperado
      const processedStudents = rawStudents.map((row, index) => ({
        id: row.ID || `student-${index}`,
        nome: row.Nome || '',
        email: row.Email || '',
        cpf: row.CPF || '',
        curso: row.Curso || '',
        turma: row.Turma || '',
        statusInscricao: row['Status Inscrição'] || row['Status Inscricao'] || '',
        cobrancas: row.Cobrancas || '0/0',
        financeiro: row.Financeiro || 'Não encontrado',
        avaliacao: row.Avaliacao || 'Não encontrado',
        tempoMinimo: row['Tempo Mínimo'] || row['Tempo Minimo'] || 'Não encontrado',
        documentos: row.Documentos || 'Não encontrado',
        disciplinas: row.Disciplinas || '0/0',
        dataInicio: row['Data Início'] || row['Data Inicio'] || '',
        dataSolicDigital: row['Data Solic. Digital'] || undefined,
        tipoCertDigital: row['Tipo Cert. Digital'] || undefined,
        statusCertDigital: row['Status Cert. Digital'] || undefined,
        dataSolicImpresso: row['Data Solic. Impresso'] || undefined,
        tipoCertImpresso: row['Tipo Cert. Impresso'] || undefined,
        statusCertImpresso: row['Status Cert. Impresso'] || undefined,
      }));

      // Calcular KPIs
      const totalAlunos = processedStudents.length;
      
      // Inadimplência
      const inadimplentes = processedStudents.filter(s => {
        const [pagas, total] = s.cobrancas.split('/').map(Number);
        return !isNaN(pagas) && !isNaN(total) && pagas < total;
      }).length;
      const emDia = totalAlunos - inadimplentes;

      const percentualEmDia = totalAlunos > 0 ? (emDia / totalAlunos) * 100 : 0;
      const percentualInadimplente = totalAlunos > 0 ? (inadimplentes / totalAlunos) * 100 : 0;

      // Progresso médio de disciplinas
      const totalProgresso = processedStudents.reduce((sum, s) => {
        const [cursadas, total] = s.disciplinas.split('/').map(Number);
        if (!isNaN(cursadas) && !isNaN(total) && total > 0) {
          return sum + (cursadas / total) * 100;
        }
        return sum;
      }, 0);
      const progressoMedioDisciplinas = totalAlunos > 0 ? totalProgresso / totalAlunos : 0;

      // Documentos completos
      const documentosCompletos = processedStudents.filter(s => s.documentos === 'OK').length;
      const taxaDocumentosCompletos = totalAlunos > 0 ? (documentosCompletos / totalAlunos) * 100 : 0;

      // Certificados (simulados para demonstração)
      const solicitacoesCertificados7d = Math.floor(Math.random() * 10) + 1;
      const solicitacoesCertificados30d = Math.floor(Math.random() * 30) + 5;
      const solicitacoesCertificados90d = Math.floor(Math.random() * 80) + 15;

      const newKpis = {
        totalAlunos,
        percentualEmDia,
        percentualInadimplente,
        progressoMedioDisciplinas: isNaN(progressoMedioDisciplinas) ? 0 : progressoMedioDisciplinas,
        taxaDocumentosCompletos,
        solicitacoesCertificados7d,
        solicitacoesCertificados30d,
        solicitacoesCertificados90d,
        ultimaAtualizacao: new Date()
      };

      setStudents(processedStudents);
      setKpis(newKpis);
      setLastUpdate(new Date());

      console.log(`Dados carregados: ${processedStudents.length} estudantes`);

    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh a cada 15 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refresh triggered');
      fetchData();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    students,
    kpis,
    isLoading,
    error,
    refreshData,
    lastUpdate
  };
};
