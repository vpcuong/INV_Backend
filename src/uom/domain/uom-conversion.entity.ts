export class UomConversion {
  constructor(
    public readonly uomCode: string,
    public toBaseFactor: number,
    public isActive: boolean = true,
  ) {}
}
