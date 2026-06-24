import { Product, ExclusiveOffer, WeeklyOffer, Manager, CustomizeOption } from './types';

export const INITIAL_MANAGERS: Manager[] = [
  {
    email: 'uvyffi5@gmail.com',
    name: 'Super Admin',
    addedAt: new Date('2026-06-20').toISOString()
  },
  {
    email: 'manager@frenchtouch.com',
    name: 'Jean-Luc Marc',
    addedAt: new Date('2026-06-21').toISOString()
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: {
      ar: 'سلطة كابريزي الكلاسيكية',
      en: 'Classic Caprese Salad',
      fr: 'Salade Caprese Classique',
      it: 'Insalata Caprese Classica'
    },
    description: {
      ar: 'شرائح طماطم طازجة، جبنة موزاريلا بوفالا، أوراق ريحان بري، وزيت زيتون بكر ممتاز مع بلسمك معتق.',
      en: 'Fresh vine-ripened tomatoes, creamy buffalo mozzarella, wild sweet basil, and extra virgin olive oil drizzled with aged balsamic glaze.',
      fr: 'Tomates fraîches bien mûres, mozzarella de bufflonne crémeuse, basilic sauvage et huile d\'olive extra vierge arrosée de glaçage balsamique vieilli.',
      it: 'Pomodori freschi maturi, mozzarella di bufala cremosa, basilico selvatico fresco, olio extravergine d\'oliva e riduzione di aceto balsamico invecchiato.'
    },
    price: 240,
    category: 'appetizers',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p2',
    name: {
      ar: 'حساء البصل الفرنسي الكلاسيكي',
      en: 'Classic French Onion Soup',
      fr: 'Soupe à l\'Oignon Classique',
      it: 'Zuppa di Cipolle alla Francese'
    },
    description: {
      ar: 'بصل مكرمل ببطء في مرق لحم غني، يعلوه خبز محمص فرنسي مقرمش وجبنة غرويير غنية تذوب بالفرن.',
      en: 'Slow-caramelized sweet onions in a rich beef bone broth, topped with a crispy French baguette crouton and melted Gruyère cheese.',
      fr: 'Oignons doux caramélisés lentement dans un riche bouillon de bœuf, garni d\'un crouton de baguette croustillante et de fromage Gruyère fondu.',
      it: 'Cipolle dolci caramellate lentamente in brodo ristretto di manzo, con crostino di baguette croccante e formaggio Gruyère fuso.'
    },
    price: 190,
    category: 'appetizers',
    image: 'https://images.unsplash.com/photo-1620418029653-8d0705f41656?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p3',
    name: {
      ar: 'ستيك فيليه مينيون مع زبدة الترفل',
      en: 'Filet Mignon with Truffle Butter',
      fr: 'Filet Mignon au Beurre de Truffe',
      it: 'Filet Mignon al Burro di Tartufo'
    },
    description: {
      ar: 'قطعة لحم فيليه مشوية ببراعة، مغطاة بزبدة الترفل الأسود الفاخرة، تقدم مع بطاطس مهروسة بالثوم المكرمل وخضار سوتيه.',
      en: 'Tender grilled beef tenderloin topped with rich black truffle butter, served alongside roasted garlic mashed potatoes and glazed heirloom vegetables.',
      fr: 'Tendre filet de bœuf grillé nappé d\'un riche beurre à la truffe noire, servi avec une purée de pommes de terre à l\'ail rôti et des légumes glacés.',
      it: 'Tenerissimo filetto di manzo alla griglia sormontato da burro al tartufo nero, servito con purè di patate all\'aglio arrosto e verdure novelle glassate.'
    },
    price: 650,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p4',
    name: {
      ar: 'لازانيا بولونيز بالفرن',
      en: 'Baked Lasagna Bolognese',
      fr: 'Lasagne Bolognaise au Four',
      it: 'Lasagna Classica alla Bolognese'
    },
    description: {
      ar: 'طبقات من باستا البيض الطازجة، صلصة بولونيز اللحم البقري المطهوة ببطء، صلصة البشاميل الكريمية، مغطاة بجبنة البارميزان المعتقة.',
      en: 'Layers of fresh egg pasta sheets, slow-simmered beef ragù, creamy Béchamel sauce, baked to golden perfection with aged Parmigiano-Reggiano.',
      fr: 'Couches de pâtes fraîches aux œufs, ragoût de bœuf mijoté, sauce béchamel crémeuse, cuites au four avec du Parmigiano-Reggiano vieilli.',
      it: 'Sfoglia fresca all\'uovo, ragù bolognese di manzo a cottura lenta, besciamella cremosa, cotta al forno con Parmigiano-Reggiano 24 mesi.'
    },
    price: 380,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p5',
    name: {
      ar: 'كونفيت فخذ البط الفرنسي',
      en: 'Crispy French Duck Confit',
      fr: 'Confit de Canard Croustillant',
      it: 'Coscia d\'Anatra Confit'
    },
    description: {
      ar: 'فخذ بط مطبوخ ببطء في دهنه الخاص، ثم يُحمر حتى يصبح مقرمشاً، يقدم مع بطاطس مطهوة بصلصة إكليل الجبل الفواحة.',
      en: 'Slow-cooked duck leg cured in its own fat, seared until perfectly crispy, served over fingerling potatoes roasted with rosemary and garlic.',
      fr: 'Cuisse de canard confite dans sa propre graisse, saisie pour une peau croustillante, servie sur des pommes de terre sautées au romarin et à l\'ail.',
      it: 'Coscia d\'anatra cotta lentamente nel suo grasso, poi dorata al forno fino a renderla croccante, servita con patate arrosto al rosmarino.'
    },
    price: 520,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&w=600&q=80'
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
  },
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
    category: 'mains',
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
    category: 'mains',
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
    category: 'mains',
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
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
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
    category: 'appetizers',
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
    category: 'appetizers',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80',
    canHaveAddons: true,
    canHaveSauces: false
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
  }
];

