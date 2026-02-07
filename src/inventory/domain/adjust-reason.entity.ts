import {
  InvalidAdjustReasonException,
} from './exceptions/inventory-domain.exception';

export type AdjustDirection = 'INCREASE' | 'DECREASE' | 'BOTH';

export interface AdjustReasonConstructorData {
  id?: number;
  code: string;
  name: string;
  description?: string | null;
  direction: AdjustDirection;
  affectCost?: boolean;
  requireNote?: boolean;
  requireApproval?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateAdjustReasonData {
  name?: string;
  description?: string | null;
  direction?: AdjustDirection;
  affectCost?: boolean;
  requireNote?: boolean;
  requireApproval?: boolean;
}

export class AdjustReason {
  private id?: number;
  private code: string;
  private name: string;
  private description: string | null;
  private direction: AdjustDirection;
  private affectCost: boolean;
  private requireNote: boolean;
  private requireApproval: boolean;
  private isActive: boolean;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(data: AdjustReasonConstructorData) {
    this.validate(data);

    this.id = data.id;
    this.code = data.code;
    this.name = data.name;
    this.description = data.description ?? null;
    this.direction = data.direction;
    this.affectCost = data.affectCost ?? true;
    this.requireNote = data.requireNote ?? false;
    this.requireApproval = data.requireApproval ?? false;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  private validate(data: AdjustReasonConstructorData): void {
    if (!data.code || data.code.trim() === '') {
      throw new InvalidAdjustReasonException('Code is required');
    }
    if (!data.name || data.name.trim() === '') {
      throw new InvalidAdjustReasonException('Name is required');
    }
    if (!['INCREASE', 'DECREASE', 'BOTH'].includes(data.direction)) {
      throw new InvalidAdjustReasonException('Direction must be INCREASE, DECREASE, or BOTH');
    }
  }

  // Domain methods
  public update(data: UpdateAdjustReasonData): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        throw new InvalidAdjustReasonException('Name is required');
      }
      this.name = data.name;
    }
    if (data.description !== undefined) {
      this.description = data.description;
    }
    if (data.direction !== undefined) {
      if (!['INCREASE', 'DECREASE', 'BOTH'].includes(data.direction)) {
        throw new InvalidAdjustReasonException('Direction must be INCREASE, DECREASE, or BOTH');
      }
      this.direction = data.direction;
    }
    if (data.affectCost !== undefined) {
      this.affectCost = data.affectCost;
    }
    if (data.requireNote !== undefined) {
      this.requireNote = data.requireNote;
    }
    if (data.requireApproval !== undefined) {
      this.requireApproval = data.requireApproval;
    }
  }

  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    this.isActive = false;
  }

  // Getters
  public getId(): number | undefined {
    return this.id;
  }

  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getDirection(): AdjustDirection {
    return this.direction;
  }

  public getAffectCost(): boolean {
    return this.affectCost;
  }

  public getRequireNote(): boolean {
    return this.requireNote;
  }

  public getRequireApproval(): boolean {
    return this.requireApproval;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  // Persistence
  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      direction: this.direction,
      affectCost: this.affectCost,
      requireNote: this.requireNote,
      requireApproval: this.requireApproval,
      isActive: this.isActive,
    };
  }

  public static fromPersistence(data: any): AdjustReason {
    return new AdjustReason({
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      direction: data.direction,
      affectCost: data.affectCost,
      requireNote: data.requireNote,
      requireApproval: data.requireApproval,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
