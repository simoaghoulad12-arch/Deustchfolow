import type { Copy } from '../copy';

interface Checkout {
  title: string;
  empty: string;
  shop: string;
  applied: (code: string) => string;
  previewLabel: string;
  previewText: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  firstName: string;
  lastName: string;
  street: string;
  postal: string;
  city: string;
  country: string;
  countries: Record<string, string>;
  shipping: string;
  shippingNote: string;
  methods: Record<string, { label: string; eta: string }>;
  payment: string;
  paymentRedirect: string;
  paymentPending: string;
  summary: (n: number) => string;
  discount: string;
  apply: string;
  subtotal: string;
  shippingRow: string;
  confirmedAtLaunch: string;
  free: string;
  totalExcl: string;
  total: string;
  pay: (amount: string) => string;
  connecting: string;
  continueOffline: string;
  discountOffline: string;
  checkoutOffline: string;
}

export const checkout: Copy<Checkout> = {
  en: {
    title: 'Checkout',
    empty: 'Your bag is empty.',
    shop: 'Shop Collection 01',
    applied: (code) => `${code} applied`,
    previewLabel: 'Preview',
    previewText:
      'The NATYSIMO store is not taking payments yet. You can review your bag and delivery options here — no order will be placed and nothing will be charged.',
    contact: '01 — Contact',
    email: 'Email',
    phone: 'Phone (for delivery)',
    address: '02 — Delivery address',
    firstName: 'First name',
    lastName: 'Last name',
    street: 'Street and number',
    postal: 'Postal code',
    city: 'City',
    country: 'Country',
    countries: {
      MA: 'Morocco',
      DE: 'Germany',
      AT: 'Austria',
      NL: 'Netherlands',
      BE: 'Belgium',
      FR: 'France',
      CH: 'Switzerland',
    },
    shipping: '03 — Shipping',
    shippingNote:
      'Delivery rates and times are confirmed when the store opens. Cash on delivery for Morocco is planned for launch.',
    methods: {
      'ma-standard': {
        label: 'Delivery — Morocco',
        eta: 'All cities · timing confirmed at launch',
      },
      'eu-standard': {
        label: 'Delivery — Europe',
        eta: 'Germany & EU · timing confirmed at launch',
      },
    },
    payment: '04 — Payment',
    paymentRedirect: 'You will be redirected to our secure payment partner.',
    paymentPending: 'Payment methods appear here once the payment provider is connected.',
    summary: (n) => `Order summary · ${n}`,
    discount: 'Discount code',
    apply: 'Apply',
    subtotal: 'Subtotal',
    shippingRow: 'Shipping',
    confirmedAtLaunch: 'Confirmed at launch',
    free: 'Free',
    totalExcl: 'Total (excl. delivery)',
    total: 'Total',
    pay: (amount) => `Pay ${amount}`,
    connecting: 'Connecting…',
    continueOffline: 'Continue — payments not connected',
    discountOffline: 'Discount codes activate when the store opens.',
    checkoutOffline:
      'Payments are not connected yet. No order has been placed and nothing was charged.',
  },
  ar: {
    title: 'إتمام الطلب',
    empty: 'سلتك فارغة.',
    shop: 'تسوّق المجموعة 01',
    applied: (code) => `تم تطبيق ${code}`,
    previewLabel: 'معاينة',
    previewText:
      'متجر NATYSIMO لا يستقبل المدفوعات بعد. يمكنك مراجعة سلتك وخيارات التوصيل هنا — لن يُنشأ أي طلب ولن يُخصم أي مبلغ.',
    contact: '01 — بيانات التواصل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف (للتوصيل)',
    address: '02 — عنوان التوصيل',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    street: 'الشارع والرقم',
    postal: 'الرمز البريدي',
    city: 'المدينة',
    country: 'الدولة',
    countries: {
      MA: 'المغرب',
      DE: 'ألمانيا',
      AT: 'النمسا',
      NL: 'هولندا',
      BE: 'بلجيكا',
      FR: 'فرنسا',
      CH: 'سويسرا',
    },
    shipping: '03 — الشحن',
    shippingNote:
      'تُؤكَّد أسعار التوصيل ومدده عند افتتاح المتجر. الدفع عند الاستلام في المغرب مخطط له عند الإطلاق.',
    methods: {
      'ma-standard': {
        label: 'التوصيل — المغرب',
        eta: 'جميع المدن · يُؤكَّد التوقيت عند الإطلاق',
      },
      'eu-standard': {
        label: 'التوصيل — أوروبا',
        eta: 'ألمانيا والاتحاد الأوروبي · يُؤكَّد التوقيت عند الإطلاق',
      },
    },
    payment: '04 — الدفع',
    paymentRedirect: 'سيتم توجيهك إلى شريك الدفع الآمن لدينا.',
    paymentPending: 'تظهر طرق الدفع هنا عند ربط مزوّد الدفع.',
    summary: (n) => `ملخص الطلب · ${n}`,
    discount: 'رمز الخصم',
    apply: 'تطبيق',
    subtotal: 'المجموع الفرعي',
    shippingRow: 'الشحن',
    confirmedAtLaunch: 'يُؤكَّد عند الإطلاق',
    free: 'مجاني',
    totalExcl: 'المجموع (دون التوصيل)',
    total: 'المجموع',
    pay: (amount) => `ادفع ${amount}`,
    connecting: 'جارٍ الاتصال…',
    continueOffline: 'متابعة — المدفوعات غير مرتبطة بعد',
    discountOffline: 'تُفعَّل رموز الخصم عند افتتاح المتجر.',
    checkoutOffline: 'المدفوعات غير مرتبطة بعد. لم يُنشأ أي طلب ولم يُخصم أي مبلغ.',
  },
};
