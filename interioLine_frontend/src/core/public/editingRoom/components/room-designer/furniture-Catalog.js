import * as THREE from "three";

export const furnitureCatalog = [
    {
        id: 'couch',
        name: 'Modern Couch',
        type: 'sofa',
        category: 'seating',
        dimensions: { width: 6.5, height: 4.9, depth: 4.0 },
        color: '#4a5568',
        description: 'Contemporary couch with clean lines and comfortable cushions',
        material: 'Fabric',
        style: 'Modern',
        modelPath: '/assets/glb/couch.glb',
        imagePath: '/assets/model-images/couch.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 899
    },
    {
        id: 'vrown_leather_couch',
        name: 'Brown Leather Couch',
        type: 'sofa',
        category: 'seating',
        dimensions: { width: 4.2, height: 2.55, depth: 3 },
        color: '#8B4513',
        description: 'Luxurious brown leather sofa with premium craftsmanship',
        material: 'Leather',
        style: 'Classic',
        modelPath: '/assets/glb/vrown-leather-couch.glb',
        imagePath: '/assets/model-images/vrown-leather-couch.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 1299
    },
    {
        id: 't_chair',
        name: 'T-Shape Armchair',
        type: 'chair',
        category: 'seating',
        dimensions: { width: 1.7, height: 1.9, depth: 1.7 },
        color: '#654321',
        description: 'Comfortable T-shaped armchair with ergonomic design',
        material: 'Fabric',
        style: 'Modern',
        modelPath: '/assets/glb/t-chair.glb',
        imagePath: '/assets/model-images/t-chair.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 299
    },
    {
        id: 'webby_chair',
        name: 'Webby Chair',
        type: 'chair',
        category: 'seating',
        dimensions: { width: 1.65, height: 1.85, depth: 1.65 },
        color: '#2F4F4F',
        description: 'Modern webbed design chair with breathable material',
        material: 'Synthetic Mesh',
        style: 'Contemporary',
        modelPath: '/assets/glb/webby-chair.glb',
        imagePath: '/assets/model-images/webby-chair.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 199
    },
    {
        id: 'stripped_chair',
        name: 'Striped Accent Chair',
        type: 'chair',
        category: 'seating',
        dimensions: { width: 1.6, height: 1.9, depth: 1.6 },
        color: '#4169E1',
        description: 'Elegant striped pattern accent chair',
        material: 'Fabric',
        style: 'Traditional',
        modelPath: '/assets/glb/stripped-chair.glb',
        imagePath: '/assets/model-images/stripped-chair.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 249
    },
    {
        id: 'upholstered_swivel_armchair',
        name: 'Upholstered Swivel Armchair',
        type: 'chair',
        category: 'seating',
        dimensions: { width: 1.7, height: 2.0, depth: 1.7 },
        color: '#708090',
        description: 'Comfortable swivel armchair with premium upholstery',
        material: 'Fabric',
        style: 'Modern',
        modelPath: '/assets/glb/Upholstered Swivel Armchair.glb',
        imagePath: '/assets/model-images/Upholstered Swivel Armchair.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 399
    },

    // TABLES (4 items)
    {
        id: 'coffee_table',
        name: 'Coffee Table',
        type: 'table',
        category: 'tables',
        dimensions: { width: 2.2, height: 1.45, depth: 1.7 },
        color: '#8B4513',
        description: 'Modern coffee table perfect for living room centerpiece',
        material: 'Wood',
        style: 'Modern',
        modelPath: '/assets/glb/coffee+table.glb',
        imagePath: '/assets/model-images/coffee+table.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 399,
        placement: {
            type: 'floor',         // Floor placement
            canStack: false,
            supportsSurface: true, // Other items can be placed on this
            surfaceHeight: 1.45,   // Height of the placing surface
            maxSurfaceLoad: 50     // Maximum weight it can support (kg)
        }
    },
    {
        id: 'dining_table',
        name: 'Dining Table',
        type: 'table',
        category: 'tables',
        dimensions: { width: 2.8, height: 1.75, depth: 1.9 },
        color: '#8B4513',
        description: 'Elegant dining table for family meals and gatherings',
        material: 'Solid Wood',
        style: 'Traditional',
        modelPath: '/assets/glb/dinning-table.glb',
        imagePath: '/assets/model-images/dinning-table.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 699
    },
    {
        id: 'table101',
        name: 'Modern Dining Table',
        type: 'table',
        category: 'tables',
        dimensions: { width: 2.6, height: 1.75, depth: 1.8 },
        color: '#654321',
        description: 'Contemporary dining table with sleek design',
        material: 'Wood',
        style: 'Modern',
        modelPath: '/assets/glb/table101.glb',
        imagePath: '/assets/model-images/table101.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 599
    },
    {
        id: 'tvtable',
        name: 'TV Console Table',
        type: 'entertainment',
        category: 'tables',
        dimensions: { width: 2.5, height: 1.5, depth: 1.4 },
        color: '#8B4513',
        description: 'Modern TV console with storage compartments',
        material: 'Wood',
        style: 'Modern',
        modelPath: '/assets/glb/tvtable.glb',
        imagePath: '/assets/model-images/tvtable.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 499
    },

    {
        id: 'bed101',
        name: 'Modern Platform Bed',
        type: 'bed',
        category: 'bedroom',
        dimensions: { width: 4, height: 1.9, depth: 3.4 },
        color: '#8B4513',
        description: 'Contemporary platform bed with stylish headboard',
        material: 'Wood',
        style: 'Modern',
        modelPath: '/assets/glb/bed101.glb',
        imagePath: '/assets/model-images/bed101.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.8,
        maxScale: 1.2,
        price: 799
    },
    {
        id: 'bed_small',
        name: 'Compact Single Bed',
        type: 'bed',
        category: 'bedroom',
        dimensions: { width: 3.4, height: 2.6, depth: 3.5 },
        color: '#8B4513',
        description: 'Space-saving single bed perfect for small rooms',
        material: 'Wood',
        style: 'Modern',
        modelPath: '/assets/glb/bed-small.glb',
        imagePath: '/assets/model-images/bed-small.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.8,
        maxScale: 1.2,
        price: 499
    },
    {
        id: 'simple_bed',
        name: 'Minimalist Bed',
        type: 'bed',
        category: 'bedroom',
        dimensions: { width: 2.8, height: 1.5, depth: 3.1 },
        color: '#D2691E',
        description: 'Clean minimalist bed design for modern bedrooms',
        material: 'Wood',
        style: 'Minimalist',
        modelPath: '/assets/glb/simple-bed.glb',
        imagePath: '/assets/model-images/simple-bed.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.8,
        maxScale: 1.2,
        price: 599
    },
    {
        id: 'corner_bed',
        name: 'Corner Bed',
        type: 'bed',
        category: 'bedroom',
        dimensions: { width: 3.0, height: 1.6, depth: 3.0 },
        color: '#8B4513',
        description: 'Space-efficient corner bed with built-in storage',
        material: 'Wood',
        style: 'Modern',
        modelPath: '/assets/glb/corner-bed.glb',
        imagePath: '/assets/model-images/corner-bed.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.8,
        maxScale: 1.2,
        price: 699
    },

    // LIGHTING COLLECTION (5 items)
    {
        id: 'lamp',
        name: 'Modern Floor Lamp',
        type: 'lighting',
        category: 'lighting',
        dimensions: { width: 1.6, height: 2.8, depth: 1.6 },
        color: '#2d3748',
        description: 'Minimalist floor lamp with adjustable LED lighting',
        material: 'Metal',
        style: 'Modern',
        modelPath: '/assets/glb/lamp.glb',
        imagePath: '/assets/model-images/lamp.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.7,
        maxScale: 1.5,
        price: 199
    },
    {
        id: 'floor_lamp',
        name: 'Classic Floor Lamp',
        type: 'lighting',
        category: 'lighting',
        dimensions: { width: 1.5, height: 2.6, depth: 1.5 },
        color: '#2F4F4F',
        description: 'Traditional floor lamp for ambient room lighting',
        material: 'Metal/Fabric',
        style: 'Traditional',
        modelPath: '/assets/glb/floor-lamp.glb',
        imagePath: '/assets/model-images/floor-lamp.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.7,
        maxScale: 1.5,
        price: 149
    },
    {
        id: 'tall_lamp',
        name: 'Tall Standing Lamp',
        type: 'lighting',
        category: 'lighting',
        dimensions: { width: 1.4, height: 3.0, depth: 1.4 },
        color: '#696969',
        description: 'Sleek tall lamp perfect for reading corners',
        material: 'Metal',
        style: 'Modern',
        modelPath: '/assets/glb/tall-lamp.glb',
        imagePath: '/assets/model-images/tall-lamp.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.7,
        maxScale: 1.5,
        price: 179
    },
    {
        id: 'vintage_lamp',
        name: 'Vintage Table Lamp',
        type: 'table_lamp',
        category: 'lighting',
        dimensions: { width: 1.45, height: 2.5, depth: 1.45 },
        color: '#8B4513',
        description: 'Retro-style vintage lamp with brass finish',
        material: 'Brass/Fabric',
        style: 'Vintage',
        modelPath: '/assets/glb/vintage-lamp.glb',
        imagePath: '/assets/model-images/vintage-lamp.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.7,
        maxScale: 1.5,
        price: 229,
        placement: {
            type: 'surface',        // Requires a surface to be placed on
            canStack: false,
            supportsSurface: false,
            requiresSurface: true,
            weight: 5              // kg - for weight validation
        }
    },
    {
        id: 'wall_lamp',
        name: 'Wall-Mounted Lamp',
        type: 'wall_lamp',
        category: 'lighting',
        dimensions: { width: 1.3, height: 1.4, depth: 1.2 },
        color: '#2F4F4F',
        description: 'Space-saving wall-mounted accent lighting',
        material: 'Metal',
        style: 'Modern',
        modelPath: '/assets/glb/wall-lamp.glb',
        imagePath: '/assets/model-images/wall-lamp.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.7,
        maxScale: 1.5,
        price: 99,
        placement: {
            type: 'wall',          // Wall-mounted
            canStack: false,
            supportsSurface: false,
            wallOffset: 0.2,       // Distance from wall surface
            preferredHeight: 1.8   // Preferred mounting height in meters
        }
    },


    // DECORATIVE PLANTS (2 items)
    {
        id: 'plant101',
        name: 'Decorative Plant',
        type: 'plant',
        category: 'decoration',
        dimensions: { width: 1.4, height: 1.8, depth: 1.4 },
        color: '#228B22',
        description: 'Beautiful potted plant to bring nature indoors',
        material: 'Ceramic/Plant',
        style: 'Natural',
        modelPath: '/assets/glb/plant101.glb',
        imagePath: '/assets/model-images/plant101.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 79,
        placement: {
            type: 'flexible',      // Can go on floor OR surfaces
            canStack: false,
            supportsSurface: false,
            weight: 3              // Light enough for most surfaces
        }
    },
    {
        id: 'snake_plant',
        name: 'Snake Plant',
        type: 'plant',
        category: 'decoration',
        dimensions: { width: 1.3, height: 2.0, depth: 1.3 },
        color: '#228B22',
        description: 'Low-maintenance snake plant in decorative pot',
        material: 'Ceramic/Plant',
        style: 'Natural',
        modelPath: '/assets/glb/snake-plant.glb',
        imagePath: '/assets/model-images/snake-plant.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 59
    },

    // STORAGE FURNITURE (1 item)
    {
        id: 'doormate',
        name: 'Storage Cabinet',
        type: 'storage',
        category: 'storage',
        dimensions: { width: 1.8, height: 2.8, depth: 1.4 },
        color: '#8B4513',
        description: 'Tall storage cabinet with doors and shelves',
        material: 'Wood',
        style: 'Modern',
        modelPath: '/assets/glb/doormate.glb',
        imagePath: '/assets/model-images/doormate.png',
        isGLB: true,
        defaultScale: { x: 1, y: 1, z: 1 },
        minScale: 0.5,
        maxScale: 2.0,
        price: 399
    }
];

