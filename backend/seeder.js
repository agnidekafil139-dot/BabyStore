require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

const ADMIN_EMAIL = 'admin@babystore.com';
const ADMIN_PASSWORD = 'admin123';

const categories = [
    { name: 'Vêtements', slug: 'vetements', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80' }, // Baby clothes
    { name: 'Jouets', slug: 'jouets', image: 'https://images.unsplash.com/photo-1558244247-49f3e4e9b9d3?auto=format&fit=crop&w=600&q=80' }, // Baby toy
    { name: 'Alimentation', slug: 'alimentation', image: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=600&q=80' }, // Baby bottle
    { name: 'Hygiène & Soin', slug: 'hygiene', image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=600&q=80' }, // Baby bath
    { name: 'Mobilier & Chambre', slug: 'mobilier', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=600&q=80' }, // Baby room
];

const getProducts = (catId, catSlug) => {
    const productMap = {
        vetements: [
            { name: 'Body Manches Longues Blanc', price: 29.90, images: ['https://source.unsplash.com/600x600/?baby,onesie'], description: 'Body doux en coton biologique pour bébé, parfait pour toutes les saisons.', countInStock: 50 },
            { name: 'Pyjama Grenouillère Étoiles', price: 49.90, images: ['https://source.unsplash.com/600x600/?baby,pajamas'], description: 'Grenouillère chaude imprimée étoiles pour nuits douces et confortables.', countInStock: 30 },
            { name: 'Chapeau de Soleil Bébé', price: 19.90, images: ['https://source.unsplash.com/600x600/?baby,hat'], description: 'Chapeau de protection solaire UPF50+ pour les sorties ensoleillées.', countInStock: 40 },
            { name: 'Chaussettes Antidérapantes Pack x5', price: 24.90, images: ['https://source.unsplash.com/600x600/?baby,socks'], description: 'Lot de 5 paires de chaussettes colorées avec semelle antidérapante.', countInStock: 60 },
            { name: 'Gilet Tricoté Beige', price: 39.90, images: ['https://source.unsplash.com/600x600/?baby,cardigan'], description: 'Gilet en maille douce, fermeture boutons, style scandinave.', countInStock: 25 },
            { name: 'Set 3 Bodies Pastel', price: 59.90, images: ['https://source.unsplash.com/600x600/?baby,clothes'], description: 'Lot de 3 bodies dans des tons pastel coordonnés. 100% coton.', countInStock: 35 },
            { name: 'Jean Souple Élastiqué', price: 44.90, images: ['https://source.unsplash.com/600x600/?baby,pants'], description: 'Jean léger avec ceinture élastique, confort absolu pour l\'éveil.', countInStock: 20 },
            { name: 'Manteau en Polaire Rose', price: 69.90, images: ['https://source.unsplash.com/600x600/?baby,coat'], description: 'Manteau chaud en polaire douce, capuche amovible.', countInStock: 15 },
            { name: 'Brassière Velours Doux', price: 34.90, images: ['https://source.unsplash.com/600x600/?baby,knit'], description: 'Brassière velours ultra-douce pour nouveau-né.', countInStock: 40 },
            { name: 'Salopette en Lin Naturel', price: 54.90, images: ['https://source.unsplash.com/600x600/?baby,romper'], description: 'Salopette estivale en lin naturel respirant, look bohème.', countInStock: 22 },
        ],
        jouets: [
            { name: 'Cube de Découverte Musical', price: 79.90, images: ['https://source.unsplash.com/600x600/?baby,wooden,toy'], description: 'Cube en bois avec boutons, miroir, musique et textures variées.', countInStock: 20 },
            { name: 'Peluche Ours Polaire 40cm', price: 49.90, images: ['https://source.unsplash.com/600x600/?teddy,bear'], description: 'Peluche ultra-douce certifiée CE, lavable en machine.', countInStock: 35 },
            { name: 'Mobile pour Berceau Arc-en-Ciel', price: 89.90, images: ['https://source.unsplash.com/600x600/?baby,mobile,crib'], description: 'Mobile musical avec formes pastel suspendues pour stimuler l\'éveil.', countInStock: 18 },
            { name: 'Anneaux de Dentition Silicone', price: 19.90, images: ['https://source.unsplash.com/600x600/?baby,teether'], description: 'Anneaux de dentition en silicone alimentaire, sans BPA.', countInStock: 55 },
            { name: 'Set Empilage Bois Coloré', price: 34.90, images: ['https://source.unsplash.com/600x600/?wooden,stacking,toy'], description: 'Tour d\'empilage en bois naturel peint, 6 anneaux.', countInStock: 28 },
            { name: 'Tapis d\'Éveil avec Arche', price: 119.90, images: ['https://source.unsplash.com/600x600/?baby,playmat'], description: 'Tapis d\'éveil avec arche, jouets suspendus et musiques. Lavable.', countInStock: 12 },
            { name: 'Livre en Tissu Sensoriel', price: 24.90, images: ['https://source.unsplash.com/600x600/?baby,book,cloth'], description: 'Livre avec textures, miroir et bruits pour stimuler les sens.', countInStock: 40 },
            { name: 'Xylophone en Bois', price: 44.90, images: ['https://source.unsplash.com/600x600/?xylophone,kids'], description: 'Xylophone coloré avec baguette, éveil musical dès 12 mois.', countInStock: 22 },
            { name: 'Hochet Girafe Caoutchouc', price: 29.90, images: ['https://source.unsplash.com/600x600/?baby,rattle'], description: 'Hochet en caoutchouc naturel, parfait pour les gencives sensibles.', countInStock: 48 },
            { name: 'Puzzle Animaux 9 pièces', price: 39.90, images: ['https://source.unsplash.com/600x600/?wooden,puzzle,kids'], description: 'Puzzle en bois illustré avec 9 animaux et leur creux.', countInStock: 30 },
        ],
        alimentation: [
            { name: 'Biberon Anti-colique 260ml', price: 59.90, images: ['https://source.unsplash.com/600x600/?baby,bottle'], description: 'Biberon avec système anti-colique breveté, tétine silicone évolutive.', countInStock: 45 },
            { name: 'Set 3 Biberons Verre', price: 99.90, images: ['https://source.unsplash.com/600x600/?glass,baby,bottle'], description: 'Lot de 3 biberons en verre borosilicate avec manchon silicone.', countInStock: 20 },
            { name: 'Bavoir Imperméable Silicone x3', price: 39.90, images: ['https://source.unsplash.com/600x600/?baby,bib'], description: 'Lot de 3 bavoirs en silicone avec poche récupératrice, lavable lave-vaisselle.', countInStock: 55 },
            { name: 'Petite Cuillère Silicone Set 4pcs', price: 24.90, images: ['https://source.unsplash.com/600x600/?baby,spoon'], description: 'Set de cuillères en silicone souple, 4 couleurs différentes.', countInStock: 60 },
            { name: 'Chauffe-biberon Portable USB', price: 129.90, images: ['https://source.unsplash.com/600x600/?bottle,warmer'], description: 'Chauffe-biberon portable rechargeable USB compatible toutes marques.', countInStock: 18 },
            { name: 'Bol et Assiette Ventouse Bébé', price: 34.90, images: ['https://source.unsplash.com/600x600/?baby,bowl,plate'], description: 'Bol + assiette avec ventouse intégrée, silicone alimentaire sans BPA.', countInStock: 40 },
            { name: 'Gobelet Sippy Cup 200ml', price: 19.90, images: ['https://source.unsplash.com/600x600/?sippy,cup'], description: 'Gobelet d\'apprentissage à bec arrondi, poignées ergonomiques.', countInStock: 50 },
            { name: 'Coussin d\'Allaitement Grand Luxe', price: 89.90, images: ['https://source.unsplash.com/600x600/?nursing,pillow'], description: 'Grand coussin d\'allaitement en coton lavable, rembourrage ferme.', countInStock: 15 },
            { name: 'Blender Bébé Nomade USB', price: 149.90, images: ['https://source.unsplash.com/600x600/?baby,blender,food'], description: 'Blender portable rechargeable USB pour purées maison en déplacement.', countInStock: 12 },
            { name: 'Tétine Orthodontique Pack 2', price: 14.90, images: ['https://source.unsplash.com/600x600/?baby,pacifier'], description: 'Pack 2 tétines orthodontiques silicone, 0-6 mois.', countInStock: 70 },
        ],
        hygiene: [
            { name: 'Shampoing Doux Bébé 250ml', price: 19.90, images: ['https://source.unsplash.com/600x600/?baby,shampoo'], description: 'Shampoing sans sulfate ni parabène, pour le cuir chevelu délicat des bébés.', countInStock: 60 },
            { name: 'Lingettes Biodégradables x80', price: 12.90, images: ['https://source.unsplash.com/600x600/?baby,wipes'], description: 'Lingettes biodégradables à l\'aloe vera, sans parfum, pour peau sensible.', countInStock: 100 },
            { name: 'Thermomètre Sans Contact', price: 89.90, images: ['https://source.unsplash.com/600x600/?baby,thermometer'], description: 'Thermomètre frontal infrarouge, résultat en 1 seconde, mémoire 30 mesures.', countInStock: 30 },
            { name: 'Kit Bain Bébé Complet', price: 49.90, images: ['https://source.unsplash.com/600x600/?baby,bath,sponge'], description: 'Kit complet: brosse douce, peigne, éponge naturelle et savon hypoallergénique.', countInStock: 25 },
            { name: 'Crème Change Protectrice 75ml', price: 24.90, images: ['https://source.unsplash.com/600x600/?diaper,cream'], description: 'Crème protectrice aux extraits de calendula et zinc, contre érythèmes fessiers.', countInStock: 80 },
            { name: 'Coupe-ongles Bébé Safety Set', price: 29.90, images: ['https://source.unsplash.com/600x600/?baby,nail,clipper'], description: 'Coupe-ongles avec guide de sécurité et lime douce incluse.', countInStock: 45 },
            { name: 'Huile de Massage Lavande 100ml', price: 22.90, images: ['https://source.unsplash.com/600x600/?baby,massage,oil'], description: 'Huile végétale à la lavande pour massages relaxants avant le coucher.', countInStock: 50 },
            { name: 'Mouche-bébé Électrique Silencieux', price: 59.90, images: ['https://source.unsplash.com/600x600/?nasal,aspirator'], description: 'Mouche-nez électrique silencieux, aspirateur nasal avec 4 embouts.', countInStock: 22 },
            { name: 'Couches Naturelles T3 Pack 44', price: 49.90, images: ['https://source.unsplash.com/600x600/?baby,diapers'], description: 'Couches jetables biodégradables taille 3 (4-9kg). Sans chlore ni parfum.', countInStock: 35 },
            { name: 'Gel Dentaire Naturel 45ml', price: 15.90, images: ['https://source.unsplash.com/600x600/?baby,toothbrush'], description: 'Gel pour les premières dents, sans fluorure, arôme naturel de fraise.', countInStock: 55 },
        ],
        mobilier: [
            { name: 'Lit Bébé Évolutif Barreaux', price: 599.90, images: ['https://source.unsplash.com/600x600/?baby,crib'], description: 'Lit bébé évolutif 60x120cm, transformable en lit enfant. Bois massif certifié FSC.', countInStock: 8 },
            { name: 'Table à Langer avec Baignoire', price: 299.90, images: ['https://source.unsplash.com/600x600/?changing,table,baby'], description: 'Table à langer pliable avec baignoire amovible et étagère de rangement.', countInStock: 10 },
            { name: 'Transat Bébé Vibrant', price: 149.90, images: ['https://source.unsplash.com/600x600/?baby,bouncer'], description: 'Transat avec vibrations apaisantes et arche de jouets, 0-9 mois.', countInStock: 15 },
            { name: 'Couffin Naturel en Osier', price: 189.90, images: ['https://source.unsplash.com/600x600/?baby,bassinet'], description: 'Couffin en osier naturel avec matelas en coton lavable. Livré avec support bois.', countInStock: 12 },
            { name: 'Mobile Musical Berceau', price: 89.90, images: ['https://source.unsplash.com/600x600/?nursery,mobile'], description: 'Mobile musical à fixer au lit, tourne lentement avec 3 mélodies douces.', countInStock: 20 },
            { name: 'Commode 3 Tiroirs Blanc Arrondi', price: 399.90, images: ['https://source.unsplash.com/600x600/?nursery,dresser'], description: 'Commode 3 tiroirs avec façade arrondie, plateau de change transformable.', countInStock: 6 },
            { name: 'Tapis Chambre Rond 120cm', price: 129.90, images: ['https://source.unsplash.com/600x600/?nursery,rug'], description: 'Tapis rond moelleux 120cm de diamètre, lavable en machine, design étoile.', countInStock: 18 },
            { name: 'Veilleuse Nuage LED Rechargeable', price: 59.90, images: ['https://source.unsplash.com/600x600/?baby,nightlight'], description: 'Veilleuse forme nuage avec 7 couleurs et minuterie, rechargeable USB.', countInStock: 35 },
            { name: 'Boîte à Musique Bois Ours', price: 39.90, images: ['https://source.unsplash.com/600x600/?music,box,wooden'], description: 'Boîte à musique mécanique en bois massif avec mélodie douce.', countInStock: 28 },
            { name: 'Chaise Haute Réglable Bois', price: 249.90, images: ['https://source.unsplash.com/600x600/?baby,highchair'], description: 'Chaise haute en bois massif réglable en hauteur, ceinture 5 points de sécurité.', countInStock: 10 },
        ],
    };
    return productMap[catSlug].map(p => ({
        ...p,
        category: catId,
        rating: +(3.8 + Math.random() * 1.2).toFixed(1),
        numReviews: Math.floor(4 + Math.random() * 30)
    }));
};

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Connected to DB...');

        let adminUser = await User.findOne({ email: ADMIN_EMAIL });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Admin BabyStore',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin',
            });
            console.log(`✅ Compte admin créé : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
        } else {
            adminUser.password = ADMIN_PASSWORD;
            await adminUser.save();
            console.log(`✅ Mot de passe admin réinitialisé : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
        }

        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Cleared existing data.');

        const insertedCats = await Category.insertMany(categories);
        console.log(`✅ Inserted ${insertedCats.length} categories.`);

        let total = 0;
        for (const cat of insertedCats) {
            const products = getProducts(cat._id, cat.slug);
            await Product.insertMany(products);
            total += products.length;
            console.log(`  → ${products.length} produits pour "${cat.name}"`);
        }

        console.log(`\n✅ Done! ${total} produits insérés.\n`);
        process.exit(0);
    } catch (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }
};

seedDB();
