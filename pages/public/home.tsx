import { useHomeReveal } from 'components/public/home/useHomeReveal';
import HeroSection from 'components/public/home/HeroSection';
import ValueSummary from 'components/public/home/ValueSummary';
import JourneySection from 'components/public/home/JourneySection';
import EvidenceSection from 'components/public/home/EvidenceSection';
import CollectionSection from 'components/public/home/CollectionSection';
import InfrastructureSection from 'components/public/home/InfrastructureSection';
import FinalCtaSection from 'components/public/home/FinalCtaSection';
import HomeFooter from 'components/public/home/HomeFooter';

export default function Home() {
  const pageRef = useHomeReveal();

  return (
    <div className="field-notes" ref={pageRef}>
      <HeroSection />
      <ValueSummary />
      <JourneySection />
      <EvidenceSection />
      <CollectionSection />
      <InfrastructureSection />
      <FinalCtaSection />
      <HomeFooter />
    </div>
  );
}
