import SectionDivider from '../components/SectionDivider.jsx';

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <span className="eyebrow">Our Craft</span>
        <h1>Silver has always spoken the language of devotion.</h1>
        <p>
          Astha began with a simple belief — that the idols we bring into our homes deserve the
          same care as the faith they represent. Every piece we craft passes through artisan hands
          that have shaped silver for generations, long before it reaches yours.
        </p>
      </section>

      <SectionDivider />

      <section className="about-grid">
        <div className="about-block">
          <h3>The Material</h3>
          <p>We work exclusively in fine silver, chosen for its purity, its shine, and its permanence — a metal meant to be handed down.</p>
        </div>
        <div className="about-block">
          <h3>The Process</h3>
          <p>Each murti is sculpted, cast, hand-finished and polished across several stages, with every detail — from mukut to aasan — checked by hand.</p>
        </div>
        <div className="about-block">
          <h3>The Purpose</h3>
          <p>Whether it's a housewarming, a wedding, or a quiet addition to your mandir, an Astha idol is made to mark the moment.</p>
        </div>
      </section>

      <SectionDivider />

      <section className="about-quote">
        <blockquote>
          "We don't rush a piece out the door. We finish it the way we'd want it finished for our own home."
        </blockquote>
        <span>— The Astha Workshop</span>
      </section>
    </div>
  );
}
