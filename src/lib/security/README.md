# Jobly Security Architecture

## Overview

This document describes the multi-layered security architecture for Jobly, ensuring:
- **Tenant Isolation**: No cross-tenant data access possible
- **Role-Based Access Control (RBAC)**: Granular permissions per role
- **Authorization**: Deny-by-default, explicit grants only
- **Audit Logging**: Complete trail of security-relevant actions

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Route / Server Action                │
├─────────────────────────────────────────────────────────────────┤
│                     Authorization Middleware                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Auth Check   │ │ Role Check   │ │ Permission Check         │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     Tenant Context Layer                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ TenantContext: Carries tenantId through entire request   │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     Prisma Security Layer                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Auto-inject  │ │ Query        │ │ Ownership                │ │
│  │ tenantId     │ │ Validation   │ │ Verification             │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     Database Layer                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PostgreSQL with Row-Level Constraints                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **Deny by Default**: All access is denied unless explicitly granted
2. **Defense in Depth**: Multiple layers of protection
3. **Least Privilege**: Users get minimum permissions needed
4. **Explicit Intent**: Super Admin cross-tenant access requires explicit flag
5. **Complete Audit Trail**: All security-relevant actions logged

## Files Structure

```
src/lib/security/
├── README.md                 # This file
├── types.ts                  # Security type definitions
├── permissions.ts            # Permission matrix and constants
├── tenant-context.ts         # Tenant context management
├── authorization.ts          # Main authorization logic
├── prisma-security.ts        # Prisma security helpers
├── middleware.ts             # API route middleware
├── audit.ts                  # Enhanced audit logging
└── __tests__/               # Security tests
    ├── tenant-isolation.test.ts
    ├── rbac.test.ts
    └── authorization.test.ts
```
