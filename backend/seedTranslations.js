require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const translationsDict = {
    // Vetements
    "Body Manches Longues Blanc": {
        en: { name: "White Long Sleeve Onesie", description: "Soft organic cotton baby onesie, perfect for all seasons." },
        por: { name: "Body Manga Longa Branco", description: "Body macio de algodão orgânico para bebê, perfeito para todas as estações." }
    },
    "Pyjama Grenouillère Étoiles": {
        en: { name: "Star Print Romper Pajamas", description: "Warm star-printed romper for soft and comfortable nights." },
        por: { name: "Macacão Pijama Estrelas", description: "Macacão quente com estampa de estrelas para noites suaves e confortáveis." }
    },
    "Chapeau de Soleil Bébé": {
        en: { name: "Baby Sun Hat", description: "UPF50+ sun protection hat for sunny outings." },
        por: { name: "Chapéu de Sol para Bebê", description: "Chapéu de proteção solar UPF50+ para passeios ensolarados." }
    },
    "Chaussettes Antidérapantes Pack x5": {
        en: { name: "Non-Slip Socks 5-Pack", description: "Set of 5 pairs of colorful socks with non-slip soles." },
        por: { name: "Meias Antiderrapantes Pacote x5", description: "Conjunto de 5 pares de meias coloridas com sola antiderrapante." }
    },
    "Gilet Tricoté Beige": {
        en: { name: "Beige Knitted Cardigan", description: "Soft knit cardigan, button closure, Scandinavian style." },
        por: { name: "Cardigã de Tricô Bege", description: "Cardigã de malha macia, fecho de botões, estilo escandinavo." }
    },
    "Set 3 Bodies Pastel": {
        en: { name: "Set of 3 Pastel Onesies", description: "Set of 3 onesies in coordinated pastel tones. 100% cotton." },
        por: { name: "Conjunto 3 Bodies Pastel", description: "Conjunto de 3 bodies em tons pastel coordenados. 100% algodão." }
    },
    "Jean Souple Élastiqué": {
        en: { name: "Soft Elastic Jeans", description: "Lightweight jeans with elastic waistband, absolute comfort for playtime." },
        por: { name: "Jeans Macio com Elástico", description: "Jeans leve com cintura elástica, conforto absoluto para brincar." }
    },
    "Manteau en Polaire Rose": {
        en: { name: "Pink Fleece Coat", description: "Warm soft fleece coat, removable hood." },
        por: { name: "Casaco de Lã Rosa", description: "Casaco quente de lã macia, capuz removível." }
    },
    "Brassière Velours Doux": {
        en: { name: "Soft Velvet Bra Top", description: "Ultra-soft velvet top for newborns." },
        por: { name: "Sutiã de Veludo Macio", description: "Blusa de veludo ultra macia para recém-nascidos." }
    },
    "Salopette en Lin Naturel": {
        en: { name: "Natural Linen Overalls", description: "Summer overalls in breathable natural linen, bohemian look." },
        por: { name: "Jardineira de Linho Natural", description: "Jardineira de verão em linho natural respirável, visual boêmio." }
    },

    // Jouets
    "Cube de Découverte Musical": {
        en: { name: "Musical Discovery Cube", description: "Wooden cube with buttons, mirror, music, and various textures." },
        por: { name: "Cubo de Descoberta Musical", description: "Cubo de madeira com botões, espelho, música e várias texturas." }
    },
    "Peluche Ours Polaire 40cm": {
        en: { name: "Polar Bear Plush 40cm", description: "Ultra-soft CE certified plush, machine washable." },
        por: { name: "Pelúcia Urso Polar 40cm", description: "Pelúcia ultra macia com certificação CE, lavável à máquina." }
    },
    "Mobile pour Berceau Arc-en-Ciel": {
        en: { name: "Rainbow Crib Mobile", description: "Musical mobile with hanging pastel shapes to stimulate development." },
        por: { name: "Móbile de Berço Arco-íris", description: "Móbile musical com formas em tons pastel penduradas para estimular o desenvolvimento." }
    },
    "Anneaux de Dentition Silicone": {
        en: { name: "Silicone Teething Rings", description: "Food-grade silicone teething rings, BPA-free." },
        por: { name: "Anéis de Dentição de Silicone", description: "Anéis de dentição em silicone de qualidade alimentar, sem BPA." }
    },
    "Set Empilage Bois Coloré": {
        en: { name: "Colorful Wooden Stacking Set", description: "Painted natural wood stacking tower, 6 rings." },
        por: { name: "Conjunto Empilhável de Madeira Colorida", description: "Torre de empilhar em madeira natural pintada, 6 anéis." }
    },
    "Tapis d'Éveil avec Arche": {
        en: { name: "Playmat with Arch", description: "Playmat with arch, hanging toys, and music. Washable." },
        por: { name: "Tapete de Atividades com Arco", description: "Tapete de atividades com arco, brinquedos pendurados e música. Lavável." }
    },
    "Livre en Tissu Sensoriel": {
        en: { name: "Sensory Cloth Book", description: "Book with textures, mirror, and sounds to stimulate the senses." },
        por: { name: "Livro de Tecido Sensorial", description: "Livro com texturas, espelho e sons para estimular os sentidos." }
    },
    "Xylophone en Bois": {
        en: { name: "Wooden Xylophone", description: "Colorful xylophone with mallet, musical awakening from 12 months." },
        por: { name: "Xilofone de Madeira", description: "Xilofone colorido com baqueta, despertar musical a partir de 12 meses." }
    },
    "Hochet Girafe Caoutchouc": {
        en: { name: "Rubber Giraffe Rattle", description: "Natural rubber rattle, perfect for sensitive gums." },
        por: { name: "Chocalho de Girafa de Borracha", description: "Chocalho de borracha natural, perfeito para gengivas sensíveis." }
    },
    "Puzzle Animaux 9 pièces": {
        en: { name: "Animal Puzzle 9 pieces", description: "Illustrated wooden puzzle with 9 animals and their slots." },
        por: { name: "Quebra-cabeça de Animais 9 peças", description: "Quebra-cabeça de madeira ilustrado com 9 animais e seus encaixes." }
    },

    // Alimentation
    "Biberon Anti-colique 260ml": {
        en: { name: "Anti-Colic Bottle 260ml", description: "Bottle with patented anti-colic system, adaptive silicone teat." },
        por: { name: "Mamadeira Antissuper 260ml", description: "Mamadeira com sistema anticólica patenteado, bico de silicone adaptável." }
    },
    "Set 3 Biberons Verre": {
        en: { name: "Set of 3 Glass Bottles", description: "Set of 3 borosilicate glass bottles with silicone sleeve." },
        por: { name: "Conjunto 3 Mamadeiras de Vidro", description: "Conjunto de 3 mamadeiras de vidro borossilicato com capa de silicone." }
    },
    "Bavoir Imperméable Silicone x3": {
        en: { name: "Waterproof Silicone Bib 3-Pack", description: "Set of 3 silicone bibs with catch pocket, dishwasher safe." },
        por: { name: "Babador Impermeável Silicone x3", description: "Conjunto de 3 babadores de silicone com bolso coletor, laváveis na máquina." }
    },
    "Petite Cuillère Silicone Set 4pcs": {
        en: { name: "Small Silicone Spoon Set 4pcs", description: "Set of soft silicone spoons, 4 different colors." },
        por: { name: "Conjunto de Colheres Pequenas de Silicone 4pcs", description: "Conjunto de colheres macias de silicone, 4 cores diferentes." }
    },
    "Chauffe-biberon Portable USB": {
        en: { name: "Portable USB Bottle Warmer", description: "USB rechargeable portable bottle warmer compatible with all brands." },
        por: { name: "Aquecedor de Mamadeira Portátil USB", description: "Aquecedor de mamadeira portátil recarregável via USB compatível com todas as marcas." }
    },
    "Bol et Assiette Ventouse Bébé": {
        en: { name: "Baby Suction Bowl and Plate", description: "Bowl + plate with integrated suction cup, BPA-free food silicone." },
        por: { name: "Tigela e Prato com Ventosa para Bebê", description: "Tigela + prato com ventosa integrada, silicone alimentar sem BPA." }
    },
    "Gobelet Sippy Cup 200ml": {
        en: { name: "Sippy Cup 200ml", description: "Trainer cup with rounded spout, ergonomic handles." },
        por: { name: "Copo Sippy 200ml", description: "Copo de treinamento com bico arredondado, alças ergonômicas." }
    },
    "Coussin d'Allaitement Grand Luxe": {
        en: { name: "Luxury Nursing Pillow", description: "Large washable cotton nursing pillow, firm padding." },
        por: { name: "Almofada de Amamentação Luxo", description: "Almofada de amamentação grande em algodão lavável, enchimento firme." }
    },
    "Blender Bébé Nomade USB": {
        en: { name: "Portable USB Baby Blender", description: "USB rechargeable portable blender for homemade purees on the go." },
        por: { name: "Liquidificador de Bebê Portátil USB", description: "Liquidificador portátil recarregável USB para purês caseiros em movimento." }
    },
    "Tétine Orthodontique Pack 2": {
        en: { name: "Orthodontic Pacifier 2-Pack", description: "Pack of 2 silicone orthodontic pacifiers, 0-6 months." },
        por: { name: "Chupeta Ortodôntica Pacote com 2", description: "Pacote com 2 chupetas ortodônticas de silicone, 0-6 meses." }
    },

    // Hygiene
    "Shampoing Doux Bébé 250ml": {
        en: { name: "Gentle Baby Shampoo 250ml", description: "Sulfate and paraben free shampoo for baby's delicate scalp." },
        por: { name: "Shampoo Suave para Bebê 250ml", description: "Shampoo sem sulfato e sem parabenos para o couro cabeludo delicado do bebê." }
    },
    "Lingettes Biodégradables x80": {
        en: { name: "Biodegradable Wipes x80", description: "Biodegradable aloe vera wipes, fragrance-free, for sensitive skin." },
        por: { name: "Lenços Umedecidos Biodegradáveis x80", description: "Lenços biodegradáveis de aloe vera, sem perfume, para peles sensíveis." }
    },
    "Thermomètre Sans Contact": {
        en: { name: "Non-Contact Thermometer", description: "Infrared forehead thermometer, results in 1 second, 30 measurements memory." },
        por: { name: "Termômetro Sem Contato", description: "Termômetro infravermelho de testa, resultado em 1 segundo, memória para 30 medições." }
    },
    "Kit Bain Bébé Complet": {
        en: { name: "Complete Baby Bath Kit", description: "Complete kit: soft brush, comb, natural sponge and hypoallergenic soap." },
        por: { name: "Kit de Banho Completo para Bebê", description: "Kit completo: escova macia, pente, esponja natural e sabonete hipoalergênico." }
    },
    "Crème Change Protectrice 75ml": {
        en: { name: "Protective Diaper Cream 75ml", description: "Protective cream with calendula and zinc extracts, against diaper rash." },
        por: { name: "Creme Protetor de Fralda 75ml", description: "Creme protetor com extratos de calêndula e zinco, contra assaduras." }
    },
    "Coupe-ongles Bébé Safety Set": {
        en: { name: "Baby Nail Clipper Safety Set", description: "Nail clipper with safety guide and soft file included." },
        por: { name: "Conjunto de Segurança Cortador de Unhas", description: "Cortador de unhas com guia de segurança e lixa suave incluída." }
    },
    "Huile de Massage Lavande 100ml": {
        en: { name: "Lavender Massage Oil 100ml", description: "Plant oil with lavender for relaxing massages before bedtime." },
        por: { name: "Óleo de Massagem de Lavanda 100ml", description: "Óleo vegetal com lavanda para massagens relaxantes antes de dormir." }
    },
    "Mouche-bébé Électrique Silencieux": {
        en: { name: "Silent Electric Baby Nasal Aspirator", description: "Silent electric nasal aspirator with 4 tips." },
        por: { name: "Aspirador Nasal Elétrico Silencioso", description: "Aspirador nasal elétrico silencioso com 4 pontas." }
    },
    "Couches Naturelles T3 Pack 44": {
        en: { name: "Natural Diapers T3 44-Pack", description: "Biodegradable disposable diapers size 3 (4-9kg). No chlorine or fragrance." },
        por: { name: "Fraldas Naturais T3 Pacote 44", description: "Fraldas descartáveis biodegradáveis tamanho 3 (4-9kg). Sem cloro ou perfume." }
    },
    "Gel Dentaire Naturel 45ml": {
        en: { name: "Natural Teething Gel 45ml", description: "Gel for first teeth, fluoride-free, natural strawberry flavor." },
        por: { name: "Gel Dental Natural 45ml", description: "Gel para primeiros dentes, sem flúor, sabor natural de morango." }
    },

    // Mobilier
    "Lit Bébé Évolutif Barreaux": {
        en: { name: "Convertible Baby Crib with Bars", description: "Convertible crib 60x120cm, transforms into a toddler bed. FSC certified solid wood." },
        por: { name: "Berço de Bebê Conversível", description: "Berço evolutivo 60x120cm, transforma-se em cama infantil. Madeira maciça certificada FSC." }
    },
    "Table à Langer avec Baignoire": {
        en: { name: "Changing Table with Bathtub", description: "Foldable changing table with removable bathtub and storage shelf." },
        por: { name: "Trocador com Banheira", description: "Trocador dobrável com banheira removível e prateleira de armazenamento." }
    },
    "Transat Bébé Vibrant": {
        en: { name: "Vibrating Baby Bouncer", description: "Bouncer with soothing vibrations and toy arch, 0-9 months." },
        por: { name: "Cadeira de Balanço Vibratória para Bebê", description: "Cadeirinha com vibrações suaves e arco de brinquedos, 0-9 meses." }
    },
    "Couffin Naturel en Osier": {
        en: { name: "Natural Wicker Bassinet", description: "Natural wicker bassinet with washable cotton mattress. Comes with wooden stand." },
        por: { name: "Moisés de Vime Natural", description: "Moisés em vime natural com colchão de algodão lavável. Acompanha suporte de madeira." }
    },
    "Mobile Musical Berceau": {
        en: { name: "Musical Crib Mobile", description: "Musical mobile to attach to crib, turns slowly with 3 gentle melodies." },
        por: { name: "Móbile Musical para Berço", description: "Móbile musical para fixar no berço, gira lentamente com 3 melodias suaves." }
    },
    "Commode 3 Tiroirs Blanc Arrondi": {
        en: { name: "Rounded White 3-Drawer Dresser", description: "3-drawer dresser with rounded front, convertible changing top." },
        por: { name: "Cômoda Branca com 3 Gavetas", description: "Cômoda com 3 gavetas e frente arredondada, tampo conversível para troca de fraldas." }
    },
    "Tapis Chambre Rond 120cm": {
        en: { name: "Round Nursery Rug 120cm", description: "Soft round rug 120cm diameter, machine washable, star design." },
        por: { name: "Tapete Redondo Quarto 120cm", description: "Tapete redondo macio 120cm de diâmetro, lavável na máquina, design de estrela." }
    },
    "Veilleuse Nuage LED Rechargeable": {
        en: { name: "Rechargeable LED Cloud Nightlight", description: "Cloud shape nightlight with 7 colors and timer, USB rechargeable." },
        por: { name: "Luz Noturna Nuvem LED Recarregável", description: "Luz noturna em forma de nuvem com 7 cores e temporizador, recarregável via USB." }
    },
    "Boîte à Musique Bois Ours": {
        en: { name: "Wooden Bear Music Box", description: "Solid wood mechanical music box with gentle melody." },
        por: { name: "Caixa de Música de Urso de Madeira", description: "Caixa de música mecânica em madeira maciça com melodia suave." }
    },
    "Chaise Haute Réglable Bois": {
        en: { name: "Adjustable Wooden Highchair", description: "Height-adjustable solid wood highchair, 5-point safety harness." },
        por: { name: "Cadeira Alta de Madeira Ajustável", description: "Cadeira alta em madeira maciça com altura ajustável, cinto de segurança de 5 pontos." }
    }
};

const updateDB = async () => {
    try {
        await connectDB();
        console.log('Connected to DB...');

        const products = await Product.find({});
        for (let p of products) {
            if (translationsDict[p.name]) {
                p.translations = translationsDict[p.name];
                await p.save();
                console.log(`Updated translation for ${p.name}`);
            } else {
                console.log(`No translation found for ${p.name}`);
            }
        }

        console.log(`\n✅ Done! Translations added.\n`);
        process.exit(0);
    } catch (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }
};

updateDB();
