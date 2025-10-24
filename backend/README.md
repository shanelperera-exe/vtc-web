## Backend Product & Category API

Base URL: `/api`

### Categories

Endpoint | Method | Description | Request Body | Query Params | Response (200/201)
---------|--------|-------------|--------------|--------------|-------------------
`/categories` | POST | Create category | `{ "name": "Homeware", "description": "...", "categoryImage": "...", "categoryIcon": "...", "carouselImage": "..." }` | – | `CategoryDTO`
`/categories/{id}` | GET | Get category by id | – | – | `CategoryDTO`
`/categories` | GET | Paged categories | – | `page,size,sort` | `Page<CategoryDTO>`
`/categories/{id}` | PUT | Update (partial: nulls ignored) | Any subset of create fields | – | `CategoryDTO`
`/categories/{id}` | DELETE | Delete category (fails if products exist) | – | – | 204 No Content

CategoryDTO fields:
```
{
  id: number,
  name: string,
  detailedDescription?: string, // formerly 'description'
  categoryImage?: string,
  categoryIcon?: string,
  carouselImage?: string,
  productCount?: number // placeholder for future aggregation
}
```

### Products

Endpoint | Method | Description | Request Body | Query Params | Response (200/201)
`/products` | POST | Create basic product | `CreateProductRequest` | – | `ProductDTO (shallow)`
`/products/add` | POST | Create product with images & variations atomically | `CreateProductFullRequest` | – | `ProductDTO (detailed)`
`/products/{id}` | GET | Get product (shallow) | – | – | `ProductDTO`
`/products/{id}/details` | GET | Get product with images & variations | – | – | `ProductDTO (detailed)`
`/products` | GET | Paged list | – | `page,size,sort` | `Page<ProductDTO>`
`/products/by-category/{categoryId}` | GET | Products in category | – | `page,size,sort` | `Page<ProductDTO>`
`/products/search?name=term` | GET | Text search across name, shortDescription, category, description | – | `name` plus `page,size,sort` | `Page<ProductDTO>`
`/products/search?sku=ABC-XXXXX-001` | GET | Find single product by exact SKU | – | `sku` | `Page<ProductDTO>` (0 or 1 item)
`/products/{id}` | PUT | Update (optional category change) | `UpdateProductRequest` | `newCategoryId` | `ProductDTO`
`/products/{id}` | DELETE | Delete product | – | – | 204 No Content

CreateProductRequest:
```
{
  name: string (<=150, required),
  shortDescription?: string (<=500),
  detailedDescription?: string,
  basePrice: number >= 0,
  categoryId: number,
  highlights?: string[]   // each <=300 chars, ordered
  sku?: string             // optional; if omitted server generates
}
```

CreateProductFullRequest:
```
{
  name: string,
  shortDescription?: string,
  detailedDescription?: string,
  basePrice: number,
  categoryId: number,
  highlights?: string[],
  sku?: string,
  images?: [ { url: string, type: "PRIMARY" | "SECONDARY" } ],
  variations?: [
    {
      price?: number,
      stock?: number,
      imageUrl?: string,
      attributes: { key: value, ... }
    }
  ]
}
```

ProductDTO (shallow):
```
{
  id: number,
  sku: string,               // CCC-PPPPP-NNN generated if not supplied
  name: string,
  shortDescription?: string,
  description?: string,
  basePrice: number,
  price: number,              // alias of basePrice for frontend
  compareAtPrice?: number,    // reserved (null unless future pricing logic added)
  highlights?: string[],
  categoryId: number,
  categoryName: string,
  category: string,           // alias of categoryName
  createdAt: ISODateTime,
  updatedAt: ISODateTime
}
```

ProductDTO (detailed adds):
```
{
  ...shallowFields,
  imageUrls: string[],
  image: string,              // primary image
  primaryImageUrl: string,    // alias of image
  variations: [
    { id: number, price?: number, stock: number, imageUrl?: string, attributes: { key: value } }
  ],
  imageCount?: number,
  variationCount?: number
}
```

