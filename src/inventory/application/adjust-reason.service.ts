import { Injectable, Inject } from '@nestjs/common';
import { IAdjustReasonRepository } from '../domain/adjust-reason.repository.interface';
import { AdjustReason } from '../domain/adjust-reason.entity';
import { CreateAdjustReasonDto } from '../dto/create-adjust-reason.dto';
import { UpdateAdjustReasonDto } from '../dto/update-adjust-reason.dto';
import {
  AdjustReasonNotFoundException,
  DuplicateAdjustReasonCodeException,
} from '../domain/exceptions/inventory-domain.exception';
import { ADJUST_REASON_REPOSITORY } from '../constant/inventory.token';

@Injectable()
export class AdjustReasonService {
  constructor(
    @Inject(ADJUST_REASON_REPOSITORY)
    private readonly repository: IAdjustReasonRepository,
  ) {}

  async findAll(): Promise<AdjustReason[]> {
    return this.repository.findAll();
  }

  async findActive(): Promise<AdjustReason[]> {
    return this.repository.findActive();
  }

  async findById(id: number): Promise<AdjustReason> {
    const reason = await this.repository.findById(id);
    if (!reason) {
      throw new AdjustReasonNotFoundException(id);
    }
    return reason;
  }

  async findByCode(code: string): Promise<AdjustReason> {
    const reason = await this.repository.findByCode(code);
    if (!reason) {
      throw new AdjustReasonNotFoundException(code);
    }
    return reason;
  }

  async create(dto: CreateAdjustReasonDto): Promise<AdjustReason> {
    const existing = await this.repository.findByCode(dto.code);
    if (existing) {
      throw new DuplicateAdjustReasonCodeException(dto.code);
    }

    const reason = new AdjustReason({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      direction: dto.direction,
      affectCost: dto.affectCost,
      requireNote: dto.requireNote,
      requireApproval: dto.requireApproval,
    });

    return this.repository.save(reason);
  }

  async update(id: number, dto: UpdateAdjustReasonDto): Promise<AdjustReason> {
    const reason = await this.repository.findById(id);
    if (!reason) {
      throw new AdjustReasonNotFoundException(id);
    }

    reason.update({
      name: dto.name,
      description: dto.description,
      direction: dto.direction,
      affectCost: dto.affectCost,
      requireNote: dto.requireNote,
      requireApproval: dto.requireApproval,
    });

    return this.repository.update(id, reason);
  }

  async activate(id: number): Promise<AdjustReason> {
    const reason = await this.repository.findById(id);
    if (!reason) {
      throw new AdjustReasonNotFoundException(id);
    }

    reason.activate();
    return this.repository.update(id, reason);
  }

  async deactivate(id: number): Promise<AdjustReason> {
    const reason = await this.repository.findById(id);
    if (!reason) {
      throw new AdjustReasonNotFoundException(id);
    }

    reason.deactivate();
    return this.repository.update(id, reason);
  }

  async remove(id: number): Promise<void> {
    const reason = await this.repository.findById(id);
    if (!reason) {
      throw new AdjustReasonNotFoundException(id);
    }
    await this.repository.remove(id);
  }
}
