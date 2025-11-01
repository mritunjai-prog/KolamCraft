import { nanoid } from 'nanoid';

const sampleDesignTitles = [
    'Intricate Peacock Feather Kolam',
    'Lotus Bloom Festival Rangoli',
    'Traditional Pongal Kolam',
    'Geometric Star Pattern Kolam',
    'Spiral Dots & Curves Design',
    'Floral Grid Kolam',
    'Circular Chakra Design',
    'Symmetry in Dot Art',
    'Classic Pulli Kolam',
    'Freehand Navaratri Rangoli',
    'Peacock Kolam with 7 Dots',
    'Simple & Elegant Daisy Kolam',
    'Diwali Diya Kolam',
    'Colorful Sanskar Bharati Design',
    'Abstract Line Art Kolam'
];

const sampleCreators = [
    'Jaahanavi',
    'KolamKreator',
    'RangoliRani',
    'ArtfulDots',
    'TraditionalArts',
    'CreativeKolams',
    'ModernMandalas',
    'SouthIndianArt',
    'BharatiRao',
    'PriyaDesigns'
];

const sampleDescriptions = [
    'A vibrant kolam featuring a graceful peacock, perfect for festive occasions. The intricate dots and lines create a mesmerizing pattern.',
    'This design captures the essence of a blooming lotus. It is a simple yet elegant piece ideal for beginners.',
    'A traditional design with a modern twist, using complex curves and symmetrical patterns. Great for advanced artists.',
    'Celebrating the harvest season with this traditional Pongal kolam, adorned with sun and sugarcane motifs.',
    'A beautiful blend of geometric shapes and fluid lines, representing the harmony of art and mathematics.',
    'This freehand design uses a combination of bold colors and delicate strokes to create a stunning visual masterpiece.',
    'Inspired by ancient symbols, this circular design is perfect for meditation and home decoration.',
    'A timeless classic that relies on a precise dot grid to form a complex, interconnected pattern.'
];

const sampleTags = [
    'Traditional', 'Festival', 'Beginner', 'Intermediate', 'Advanced', 'Dots', 'Lines', 
    'Symmetry', 'Geometric', 'Floral', 'Peacock', 'Lotus', 'Freehand', 'Rangoli',
    'Indian Art', 'Spiritual', 'Culture', 'Vibrant', 'Harvest', 'Diwali'
];

// CORRECTED PATH: Use `../assets/` to go up one directory from `src/data` to `src`
// then into the `assets` folder.
const imageModules = import.meta.glob('../assets/*.{jpg,jpeg,png,webp}', { eager: true });

export const mockDesigns = Object.keys(imageModules).map((path, index) => {
    const creator = sampleCreators[Math.floor(Math.random() * sampleCreators.length)];
    const title = sampleDesignTitles[Math.floor(Math.random() * sampleDesignTitles.length)];
    const description = sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];
    
    const uniqueTags = new Set<string>();
    while (uniqueTags.size < 3) {
        uniqueTags.add(sampleTags[Math.floor(Math.random() * sampleTags.length)]);
    }

    const complexityOptions = ['Beginner', 'Intermediate', 'Advanced'];
    const gridTypes = ['Rectangular', 'Triangular', 'Circular', 'Freehand'];
    
    return {
        id: nanoid(),
        title: title,
        creator: creator,
        imageUrl: imageModules[path].default,
        likes: Math.floor(Math.random() * 500) + 5,
        comments: Math.floor(Math.random() * 50),
        isLiked: false,
        isSaved: false,
        tags: Array.from(uniqueTags),
        complexity: complexityOptions[Math.floor(Math.random() * complexityOptions.length)],
        gridType: gridTypes[Math.floor(Math.random() * gridTypes.length)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)).toISOString(),
        description: description,
    };
});