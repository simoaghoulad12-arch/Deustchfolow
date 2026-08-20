import ParticleField from './components/ParticleField'
import ScrollStory from './components/ScrollStory'
import HoneySection from './components/HoneySection'
import BlackSeedSection from './components/BlackSeedSection'
import IngredientsSection from './components/IngredientsSection'
import AboutSection from './components/AboutSection'
import ContactFooter from './components/ContactFooter'
import StickyOrderButton from './components/StickyOrderButton'

export default function App() {
  return (
    <div className="relative min-h-screen bg-ink-950">
      <ParticleField />
      <main className="relative z-10">
        <ScrollStory />
        <HoneySection />
        <BlackSeedSection />
        <IngredientsSection />
        <AboutSection />
        <ContactFooter />
      </main>
      <StickyOrderButton />
    </div>
  )
}
