import { Product, ExclusiveOffer, WeeklyOffer, Manager, CustomizeOption } from './types';

export const INITIAL_MANAGERS: Manager[] = [];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p10',
    name: {
      ar: 'سماش برجر فرنش تاتش كلاسيك',
      en: 'Classic French Touch Smash',
      fr: 'Smash Burger Classique French Touch',
      it: 'Smash Burger Classico French Touch'
    },
    description: {
      ar: 'شريحتان من لحم البلدي الفاخر المفروم طازجاً، مغطاة بجبنة شيدر الذائبة، شرائح مخلل مقرمشة، بصل مكرمل وصوص سماش السري الخاص بنا.',
      en: 'Two fresh premium smash beef patties, topped with melted Cheddar, crunchy pickles, caramelized onions, and our secret house smash sauce.',
      fr: 'Deux galettes de bœuf fraîches pressées, garnies de Cheddar fondu, cornichons croquants, oignons caramélisés et notre sauce secrète.',
      it: 'Due polpette di manzo fresco schiacciate alla griglia, condite con Cheddar fuso, cetrioli croccanti, cipolle caramellate e salsa segreta.'
    },
    price: 290,
    category: 'sandwiches',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: true
  },
  {
    id: 'p11',
    name: {
      ar: 'سماش برجر المشروم والترفل الفاخر',
      en: 'Truffle Mushroom Smash',
      fr: 'Smash Burger Truffe & Champignons',
      it: 'Smash Burger Tartufo e Funghi'
    },
    description: {
      ar: 'شريحتان من اللحم البقري الطازج المقرمش، مغطاة بجبنة سويسرية غنية، مشروم سوتيه طازج، ورذاذ غني من مايونيز الترفل الأسود الفاخر.',
      en: 'Two crispy seared smash beef patties, topped with premium Swiss cheese, fresh sautéed mushrooms, and a luxurious drizzle of black truffle mayonnaise.',
      fr: 'Deux galettes de bœuf pressées croustillantes, garnies de fromage suisse de qualité supérieure, de champignons frais sautés et d\'un filet de mayonnaise à la truffe noire.',
      it: 'Due polpette di manzo schiacciate e croccanti, sormontate da formaggio svizzero premium, funghi freschi saltati e un filo di maionese al tartufo nero.'
    },
    price: 330,
    category: 'sandwiches',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: true
  },
  {
    id: 'p12',
    name: {
      ar: 'ساندوتش دجاج باريسيان المقرمش',
      en: 'Le Parisien Crispy Chicken Sandwich',
      fr: 'Sandwich Poulet Croustillant Le Parisien',
      it: 'Panino al Pollo Croccante Le Parisien'
    },
    description: {
      ar: 'صدر دجاج مقرمش ذهبي متبل بالأعشاب، يعلوه جبنة سويسرية ذائبة، خس طازج، شرائح خيار مخلل، ومايونيز الثوم المقرمش بداخل خبز بريوش طازج.',
      en: 'Golden crispy chicken breast seasoned with fine herbs, topped with melted Swiss cheese, fresh lettuce, pickles, and garlic aioli in a toasted brioche bun.',
      fr: 'Blanc de poulet doré et croustillant assaisonné d\'herbes fines, garni de fromage suisse fondu, laitue fraîche, cornichons et aïoli à l\'ail dans un pain brioché grillé.',
      it: 'Petto di pollo dorato e croccante condito con erbe aromatiche, sormontato da formaggio svizzero fuso, lattuga fresca, cetrioli e aioli all\'aglio in un soffice pan brioche.'
    },
    price: 260,
    category: 'sandwiches',
    image: 'https://images.unsplash.com/photo-1627662236973-4f8259fa2441?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: true
  },
  {
    id: 'p13',
    name: {
      ar: 'رول باجيت كوردون بلو الفاخر',
      en: 'Premium Cordon Bleu Baguette Roll',
      fr: 'Roulé Baguette Cordon Bleu Premium',
      it: 'Rotolo di Cordon Bleu in Baguette'
    },
    description: {
      ar: 'صدور دجاج كوردون بلو مقرمشة ومحشوة بالجبنة الغنية والبيكون البقري، مع صلصة جبنة شيدر الكريمية وخس طازج في خبز باجيت فرنسي مقرمش.',
      en: 'Crispy cordon bleu chicken rolls stuffed with premium cheese and beef bacon, layered with creamy Cheddar cheese sauce and fresh lettuce in a crusty French baguette.',
      fr: 'Rouleaux de poulet cordon bleu croustillants farcis de fromage de qualité supérieure et de bacon de bœuf, recouverts d\'une sauce crémeuse au cheddar et de laitue fraîche dans une baguette française croustillante.',
      it: 'Rotoli di cordon bleu di pollo croccanti ripieni di formaggio e bacon di manzo, con salsa cremosa al Cheddar e lattuga fresca in una baguette francese croccante.'
    },
    price: 285,
    category: 'sandwiches',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: true
  },
  {
    id: 'p16',
    name: {
      ar: 'ساندوتش دبل تشيز برجر باريس',
      en: 'Double Paris Cheeseburger',
      fr: 'Double Cheeseburger de Paris',
      it: 'Double Paris Cheeseburger'
    },
    description: {
      ar: 'شريحتان من اللحم البقري الطازج المشوي على اللهب، دبل شيدر مستورد، بصل مكرمل فرنسي فاخر، ومسطردة ديجون بالذوق الفرنسي الرفيع.',
      en: 'Two flame-grilled premium beef patties, double imported Cheddar, gourmet French caramelized onions, and refined Dijon honey mustard sauce.',
      fr: 'Deux steaks hachés grillés de première qualité, double Cheddar importé, oignons caramélisés français gourmands, et sauce moutarde de Dijon affinée.',
      it: 'Due polpette di manzo di prima scelta cotte alla griglia, doppio Cheddar importato, cipolle caramellate francesi gourmet e salsa di senape di Digione.'
    },
    price: 310,
    category: 'sandwiches',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: true
  },
  {
    id: 'p14',
    name: {
      ar: 'بطاطس بلجيكية مقرمشة مع الأعشاب',
      en: 'Crispy Belgian Fries with Herbs',
      fr: 'Frites Belges Croustillantes aux Herbes',
      it: 'Patatine Belghe Croccanti alle Erbe'
    },
    description: {
      ar: 'أصابع بطاطس بلجيكية سميكة مقلية مرتين لتصبح مقرمشة وذهبية تماماً من الخارج وطرية من الداخل، متبلة بملح البحر وأعشاب فرنسية برية عطرية.',
      en: 'Thick-cut Belgian style potatoes, double-fried for ultimate crunch, fluffy inside, seasoned with sea salt and aromatic wild Provence herbs.',
      fr: 'Pommes de terre de style belge coupées épaisses, doublement frites pour un croustillant ultime, assaisonnées de sel de mer et d\'herbes de Provence sauvages.',
      it: 'Patate tagliate spesse in stile belga, fritte due volte per la massima croccantezza, morbide all\'interno, condite con sale marino ed erbe selvatiche di Provenza.'
    },
    price: 110,
    category: 'fries',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: false
  },
  {
    id: 'p15',
    name: {
      ar: 'بطاطس بالترفل وجبنة البارميزان الفاخرة',
      en: 'Truffle Parmesan Gourmet Fries',
      fr: 'Frites Gourmet Truffe & Parmesan',
      it: 'Patatine Gourmet al Tartufo e Parmigiano'
    },
    description: {
      ar: 'أصابع البطاطس الذهبية المقرمشة مغمورة بزيت الترفل الأبيض النقي، يعلوها كمية سخية من جبنة البارميزان المعتقة المبشورة طازجاً وبقدونس مفروم.',
      en: 'Crispy golden fries drizzled with aromatic pure white truffle oil, dusted generously with freshly grated aged Parmigiano-Reggiano and chopped Italian parsley.',
      fr: 'Frites dorées et croustillantes arrosées d\'huile aromatique de truffe blanche pure, généreusement saupoudrées de Parmigiano-Reggiano vieilli fraîchement râpé et de persil italien haché.',
      it: 'Patatine dorate croccanti irrorate con olio aromatico di tartufo bianco puro, generosamente spolverate con Parmigiano-Reggiano grattugiato fresco e prezzemolo tritato.'
    },
    price: 160,
    category: 'fries',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: false
  },
  {
    id: 'p17',
    name: {
      ar: 'سويت بطاطس لودد بالجبنة',
      en: 'Sweet Loaded Cheese Fries',
      fr: 'Frites de Patate Douce au Fromage',
      it: 'Patate Dolci Cariche di Formaggio'
    },
    description: {
      ar: 'أصابع بطاطا حلوة سميكة ومقرمشة مغطاة بصوص الشيدر الساخن الذائب، هالبينو حار مفروم، وذرات لحم بقري مقرمش مع صوص فرنش تاتش السري.',
      en: 'Crispy thick-cut sweet potato fries loaded with hot melted Cheddar cheese sauce, spicy minced jalapeños, crispy beef bacon bits, and our secret sauce.',
      fr: 'Frites de patates douces épaisses et croustillantes garnies d\'une sauce au fromage Cheddar chaud fondu, de jalapeños épicés hachés, de bacon de bœuf croustillant et de notre sauce secrète.',
      it: 'Patatine fritte di patate dolci spesse e croccanti ricoperte da salsa al formaggio Cheddar fuso, jalapeños tritati piccanti, pancetta di manzo croccante e la nostra salsa segreta.'
    },
    price: 150,
    category: 'fries',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: false
  },
  {
    id: 'p6',
    name: {
      ar: 'كريم بروليه بالفانيليا الفرنسية',
      en: 'Classic French Vanilla Crème Brûlée',
      fr: 'Crème Brûlée à la Vanille de Madagascar',
      it: 'Crème Brûlée alla Vaniglia'
    },
    description: {
      ar: 'كاسترد كريمي ناعم غني بحبوب فانيليا مدغشقر، مغطى بطبقة زجاجية مقرمشة من السكر المكرمل.',
      en: 'Rich, velvety custard base flavored with real Madagascar vanilla beans, topped with a textbook layer of hardened caramelized sugar.',
      fr: 'Crème anglaise riche et veloutée parfumée aux gousses de vanille de Madagascar, surmontée d\'une couche de sucre caramélisé croquant.',
      it: 'Crema vellutata ricca aromatizzata con vera vaniglia del Madagascar, sormontata da una croccante lastra di zucchero caramellato.'
    },
    price: 180,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p7',
    name: {
      ar: 'تيراميسو كلاسيكو إيطالي',
      en: 'Traditional Italian Tiramisu',
      fr: 'Tiramisu Classique Italien',
      it: 'Tiramisu Classico della Casa'
    },
    description: {
      ar: 'أصابع بسكويت سافوياردي مغموسة في إسبريسو غني، طبقات كريمية من جبن الماسكاربوني، ورشة كاكاو داكن نقي.',
      en: 'Espresso-soaked ladyfingers layered with whipped premium mascarpone cream, lightly dusted with pure Dutch dark cocoa powder.',
      fr: 'Biscuits cuillères imbibés d\'expresso, superposés de crème mascarpone fouettée, saupoudrés de pur cacao noir hollandais.',
      it: 'Savoiardi artigianali inzuppati nel caffè espresso forte, crema al mascarpone montata a neve e una spolverata di cacao amaro in polvere.'
    },
    price: 160,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p8',
    name: {
      ar: 'إسبريسو إيطالي فاخر',
      en: 'Premium Italian Espresso',
      fr: 'Expresso Italien Premium',
      it: 'Caffè Espresso Selezione Oro'
    },
    description: {
      ar: 'مزيج حبوب أرابيكا المحمصة ببطء في نابولي، مستخلص بدقة مع طبقة كريما ذهبية غنية ومكثفة.',
      en: 'A perfect shot of robust Arabica beans dark-roasted in Naples, extracted with a rich, velvety golden hazelnut crema.',
      fr: 'Un expresso corsé issu de grains d\'Arabica torréfiés à Naples, extrait avec une crème dorée veloutée.',
      it: 'Caffè espresso da miscela di pregiati grani Arabica, tostatura napoletana, estratto a regola d\'arte con crema color nocciola.'
    },
    price: 70,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-151097252790b-af4f42d910ae?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p9',
    name: {
      ar: 'ليمونادة اللافندر الفرنسية',
      en: 'French Lavender Lemonade',
      fr: 'Limonade Française à la Lavande',
      it: 'Limonata Francese alla Lavanda'
    },
    description: {
      ar: 'عصير ليمون طازج ممزوج بماء زهر اللافندر الفرنسي العضوي الفواح مع لمسة عسل خفيفة وصودا.',
      en: 'Fresh squeezed lemon juice infused with aromatic organic French lavender essence, lightly sweetened with honey and sparkling soda.',
      fr: 'Jus de citron fraîchement pressé infusé d\'essence de lavande biologique française, légèrement sucré au miel et eau gazeuse.',
      it: 'Succo di limone appena spremuto infuso con essenza aromatica di lavanda biologica francese, leggermente dolcificato con miele e soda.'
    },
    price: 110,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_ADDONS: CustomizeOption[] = [
  {
    id: 'a1',
    name: {
      ar: 'جبنة شيدر إضافية (+١٥ ج.م)',
      en: 'Extra Cheddar Cheese (+15 EGP)',
      fr: 'Cheddar Supplémentaire (+15 EGP)',
      it: 'Cheddar Extra (+15 EGP)'
    },
    price: 15
  },
  {
    id: 'a2',
    name: {
      ar: 'جبنة سويسرية إضافية (+٢٠ ج.م)',
      en: 'Extra Swiss Cheese (+20 EGP)',
      fr: 'Fromage Suisse Supplémentaire (+20 EGP)',
      it: 'Formaggio Svizzero Extra (+20 EGP)'
    },
    price: 20
  },
  {
    id: 'a3',
    name: {
      ar: 'بيكون بقري مقرمش (+٣٥ ج.م)',
      en: 'Crispy Beef Bacon (+35 EGP)',
      fr: 'Bacon de Bœuf Croustillant (+35 EGP)',
      it: 'Bacon di Manzo Croccante (+35 EGP)'
    },
    price: 35
  },
  {
    id: 'a4',
    name: {
      ar: 'مشروم سوتيه طازج (+٢٥ ج.م)',
      en: 'Sautéed Fresh Mushrooms (+25 EGP)',
      fr: 'Champignons Sautés (+25 EGP)',
      it: 'Funghi Saltati (+25 EGP)'
    },
    price: 25
  },
  {
    id: 'a5',
    name: {
      ar: 'هالابينو حار (+١٠ ج.م)',
      en: 'Spicy Jalapeños (+10 EGP)',
      fr: 'Jalapeños Épicés (+10 EGP)',
      it: 'Jalapeños Piccanti (+10 EGP)'
    },
    price: 10
  },
  {
    id: 'a6',
    name: {
      ar: 'بيض مقلي (+١٥ ج.م)',
      en: 'Fried Egg (+15 EGP)',
      fr: 'Oeuf au Plat (+15 EGP)',
      it: 'Uovo Fritto (+15 EGP)'
    },
    price: 15
  },
  {
    id: 'a7',
    name: {
      ar: 'شريحة لحم إضافية سماش (+٨٠ ج.م)',
      en: 'Extra Smash Patty (+80 EGP)',
      fr: 'Steak Haché Supplémentaire (+80 EGP)',
      it: 'Polpetta Extra (+80 EGP)'
    },
    price: 80
  },
  {
    id: 'a8',
    name: {
      ar: 'قطعة دجاج مقرمشة إضافية (+٧٠ ج.م)',
      en: 'Extra Crispy Chicken (+70 EGP)',
      fr: 'Poulet Croustillant Supplémentaire (+70 EGP)',
      it: 'Pollo Croccante Extra (+70 EGP)'
    },
    price: 70
  }
];

export const INITIAL_SAUCES: CustomizeOption[] = [
  {
    id: 's1',
    name: {
      ar: 'صوص فرنش تاتش السري (+١٠ ج.م)',
      en: 'Secret French Touch Sauce (+10 EGP)',
      fr: 'Sauce Secrète French Touch (+10 EGP)',
      it: 'Salsa Segreta French Touch (+10 EGP)'
    },
    price: 10
  },
  {
    id: 's2',
    name: {
      ar: 'مايونيز الترفل الفاخر (+١٥ ج.م)',
      en: 'Premium Truffle Mayo (+15 EGP)',
      fr: 'Mayo Truffée Premium (+15 EGP)',
      it: 'Maionese al Tartufo Premium (+15 EGP)'
    },
    price: 15
  },
  {
    id: 's3',
    name: {
      ar: 'آيولي الثوم الفرنسي (+١٠ ج.م)',
      en: 'French Garlic Aioli (+10 EGP)',
      fr: 'Aïoli à l\'Ail Français (+10 EGP)',
      it: 'Aioli all\'Aglio Francese (+10 EGP)'
    },
    price: 10
  },
  {
    id: 's4',
    name: {
      ar: 'مايونيز الهريسة الحار (+١٠ ج.م)',
      en: 'Spicy Harissa Mayo (+10 EGP)',
      fr: 'Mayo à la Harissa Épicée (+10 EGP)',
      it: 'Maionese alla Harissa Piccante (+10 EGP)'
    },
    price: 10
  },
  {
    id: 's5',
    name: {
      ar: 'صوص الباربكيو المدخن (+١٠ ج.م)',
      en: 'Smoky BBQ Sauce (+10 EGP)',
      fr: 'Sauce Barbecue Fumée (+10 EGP)',
      it: 'Salsa BBQ Affumicata (+10 EGP)'
    },
    price: 10
  },
  {
    id: 's6',
    name: {
      ar: 'صوص الشيدر السائح الفاخر (+٢٠ ج.م)',
      en: 'Melted Cheddar Sauce (+20 EGP)',
      fr: 'Sauce Cheddar Fondue (+20 EGP)',
      it: 'Salsa Cheddar Fusa (+20 EGP)'
    },
    price: 20
  }
];

// Dynamically generate default exclusive offer ending in 14 hours so countdown works immediately!
const tomorrowDate = new Date();
tomorrowDate.setHours(tomorrowDate.getHours() + 14);

export const INITIAL_EXCLUSIVE_OFFER: ExclusiveOffer = {
  id: 'o1',
  title: {
    ar: 'مهرجان التذوق الملكي فرنش تاتش',
    en: 'The Royal French Touch Feast',
    fr: 'Le Festin Royal French Touch',
    it: 'La Festa Reale French Touch'
  },
  description: {
    ar: 'احصل على خصم ٢٥٪ كامل على وجبة سماش برجر مزدوجة مع بطاطس الترفل الفاخرة ومشروب اللافندر الفواح.',
    en: 'Receive a full 25% discount on a premium combo of double smash burger, truffle parmesan fries, and fresh lavender lemonade.',
    fr: 'Bénéficiez d\'une réduction de 25% sur un combo premium comprenant un double smash burger, des frites à la truffe et du parmesan, et une limonade à la lavande.',
    it: 'Ricevi uno sconto speciale del 25% su una combinazione premium di double smash burger, patatine al tartufo e parmigiano e limonata alla lavanda.'
  },
  discount: '25%',
  endTime: tomorrowDate.toISOString(),
  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  active: true
};

export const INITIAL_WEEKLY_OFFERS: WeeklyOffer[] = [
  {
    dayOfWeek: 0, // Sunday
    title: {
      ar: 'عرض الأحد العائلي السعيد',
      en: 'Sunday Family Smash Feast',
      fr: 'Festin de Famille du Dimanche',
      it: 'Festa di Famiglia della Domenica'
    },
    description: {
      ar: 'اطلب أي ساندوتشين برجر أو تشيكن واحصل على بطاطس بلجيكية كبيرة ومشروبين مجاناً.',
      en: 'Order any two burgers or chicken sandwiches and receive a complimentary large Belgian fries and two drinks.',
      fr: 'Commandez deux burgers ou sandwiches au poulet et recevez une grande frite belge et deux boissons gratuites.',
      it: 'Ordina due hamburger o panini al pollo e ricevi patatine belghe grandi e due bevande in omaggio.'
    },
    discount: 'Free Fries & Drinks',
    active: true
  },
  {
    dayOfWeek: 1, // Monday
    title: {
      ar: 'إثنين الإسبريسو والتحلية المميزة',
      en: 'Espresso & Dessert Mondays',
      fr: 'Lundi Expresso & Dessert Gourmand',
      it: 'Lunedì Caffè Espresso & Tiramisù'
    },
    description: {
      ar: 'استمتع بنهاية مثالية لوجبتك: اطلب أي صنف حلوى فرنسي أو إيطالي واحصل على كوب إسبريسو نابولي مجاناً.',
      en: 'Perfect pairing: Order any French or Italian dessert and get a premium Napoletano espresso on us.',
      fr: 'Accord parfait : Commandez n\'importe quel dessert et l\'expresso napolitain vous est offert.',
      it: 'Abbinamento perfetto: Ordina un dolce qualsiasi e l\'espresso napoletano te lo offriamo noi.'
    },
    discount: 'Free Espresso',
    active: true
  },
  {
    dayOfWeek: 2, // Tuesday
    title: {
      ar: 'ثلاثاء البطاطس الذهبية والخصم الخاص',
      en: 'Golden Fries Tuesday',
      fr: 'Mardi des Frites Dorées',
      it: 'Martedì delle Patatine Dorate'
    },
    description: {
      ar: 'احصل على خصم ٣٠٪ على بطاطس الترفل والبارميزان أو البطاطس لودد بالجبنة عند طلب أي ساندوتش.',
      en: 'Get a 30% discount on Truffle Parmesan Fries or Sweet Loaded Cheese Fries with any sandwich purchase.',
      fr: 'Profitez d\'une réduction de 30% sur les frites à la truffe ou au fromage pour l\'achat d\'un sandwich.',
      it: 'Ricevi uno sconto del 30% sulle patatine al tartufo o cariche di formaggio acquistando un panino.'
    },
    discount: '30% OFF Fries',
    active: true
  },
  {
    dayOfWeek: 3, // Wednesday
    title: {
      ar: 'أربعاء السماش والبرجر المزدوج',
      en: 'Double Smash Wednesdays',
      fr: 'Mercredi Double Smash',
      it: 'Mercoledì Double Smash'
    },
    description: {
      ar: 'خصم خاص ١٥٪ على ساندوتش دبل تشيز برجر باريس أو سماش برجر فرنش تاتش كلاسيك.',
      en: 'Savor our signature Double Paris Cheeseburger or Classic Smash at an exclusive 15% promotional discount.',
      fr: 'Savourez notre Double Paris Cheeseburger ou Classic Smash avec une réduction exclusive de 15%.',
      it: 'Assapora il nostro Double Paris Cheeseburger o Classic Smash con uno sconto promozionale del 15%.'
    },
    discount: '15% OFF Smash',
    active: true
  },
  {
    dayOfWeek: 4, // Thursday
    title: {
      ar: 'خميس الأمسيات الباريسية الرومانسية',
      en: 'Parisian Romance Thursday Night',
      fr: 'Soirée Romantique Parisienne du Jeudi',
      it: 'Giovedì Notte Romantica Parigina'
    },
    description: {
      ar: 'كوب ليمونادة اللافندر مجاناً لكل ثنائي، مع موسيقى هادئة تضفي سحراً فريداً على ليلتكم.',
      en: 'Receive a complimentary French Lavender Lemonade mocktail for couples, accompanied by acoustic music.',
      fr: 'Recevez un cocktail Limonade à la lavande gratuit pour les couples, accompagné de musique acoustique.',
      it: 'Un cocktail alla Lavanda in omaggio per le coppie, con musica acustica di sottofondo.'
    },
    discount: 'Free Couples Mocktails',
    active: true
  },
  {
    dayOfWeek: 5, // Friday
    title: {
      ar: 'جمعة اللمة والتحميل اللذيذ',
      en: 'Loaded Friday Party',
      fr: 'Vendredi des Frites Chargées',
      it: 'Venerdì delle Patate Cariche'
    },
    description: {
      ar: 'اطلب أي ساندوتشين لودد واحصل على بطاطس لودد بالجبنة مجاناً بالكامل لتستمتع مع أصدقائك بليلة رائعة.',
      en: 'Order any two loaded sandwiches and get a free Sweet Loaded Cheese Fries to share with your friends.',
      fr: 'Commandez deux sandwiches chargés et recevez une frite de patate douce au fromage gratuite à partager.',
      it: 'Ordina due panini carichi e ricevi patate dolci cariche di formaggio in omaggio da condividere.'
    },
    discount: 'Free Loaded Fries',
    active: true
  },
  {
    dayOfWeek: 6, // Saturday
    title: {
      ar: 'سبت الكوكتيلات والحلويات المزدوجة',
      en: 'Sweet Saturday Delights',
      fr: 'Samedi des Douceurs Sucrées',
      it: 'Sabato del Dolce Raddoppio'
    },
    description: {
      ar: 'اطلب أي نوعين من الحلوى الفاخرة (كريم بروليه أو تيراميسو) واحصل على خصم ٣٠٪ على الحلوى الثانية.',
      en: 'Order any two of our premium desserts and enjoy a generous 30% discount on the second sweet plate.',
      fr: 'Commandez deux desserts haut de gamme et profitez d\'une réduction de 30% sur le second.',
      it: 'Ordina due dei nostri dessert artigianali e ricevi uno sconto del 30% sul secondo.'
    },
    discount: '30% OFF 2nd Dessert',
    active: true
  }
];
