export class CreateUomDto {
  code: string;
  name: string;
  description?: string;
  toBaseFactor: number;
}