export const getPlacementInfo = (item) => {
    if (!item.placement) return { type: 'floor', description: 'Floor placement', icon: '🏢', color: '#6b7280' };

    switch (item.placement.type) {
        case 'wall':
            return {
                type: 'wall',
                description: 'Wall-mounted',
                icon: '🏠',
                color: '#dc2626',
                details: `Mounts ${item.placement.preferredHeight || 1.8}m high`
            };
        case 'surface':
            return {
                type: 'surface',
                description: 'Requires surface',
                icon: '📋',
                color: '#059669',
                details: `Weight: ${item.placement.weight || 'Unknown'}kg`
            };
        case 'flexible':
            return {
                type: 'flexible',
                description: 'Floor or surface',
                icon: '🔄',
                color: '#7c3aed',
                details: `Weight: ${item.placement.weight || 'Unknown'}kg`
            };
        case 'floor':
        default:
            return {
                type: 'floor',
                description: 'Floor placement',
                icon: '🏢',
                color: '#6b7280',
                details: item.placement.supportsSurface ?
                    `Can support ${item.placement.maxSurfaceLoad}kg` :
                    'Standard floor item'
            };
    }
};

export const canPlaceOnSurface = (item, surfaceItem) => {
    if (!item.placement || !surfaceItem.placement) return false;

    // Check if item can be placed on surfaces
    const itemCanBePlaced = item.placement.type === 'surface' || item.placement.type === 'flexible';

    // Check if surface item supports other items
    const surfaceSupports = surfaceItem.placement.supportsSurface;

    // Check weight constraints
    const weightOk = !surfaceItem.placement.maxSurfaceLoad ||
        !item.placement.weight ||
        item.placement.weight <= surfaceItem.placement.maxSurfaceLoad;

    return itemCanBePlaced && surfaceSupports && weightOk;
};

