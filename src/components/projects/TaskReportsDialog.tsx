import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, DollarSign, Clock, User, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onUpdateTask: (taskId: string, updates: any) => Promise<void>;
  userRole?: string;
}

const TaskReportsDialog = ({ 
  open, 
  onOpenChange, 
  task, 
  onUpdateTask,
  userRole 
}: TaskReportsDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("informes");
  const [newReport, setNewReport] = useState({
    titulo: "",
    contenido: "",
    tipo: "progreso" as "progreso" | "incidencia" | "finalizado"
  });
  const [budgetUpdate, setBudgetUpdate] = useState({
    costoActual: task?.actualCost || 0,
    descripcion: ""
  });
  const [timeLog, setTimeLog] = useState({
    horas: "",
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  // Mock data para demostración
  const reports = [
    {
      id: 1,
      titulo: "Progreso Semanal",
      contenido: "Se completó el 70% de la funcionalidad principal. Pendiente testing.",
      tipo: "progreso",
      fecha: "2024-01-10",
      autor: "María González"
    },
    {
      id: 2,
      titulo: "Incidencia Técnica",
      contenido: "Se encontró un problema con la integración de la API externa.",
      tipo: "incidencia",
      fecha: "2024-01-08",
      autor: "Carlos Ruiz"
    }
  ];

  const timeLogs = [
    { id: 1, horas: 8, descripcion: "Desarrollo de componentes", fecha: "2024-01-10", usuario: "Ana García" },
    { id: 2, horas: 4, descripcion: "Reunión con cliente", fecha: "2024-01-09", usuario: "María González" },
    { id: 3, horas: 6, descripcion: "Testing y correcciones", fecha: "2024-01-08", usuario: "Carlos Ruiz" }
  ];

  const handleCreateReport = async () => {
    if (!newReport.titulo.trim() || !newReport.contenido.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Aquí se implementaría la lógica para crear el informe en la base de datos
      toast({
        title: "Informe creado",
        description: "El informe se ha guardado exitosamente",
      });
      
      setNewReport({ titulo: "", contenido: "", tipo: "progreso" });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el informe",
        variant: "destructive"
      });
    }
  };

  const handleUpdateBudget = async () => {
    if (!budgetUpdate.descripcion.trim()) {
      toast({
        title: "Error",
        description: "Por favor añade una descripción del gasto",
        variant: "destructive"
      });
      return;
    }

    try {
      await onUpdateTask(task.id, {
        actualCost: parseFloat(budgetUpdate.costoActual.toString())
      });
      
      toast({
        title: "Presupuesto actualizado",
        description: "El costo actual se ha actualizado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el presupuesto",
        variant: "destructive"
      });
    }
  };

  const handleLogTime = async () => {
    if (!timeLog.horas || !timeLog.descripcion.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Aquí se implementaría la lógica para registrar el tiempo en la base de datos
      toast({
        title: "Tiempo registrado",
        description: "El registro de tiempo se ha guardado exitosamente",
      });
      
      setTimeLog({ horas: "", descripcion: "", fecha: new Date().toISOString().split('T')[0] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el tiempo",
        variant: "destructive"
      });
    }
  };

  const getReportTypeColor = (tipo: string) => {
    switch (tipo) {
      case "progreso": return "bg-blue-100 text-blue-800";
      case "incidencia": return "bg-red-100 text-red-800";
      case "finalizado": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalHoras = timeLogs.reduce((sum, log) => sum + log.horas, 0);
  const costoEstimado = task?.budget || 0;
  const costoActual = task?.actualCost || 0;
  const diferenciaCosto = costoActual - costoEstimado;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestión de Tarea: {task?.title}
          </DialogTitle>
          <DialogDescription>
            Administra informes, seguimiento de tiempo y presupuesto para esta tarea
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="informes">Informes</TabsTrigger>
            <TabsTrigger value="tiempo">Tiempo</TabsTrigger>
            <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
            <TabsTrigger value="archivos">Archivos</TabsTrigger>
          </TabsList>

          <TabsContent value="informes" className="space-y-4">
            {/* Crear nuevo informe */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Crear Nuevo Informe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título del informe</Label>
                    <Input
                      id="titulo"
                      value={newReport.titulo}
                      onChange={(e) => setNewReport({...newReport, titulo: e.target.value})}
                      placeholder="Ej: Informe de progreso semanal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo de informe</Label>
                    <select
                      id="tipo"
                      value={newReport.tipo}
                      onChange={(e) => setNewReport({...newReport, tipo: e.target.value as any})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="progreso">Progreso</option>
                      <option value="incidencia">Incidencia</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="contenido">Contenido del informe</Label>
                  <Textarea
                    id="contenido"
                    value={newReport.contenido}
                    onChange={(e) => setNewReport({...newReport, contenido: e.target.value})}
                    placeholder="Describe el progreso, incidencias o resultados..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleCreateReport} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Informe
                </Button>
              </CardContent>
            </Card>

            {/* Lista de informes existentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informes Anteriores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{report.titulo}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getReportTypeColor(report.tipo)}>
                            {report.tipo}
                          </Badge>
                          <span className="text-sm text-gray-500">{report.fecha}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{report.contenido}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="h-3 w-3" />
                        {report.autor}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiempo" className="space-y-4">
            {/* Registrar tiempo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registrar Tiempo Trabajado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="horas">Horas trabajadas</Label>
                    <Input
                      id="horas"
                      type="number"
                      min="0"
                      step="0.5"
                      value={timeLog.horas}
                      onChange={(e) => setTimeLog({...timeLog, horas: e.target.value})}
                      placeholder="8.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={timeLog.fecha}
                      onChange={(e) => setTimeLog({...timeLog, fecha: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descripcionTiempo">Descripción</Label>
                    <Input
                      id="descripcionTiempo"
                      value={timeLog.descripcion}
                      onChange={(e) => setTimeLog({...timeLog, descripcion: e.target.value})}
                      placeholder="Desarrollo de funcionalidades"
                    />
                  </div>
                </div>
                <Button onClick={handleLogTime} className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Registrar Tiempo
                </Button>
              </CardContent>
            </Card>

            {/* Resumen de tiempo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registro de Tiempo</CardTitle>
                <CardDescription>
                  Total acumulado: {totalHoras} horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{log.descripcion}</p>
                        <p className="text-sm text-gray-500">{log.usuario}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{log.horas}h</p>
                        <p className="text-sm text-gray-500">{log.fecha}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presupuesto" className="space-y-4">
            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Presupuesto Estimado</p>
                    <p className="text-2xl font-bold text-blue-600">${costoEstimado.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Costo Actual</p>
                    <p className="text-2xl font-bold text-orange-600">${costoActual.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Diferencia</p>
                    <p className={`text-2xl font-bold ${diferenciaCosto > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {diferenciaCosto > 0 ? '+' : ''}${diferenciaCosto.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actualizar presupuesto */}
            {(userRole === 'Director' || userRole === 'admin') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actualizar Costo Real</CardTitle>
                  <CardDescription>
                    Solo directores pueden modificar el presupuesto de las tareas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="costoActual">Nuevo costo actual</Label>
                      <Input
                        id="costoActual"
                        type="number"
                        min="0"
                        step="0.01"
                        value={budgetUpdate.costoActual}
                        onChange={(e) => setBudgetUpdate({...budgetUpdate, costoActual: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descripcionGasto">Descripción del gasto</Label>
                      <Input
                        id="descripcionGasto"
                        value={budgetUpdate.descripcion}
                        onChange={(e) => setBudgetUpdate({...budgetUpdate, descripcion: e.target.value})}
                        placeholder="Materiales, horas extra, etc."
                      />
                    </div>
                  </div>
                  <Button onClick={handleUpdateBudget} className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Actualizar Presupuesto
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="archivos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestión de Archivos</CardTitle>
                <CardDescription>
                  Sube documentos, informes en Word, imágenes y otros archivos relacionados con la tarea
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p className="text-sm text-gray-500">Soporta: Word, PDF, imágenes, Excel (Máx. 10MB)</p>
                  <Button variant="outline" className="mt-4">
                    Seleccionar Archivos
                  </Button>
                </div>
                
                {/* Lista de archivos existentes */}
                <div className="space-y-2">
                  <h4 className="font-medium">Archivos adjuntos</h4>
                  <div className="text-center text-gray-500 py-8">
                    No hay archivos adjuntos aún
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskReportsDialog;