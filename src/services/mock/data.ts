import type {
  AdminUser,
  AppNotification,
  Category,
  Order,
  Payment,
  Product,
  Review,
} from "@/types/api"

/**
 * In-memory seed data for the mock backend. Product images map to generated
 * assets in /public/products. Data is intentionally rich so every page renders
 * a realistic, populated UI.
 */

export const categories: Category[] = [
  { id: 1, name: "Audio", description: "Headphones, earbuds & speakers", createdAt: "2024-01-04T10:00:00Z" },
  { id: 2, name: "Wearables", description: "Smart watches & fitness bands", createdAt: "2024-01-06T10:00:00Z" },
  { id: 3, name: "Computers", description: "Laptops, keyboards & peripherals", createdAt: "2024-01-08T10:00:00Z" },
  { id: 4, name: "Home", description: "Smart home & living essentials", createdAt: "2024-01-10T10:00:00Z" },
  { id: 5, name: "Fitness", description: "Training gear & recovery", createdAt: "2024-01-12T10:00:00Z" },
  { id: 6, name: "Accessories", description: "Bags, chargers & everyday carry", createdAt: "2024-01-14T10:00:00Z" },
  { id: 7, name: "Gaming", description: "Consoles, controllers & gear", createdAt: "2024-01-16T10:00:00Z" },
  { id: 8, name: "Cameras", description: "Mirrorless, action & drones", createdAt: "2024-01-18T10:00:00Z" },
]

type Seed = Omit<Product, "id" | "categoryName" | "createdAt" | "active"> & {
  categoryName: string
  brand: string
}

const seeds: Seed[] = [
  { name: "Aura Pro Wireless Earbuds", description: "Active noise cancelling earbuds with adaptive transparency and 30-hour battery.", price: 149, imageUrl: "/products/earbuds.png", categoryId: 1, categoryName: "Audio", brand: "Aura" },
  { name: "Resonance Studio Headphones", description: "Reference-grade over-ear headphones with spatial audio and memory-foam cups.", price: 299, imageUrl: "/products/headphones.png", categoryId: 1, categoryName: "Audio", brand: "Resonance" },
  { name: "Pulse Portable Speaker", description: "360-degree room-filling sound, IP67 waterproof, 24-hour playtime.", price: 89, imageUrl: "/products/speaker.png", categoryId: 1, categoryName: "Audio", brand: "Pulse" },
  { name: "Vertex Smartwatch Series 7", description: "AMOLED always-on display, ECG, SpO2 and 7-day battery life.", price: 329, imageUrl: "/products/smartwatch.png", categoryId: 2, categoryName: "Wearables", brand: "Vertex" },
  { name: "Stride Fitness Band", description: "Slim activity tracker with sleep insights and 14-day battery.", price: 59, imageUrl: "/products/fitnessband.png", categoryId: 2, categoryName: "Wearables", brand: "Stride" },
  { name: "Nimbus 14 Ultrabook", description: "14-inch OLED, next-gen silicon, 18-hour battery in a 1.1kg chassis.", price: 1299, imageUrl: "/products/laptop.png", categoryId: 3, categoryName: "Computers", brand: "Nimbus" },
  { name: "Clackt Mechanical Keyboard", description: "Hot-swappable 75% board with gasket mount and PBT keycaps.", price: 139, imageUrl: "/products/keyboard.png", categoryId: 3, categoryName: "Computers", brand: "Clackt" },
  { name: "Glide Wireless Mouse", description: "Featherlight 58g ergonomic mouse with 8K polling and USB-C.", price: 79, imageUrl: "/products/mouse.png", categoryId: 3, categoryName: "Computers", brand: "Glide" },
  { name: "Halo Smart Lamp", description: "16M-color ambient desk lamp with circadian scheduling and app control.", price: 69, imageUrl: "/products/lamp.png", categoryId: 4, categoryName: "Home", brand: "Halo" },
  { name: "Breeze Air Purifier", description: "HEPA-13 purifier covering 60m2 with real-time air-quality sensing.", price: 199, imageUrl: "/products/purifier.png", categoryId: 4, categoryName: "Home", brand: "Breeze" },
  { name: "Terra Insulated Bottle", description: "Double-wall stainless bottle keeping drinks cold 24h / hot 12h.", price: 34, imageUrl: "/products/bottle.png", categoryId: 5, categoryName: "Fitness", brand: "Terra" },
  { name: "Flux Adjustable Dumbbells", description: "5-52.5 lb per hand, dial-a-weight system with a compact footprint.", price: 349, imageUrl: "/products/dumbbells.png", categoryId: 5, categoryName: "Fitness", brand: "Flux" },
  { name: "Carry Everyday Backpack", description: "Weatherproof 22L commuter pack with a padded 16-inch laptop bay.", price: 129, imageUrl: "/products/backpack.png", categoryId: 6, categoryName: "Accessories", brand: "Carry" },
  { name: "Volt 100W GaN Charger", description: "Compact 3-port GaN charger that powers a laptop and two phones at once.", price: 65, imageUrl: "/products/charger.png", categoryId: 6, categoryName: "Accessories", brand: "Volt" },
  { name: "Arcade Pro Controller", description: "Low-latency wireless controller with hall-effect sticks and back paddles.", price: 119, imageUrl: "/products/controller.png", categoryId: 7, categoryName: "Gaming", brand: "Arcade" },
  { name: "Lumen Mirrorless Camera", description: "26MP APS-C mirrorless body with in-body stabilization and 4K60 video.", price: 899, imageUrl: "/products/camera.png", categoryId: 8, categoryName: "Cameras", brand: "Lumen" },
]

