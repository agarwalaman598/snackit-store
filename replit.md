# Overview

This is a full-stack e-commerce application for a snack delivery service at KIIT (Kalinga Institute of Industrial Technology). The platform allows students to order snacks for delivery to their hostels, with features including product browsing, cart management, order tracking, and admin management capabilities. The application uses modern web technologies with a React frontend, Express backend, and PostgreSQL database.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing with simple route definitions
- **State Management**: 
  - Zustand with persistence for cart state management
  - TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Build System**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for robust API development
- **Session Management**: Express session with PostgreSQL store for persistent user sessions
- **Authentication**: 
  - Passport.js with Google OAuth 2.0 strategy
  - OpenID Connect client for modern OAuth flows
  - Restricted to @kiit.ac.in email domain for security
- **API Design**: RESTful endpoints with proper error handling and request validation
- **Database Layer**: Drizzle ORM for type-safe database operations and migrations

## Data Storage Architecture
- **Primary Database**: PostgreSQL with Neon serverless for scalable cloud hosting
- **Schema Design**: 
  - Normalized relational structure with proper foreign key constraints
  - Users, categories, products, orders, and order items tables
  - Session storage table for authentication persistence
- **Connection Management**: Connection pooling with @neondatabase/serverless for efficient resource usage

## Authentication & Authorization
- **Strategy**: OAuth 2.0 with Google as the identity provider
- **Domain Restriction**: Only @kiit.ac.in email addresses are permitted for registration
- **Session Security**: 
  - HTTP-only cookies for session tokens
  - Secure flag enabled in production
  - 7-day session expiration with automatic renewal
- **Role-Based Access**: Admin flag in user model for administrative privileges

## Component Organization
- **Shared Schema**: TypeScript types and Zod validation schemas shared between client and server
- **UI Components**: Modular component library with consistent design patterns
- **Custom Hooks**: React hooks for authentication, cart management, and data fetching
- **Utilities**: Helper functions for API requests, styling, and sound effects

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod resolvers
- **Backend Framework**: Express.js with TypeScript support via tsx
- **Database**: PostgreSQL via Neon serverless with Drizzle ORM

## Authentication Services
- **Google OAuth**: Google Identity Platform for user authentication
- **Passport.js**: Authentication middleware with Google OAuth 2.0 strategy
- **OpenID Connect**: Modern OAuth client library for secure authentication flows

## UI and Styling
- **Design System**: Radix UI primitives for accessible component foundations
- **Component Library**: shadcn/ui for pre-built, customizable UI components
- **Styling**: Tailwind CSS with PostCSS for utility-first styling approach
- **Icons**: Font Awesome for consistent iconography

## Development Tools
- **Build Tools**: Vite for development server and production builds
- **Code Quality**: TypeScript for static type checking across the entire stack
- **Database Tools**: Drizzle Kit for database migrations and schema management

## Data Management
- **Client State**: TanStack Query for server state caching and synchronization
- **Local State**: Zustand with persistence for cart and UI state management
- **Validation**: Zod for runtime type validation and schema enforcement

## Cloud Services
- **Database Hosting**: Neon for serverless PostgreSQL with automatic scaling
- **Session Storage**: PostgreSQL-backed session store for authentication persistence
- **Environment Variables**: Secure configuration management for API keys and database connections