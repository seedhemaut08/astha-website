const SYMBOLS = {
  'Ganesh Ji': 'ग',
  'Lakshmi Ji': 'ल',
  'Hanuman Ji': 'ह',
  'Shiv Ji': 'श',
  'Krishna Ji': 'क'
};

export default function ProductMedallion({ category, name, size = 'md' }) {
  const symbol = SYMBOLS[category] || 'अ';
  return (
    <div className={`medallion medallion--${size}`} role="img" aria-label={name}>
      <div className="medallion__ring">
        <span className="medallion__symbol">{symbol}</span>
      </div>
    </div>
  );
}
