import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SOCIAL } from '@/lib/brand';
import { getLocale } from '@/lib/i18n/server';

/**
 * Service & legal pages.
 *
 * Imprint (Impressum, § 5 DDG), privacy (Datenschutz), terms (AGB) and the
 * withdrawal policy (Widerruf) need the operator's real legal details. None
 * exist in the project, so those pages say so plainly instead of inventing a
 * company, address or registration number. Fill them before taking orders.
 */
type Page = {
  title: string;
  local?: string;
  intro?: string;
  sections: { h?: string; p: string[] }[];
  placeholder?: boolean;
};

const PAGES_EN: Record<string, Page> = {
  shipping: {
    title: 'Delivery',
    intro: 'Where NATYSIMO ships, and what is still being confirmed.',
    sections: [
      {
        h: 'Morocco',
        p: [
          'Delivery to all cities in Morocco is planned for launch, including cash on delivery.',
          'Rates and delivery times are confirmed here and at checkout before the first order.',
        ],
      },
      {
        h: 'Germany & EU',
        p: [
          'Delivery to Germany and the EU is planned. Rates, delivery times and any customs details are confirmed before launch.',
        ],
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    local: 'Widerruf',
    placeholder: true,
    sections: [
      {
        p: [
          'The returns and exchange policy — including the return window, condition requirements and how to start a return — is published here before the store takes orders.',
          'Customers in the EU keep their statutory 14-day right of withdrawal.',
        ],
      },
    ],
  },
  imprint: {
    title: 'Imprint',
    local: 'Impressum',
    placeholder: true,
    sections: [
      {
        p: [
          'The operator’s legal name, address, contact details and registration information are published here before the store opens.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy',
    local: 'Datenschutz',
    placeholder: true,
    sections: [
      {
        h: 'Today',
        p: [
          'This site stores your bag and wishlist only in your own browser (local storage). It sets no tracking or advertising cookies and collects no account, payment or analytics data.',
        ],
      },
      {
        h: 'At launch',
        p: [
          'The full privacy policy — covering orders, payments, delivery partners and your rights under GDPR and Moroccan law 09-08 — is published here before the store opens.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms',
    local: 'AGB',
    placeholder: true,
    sections: [
      {
        p: [
          'The general terms and conditions of sale are published here before the store takes orders.',
        ],
      },
    ],
  },
  faq: {
    title: 'FAQ',
    sections: [
      {
        h: 'Can I order now?',
        p: [
          'Not yet. The store is in preview: you can browse Collection 01, save pieces and build your bag. Checkout opens at launch — follow on Instagram for the date.',
        ],
      },
      {
        h: 'Where do you deliver?',
        p: ['Morocco first, plus Germany and the EU. Rates and times are confirmed before launch.'],
      },
      {
        h: 'Will cash on delivery be available?',
        p: ['Cash on delivery for Morocco is planned for launch.'],
      },
      {
        h: 'How do NATYSIMO pieces fit?',
        p: [
          'Every product page has a size guide with body measurements. Fit notes per piece are published with the launch photography. Between sizes? Size up for a relaxed fit, down for a closer one.',
        ],
      },
      {
        h: 'What are the pieces made of?',
        p: [
          'Material composition is confirmed with suppliers and published on each product page at launch. We don’t publish specs we haven’t verified.',
        ],
      },
      {
        h: 'What are the sets?',
        p: [
          'Curated looks sold together at a permanent set price. They are how the looks are sold — not a sale, and they don’t expire.',
        ],
      },
      {
        h: 'Why are some images marked “Product render” or “Concept visual”?',
        p: [
          'Some pieces are shown with product renders or campaign concept visuals until final product photography is shot. They are always labelled, so you know when an image is not a photograph of the finished piece.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact',
    sections: [],
  },
};

const PAGES_AR: Record<string, Page> = {
  shipping: {
    title: 'التوصيل',
    intro: 'أين تشحن NATYSIMO، وما الذي لا يزال قيد التأكيد.',
    sections: [
      {
        h: 'المغرب',
        p: [
          'التوصيل إلى جميع مدن المغرب مخطط له عند الإطلاق، بما في ذلك الدفع عند الاستلام.',
          'تُؤكَّد الأسعار ومدد التوصيل هنا وعند إتمام الطلب قبل أول طلب.',
        ],
      },
      {
        h: 'ألمانيا والاتحاد الأوروبي',
        p: [
          'التوصيل إلى ألمانيا والاتحاد الأوروبي مخطط له. تُؤكَّد الأسعار ومدد التوصيل وأي تفاصيل جمركية قبل الإطلاق.',
        ],
      },
    ],
  },
  returns: {
    title: 'الإرجاع والاستبدال',
    local: 'Widerruf',
    placeholder: true,
    sections: [
      {
        p: [
          'تُنشر هنا سياسة الإرجاع والاستبدال — بما في ذلك مدة الإرجاع وشروط حالة القطعة وكيفية بدء الإرجاع — قبل أن يستقبل المتجر الطلبات.',
          'يحتفظ العملاء في الاتحاد الأوروبي بحقهم القانوني في الانسحاب خلال 14 يومًا.',
        ],
      },
    ],
  },
  imprint: {
    title: 'بيانات الناشر',
    local: 'Impressum',
    placeholder: true,
    sections: [
      {
        p: [
          'يُنشر هنا الاسم القانوني للمشغّل وعنوانه وبيانات التواصل ومعلومات التسجيل قبل افتتاح المتجر.',
        ],
      },
    ],
  },
  privacy: {
    title: 'الخصوصية',
    local: 'Datenschutz',
    placeholder: true,
    sections: [
      {
        h: 'اليوم',
        p: [
          'يحفظ هذا الموقع سلتك ومفضلتك في متصفحك أنت فقط (التخزين المحلي). لا يضع ملفات تتبّع أو إعلانات، ولا يجمع بيانات حساب أو دفع أو تحليلات.',
        ],
      },
      {
        h: 'عند الإطلاق',
        p: [
          'تُنشر هنا سياسة الخصوصية الكاملة — التي تشمل الطلبات والمدفوعات وشركاء التوصيل وحقوقك بموجب اللائحة الأوروبية GDPR والقانون المغربي 09-08 — قبل افتتاح المتجر.',
        ],
      },
    ],
  },
  terms: {
    title: 'الشروط',
    local: 'AGB',
    placeholder: true,
    sections: [
      {
        p: ['تُنشر هنا الشروط والأحكام العامة للبيع قبل أن يستقبل المتجر الطلبات.'],
      },
    ],
  },
  faq: {
    title: 'الأسئلة الشائعة',
    sections: [
      {
        h: 'هل أستطيع الطلب الآن؟',
        p: [
          'ليس بعد. المتجر في مرحلة المعاينة: يمكنك تصفّح المجموعة 01 وحفظ القطع وتجهيز سلتك. يُفتح إتمام الطلب عند الإطلاق — تابعنا على إنستغرام لمعرفة الموعد.',
        ],
      },
      {
        h: 'أين توصّلون؟',
        p: ['المغرب أولًا، ثم ألمانيا والاتحاد الأوروبي. تُؤكَّد الأسعار والمدد قبل الإطلاق.'],
      },
      {
        h: 'هل سيتوفر الدفع عند الاستلام؟',
        p: ['الدفع عند الاستلام في المغرب مخطط له عند الإطلاق.'],
      },
      {
        h: 'كيف تكون قصّة قطع NATYSIMO؟',
        p: [
          'لكل صفحة منتج دليل مقاسات بقياسات الجسم. تُنشر ملاحظات القصّة لكل قطعة مع صور الإطلاق. بين مقاسين؟ اختر الأكبر لقصّة مريحة، والأصغر لقصّة أقرب إلى الجسم.',
        ],
      },
      {
        h: 'مم صُنعت القطع؟',
        p: [
          'يُؤكَّد تركيب الخامة مع الموردين ويُنشر في كل صفحة منتج عند الإطلاق. لا ننشر مواصفات لم نتحقق منها.',
        ],
      },
      {
        h: 'ما هي الأطقم؟',
        p: [
          'إطلالات منسّقة تُباع معًا بسعر طقم دائم. هذه طريقة بيع الإطلالات — وليست تخفيضًا، ولا تنتهي صلاحيتها.',
        ],
      },
      {
        h: 'لماذا بعض الصور عليها «تصميم رقمي للمنتج» أو «صورة تصوّرية»؟',
        p: [
          'تُعرض بعض القطع بتصاميم رقمية أو بصور تصوّرية للحملة إلى أن تُصوَّر صور المنتج النهائية. تُوسَم دائمًا، لتعرف متى لا تكون الصورة فوتوغرافية للقطعة النهائية.',
        ],
      },
    ],
  },
  contact: {
    title: 'تواصل معنا',
    sections: [],
  },
};

const UI = {
  en: {
    service: 'Service',
    placeholderNote:
      'Pre-launch page. The legally binding version is published before the store accepts orders.',
    instagramDm: 'Instagram DM',
    whatsapp: 'WhatsApp',
    email: 'Email',
    faqLead: 'Questions about sizing or delivery? Read the',
    faqLink: 'FAQ',
    faqTail: 'first — most answers are there.',
  },
  ar: {
    service: 'الخدمة',
    placeholderNote:
      'صفحة ما قبل الإطلاق. تُنشر النسخة الملزمة قانونيًا قبل أن يقبل المتجر الطلبات.',
    instagramDm: 'رسالة على إنستغرام',
    whatsapp: 'واتساب',
    email: 'البريد الإلكتروني',
    faqLead: 'أسئلة عن المقاسات أو التوصيل؟ اقرأ',
    faqLink: 'الأسئلة الشائعة',
    faqTail: 'أولًا — أغلب الإجابات هناك.',
  },
} as const;

export function generateStaticParams() {
  return Object.keys(PAGES_EN).map((page) => ({ page }));
}

export function generateMetadata({ params }: { params: { page: string } }): Metadata {
  const page = (getLocale() === 'ar' ? PAGES_AR : PAGES_EN)[params.page];
  return page ? { title: page.title, alternates: { canonical: `/legal/${params.page}` } } : {};
}

export default function LegalPage({ params }: { params: { page: string } }) {
  const locale = getLocale();
  const page = (locale === 'ar' ? PAGES_AR : PAGES_EN)[params.page];
  if (!page) notFound();
  const ui = UI[locale];

  return (
    <div className="mx-auto min-h-[70svh] max-w-2xl px-5 pb-28 pt-32 sm:pt-40">
      <p className="label text-mist">{page.local ? `${ui.service} · ${page.local}` : ui.service}</p>
      <h1 className="mt-4 font-display text-5xl leading-none sm:text-6xl">{page.title}</h1>
      {page.intro && <p className="mt-6 text-sm text-mist">{page.intro}</p>}
      {page.placeholder && (
        <p
          role="note"
          className="mt-8 border border-white/15 px-4 py-3 text-xs leading-relaxed text-mist"
        >
          {ui.placeholderNote}
        </p>
      )}

      {params.page === 'contact' ? (
        <div className="mt-10 space-y-3">
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between border border-white/15 px-5 py-5 hover:border-ivory"
          >
            <span>
              <span className="label block text-mist">{ui.instagramDm}</span>
              <span className="mt-1 block">{SOCIAL.instagramHandle}</span>
            </span>
            <span aria-hidden className="rtl:-scale-x-100">
              →
            </span>
          </a>
          {SOCIAL.whatsapp && (
            <a
              href={`https://wa.me/${SOCIAL.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-white/15 px-5 py-5 hover:border-ivory"
            >
              <span>
                <span className="label block text-mist">{ui.whatsapp}</span>
                <span dir="ltr" className="mt-1 block text-start">
                  +{SOCIAL.whatsapp}
                </span>
              </span>
              <span aria-hidden className="rtl:-scale-x-100">
                →
              </span>
            </a>
          )}
          {SOCIAL.contactEmail && (
            <a
              href={`mailto:${SOCIAL.contactEmail}`}
              className="flex items-center justify-between border border-white/15 px-5 py-5 hover:border-ivory"
            >
              <span>
                <span className="label block text-mist">{ui.email}</span>
                <span dir="ltr" className="mt-1 block text-start">
                  {SOCIAL.contactEmail}
                </span>
              </span>
              <span aria-hidden className="rtl:-scale-x-100">
                →
              </span>
            </a>
          )}
          <p className="pt-4 text-sm text-mist">
            {ui.faqLead}{' '}
            <Link href="/legal/faq" className="underline underline-offset-4">
              {ui.faqLink}
            </Link>{' '}
            {ui.faqTail}
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {page.sections.map((section, i) => (
            <section key={i}>
              {section.h && <h2 className="font-display text-2xl">{section.h}</h2>}
              <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ivory/80">
                {section.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
