┌─────────────────────────────────────────────┐
│         Presentation Layer (DTO)            │
│  - CreateSOHeaderDto (user input only)      │
│  - CreateSOLineDto (user input only)        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      Application Layer (Service)            │
│  - SOService (orchestrates use cases)       │
│  - Calls domain services                    │
│  - Calculates all fields from input         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Domain Layer                         │
│  Entities:                                   │
│    - SOHeader (business logic)               │
│    - SOLine (business logic)                 │
│  Value Objects:                              │
│    - SOPricing (calculation logic)           │
│    - SOStatus, SOAddresses, SOMetadata       │
│  Domain Services:                            │
│    - SONumberGeneratorService ✨             │
│    - ExchangeRateService ✨                  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│    Infrastructure Layer (Repository)        │
│  - SOHeaderRepository                        │
└──────────────────────────────────────────────┘
