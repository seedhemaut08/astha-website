import {
  useEffect,
  useRef,
  useState,
} from 'react';


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
  'Frame': 'फ',
};


/*
=========================================================
DEFAULT CATEGORY MEDIA
=========================================================
*/

const DEFAULT_MEDIA = {
  'Ganesh Ji': {
    image: '/images/devotion/ganesh.webp',
    video: '/images/devotion/ganeshr.mp4',
  },

  'Lakshmi Ji': {
    image: '/images/devotion/lakshmi.png',
    video: '/images/devotion/lakshmir.mp4',
  },

  'Krishnaleela Clock': {
    image: '/images/devotion/ghadi.png',
    video: '/images/devotion/clockr.mp4',
  },

  'Shiv Ji': {
    image: '/images/devotion/shiv.jpg',
    video: '/images/devotion/shiv.mp4',
  },

  'Peacock': {
    image: '/images/devotion/mor.png',
    video: '/images/devotion/morr.mp4',
  },

  'Krishna Ji': {
    image: '/images/devotion/krishna.png',
    video: '/images/devotion/krishnar.mp4',
  },

  'Cow & Calf': {
    image: '/images/devotion/cow.png',
    video: '/images/devotion/cowr.mp4',
  },

  'Shankh': {
    image: '/images/devotion/Shankh.png',
    video: '/images/devotion/Shankhr.mp4',

    videoFallbacks: [
      '/images/devotion/Shankhr.mp4',
      '/images/devotion/Shankhr%20.mp4',
      '/images/devotion/Shankhr.MP4',
      '/images/devotion/Shankhr%20.MP4',
    ],
  },

  'Candle Stand': {
    image: '/images/devotion/candle.png',
    video: '/images/devotion/candler.mp4',
  },

  'Swan': {
    image: '/images/devotion/swan.png',
    video: '/images/devotion/swanr.mp4',
  },

  'Photo Frame': {
    image: '/images/devotion/frame.png',
    video: '/images/devotion/framer.mp4',
  },
};


/*
=========================================================
HOVER SUPPORT
=========================================================
*/

