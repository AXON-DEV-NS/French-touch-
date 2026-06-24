export type Language = 'ar' | 'en' | 'fr' | 'it';

export interface LocalizedString {
  ar: string;
  en: string;
  fr: string;
  it: string;
}

export type Category = string;

export interface CategoryItem {
  id: string;
  name: LocalizedString;
  icon?: string;
}

export interface CustomizeOption {
  id: string;
  name: LocalizedString;
  price: number;
}

export interface Product {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  category: Category;
  image: string;
  canHaveAddons?: boolean;
  canHaveSauces?: boolean;
}

export interface ExclusiveOffer {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  discount: string;
  endTime: string; // ISO date string
  image: string;
  active: boolean;
}

export interface WeeklyOffer {
  dayOfWeek: number; // 0: Sunday, 1: Monday, ... 6: Saturday
  title: LocalizedString;
  description: LocalizedString;
  discount: string;
  active: boolean;
}

export interface Manager {
  email: string;
  name: string;
  addedAt: string;
}

export const LANGUAGES: { code: Language; name: string; flag: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'ar', name: 'العربية', flag: '🇪🇬', dir: 'rtl' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
];

export const TRANSLATIONS = {
  ar: {
    appName: 'فرنش تاتش',
    tagline: 'حيث تلتقي الفخامة الفرنسية بالدفء الإيطالي في القاهرة',
    menu: 'قائمة الطعام',
    offers: 'العروض المميزة',
    branches: 'فروعنا',
    about: 'قصتنا',
    adminPanel: 'لوحة الإدارة',
    superPanel: 'لوحة التحكم للمطور',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    clientView: 'عرض العميل',
    addManager: 'إضافة مدير جديد',
    managersList: 'قائمة المدراء',
    emailPlaceholder: 'البريد الإلكتروني (مثال: manager@gmail.com)',
    addBtn: 'إضافة',
    removeBtn: 'إلغاء الصلاحية',
    noManagers: 'لا يوجد مدراء مضافين حالياً.',
    categories: {
      appetizers: 'مقبلات شهية',
      mains: 'أطباق رئيسية فاخرة',
      desserts: 'حلويات فرنسية وإيطالية',
      drinks: 'مشروبات منعشة',
    },
    exclusiveOffer: 'عرض حصري لفترة محدودة',
    weeklyOffer: 'عرض اليوم الأسبوعي الدوري',
    hours: 'ساعة',
    minutes: 'دقيقة',
    seconds: 'ثانية',
    endsIn: 'ينتهي خلال',
    offerEnded: 'انتهى العرض الحصري',
    todayRecurringOffer: 'العرض الأسبوعي المتكرر لليوم',
    noOfferToday: 'لا يوجد عرض خاص اليوم، ترقبوا عروضنا القادمة!',
    addProduct: 'إضافة منتج جديد',
    editProduct: 'تعديل منتج',
    productName: 'اسم المنتج',
    productDescription: 'وصف المنتج',
    price: 'السعر',
    category: 'الفئة',
    imageUrl: 'رابط الصورة',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    required: 'مطلوب',
    loginWithGoogle: 'تسجيل الدخول بواسطة Google',
    loginSuccess: 'تم تسجيل الدخول بنجاح كمدير',
    notAuthorized: 'عذراً، هذا البريد الإلكتروني ليس لديه صلاحية مدير.',
    cairoLocations: 'مواقعنا في القاهرة',
    wahaBranch: 'فرع الواحة (مدينة نصر)',
    medicalBranch: 'فرع المركز الطبي 3 (التجمع الخامس)',
    address: 'العنوان',
    phone: 'رقم الهاتف',
    workingHours: 'أوقات العمل',
    getDirections: 'احصل على الاتجاهات',
    reserveTable: 'حجز طاولة',
    currency: 'ج.م',
    viewMenuBtn: 'تصفح القائمة',
    showExclusiveOffers: 'شاهد العروض الحصرية',
    aboutText: 'تأسس مطعم French Touch ليقدم تجربة طهي فريدة تدمج بين دقة وفخامة المطبخ الفرنسي الكلاسيكي ودفء وبهجة الأطباق الإيطالية التقليدية. نختار مكوناتنا بعناية فائقة لنقدم لعملائنا في القاهرة أطباقاً لا تُنسى تعبر عن الفن والذوق الرفيع.',
    exclusiveBannerTitle: 'لا تفوت عروضنا الاستثنائية!',
    weeklyRecurringDay: 'يتكرر كل يوم {day}',
    days: {
      0: 'الأحد',
      1: 'الإثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
      5: 'الجمعة',
      6: 'السبت'
    },
    managerRequired: 'يجب أن تكون مديراً للقيام بهذا الإجراء.'
  },
  en: {
    appName: 'French Touch',
    tagline: 'Where French sophistication meets Italian culinary warmth in Cairo',
    menu: 'Our Menu',
    offers: 'Special Offers',
    branches: 'Our Branches',
    about: 'Our Story',
    adminPanel: 'Manager Panel',
    superPanel: 'Super Admin Panel',
    login: 'Login',
    logout: 'Logout',
    clientView: 'Client View',
    addManager: 'Authorize New Manager',
    managersList: 'Current Managers',
    emailPlaceholder: 'Email address (e.g., manager@gmail.com)',
    addBtn: 'Authorize',
    removeBtn: 'Revoke Permission',
    noManagers: 'No authorized managers yet.',
    categories: {
      appetizers: 'Gourmet Appetizers',
      mains: 'Signature Main Courses',
      desserts: 'French & Italian Pastries',
      drinks: 'Refreshing Beverages',
    },
    exclusiveOffer: 'Limited One-Time Exclusive Offer',
    weeklyOffer: 'Recurring Weekly Special',
    hours: 'Hrs',
    minutes: 'Mins',
    seconds: 'Secs',
    endsIn: 'Ends in',
    offerEnded: 'Exclusive Offer Ended',
    todayRecurringOffer: "Today's Recurring Offer",
    noOfferToday: 'No active recurring offer today. Stay tuned!',
    addProduct: 'Add New Product',
    editProduct: 'Edit Product',
    productName: 'Product Name',
    productDescription: 'Product Description',
    price: 'Price',
    category: 'Category',
    imageUrl: 'Image URL',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    required: 'Required',
    loginWithGoogle: 'Sign in with Google',
    loginSuccess: 'Successfully logged in as Manager',
    notAuthorized: 'Sorry, this email address is not an authorized manager.',
    cairoLocations: 'Our Cairo Locations',
    wahaBranch: 'El Waha Branch (Nasr City)',
    medicalBranch: 'Medical Center 3 Branch (New Cairo)',
    address: 'Address',
    phone: 'Phone',
    workingHours: 'Working Hours',
    getDirections: 'Get Directions',
    reserveTable: 'Reserve Table',
    currency: 'EGP',
    viewMenuBtn: 'Explore Menu',
    showExclusiveOffers: 'View Exclusive Offers',
    aboutText: 'French Touch was founded to offer a unique culinary experience merging the meticulous sophistication of classic French cuisine with the comforting warmth of traditional Italian dishes. We select premium ingredients with utmost care to deliver unforgettable art on a plate for our guests in Cairo.',
    exclusiveBannerTitle: 'Do not miss our outstanding culinary creations!',
    weeklyRecurringDay: 'Repeats every {day}',
    days: {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    },
    managerRequired: 'You must be logged in as a manager.'
  },
  fr: {
    appName: 'French Touch',
    tagline: 'Quand le raffinement français rencontre la chaleur italienne à Le Caire',
    menu: 'Notre Carte',
    offers: 'Offres Spéciales',
    branches: 'Nos Succursales',
    about: 'Notre Histoire',
    adminPanel: 'Portail Manager',
    superPanel: 'Portail Développeur',
    login: 'Connexion',
    logout: 'Déconnexion',
    clientView: 'Vue Client',
    addManager: 'Autoriser un Manager',
    managersList: 'Managers Actuels',
    emailPlaceholder: 'Adresse e-mail (ex: manager@gmail.com)',
    addBtn: 'Autoriser',
    removeBtn: 'Régler le privilège',
    noManagers: 'Aucun manager autorisé actuellement.',
    categories: {
      appetizers: 'Entrées Gourmandes',
      mains: 'Plats de Résistance Signature',
      desserts: 'Desserts Français & Italiens',
      drinks: 'Boissons Rafraîchissantes',
    },
    exclusiveOffer: 'Offre Exclusive Unique Temporaire',
    weeklyOffer: 'Spécial Hebdomadaire Récurrent',
    hours: 'H',
    minutes: 'Min',
    seconds: 'Sec',
    endsIn: 'Se termine dans',
    offerEnded: 'Offre exclusive expirée',
    todayRecurringOffer: "L'offre récurrente d'aujourd'hui",
    noOfferToday: "Pas d'offre récurrente aujourd'hui. Restez connectés !",
    addProduct: 'Ajouter un Produit',
    editProduct: 'Modifier le Produit',
    productName: 'Nom du Produit',
    productDescription: 'Description du Produit',
    price: 'Prix',
    category: 'Catégorie',
    imageUrl: 'URL de l\'image',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    required: 'Obligatoire',
    loginWithGoogle: 'Se connecter avec Google',
    loginSuccess: 'Connexion réussie en tant que Manager',
    notAuthorized: 'Désolé, cet e-mail n\'est pas configuré comme manager.',
    cairoLocations: 'Nos Adresses à Le Caire',
    wahaBranch: 'Succursale El Waha (Nasr City)',
    medicalBranch: 'Succursale Medical Center 3 (New Cairo)',
    address: 'Adresse',
    phone: 'Téléphone',
    workingHours: 'Heures d\'ouverture',
    getDirections: 'Obtenir l\'itinéraire',
    reserveTable: 'Réserver une table',
    currency: 'EGP',
    viewMenuBtn: 'Voir la Carte',
    showExclusiveOffers: 'Voir les Offres',
    aboutText: 'French Touch a été fondé pour proposer une expérience culinaire unique fusionnant le raffinement méticuleux de la gastronomie française classique avec la générosité réconfortante des spécialités italiennes traditionnelles. Nous sélectionnons nos ingrédients avec le plus grand soin.',
    exclusiveBannerTitle: 'Ne manquez pas nos créations d’exception !',
    weeklyRecurringDay: 'Se répète chaque {day}',
    days: {
      0: 'Dimanche',
      1: 'Lundi',
      2: 'Mardi',
      3: 'Mercredi',
      4: 'Jeudi',
      5: 'Vendredi',
      6: 'Samedi'
    },
    managerRequired: 'Vous devez être connecté en tant que manager.'
  },
  it: {
    appName: 'French Touch',
    tagline: 'Dove la raffinatezza francese incontra il calore italiano a Il Cairo',
    menu: 'Il Nostro Menu',
    offers: 'Offerte Speciali',
    branches: 'Le Nostre Sedi',
    about: 'La Nostra Storia',
    adminPanel: 'Pannello Manager',
    superPanel: 'Pannello Sviluppatore',
    login: 'Accedi',
    logout: 'Esci',
    clientView: 'Vista Cliente',
    addManager: 'Autorizza Nuovo Manager',
    managersList: 'Manager Autorizzati',
    emailPlaceholder: 'Indirizzo e-mail (es: manager@gmail.com)',
    addBtn: 'Autorizza',
    removeBtn: 'Revoca Accesso',
    noManagers: 'Nessun manager autorizzato al momento.',
    categories: {
      appetizers: 'Antipasti Gourmet',
      mains: 'Piatti Forti d’Autore',
      desserts: 'Pasticceria Francese e Italiana',
      drinks: 'Bevande Rinfrescanti',
    },
    exclusiveOffer: 'Offerta Esclusiva a Tempo Limitato',
    weeklyOffer: 'Specialità Settimanale Ricorrente',
    hours: 'Ore',
    minutes: 'Min',
    seconds: 'Sec',
    endsIn: 'Scade tra',
    offerEnded: 'Offerta Esclusiva Scaduta',
    todayRecurringOffer: "L'offerta ricorrente di oggi",
    noOfferToday: 'Nessuna offerta ricorrente oggi. Rimanete sintonizzati!',
    addProduct: 'Aggiungi Prodotto',
    editProduct: 'Modifica Prodotto',
    productName: 'Nome Prodotto',
    productDescription: 'Descrizione Prodotto',
    price: 'Prezzo',
    category: 'Categoria',
    imageUrl: 'URL Immagine',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    required: 'Obbligatorio',
    loginWithGoogle: 'Accedi con Google',
    loginSuccess: 'Accesso effettuato come Manager',
    notAuthorized: 'Spiacenti, questa e-mail non è autorizzata come manager.',
    cairoLocations: 'Sedi a Il Cairo',
    wahaBranch: 'Sede El Waha (Nasr City)',
    medicalBranch: 'Sede Medical Center 3 (New Cairo)',
    address: 'Indirizzo',
    phone: 'Telefono',
    workingHours: 'Orari di Lavoro',
    getDirections: 'Ottieni Indicazioni',
    reserveTable: 'Prenota un Tavolo',
    currency: 'EGP',
    viewMenuBtn: 'Esplora il Menu',
    showExclusiveOffers: 'Vedi le Offerte',
    aboutText: 'French Touch nasce per offrire un’esperienza culinaria unica, fondendo la meticolosa raffinatezza della cucina classica francese con il calore accogliente dei piatti tradizionali italiani. Selezioniamo ingredienti premium con la massima cura per servire arte pura su ogni piatto.',
    exclusiveBannerTitle: 'Non perdere le nostre eccezionali creazioni culinarie!',
    weeklyRecurringDay: 'Si ripete ogni {day}',
    days: {
      0: 'Domenica',
      1: 'Lunedì',
      2: 'Martedì',
      3: 'Mercoledì',
      4: 'Giovedì',
      5: 'Venerdì',
      6: 'Sabato'
    },
    managerRequired: 'Devi essere registrato come manager.'
  }
};
