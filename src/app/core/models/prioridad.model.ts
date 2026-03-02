export interface Prioridad {
  prioridadId: number;
  descripcion: string;
}

export interface CrearPaqueteRequest {
  descripcion: string;
  peso: number;
  prioridadId: number;
}
