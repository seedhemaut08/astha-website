import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/_aastha__aa?igsh=MWVnd3NwZXI5NTZsNw==&utm_source=ig_contact_invite';
const WHATSAPP_URL = 'https://wa.me/918829841467';

export default function Footer() {
  return (
    <footer className="footer">

      <div
        className="footer__ornament"
        aria-hidden="true"
      />

      <div className="footer__inner">

        {/* =========================
            BRAND
        ========================== */}
        <div className="footer__brand">

          <Link
            to="/"
            aria-label="Astha Home"
          >
            <img
              src="/images/Aastha%20Logo-3.png"
              alt="Astha"
              className="footer__brand-logo"
            />
          </Link>

          <p>
            Crafted with tradition. <br />
            Made with devotion. <br />
            Meant to be cherished.
          </p>

          <div className="footer__socials">

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram
                size={18}
                strokeWidth={1.5}
              />
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle
                size={18}
                strokeWidth={1.5}
              />
            </a>

          </div>

        </div>


        {/* =========================
            EXPLORE
        ========================== */}
        <div className="footer__col">

          <h4>Explore</h4>

          <Link to="/shop">
            Shop All
          </Link>

          <Link to="/shop/Ganesh%20Ji">
            Ganesh Ji
          </Link>

          <Link to="/shop/Lakshmi%20Ji">
            Lakshmi Ji
          </Link>

          <Link to="/shop/Krishnaleela%20Clock">
            Krishnaleela Clock
          </Link>

          <Link to="/shop/Peacock">
            Peacock
          </Link>

          <Link to="/shop/Krishna%20Ji">
            Krishna Ji
          </Link>

        </div>


        {/* =========================
            ASTHA
        ========================== */}
        <div className="footer__col">

          <h4>Astha</h4>

          <Link to="/about">
            Our Craft
          </Link>

          <Link to="/contact">
            Get in Touch
          </Link>

          <Link to="/account">
            My Account
          </Link>

        </div>


        {/* =========================
            REACH US
        ========================== */}
        <div className="footer__col">

          <h4>Reach Us</h4>

          <p>
            +91 88298 41467
          </p>

          <p>
            Jaipur, Rajasthan
          </p>

        </div>

      </div>


      {/* =========================
          FOOTER BOTTOM
      ========================== */}
      <div className="footer__bottom">

        <p>
          © {new Date().getFullYear()} Astha. All rights reserved.
        </p>

      </div>

    </footer>
  );
}