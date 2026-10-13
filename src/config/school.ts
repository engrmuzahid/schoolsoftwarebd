import { schoolSiteUrl } from './env';

export const siteUrl = schoolSiteUrl;

export const TEMPLATE_DEMO_SCHOOL = 'nondomohol';

export type FrontendTemplate = {
  title: string;
  slug: string;
  description: string;
  image: string;
};

const img = (slug: string) => `/assets/frontend_templates/${slug}.png`;

export const FRONTEND_TEMPLATES: FrontendTemplate[] = [
  {
    title: 'Lumin',
    slug: 'lumin',
    description: 'আধুনিক ও পরিষ্কার ডিজাইনের একটি প্রিমিয়াম শিক্ষা প্রতিষ্ঠান টেমপ্লেট।',
    image: img('lumin'),
  },
  {
    title: 'Catalyst',
    slug: 'catalyst',
    description: 'ডায়নামিক ও প্রফেশনাল লেআউটের মাধ্যমে প্রতিষ্ঠানের তথ্য সুন্দরভাবে উপস্থাপনের জন্য তৈরি।',
    image: img('catalyst'),
  },
  {
    title: 'Meridian',
    slug: 'meridian',
    description: 'এলিগ্যান্ট ও ব্যালান্সড ডিজাইনের একটি আধুনিক শিক্ষা প্রতিষ্ঠান ওয়েব টেমপ্লেট।',
    image: img('meridian'),
  },
  {
    title: 'Horizon',
    slug: 'horizon',
    description: 'ফ্রেশ ও ভিজ্যুয়াল-ফোকাসড ডিজাইনের মাধ্যমে প্রতিষ্ঠানের অনলাইন উপস্থিতি তুলে ধরার জন্য তৈরি।',
    image: img('horizon'),
  },
  {
    title: 'Prism',
    slug: 'prism',
    description: 'স্মার্ট, কালারফুল ও আধুনিক ইন্টারফেসের একটি ইউনিক শিক্ষা প্রতিষ্ঠান টেমপ্লেট।',
    image: img('prism'),
  },
  {
    title: 'Default',
    slug: 'default',
    description: 'সহজ, পরিচ্ছন্ন ও বিভিন্ন ধরনের শিক্ষা প্রতিষ্ঠানের জন্য উপযোগী ডিফল্ট টেমপ্লেট।',
    image: img('default'),
  },
];

export const templateDemoUrl = (slug: string) =>
  `${siteUrl(TEMPLATE_DEMO_SCHOOL, '/')}?${new URLSearchParams({ template_slug: slug }).toString()}`;

export type PanelLogin = { loginUrl: string; username: string; password: string };

export const ADMIN_LOGIN: PanelLogin = {
  loginUrl: siteUrl('admin', '/login'),
  username: 'superadmin@gmail.com',
  password: '123456',
};

export const TEACHER_LOGIN: PanelLogin = {
  loginUrl: siteUrl('admin', '/login'),
  username: 'teacher@email.com',
  password: '123456',
};

export const SCHOOL_TYPES = [
  { value: 'primary', label: 'প্রাথমিক বিদ্যালয়' },
  { value: 'secondary', label: 'মাধ্যমিক বিদ্যালয়' },
  { value: 'higher_secondary', label: 'উচ্চ মাধ্যমিক বিদ্যালয়' },
  { value: 'school_and_college', label: 'স্কুল ও কলেজ' },
  { value: 'madrasa', label: 'মাদ্রাসা' },
  { value: 'kindergarten', label: 'কিন্ডারগার্টেন' },
  { value: 'technical', label: 'কারিগরি বিদ্যালয়' },
  { value: 'specialized', label: 'বিশেষায়িত বিদ্যালয়' },
] as const;

export const ACTIVE_STATUS_DEFAULT = 3;