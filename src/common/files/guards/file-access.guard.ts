import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { FilesService } from '../files.service';

/**
 * File Access Guard
 *
 * Kiểm tra quyền truy cập file dựa trên:
 * - contextType (theme, product, user, etc.)
 * - contextId (ID của entity)
 * - User's role và ownership
 *
 * Business Rules:
 * - Admin: có thể truy cập tất cả files
 * - User: chỉ truy cập files của chính mình (dựa vào contextType)
 * - Public files (contextType = 'public'): mọi người đều truy cập được
 */
@Injectable()
export class FileAccessGuard implements CanActivate {
  constructor(private readonly filesService: FilesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // From JWT
    const filePath = request.params.filePath; // From URL params

    if (!user) {
      throw new ForbiddenException(
        'Authentication required to access this file'
      );
    }

    // Admin có quyền truy cập tất cả files
    if (user.role === 'admin') {
      return true;
    }

    // Extract contextType from file path (e.g., "theme/123-image.jpg" -> "theme")
    const pathParts = filePath.split('/');
    const contextType = pathParts[0];

    // Public files - ai cũng truy cập được
    if (contextType === 'public') {
      return true;
    }

    // Check file ownership based on contextType
    const hasAccess = await this.checkFileAccess(user, filePath, contextType);

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this file'
      );
    }

    return true;
  }

  /**
   * Kiểm tra quyền truy cập file dựa trên contextType
   */
  private async checkFileAccess(
    user: any,
    filePath: string,
    contextType: string
  ): Promise<boolean> {
    // Get file metadata from database
    const file = await this.filesService.getFileByPath(filePath);

    if (!file) {
      // File không tồn tại trong DB -> không cho phép truy cập
      return false;
    }

    const fileData = file.toPersistence();

    // Check based on contextType
    switch (contextType) {
      case 'theme':
        // Theme files: chỉ admin hoặc người tạo theme mới truy cập được
        // Cần kiểm tra xem user có quyền với theme này không
        return await this.checkThemeAccess(user, fileData.contextId);

      case 'user':
        // User files (avatar, documents): chỉ user đó mới truy cập được
        return fileData.contextId === user.id;

      case 'product':
        // Product files: tùy theo business logic
        return await this.checkProductAccess(user, fileData.contextId);

      default:
        // Mặc định: không cho phép
        return false;
    }
  }

  /**
   * Kiểm tra quyền truy cập theme files
   */
  private async checkThemeAccess(user: any, themeId: number): Promise<boolean> {
    // TODO: Implement logic kiểm tra user có quyền với theme này không
    // Ví dụ: kiểm tra theme.createdBy === user.id
    // Hoặc: kiểm tra user thuộc department/company của theme

    // Tạm thời: cho phép tất cả authenticated users
    return true;
  }

  /**
   * Kiểm tra quyền truy cập product files
   */
  private async checkProductAccess(
    user: any,
    productId: number
  ): Promise<boolean> {
    // TODO: Implement logic kiểm tra user có quyền với product này không

    // Tạm thời: cho phép tất cả authenticated users
    return true;
  }
}
