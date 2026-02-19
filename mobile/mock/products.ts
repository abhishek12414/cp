export const products = [
  {
    id: "1",
    name: "Philips 9W LED Bulb",
    description:
      "Energy-efficient LED bulb with warm white light, perfect for home use.",
    price: 299,
    discountPrice: 249,
    image:
      "https://images.unsplash.com/photo-1560401850-bd48700f369f?q=80&w=300",
    brandId: "1",
    categoryId: "1",
    stock: 100,
    sku: "PH-LED-9W",
  },
  {
    id: "2",
    name: "Havells 3 Core Flexible Wire (10m)",
    description:
      "High-quality flexible cable for home and industrial use. Fire-resistant and durable.",
    price: 599,
    image:
      "https://images.unsplash.com/photo-1622372738946-62e2b7489b00?q=80&w=300",
    brandId: "2",
    categoryId: "2",
    stock: 80,
    sku: "HV-WIRE-10M",
  },
  {
    id: "3",
    name: "Anchor 6A Switch (Pack of 5)",
    description:
      "Premium quality electric switches with indicator. Sleek design and long-lasting.",
    price: 350,
    discountPrice: 299,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=300",
    brandId: "8",
    categoryId: "3",
    stock: 150,
    sku: "ANC-SW-6A-5",
  },
  {
    id: "4",
    name: "Havells MCB 32A Single Pole",
    description:
      "Circuit breaker with overload and short circuit protection. Easy installation.",
    price: 450,
    image:
      "https://img.texmart.pk/75521-thickbox_default/mcb-single-pole-32a.jpg",
    brandId: "2",
    categoryId: "4",
    stock: 60,
    sku: "HV-MCB-32A",
  },
  {
    id: "5",
    name: "Syska Decorative String Lights",
    description:
      "LED string lights for festivals and home decoration. Energy-efficient with multiple modes.",
    price: 699,
    discountPrice: 599,
    image:
      "https://images.unsplash.com/photo-1599619585752-c3edb42a414c?q=80&w=300",
    brandId: "5",
    categoryId: "5",
    stock: 45,
    sku: "SY-STRG-20L",
  },
  {
    id: "6",
    name: "Crompton 20W LED Tube Light",
    description:
      "Bright and energy-efficient tube light with long life span. Ideal for homes and offices.",
    price: 599,
    image:
      "https://images.unsplash.com/photo-1509515387233-5c4ca982172c?q=80&w=300",
    brandId: "3",
    categoryId: "6",
    stock: 75,
    sku: "CR-TL-20W",
  },
  {
    id: "7",
    name: "Orient 1200mm Ceiling Fan",
    description:
      "High-speed ceiling fan with decorative finish. Energy-efficient with smooth operation.",
    price: 2499,
    discountPrice: 2199,
    image:
      "https://images.unsplash.com/photo-1586487141765-1030ed172572?q=80&w=300",
    brandId: "6",
    categoryId: "7",
    stock: 30,
    sku: "OR-CF-1200",
  },
  {
    id: "8",
    name: "Bajaj 15L Storage Water Geyser",
    description:
      "Instant water heating with safety features. Rust-proof body with elegant design.",
    price: 7999,
    discountPrice: 6999,
    image:
      "https://images.unsplash.com/photo-1587387119725-9d6bac0f22fb?q=80&w=300",
    brandId: "4",
    categoryId: "8",
    stock: 20,
    sku: "BJ-GY-15L",
  },
  {
    id: "9",
    name: "Supreme 1-inch PVC Pipe (3m)",
    description:
      "High-quality PVC pipe for plumbing and electrical installations. UV-resistant and durable.",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1521207418485-99c705420785?q=80&w=300",
    brandId: "2", // Using Havells as a placeholder
    categoryId: "9",
    stock: 120,
    sku: "SUP-PVC-1IN-3M",
  },
];

export const deals = [
  {
    id: "deal1",
    title: "LED Smart Bulb 8W",
    subtitle: "Starting from $4.99",
    badge: "25% OFF",
    productId: "p1",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
  },
  {
    id: "deal2",
    title: "MCB Switches",
    subtitle: "Premium Quality",
    badge: "30% OFF",
    productId: "p2",
    image: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=400",
  },
];

export const trendingCategories = [
  {
    id: "cat-led",
    name: "LED Lighting",
    productsCount: 2847,
    trend: "+23%",
    icon: "bulb",
  },
  {
    id: "cat-switch",
    name: "Smart Switches",
    productsCount: 1234,
    trend: "+18%",
    icon: "flash",
  },
  {
    id: "cat-circuit",
    name: "Circuit Protection",
    productsCount: 987,
    trend: "+15%",
    icon: "shield-checkmark",
  },
];

export const recentlyViewed = [
  {
    id: "rv1",
    title: "LED Bulb",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
  },
  {
    id: "rv2",
    title: "2-Way Switch",
    price: 15.49,
    image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400",
  },
  {
    id: "rv3",
    title: "Copper Wire",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1581091870627-3a440bfee2d4?w=400",
  },
  {
    id: "rv4",
    title: "Smart Outlet",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1586201375754-1421be23fd55?w=400",
  },
];

export const recommendedProducts = [
  {
    id: "rec1",
    title: "Premium Socket Outlet",
    price: 22.99,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400",
  },
  {
    id: "rec2",
    title: 'Ceiling Fan 48"',
    price: 135.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400",
  },
  {
    id: "rec3",
    title: "Power Strip 6-Out",
    price: 34.99,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400",
  },
];

export const services = [
  {
    id: "svc1",
    icon: "construct",
    title: "Installation",
    subtitle: "Professional setup",
  },
  {
    id: "svc2",
    icon: "help-buoy",
    title: "Support",
    subtitle: "24/7 assistance",
  },
  {
    id: "svc3",
    icon: "document-text",
    title: "Warranty",
    subtitle: "Extended plans",
  },
];