// Dynamically generate default exclusive offer ending in 14 hours so countdown works immediately!
const tomorrowDate = new Date();
tomorrowDate.setHours(tomorrowDate.getHours() + 14);

export const INITIAL_EXCLUSIVE_OFFER: ExclusiveOffer = {
  id: 'o1',
  title: {
    ar: 'مهرجان التذوق الملكي الفرنسي الإيطالي',
    en: 'The Royal French-Italian Tasting Feast',
    fr: 'Le Festin Royal Franco-Italien',
    it: 'La Festa Reale Franco-Italiana'
  },
  description: {
    ar: 'احصل على خصم ٢٥٪ كامل على باقة تذوق فاخرة لشخصين تشمل المقبلات، الأطباق الرئيسية، والحلويات المستوحاة من الريف الفرنسي ومقاطعة توسكانا الإيطالية.',
    en: 'Receive a full 25% discount on a gourmet 3-course tasting menu for two, incorporating handpicked delicacies from Paris to Tuscany.',
    fr: 'Bénéficiez d\'une réduction de 25% sur un menu dégustation gastronomique en 3 services pour deux personnes, de Paris à la Toscane.',
    it: 'Ricevi uno sconto speciale del 25% su un menu degustazione di 3 portate per due persone, ispirato ai sapori di Parigi e della Toscana.'
  },
  discount: '25%',
  endTime: tomorrowDate.toISOString(),
  image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  active: true
};

export const INITIAL_WEEKLY_OFFERS: WeeklyOffer[] = [
  {
    dayOfWeek: 0, // Sunday
    title: {
      ar: 'غداء الأحد العائلي الإيطالي',
      en: 'Italian Family Sunday Lunch',
      fr: 'Déjeuner Familial Italien du Dimanche',
      it: 'Pranzo della Domenica in Famiglia'
    },
    description: {
      ar: 'اطلب طبقين رئيسيين واحصل على مقبلات كابريزي ومشروبين مجاناً لتستمتع مع عائلتك بدفء إيطاليا.',
      en: 'Order two main courses and receive a complimentary Caprese appetizer and two drinks to share.',
      fr: 'Commandez deux plats principaux et recevez une entrée Caprese et deux boissons gratuites à partager.',
      it: 'Ordina due piatti principali e ricevi un antipasto Caprese e due bevande in omaggio da condividere.'
    },
    discount: 'Free Appetizer & Drinks',
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
      ar: 'ثلاثاء الباستا الإيطالية الطازجة',
      en: 'Fresh Pasta Tuesdays',
      fr: 'Mardi Pâtes Fraîches Maison',
      it: 'Martedì della Pasta Fresca'
    },
    description: {
      ar: 'خصم ٢٠٪ على كافة أطباق الباستا واللازانيا الإيطالية الطازجة المحضرة يدوياً في مطبخنا.',
      en: 'Enjoy a delicious 20% discount on all our handmade fresh pasta and lasagna options.',
      fr: 'Profitez d\'une réduction de 20% sur toutes nos pâtes fraîches maison et nos lasagnes.',
      it: 'Goditi uno sconto speciale del 20% su tutte le nostre paste fresche fatte a mano e lasagne.'
    },
    discount: '20% OFF Pasta',
    active: true
  },
  {
    dayOfWeek: 3, // Wednesday
    title: {
      ar: 'أربعاء شريحة اللحم الفرنسية الفاخرة',
      en: 'French Steakhouse Wednesdays',
      fr: 'Mercredi Steakhouse Français',
      it: 'Mercoledì della Bistecca Francese'
    },
    description: {
      ar: 'خصم خاص ١٥٪ على طبق ستيك فيليه مينيون ببطاطس الثوم المكرمل وزبدة الترفل الشهيرة.',
      en: 'Savor our signature Filet Mignon with truffle butter at an exclusive 15% promotional discount.',
      fr: 'Savourez notre filet mignon signature au beurre de truffe avec une réduction exclusive de 15%.',
      it: 'Assapora il nostro Filet Mignon al burro di tartufo con uno sconto promozionale del 15%.'
    },
    discount: '15% OFF Steak',
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
      ar: 'جمعة المأكولات البحرية المتوسطية',
      en: 'Mediterranean Seafood Friday',
      fr: 'Vendredi des Fruits de Mer Méditerranéens',
      it: 'Venerdì del Pesce Mediterraneo'
    },
    description: {
      ar: 'ترقبوا أطباقاً بحرية مستوحاة من شواطئ نيس الفرنسية وساحل أمالفي الإيطالي يطرحها الشيف خصيصاً كل جمعة.',
      en: 'Indulge in special off-menu seafood delicacies inspired by the French Riviera and Amalfi coast.',
      fr: 'Savourez nos spécialités de poissons et fruits de mer inspirées de la Côte d\'Azur et de la côte amalfitaine.',
      it: 'Fatti tentare dai piatti speciali fuori menu ispirati alla Costiera Amalfitana e alla Costa Azzurra.'
    },
    discount: 'Chef\'s Special Platters',
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
