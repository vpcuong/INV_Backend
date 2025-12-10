export class CreateItemRevisionDto {
  itemId!: number;
  revision!: string;
  name?: string;
  notes?: string;
  status?: string;
  effectiveAt?: Date;
}
