import type { Copy } from '../copy';

interface Shell {
  skip: string;
  nav: { shop: string; worlds: string; collection: string; story: string; sets: string };
  header: {
    home: string;
    openMenu: string;
    closeMenu: string;
    menu: string;
    primary: string;
    search: string;
    wishlist: (n: number) => string;
    account: string;
    openBag: (n: number) => string;
    instagram: string;
    wishlistShort: string;
  };
  footer: {
    tagline: [string, string];
    worlds: string;
    house: string;
    service: string;
    story: string;
    account: string;
    wishlist: string;
    faq: string;
    contact: string;
    delivery: string;
    returns: string;
    imprint: string;
    privacy: string;
    terms: string;
  };
  roots: string;
  manifesto: string[];
  dock: { aria: string; shop: string; worlds: string; saved: string; bag: string };
  search: {
    label: string;
    labelHidden: string;
    placeholder: string;
    close: string;
    empty: (q: string) => string;
  };
  cart: {
    close: string;
    dialog: string;
    title: (n: number) => string;
    freeAway: (amount: string) => string;
    freeUnlocked: string;
    empty: string;
    emptySub: string;
    shop: string;
    decrease: (name: string) => string;
    increase: (name: string) => string;
    remove: string;
    subtotal: string;
    note: string;
    checkout: string;
  };
  toast: { removed: string; saved: string };
}

export const shell: Copy<Shell> = {
  en: {
    skip: 'Skip to content',
    nav: {
      shop: 'Shop',
      worlds: 'Worlds',
      collection: 'Collection 01',
      story: 'Story',
      sets: 'The Sets',
    },
    header: {
      home: 'NATYSIMO — home',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      menu: 'Menu',
      primary: 'Primary',
      search: 'Search',
      wishlist: (n) => `Wishlist, ${n} saved`,
      account: 'Account',
      openBag: (n) => `Open bag, ${n} items`,
      instagram: 'Instagram',
      wishlistShort: 'Wishlist',
    },
    footer: {
      tagline: ['Discipline', 'builds freedom.'],
      worlds: 'Worlds',
      house: 'House',
      service: 'Service',
      story: 'Story',
      account: 'Account',
      wishlist: 'Wishlist',
      faq: 'FAQ',
      contact: 'Contact',
      delivery: 'Delivery',
      returns: 'Returns · Widerruf',
      imprint: 'Imprint · Impressum',
      privacy: 'Privacy · Datenschutz',
      terms: 'Terms · AGB',
    },
    roots: 'Morocco · Germany',
    manifesto: ['Train', 'Grow', 'Evolve'],
    dock: { aria: 'Quick navigation', shop: 'Shop', worlds: 'Worlds', saved: 'Saved', bag: 'Bag' },
    search: {
      label: 'Search',
      labelHidden: 'Search NATYSIMO',
      placeholder: 'Search pieces, sets, worlds',
      close: 'Close search',
      empty: (q) => `Nothing for “${q}”. Try “tank”, “set” or “hoodie”.`,
    },
    cart: {
      close: 'Close bag',
      dialog: 'Shopping bag',
      title: (n) => `Bag (${n})`,
      freeAway: (amount) => `${amount} away from free shipping in Germany`,
      freeUnlocked: 'Free shipping in Germany unlocked',
      empty: 'Your bag is empty.',
      emptySub: 'Discipline first. Then the uniform.',
      shop: 'Shop Collection 01',
      decrease: (name) => `Decrease quantity of ${name}`,
      increase: (name) => `Increase quantity of ${name}`,
      remove: 'Remove',
      subtotal: 'Subtotal',
      note: 'Shipping and discounts calculated at checkout.',
      checkout: 'Checkout',
    },
    toast: { removed: 'Removed from wishlist', saved: 'Saved to wishlist' },
  },
  ar: {
    skip: 'انتقل إلى المحتوى',
    nav: {
      shop: 'المتجر',
      worlds: 'العوالم',
      collection: 'المجموعة 01',
      story: 'القصة',
      sets: 'الأطقم',
    },
    header: {
      home: 'NATYSIMO — الرئيسية',
      openMenu: 'فتح القائمة',
      closeMenu: 'إغلاق القائمة',
      menu: 'القائمة',
      primary: 'التنقل الرئيسي',
      search: 'بحث',
      wishlist: (n) => `المفضلة، ${n} محفوظة`,
      account: 'الحساب',
      openBag: (n) => `فتح السلة، ${n} قطع`,
      instagram: 'إنستغرام',
      wishlistShort: 'المفضلة',
    },
    footer: {
      tagline: ['الانضباط', 'يبني الحرية.'],
      worlds: 'العوالم',
      house: 'العلامة',
      service: 'الخدمة',
      story: 'القصة',
      account: 'الحساب',
      wishlist: 'المفضلة',
      faq: 'الأسئلة الشائعة',
      contact: 'تواصل معنا',
      delivery: 'التوصيل',
      returns: 'الإرجاع · Widerruf',
      imprint: 'بيانات الناشر · Impressum',
      privacy: 'الخصوصية · Datenschutz',
      terms: 'الشروط · AGB',
    },
    roots: 'المغرب · ألمانيا',
    manifesto: ['تدرّب', 'انمُ', 'تطوّر'],
    dock: { aria: 'تنقل سريع', shop: 'المتجر', worlds: 'العوالم', saved: 'المحفوظة', bag: 'السلة' },
    search: {
      label: 'بحث',
      labelHidden: 'ابحث في NATYSIMO',
      placeholder: 'ابحث عن القطع والأطقم والعوالم',
      close: 'إغلاق البحث',
      empty: (q) => `لا نتائج لـ «${q}». جرّب «تانك» أو «طقم» أو «هودي».`,
    },
    cart: {
      close: 'إغلاق السلة',
      dialog: 'سلة التسوق',
      title: (n) => `السلة (${n})`,
      freeAway: (amount) => `تبقّى ${amount} للحصول على شحن مجاني داخل ألمانيا`,
      freeUnlocked: 'تم تفعيل الشحن المجاني داخل ألمانيا',
      empty: 'سلتك فارغة.',
      emptySub: 'الانضباط أولاً. ثم الزي.',
      shop: 'تسوّق المجموعة 01',
      decrease: (name) => `تقليل كمية ${name}`,
      increase: (name) => `زيادة كمية ${name}`,
      remove: 'إزالة',
      subtotal: 'المجموع الفرعي',
      note: 'يُحتسب الشحن والخصومات عند إتمام الطلب.',
      checkout: 'إتمام الطلب',
    },
    toast: { removed: 'تمت الإزالة من المفضلة', saved: 'تم الحفظ في المفضلة' },
  },
};
