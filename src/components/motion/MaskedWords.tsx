import { Fragment } from "react";

type MaskedWordsProps = {
  text: string;
  /**
   * Data attribute written on each inner word span so a parent
   * client timeline (e.g. HeroSequence) can target them with GSAP.
   */
  targetAttr?: string;
};

/**
 * Renders text as individually masked words for a staggered line reveal.
 * Each word sits in an overflow-hidden wrapper; a parent client timeline
 * slides the inner span up from below the mask with gsap.from().
 *
 * Server-rendered and fully visible without JavaScript — the mask only
 * clips once the parent timeline applies its from-state after hydration.
 */
export function MaskedWords({
  text,
  targetAttr = "data-hero-word",
}: MaskedWordsProps) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 ? " " : null}
          <span className="inline-block overflow-hidden pb-[0.18em] -mb-[0.18em] align-bottom">
            <span {...{ [targetAttr]: "" }} className="inline-block">
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </>
  );
}
