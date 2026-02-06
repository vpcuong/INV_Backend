export class Uom {
  constructor(
    public readonly code: string,
    public name: string,
    public description?: string | null,
    public isActive: boolean = true,
  ) {}
}