let productIdCounter = 1
export const products: Product[] = seeds.flatMap((seed, groupIndex) =>
  // create 2-3 variants per seed for a fuller catalog
  Array.from({ length: 2 + (groupIndex % 2) }).map((_, i) => {
    const id = productIdCounter++
    const editions = ["", " — Graphite", " — Special Edition", " — Midnight"]
    const priceJitter = i * 20
    return {
      id,
      name: `${seed.name}${editions[i] ?? ""}`,
      description: seed.description,
      price: seed.price + priceJitter,
      imageUrl: seed.imageUrl,
      active: id % 11 !== 0,
      categoryId: seed.categoryId,
      categoryName: seed.categoryName,
      createdAt: new Date(2024, 5, (id % 27) + 1, 9, 30).toISOString(),
    } satisfies Product
  }),
)

/** UI-only brand map keyed by product id. TODO: backend endpoint pending. */
export const productBrand: Record<number, string> = {}
{
  let idx = 1
  seeds.forEach((seed, groupIndex) => {
    const count = 2 + (groupIndex % 2)
    for (let i = 0; i < count; i++) productBrand[idx++] = seed.brand
  })
}

export const reviewsByProduct: Record<number, Review[]> = {}
const reviewers = ["Jordan M.", "Priya S.", "Alex T.", "Sam K.", "Noah R.", "Elena V.", "Chris D."]
const comments = [
  "Exceeded my expectations. Build quality feels premium.",
  "Great value for the price. Would buy again.",
  "Works flawlessly, setup took two minutes.",
  "Solid product, though shipping took a little longer than hoped.",
  "Absolutely love it — a daily driver now.",
  "Does exactly what it promises. No complaints.",
]
products.forEach((p) => {
  const count = (p.id % 5) + 1
  reviewsByProduct[p.id] = Array.from({ length: count }).map((_, i) => ({
    id: p.id * 100 + i,
    productId: p.id,
    reviewerName: reviewers[(p.id + i) % reviewers.length],
    rating: 3 + ((p.id + i) % 3),
    comment: comments[(p.id + i) % comments.length],
    createdAt: new Date(2024, 7, ((p.id + i) % 27) + 1).toISOString(),
  }))
})

export const orders: Order[] = [
  {
    id: 1001,
    status: "DELIVERED",
    totalAmount: 448,
    createdAt: "2024-08-02T14:20:00Z",
    items: [
      { productId: 1, productName: products[0].name, quantity: 1, unitPrice: 149, subtotal: 149 },
      { productId: 3, productName: products[2].name, quantity: 1, unitPrice: 299, subtotal: 299 },
    ],
  },
  {
    id: 1002,
    status: "SHIPPED",
    totalAmount: 329,
    createdAt: "2024-09-11T09:05:00Z",
    items: [{ productId: 8, productName: products[7]?.name ?? "Vertex Smartwatch", quantity: 1, unitPrice: 329, subtotal: 329 }],
  },
  {
    id: 1003,
    status: "PLACED",
    totalAmount: 218,
    createdAt: "2024-10-01T18:45:00Z",
    items: [
      { productId: 11, productName: products[10]?.name ?? "Halo Smart Lamp", quantity: 2, unitPrice: 69, subtotal: 138 },
      { productId: 13, productName: products[12]?.name ?? "Terra Bottle", quantity: 1, unitPrice: 80, subtotal: 80 },
    ],
  },
  {
    id: 1004,
    status: "CANCELLED",
    totalAmount: 79,
    createdAt: "2024-10-06T12:10:00Z",
    items: [{ productId: 14, productName: products[13]?.name ?? "Glide Mouse", quantity: 1, unitPrice: 79, subtotal: 79 }],
  },
]

export const payments: Payment[] = [
  { id: 5001, orderId: 1001, status: "SUCCESS", amount: 448, providerRef: "pay_9f2ab77", createdAt: "2024-08-02T14:21:00Z" },
  { id: 5002, orderId: 1002, status: "SUCCESS", amount: 329, providerRef: "pay_1c8de41", createdAt: "2024-09-11T09:06:00Z" },
]

export const notifications: AppNotification[] = [
  { id: 9001, title: "Order delivered", message: "Your order #1001 was delivered. Rate your products!", read: false, createdAt: "2024-08-04T16:00:00Z" },
  { id: 9002, title: "Flash sale live", message: "Up to 40% off Audio for the next 6 hours.", read: false, createdAt: "2024-10-02T08:00:00Z" },
  { id: 9003, title: "Price drop", message: "An item on your wishlist just dropped in price.", read: true, createdAt: "2024-09-28T11:30:00Z" },
  { id: 9004, title: "Welcome to X Cart", message: "Thanks for joining. Here's 10% off your first order: XCART10.", read: true, createdAt: "2024-07-20T10:00:00Z" },
]

export const adminUsers: AdminUser[] = [
  { id: 1, name: "Ava Customer", email: "customer@xcart.shop", roles: ["ROLE_CUSTOMER"], enabled: true },
  { id: 2, name: "Site Admin", email: "admin@xcart.shop", roles: ["ROLE_ADMIN"], enabled: true },
  { id: 3, name: "Liam Chen", email: "liam@example.com", roles: ["ROLE_CUSTOMER"], enabled: true },
  { id: 4, name: "Maya Rossi", email: "maya@example.com", roles: ["ROLE_CUSTOMER"], enabled: false },
  { id: 5, name: "Owen Park", email: "owen@example.com", roles: ["ROLE_CUSTOMER", "ROLE_ADMIN"], enabled: true },
]

/** Inventory quantities keyed by product id. */
export const inventory: Record<number, number> = {}
products.forEach((p) => {
  inventory[p.id] = (p.id * 7) % 40
})
