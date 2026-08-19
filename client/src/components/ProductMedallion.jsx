import { useEffect, useRef, useState } from 'react';


/*
=========================================================
CATEGORY SYMBOLS
=========================================================
*/

const SYMBOLS = {
  'Ganesh Ji': 'ग',
  'Lakshmi Ji': 'ल',
  'Krishnaleela Clock': 'क',
  'Peacock': 'म',
  'Krishna Ji': 'क',
  'Shiv Ji': 'श',
  'Cow & Calf': 'ग',
  'Candle Stand': 'दी',
  'Shankh': 'श',
  'Swan': 'ह',
  'Photo Frame': 'फ',
  'Frame': 'फ'
};


/*
=========================================================
DEFAULT CATEGORY MEDIA
=========================================================

These are fallback images/videos.

If a product has its own image/video in the database,
those product-specific files will be used first.

Otherwise the category media will be used.

For products without a video, the back will show
"Video coming soon".
=========================================================
*/

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
  },

  'Krishna Ji': {
    image: '/images/devotion/krishna.png',
    video: '/images/devotion/krishnar.mp4'
  },

  /*
  ========================================================
  COW & CALF
  ========================================================

  Product:
  cow.png

  Video:
  cowr.mp4
  ========================================================
  */

  'Cow & Calf': {
    image: '/images/devotion/cow.png',
    video: '/images/devotion/cowr.mp4'
  },

  /*
  ========================================================
  SHANKH
  ========================================================
  Image: public/images/devotion/Shankh.png
  Video: public/images/devotion/Shankhr.mp4
  ========================================================
  */

  'Shankh': {
    image: '/images/devotion/Shankh.png',
    video: '/images/devotion/Shankhr.mp4',
    videoFallbacks: [
      '/images/devotion/Shankhr.mp4',
      '/images/devotion/Shankhr%20.mp4',
      '/images/devotion/Shankhr.MP4',
      '/images/devotion/Shankhr%20.MP4'
    ]
  },

 'Candle Stand': {
  image: '/images/devotion/candle.png',
  video: '/images/devotion/candler.mp4'
},

 'Swan': {
  image: '/images/devotion/swan.png',
  video: '/images/devotion/swanr.mp4'
},

 'Photo Frame': {
  image: '/images/devotion/frame.png',
  video: '/images/devotion/framer.mp4'
},
};


/*
=========================================================
PRODUCT MEDALLION
=========================================================
*/

