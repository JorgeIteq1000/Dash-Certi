import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Mail, CreditCard, BookOpen, FileCheck, Calendar } from 'lucide-react';

export const StudentDetailModal = ({ student, isOpen, onClose }) => {
  if (!student) return null;

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

  const getPilarStatus = (status) => {
    switch (status) {
      case 'OK': return { icon: '✅', text: 'Completo', variant: 'success' };
      case 'X': return { icon: '❌', text: 'Pendente', variant: 'destructive' };
      default: return { icon: '❓', text: 'Não encontrado', variant: 'secondary' };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Estudante
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="font-medium">{student.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CPF</label>
                <p>{student.cpf}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div>
                  <Badge variant={getStatusBadgeVariant(student.statusInscricao)}>
                    {student.statusInscricao}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Acadêmicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Informações Acadêmicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Curso</label>
                <p className="font-medium">{student.curso}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Turma</label>
                <p>{student.turma}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Disciplinas</label>
                <p>{student.disciplinas}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Início</label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {student.dataInicio || 'Não informado'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status dos Pilares */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Status dos Pilares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Financeiro', status: student.financeiro },
                { name: 'Avaliação', status: student.avaliacao },
                { name: 'Tempo Mínimo', status: student.tempoMinimo },
                { name: 'Documentos', status: student.documentos }
              ].map((pilar) => {
                const statusInfo = getPilarStatus(pilar.status);
                return (
                  <div key={pilar.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{pilar.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{statusInfo.icon}</span>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.text}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Cobranças</label>
                <p className="font-medium">{student.cobrancas}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status Financeiro</label>
                <div className="flex items-center gap-2">
                  <span>{getPilarStatus(student.financeiro).icon}</span>
                  <Badge variant={getPilarStatus(student.financeiro).variant}>
                    {getPilarStatus(student.financeiro).text}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificados */}
          {(student.dataSolicDigital || student.dataSolicImpresso) && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Certificados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.dataSolicDigital && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Certificado Digital</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Data Solicitação:</span> {student.dataSolicDigital}</p>
                        {student.tipoCertDigital && (
                          <p><span className="font-medium">Tipo:</span> {student.tipoCertDigital}</p>
                        )}
                        {student.statusCertDigital && (
                          <p><span className="font-medium">Status:</span> {student.statusCertDigital}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {student.dataSolicImpresso && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Certificado Impresso</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Data Solicitação:</span> {student.dataSolicImpresso}</p>
                        {student.tipoCertImpresso && (
                          <p><span className="font-medium">Tipo:</span> {student.tipoCertImpresso}</p>
                        )}
                        {student.statusCertImpresso && (
                          <p><span className="font-medium">Status:</span> {student.statusCertImpresso}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
