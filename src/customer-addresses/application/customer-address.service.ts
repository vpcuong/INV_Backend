import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CustomerAddress } from '../domain/customer-address.entity';
import { ICustomerAddressRepository } from '../domain/customer-address.repository.interface';
import { CUSTOMER_ADDRESS_REPOSITORY } from '../constant/customer-address.token';
import { CreateCustomerAddressDto } from '../dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from '../dto/update-customer-address.dto';
import { InvalidAddressException } from '../domain/exceptions/customer-address-domain.exception';

/**
 * Application Service - Orchestrates use cases
 * Contains application logic but delegates business logic to domain entities
 */
@Injectable()
export class CustomerAddressService {
  constructor(
    @Inject(CUSTOMER_ADDRESS_REPOSITORY)
    private readonly addressRepository: ICustomerAddressRepository,
  ) {}

  /**
   * Use Case: Create new customer address
   */
  async create(createDto: CreateCustomerAddressDto): Promise<any> {
    try {
      // Create domain entity with business rules
      const address = new CustomerAddress({
        customerId: createDto.customerId,
        addressType: createDto.addressType,
        addressLine: createDto.addressLine,
        ward: createDto.ward,
        district: createDto.district,
        city: createDto.city,
        province: createDto.province,
        country: createDto.country,
        postalCode: createDto.postalCode,
        isDefault: createDto.isDefault ?? false,
      });

      // Business Rule: Only one default address per type per customer
      if (address.getIsDefault()) {
        const existingDefault =
          await this.addressRepository.findDefaultByCustomerAndType(
            createDto.customerId,
            createDto.addressType,
          );

        if (existingDefault) {
          // Unset existing default
          await this.addressRepository.unsetDefaultsByCustomerAndType(
            createDto.customerId,
            createDto.addressType,
          );
        }
      }

      // Persist through repository
      const savedAddress = await this.addressRepository.create(address);

      return this.toDto(savedAddress);
    } catch (error) {
      if (error instanceof InvalidAddressException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * Use Case: Get all customer addresses
   */
  async findAll(): Promise<any[]> {
    const addresses = await this.addressRepository.findAll();
    return addresses.map((address) => this.toDto(address));
  }

  /**
   * Use Case: Get customer addresses by customer ID
   */
  async findByCustomer(customerId: number): Promise<any[]> {
    const addresses = await this.addressRepository.findByCustomer(customerId);
    return addresses.map((address) => this.toDto(address));
  }

  /**
   * Use Case: Get customer address by ID
   */
  async findOne(id: number): Promise<any> {
    const address = await this.addressRepository.findOne(id);

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return this.toDto(address);
  }

  /**
   * Use Case: Update customer address
   */
  async update(
    id: number,
    updateDto: UpdateCustomerAddressDto,
  ): Promise<any> {
    const address = await this.addressRepository.findOne(id);

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    try {
      // Apply updates using domain entity methods
      address.updateDetails({
        addressLine: updateDto.addressLine,
        ward: updateDto.ward,
        district: updateDto.district,
        city: updateDto.city,
        province: updateDto.province,
        country: updateDto.country,
        postalCode: updateDto.postalCode,
        addressType: updateDto.addressType,
      });

      // Handle isDefault change
      if (updateDto.isDefault !== undefined) {
        if (updateDto.isDefault) {
          // Business Rule: Only one default address per type per customer
          const addressType =
            updateDto.addressType ?? address.getAddressType();

          await this.addressRepository.unsetDefaultsByCustomerAndType(
            address.getCustomerId(),
            addressType,
            id, // Don't unset this address
          );

          address.setAsDefault();
        } else {
          address.unsetAsDefault();
        }
      }

      const updated = await this.addressRepository.update(id, address);
      return this.toDto(updated);
    } catch (error) {
      if (error instanceof InvalidAddressException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * Use Case: Delete customer address
   */
  async remove(id: number): Promise<any> {
    const address = await this.addressRepository.findOne(id);

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    const deleted = await this.addressRepository.remove(id);
    return this.toDto(deleted);
  }

  /**
   * Convert domain entity to DTO for response
   */
  private toDto(address: CustomerAddress): any {
    return {
      id: address.getId(),
      customerId: address.getCustomerId(),
      addressType: address.getAddressType(),
      addressLine: address.getAddressLine(),
      ward: address.getWard(),
      district: address.getDistrict(),
      city: address.getCity(),
      province: address.getProvince(),
      country: address.getCountry(),
      postalCode: address.getPostalCode(),
      isDefault: address.getIsDefault(),
      fullAddress: address.getFullAddress(),
      createdAt: address.getCreatedAt(),
      updatedAt: address.getUpdatedAt(),
    };
  }
}
