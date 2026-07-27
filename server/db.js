import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, 'data', 'db.json');

const defaultData = {
  users: [],
  products: [],
  orders: []
};

export const db = new Low(new JSONFile(file), defaultData);

const seedProducts = [
  {
    category: 'Ganesh Ji',
    items: [
      { name: 'Riddhi Siddhi Ganesh Murti', price: 4499, weight: '450g', height: '6 inch', desc: 'Hand-finished silver Ganesh idol seated on a lotus base, flanked by Riddhi and Siddhi, crafted for the home mandir.' },
      { name: 'Bal Ganesh Silver Idol', price: 2999, weight: '280g', height: '4.5 inch', desc: 'A playful Bal Ganesh murti with fine trunk detailing, ideal as a housewarming or wedding gift.' },
      { name: 'Panchmukhi Ganesh Statue', price: 7999, weight: '620g', height: '7 inch', desc: 'Rare five-faced Ganesh idol representing the five elements, finished with intricate mukut work.' }
    ]
  },
  {
    category: 'Lakshmi Ji',
    items: [
      { name: 'Kamal Aasan Lakshmi Murti', price: 5499, weight: '480g', height: '6.5 inch', desc: 'Goddess Lakshmi seated on a full-bloom lotus, coins cascading from her palm, for prosperity and abundance.' },
      { name: 'Lakshmi Ganesh Jodi', price: 8999, weight: '750g', height: '6 inch pair', desc: 'The classic Diwali pairing — Lakshmi and Ganesh together on a single ornate silver platform.' },
      { name: 'Gaja Lakshmi Idol', price: 6999, weight: '540g', height: '6 inch', desc: 'Lakshmi flanked by two elephants performing abhishek, a symbol of royal fortune.' }
    ]
  },
  {
    category: 'Hanuman Ji',
    items: [
      { name: 'Veer Hanuman Murti', price: 5999, weight: '560g', height: '7 inch', desc: 'A powerful standing Hanuman idol with gada in hand, detailed armour and flowing angavastram.' },
      { name: 'Sankat Mochan Hanuman', price: 4299, weight: '400g', height: '5.5 inch', desc: 'Hanuman ji in blessing posture, believed to remove obstacles and protect the household.' },
      { name: 'Panchmukhi Hanuman Idol', price: 8499, weight: '700g', height: '7.5 inch', desc: 'Five-faced Hanuman murti, an intricate and rare piece for dedicated devotees.' }
    ]
  },
  {
    category: 'Shiv Ji',
    items: [
      { name: 'Shiv Parivar Murti', price: 9999, weight: '900g', height: '6 inch group', desc: 'The complete Shiv family — Shiva, Parvati, Ganesh and Kartikeya — on one ornate base.' },
      { name: 'Dhyan Mudra Shiv Idol', price: 5299, weight: '460g', height: '6 inch', desc: 'Lord Shiva in deep meditation, matted hair and trishul finely etched by hand.' },
      { name: 'Nataraja Silver Statue', price: 11499, weight: '1.1kg', height: '9 inch', desc: 'Shiva as Nataraja within a silver prabhavali ring, our most detailed showpiece.' }
    ]
  },
  {
    category: 'Krishna Ji',
    items: [
      { name: 'Bansuri Krishna Murti', price: 4799, weight: '420g', height: '6 inch', desc: 'Krishna playing the flute in classic tribhanga pose, peacock feather crown detailing.' },
      { name: 'Radha Krishna Jodi', price: 9499, weight: '820g', height: '7 inch pair', desc: 'Radha and Krishna together beneath a silver kadamba arch, a treasured wedding gift.' }
    ]
  }
];

export async function initDb() {
  await db.read();
  db.data ||= defaultData;

  if (db.data.products.length === 0) {
    const products = [];
    for (const group of seedProducts) {
      for (const item of group.items) {
        products.push({
          id: nanoid(10),
          category: group.category,
          name: item.name,
          price: item.price,
          weight: item.weight,
          height: item.height,
          description: item.desc,
          inStock: true,
          createdAt: new Date().toISOString()
        });
      }
    }
    db.data.products = products;
    await db.write();
  }
}
