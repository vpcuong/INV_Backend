import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Theme } from "../domain/theme.entity";
import { IThemeRepository } from "../domain/theme.repository.interface";
import { CreateThemeDto } from "../dto/create-theme.dto";
import { FilesService } from "../../common/files/files.service";
import { INJECTION_TOKENS } from "../constant/theme.token";

@Injectable()
export class ThemeService {
  constructor(
    @Inject(INJECTION_TOKENS.THEME_REPOSITORY) private readonly themeRepository: IThemeRepository,
    private readonly filesService: FilesService
  ) {}

  /**
   * save theme with optional image
   * @param createThemeDto
   * @param image
   * @returns
   */
  async save(createThemeDto: CreateThemeDto, image?: Express.Multer.File): Promise<any> {
    // Create theme entity
    const theme = new Theme({
      code: createThemeDto.code,
      desc: createThemeDto.desc,
      supplierId: createThemeDto.supplierId,
      colorCode: createThemeDto.colorCode,
      price: createThemeDto.price,
      uom: createThemeDto.uom
    });

    // Save theme to database
    const savedTheme = await this.themeRepository.save(theme);
    let themePersistence = savedTheme.toPersistence();

    // Upload image if provided
    let uploadedFile = null;
    if (image) {
      uploadedFile = await this.filesService.uploadFile(image, {
        contextType: 'theme',
        contextId: themePersistence.id,
        contextKey: themePersistence.code,
        category: 'image',
        isPrimary: true,
        alt: `${themePersistence.code}-${themePersistence.desc}`,
        title: `${themePersistence.code}-${themePersistence.desc}`,
      });

      // Update theme with image URL
      const updatedTheme = await this.themeRepository.update(themePersistence.id, {
        imgUrls: uploadedFile.toPersistence().path,
      });
      themePersistence = updatedTheme.toPersistence();
    }

    return {
      ...themePersistence,
      image: uploadedFile?.toPersistence() || null,
    };
  }

  async getAll(): Promise<Theme[]> {
    return this.themeRepository.getAll();
  }

  async findById(id: number): Promise<Theme> {
    const theme = await this.themeRepository.findById(id);
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }
    return theme.toPersistence();
  }

  /**
   * Update theme image
   * @param id
   * @param image
   * @returns
   */
  async updateImage(id: number, image: Express.Multer.File): Promise<any> {
    // Check if theme exists
    const theme = await this.themeRepository.findById(id);
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }

    const themePersistence = theme.toPersistence();

    // Delete old image files if exists
    if (themePersistence.imgUrls) {
      await this.filesService.deleteFilesByContext('theme', id);
    }

    // Upload new image
    const uploadedFile = await this.filesService.uploadFile(image, {
      contextType: 'theme',
      contextId: id,
      contextKey: themePersistence.code,
      category: 'image',
      isPrimary: true,
      alt: `${themePersistence.code}-${themePersistence.desc}`,
      title: `${themePersistence.code}-${themePersistence.desc}`,
    });

    // Update theme with new image URL
    const updatedTheme = await this.themeRepository.update(id, {
      imgUrls: uploadedFile.toPersistence().url,
    });

    return {
      ...updatedTheme.toPersistence(),
      image: uploadedFile.toPersistence(),
    };
  }

  async delete(id: number): Promise<void> {
    // Delete associated files first
    await this.filesService.deleteFilesByContext('theme', id);

    // Delete theme
    await this.themeRepository.delete(id);
  }
}