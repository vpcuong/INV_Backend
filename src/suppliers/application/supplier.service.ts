import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Supplier } from '../domain/supplier.entity';
import { ISupplierRepository } from '../domain/supplier.repository.interface';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { INJECTION_TOKENS } from '../constant/supplier.token';

@Injectable()
export class SupplierService {
  constructor(
    @Inject(INJECTION_TOKENS.SUPPLIER_REPOSITORY)
    private readonly supplierRepository: ISupplierRepository
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<any> {
    // Check if supplier code already exists
    const existingSupplier = await this.supplierRepository.findByCode(
      createSupplierDto.code
    );
    if (existingSupplier) {
      throw new ConflictException(
        `Supplier with code ${createSupplierDto.code} already exists`
      );
    }

    // Create supplier entity
    const supplier = new Supplier({
      code: createSupplierDto.code,
      name: createSupplierDto.name,
      phone: createSupplierDto.phone,
      email: createSupplierDto.email,
      website: createSupplierDto.website,
      address: createSupplierDto.address,
      city: createSupplierDto.city,
      province: createSupplierDto.province,
      country: createSupplierDto.country,
      postalCode: createSupplierDto.postalCode,
      taxId: createSupplierDto.taxId,
      contactPerson: createSupplierDto.contactPerson,
      paymentTerms: createSupplierDto.paymentTerms,
      status: createSupplierDto.status,
      category: createSupplierDto.category,
      isActive: createSupplierDto.isActive,
    });

    // Save supplier to database
    const savedSupplier = await this.supplierRepository.create(supplier);
    return savedSupplier.toPersistence();
  }

  async findAll(): Promise<any[]> {
    const suppliers = await this.supplierRepository.findAll();
    return suppliers.map((supplier) => supplier.toPersistence());
  }

  async findOne(id: number): Promise<any> {
    const supplier = await this.supplierRepository.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier.toPersistence();
  }

  async findByCode(code: string): Promise<any> {
    const supplier = await this.supplierRepository.findByCode(code);
    if (!supplier) {
      throw new NotFoundException(`Supplier with code ${code} not found`);
    }
    return supplier.toPersistence();
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<any> {
    // Check if supplier exists
    const existingSupplier = await this.supplierRepository.findOne(id);
    if (!existingSupplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // If code is being updated, check for conflicts
    if (
      updateSupplierDto.code &&
      updateSupplierDto.code !== existingSupplier.getCode()
    ) {
      const supplierWithCode = await this.supplierRepository.findByCode(
        updateSupplierDto.code
      );
      if (supplierWithCode) {
        throw new ConflictException(
          `Supplier with code ${updateSupplierDto.code} already exists`
        );
      }
    }

    // Create updated supplier entity
    const updatedSupplier = new Supplier({
      id: existingSupplier.getId(),
      code: updateSupplierDto.code ?? existingSupplier.getCode(),
      name: updateSupplierDto.name ?? existingSupplier.getName(),
      phone: updateSupplierDto.phone ?? existingSupplier.getPhone(),
      email: updateSupplierDto.email ?? existingSupplier.getEmail(),
      website: updateSupplierDto.website ?? existingSupplier.getWebsite(),
      address: updateSupplierDto.address ?? existingSupplier.getAddress(),
      city: updateSupplierDto.city ?? existingSupplier.getCity(),
      province: updateSupplierDto.province ?? existingSupplier.getProvince(),
      country: updateSupplierDto.country ?? existingSupplier.getCountry(),
      postalCode:
        updateSupplierDto.postalCode ?? existingSupplier.getPostalCode(),
      taxId: updateSupplierDto.taxId ?? existingSupplier.getTaxId(),
      contactPerson:
        updateSupplierDto.contactPerson ?? existingSupplier.getContactPerson(),
      paymentTerms:
        updateSupplierDto.paymentTerms ?? existingSupplier.getPaymentTerms(),
      status: updateSupplierDto.status ?? existingSupplier.getStatus(),
      category: updateSupplierDto.category ?? existingSupplier.getCategory(),
      isActive: updateSupplierDto.isActive ?? existingSupplier.getIsActive(),
      updatedAt: new Date(),
      createdAt: existingSupplier.getCreatedAt(),
      createdBy: existingSupplier.getCreatedBy(),
    });

    // Update supplier in database
    const savedSupplier = await this.supplierRepository.update(
      id,
      updatedSupplier
    );
    return savedSupplier.toPersistence();
  }

  async remove(id: number): Promise<any> {
    // Check if supplier exists
    const supplier = await this.supplierRepository.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    const deletedSupplier = await this.supplierRepository.remove(id);
    return deletedSupplier.toPersistence();
  }

  async activate(id: number): Promise<any> {
    // Check if supplier exists
    const supplier = await this.supplierRepository.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    const activatedSupplier = await this.supplierRepository.activate(id);
    return activatedSupplier.toPersistence();
  }

  async deactivate(id: number): Promise<any> {
    // Check if supplier exists
    const supplier = await this.supplierRepository.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    const deactivatedSupplier = await this.supplierRepository.deactivate(id);
    return deactivatedSupplier.toPersistence();
  }
}
