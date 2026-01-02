import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FileEntity } from '../domain/file.entity';
import { FileFilter, IFileRepository } from '../domain/file.repository.interface';

@Injectable()
export class FileRepository implements IFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(file: FileEntity): Promise<FileEntity> {
    const data = file.toPersistence();
    const { id, ...createData } = data;

    const saved = await this.prisma.client.file.create({
      data: createData,
    });

    return FileEntity.fromPersistence(saved);
  }

  async findById(id: number): Promise<FileEntity | null> {
    const file = await this.prisma.client.file.findUnique({
      where: { id },
    });

    return file ? FileEntity.fromPersistence(file) : null;
  }

  async findByContext(
    contextType: string,
    contextId: number,
    contextKey?: string
  ): Promise<FileEntity[]> {
    const files = await this.prisma.client.file.findMany({
      where: {
        contextType,
        contextId,
        ...(contextKey && { contextKey }),
        deletedAt: null,
      },
      orderBy: { displayOrder: 'asc' },
    });

    return files.map(f => FileEntity.fromPersistence(f));
  }

  async findByPath(path: string): Promise<FileEntity | null> {
    const file = await this.prisma.client.file.findFirst({
      where: {
        path,
        deletedAt: null,
      },
    });

    return file ? FileEntity.fromPersistence(file) : null;
  }

  async findPrimaryFile(contextType: string, contextId: number): Promise<FileEntity | null> {
    const file = await this.prisma.client.file.findFirst({
      where: {
        contextType,
        contextId,
        isPrimary: true,
        deletedAt: null,
      },
    });

    return file ? FileEntity.fromPersistence(file) : null;
  }

  async findMany(filter: FileFilter): Promise<FileEntity[]> {
    const files = await this.prisma.client.file.findMany({
      where: {
        ...(filter.contextType && { contextType: filter.contextType }),
        ...(filter.contextId && { contextId: filter.contextId }),
        ...(filter.contextKey && { contextKey: filter.contextKey }),
        ...(filter.category && { category: filter.category }),
        ...(filter.isPrimary !== undefined && { isPrimary: filter.isPrimary }),
        ...(!filter.includeDeleted && { deletedAt: null }),
      },
      orderBy: { displayOrder: 'asc' },
    });

    return files.map(f => FileEntity.fromPersistence(f));
  }

  async update(id: number, data: Partial<FileEntity>): Promise<FileEntity> {
    const updated = await this.prisma.client.file.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return FileEntity.fromPersistence(updated);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.client.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hardDelete(id: number): Promise<void> {
    await this.prisma.client.file.delete({
      where: { id },
    });
  }

  async deleteByContext(contextType: string, contextId: number): Promise<void> {
    await this.prisma.client.file.updateMany({
      where: { contextType, contextId },
      data: { deletedAt: new Date() },
    });
  }

  async setPrimaryFile(id: number, contextType: string, contextId: number): Promise<void> {
    await this.prisma.$transaction([
      // Unset all primary flags for this context
      this.prisma.client.file.updateMany({
        where: { contextType, contextId, isPrimary: true },
        data: { isPrimary: false },
      }),
      // Set this file as primary
      this.prisma.client.file.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);
  }

  async reorderFiles(fileIds: number[]): Promise<void> {
    const updates = fileIds.map((id, index) =>
      this.prisma.client.file.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await this.prisma.$transaction(updates);
  }

  async findOrphanedFiles(): Promise<FileEntity[]> {
    // This is a simplified version - you'd need to check against actual tables
    // For now, just return files that are soft-deleted
    const files = await this.prisma.client.file.findMany({
      where: {
        deletedAt: { not: null },
      },
    });

    return files.map(f => FileEntity.fromPersistence(f));
  }
}
