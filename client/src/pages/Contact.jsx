import { useState } from 'react';
import { MessageCircle, Instagram, Phone } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/918829841467';
const INSTAGRAM_URL = 'https://instagram.com/astha.silvers';

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="contact-page">
      <div className="contact-page__header">
        <span className="eyebrow">Get in Touch</span>
        <h1>We'd love to hear from you</h1>
        <p>For custom orders, bulk gifting, or anything else — reach out directly.</p>
      </div>

      <div className="contact-page__layout">
        <div className="contact-cards">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="contact-card">
            <MessageCircle size={22} strokeWidth={1.5} />
            <div>
              <strong>WhatsApp</strong>
              <span>+91 88298 41467</span>
            </div>
          </a>
          <a href="tel:+918829841467" className="contact-card">
            <Phone size={22} strokeWidth={1.5} />
            <div>
              <strong>Call Us</strong>
              <span>+91 88298 41467</span>
            </div>
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="contact-card">
            <Instagram size={22} strokeWidth={1.5} />
            <div>
              <strong>Instagram</strong>
              <span>@astha.silvers</span>
            </div>
          </a>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {sent ? (
            <div className="form-success">Thank you — we'll be in touch shortly.</div>
          ) : (
            <>
              <label>Name<input type="text" required /></label>
              <label>Email<input type="email" required /></label>
              <label>Message<textarea rows={5} required /></label>
              <button className="btn btn--primary btn--full" type="submit">Send Message</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
