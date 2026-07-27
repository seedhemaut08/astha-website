import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

const INSTAGRAM_URL = 'https://instagram.com/astha.silvers';
const WHATSAPP_URL = 'https://wa.me/918829841467';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__ornament" aria-hidden="true" />
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__brand-text">ASTHA</span>
          <p>Silver idols, crafted with devotion — for the home mandir and every milestone worth blessing.</p>
          <div className="footer__socials">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} strokeWidth={1.5} />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <MessageCircle size={18} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Explore</h4>
          <Link to="/shop">Shop All</Link>
          <Link to="/shop/Ganesh%20Ji">Ganesh Ji</Link>
          <Link to="/shop/Lakshmi%20Ji">Lakshmi Ji</Link>
          <Link to="/shop/Hanuman%20Ji">Hanuman Ji</Link>
          <Link to="/shop/Shiv%20Ji">Shiv Ji</Link>
        </div>

        <div className="footer__col">
          <h4>Astha</h4>
          <Link to="/about">Our Craft</Link>
          <Link to="/contact">Get in Touch</Link>
          <Link to="/account">My Account</Link>
        </div>

        <div className="footer__col">
          <h4>Reach Us</h4>
          <p>+91 88298 41467</p>
          <p>Jaipur, Rajasthan</p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} Astha. All rights reserved.</p>
      </div>
    </footer>
  );
}