export const canMountOnWall = (item) => {
    return item.placement?.type === 'wall';
};

export const searchFurnitureByPlacement = (placementType) => {
    return furnitureCatalog.filter(item => {
        if (!item.placement) return placementType === 'floor';

        switch (placementType) {
            case 'wall':
                return item.placement.type === 'wall';
            case 'surface':
                return item.placement.type === 'surface' || item.placement.type === 'flexible';
            case 'floor':
                return item.placement.type === 'floor' || item.placement.type === 'flexible';
            default:
                return true;
        }
    });
};

export const getSurfaceItems = () => {
    return furnitureCatalog.filter(item => item.placement?.supportsSurface);
};

export const getWallMountableItems = () => {
    return furnitureCatalog.filter(item => item.placement?.type === 'wall');
};

export const getSurfacePlaceableItems = () => {
    return furnitureCatalog.filter(item =>
        item.placement?.type === 'surface' || item.placement?.type === 'flexible'
    );
};

export const addPlacementToExistingItems = () => {
    // If you want to quickly add placement info to existing items, you can use this:
    const placementMap = {
        // Tables and surfaces that support other items
        'coffee_table': { type: 'floor', supportsSurface: true, surfaceHeight: 1.45, maxSurfaceLoad: 50 },
        'dining_table': { type: 'floor', supportsSurface: true, surfaceHeight: 1.75, maxSurfaceLoad: 100 },
        'table101': { type: 'floor', supportsSurface: true, surfaceHeight: 1.75, maxSurfaceLoad: 80 },
        'tvtable': { type: 'floor', supportsSurface: true, surfaceHeight: 1.5, maxSurfaceLoad: 30 },
        'doormate': { type: 'floor', supportsSurface: true, surfaceHeight: 2.8, maxSurfaceLoad: 20 },

        // Lighting that can be placed on surfaces
        'vintage_lamp': { type: 'surface', weight: 5, requiresSurface: true },

        // Wall-mounted items
        'wall_lamp': { type: 'wall', wallOffset: 0.2, preferredHeight: 1.8 },

        // Flexible items (floor or surface)
        'plant101': { type: 'flexible', weight: 3 },
        'snake_plant': { type: 'flexible', weight: 2 },

        // Floor-only items
        'couch': { type: 'floor', supportsSurface: true, surfaceHeight: 0.8 },
        'vrown_leather_couch': { type: 'floor', supportsSurface: true, surfaceHeight: 0.8 },
        't_chair': { type: 'floor' },
        'webby_chair': { type: 'floor' },
        'stripped_chair': { type: 'floor' },
        'upholstered_swivel_armchair': { type: 'floor' },
        'bed101': { type: 'floor' },
        'bed_small': { type: 'floor' },
        'simple_bed': { type: 'floor' },
        'corner_bed': { type: 'floor' },
        'lamp': { type: 'floor' },
        'floor_lamp': { type: 'floor' },
        'tall_lamp': { type: 'floor' }
    };

    return placementMap;
};

