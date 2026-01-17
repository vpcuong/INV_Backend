import { Injectable, Logger } from '@nestjs/common';

export interface AuditLogEntry {
  entity: string;
  entityId: number | string;
  action: string;
  userId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger('SOAudit');

  /**
   * Log an audit event for SO operations
   */
  log(entry: AuditLogEntry): void {
    const logMessage = this.formatLogMessage(entry);
    this.logger.log(logMessage);

    // TODO: Persist to database or external audit service
    // await this.persistAuditLog(entry);
  }

  /**
   * Log SO creation
   */
  logSOCreated(soId: number, soNum: string, userId?: string): void {
    this.log({
      entity: 'SOHeader',
      entityId: soId,
      action: 'CREATE',
      userId,
      metadata: { soNum },
      timestamp: new Date(),
    });
  }

  /**
   * Log SO update
   */
  logSOUpdated(
    soId: number,
    soNum: string,
    changes: Record<string, any>,
    userId?: string
  ): void {
    this.log({
      entity: 'SOHeader',
      entityId: soId,
      action: 'UPDATE',
      userId,
      changes,
      metadata: { soNum },
      timestamp: new Date(),
    });
  }

  /**
   * Log SO status change
   */
  logSOStatusChanged(
    soId: number,
    soNum: string,
    oldStatus: string,
    newStatus: string,
    userId?: string
  ): void {
    this.log({
      entity: 'SOHeader',
      entityId: soId,
      action: 'STATUS_CHANGE',
      userId,
      changes: {
        oldStatus,
        newStatus,
      },
      metadata: { soNum },
      timestamp: new Date(),
    });
  }

  /**
   * Log SO deletion
   */
  logSODeleted(soId: number, soNum: string, userId?: string): void {
    this.log({
      entity: 'SOHeader',
      entityId: soId,
      action: 'DELETE',
      userId,
      metadata: { soNum },
      timestamp: new Date(),
    });
  }

  /**
   * Log SO lines update
   */
  logSOLinesUpdated(
    soId: number,
    soNum: string,
    linesAdded: number,
    linesUpdated: number,
    linesDeleted: number,
    userId?: string
  ): void {
    this.log({
      entity: 'SOHeader',
      entityId: soId,
      action: 'LINES_UPDATE',
      userId,
      changes: {
        linesAdded,
        linesUpdated,
        linesDeleted,
      },
      metadata: { soNum },
      timestamp: new Date(),
    });
  }

  /**
   * Format audit log message for output
   */
  private formatLogMessage(entry: AuditLogEntry): string {
    const parts = [
      `[${entry.action}]`,
      `${entry.entity}:${entry.entityId}`,
    ];

    if (entry.userId) {
      parts.push(`by User:${entry.userId}`);
    }

    if (entry.changes) {
      parts.push(`Changes: ${JSON.stringify(entry.changes)}`);
    }

    if (entry.metadata) {
      parts.push(`Metadata: ${JSON.stringify(entry.metadata)}`);
    }

    return parts.join(' | ');
  }

  /**
   * Persist audit log to database
   * TODO: Implement database persistence
   */
  private async persistAuditLog(entry: AuditLogEntry): Promise<void> {
    // Implementation:
    // - Create AuditLog table in Prisma
    // - Insert entry into database
    // - Consider async queue for better performance
  }
}
