/*
=========================================================
ASTHA SECTION DIVIDER
=========================================================

A lightweight decorative divider used between sections.

There is no JavaScript state, animation, event listener,
or expensive calculation here.

All visual styling remains controlled by CSS.
=========================================================
*/

export default function SectionDivider() {
  return (
    <div
      className="divider"
      aria-hidden="true"
    >

      {/* =================================================
          LEFT DECORATIVE LINE
      ================================================== */}

      <span
        className="divider__line"
      />


      {/* =================================================
          OM SYMBOL
      ================================================== */}

      <span
        className="divider__mark"
      >
        ॐ
      </span>


      {/* =================================================
          RIGHT DECORATIVE LINE
      ================================================== */}

      <span
        className="divider__line"
      />

    </div>
  );
}