// Enhanced helper functions with proper filtering
export const getFurnitureByCategory = (category) => {
    console.log(`Filtering by category: ${category}`);
    const filtered = furnitureCatalog.filter(item => item.category === category);
    console.log(`Found ${filtered.length} items in category ${category}`);
    return filtered;
};

export const getFurnitureByType = (type) => {
    return furnitureCatalog.filter(item => item.type === type);
};

export const getAllCategories = () => {
    const categories = [...new Set(furnitureCatalog.map(item => item.category))];
    console.log('All categories:', categories);
    return categories;
};

export const getCategoryStats = () => {
    const categories = {};
    furnitureCatalog.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = { count: 0, totalValue: 0, types: new Set() };
        }
        categories[item.category].count++;
        categories[item.category].totalValue += item.price || 0;
        categories[item.category].types.add(item.type);
    });

    // Convert sets to arrays for easier use
    Object.keys(categories).forEach(cat => {
        categories[cat].types = Array.from(categories[cat].types);
    });

    console.log('Category stats:', categories);
    return categories;
};

export const getStyleStats = () => {
    const styles = {};
    furnitureCatalog.forEach(item => {
        if (!styles[item.style]) {
            styles[item.style] = { count: 0, avgPrice: 0, items: [] };
        }
        styles[item.style].count++;
        styles[item.style].items.push(item);
    });

    // Calculate average prices
    Object.keys(styles).forEach(style => {
        const totalPrice = styles[style].items.reduce((sum, item) => sum + (item.price || 0), 0);
        styles[style].avgPrice = Math.round(totalPrice / styles[style].count);
    });

    return styles;
};

