# VTC Backend API

**Project:** VTC Web backend (Spring Boot)

**Overview**
- **Description:** REST API for the VTC storefront and admin UI. Implements product, category, cart, checkout, orders, users, authentication, email templates, image uploads (cloud storage proxy), coupons, reviews, wishlist, analytics and admin features.
- **Language / Frameworks:** Java 17+, Spring Boot, Spring Security, Spring Data JPA, Flyway migrations.

**Quick Links**
- **Controllers:** [src/main/java/com/vtcweb/backend/controller](src/main/java/com/vtcweb/backend/controller)
- **Database migrations:** [src/main/resources/db/migration](src/main/resources/db/migration)
- **Email templates:** [src/main/resources/templates/email](src/main/resources/templates/email)

**Features**
- **Product management:** CRUD, search, pagination, stats by SKU, product images & variations.
- **Category management:** CRUD, image uploads (main/tile slots).
- **Cart & Wishlist:** per-user cart and wishlist endpoints, merging local state.
- **Checkout & Orders:** create checkout, order lifecycle (admin status updates), order ownership checks.
- **Authentication:** JWT access tokens, refresh tokens via HttpOnly cookie (`vtc_refresh`), register/login/refresh/logout/forgot/reset flows.
- **User management:** profile, admin user management, roles, addresses, order history.
- **Reviews & Coupons:** create/list reviews, apply coupons.
- **Email service:** template-based emails (account welcome, order confirmations, password reset, contact reply, newsletter, order status). Queued async sending via `EmailService`.
- **Image uploads:** backend-proxied image uploads (Cloudinary) via `ImageStorageService` and endpoints that return upload metadata.
- **Admin analytics:** sales & dashboard analytics endpoints for admin UI.
- **Config management:** shipping configuration service with admin override.

**Requirements**
- Java 17+
- Maven 3.6+
- PostgreSQL (or compatible DB configured in `application.properties`)
- Cloudinary account or configured storage backend for images

**Environment / Configuration**
- Copy `.env.example` to `.env` (or set environment variables) and update values.
- Key settings (see `src/main/resources/application.properties` and `.env.example`):
	- **`SPRING_DATASOURCE_URL` / DB settings**: database connection
	- **JWT Settings:** secret keys, TTLs, refresh TTLs (admin vs user)
	- **Cookie settings:** `vtc_refresh` secure/same-site options
	- **Cloud storage:** Cloudinary credentials used by `ImageStorageService`
	- **Email:** SMTP settings used by `EmailService`

**Database**
- Flyway migrations are located at [src/main/resources/db/migration](src/main/resources/db/migration). Run migrations automatically on app start (default Flyway behavior) or run Flyway manually.
- Initial schema, shipping config migration and subsequent migration scripts are included.

**Build & Run**
- Build with Maven:

	```bash
	./mvnw -DskipTests package
	```

- Run locally (dev profile / properties as needed):

	```bash
	./mvnw spring-boot:run
	```

- Run the produced jar:

	```bash
	java -jar target/backend-0.0.1-SNAPSHOT.jar
	```

**Docker**
- A `Dockerfile` and `docker-compose.yml` (workspace root) are included for containerized runs. Use `docker-compose up --build` from the workspace root to run backend + database (inspect `docker-compose.yml`).

**Testing**
- Unit and integration tests are in `src/test`. Run tests with:

	```bash
	./mvnw test
	```

**Authentication & Security**
- Access control uses JWT access tokens and a refresh token cookie named `vtc_refresh`.
- Common roles: `ROLE_CUSTOMER`, `ROLE_ADMIN`, `ROLE_MANAGER`.
- Admin/Manager protected endpoints require appropriate roles; some manager-only endpoints exist (e.g., role assignment).
- Endpoints that expect authenticated user often resolve the user id from JWT subject.

**Image Uploads**
- Upload endpoints proxy multipart uploads to the configured `ImageStorageService` (Cloudinary). The API returns `url`, `publicId`, `bytes`, `format` and created resource id.

**Email Templates**
- Templates are under [src/main/resources/templates/email](src/main/resources/templates/email) and referenced by `EmailTemplateKey`.

**API Reference (endpoints)**
Note: most endpoints accept/return JSON and use standard HTTP status codes. Where indicated, endpoints require authentication and specific roles.

