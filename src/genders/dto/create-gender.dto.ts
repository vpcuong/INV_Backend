export class CreateGenderDto {
  code!: string;
  desc!: string;
  sortOrder?: number;
  createdBy?: string;
}
