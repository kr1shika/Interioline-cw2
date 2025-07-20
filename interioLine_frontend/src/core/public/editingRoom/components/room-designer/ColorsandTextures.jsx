export const wallColors = [
    { name: "Pure White", value: "#ffffff", category: "neutral" },
    { name: "Off White", value: "#f8f8f8", category: "neutral" },
    { name: "Ivory", value: "#fffff0", category: "neutral" },
    { name: "Warm Beige", value: "#f5f0e1", category: "neutral" },
    { name: "Light Gray", value: "#e5e5e5", category: "neutral" },
    { name: "Medium Gray", value: "#c0c0c0", category: "neutral" },
    { name: "Charcoal", value: "#4a4a4a", category: "neutral" },
    { name: "Cream", value: "#f5f5dc", category: "neutral" },

    { name: "Sky Blue", value: "#87ceeb", category: "blue" },
    { name: "Powder Blue", value: "#b0c4de", category: "blue" },
    { name: "Soft Blue", value: "#b3d9ff", category: "blue" },
    { name: "Steel Blue", value: "#4682b4", category: "blue" },
    { name: "Navy Blue", value: "#1e3a8a", category: "blue" },
    { name: "Teal", value: "#008080", category: "blue" },

    { name: "Mint Green", value: "#c7eacc", category: "green" },
    { name: "Sage Green", value: "#9caf88", category: "green" },
    { name: "Forest Green", value: "#2d5016", category: "green" },
    { name: "Olive", value: "#6b8e23", category: "green" },
    { name: "Seafoam", value: "#93e9be", category: "green" },

    { name: "Pale Yellow", value: "#fff9c4", category: "warm" },
    { name: "Butter Yellow", value: "#f0e68c", category: "warm" },
    { name: "Peach", value: "#ffcba4", category: "warm" },
    { name: "Light Pink", value: "#ffd6d6", category: "warm" },
    { name: "Blush Pink", value: "#ffb6c1", category: "warm" },
    { name: "Coral", value: "#ff7f7f", category: "warm" },
    { name: "Terracotta", value: "#e2725b", category: "warm" },
    { name: "Warm Sand", value: "#c19a6b", category: "warm" },

    { name: "Burgundy", value: "#722f37", category: "deep" },
    { name: "Deep Purple", value: "#483d8b", category: "deep" },
    { name: "Forest Green", value: "#355e3b", category: "deep" },
    { name: "Midnight Blue", value: "#191970", category: "deep" },
];

export const floorColors = [
    {
        name: "Parquet Wood",
        value: "#d8a75e",
        category: "wood",
        texture: "parquet"
    },
    {
        name: "Mosaic Tile",
        value: "#e8dcc6",
        category: "tile",
        texture: "mosaic"
    },
    // existing floor colors...
];