- **Auth & Account**
	- **POST** `/api/auth/register` : register a new user (returns `AuthResponse` with tokens)
	- **POST** `/api/auth/login` : login, returns `AuthResponse` and sets `vtc_refresh` cookie
	- **POST** `/api/auth/refresh` : refresh access token (reads `vtc_refresh` cookie or `token` param)
	- **POST** `/api/auth/logout` : invalidate refresh token and clear cookie
	- **GET** `/api/auth/me` : get current authenticated user
	- **POST** `/api/auth/forgot-password` : request password reset email
	- **POST** `/api/auth/reset-password` : perform password reset

- **Products** (`/api/products`)
	- **POST** `/api/products` : create product (roles: ADMIN, MANAGER)
	- **POST** `/api/products/add` : create full product (images & variations) (ADMIN, MANAGER)
	- **GET** `/api/products/{id}` : get product shallow DTO
	- **GET** `/api/products/{id}/details` : get product with details
	- **GET** `/api/products` : list products (pageable). Query params: `status`, `stock`
	- **GET** `/api/products/by-category/{categoryId}` : list by category (pageable)
	- **GET** `/api/products/search` : search by `name`, `sku`, `status` (pageable)
	- **GET** `/api/products/next-sku?categoryId={id}` : preview next SKU for category
	- **GET** `/api/products/by-sku/{sku}/stats` : aggregated product stats by SKU
	- **PUT** `/api/products/{id}` : update product (ADMIN, MANAGER)
	- **PUT** `/api/products/{id}/status` : update product status (ADMIN, MANAGER)
	- **DELETE** `/api/products/{id}` : delete product (ADMIN, MANAGER)

- **Product Variations** (`/api/products/{productId}/variations`)
	- **GET** `/api/products/{productId}/variations` : paged list
	- **GET** `/api/products/{productId}/variations/all` : list all variations
	- **POST** `/api/products/{productId}/variations` : create variation (ADMIN, MANAGER)
	- **PUT** `/api/products/{productId}/variations/{id}` : update variation (ADMIN, MANAGER)
	- **DELETE** `/api/products/{productId}/variations/{id}` : delete variation (ADMIN, MANAGER)

- **Product Images**
	- **POST** `/api/products/{productId}/images/upload` (multipart) : upload product image (ADMIN, MANAGER)
	- **POST** `/api/products/{productId}/variations/{variationId}/images/upload` (multipart) : upload variation image (ADMIN, MANAGER)
	- **POST** `/api/products/{productId}/images/sync` : sync image list for product (ADMIN, MANAGER)

- **Categories** (`/api/categories`)
	- **POST** `/api/categories` : create category (ADMIN, MANAGER)
	- **GET** `/api/categories/{id}` : get category
	- **GET** `/api/categories` : list categories (pageable, `status` query)
	- **PUT** `/api/categories/{id}` : update category (ADMIN, MANAGER)
	- **DELETE** `/api/categories/{id}` : delete category (ADMIN, MANAGER)
	- **POST** `/api/categories/{categoryId}/image/upload` (multipart) : upload category image (slot param: `main|tile1|tile2`) (ADMIN, MANAGER)

- **Cart** (`/api/cart`)
	- **GET** `/api/cart` : get current user's cart (auth required)
	- **POST** `/api/cart/add` : add item to cart (auth required)
	- **PUT** `/api/cart/item/{id}` : update cart item (auth required)
	- **DELETE** `/api/cart/item/{id}` : remove item (auth required)
	- **DELETE** `/api/cart/clear` : clear cart (auth required)
	- **POST** `/api/cart/merge-local` : merge local cart items on login (auth required)

- **Wishlist** (`/api/wishlist`)
	- **GET** `/api/wishlist` : get wishlist (auth required)
	- **POST** `/api/wishlist/add/{productId}` : add product to wishlist (auth required)
	- **DELETE** `/api/wishlist/remove/{productId}` : remove product (auth required)
	- **DELETE** `/api/wishlist/clear` : clear wishlist (auth required)
	- **POST** `/api/wishlist/merge-local` : merge local wishlist (auth required)

