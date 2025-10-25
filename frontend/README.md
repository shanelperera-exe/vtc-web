# Vidara Trade Center Frontend

React + Vite application powering the Vidara Trade Center storefront and admin panel.

## Quick Start

1. Copy environment file:
	 ```bash
	 cp .env.example .env
	 ```
2. (Optional) change `VITE_API_BASE_URL` if backend runs on a different host/port.
3. Install deps & run:
	 ```bash
	 npm install
	 npm run dev
	 ```
4. Visit http://localhost:5173

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for Spring Boot backend API | `http://localhost:8080` |

## API Layer Structure

```
src/api/
	axios.js          # Shared axios instance (base URL, interceptors)
	apiUtils.js       # Error + pagination helpers & simple cache
	categoryApi.js    # Category CRUD + list
	productApi.js     # Product CRUD + list/search/byCategory
	authApi.js        # Auth endpoints (login/register/refresh/logout/me)
	hooks/
		useCategories.js
		useProducts.js
		(use future) useAuth* (context based)

	## Authentication Integration

	Auth state is handled via `AuthContext` (`src/context/AuthContext.jsx`).

	Workflow:
	1. User logs in -> `authApi.login` returns `{ accessToken, user }`.
	2. Access token stored in `localStorage` (key `vtc_access_token`).
	3. Axios request interceptor attaches `Authorization: Bearer <token>` automatically.
	4. On 401, a single automatic refresh attempt is made via `POST /api/auth/refresh`.
	5. User profile preloaded via `authApi.me()` if token exists on page load.

	Usage example inside a component:
	```jsx
	import { useAuth } from '@/context/AuthContext';

	function AccountBadge() {
	  const { user, isAuthenticated, logout } = useAuth();
	  if (!isAuthenticated) return <button onClick={() => {/* open auth modal */}}>Sign In</button>;
	  return <div>Hello {user.firstName}! <button onClick={logout}>Sign out</button></div>;
	}
	```
```

### Usage Examples

Fetch categories inside a component:
```jsx
import { useCategories } from '@/api/hooks/useCategories';

function CategoryChips() {
	const { data, loading, error } = useCategories();
	if (loading) return <p>Loading…</p>;
	if (error) return <p>Error: {error.message}</p>;
	return data.map(c => <span key={c.id}>{c.name}</span>);
}
```

Create a product:
```js
import { createProduct } from '@/api/productApi';
await createProduct({ name:'Mug', basePrice: 12.99, categoryId: 1 });
```

### Hook Contract

Each hook returns:
```ts
{
	data: T[];          // array of entities for current criteria
	page: PageMeta;     // page metadata (if obtained)
	loading: boolean;
	error: { message, status? } | null;
	reload(): Promise<void>;
	create(payload): Promise<T>;
	update(id, payload): Promise<T>;
	remove(id): Promise<boolean>;
}
```

### Pagination

Hooks accept `{ page, size, sort }`. `page` is 0-based when passed to the API; UI components may wrap it in 1-based indexing.

### Error Handling

Errors are normalized in `apiUtils.normalizeError` to shape:
```jsonc
{ "message": "Readable message", "status": 400, "details": { ...raw } }
```

### Caching

A minimal in-memory cache stores list responses for the session. Mutations invalidate relevant keys via `cacheInvalidate`.

## Admin Integrations

| Area | Backend Connected | Notes |
|------|-------------------|-------|
| Categories | Yes | CRUD + listing; dynamic storefront categories. |
| Products | Yes | Listing + create/update/delete; dynamic customer views. |
| Category Menu / Hamburger | Yes | Dynamic fetch; slug generated client-side. |
| Storefront Product Lists | Yes | Home & carousels use backend data. |
| Authentication | Yes | Login & registration integrated with backend JWT + refresh. |

## Future Enhancements

- Token rotation on each refresh (backend enhancement)
- Migrate simple cache to TanStack Query for stale-time control
- Optimistic updates for orders & user profile
- Add toast notifications for mutation success/error
- Accessibility pass (focus trapping in auth modal, aria-live for errors)

## Development Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start Vite dev server |
| `build` | Production build |
| `preview` | Preview production build |

## License

Internal project – add license info if distributing.

## Environment file usage

Copy `.env.example` to `.env` and fill in real values for local development. Never commit your `.env` file or paste secret keys into the frontend repo. Use the backend to hold secret API keys (for example, Cloudinary API secrets) and implement signed uploads when needed.