UpdateProductRequest:
```
{
  name?: string,
  shortDescription?: string,
  detailedDescription?: string,
  basePrice?: number >= 0,
  highlights?: string[]
}
```

### Error Model
```
{
  "timestamp": "2025-10-05T12:34:56.123Z",
  "status": 409,
  "error": "Conflict",
  "message": "Category name already exists: Homeware",
  "path": "/api/categories"
}
```

### Validation & Constraints
 - Unique: Category.name (case-insensitive logic), Product.name (case-insensitive check)
 - Unique: Product.sku (format: CCC-PPPPP-NNN; CCC=first 3 alnum of category, PPPPP=first 5 alnum of product, NNN=sequence)
 - Cannot delete Category if products exist
 - Variation attributes map required & non-empty
 - Prices must be >= 0

### Pagination
Use standard Spring Data parameters: `?page=0&size=20&sort=name,asc`.

### CORS
Requests from `http://localhost:5173` are allowed for `/api/**` (methods: GET, POST, PUT, DELETE, OPTIONS). Adjust `WebConfig` for production domains.

### Suggested Enhancements
 - Add springdoc-openapi for Swagger UI
 - Introduce caching (e.g., Redis) for frequently read endpoints
 - Soft delete flag for products
 - Externalize image storage (S3, Cloudinary)
 - Add audit fields to Category (createdAt/updatedAt) similar to Product
 
### Field Rename Notice (Oct 2025)
`description` field in product payloads has been renamed to `detailedDescription`.
Backward compatibility:
 - Incoming JSON may still send `description`; server maps it to `detailedDescription` if the new field is absent.
 - Responses now expose only `detailedDescription`.
 - Physical DB column remains `description` until a future migration.
Update legacy clients to use `detailedDescription`.

## Image Upload (Cloudinary Backend-Proxy Flow)

The backend exposes endpoints to upload product (and variation) images via multipart form-data. The server uploads the file to Cloudinary and stores only the returned URL in MySQL.

Flow: React Admin -> POST multipart to Spring -> Spring uploads to Cloudinary -> saves ProductImage (URL + type) -> returns JSON.

### Endpoints

| Endpoint | Method | Description | Form Fields | Notes |
|----------|--------|-------------|-------------|-------|
| `/api/products/{productId}/images/upload` | POST | Upload product image | `file` (required), `type` (PRIMARY|SECONDARY optional) | Returns `{ id,url,type,publicId,bytes,format }` |
| `/api/products/{productId}/variations/{variationId}/images/upload` | POST | Upload variation-specific image | `file`, `type` | Same response |

Content-Type: `multipart/form-data`. Only `image/*` types accepted (basic validation).

### Environment Variables (required)

```
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=yyy
```

These are loaded through `spring-dotenv` if present in `.env`.

### Sample cURL

```bash
curl -X POST \
  -F "file=@/path/to/image.jpg" \
  -F "type=PRIMARY" \
  http://localhost:8080/api/products/1/images/upload
```

### Frontend Usage

The frontend `productApi.uploadProductImage(productId, file, { type })` helper wraps the call:

```js
import { uploadProductImage } from '@/api/productApi';
const input = document.querySelector('#file');
const file = input.files[0];
const res = await uploadProductImage(42, file, { type: 'PRIMARY' });
console.log(res.url); // secure Cloudinary URL
```

### Deletion (Future)

Currently only upload & DB association are implemented. To support deletion you would:
1. Store Cloudinary public ID in ProductImage (add column) or a new table.
2. On delete call `imageStorageService.delete(publicId)`.

---

## Database Reset (Development Only)

To completely reset (drop & recreate) the MySQL schema and let Hibernate rebuild tables:

1. Run the reset script (this DESTROYS existing data):
```
mysql -u vtcuser -p < backend/db-reset.sql
```
2. (Optional) Temporarily set in `application.properties`:
```
spring.jpa.hibernate.ddl-auto=create
```
  Start the application once so schema is created, then revert to `update` or `validate`.

3. Verify new tables:
```
mysql -u vtcuser -p -e "USE vtcdb; SHOW TABLES;"
```

