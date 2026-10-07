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
    image: '/images/devotion/lakshmi.webp',
    video: '/images/devotion/lakshmir.mp4',
  },

  'Krishnaleela Clock': {
    image: '/images/devotion/ghadi.webp',
    video: '/images/devotion/clockr.mp4',
  },

  'Shiv Ji': {
    image: '/images/devotion/shiv.jpg',
    video: '/images/devotion/shiv.mp4',
  },

  'Peacock': {
    image: '/images/devotion/mor.webp',
    video: '/images/devotion/morr.mp4',
  },

  'Krishna Ji': {
    image: '/images/devotion/krishna.png',
    video: '/images/devotion/krishnar.mp4',
  },

  'Cow & Calf': {
    image: '/images/devotion/cow.webp',
    video: '/images/devotion/cowr.mp4',
  },

  'Shankh': {
    image: '/images/devotion/Shankh.webp',
    video: '/images/devotion/Shankhr.mp4',

    videoFallbacks: [
      '/images/devotion/Shankhr.mp4',
      '/images/devotion/Shankhr%20.mp4',
      '/images/devotion/Shankhr.MP4',
      '/images/devotion/Shankhr%20.MP4',
    ],
  },

  'Candle Stand': {
    image: '/images/devotion/candle.webp',
    video: '/images/devotion/candler.mp4',
  },

  'Swan': {
    image: '/images/devotion/swan.webp',
    video: '/images/devotion/swanr.mp4',
  },

  'Photo Frame': {
    image: '/images/devotion/frame.webp',
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
ACTIVE CARD TRACKER
=========================================================

Only one card may keep its video open at a time.
Opening a new card closes the previously opened one,
so several heavy videos never sit in memory together.
=========================================================
*/

let activeCardClose = null;


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
  VIDEO READY STATE

  Becomes true only once the browser has actually
  buffered enough of the video to play it smoothly.
  Until then we keep showing the product image so the
  card never goes blank / shows the page background.
  ========================================================
  */

  const [videoReady, setVideoReady] = useState(false);


  /*
  ========================================================
  VIDEO STALLED / SLOW STATE

  True while the browser is actively waiting for more
  video data after playback was requested. Used to show
  a small "loading" pulse instead of a blank card.
  ========================================================
  */

  const [videoStalled, setVideoStalled] = useState(false);


  /*
  ========================================================
  RESET WHEN PRODUCT CHANGES
  ========================================================
  */

  useEffect(() => {
    setImageFailed(false);
    setVideoSourceIndex(0);
    setVideoRequested(false);
    setVideoReady(false);
    setVideoStalled(false);
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

      setVideoReady(false);
      setVideoStalled(false);
    }

  }, [
    isFlipped,
    videoSrc,
  ]);


  /*
  ========================================================
  RELEASE VIDEO MEMORY

  After the card flips back, the video element is removed
  once the flip animation has finished. This frees the
  buffered video data so the tab never runs out of memory.
  ========================================================
  */

  useEffect(() => {
    if (isFlipped || !videoRequested) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const videoElement = videoRef.current;

      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }

      setVideoRequested(false);
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [isFlipped, videoRequested]);


  /*
  ========================================================
  CLAIM ACTIVE SLOT

  Closes whichever other card is currently open.
  ========================================================
  */

  const claimActiveSlot = () => {
    if (activeCardClose) {
      activeCardClose();
    }

    activeCardClose = () => {
      setIsFlipped(false);
    };
  };


  /*
  ========================================================
  DESKTOP HOVER
  ========================================================
  */

  const handleMouseEnter = () => {
    if (!supportsHover()) {
      return;
    }

    claimActiveSlot();

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


    if (!isFlipped) {
      claimActiveSlot();
    }


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

    setVideoReady(false);
    setVideoStalled(false);

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
  VIDEO CAN PLAY

  Fired once the browser has enough data buffered to
  start playback smoothly. Only now do we hide the
  fallback image behind the video.
  ========================================================
  */

  const handleVideoCanPlay = () => {
    setVideoReady(true);
    setVideoStalled(false);
  };


  /*
  ========================================================
  VIDEO WAITING

  Fired when playback has started but the browser has
  run out of buffered data and is fetching more. We show
  a small loading pulse instead of leaving the card blank.
  ========================================================
  */

  const handleVideoWaiting = () => {
    setVideoStalled(true);
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
              A safety-net image is always painted behind
              the video (via inline background style) so
              the card can NEVER show a blank / page
              background while the video is still loading.
          ================================================== */}

          <div
            className={
              'medallion__face medallion__back'
            }

            style={
              imageSrc
                ? {
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >


            {videoRequested && videoSrc && (

              <video
                ref={videoRef}

                className={
                  `medallion__video ${
                    videoReady
                      ? 'medallion__video--ready'
                      : ''
                  }`
                }

                style={{
                  opacity: videoReady ? 1 : 0,
                  transition: 'opacity 0.25s ease',
                }}

                src={videoSrc}

                poster={imageSrc || undefined}

                muted

                loop

                playsInline

                preload="metadata"

                onCanPlay={
                  handleVideoCanPlay
                }

                onPlaying={
                  handleVideoCanPlay
                }

                onWaiting={
                  handleVideoWaiting
                }

                onError={
                  handleVideoError
                }

                aria-label={
                  `${name} devotional video`
                }
              />

            )}


            {(!videoRequested || !videoSrc) && (

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
                LOADING PULSE — shown only while the
                video has been requested but is still
                buffering. The safety-net image behind it
                stays fully visible the whole time.
            ================================================== */}

            {videoRequested && videoSrc && !videoReady && (

              <div
                className="medallion__video-loading"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >

                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: 'rgba(255,255,255,0.9)',
                    animation: videoStalled
                      ? 'medallion-spin 0.8s linear infinite'
                      : 'none',
                    opacity: videoStalled ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                  }}
                />

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


      <style>{`
        @keyframes medallion-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>


    </div>

  );
}