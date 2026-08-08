import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import ProblemGrid from "@/components/ProblemGrid";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import AnimatedSection from "@/components/AnimatedSection";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main className="flex-1">
        <Hero />
        <Stats />
        <ProblemGrid />
        <Testimonials />
        <Pricing />
        <FAQ />

        {/* Enquiry section */}
        <section
          id="enquire"
          className="border-b border-rule-line relative overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 80% 20%, rgba(193,68,45,0.08) 0%, transparent 60%), " +
              "radial-gradient(ellipse 50% 50% at 20% 80%, rgba(227,178,60,0.07) 0%, transparent 60%), " +
              "var(--paper)",
          }}
        >
          {/* Subtle ruled background */}
          <div className="absolute inset-0 ruled-bg opacity-20 pointer-events-none" />

          <div className="relative mx-auto max-w-2xl px-6 py-20 w-full">
            <AnimatedSection>
              <span className="section-label">last step</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1 mb-3 leading-tight">
                Book a free trial class at{" "}
                <span className="italic">{siteConfig.instituteName}.</span>
              </h2>
              <p className="text-ink-soft mb-8 max-w-md">
                Fill in the form and someone from our team will call you within one business day to confirm your slot.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={150}>
              <LeadForm />
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