export const searchFurniture = (query) => {
    const lowercaseQuery = query.toLowerCase();
    const results = furnitureCatalog.filter(item =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.category.toLowerCase().includes(lowercaseQuery) ||
        item.type.toLowerCase().includes(lowercaseQuery) ||
        item.material.toLowerCase().includes(lowercaseQuery) ||
        item.style.toLowerCase().includes(lowercaseQuery)
    );
    console.log(`Search for "${query}" returned ${results.length} results`);
    return results;
};

export const getFurnitureByPriceRange = (minPrice, maxPrice) => {
    return furnitureCatalog.filter(item => {
        const price = item.price || 0;
        return price >= minPrice && price <= maxPrice;
    });
};

// GLB Data Serialization (unchanged)
export const serializeGLBData = (furnitureObject, item) => {
    if (!item.isGLB || !furnitureObject) {
        return null;
    }

    const boundingBox = new THREE.Box3().setFromObject(furnitureObject);
    const size = boundingBox.getSize(new THREE.Vector3());

    return {
        modelPath: item.modelPath,
        appliedScale: furnitureObject.scale.x,
        finalSize: {
            x: size.x,
            y: size.y,
            z: size.z
        },
        boundingBox: {
            min: { x: boundingBox.min.x, y: boundingBox.min.y, z: boundingBox.min.z },
            max: { x: boundingBox.max.x, y: boundingBox.max.y, z: boundingBox.max.z }
        },
        floorOffset: furnitureObject.position.y,
        lastModified: new Date().toISOString()
    };
};

// Enhanced Save Function
export const saveRoomConfigurationWithGLB = (config) => {
    try {
        const savedRooms = getSavedRoomConfigurations();
        const existingIndex = savedRooms.findIndex(room => room.id === config.id);

        const enhancedConfig = {
            ...config,
            updatedAt: new Date().toISOString(),
            version: "2.0",
            projectId: config.projectId || null,
            projectTitle: config.projectTitle || null
        };

        if (existingIndex >= 0) {
            savedRooms[existingIndex] = enhancedConfig;
        } else {
            savedRooms.push(enhancedConfig);
        }

        localStorage.setItem('roomConfigurations', JSON.stringify(savedRooms));
        console.log('Enhanced room configuration saved successfully with GLB data and project info');
        return true;
    } catch (error) {
        console.error('Error saving enhanced room configuration:', error);
        return false;
    }
};

// Rest of the functions remain the same...
export const getRoomConfigurationByProjectId = (projectId) => {
    try {
        const savedRooms = getSavedRoomConfigurations();
        return savedRooms.find(room => room.projectId === projectId);
    } catch (error) {
        console.error('Error finding room by project ID:', error);
        return null;
    }
};

export const saveRoomForProject = (config, projectId, projectTitle) => {
    const projectConfig = {
        ...config,
        projectId: projectId,
        projectTitle: projectTitle,
        name: projectTitle || config.name || `Project Room ${new Date().toLocaleDateString()}`
    };
    return saveRoomConfigurationWithGLB(projectConfig);
};

