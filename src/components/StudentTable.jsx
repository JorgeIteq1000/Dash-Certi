import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search, Eye } from 'lucide-react';

export const StudentTable = ({ students, onStudentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cursoFilter, setCursoFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.cpf.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || student.statusInscricao === statusFilter;
      const matchesCurso = cursoFilter === 'all' || student.curso === cursoFilter;
      
      return matchesSearch && matchesStatus && matchesCurso;
    });
  }, [students, searchTerm, statusFilter, cursoFilter]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const uniqueStatus = [...new Set(students.map(s => s.statusInscricao))].filter(Boolean);
  const uniqueCursos = [...new Set(students.map(s => s.curso))].filter(Boolean);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Ativo': return 'default';
      case 'Concluído': return 'success';
      case 'Trancado': return 'warning';
      case 'Evadido': return 'destructive';
      case 'Cancelado': return 'secondary';
      default: return 'outline';
    }
  };

  const getPilarIcon = (status) => {
    switch (status) {
      case 'OK': return '✅';
      case 'X': return '❌';
      default: return '❓';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lista de Estudantes</CardTitle>
        
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {uniqueStatus.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cursoFilter} onValueChange={setCursoFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cursos</SelectItem>
              {uniqueCursos.map(curso => (
                <SelectItem key={curso} value={curso}>{curso}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium">Curso</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Pilares</th>
                <th className="text-left p-3 font-medium">Cobrancas</th>
                <th className="text-left p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{student.nome}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{student.curso}</div>
                      <div className="text-sm text-gray-500">Turma: {student.turma}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusBadgeVariant(student.statusInscricao)}>
                      {student.statusInscricao}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <span title="Financeiro">{getPilarIcon(student.financeiro)}</span>
                      <span title="Avaliação">{getPilarIcon(student.avaliacao)}</span>
                      <span title="Tempo Mínimo">{getPilarIcon(student.tempoMinimo)}</span>
                      <span title="Documentos">{getPilarIcon(student.documentos)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{student.cobrancas}</span>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStudentSelect && onStudentSelect(student)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredStudents.length)} de {filteredStudents.length} estudantes
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
