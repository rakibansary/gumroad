# Gumroad Platform: Complete Architecture & Codebase Guide

> **Comprehensive guide to understanding and contributing to the Gumroad codebase**
>
> Last Updated: November 2025

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Directory Structure](#directory-structure)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Database Architecture](#database-architecture)
8. [Key Features & Modules](#key-features--modules)
9. [Service Layer](#service-layer)
10. [Background Jobs](#background-jobs)
11. [API & Integrations](#api--integrations)
12. [Authentication & Authorization](#authentication--authorization)
13. [Payment Processing](#payment-processing)
14. [Testing Strategy](#testing-strategy)
15. [Development Workflow](#development-workflow)
16. [Code Patterns & Conventions](#code-patterns--conventions)
17. [Performance & Scalability](#performance--scalability)
18. [Security Measures](#security-measures)
19. [Contributing Guidelines](#contributing-guidelines)

---

## Platform Overview

Gumroad is a sophisticated e-commerce platform built for creators to sell digital products directly to consumers. The application serves millions of creators globally, handling payments, digital delivery, subscriptions, analytics, and more.

### Core Value Proposition
- Enable creators to sell products with minimal setup
- Handle complex payment processing (Stripe, Braintree, PayPal)
- Support global commerce (80+ countries, 100+ currencies)
- Provide analytics and marketing automation
- Manage community features and engagement

### Scale & Complexity
- **293 ActiveRecord models** representing the domain
- **100+ background job types** for async processing
- **1,749 test files** ensuring quality
- **25+ service categories** encapsulating business logic
- **20+ major features** from checkout to analytics

---

## Technology Stack

### Backend Stack
- **Framework:** Ruby on Rails 7.1.3.4
- **Language:** Ruby 3.4.3
- **Web Server:** Puma 6.4.2
- **Databases:**
  - MySQL 8.0.x (primary relational database)
  - MongoDB 9.0 (via Mongoid gem)
  - Redis 5.0 (caching, sessions, queues)
  - Elasticsearch 7.11.2 (search & analytics)

### Frontend Stack
- **UI Library:** React 18.1.0
- **Language:** TypeScript 5.5
- **Bundler:** Shakapacker (Webpack 5 wrapper)
- **Routing:** React Router v6 + Inertia.js
- **Styling:** Tailwind CSS 4.1.14
- **Components:** Radix UI primitives

### Build & Deploy
- **Asset Compilation:** Webpack 5 with esbuild-loader
- **Containerization:** Docker with multi-stage builds
- **CI/CD:** GitHub Actions + Buildkite
- **Infrastructure:** AWS (S3, SQS, MediaConvert, etc.)

### Key Libraries & Services

**Ruby Gems:**
- `devise` - Authentication
- `pundit` - Authorization
- `sidekiq` - Background jobs
- `stripe`, `braintree` - Payment processing
- `elasticsearch-rails` - Full-text search
- `paper_trail` - Audit logging
- `friendly_id` - URL slugs

**NPM Packages:**
- `@stripe/react-stripe-js` - Payment UI
- `@tiptap/react` - Rich text editor
- `recharts` - Analytics charts
- `date-fns` - Date manipulation

---

## Architecture Overview

### Architectural Pattern: MVC + Service Layer

```
┌─────────────────────────────────────────────────────────────┐
│                        USER REQUEST                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     NGINX / LOAD BALANCER                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     RAILS CONTROLLERS                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Route handling                                     │  │
│  │  • Request/Response                                   │  │
│  │  • Authorization (Pundit policies)                   │  │
│  │  • Parameter validation                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Business logic encapsulation                      │  │
│  │  • Transaction management                            │  │
│  │  • Cross-model operations                            │  │
│  │  • External API calls                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         MODELS                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Data validation                                    │  │
│  │  • Associations                                       │  │
│  │  • Callbacks                                          │  │
│  │  • Scopes & queries                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA PERSISTENCE LAYER                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  MySQL   │  │ MongoDB  │  │  Redis   │  │Elasticsearch│ │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   ASYNCHRONOUS PROCESSING                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Sidekiq Background Jobs                 │  │
│  │  • Email delivery                                     │  │
│  │  • Payment processing                                 │  │
│  │  • File processing                                    │  │
│  │  • Analytics compilation                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

1. **MVC (Model-View-Controller)**
   - Controllers handle HTTP requests
   - Models represent domain entities
   - Views render HTML/JSON responses

2. **Service Objects**
   - Encapsulate complex business logic
   - Located in `app/services/`
   - Example: `ProcessChargeService`, `CreatePurchaseService`

3. **Presenter Pattern**
   - Decorate models for view rendering
   - Located in `app/presenters/`
   - Example: `ProductPresenter`, `PurchasePresenter`

4. **Policy Objects (Pundit)**
   - Authorization logic separation
   - Located in `app/policies/`
   - Example: `ProductPolicy`, `AdminPolicy`

5. **Observer Pattern**
   - React to model lifecycle events
   - Located in `app/observers/`
   - Example: `EmailDeliveryObserver`

6. **Module/Concern Pattern**
   - Shared behavior across models/controllers
   - Located in `app/models/concerns/`, `app/controllers/concerns/`

---

## Directory Structure

```
gumroad/
├── app/                          # Application code
│   ├── assets/                   # Static assets (images, fonts)
│   ├── business/                 # Business logic modules
│   │   ├── card_data_handling/
│   │   ├── payments/
│   │   └── sales_tax/
│   ├── channels/                 # ActionCable WebSocket channels
│   ├── controllers/              # HTTP request handlers
│   │   ├── admin/                # Admin dashboard
│   │   ├── api/                  # API endpoints (v2, mobile)
│   │   ├── checkout/             # Checkout flow
│   │   ├── products/             # Product management
│   │   ├── settings/             # User settings
│   │   └── ...                   # 20+ more categories
│   ├── helpers/                  # View helpers
│   ├── javascript/               # Frontend React/TypeScript
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # JavaScript utilities
│   │   ├── packs/                # Webpack entry points
│   │   └── stylesheets/          # CSS/SCSS/Tailwind
│   ├── jobs/                     # ActiveJob definitions
│   ├── mailers/                  # Email senders
│   ├── models/                   # ActiveRecord models (293 files)
│   │   ├── concerns/             # Shared model behavior
│   │   └── ...                   # Domain models
│   ├── modules/                  # Reusable modules (legacy)
│   ├── observers/                # ActiveRecord observers
│   ├── policies/                 # Pundit authorization
│   ├── presenters/               # View decorators
│   ├── services/                 # Business logic services
│   │   ├── charge/               # Payment processing
│   │   ├── purchase/             # Order fulfillment
│   │   ├── subscription/         # Recurring billing
│   │   ├── exports/              # Data exports
│   │   └── ...                   # 20+ more categories
│   ├── sidekiq/                  # Sidekiq workers (100+ files)
│   ├── validators/               # Custom validators
│   └── views/                    # Rails view templates
├── bin/                          # Executables (rails, dev, etc.)
├── config/                       # Configuration
│   ├── environments/             # Environment configs
│   ├── initializers/             # 94 initializer files
│   ├── routes/                   # Modular route definitions
│   ├── webpack/                  # Webpack config
│   ├── database.yml              # Database config
│   └── routes.rb                 # Main routes file
├── db/                           # Database files
│   ├── migrate/                  # Migration files (1,749)
│   ├── schema.rb                 # Current schema
│   └── seeds/                    # Seed data
├── docker/                       # Docker configuration
│   ├── base/, web/, nginx/       # Container definitions
│   └── docker-compose-*.yml      # Compose files
├── docs/                         # Documentation
│   ├── accounting.md
│   ├── taxes.md
│   ├── testing.md
│   └── ...                       # 20+ doc files
├── lib/                          # Custom libraries
│   ├── tasks/                    # Rake tasks
│   ├── utilities/                # Utility functions
│   └── errors/                   # Custom exceptions
├── public/                       # Static public files
├── spec/                         # RSpec tests (1,749 files)
│   ├── factories/                # FactoryBot factories
│   ├── models/                   # Model specs
│   ├── controllers/              # Controller specs
│   ├── services/                 # Service specs
│   ├── requests/                 # Integration specs
│   └── ...                       # Complete test coverage
├── Gemfile                       # Ruby dependencies
├── package.json                  # Node dependencies
├── Makefile                      # Build commands
└── README.md                     # Setup instructions
```

---

## Frontend Architecture

### Tech Stack
- **React 18.1.0** with functional components & hooks
- **TypeScript 5.5** for type safety
- **Inertia.js** for server-side routing with SPA feel
- **Tailwind CSS 4.1** for utility-first styling
- **Radix UI** for accessible component primitives

### Component Organization

```
app/javascript/
├── components/                   # Reusable components
│   ├── Admin/                    # Admin dashboard UI
│   ├── Analytics/                # Charts & metrics
│   ├── Checkout/                 # Payment flow
│   ├── Product/                  # Product display
│   ├── ProductEdit/              # Product editing
│   ├── Payouts/                  # Payout management
│   ├── Collaborators/            # Team features
│   ├── ui/                       # Design system components
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   └── ...
├── pages/                        # Full page components
│   ├── Admin/
│   ├── Analytics/
│   ├── Checkout/
│   ├── Dashboard/
│   └── Products/
├── layouts/                      # Layout wrappers
├── hooks/                        # Custom React hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── ...
├── utils/                        # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── api.ts
├── data/                         # Data utilities & types
└── packs/                        # Webpack entry points
    ├── application.tsx           # Main entry
    ├── admin.tsx                 # Admin SPA
    └── ...
```

### State Management
- **Inertia.js** manages page state and transitions
- **React Context** for global state (theme, user)
- **React hooks** (`useState`, `useEffect`) for local state
- **Form state** managed with controlled components

### Key Libraries

**UI Components:**
- `@radix-ui/react-*` - Accessible primitives
- `recharts` - Analytics charts
- `react-select` - Enhanced select inputs
- `react-day-picker` - Date selection

**Rich Text:**
- `@tiptap/react` - WYSIWYG editor
- `lowlight` - Code syntax highlighting

**Payment:**
- `@stripe/react-stripe-js` - Stripe Elements
- `@paypal/paypal-js` - PayPal integration
- `braintree-web` - Braintree SDK

**Utilities:**
- `date-fns` - Date manipulation
- `lodash` - Utility functions
- `immer` - Immutable state updates
- `dompurify` - XSS protection

### Build Configuration

**Webpack 5 (via Shakapacker):**
- **Entry Points:** Multiple packs in `app/javascript/packs/`
- **Loaders:**
  - `esbuild-loader` for TypeScript/JavaScript
  - `sass-loader` for SCSS
  - `postcss-loader` for Tailwind CSS
- **Plugins:**
  - `mini-css-extract-plugin` - CSS extraction
  - `compression-webpack-plugin` - Gzip compression
  - `fork-ts-checker-webpack-plugin` - TypeScript checking

**Development:**
```bash
npm run watch    # Watch mode with hot reload
npm run build    # Production build
npm run analyze  # Bundle size analysis
```

---

## Backend Architecture

### Controllers

Controllers handle HTTP requests and coordinate with services/models.

**Structure:**
```
app/controllers/
├── application_controller.rb     # Base controller
├── concerns/                      # Shared controller logic
│   ├── require_login.rb
│   ├── require_admin.rb
│   └── set_current_user.rb
├── admin/                         # Admin controllers
├── api/                           # API endpoints
│   ├── v2/                        # API version 2
│   └── mobile/                    # Mobile-specific
├── checkout/                      # Checkout flow
├── products/                      # Product CRUD
├── purchases/                     # Order management
└── ...                            # 20+ more categories
```

**Example Controller:**
```ruby
# app/controllers/products_controller.rb
class ProductsController < ApplicationController
  before_action :require_login
  before_action :set_product, only: [:show, :edit, :update]

  def index
    authorize :product, :index?
    @products = current_user.products.page(params[:page])
  end

  def create
    authorize :product, :create?
    result = CreateProductService.call(
      user: current_user,
      params: product_params
    )

    if result.success?
      redirect_to product_path(result.product)
    else
      render :new, status: :unprocessable_entity
    end
  end
end
```

### Models (293 Total)

**Core Domain Models:**

| Model | Lines | Purpose |
|-------|-------|---------|
| `User` | 1,215 | Sellers, buyers, authentication |
| `Link` | 1,380 | Products (legacy name) |
| `Purchase` | 3,857 | Orders and transactions |
| `Payment` | 326 | Payment information |
| `Subscription` | ~500 | Recurring billing |
| `Balance` | ~400 | Account balances |

**Model Categories:**
- **Users:** `User`, `Creator`, `Seller`, `Buyer`
- **Products:** `Link` (product), `Bundle`, `Variant`
- **Orders:** `Purchase`, `Payment`, `Refund`
- **Subscriptions:** `Subscription`, `SubscriptionPlan`
- **Payouts:** `Balance`, `BankAccount` (80+ country types)
- **Content:** `Post`, `Comment`, `Community`
- **Marketing:** `Affiliate`, `Follower`, `Wishlist`
- **Tax:** `PurchaseTaxjarInfo`, `BacktaxAgreement`
- **Admin:** `AdminUser`, `AuditLog`

**Model Conventions:**
```ruby
class Product < ApplicationRecord
  # Use 'product' in new code, not 'link'
  self.table_name = 'links'

  # Associations
  belongs_to :creator, class_name: 'User'
  has_many :purchases
  has_many :variants

  # Validations
  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :published, -> { where(published: true) }
  scope :by_newest, -> { order(created_at: :desc) }

  # Methods
  def price
    Money.new(price_cents, currency)
  end
end
```

### Concerns (Shared Behavior)

```
app/models/concerns/
├── product/
│   ├── publishable.rb
│   ├── priceable.rb
│   └── slug_generator.rb
├── user/
│   ├── authenticatable.rb
│   └── two_factor_auth.rb
└── ...
```

**Example Concern:**
```ruby
# app/models/concerns/product/publishable.rb
module Product::Publishable
  extend ActiveSupport::Concern

  included do
    scope :published, -> { where(published: true) }
    scope :unpublished, -> { where(published: false) }
  end

  def publish!
    update!(published: true, published_at: Time.current)
  end
end
```

---

## Database Architecture

### Primary Database: MySQL 8.0

**Schema Overview:**
- **250+ tables** defined in `db/schema.rb`
- **1,749 migrations** tracked since inception
- **Indexes** on all foreign keys and frequently queried columns
- **Polymorphic associations** for flexible relationships

**Key Tables:**

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | `email`, `encrypted_password`, `role` |
| `links` | Products | `name`, `price_cents`, `creator_id` |
| `purchases` | Orders | `buyer_id`, `link_id`, `amount_cents` |
| `payments` | Payment info | `purchase_id`, `stripe_charge_id` |
| `balances` | Account balances | `user_id`, `amount_cents` |
| `subscriptions` | Recurring plans | `buyer_id`, `link_id`, `status` |
| `bank_accounts` | Payout methods | `user_id`, `type` (polymorphic) |

**Indexing Strategy:**
```sql
-- Foreign key indexes
CREATE INDEX index_purchases_on_buyer_id ON purchases(buyer_id);
CREATE INDEX index_purchases_on_link_id ON purchases(link_id);

-- Composite indexes for common queries
CREATE INDEX index_purchases_on_buyer_and_created ON purchases(buyer_id, created_at);

-- Partial indexes for filtered queries
CREATE INDEX index_users_sellers ON users(id) WHERE role = 'seller';
```

### Secondary Databases

**MongoDB (via Mongoid):**
- Used for flexible schema documents
- Analytics aggregations
- Logging and event tracking

**Redis:**
- Session storage
- Cache backend
- Sidekiq queue storage
- Rate limiting (Rack::Attack)
- Feature flags (Flipper)

**Elasticsearch 7.11.2:**
- Product search with full-text indexing
- Creator discovery
- Analytics search
- Auto-complete suggestions

**Reindexing Elasticsearch:**
```ruby
# In rails console
DevTools.delete_all_indices_and_reindex_all
```

### Database Optimization

**Connection Pooling:**
```yaml
# config/database.yml
production:
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000
```

**Query Optimization:**
- Use `includes` to avoid N+1 queries
- Use `pluck` for selecting specific columns
- Use `find_each` for batch processing
- Use database-level calculations (`count`, `sum`)

**Example:**
```ruby
# Bad - N+1 queries
products.each { |p| p.creator.name }

# Good - eager loading
products.includes(:creator).each { |p| p.creator.name }
```

---

## Key Features & Modules

### 1. Product Management
**Location:** `app/controllers/products/`, `app/services/product/`

- Create, edit, delete digital products
- Product variants (sizes, colors, versions)
- Product bundles
- Pricing and discounts
- Offer codes and coupons
- Custom fields and metadata
- Product analytics

**Key Services:**
- `CreateProductService`
- `UpdateProductService`
- `PublishProductService`
- `DeleteProductService`

### 2. Checkout & Payments
**Location:** `app/controllers/checkout/`, `app/services/charge/`

- Multi-step checkout flow
- Payment method selection (Stripe, Braintree, PayPal)
- Apple Pay / Google Pay
- Subscription checkout
- License key generation
- Gift purchases
- Tax calculation integration

**Key Services:**
- `ProcessChargeService`
- `CreatePurchaseService`
- `RefundService`
- `DeliverPurchaseFilesService`

### 3. Subscriptions
**Location:** `app/models/subscription.rb`, `app/services/subscription/`

- Recurring billing management
- Multiple billing intervals (weekly, monthly, yearly)
- Subscription upgrades/downgrades
- Cancellation handling
- Failed payment retry logic
- Subscription analytics

**Key Services:**
- `CreateSubscriptionService`
- `RenewSubscriptionService`
- `CancelSubscriptionService`
- `UpdateSubscriptionService`

### 4. Payouts
**Location:** `app/services/payout/`, `app/models/balance.rb`

- Balance tracking
- Multi-currency support
- Bank account management (80+ country types)
- Payout scheduling
- Real-time payouts
- Payout reports
- Tax documentation (1099)

**Key Models:**
- `Balance`
- `BalanceTransaction`
- `BankAccount` (polymorphic)
- `AustralianBankAccount`, `CanadianBankAccount`, etc.

### 5. Email & Workflows
**Location:** `app/mailers/`, `app/services/workflow/`

- Transactional emails (receipts, notifications)
- Marketing campaigns
- Automated workflows
- Email templates (20+ mailers)
- Abandoned cart recovery
- Email delivery tracking

**Key Mailers:**
- `CreatorMailer`
- `CustomerMailer`
- `AffiliateMailer`
- `AdminMailer`

### 6. Analytics
**Location:** `app/services/creator_analytics/`, `app/javascript/components/Analytics/`

- Sales metrics and charts
- Customer analytics
- Traffic source tracking
- Revenue reporting
- Email campaign metrics
- Conversion funnels

**Technologies:**
- Recharts for visualization
- Elasticsearch for aggregations
- Background jobs for computation

### 7. Community Features
**Location:** `app/models/community.rb`, `app/models/post.rb`

- Creator posts and updates
- Follower system
- Community chat rooms
- Comments and discussions
- Push notifications
- Community analytics

### 8. Affiliate Program
**Location:** `app/models/affiliate.rb`, `app/controllers/affiliate_requests/`

- Affiliate link generation
- Commission tracking
- Affiliate approval workflow
- Payout calculations
- Affiliate reports

### 9. Admin Dashboard
**Location:** `app/controllers/admin/`, `app/javascript/pages/Admin/`

- User management
- Sales monitoring
- Dispute resolution
- Content moderation
- System metrics
- Audit logs

### 10. API (v2)
**Location:** `app/controllers/api/v2/`

- RESTful endpoints
- OAuth authentication
- Resource CRUD (products, sales, licenses)
- Webhooks
- Rate limiting

**Example API Endpoints:**
```
GET    /api/v2/products
POST   /api/v2/products
GET    /api/v2/sales
GET    /api/v2/licenses/:id
```

---

## Service Layer

Services encapsulate complex business logic and coordinate between models.

### Service Organization

```
app/services/
├── charge/                        # Payment processing
│   ├── process_charge_service.rb
│   ├── refund_service.rb
│   └── validate_charge_service.rb
├── purchase/                      # Order fulfillment
│   ├── create_purchase_service.rb
│   ├── deliver_purchase_files_service.rb
│   └── cancel_purchase_service.rb
├── subscription/                  # Recurring billing
│   ├── create_subscription_service.rb
│   ├── renew_subscription_service.rb
│   └── cancel_subscription_service.rb
├── product/                       # Product management
├── payout/                        # Balance & payouts
├── exports/                       # Data exports
├── integrations/                  # Third-party integrations
├── workflow/                      # Email workflows
├── ai/                            # AI/ML features
└── ...                            # 20+ more categories
```

### Service Pattern

**Base Service:**
```ruby
# app/services/application_service.rb
class ApplicationService
  def self.call(*args, **kwargs, &block)
    new(*args, **kwargs, &block).call
  end
end
```

**Example Service:**
```ruby
# app/services/purchase/create_purchase_service.rb
module Purchase
  class CreatePurchaseService < ApplicationService
    attr_reader :buyer, :product, :payment_method

    def initialize(buyer:, product:, payment_method:)
      @buyer = buyer
      @product = product
      @payment_method = payment_method
    end

    def call
      ActiveRecord::Base.transaction do
        purchase = create_purchase
        process_payment(purchase)
        deliver_files(purchase)
        send_notifications(purchase)

        Result.success(purchase)
      end
    rescue => e
      Result.failure(e.message)
    end

    private

    def create_purchase
      Purchase.create!(
        buyer: buyer,
        link: product,
        amount_cents: product.price_cents
      )
    end

    def process_payment(purchase)
      ProcessChargeService.call(
        purchase: purchase,
        payment_method: payment_method
      )
    end

    def deliver_files(purchase)
      DeliverPurchaseFilesService.call(purchase: purchase)
    end

    def send_notifications(purchase)
      CustomerMailer.purchase_receipt(purchase).deliver_later
      CreatorMailer.new_sale(purchase).deliver_later
    end
  end
end
```

### Service Benefits
- **Single Responsibility:** Each service has one job
- **Testability:** Easy to unit test in isolation
- **Reusability:** Services can be composed
- **Transaction Management:** Handle complex multi-step operations
- **Error Handling:** Centralized error logic

---

## Background Jobs

Gumroad uses **Sidekiq** for background job processing with 100+ worker types.

### Job Organization

```
app/sidekiq/
├── email/                         # Email delivery jobs
├── payments/                      # Payment processing
├── payouts/                       # Payout scheduling
├── analytics/                     # Analytics compilation
├── exports/                       # CSV/Excel generation
├── files/                         # File processing
├── subscriptions/                 # Subscription renewals
└── ...                            # 8+ more categories
```

### Queue Priorities

Sidekiq queues in order of priority:
1. **critical** - Receipts, purchase emails (highest priority)
2. **default** - Most background jobs
3. **low** - Non-urgent tasks (cleanup, analytics)
4. **mongo** - One-time scripts, bulk operations

### Example Background Job

```ruby
# app/sidekiq/subscriptions/renew_subscription_job.rb
module Subscriptions
  class RenewSubscriptionJob
    include Sidekiq::Job

    sidekiq_options queue: :default, retry: 3

    def perform(subscription_id)
      subscription = Subscription.find(subscription_id)

      result = Subscription::RenewSubscriptionService.call(
        subscription: subscription
      )

      if result.success?
        logger.info "Renewed subscription #{subscription_id}"
      else
        logger.error "Failed to renew subscription #{subscription_id}: #{result.error}"
        raise result.error # Will trigger retry
      end
    end
  end
end
```

### Scheduled Jobs (Cron)

Sidekiq-cron handles recurring tasks:
```ruby
# config/initializers/sidekiq.rb
Sidekiq::Cron::Job.create(
  name: 'Renew subscriptions',
  cron: '0 */6 * * *', # Every 6 hours
  class: 'Subscriptions::RenewDueSubscriptionsJob'
)
```

### Job Deduplication

Use `sidekiq-unique-jobs` to prevent duplicate job execution:
```ruby
class ProcessPayoutJob
  include Sidekiq::Job

  sidekiq_options lock: :until_executed,
                  on_conflict: :log
end
```

### Common Job Types
- Email delivery
- Payment processing
- File cleanup
- Analytics compilation
- Custom domain SSL renewal
- Subscription renewal
- Tax report generation
- Elasticsearch reindexing

---

## API & Integrations

### RESTful API (v2)

**Base URL:** `/api/v2`

**Authentication:** OAuth 2.0 via Doorkeeper

**Resources:**
- Products (`/api/v2/products`)
- Sales (`/api/v2/sales`)
- Licenses (`/api/v2/licenses`)
- Payouts (`/api/v2/payouts`)

**Example Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
     https://api.gumroad.com/api/v2/products
```

### Third-Party Integrations

**Payment Processors:**
- Stripe (primary)
- Braintree
- PayPal

**Email Services:**
- SendGrid
- Resend

**Storage:**
- AWS S3
- Dropbox

**Tax Calculation:**
- TaxJar

**Shipping:**
- EasyPost

**Communication:**
- Slack
- Discord
- Twilio

**Analytics:**
- Google Analytics
- Segment

**AI/ML:**
- OpenAI (GPT)

**Social:**
- Facebook Graph API
- Twitter API
- Google Calendar

### Webhook Support

Gumroad sends webhooks for events like:
- New sale
- Refund issued
- Subscription cancelled
- Dispute opened

---

## Authentication & Authorization

### Authentication (Devise)

**Features:**
- Email/password authentication
- Two-factor authentication (TOTP)
- Social login (Facebook, Google, Twitter, Apple)
- Password reset
- Account confirmation
- Session management

**User Model:**
```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :two_factor_authenticatable

  has_many :products, foreign_key: :creator_id
  has_many :purchases, foreign_key: :buyer_id
end
```

### Authorization (Pundit)

**Policy Structure:**
```ruby
# app/policies/product_policy.rb
class ProductPolicy < ApplicationPolicy
  def index?
    true # Anyone can view products
  end

  def create?
    user.seller?
  end

  def update?
    user.admin? || record.creator == user
  end

  def destroy?
    user.admin? || record.creator == user
  end
end
```

**Controller Usage:**
```ruby
class ProductsController < ApplicationController
  def update
    @product = Product.find(params[:id])
    authorize @product # Calls ProductPolicy#update?

    @product.update!(product_params)
  end
end
```

### OAuth Provider (Doorkeeper)

Gumroad acts as an OAuth provider for third-party integrations:
```ruby
# config/initializers/doorkeeper.rb
Doorkeeper.configure do
  resource_owner_authenticator do
    User.find_by(id: session[:user_id]) || redirect_to(login_url)
  end

  grant_flows %w[authorization_code client_credentials]
end
```

---

## Payment Processing

### Stripe (Primary)

**Features:**
- Credit card processing
- Apple Pay / Google Pay
- Strong Customer Authentication (SCA)
- Webhook handling
- Dispute management

**Implementation:**
```ruby
# app/services/charge/stripe_charge_service.rb
module Charge
  class StripeChargeService
    def call(purchase:, payment_method:)
      charge = Stripe::Charge.create(
        amount: purchase.amount_cents,
        currency: purchase.currency,
        source: payment_method.stripe_token,
        description: "Purchase ##{purchase.id}"
      )

      purchase.update!(stripe_charge_id: charge.id)
      charge
    rescue Stripe::CardError => e
      raise PaymentFailedError, e.message
    end
  end
end
```

### Braintree

- Alternative payment processor
- PayPal integration
- Venmo support

### PayPal

- Direct PayPal integration
- Classic API for payouts
- IPN (Instant Payment Notification) handling

### Tax Calculation (TaxJar)

Automatic sales tax calculation:
```ruby
# app/services/sales_tax/calculate_tax_service.rb
tax_info = TaxJar.tax_for_order(
  amount: purchase.amount,
  shipping: purchase.shipping_amount,
  to_country: buyer.country,
  to_zip: buyer.zip
)
```

---

## Testing Strategy

### Test Framework: RSpec

**Test Organization:**
```
spec/
├── factories/                     # FactoryBot factories
├── models/                        # Model unit tests
├── controllers/                   # Controller tests
├── services/                      # Service tests
├── requests/                      # Integration/E2E tests
├── jobs/                          # Background job tests
├── mailers/                       # Email tests
├── policies/                      # Authorization tests
└── support/                       # Test helpers
```

### Testing Stack
- **RSpec 3.12** - Test framework
- **FactoryBot 6.4** - Test data factories
- **Capybara 3.38** - Integration testing
- **Faker 3.1** - Fake data generation
- **WebMock 3.18** - HTTP mocking
- **VCR 6.1** - HTTP recording
- **Shoulda Matchers 6.0** - Rails matchers

### Test Examples

**Model Test:**
```ruby
# spec/models/product_spec.rb
RSpec.describe Product do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_numericality_of(:price_cents) }
  end

  describe '#price' do
    it 'returns Money object' do
      product = create(:product, price_cents: 1000, currency: 'USD')
      expect(product.price).to eq(Money.new(1000, 'USD'))
    end
  end
end
```

**Service Test:**
```ruby
# spec/services/purchase/create_purchase_service_spec.rb
RSpec.describe Purchase::CreatePurchaseService do
  describe '#call' do
    it 'creates purchase and processes payment' do
      buyer = create(:user)
      product = create(:product, price_cents: 1000)
      payment_method = create(:payment_method)

      result = described_class.call(
        buyer: buyer,
        product: product,
        payment_method: payment_method
      )

      expect(result).to be_success
      expect(result.purchase).to be_persisted
      expect(result.purchase.amount_cents).to eq(1000)
    end
  end
end
```

**Integration Test:**
```ruby
# spec/requests/product_purchase_spec.rb
RSpec.describe 'Product Purchase', type: :request do
  it 'allows user to purchase product' do
    product = create(:product, price_cents: 1000)

    visit product_path(product)
    click_on 'Buy Now'

    fill_in 'Email', with: 'buyer@example.com'
    fill_in 'Card number', with: '4242 4242 4242 4242'

    click_on 'Pay $10.00'

    expect(page).to have_content('Purchase successful')
    expect(Purchase.last.amount_cents).to eq(1000)
  end
end
```

### Running Tests

```bash
# All tests
bin/rspec

# Specific file
bin/rspec spec/models/product_spec.rb

# Specific test
bin/rspec spec/models/product_spec.rb:15

# With coverage
COVERAGE=true bin/rspec
```

### Test Database Setup

```bash
RAILS_ENV=test bin/rails db:setup
```

### Test Guidelines

1. **Don't use "should" in test names**
   ```ruby
   # Bad
   it 'should create product'

   # Good
   it 'creates product'
   ```

2. **Use factories, not fixtures**
   ```ruby
   # Bad
   user = User.create!(email: 'test@example.com')

   # Good
   user = create(:user)
   ```

3. **Keep tests independent**
4. **Test behavior, not implementation**
5. **Use descriptive test names**
6. **Group related tests with `context`**

---

## Development Workflow

### Initial Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/antiwork/gumroad.git
   cd gumroad
   ```

2. **Install dependencies**
   ```bash
   bundle install
   npm install
   ```

3. **Start services**
   ```bash
   make local  # Starts Docker services
   ```

4. **Setup database**
   ```bash
   bin/rails db:prepare
   ```

5. **Start dev server**
   ```bash
   bin/dev  # Starts Rails + Webpack + Sidekiq
   ```

6. **Access application**
   ```
   https://gumroad.dev
   ```

### Daily Development

**Rails Console:**
```bash
bin/rails console
```

**Run Migrations:**
```bash
bin/rails db:migrate
```

**Run Tests:**
```bash
bin/rspec
```

**Linting:**
```bash
bundle exec rubocop          # Ruby linting
npm run lint-fast            # JavaScript linting
```

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat(products): Add variant support"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

4. **Request review from maintainers**

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
type(scope): title

description
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code improvement
- `chore` - Maintenance

---

## Code Patterns & Conventions

### Ruby Conventions

1. **Use `product` instead of `link` in new code**
   ```ruby
   # Bad
   @link = Link.find(params[:id])

   # Good
   @product = Link.find(params[:id])
   ```

2. **Use `buyer` and `seller` instead of `customer` and `creator`**
   ```ruby
   # Bad
   @customer = User.find(params[:id])

   # Good
   @buyer = User.find(params[:id])
   ```

3. **Avoid `unless`**
   ```ruby
   # Bad
   unless user.admin?

   # Good
   if !user.admin?
   ```

4. **Use Nano IDs for public IDs**
   ```ruby
   class Product < ApplicationRecord
     has_nano_id
   end
   ```

5. **Don't create methods ending in `_path` or `_url`**
   (Conflicts with Rails route helpers)

6. **Prefer reusing deprecated flags**
   Instead of creating new boolean columns

### JavaScript/TypeScript Conventions

1. **Import specific Lodash functions**
   ```typescript
   // Bad
   import { debounce } from 'lodash'

   // Good
   import debounce from 'lodash/debounce'
   ```

2. **Use `request` instead of `$.ajax`**
   ```typescript
   // Bad
   $.ajax({ url: '/api/products' })

   // Good
   request('/api/products')
   ```

3. **Use TypeScript for new files**
4. **Follow React hooks patterns**
5. **Use functional components**

### Sidekiq Best Practices

1. **Job names end with "Job"**
   ```ruby
   class ProcessBacklogJob
     include Sidekiq::Job
   end
   ```

2. **Choose appropriate queue**
   - `critical` - Purchase emails only
   - `default` - Most jobs
   - `low` - Non-urgent tasks

3. **Use `lock: :until_executed` for deduplication**
   ```ruby
   sidekiq_options lock: :until_executed
   ```

4. **Avoid `on_conflict: :replace`** (slow)

### Service Best Practices

1. **Single responsibility per service**
2. **Return result objects**
3. **Use transactions for multi-step operations**
4. **Handle errors explicitly**
5. **Keep services testable**

---

## Performance & Scalability

### Caching Strategy

**Redis Caching:**
```ruby
Rails.cache.fetch("product_#{id}", expires_in: 1.hour) do
  Product.find(id)
end
```

**Fragment Caching:**
```erb
<% cache product do %>
  <%= render product %>
<% end %>
```

### Database Optimization

**Avoid N+1 Queries:**
```ruby
# Bad
products.each { |p| p.creator.name }

# Good
products.includes(:creator).each { |p| p.creator.name }
```

**Use Batch Processing:**
```ruby
# Bad
Product.all.each { |p| p.update!(published: true) }

# Good
Product.find_each { |p| p.update!(published: true) }
```

**Database Indexes:**
- Add indexes to foreign keys
- Add composite indexes for common queries
- Use partial indexes for filtered queries

### Background Processing

- Use Sidekiq for time-consuming tasks
- Set appropriate queue priorities
- Monitor queue depths
- Use job deduplication

### CDN & Asset Optimization

- Use Cloudflare for CDN
- Compress assets with Webpack
- Lazy load images
- Minify CSS/JS in production

---

## Security Measures

### Input Validation

**Strong Parameters:**
```ruby
def product_params
  params.require(:product).permit(:name, :price_cents, :description)
end
```

**Custom Validators:**
```ruby
validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
```

### XSS Protection

- Use Rails auto-escaping in views
- Sanitize user HTML with `sanitize` helper
- Use DOMPurify in JavaScript
- Set Content Security Policy headers

### CSRF Protection

- Rails CSRF tokens on all forms
- Verify authenticity token on POST/PUT/DELETE
- OAuth state parameter validation

### SQL Injection Prevention

- Use ActiveRecord query interface
- Use parameterized queries
- Never interpolate user input into SQL

### Authentication Security

- Secure password hashing (bcrypt)
- Two-factor authentication
- Session expiration
- Account lockout after failed attempts

### Rate Limiting

```ruby
# config/initializers/rack_attack.rb
Rack::Attack.throttle('api/ip', limit: 300, period: 5.minutes) do |req|
  req.ip if req.path.start_with?('/api')
end
```

---

## Contributing Guidelines

### Before You Start

1. Read the [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check existing issues and PRs
3. Discuss major changes in an issue first

### Pull Request Process

1. **Include AI disclosure** if using AI assistance
2. **Self-review** your code with comments
3. **Break up large PRs** (aim for <100 LOC)
4. **Include videos** of before/after for UI changes
5. **Write tests** (especially E2E tests)
6. **No force-push** after review begins
7. **Request review** from maintainers

### Code Review Checklist

- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
- [ ] Follows code conventions
- [ ] Commit messages follow Conventional Commits

### Getting Help

- **Documentation:** Check `docs/` folder
- **Issues:** Open issue on GitHub
- **Discussions:** Start a discussion
- **Slack:** Join #engineering channel

---

## Additional Resources

### Documentation Files

Located in `docs/`:
- `accounting.md` - Financial tracking
- `taxes.md` - Tax calculation
- `testing.md` - Testing guidelines
- `shipping.md` - Shipping integration
- `paypal.md` - PayPal setup
- `sidekiq.md` - Background jobs
- `deploying.md` - Deployment process

### Key Configuration Files

- `.env.example` - Environment variables template
- `config/routes.rb` - Route definitions
- `config/database.yml` - Database configuration
- `config/webpack/` - Webpack configuration
- `Gemfile` - Ruby dependencies
- `package.json` - Node dependencies

### Useful Commands

```bash
# Rails console
bin/rails console

# Database operations
bin/rails db:migrate
bin/rails db:rollback
bin/rails db:seed

# Asset compilation
npm run build
npm run watch

# Testing
bin/rspec
bin/rspec spec/models

# Linting
bundle exec rubocop
npm run lint-fast

# Docker
make local        # Start services
make build        # Build image
make clean        # Clean containers
```

---

## Summary

The Gumroad platform is a **production-grade, enterprise-scale e-commerce application** with:

- **Modern Stack:** Rails 7.1 + React 18 + TypeScript
- **Comprehensive Features:** 20+ major feature areas
- **Global Scale:** 80+ countries, 100+ currencies
- **Robust Architecture:** 293 models, 100+ services, 100+ background jobs
- **Extensive Testing:** 1,749 test files
- **Active Development:** Continuous improvements and features
- **Well-Documented:** Comprehensive inline and external documentation

This architecture guide provides the foundation for understanding and contributing to the Gumroad codebase. For specific implementation details, refer to the code itself and the documentation in the `docs/` folder.

**Happy coding!** 🚀