export const exportRoomConfigurationWithGLB = async (config, embedGLB = false) => {
    try {
        let exportConfig = { ...config };

        if (embedGLB) {
            console.log('Embedding GLB files in export...');

            const glbFiles = new Set();
            config.placedFurniture?.forEach(item => {
                if (item.isGLB && item.modelPath) {
                    glbFiles.add(item.modelPath);
                }
            });

            const embeddedModels = {};
            for (const modelPath of glbFiles) {
                try {
                    const response = await fetch(modelPath);
                    const arrayBuffer = await response.arrayBuffer();
                    const base64 = arrayBufferToBase64(arrayBuffer);
                    embeddedModels[modelPath] = {
                        data: base64,
                        size: arrayBuffer.byteLength,
                        type: 'model/gltf-binary'
                    };
                    console.log(`Embedded ${modelPath} (${(arrayBuffer.byteLength / 1024).toFixed(1)}KB)`);
                } catch (error) {
                    console.error(`Failed to embed ${modelPath}:`, error);
                }
            }

            exportConfig.embeddedGLBModels = embeddedModels;
            exportConfig.exportType = 'full-embedded';
        } else {
            exportConfig.exportType = 'metadata-only';
        }

        exportConfig.exportedAt = new Date().toISOString();
        exportConfig.version = "2.0";

        const dataStr = JSON.stringify(exportConfig, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        const filename = `room-design-${config.name}-${embedGLB ? 'full' : 'metadata'}-${new Date().toISOString().split('T')[0]}.json`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log(`Exported room configuration: ${filename}`);
        return true;
    } catch (error) {
        console.error('Error exporting room configuration:', error);
        return false;
    }
};

// Utility Functions
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

// Backward Compatible Functions
export const saveRoomConfiguration = saveRoomConfigurationWithGLB;

export const getSavedRoomConfigurations = () => {
    try {
        const saved = localStorage.getItem('roomConfigurations');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading room configurations:', error);
        return [];
    }
};

export const deleteRoomConfiguration = (id) => {
    try {
        const savedRooms = getSavedRoomConfigurations();
        const filtered = savedRooms.filter(room => room.id !== id);
        localStorage.setItem('roomConfigurations', JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting room configuration:', error);
    }
};

export const exportRoomConfiguration = (config) => {
    return exportRoomConfigurationWithGLB(config, false);
};

export const sendRoomToBackend = async (config) => {
    try {
        const response = await fetch('/api/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        if (response.ok) {
            console.log('Room configuration sent to backend successfully');
            return true;
        } else {
            console.error('Failed to send room configuration to backend');
            return false;
        }
    } catch (error) {
        console.error('Error sending room configuration to backend:', error);
        return false;
    }
};

export const calculateTotalCost = (placedFurniture) => {
    if (!Array.isArray(placedFurniture)) return 0;

    return placedFurniture.reduce((total, item) => {
        const furnitureItem = furnitureCatalog.find(f => f.id === item.furnitureId);
        return total + (furnitureItem?.price || 0);
    }, 0);
};

// Debug function to verify catalog integrity
export const validateCatalog = () => {
    console.log('=== FURNITURE CATALOG VALIDATION ===');
    console.log(`Total items: ${furnitureCatalog.length}`);

    // Check for duplicates
    const ids = furnitureCatalog.map(item => item.id);
    const uniqueIds = [...new Set(ids)];
    console.log(`Unique items: ${uniqueIds.length}`);

    if (ids.length !== uniqueIds.length) {
        console.error('DUPLICATE IDs FOUND!');
        ids.forEach((id, index) => {
            if (ids.indexOf(id) !== index) {
                console.error(`Duplicate ID: ${id}`);
            }
        });
    }

    // Category breakdown
    const categoryBreakdown = {};
    furnitureCatalog.forEach(item => {
        if (!categoryBreakdown[item.category]) {
            categoryBreakdown[item.category] = 0;
        }
        categoryBreakdown[item.category]++;
    });

    console.log('Category breakdown:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} items`);
    });

    console.log('=== END VALIDATION ===');

    return {
        total: furnitureCatalog.length,
        unique: uniqueIds.length,
        categories: categoryBreakdown,
        isValid: ids.length === uniqueIds.length && furnitureCatalog.length === 22
    };
};