export default function ProductMedallion({
  category,
  name,
  size = 'md',
  image,
  video
}) {


  /*
  ========================================================
  FLIP STATE
  ========================================================
  */

  const [isFlipped, setIsFlipped] = useState(false);


  /*
  ========================================================
  VIDEO REFERENCE
  ========================================================
  */

  const videoRef = useRef(null);


  /*
  ========================================================
  IMAGE ERROR STATE
  ========================================================

  If a product-specific image path is wrong or the image
  cannot load, we don't want the entire card to become
  blank.

  Instead, the category fallback image will be used.
  ========================================================
  */

  const [imageFailed, setImageFailed] = useState(false);
  const [videoSourceIndex, setVideoSourceIndex] = useState(0);


  /*
  ========================================================
  RESET IMAGE ERROR WHEN PRODUCT CHANGES
  ========================================================
  */

  useEffect(() => {
    setImageFailed(false);
    setVideoSourceIndex(0);
  }, [image, category]);


  /*
  ========================================================
  CATEGORY SYMBOL
  ========================================================
  */

  const symbol = SYMBOLS[category] || 'अ';


  /*
  ========================================================
  CATEGORY FALLBACK MEDIA
  ========================================================
  */

  const normalizedCategory = String(category || '').trim().toLowerCase();
  const normalizedName = String(name || '').trim().toLowerCase();

  const resolvedCategory =
    normalizedCategory.includes('shankh') || normalizedName.includes('shankh')
      ? 'Shankh'
      : category;

  const media = DEFAULT_MEDIA[resolvedCategory] || {};


  /*
  ========================================================
  FINAL IMAGE / VIDEO
  ========================================================

  Priority:

  1. Product-specific image/video
  2. Category default image/video
  ========================================================
  */

  const imageSrc =
    !imageFailed && image
      ? image
      : media.image;

  const shankhVideoFallbacks =
    resolvedCategory === 'Shankh'
      ? (
          media.videoFallbacks?.length
            ? media.videoFallbacks
            : [media.video]
        )
      : [video || media.video];

  const videoSrc =
    video ||
    shankhVideoFallbacks[
      Math.min(videoSourceIndex, shankhVideoFallbacks.length - 1)
    ];


  /*
  ========================================================
  PLAY / RESET VIDEO
  ========================================================

  When the card flips:

  → video starts
  → video starts from beginning
  → video loops infinitely

  When card returns:

  → video pauses
  → video resets to beginning
  ========================================================
  */

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }


    if (isFlipped && videoSrc) {

      /*
      Start from beginning every time
      the card flips.
      */

      videoElement.currentTime = 0;


      const playPromise = videoElement.play();


      if (playPromise !== undefined) {

        playPromise.catch(() => {
          /*
          Browser autoplay protection.

          Video is muted and playsInline,
          so autoplay normally works.
          */
        });

      }

    } else {

      /*
      Return to image side.

      Stop the video and reset it.
      */

      videoElement.pause();
      videoElement.currentTime = 0;

    }

  }, [isFlipped, videoSrc]);


  /*
  ========================================================
  DESKTOP HOVER — FLIP TO VIDEO
  ========================================================

  Only devices that support real hover get this
  behavior.

  Phones/tablets will use the flip button instead.
  ========================================================
  */

  const handleMouseEnter = () => {

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover)').matches
    ) {

      setIsFlipped(true);

    }

  };


  /*
  ========================================================
  DESKTOP HOVER — RETURN TO IMAGE
  ========================================================
  */

  const handleMouseLeave = () => {

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover)').matches
    ) {

      setIsFlipped(false);

    }

  };


  /*
  ========================================================
  MOBILE FLIP BUTTON
  ========================================================

  IMPORTANT:

  The button lives inside the ProductCard Link.

  preventDefault + stopPropagation ensures:

  Button click
  → ONLY flips the card

  It does NOT navigate to the product page.

  Clicking the rest of the product card
  → still navigates normally.
  ========================================================
  */

  const handleMobileFlip = (event) => {

    event.preventDefault();
    event.stopPropagation();

    setIsFlipped((previous) => !previous);

  };


  /*
  ========================================================
  IMAGE LOAD ERROR
  ========================================================
  */

  const handleImageError = () => {

    /*
    If this was already the category fallback,
    don't keep trying to replace it.
    */

    if (image) {
      setImageFailed(true);
    }

  };


  /*
  ========================================================
  RENDER
  ========================================================
  */

  const handleVideoError = () => {
    if (resolvedCategory === 'Shankh') {
      setVideoSourceIndex((current) => {
        const next = current + 1;
        return next < shankhVideoFallbacks.length ? next : current;
      });
    }
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


      {/* ==================================================
          3D SCENE
      ================================================== */}

      <div className="medallion__scene">


        {/* =================================================
            3D CARD
        ================================================= */}

        <div className="medallion__card">


          {/* =================================================
              FRONT — IMAGE
          ================================================= */}

          <div className="medallion__face medallion__front">


            {imageSrc ? (

              <img
                src={imageSrc}
                alt={`${name} idol`}
                className="medallion__image"
                draggable="false"
                loading="lazy"
                onError={handleImageError}
              />

            ) : (

              <div className="medallion__fallback">

                <span className="medallion__fallback-symbol">
                  {symbol}
                </span>

              </div>

            )}


            {/* =================================================
                FRONT OVERLAY
            ================================================= */}

            <div
              className="medallion__front-overlay"
              aria-hidden="true"
            />


            {/* =================================================
                FRONT CONTENT
            ================================================= */}

            <div className="medallion__front-content">

              <span className="medallion__front-name">
                {name}
              </span>

              <span className="medallion__front-blurb">
                Tap to discover
              </span>

            </div>


            {/* =================================================
                MOBILE FLIP BUTTON
            ================================================= */}

            <button
              type="button"
              className="medallion__flip-button"
              onClick={handleMobileFlip}
              aria-label={
                isFlipped
                  ? `Show ${name} image`
                  : videoSrc
                    ? `Play ${name} video`
                    : `Show ${name} video`
              }
            >

              <span aria-hidden="true">
                {isFlipped ? '↩' : '↻'}
              </span>

            </button>

          </div>


          {/* =================================================
              BACK — VIDEO
          ================================================= */}

          <div className="medallion__face medallion__back">


            {videoSrc ? (

              <video
                ref={videoRef}
                className="medallion__video"
                src={videoSrc}
                muted
                loop
                playsInline
                preload="auto"
                onError={handleVideoError}
                aria-label={`${name} devotional video`}
              />

            ) : (

              <div className="medallion__video-fallback">

                <span>
                  {symbol}
                </span>

                <small>
                  Video coming soon
                </small>

              </div>

            )}


            {/* =================================================
                VIDEO OVERLAY
            ================================================= */}

            <div
              className="medallion__video-overlay"
              aria-hidden="true"
            />
  

            {/* =================================================
                BACK CONTENT
            ================================================= */}

            <div className="medallion__back-content">

              <span className="medallion__back-name">
                {name}
              </span>

              <span className="medallion__back-label">
                {videoSrc
                  ? 'Devotion in motion'
                  : 'Video coming soon'}
              </span>

            </div>


            {/* =================================================
                BACK FLIP BUTTON
            ================================================= */}

            <button
              type="button"
              className="medallion__flip-button medallion__flip-button--back"
              onClick={handleMobileFlip}
              aria-label={`Show ${name} image`}
            >

              <span aria-hidden="true">
                ↩
              </span>

            </button>

          </div>


        </div>

      </div>

    </div>

  );
}
