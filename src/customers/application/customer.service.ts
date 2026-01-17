import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Customer } from '../domain/customer.entity';
import { ICustomerRepository } from '../domain/customer.repository.interface';
import { CUSTOMER_REPOSITORY } from '../constant/customer.token';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { InvalidCustomerStatusException } from '../domain/exceptions/customer-domain.exception';

/**
 * Application Service - Orchestrates use cases
 * Contains application logic but delegates business logic to domain entities
 */
@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository
  ) {}

  /**
   * Use Case: Create new customer
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<any> {
    // Check for duplicate customer code
    const existing = await this.customerRepository.findByCode(
      createCustomerDto.customerCode
    );

    if (existing) {
      throw new ConflictException(
        `Customer with code ${createCustomerDto.customerCode} already exists`
      );
    }

    // Create domain entity with business rules
    const customer = new Customer({
      customerCode: createCustomerDto.customerCode,
      customerName: createCustomerDto.customerName,
      phone: createCustomerDto.phone,
      email: createCustomerDto.email,
      taxCode: createCustomerDto.taxCode,
      country: createCustomerDto.country,
      status: createCustomerDto.status,
      note: createCustomerDto.note,
      isActive: createCustomerDto.isActive ?? true,
      createdBy: createCustomerDto.createdBy,
      sortOrder: createCustomerDto.sortOrder ?? 0,
    });

    // Persist through repository
    const savedCustomer = await this.customerRepository.create(customer);

    return this.toDto(savedCustomer);
  }

  /**
   * Use Case: Get all customers
   */
  async findAll(): Promise<any[]> {
    const customers = await this.customerRepository.findAll();
    return customers.map((customer) => this.toDto(customer));
  }

  /**
   * Use Case: Get customer by ID
   */
  async findOne(id: number): Promise<any> {
    const customer = await this.customerRepository.findOne(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.toDto(customer);
  }

  /**
   * Use Case: Get customer by code
   */
  async findByCode(customerCode: string): Promise<any> {
    const customer = await this.customerRepository.findByCode(customerCode);

    if (!customer) {
      throw new NotFoundException(
        `Customer with code ${customerCode} not found`
      );
    }

    return this.toDto(customer);
  }

  /**
   * Use Case: Update customer
   */
  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<any> {
    const customer = await this.customerRepository.findOne(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check for duplicate customer code if changing it
    if (
      updateCustomerDto.customerCode &&
      updateCustomerDto.customerCode !== customer.getCustomerCode()
    ) {
      const existing = await this.customerRepository.findByCode(
        updateCustomerDto.customerCode
      );

      if (existing && existing.getId() !== id) {
        throw new ConflictException(
          `Customer with code ${updateCustomerDto.customerCode} already exists`
        );
      }
    }

    // Apply updates using domain entity methods
    customer.updateDetails({
      customerName: updateCustomerDto.customerName,
      phone: updateCustomerDto.phone,
      email: updateCustomerDto.email,
      taxCode: updateCustomerDto.taxCode,
      country: updateCustomerDto.country,
      note: updateCustomerDto.note,
      sortOrder: updateCustomerDto.sortOrder,
    });

    // Handle status changes through domain methods
    if (updateCustomerDto.status !== undefined) {
      if (updateCustomerDto.status === 'ACTIVE') {
        customer.activate();
      } else if (updateCustomerDto.status === 'INACTIVE') {
        customer.deactivate();
      } else if (updateCustomerDto.status === 'BLACKLIST') {
        customer.blacklist();
      }
    }

    const updated = await this.customerRepository.update(id, customer);
    return this.toDto(updated);
  }

  /**
   * Use Case: Delete customer
   */
  async remove(id: number): Promise<any> {
    const customer = await this.customerRepository.findOne(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const deleted = await this.customerRepository.remove(id);
    return this.toDto(deleted);
  }

  /**
   * Use Case: Activate customer
   */
  async activate(id: number): Promise<any> {
    const customer = await this.customerRepository.findOne(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    try {
      // Business logic in domain entity
      customer.activate();
      const updated = await this.customerRepository.update(id, customer);
      return this.toDto(updated);
    } catch (error) {
      if (error instanceof InvalidCustomerStatusException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  /**
   * Use Case: Deactivate customer
   */
  async deactivate(id: number): Promise<any> {
    const customer = await this.customerRepository.findOne(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    try {
      // Business logic in domain entity
      customer.deactivate();
      const updated = await this.customerRepository.update(id, customer);
      return this.toDto(updated);
    } catch (error) {
      if (error instanceof InvalidCustomerStatusException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  /**
   * Use Case: Blacklist customer
   */
  async blacklist(id: number): Promise<any> {
    const customer = await this.customerRepository.findOne(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Business logic in domain entity
    customer.blacklist();
    const updated = await this.customerRepository.update(id, customer);
    return this.toDto(updated);
  }

  /**
   * Convert domain entity to DTO for response
   */
  private toDto(customer: Customer): any {
    return {
      id: customer.getId(),
      customerCode: customer.getCustomerCode(),
      customerName: customer.getCustomerName(),
      phone: customer.getPhone(),
      email: customer.getEmail(),
      taxCode: customer.getTaxCode(),
      country: customer.getCountry(),
      status: customer.getStatus(),
      note: customer.getNote(),
      isActive: customer.getIsActive(),
      createdBy: customer.getCreatedBy(),
      sortOrder: customer.getSortOrder(),
      createdAt: customer.getCreatedAt(),
      updatedAt: customer.getUpdatedAt(),
    };
  }
}
