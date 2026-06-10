import { LANDING_FAQ, LANDING_SECTIONS } from "@/lib/landing/content";
import { SectionHeader } from "@/components/landing/section-header";

export function FaqSection() {
  const copy = LANDING_SECTIONS.faq;

  return (
    <section
      id="faq"
      className="landing-section"
      aria-labelledby="faq-heading"
    >
      <SectionHeader
        id="faq-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="mx-auto mt-14 max-w-2xl">
        {LANDING_FAQ.map((item, index) => (
          <details
            key={item.question}
            className="landing-faq-item group"
            open={index === 0}
          >
            <summary className="landing-faq-summary">
              <span>{item.question}</span>
              <span className="landing-faq-chevron" aria-hidden>
                +
              </span>
            </summary>
            <div className="landing-faq-answer">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
