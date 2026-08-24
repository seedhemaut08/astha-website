/*
=========================================================
ASTHA LOADER
=========================================================

Lightweight loading indicator used throughout the
application.

The loader intentionally contains no JavaScript animation
logic. Animation is handled entirely by CSS so the browser
can render it efficiently without React re-renders.
=========================================================
*/

export default function Loader({
  label = 'Loading'
}) {

  return (
    <div
      className="loader"
      role="status"
      aria-live="polite"
      aria-label={label}
    >

      {/* =================================================
          CSS SPINNER
      ================================================== */}

      <div
        className="loader__spinner"
        aria-hidden="true"
      />


      {/* =================================================
          LOADING LABEL
      ================================================== */}

      <span>
        {label}
      </span>

    </div>
  );
}