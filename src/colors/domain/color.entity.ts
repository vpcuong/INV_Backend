export interface ColorConstructorData{
  id: number
  code: string
  desc: string
  hexValue?: string
  sortOrder: number
  status: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
export class Color{
  private id: number
  private code: string
  private desc: string
  private hexValue: string
  private sortOrder: number
  private status: string
  private createdAt: Date
  private updatedAt: Date
  private createdBy: string

  constructor(data: ColorConstructorData) {
    this.id = data.id;
    this.code = data.code;
    this.desc = data.desc;
    this.hexValue = data.hexValue ?? '';
    this.sortOrder = data.sortOrder;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.createdBy = data.createdBy;
  }

  public toPersistence(): any {
    return {
      id: this.id,
      code: this.code,
      desc: this.desc,
      hexValue: this.hexValue,
      sortOrder: this.sortOrder,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
    };
  }

  public static fromPersistence(data: any): Color {
    return new Color({
      id: data.id,
      code: data.code,
      desc: data.desc,
      hexValue: data.hexValue,
      sortOrder: data.sortOrder,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy
    });
  }

  public getSearchText(): string {
    return `${this.code} - ${this.desc}`;
  }
}