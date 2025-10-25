export const categories = [
  { label: "Cleaning Supplies", link: "/cleaning" },
  { label: "Kitchen Appliences", link: "/kitchen" },
  { label: "Plastic Products", link: "/plastic" },
  { label: "Stationery Items", link: "/stationary" },
  { label: "Homeware", link: "/home" },
  { label: "Electrical Items", link: "/electric" },
];

export const products = [
  {
    id: 1,
    name: 'Cleaning Spray',
    description: 'Powerful cleaning spray for all surfaces.',
    details: 'Formulated with biodegradable ingredients, this cleaning spray is safe for most surfaces including glass, tile, and plastic. Made in Sri Lanka. Contains no harsh chemicals. Bottle is made from recycled plastic. Leaves a fresh, streak-free finish and is suitable for daily use throughout the home. Best used with a microfiber cloth; avoid unfinished wood. Store in a cool, dry place and keep out of direct sunlight.',
    image: 'https://dtgxwmigmg3gc.cloudfront.net/imagery/assets/derivations/icon/512/512/true/eyJpZCI6IjdjMzFmYTI5NjhlNGMwYzA5Y2E0YTAwOGQ4MTlkMTVmIiwic3RvcmFnZSI6InB1YmxpY19zdG9yZSJ9?signature=141a19d73878b7aab66b76fbc007a828a8bc664d52c5b21e92548c795ed9486a',
    secondaryImages: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=200&q=80',
    ],
    highlights: [
      'Biodegradable ingredients',
      'Safe for glass, tile, and plastic',
      'No harsh chemicals',
      'Recycled plastic bottle',
    ],
    price: 450,
    category: 'Cleaning Supplies',
    rating: 3.2,
    numOfReviews: 8,
    availability: 'in stock',
  },
  {
    id: 2,
    name: 'Kitchen Set',
    description: 'Complete kitchen utensils set.',
    details: 'This kitchen set includes stainless steel and BPA-free plastic utensils, heat-resistant handles, and ergonomic grips. Made for durability and easy cleaning. Manufactured in Sri Lanka. Designed for everyday cooking tasks from stirring to serving, and neatly stores to save space. Hand-wash recommended to preserve handle finish; safe for use with non-stick cookware.',
    image: 'https://img.freepik.com/premium-photo/kitchen-tools-cooking_22110-701.jpg?w=360',
    secondaryImages: [
      'https://static.vecteezy.com/system/resources/previews/057/453/656/non_2x/impressive-minimalist-modern-kitchen-utensils-set-isolated-cutout-original-png.png',
      'https://static.vecteezy.com/system/resources/previews/057/453/668/non_2x/wonderful-rustic-modern-kitchen-utensils-set-isolated-cutout-original-png.png',
    ],
    highlights: [
      'Stainless steel & BPA-free',
      'Heat-resistant handles',
      'Ergonomic grip',
      'Easy to clean',
    ],
    price: 1200,
    category: 'Kitchen Appliences',
    availableColors: ['Silver', 'Black', 'Red'],
    availableSizes: ['Small', 'Medium', 'Large'],
    rating: 4.1,
    numOfReviews: 15,
    availability: {
      Silver: {
        Small: 'in stock',
        Medium: 'in stock',
        Large: 'out of stock',
      },
      Black: {
        Small: 'in stock',
        Medium: 'out of stock',
        Large: 'in stock',
      },
      Red: {
        Small: 'out of stock',
        Medium: 'in stock',
        Large: 'in stock',
      },
    },
  },
  {
    id: 3,
    name: 'Plastic Organizer',
    description: 'Multi-purpose plastic organizer.',
    details: 'Made from high-quality, food-grade plastic. Features multiple compartments and a secure lid. Lightweight and stackable. Manufactured locally. Ideal for pantry goods, craft supplies, or office stationery, and easy to wipe clean. BPA-free material is safe for dry food storage; not intended for oven or stovetop use.',
    image: 'https://png.pngtree.com/png-vector/20250115/ourmid/pngtree-clear-storage-box-featuring-multiple-compartments-and-blue-cover-png-image_15202041.png',
    secondaryImages: [
      'https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=200&q=80',
    ],
    highlights: [
      'Food-grade plastic',
      'Multiple compartments',
      'Secure lid',
      'Stackable & lightweight',
    ],
    price: 350,
    category: 'Plastic Products',
    availableColors: ['Blue', 'Clear', 'Green'],
    availableSizes: ['Small', 'Medium', 'Large'],
    rating: 2.8,
    numOfReviews: 5,
    availability: {
      Blue: {
        Small: 'in stock',
        Medium: 'in stock',
        Large: 'out of stock',
      },
      Clear: {
        Small: 'in stock',
        Medium: 'out of stock',
        Large: 'in stock',
      },
      Green: {
        Small: 'out of stock',
        Medium: 'in stock',
        Large: 'in stock',
      },
    },
  },
  {
    id: 4,
    name: 'Stationary Pack',
    description: 'Essential stationary items for school.',
    details: 'Includes pens, pencils, erasers, and more. All items made from non-toxic materials. Packaged in recyclable material. Assembled in Sri Lanka. Perfect for classrooms, home study, or office use, with reliable everyday performance. Smooth-writing ink and durable pencils reduce breakage; suitable for ages 6 and up.',
    image: 'https://png.pngtree.com/png-clipart/20250224/original/pngtree-assorted-colorful-stationery-png-image_20508688.png',
    secondaryImages: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80',
    ],
    highlights: [
      'Non-toxic materials',
      'Pens, pencils, erasers included',
      'Recyclable packaging',
      'Assembled in Sri Lanka',
    ],
    price: 250,
    category: 'Stationery Items',
    availableColors: ['Assorted'],
    availableSizes: ['Standard'],
    rating: 3.9,
    numOfReviews: 11,
    availability: {
      Assorted: {
        Standard: 'in stock',
      },
    },
  },
  {
    id: 6,
    name: 'Electric Kettle',
    description: 'Fast boiling electric kettle for your kitchen.',
    details: 'Made with stainless steel and BPA-free plastic. Features auto shut-off and boil-dry protection. Designed for energy efficiency. Made in Sri Lanka. Wide-mouth opening for easy filling and cleaning, with a cool-touch handle for safe pouring. Concealed heating element reduces scale buildup; recommended to descale monthly for optimal performance.',
    image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_f91450735ac1117aee7258b8868930be.webp',
    price: 2200,
    category: 'Electrical Items',
    availableColors: ['White', 'Black', 'Silver'],
    availableSizes: ['1L', '1.5L', '2L'],
    rating: 2.5,
    numOfReviews: 3,
    availability: {
      White: {
        '1L': 'in stock',
        '1.5L': 'out of stock',
        '2L': 'in stock',
      },
      Black: {
        '1L': 'in stock',
        '1.5L': 'in stock',
        '2L': 'out of stock',
      },
      Silver: {
        '1L': 'out of stock',
        '1.5L': 'in stock',
        '2L': 'in stock',
      },
    },
    highlights: [
      'Auto shut-off safety',
      'Boil-dry protection',
      'Fast boil performance',
      'Cool-touch handle',
      'Easy-clean wide mouth',
    ],
  },
  {
    id: 7,
    name: 'Home Storage Rack',
    description: 'Durable rack for home storage needs.',
    details: 'Constructed from powder-coated steel for rust resistance. Easy to assemble. Suitable for kitchens, bathrooms, or garages. Made in Sri Lanka. Sturdy shelves keep items organized while maximizing vertical space in tight areas. Each shelf supports everyday household items; anchor to wall if heavily loaded or used on uneven floors.',
    image: 'https://cosmoplastoman.com/cdn/shop/products/ShelvingRackSet5-IFOFSH003-01.png?v=1620647968',
    price: 1800,
    category: 'Homeware',
    availableColors: ['Black', 'White'],
    availableSizes: ['Small', 'Large'],
    rating: 3.5,
    numOfReviews: 6,
    availability: {
      Black: {
        Small: 'in stock',
        Large: 'out of stock',
      },
      White: {
        Small: 'in stock',
        Large: 'in stock',
      },
    },
    highlights: [
      'Rust-resistant coating',
      'Tool-free assembly',
      'Space-saving design',
      'Sturdy shelf construction',
      'Versatile home use',
    ],
  },
  {
    id: 8,
    name: 'Electric Blender',
    description: 'High-speed blender for smoothies and shakes.',
    details: 'Features stainless steel blades and a shatterproof jug. Multiple speed settings. Easy to clean. Made in Sri Lanka. Ideal for smoothies, sauces, and crushed ice with a convenient pulse function for precise control. Detachable parts are top-rack dishwasher safe; do not operate continuously for more than 2 minutes without rest.',
    image: 'https://png.pngtree.com/png-vector/20240120/ourmid/pngtree-blender-png-image_11050000.png',
    price: 3500,
    category: 'Electrical Items',
    availableColors: ['Silver', 'Black'],
    availableSizes: ['1.2L', '2L'],
    review: 4.4,
    availability: {
      Silver: {
        '1.2L': 'in stock',
        '2L': 'out of stock',
      },
      Black: {
        '1.2L': 'in stock',
        '2L': 'in stock',
      },
    },
    highlights: [
      'Stainless steel blades',
      'Multiple speed modes',
      'Shatterproof jug',
      'Pulse control',
      'Easy-clean design',
    ],
  },
  {
    id: 9,
    name: 'Kitchen Knife Set',
    description: 'Premium stainless steel knife set.',
    details: 'Knives made from high-carbon stainless steel for sharpness and durability. Ergonomic handles. Dishwasher safe. Made in Sri Lanka. Balanced weight for comfortable handling and long-lasting edges for everyday prep. For best results, hand-wash and dry immediately; hone regularly to maintain the cutting edge.',
    image: 'https://png.pngtree.com/png-vector/20240125/ourmid/pngtree-knife-set-png-image_11100000.png',
    price: 950,
    category: 'Kitchen Appliences',
    availableColors: ['Silver', 'Black'],
    availableSizes: ['Standard'],
    review: 4.7,
    availability: {
      Silver: {
        Standard: 'out of stock',
      },
      Black: {
        Standard: 'out of stock',
      },
    },
    highlights: [
      'High-carbon steel blades',
      'Ergonomic grip handles',
      'Dishwasher safe',
      'Precision edge retention',
      'Balanced for control',
    ],
  },
  {
    id: 10,
    name: 'Plastic Water Jug',
    description: 'Large capacity water jug for home use.',
    details: 'Made from BPA-free, food-grade plastic. Features a sturdy handle and spill-proof lid. Suitable for cold and hot beverages. Made in Sri Lanka. Lightweight yet durable design for daily hydration at home or the office. Not for use on stovetops; hand-wash recommended to preserve clarity.',
    image: 'https://png.pngtree.com/png-vector/20240130/ourmid/pngtree-water-jug-png-image_11150000.png',
    price: 600,
    category: 'Plastic Products',
    availableColors: ['Blue', 'Clear'],
    availableSizes: ['2L', '5L'],
    review: 4.1,
    availability: {
      Blue: {
        '2L': 'in stock',
        '5L': 'out of stock',
      },
      Clear: {
        '2L': 'in stock',
        '5L': 'in stock',
      },
    },
    highlights: [
      'BPA-free plastic',
      'Spill-proof lid',
      'Sturdy carry handle',
      'Hot & cold friendly',
      'Easy to clean',
    ],
  },
  {
    id: 11,
    name: 'Stationary Organizer',
    description: 'Desk organizer for stationary items.',
    details: 'Made from durable plastic and metal mesh. Multiple compartments for pens, notes, and accessories. Non-slip base. Made in Sri Lanka. Keeps desks tidy and essentials within reach for better productivity. Compact size fits most workspaces; wipe with a damp cloth to clean.',
    image: 'https://png.pngtree.com/png-clipart/20240115/original/pngtree-desk-organizer-png-image_11200000.png',
    price: 400,
    category: 'Stationery Items',
    availableColors: ['Black', 'White', 'Blue'],
    availableSizes: ['Standard'],
    review: 4.5,
    availability: {
      Black: {
        Standard: 'in stock',
      },
      White: {
        Standard: 'in stock',
      },
      Blue: {
        Standard: 'out of stock',
      },
    },
    highlights: [
      'Multi-compartment layout',
      'Durable mesh build',
      'Non-slip base',
      'Compact footprint',
      'Easy desk organization',
    ],
  },
  {
    id: 12,
    name: 'Cleaning Mop',
    description: 'Easy-to-use mop for efficient cleaning.',
    details: 'Microfiber mop head for superior cleaning. Lightweight aluminum handle. Washable and reusable. Made in Sri Lanka. Gentle on floors yet effective at trapping dust and dirt for spotless results. Suitable for tile, vinyl, and sealed wood floors; machine-wash mop head on gentle cycle.',
    image: 'https://png.pngtree.com/png-vector/20240205/ourmid/pngtree-mop-png-image_11300000.png',
    price: 700,
    category: 'Cleaning Supplies',
    availableColors: ['Blue', 'Green'],
    availableSizes: ['Standard'],
    review: 4.2,
    availability: {
      Blue: {
        Standard: 'in stock',
      },
      Green: {
        Standard: 'in stock',
      },
    },
    highlights: [
      'Microfiber head',
      'Lightweight handle',
      'Washable & reusable',
      'Gentle on floors',
      'Effective dust pickup',
    ],
  },
  {
    id: 13,
    name: 'Kitchen Apron',
    description: 'Protective apron for kitchen use.',
    details: 'Made from 100% cotton fabric. Adjustable neck and waist straps. Machine washable. Made in Sri Lanka. Comfortable to wear for long cooking sessions with ample front coverage. Breathable weave helps keep you cool; wash with similar colors to maintain vibrancy.',
    image: 'https://png.pngtree.com/png-vector/20240210/ourmid/pngtree-apron-png-image_11350000.png',
    price: 350,
    category: 'Kitchen Appliences',
    availableColors: ['Red', 'Blue', 'Green'],
    availableSizes: ['Small', 'Medium', 'Large'],
    review: 4.6,
    availability: {
      Red: {
        Small: 'in stock',
        Medium: 'out of stock',
        Large: 'in stock',
      },
      Blue: {
        Small: 'in stock',
        Medium: 'in stock',
        Large: 'out of stock',
      },
      Green: {
        Small: 'out of stock',
        Medium: 'in stock',
        Large: 'in stock',
      },
    },
    highlights: [
      '100% cotton fabric',
      'Adjustable straps',
      'Machine washable',
      'Comfortable full coverage',
      'Everyday kitchen wear',
    ],
  },
  {
    id: 14,
    name: 'Plastic Lunch Box',
    description: 'Microwave-safe lunch box for school and office.',
    details: 'Made from BPA-free, microwave-safe plastic. Leak-proof design. Easy to clean and carry. Made in Sri Lanka. Ideal for school, office, or picnics with secure clips to prevent spills. Remove lid before microwaving; freezer-safe for meal prep and leftovers.',
    image: 'https://png.pngtree.com/png-vector/20240215/ourmid/pngtree-lunch-box-png-image_11400000.png',
    price: 250,
    category: 'Plastic Products',
    availableColors: ['Pink', 'Blue', 'Green'],
    availableSizes: ['Small', 'Medium'],
    review: 4.3,
    availability: {
      Pink: {
        Small: 'in stock',
        Medium: 'out of stock',
      },
      Blue: {
        Small: 'in stock',
        Medium: 'in stock',
      },
      Green: {
        Small: 'out of stock',
        Medium: 'in stock',
      },
    },
    highlights: [
      'Microwave-safe',
      'Leak-proof seal',
      'BPA-free plastic',
      'Portable & lightweight',
      'Easy to clean',
    ],
  },
  {
    id: 15,
    name: 'Stationary Highlighter Set',
    description: 'Set of colorful highlighters for marking.',
    details: 'Non-toxic, quick-drying ink. Chisel tip for broad and fine lines. Assorted colors. Made in Sri Lanka. Perfect for notes, textbooks, and planners with minimal smudging. Long-lasting ink with vented caps for safety; store horizontally to preserve ink flow.',
    image: 'https://png.pngtree.com/png-clipart/20240220/original/pngtree-highlighter-set-png-image_11450000.png',
    price: 180,
    category: 'Stationery Items',
    availableColors: ['Assorted'],
    availableSizes: ['Standard'],
    review: 4.7,
    availability: {
      Assorted: {
        Standard: 'in stock',
      },
    },
    highlights: [
      'Quick-dry ink',
      'Chisel tip lines',
      'Smear-resistant',
      'Vibrant assorted colors',
      'Long-lasting markers',
    ],
  },
]

