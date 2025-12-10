export class CreateColorDto {
  code!: string;
  desc!: string;
  hexValue?: string;
  sortOrder?: number;
  createdBy?: string;
}
