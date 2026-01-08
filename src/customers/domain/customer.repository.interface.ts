import { Customer } from './customer.entity';

export interface ICustomerRepository {
  /**
   * Create a new customer
   */
  create(customer: Customer): Promise<Customer>;

  /**
   * Find all customers
   */
  findAll(): Promise<Customer[]>;

  /**
   * Find customer by ID
   */
  findOne(id: number): Promise<Customer | null>;

  /**
   * Find customer by customer code
   */
  findByCode(customerCode: string): Promise<Customer | null>;

  /**
   * Update customer
   */
  update(id: number, customer: Customer): Promise<Customer>;

  /**
   * Delete customer
   */
  remove(id: number): Promise<Customer>;

  /**
   * Activate customer
   */
  activate(id: number): Promise<Customer>;

  /**
   * Deactivate customer
   */
  deactivate(id: number): Promise<Customer>;

  /**
   * Blacklist customer
   */
  blacklist(id: number): Promise<Customer>;
}
