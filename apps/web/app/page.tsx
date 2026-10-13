import { getSession } from '@/lib/auth/session';
import { Hero, LandingHeader } from '@/components/landing/hero';
import { AiTutor, HowItWorks, ImmersiveWorld, LearningPath } from '@/components/landing/experience';
import { PersonalizedLearning, Progress, SpeakingPractice } from '@/components/landing/skills';
import { Faq, FinalCta, LandingFooter, Testimonials } from '@/components/landing/closing';

export default async function LandingPage() {
  const session = await getSession();
  const startHref = session ? '/home' : '/register';

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>
      <LandingHeader signedIn={Boolean(session)} />

      <main id="main">
        <Hero startHref={startHref} />
        <HowItWorks />
        <AiTutor />
        <ImmersiveWorld />
        <LearningPath />
        <SpeakingPractice />
        <PersonalizedLearning />
        <Progress />
        <Testimonials />
        <Faq />
        <FinalCta startHref={startHref} />
      </main>

      <LandingFooter />
    </div>
  );
}