4. Return `spring.jpa.hibernate.ddl-auto` to `update` (or better: adopt Flyway later).

Never run the reset script against production or shared environments.

## User Deletion & Reviews (Oct 2025)

When a user account is deleted, product reviews authored by that user are preserved. Before deleting the user, the system detaches their reviews and anonymizes the public fields to prevent data loss while respecting account removal:

- `reviews.user_id` is set to `NULL` (so the FK no longer blocks deletion).
- `reviews.name` is set to `"Deleted User"`.
- `reviews.email` is cleared.

The frontend detects the name and renders a neutral avatar for deleted users. This keeps ratings/reviews intact for other shoppers without exposing the former user’s identity.

## Environment file usage

The backend no longer hardcodes the database password. `application.properties` now contains:

```
spring.datasource.password=${DB_PASSWORD}
```

You must provide `DB_PASSWORD` (and optionally other DB vars) via environment. A convenient way for local dev is a single `.env` file (already gitignored) in the `backend` directory.

Example flow:

1. Create a local env file (once):

  ```bash
  cp backend/.env.example backend/.env
  # edit backend/.env
  ```

  Set at minimum:
  ```dotenv
  DB_PASSWORD=yourRealLocalPassword
  # Optionally override host/port/name/user if they differ
  # DB_HOST=localhost
  # DB_PORT=3306
  # DB_NAME=vtcdb
  # DB_USER=vtcuser
  ```

2. (Optional) Export directly instead of file:
  ```bash
  export DB_PASSWORD=yourRealLocalPassword
  ```

3. Start the app (Spring will resolve the placeholder):
  ```bash
  ./mvnw spring-boot:run
  # or
  java -jar target/backend-*.jar
  ```

For production / staging use a secrets manager or deployment environment variable store (Kubernetes secrets, ECS task defs, GitHub Actions encrypted vars, etc.). Never commit real credentials.

## Caching & Redis (Oct 2025)

The application uses Spring Cache for certain endpoints (like the cart). In development, Redis is optional:

- If Redis is available, it will be used automatically.
- If Redis is NOT available, the app now falls back to an in-memory cache and logs a warning once. Your requests will continue to work.

Config (see `src/main/resources/application.properties`):

```
spring.cache.type=redis
spring.data.redis.host=${SPRING_REDIS_HOST:localhost}
spring.data.redis.port=${SPRING_REDIS_PORT:6379}
spring.data.redis.password=${SPRING_REDIS_PASSWORD:}
app.cache.cart.ttl-seconds=300
```

Run with Redis locally (optional):

```bash
# Linux
sudo apt-get install redis-server
sudo service redis-server start

# or with Docker
docker run --rm -p 6379:6379 redis:7-alpine
```

Disable Redis explicitly (alternative):

```properties
spring.cache.type=simple
```

Note: Even without changing properties, the app is resilient—if Redis is unreachable, it switches to a simple in-memory cache automatically.

## Authentication & Sessions (Oct 2025)

The backend uses short-lived JWT access tokens and a long-lived refresh token stored as an HttpOnly cookie.

- Access token lifetime: configurable via `security.jwt.access-ttl-seconds` (default 7200 seconds = 2 hours).
- Refresh token lifetime: `security.jwt.refresh-ttl-seconds` (default 7 days).
- Refresh cookie name: `vtc_refresh`, HttpOnly, SameSite configurable (default `Lax`).

Flow:
- On `/api/auth/login` or `/api/auth/register`, the server returns an access token in the JSON response and sets `vtc_refresh` cookie.
- The frontend stores the access token in `localStorage` and sends it as `Authorization: Bearer ...` on API calls.
- When the access token expires, the frontend silently POSTs `/api/auth/refresh` with credentials. The server validates the refresh token from the cookie and returns a new access token; it also extends the cookie's max-age.
- Logout revokes the refresh token and clears the cookie.

Config tips:
- For HTTPS deployments, enable secure cookie: `security.cookie.refresh.secure=true` and consider `security.cookie.refresh.same-site=Strict` for first-party apps.
- Update allowed origins in `app.cors.allowed-origins` (and/or `SecurityConfig.corsConfigurationSource`) to include your production domains to allow credentialed requests.