const supportsHover = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  ).matches;
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
  video,
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
  */

  const [imageFailed, setImageFailed] = useState(false);


  /*
  ========================================================
  VIDEO SOURCE ERROR STATE
  ========================================================
  */

  const [videoSourceIndex, setVideoSourceIndex] = useState(0);


  /*
  ========================================================
  VIDEO REQUEST STATE

  Video is not rendered until the user interacts with
  the card.
  ========================================================
  */

  const [videoRequested, setVideoRequested] = useState(false);


  /*
  ========================================================
  RESET WHEN PRODUCT CHANGES
  ========================================================
  */

  useEffect(() => {
    setImageFailed(false);
    setVideoSourceIndex(0);
    setVideoRequested(false);
    setIsFlipped(false);
  }, [image, category]);


  /*
  ========================================================
  CATEGORY SYMBOL
  ========================================================
  */

  const symbol = SYMBOLS[category] || 'अ';


  /*
  ========================================================
  RESOLVE CATEGORY
  ========================================================
  */

  const normalizedCategory = String(
    category || ''
  )
    .trim()
    .toLowerCase();

  const normalizedName = String(
    name || ''
  )
    .trim()
    .toLowerCase();


  const resolvedCategory =
    normalizedCategory.includes('shankh') ||
    normalizedName.includes('shankh')
      ? 'Shankh'
      : category;


  /*
  ========================================================
  CATEGORY FALLBACK MEDIA
  ========================================================
  */

  const media =
    DEFAULT_MEDIA[resolvedCategory] || {};


  /*
  ========================================================
  FINAL IMAGE
  ========================================================
  */

  const imageSrc =
    !imageFailed && image
      ? image
      : media.image;


  /*
  ========================================================
  VIDEO FALLBACK SOURCES
  ========================================================
  */

  const shankhVideoFallbacks =
    resolvedCategory === 'Shankh'
      ? (
          media.videoFallbacks?.length
            ? media.videoFallbacks
            : [media.video]
        )
      : [
          video || media.video,
        ];


  /*
  ========================================================
  FINAL VIDEO SOURCE
  ========================================================
  */

  const videoSrc =
    video ||
    shankhVideoFallbacks[
      Math.min(
        videoSourceIndex,
        Math.max(
          shankhVideoFallbacks.length - 1,
          0
        )
      )
    ];


  /*
  ========================================================
  PLAY / RESET VIDEO
  ========================================================
  */

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }


    if (isFlipped && videoSrc) {

      try {
        videoElement.currentTime = 0;
      } catch {
        // Ignore media reset errors.
      }


      const playPromise =
        videoElement.play();


      if (
        playPromise !== undefined
      ) {
        playPromise.catch(() => {
          // Ignore autoplay errors.
        });
      }

    } else {

      videoElement.pause();

      try {
        videoElement.currentTime = 0;
      } catch {
        // Ignore media reset errors.
      }
    }

  }, [
    isFlipped,
    videoSrc,
  ]);


  /*
  ========================================================
  DESKTOP HOVER
  ========================================================
  */

  const handleMouseEnter = () => {
    if (!supportsHover()) {
      return;
    }

    if (videoSrc) {
      setVideoRequested(true);
    }

    setIsFlipped(true);
  };


  /*
  ========================================================
  DESKTOP HOVER LEAVE
  ========================================================
  */

  const handleMouseLeave = () => {
    if (!supportsHover()) {
      return;
    }

    setIsFlipped(false);
  };


  /*
  ========================================================
  MOBILE FLIP
  ========================================================
  */

  const handleMobileFlip = (event) => {
    event.preventDefault();
    event.stopPropagation();


    if (!videoRequested && videoSrc) {
      setVideoRequested(true);
    }


    setIsFlipped(
      (previous) => !previous
    );
  };


  /*
  ========================================================
  IMAGE LOAD ERROR
  ========================================================
  */

  const handleImageError = () => {
    if (image) {
      setImageFailed(true);
    }
  };


  /*
  ========================================================
  VIDEO LOAD ERROR
  ========================================================
  */

  const handleVideoError = () => {

    if (
      resolvedCategory === 'Shankh'
    ) {

      setVideoSourceIndex(
        (current) => {

          const next =
            current + 1;

          return next <
            shankhVideoFallbacks.length
            ? next
            : current;
        }
      );

      return;
    }


    setVideoRequested(false);
  };


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <div
      className={
        `medallion medallion--${size} ${
          isFlipped
            ? 'medallion--flipped'
            : ''
        }`
      }

      role="group"

      aria-label={
        `${name} devotion card`
      }

      onMouseEnter={
        handleMouseEnter
      }

      onMouseLeave={
        handleMouseLeave
      }
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

          <div
            className={
              'medallion__face medallion__front'
            }
          >


            {imageSrc ? (

              <img
                src={imageSrc}

                alt={
                  `${name} idol`
                }

                className="medallion__image"

                draggable="false"

                loading="lazy"

                decoding="async"

                onError={
                  handleImageError
                }
              />

            ) : (

              <div
                className="medallion__fallback"
              >

                <span
                  className={
                    'medallion__fallback-symbol'
                  }
                >
                  {symbol}
                </span>

              </div>

            )}


            {/* =================================================
                FRONT OVERLAY
            ================================================== */}

            <div
              className={
                'medallion__front-overlay'
              }

              aria-hidden="true"
            />


            {/* =================================================
                FRONT CONTENT
            ================================================== */}

            <div
              className={
                'medallion__front-content'
              }
            >

              <span
                className={
                  'medallion__front-name'
                }
              >
                {name}
              </span>


              <span
                className={
                  'medallion__front-blurb'
                }
              >
                Tap to discover
              </span>

            </div>


            {/* =================================================
                MOBILE FLIP BUTTON
            ================================================== */}

            <button
              type="button"

              className={
                'medallion__flip-button'
              }

              onClick={
                handleMobileFlip
              }

              aria-label={
                isFlipped
                  ? `Show ${name} image`
                  : videoSrc
                    ? `Play ${name} video`
                    : `Show ${name} video`
              }
            >

              <span
                aria-hidden="true"
              >
                {
                  isFlipped
                    ? '↩'
                    : '↻'
                }
              </span>

            </button>

          </div>


          {/* =================================================
              BACK — VIDEO
          ================================================== */}

          <div
            className={
              'medallion__face medallion__back'
            }
          >


            {videoRequested && videoSrc ? (

              <video
                ref={videoRef}

                className={
                  'medallion__video'
                }

                src={videoSrc}

                poster={imageSrc || undefined}

                muted

                loop

                playsInline

                preload="none"

                onError={
                  handleVideoError
                }

                aria-label={
                  `${name} devotional video`
                }
              />

            ) : (

              <div
                className={
                  'medallion__video-fallback'
                }
              >

                <span>
                  {symbol}
                </span>

                <small>
                  {
                    videoSrc
                      ? 'Tap to discover'
                      : 'Video coming soon'
                  }
                </small>

              </div>

            )}


            {/* =================================================
                VIDEO OVERLAY
            ================================================== */}

            <div
              className={
                'medallion__video-overlay'
              }

              aria-hidden="true"
            />


            {/* =================================================
                BACK CONTENT
            ================================================== */}

            <div
              className={
                'medallion__back-content'
              }
            >

              <span
                className={
                  'medallion__back-name'
                }
              >
                {name}
              </span>


              <span
                className={
                  'medallion__back-label'
                }
              >
                {
                  videoSrc
                    ? 'Devotion in motion'
                    : 'Video coming soon'
                }
              </span>

            </div>


            {/* =================================================
                BACK FLIP BUTTON
            ================================================== */}

            <button
              type="button"

              className={
                'medallion__flip-button medallion__flip-button--back'
              }

              onClick={
                handleMobileFlip
              }

              aria-label={
                `Show ${name} image`
              }
            >

              <span
                aria-hidden="true"
              >
                ↩
              </span>

            </button>

          </div>


        </div>


      </div>


    </div>

  );
}