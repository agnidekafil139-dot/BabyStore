require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// Mapping: product name => array of image paths
// For clothing & toys: we use the AI-generated local images
// For other categories: we use picsum.photos (free, reliable image service)
const imageMap = {
    // === VÊTEMENTS (Clothing) - AI generated images ===
    'Body Manches Longues Blanc': ['/uploads/baby_clothing_1.png'],
    'Pyjama Grenouillère Étoiles': ['/uploads/baby_clothing_2.png'],
    'Chapeau de Soleil Bébé': ['/uploads/baby_clothing_3.png'],
    'Chaussettes Antidérapantes Pack x5': ['/uploads/baby_clothing_1.png'],
    'Gilet Tricoté Beige': ['/uploads/baby_clothing_3.png'],
    'Set 3 Bodies Pastel': ['/uploads/baby_clothing_1.png'],
    'Jean Souple Élastiqué': ['/uploads/baby_clothing_2.png'],
    'Manteau en Polaire Rose': ['/uploads/baby_clothing_3.png'],
    'Brassière Velours Doux': ['/uploads/baby_clothing_1.png'],
    'Salopette en Lin Naturel': ['/uploads/baby_clothing_2.png'],

    // === JOUETS (Toys) - AI generated images ===
    'Cube de Découverte Musical': ['/uploads/baby_toy_1.png'],
    'Peluche Ours Polaire 40cm': ['/uploads/baby_toy_2.png'],
    'Mobile pour Berceau Arc-en-Ciel': ['/uploads/baby_toy_3.png'],
    'Anneaux de Dentition Silicone': ['/uploads/baby_toy_1.png'],
    'Set Empilage Bois Coloré': ['/uploads/baby_toy_1.png'],
    "Tapis d'Éveil avec Arche": ['/uploads/baby_toy_3.png'],
    'Livre en Tissu Sensoriel': ['/uploads/baby_toy_2.png'],
    'Xylophone en Bois': ['/uploads/baby_toy_1.png'],
    'Hochet Girafe Caoutchouc': ['/uploads/baby_toy_2.png'],
    'Puzzle Animaux 9 pièces': ['/uploads/baby_toy_1.png'],

    // === ALIMENTATION (Feeding) - picsum.photos ===
    'Biberon Anti-colique 260ml': ['https://picsum.photos/seed/biberon/600/600'],
    'Set 3 Biberons Verre': ['https://picsum.photos/seed/biberons/600/600'],
    'Bavoir Imperméable Silicone x3': ['https://picsum.photos/seed/bavoir/600/600'],
    'Petite Cuillère Silicone Set 4pcs': ['https://picsum.photos/seed/cuillere/600/600'],
    'Chauffe-biberon Portable USB': ['https://picsum.photos/seed/chauffe/600/600'],
    'Bol et Assiette Ventouse Bébé': ['https://picsum.photos/seed/bol-assiette/600/600'],
    'Gobelet Sippy Cup 200ml': ['https://picsum.photos/seed/gobelet/600/600'],
    "Coussin d'Allaitement Grand Luxe": ['https://picsum.photos/seed/coussin/600/600'],
    'Blender Bébé Nomade USB': ['https://picsum.photos/seed/blender/600/600'],
    'Tétine Orthodontique Pack 2': ['https://picsum.photos/seed/tetine/600/600'],

    // === HYGIÈNE & SOIN - picsum.photos ===
    'Shampoing Doux Bébé 250ml': ['https://picsum.photos/seed/shampoing/600/600'],
    'Lingettes Biodégradables x80': ['https://picsum.photos/seed/lingettes/600/600'],
    'Thermomètre Sans Contact': ['https://picsum.photos/seed/thermometre/600/600'],
    'Kit Bain Bébé Complet': ['https://picsum.photos/seed/kitbain/600/600'],
    'Crème Change Protectrice 75ml': ['https://picsum.photos/seed/creme/600/600'],
    'Coupe-ongles Bébé Safety Set': ['https://picsum.photos/seed/coupeongle/600/600'],
    'Huile de Massage Lavande 100ml': ['https://picsum.photos/seed/huile/600/600'],
    'Mouche-bébé Électrique Silencieux': ['https://picsum.photos/seed/mouchebebe/600/600'],
    'Couches Naturelles T3 Pack 44': ['https://picsum.photos/seed/couches/600/600'],
    'Gel Dentaire Naturel 45ml': ['https://picsum.photos/seed/geldentaire/600/600'],

    // === MOBILIER & CHAMBRE - picsum.photos ===
    'Lit Bébé Évolutif Barreaux': ['https://picsum.photos/seed/litbebe/600/600'],
    'Table à Langer avec Baignoire': ['https://picsum.photos/seed/tablelanger/600/600'],
    'Transat Bébé Vibrant': ['https://picsum.photos/seed/transat/600/600'],
    'Couffin Naturel en Osier': ['https://picsum.photos/seed/couffin/600/600'],
    'Mobile Musical Berceau': ['https://picsum.photos/seed/mobileberceau/600/600'],
    'Commode 3 Tiroirs Blanc Arrondi': ['https://picsum.photos/seed/commode/600/600'],
    'Tapis Chambre Rond 120cm': ['https://picsum.photos/seed/tapischambre/600/600'],
    'Veilleuse Nuage LED Rechargeable': ['https://picsum.photos/seed/veilleuse/600/600'],
    'Boîte à Musique Bois Ours': ['https://picsum.photos/seed/boitemusique/600/600'],
    'Chaise Haute Réglable Bois': ['https://picsum.photos/seed/chaishaute/600/600'],
};

const updateImages = async () => {
    try {
        await connectDB();
        console.log('Connected to DB...');

        let updated = 0;
        let notFound = 0;

        for (const [name, images] of Object.entries(imageMap)) {
            const result = await Product.updateOne(
                { name },
                { $set: { images } }
            );
            if (result.modifiedCount > 0) {
                updated++;
                console.log(`  ✅ ${name}`);
            } else {
                notFound++;
                console.log(`  ⚠️  Not found/unchanged: ${name}`);
            }
        }

        console.log(`\n✅ Done! ${updated} products updated, ${notFound} not found/unchanged.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updateImages();