- **Orders & Checkout**
	- **POST** `/api/checkout` : perform checkout (auth required)
	- **POST** `/api/orders` : create order (checkout flow)
	- **GET** `/api/orders/{id}` : get order summary (owner or admin)
	- **GET** `/api/orders/{id}/details` : get order with items (owner or admin)
	- **GET** `/api/orders` : list orders (ADMIN, MANAGER)
	- **GET** `/api/orders/number/{orderNumber}` : get order by number
	- **GET** `/api/orders/number/{orderNumber}/details` : get order by number with items
	- **GET** `/api/orders/me` : get current user's orders (auth required)
	- **PATCH** `/api/orders/{id}/status` : update status (ADMIN, MANAGER)
	- **DELETE** `/api/orders/{id}` : delete order (ADMIN, MANAGER)
	- **POST** `/api/orders/{id}/cancel` : cancel order (owner or admin)

- **Users & Addresses**
	- **GET** `/api/users/me` : current user
	- **PUT** `/api/users/me` : update current user
	- **POST** `/api/users/me/change-password` : change current password
	- **GET** `/api/users/me/addresses/billing` : list billing addresses
	- **POST** `/api/users/me/addresses/billing` : create billing address
	- **PUT** `/api/users/me/addresses/billing/{id}` : update billing address
	- **DELETE** `/api/users/me/addresses/billing/{id}` : delete billing address
	- **GET** `/api/users/me/addresses/shipping` : list shipping addresses
	- **POST** `/api/users/me/addresses/shipping` : create shipping address
	- **PUT** `/api/users/me/addresses/shipping/{id}` : update shipping address
	- **DELETE** `/api/users/me/addresses/shipping/{id}` : delete shipping address
	- **ADMIN user management** under `/api/admin/users` (list, get, create, update, delete, status, roles, orders, addresses)

- **Reviews**
	- **GET** `/api/products/{id}/reviews` : list reviews for product
	- **POST** `/api/products/{id}/reviews` : create review (authenticated preferred but accepts name/email)
	- **DELETE** `/api/reviews/{id}` : delete review

- **Coupons**
	- **POST** `/api/coupons/apply` : apply coupon to compute discount

- **Email (test & templated sends)**
	- **POST** `/api/email/test` : send arbitrary email (debug)
	- **POST** `/api/email/account-welcome`
	- **POST** `/api/email/order-confirmation`
	- **POST** `/api/email/password-reset`
	- **POST** `/api/email/contact-reply`
	- **POST** `/api/email/newsletter-welcome`
	- **POST** `/api/email/order-status`

- **Admin Analytics**
	- **GET** `/api/admin/analytics/dashboard` : admin dashboard metrics
	- **GET** `/api/admin/analytics/sales` : sales analytics (query `days`, `currency`)

- **Shipping config**
	- **GET** `/api/shipping-config` : public shipping amount
	- **GET** `/api/admin/shipping-config` : admin view
	- **POST** `/api/admin/shipping-config?amount={value}` : set shipping amount (admin)

**Developer notes & code locations**
- Controllers: [src/main/java/com/vtcweb/backend/controller](src/main/java/com/vtcweb/backend/controller)
- DTOs: [src/main/java/com/vtcweb/backend/dto](src/main/java/com/vtcweb/backend/dto)
- Services: [src/main/java/com/vtcweb/backend/service](src/main/java/com/vtcweb/backend/service)
- Security: `src/main/java/com/vtcweb/backend/security` (JWT provider, filters, token handling)

**Operational notes**
- Refresh tokens are stored and rotated; refresh endpoint accepts cookie `vtc_refresh` and fallback `token` param.
- Upload endpoints require authenticated admin/manager roles and return created resource `id` and `url`.
- Email endpoints queue template-sends asynchronously; monitor logs for delivery issues.

**Troubleshooting**
- If migrations fail, inspect Flyway logs and `src/main/resources/db/migration` for SQL scripts.
- For image upload errors, ensure cloud storage credentials are set and reachable.

**Contributing / Extending**
- To add endpoints, add controller under [src/main/java/com/vtcweb/backend/controller](src/main/java/com/vtcweb/backend/controller) and DTOs under `dto`.
- Follow existing patterns for pagination, DTO mapping (`Mapper`), and security annotations (`@PreAuthorize`).

---
Generated from source in this repository. For implementation details see controller classes in [src/main/java/com/vtcweb/backend/controller](src/main/java/com/vtcweb/backend/controller).

