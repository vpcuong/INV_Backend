export class SOAddresses {
  private constructor(
    private readonly billingAddressId: number | null,
    private readonly shippingAddressId: number | null
  ) {
    this.validateAddresses();
  }

  private validateAddresses(): void {
    // Add any address validation logic here
    // For now, we'll accept null values as valid
  }

  public static create(data: {
    billingAddressId?: number | null;
    shippingAddressId?: number | null;
  }): SOAddresses {
    return new SOAddresses(
      data.billingAddressId || null,
      data.shippingAddressId || null
    );
  }

  // Business methods
  public updateBillingAddress(billingAddressId: number | null): SOAddresses {
    return new SOAddresses(billingAddressId, this.shippingAddressId);
  }

  public updateShippingAddress(shippingAddressId: number | null): SOAddresses {
    return new SOAddresses(this.billingAddressId, shippingAddressId);
  }

  public updateAddresses(
    billingAddressId: number | null,
    shippingAddressId: number | null
  ): SOAddresses {
    return new SOAddresses(billingAddressId, shippingAddressId);
  }

  // Getters
  public getBillingAddressId(): number | null {
    return this.billingAddressId;
  }

  public getShippingAddressId(): number | null {
    return this.shippingAddressId;
  }

  public hasBillingAddress(): boolean {
    return this.billingAddressId !== null;
  }

  public hasShippingAddress(): boolean {
    return this.shippingAddressId !== null;
  }

  // Persistence methods
  public toPersistence(): any {
    return {
      billingAddressId: this.billingAddressId,
      shippingAddressId: this.shippingAddressId,
    };
  }

  public static fromPersistence(data: any): SOAddresses {
    return new SOAddresses(
      data.billingAddressId || null,
      data.shippingAddressId || null
    );
  }
}
