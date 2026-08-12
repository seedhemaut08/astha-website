import { useEffect, useRef, useState } from 'react';

const SYMBOLS = {
  'Ganesh Ji': 'ग',
  'Lakshmi Ji': 'ल',
  'Krishnaleela Clocl': 'ह',
  'Peacock': 'श',
  'Krishna Ji': 'क'
};

const DEFAULT_MEDIA = {
  'Ganesh Ji': {
    image: '/images/devotion/ganesh.webp',
    video: '/images/devotion/ganeshr.mp4'
  },
  'Lakshmi Ji': {
    image: '/images/devotion/lakshmi.png',
    video: '/images/devotion/lakshmir.mp4'
  },
  'Krishnaleela Clock': {
    image: '/images/devotion/ghadi.png',
    video: '/images/devotion/clockr.mp4'
  },
  'Shiv Ji': {
    image: '/images/devotion/shiv.jpg',
    video: '/images/devotion/shiv.mp4'
  },
  'Peacock': {
    image: '/images/devotion/mor.png',
    video: '/images/devotion/morr.mp4'
  }
};

export default function ProductMedallion({
  category,
  name,
  size = 'md',
  image,
  video
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const videoRef = useRef(null);

  const symbol = SYMBOLS[category] || 'अ';

  const media = DEFAULT_MEDIA[category] || {};

  const imageSrc = image || media.image;
  const videoSrc = video || media.video;

  /*
   * ------------------------------------------------------------
   * PLAY / RESET VIDEO
   * ------------------------------------------------------------
   *
   * When card flips:
   * video starts automatically.
   *
   * When card comes back:
   * video pauses and resets to beginning.
   */
  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (isFlipped) {
      videoElement.currentTime = 0;

      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          /*
           * Browser may block autoplay in some situations.
           * Video is muted, so normally this will work.
           */
        });
      }
    } else {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }, [isFlipped]);

  /*
   * ------------------------------------------------------------
   * DESKTOP HOVER
   * ------------------------------------------------------------
   *
   * We only use hover behaviour on devices that actually
   * support hover.
   */
  const handleMouseEnter = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover)').matches
    ) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover)').matches
    ) {
      setIsFlipped(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * MOBILE BUTTON
   * ------------------------------------------------------------
   */
  const handleMobileFlip = (event) => {
    /*
     * Prevent the parent Link from navigating when the
     * mobile flip button is clicked.
     */
    event.preventDefault();
    event.stopPropagation();

    setIsFlipped((previous) => !previous);
  };

  return (
    <div
      className={`medallion medallion--${size} ${
        isFlipped ? 'medallion--flipped' : ''
      }`}
      role="group"
      aria-label={`${name} devotion card`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="medallion__scene">
        <div className="medallion__card">

          {/* ==================================================
              FRONT — IMAGE
          ================================================== */}

          <div className="medallion__face medallion__front">

            {imageSrc ? (
              <img
                src={imageSrc}
                alt={`${name} idol`}
                className="medallion__image"
                draggable="false"
              />
            ) : (
              <div className="medallion__fallback">
                <span className="medallion__fallback-symbol">
                  {symbol}
                </span>
              </div>
            )}

            <div
              className="medallion__front-overlay"
              aria-hidden="true"
            />

            <div className="medallion__front-content">
              <span className="medallion__front-name">
                {name}
              </span>

              <span className="medallion__front-blurb">
                Tap to discover
              </span>
            </div>

            {/* Mobile flip button */}
            <button
              type="button"
              className="medallion__flip-button"
              onClick={handleMobileFlip}
              aria-label={
                isFlipped
                  ? `Show ${name} image`
                  : `Play ${name} video`
              }
            >
              <span aria-hidden="true">
                {isFlipped ? '↩' : '↻'}
              </span>
            </button>
          </div>


          {/* ==================================================
              BACK — VIDEO
          ================================================== */}

          <div className="medallion__face medallion__back">

            {videoSrc ? (
              <video
                ref={videoRef}
                className="medallion__video"
                src={videoSrc}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${name} devotional video`}
              />
            ) : (
              <div className="medallion__video-fallback">
                <span>{symbol}</span>
                <small>Video coming soon</small>
              </div>
            )}

            <div
              className="medallion__video-overlay"
              aria-hidden="true"
            />

            <div className="medallion__back-content">
              <span className="medallion__back-name">
                {name}
              </span>

              <span className="medallion__back-label">
                Devotion in motion
              </span>
            </div>

            {/* Mobile button on video side */}
            <button
              type="button"
              className="medallion__flip-button medallion__flip-button--back"
              onClick={handleMobileFlip}
              aria-label={`Show ${name} image`}
            >
              <span aria-hidden="true">↩</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}