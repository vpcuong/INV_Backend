import { CustomerAddress } from './customer-address.entity';
import { AddressType } from '../enums/address-type.enum';

export interface ICustomerAddressRepository {
  /**
   * Create a new customer address
   */
  create(address: CustomerAddress): Promise<CustomerAddress>;

  /**
   * Find all customer addresses
   */
  findAll(): Promise<CustomerAddress[]>;

  /**
   * Find customer addresses by customer ID
   */
  findByCustomer(customerId: number): Promise<CustomerAddress[]>;

  /**
   * Find customer address by ID
   */
  findOne(id: number): Promise<CustomerAddress | null>;

  /**
   * Find default address for a customer by type
   */
  findDefaultByCustomerAndType(
    customerId: number,
    addressType: AddressType,
  ): Promise<CustomerAddress | null>;

  /**
   * Update customer address
   */
  update(id: number, address: CustomerAddress): Promise<CustomerAddress>;

  /**
   * Delete customer address
   */
  remove(id: number): Promise<CustomerAddress>;

  /**
   * Unset default addresses for customer by type (except given ID)
   */
  unsetDefaultsByCustomerAndType(
    customerId: number,
    addressType: AddressType,
    exceptId?: number,
  ): Promise<void>;
}