import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import ProblemGrid from "@/components/ProblemGrid";
import Testimonials from "@/components/Testimonials";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Stats />
        <ProblemGrid />
        <Testimonials />
        <section id="enquire" className="mx-auto max-w-2xl px-6 py-16 w-full">
          <p className="font-marginalia text-2xl text-red-pen -rotate-1">last step</p>
          <h2 className="font-display text-3xl font-semibold mb-6">
            Book a free trial class at {siteConfig.instituteName}.
          </h2>
          <LeadForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