// Mock orders referencing products defined above
export const orders = [
  {
    id: "1001A",
    customerId: "CUST-1001A",
    customerName: "Kasun Perera",
    customer: { id: "CUST-1001A", name: "Kasun Perera" },
    placed: "2025-07-28",
    placedTime: "14:32",
    status: "Delivered",
    address: [
      "Kasun Perera",
      "No. 54/3, Temple Road",
      "Maharagama, Colombo 10280",
    ],
    shippingUpdates: {
      email: "kasun.perera@gmail.com",
      phone: "0771234789",
    },
    items: [
      {
        productId: 2, // Kitchen Set
        quantity: 1,
        price: 1200,
        color: "Black",
        size: "Medium",
        status: { text: "Delivered on July 30, 2025", progress: 3 },
      },
      {
        productId: 12, // Cleaning Mop
        quantity: 2,
        price: 700,
        color: "Blue",
        size: "Standard",
        status: { text: "Delivered on July 30, 2025", progress: 3 },
      },
    ],
    billing: {
      address: [
        "Kasun Perera",
        "No. 54/3, Temple Road",
        "Maharagama, Colombo 10280",
      ],
      payment: { type: "Visa", last4: "4242", expires: "02 / 27" },
      summary: { subtotal: 2600, shipping: 450, tax: 0, total: 3050 },
    },
    // Order-level timestamps for each status step (same for all items in the order)
    statusTimes: {
      placed: { date: "2025-07-28", time: "14:32" },
      processing: { date: "2025-07-29", time: "10:00" },
      shipped: { date: "2025-07-30", time: "09:15" },
      delivered: { date: "2025-07-30", time: "12:45" },
    },
  },
  {
    id: "1002B",
    customerId: "CUST-1002B",
    customerName: "Nadeesha Fernando",
    customer: { id: "CUST-1002B", name: "Nadeesha Fernando" },
    placed: "2025-08-15",
    placedTime: "09:15",
    status: "Shipped",
    address: [
      "Nadeesha Fernando",
      "Apartment 12B, Lotus Grove",
      "Galle Road, Dehiwala 10350",
    ],
    shippingUpdates: {
      email: "nadeesha.fernando@yahoo.com",
      phone: "0771234233",
    },
    items: [
      {
        productId: 10, // Plastic Water Jug
        quantity: 1,
        price: 600,
        color: "Clear",
        size: "2L",
        status: { text: "Shipped on Aug 16, 2025", progress: 2 },
      },
      {
        productId: 8, // Electric Blender
        quantity: 1,
        price: 3500,
        color: "Black",
        size: "2L",
        status: { text: "Preparing to ship", progress: 1 },
      },
    ],
    billing: {
      address: [
        "Nadeesha Fernando",
        "Apartment 12B, Lotus Grove",
        "Galle Road, Dehiwala 10350",
      ],
      payment: { type: "Visa", last4: "8812", expires: "09 / 26" },
      summary: { subtotal: 4100, shipping: 550, tax: 0, total: 4650 },
    },
    statusTimes: {
      placed: { date: "2025-08-15", time: "09:15" },
      processing: { date: "2025-08-15", time: "13:00" },
      shipped: { date: "2025-08-16", time: "08:20" },
      delivered: null,
    },
  },
  {
    id: "1003C",
    customerId: "CUST-1003C",
    customerName: "Tharindu Jayasinghe",
    customer: { id: "CUST-1003C", name: "Tharindu Jayasinghe" },
    placed: "2025-09-05",
    placedTime: "18:47",
    status: "Processing",
    address: [
      "Tharindu Jayasinghe",
      "No. 22, Lake View Gardens",
      "Kandy 20000",
    ],
    shippingUpdates: {
      email: "tharindu.jayasinghe@outlook.com",
      phone: "0771234542",
    },
    items: [
      {
        productId: 6, // Electric Kettle
        quantity: 1,
        price: 2200,
        color: "Silver",
        size: "1.5L",
        status: { text: "Processing your order", progress: 1 },
      },
      {
        productId: 14, // Plastic Lunch Box
        quantity: 3,
        price: 250,
        color: "Blue",
        size: "Medium",
        status: { text: "Order placed on Sep 5, 2025", progress: 0 },
      },
    ],
    billing: {
      address: [
        "Tharindu Jayasinghe",
        "No. 22, Lake View Gardens",
        "Kandy 20000",
      ],
      payment: { type: "Visa", last4: "1123", expires: "01 / 28" },
      summary: { subtotal: 2950, shipping: 500, tax: 0, total: 3450 },
    },
    statusTimes: {
      placed: { date: "2025-09-05", time: "18:47" },
      processing: { date: "2025-09-06", time: "09:00" },
      shipped: null,
      delivered: null,
    },
  },
];

const data = {
  products,
  categories,
  orders,
}

export default data;