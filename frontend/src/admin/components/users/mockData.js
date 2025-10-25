// Mock users data for Admin Users management (no backend integration yet)
// Each user includes: id, name, email, role, status, phone, addresses, billing, createdAt, lastLogin, orders

export const users = [
	{
		id: 'u-1001',
		name: 'Alice Johnson',
		email: 'alice@example.com',
		// Single platform manager (unique)
		role: 'manager',
		status: 'active',
		phone: '+1 555 100 1001',
		address: [ '742 Evergreen Terrace', 'Springfield, IL 62704', 'United States' ],
		billing: {
			address: [ '742 Evergreen Terrace', 'Springfield, IL 62704', 'United States' ]
		},
		createdAt: '2025-05-12T09:24:00Z',
		lastLogin: '2025-10-07T14:12:00Z',
		orders: [
			{ id: 'ord-9001', total: 248.35, createdAt: '2025-09-28T11:04:00Z', status: 'fulfilled', items: 5 },
			{ id: 'ord-8802', total: 89.99, createdAt: '2025-08-16T16:44:00Z', status: 'fulfilled', items: 2 }
		]
	},
	{
		id: 'u-1002',
		name: 'Brandon Lee',
		email: 'brandon@example.com',
		role: 'customer',
		status: 'active',
		phone: '+1 555 100 2002',
		address: [ '221B Baker Street', 'London NW1 6XE', 'United Kingdom' ],
		billing: {
			address: [ '221B Baker Street', 'London NW1 6XE', 'United Kingdom' ]
		},
		createdAt: '2025-06-20T12:05:00Z',
		lastLogin: '2025-10-06T19:55:00Z',
		orders: [
			{ id: 'ord-9312', total: 54.50, createdAt: '2025-10-01T09:20:00Z', status: 'processing', items: 1 },
			{ id: 'ord-9201', total: 112.10, createdAt: '2025-09-10T13:02:00Z', status: 'fulfilled', items: 3 }
		]
	},
	{
		id: 'u-1003',
		name: 'Carlos Martinez',
		email: 'carlos@example.com',
		role: 'customer',
		status: 'disabled',
		phone: '+34 600 123 003',
		address: [ 'Calle de Atocha 27', '28012 Madrid', 'Spain' ],
		billing: {
			address: [ 'Calle de Atocha 27', '28012 Madrid', 'Spain' ]
		},
		createdAt: '2025-03-04T08:11:00Z',
		lastLogin: '2025-09-01T10:30:00Z',
		orders: [
			{ id: 'ord-8700', total: 300.00, createdAt: '2025-07-22T18:11:00Z', status: 'refunded', items: 6 }
		]
	},
	{
		id: 'u-1004',
		name: 'Dana Kapoor',
		email: 'dana@example.com',
		role: 'customer',
		status: 'active',
		phone: '+91 90000 41004',
		address: [ '44 Residency Road', 'Bengaluru 560025', 'India' ],
		billing: {
			address: [ '44 Residency Road', 'Bengaluru 560025', 'India' ]
		},
		createdAt: '2025-01-15T17:47:00Z',
		lastLogin: '2025-10-07T05:52:00Z',
		orders: [
			{ id: 'ord-9550', total: 720.00, createdAt: '2025-10-05T14:21:00Z', status: 'processing', items: 8 },
			{ id: 'ord-9440', total: 64.99, createdAt: '2025-09-25T20:05:00Z', status: 'fulfilled', items: 1 }
		]
	},
	{
		id: 'u-1005',
		name: 'Evelyn Park',
		email: 'evelyn@example.com',
		role: 'admin',
		status: 'active',
		phone: '+1 555 100 5005',
		address: [ '500 Market Street', 'San Francisco, CA 94105', 'United States' ],
		billing: {
			address: [ '500 Market Street', 'San Francisco, CA 94105', 'United States' ]
		},
		createdAt: '2025-07-02T10:31:00Z',
		lastLogin: '2025-10-08T08:11:00Z',
		orders: []
	}
];

export function summarizeUser(u) {
	const totalOrders = u.orders.length;
	const totalSpend = u.orders.reduce((s, o) => s + o.total, 0);
	return { id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, totalOrders, totalSpend };
}

export const userSummaries = users.map(summarizeUser);