Troubleshooting:
- If the session appears to end after a short time, ensure cookies are allowed in the browser and CORS is configured with `allowCredentials=true` and exact origins (no `*`).
- Verify the `Set-Cookie` header is present on login responses and that subsequent refresh requests include the cookie.

## Admin authentication & RBAC (Oct 2025)

Admin endpoints are protected using role-based access control via Spring Security + JWT.

- Roles available: `ROLE_CUSTOMER`, `ROLE_ADMIN`, `ROLE_MANAGER`.
- Access token contains the user's roles and is sent in `Authorization: Bearer <token>`.
- Backend guards:
  - Method-level guards: product/category/order mutations require `ADMIN` or `MANAGER`.
  - User management endpoints under `/api/admin/users/**` require `ADMIN` or `MANAGER` (with finer rules enforced in service layer).
  - Convention path guard: `/api/admin/**` requires `ADMIN` or `MANAGER`.

Frontend admin panel is gated by a RequireAdmin component which checks `user.roles` for `ROLE_ADMIN` or `ROLE_MANAGER`. Non-authorized users are redirected to `/admin/login`.

## Email templates (Oct 2025)

The backend can send emails via local Thymeleaf templates or Brevo API templates. Configure sender and branding in `application.properties` using the `app.email.*` keys.

Supported templates and their keys:

- ACCOUNT_WELCOME → `email/account-welcome.html` (or Brevo `app.email.templates.account-welcome-id`)
- ORDER_CONFIRMATION → `email/order-confirmation.html` (or Brevo `app.email.templates.order-confirmation-id`)
- PASSWORD_RESET → `email/password-reset.html` (or Brevo `app.email.templates.password-reset-id`)
- PASSWORD_CHANGED → `email/password-changed.html` (or Brevo `app.email.templates.password-changed-id`)
- CONTACT_REPLY → `email/contact-reply.html` (or Brevo `app.email.templates.contact-reply-id`)
- NEWSLETTER_WELCOME → `email/newsletter-welcome.html` (or Brevo `app.email.templates.newsletter-welcome-id`)
- ORDER_STATUS_UPDATE → `email/order-status-update.html` (or Brevo `app.email.templates.order-status-update-id`)

New behavior: When a user successfully changes their password (self-service or via admin action with current password validation), the system sends a “Password Changed” notification using `PASSWORD_CHANGED` with variables:

- `customer_name`: User’s full name or email fallback
- `account_link`: Link to account page (derived from `app.email.site-url`)

To enable Brevo API for this email, set:

```
app.email.use-brevo-api=true
app.email.templates.password-changed-id=<your Brevo template id>
```

Or keep using local templates with SMTP; the HTML template lives at `src/main/resources/templates/email/password-changed.html`.

### Bootstrap the first admin account

On application startup, if no admin exists, a bootstrapper will create one based on environment variables:

- `ADMIN_EMAIL` (default: `admin@vidara.local`)
- `ADMIN_PASSWORD` (default: `ChangeMe!12345`)
- `ADMIN_FIRST_NAME` (default: `System`)
- `ADMIN_LAST_NAME` (default: `Admin`)

The admin user is created exactly once (if none exists). Change these values in your environment before the first boot in any non-dev environment, and rotate the credentials immediately after login.

Example (Linux/macOS):

```bash
export ADMIN_EMAIL=you@example.com
export ADMIN_PASSWORD='S0me$trongP@ss'
```

Then start the app as usual.

### Production hardening checklist

- Set a strong Base64-encoded JWT secret via `security.jwt.secret` (in env or config) and rotate periodically.
- Use HTTPS and enable secure cookies:
  - `security.cookie.refresh.secure=true`
  - Consider `security.cookie.refresh.same-site=Strict` for first-party apps.
- Limit CORS origins to your real domains in `app.cors.allowed-origins` or the security CORS config.
- Consider enabling rate limiting on auth endpoints and adding login attempt throttling.
- Add audit logging for admin actions (create/update/delete resources).
- Back up the database and restrict direct DB access.
