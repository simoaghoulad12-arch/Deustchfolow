import type { Copy } from '../copy';

interface Pages {
  wishlist: { title: string; eyebrow: string; empty: string; shop: string };
  account: {
    title: string;
    eyebrow: string;
    heading: string;
    text: string;
    wishlist: string;
    instagram: string;
  };
  notFound: { heading: string; text: string; back: string };
  ig: {
    title: (handle: string) => string;
    description: string;
    from: (handle: string) => string;
    shop: string;
    founderLook: string;
    sets: string;
    plan: string;
    squad: string;
    quick: string;
    mostWanted: string;
    waitlist: string;
    waitlistText: (handle: string) => string;
    questions: (handle: string) => string;
  };
}

export const pages: Copy<Pages> = {
  en: {
    wishlist: {
      title: 'Wishlist',
      eyebrow: 'Saved on this device',
      empty: 'Nothing saved yet. Tap the heart on any piece to keep it here.',
      shop: 'Shop Collection 01',
    },
    account: {
      title: 'Account',
      eyebrow: 'Account',
      heading: 'Members open at launch.',
      text: 'Customer accounts, order history and saved addresses go live with the Collection 01 store. Until then your bag and wishlist are kept on this device.',
      wishlist: 'View wishlist',
      instagram: 'Launch news on Instagram',
    },
    notFound: {
      heading: 'Off the path.',
      text: 'This page doesn’t exist. The discipline does.',
      back: 'Back to NATYSIMO',
    },
    ig: {
      title: (handle) => `NATYSIMO — from ${handle}`,
      description:
        'Shop NATYSIMO Collection 01, the sets and the three worlds — straight from Instagram.',
      from: (handle) => `From ${handle}`,
      shop: 'Shop Collection 01',
      founderLook: 'The founder’s look',
      sets: 'The Sets',
      plan: 'The Training Plan',
      squad: 'Join Natty Squad',
      quick: 'Quick links',
      mostWanted: 'Most wanted',
      waitlist: 'Waitlist',
      waitlistText: (handle) => `DM SQUAD to ${handle}`,
      questions: (handle) => `Questions? DM ${handle}`,
    },
  },
  ar: {
    wishlist: {
      title: 'المفضلة',
      eyebrow: 'محفوظة على هذا الجهاز',
      empty: 'لا شيء محفوظ بعد. اضغط على القلب في أي قطعة لتحتفظ بها هنا.',
      shop: 'تسوّق المجموعة 01',
    },
    account: {
      title: 'الحساب',
      eyebrow: 'الحساب',
      heading: 'العضوية تُفتح عند الإطلاق.',
      text: 'حسابات العملاء وسجل الطلبات والعناوين المحفوظة تبدأ مع متجر المجموعة 01. إلى ذلك الحين تُحفظ سلتك ومفضلتك على هذا الجهاز.',
      wishlist: 'عرض المفضلة',
      instagram: 'أخبار الإطلاق على إنستغرام',
    },
    notFound: {
      heading: 'خارج المسار.',
      text: 'هذه الصفحة غير موجودة. أما الانضباط فموجود.',
      back: 'العودة إلى NATYSIMO',
    },
    ig: {
      title: (handle) => `NATYSIMO — من ${handle}`,
      description: 'تسوّق مجموعة NATYSIMO 01 والأطقم والعوالم الثلاثة — مباشرة من إنستغرام.',
      from: (handle) => `من ${handle}`,
      shop: 'تسوّق المجموعة 01',
      founderLook: 'إطلالة المؤسس',
      sets: 'الأطقم',
      plan: 'خطة التدريب',
      squad: 'انضم إلى Natty Squad',
      quick: 'روابط سريعة',
      mostWanted: 'الأكثر طلبًا',
      waitlist: 'قائمة الانتظار',
      waitlistText: (handle) => `أرسل SQUAD في رسالة خاصة إلى ${handle}`,
      questions: (handle) => `أسئلة؟ راسل ${handle}`,
    },
  },
};
