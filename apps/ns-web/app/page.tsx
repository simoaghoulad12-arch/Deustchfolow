import { Hero } from '@/components/home/Hero';
import { Manifesto } from '@/components/home/Manifesto';
import { Worlds } from '@/components/home/Worlds';
import { Collection } from '@/components/home/Collection';
import { Sets } from '@/components/home/Sets';
import { Anatomy } from '@/components/home/Anatomy';
import { Story } from '@/components/home/Story';
import { Lifestyle } from '@/components/home/Lifestyle';
import { Details } from '@/components/home/Details';
import { Community } from '@/components/home/Community';
import { FinalCta } from '@/components/home/FinalCta';

/**
 * Homepage order: promise (Hero) → worlds (the brand's architecture) →
 * the product (Collection 01) → the looks (Sets) → proof (Anatomy) → meaning (Story) →
 * life (Lifestyle) → craft (Details) → community → close.
 * The manifesto sits after the worlds on purpose: Instagram visitors want to
 * see the brand's range within two swipes, then earn the long read.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Worlds />
      <Collection />
      <Sets />
      <Manifesto />
      <Anatomy />
      <Story />
      <Lifestyle />
      <Details />
      <Community />
      <FinalCta />
    </>
  );
}
