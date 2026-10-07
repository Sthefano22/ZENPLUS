export class NotFoundError extends Error {
    constructor(entity: string, id: string) {
      super(`${entity} ${id} no encontrado`);
      this.name = 'NotFoundError';
    }
  }
  
  export class OpportunityNotFoundError extends Error {
    constructor(id: string) {
      super(`Opportunity ${id} no existe`);
      this.name = 'OpportunityNotFoundError';
    }
  }
  
  export class InvalidStateTransitionError extends Error {
    constructor(entity: string, from: string, action: string) {
      super(`No se puede ejecutar "${action}" sobre ${entity} en estado ${from}`);
      this.name = 'InvalidStateTransitionError';
    }
  }