export const carpets = [
    {
        id: "persian_red",
        name: "Persian Traditional Red",
        color: "#8b0000",
        texture:
            "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
        pattern: "traditional",
        dimensions: { width: 2.4, depth: 1.6, height: 0.02 },
        description: "Classic Persian rug with intricate red patterns",
        style: "Traditional",
        material: "Wool",
    },
    {
        id: "persian_blue",
        name: "Persian Traditional Blue",
        color: "#1e3a8a",
        texture:
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
        pattern: "traditional",
        dimensions: { width: 3.0, depth: 2.0, height: 0.02 },
        description: "Elegant blue Persian rug with ornate designs",
        style: "Traditional",
        material: "Wool",
    },
    {
        id: "oriental_beige",
        name: "Oriental Beige Vintage",
        color: "#d2b48c",
        texture:
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        pattern: "oriental",
        dimensions: { width: 2.0, depth: 3.0, height: 0.02 },
        description: "Vintage-style oriental rug in warm beige tones",
        style: "Traditional",
        material: "Cotton/Wool",
    },

    // Modern Rugs
    {
        id: "modern_geometric_gray",
        name: "Modern Geometric Gray",
        color: "#708090",
        texture:
            "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop",
        pattern: "geometric",
        dimensions: { width: 2.5, depth: 2.5, height: 0.02 },
        description: "Contemporary geometric pattern in neutral gray",
        style: "Modern",
        material: "Synthetic",
    },
    {
        id: "modern_abstract_multicolor",
        name: "Abstract Multicolor",
        color: "#ff6b6b",
        texture:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        pattern: "abstract",
        dimensions: { width: 2.0, depth: 2.8, height: 0.02 },
        description: "Bold abstract design with vibrant colors",
        style: "Modern",
        material: "Synthetic",
    },
    {
        id: "minimalist_white",
        name: "Minimalist White",
        color: "#f8f8f8",
        texture:
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop",
        pattern: "solid",
        dimensions: { width: 2.0, depth: 1.4, height: 0.02 },
        description: "Clean minimalist white rug for modern spaces",
        style: "Modern",
        material: "Cotton",
    },

    {
        id: "jute_natural",
        name: "Natural Jute",
        color: "#deb887",
        texture:
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        pattern: "natural",
        dimensions: { width: 2.4, depth: 1.8, height: 0.03 },
        description: "Eco-friendly jute rug with natural texture",
        style: "Natural",
        material: "Jute",
    },
    {
        id: "sisal_beige",
        name: "Sisal Natural Beige",
        color: "#c8b99c",
        texture:
            "https://images.unsplash.com/photo-1586296835409-fe3fe6b35b56?w=400&h=400&fit=crop",
        pattern: "natural",
        dimensions: { width: 3.0, depth: 2.0, height: 0.02 },
        description: "Durable sisal rug in natural beige",
        style: "Natural",
        material: "Sisal",
    },

    {
        id: "shag_cream",
        name: "Luxury Shag Cream",
        color: "#faf0e6",
        texture:
            "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&h=400&fit=crop",
        pattern: "shag",
        dimensions: { width: 2.0, depth: 1.4, height: 0.05 },
        description: "Plush shag rug in creamy white",
        style: "Contemporary",
        material: "Polyester",
    },
    {
        id: "shag_gray",
        name: "Soft Shag Gray",
        color: "#a9a9a9",
        texture:
            "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop",
        pattern: "shag",
        dimensions: { width: 1.8, depth: 1.8, height: 0.04 },
        description: "Cozy gray shag rug perfect for living areas",
        style: "Contemporary",
        material: "Polyester",
    },

    {
        id: "round_mandala",
        name: "Mandala Round Rug",
        color: "#8b4513",
        texture:
            "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=400&fit=crop",
        pattern: "mandala",
        dimensions: { width: 2.0, depth: 2.0, height: 0.02 },
        isRound: true,
        description: "Beautiful mandala pattern round rug",
        style: "Bohemian",
        material: "Cotton",
    },
    {
        id: "round_solid_navy",
        name: "Navy Blue Round",
        color: "#1e3a8a",
        texture:
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        pattern: "solid",
        dimensions: { width: 1.8, depth: 1.8, height: 0.02 },
        isRound: true,
        description: "Solid navy blue round rug",
        style: "Modern",
        material: "Wool",
    },

    {
        id: "runner_striped",
        name: "Striped Hallway Runner",
        color: "#4682b4",
        texture:
            "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop",
        pattern: "striped",
        dimensions: { width: 0.8, depth: 3.0, height: 0.02 },
        description: "Classic striped runner for hallways",
        style: "Traditional",
        material: "Cotton",
    },
    {
        id: "runner_geometric",
        name: "Geometric Pattern Runner",
        color: "#2d3748",
        texture:
            "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
        pattern: "geometric",
        dimensions: { width: 0.9, depth: 2.5, height: 0.02 },
        description: "Modern geometric runner rug",
        style: "Modern",
        material: "Synthetic",
    },

    {
        id: "vintage_distressed",
        name: "Vintage Distressed Blue",
        color: "#4169e1",
        texture:
            "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        pattern: "vintage",
        dimensions: { width: 2.4, depth: 1.6, height: 0.02 },
        description: "Beautifully aged vintage-style rug",
        style: "Vintage",
        material: "Cotton/Polyester",
    },

    {
        id: "kids_rainbow",
        name: "Rainbow Play Rug",
        color: "#ff69b4",
        texture:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        pattern: "rainbow",
        dimensions: { width: 1.8, depth: 1.2, height: 0.02 },
        description: "Colorful rainbow rug perfect for kids rooms",
        style: "Playful",
        material: "Synthetic",
    },
];

// ColorsandTextures.jsx
export const wallTextures = [
    { id: "smooth", name: "Smooth Plaster", description: "Basic smooth finish" },
    { id: "brick", name: "Brick Wall", description: "Classic red brick" },
    { id: "concrete", name: "Concrete", description: "Raw industrial look" },
];

export const floorTextures = [
    { id: "parquet", name: "Parquet Wood", description: "Elegant wood parquet" },
    { id: "mosaic", name: "Mosaic Tile", description: "Colorful mosaic tiles" },
    { id: "marble", name: "Marble", description: "Polished marble stone" },
];

export const lightingOptions = [
    {
        name: "Warm White",
        temperature: 3000,
        intensity: 1.0,
        description: "Cozy, relaxing atmosphere",
    },
    {
        name: "Soft White",
        temperature: 3500,
        intensity: 1.2,
        description: "Comfortable everyday lighting",
    },
    {
        name: "Bright White",
        temperature: 4000,
        intensity: 1.5,
        description: "Clear, energizing light",
    },
    {
        name: "Cool White",
        temperature: 5000,
        intensity: 1.8,
        description: "Crisp, focused lighting",
    },
    {
        name: "Daylight",
        temperature: 6500,
        intensity: 2.0,
        description: "Natural daylight simulation",
    },
];