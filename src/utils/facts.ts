import { SDGFact } from '../types';

export const SDG_FACTS: SDGFact[] = [
  {
    id: 1,
    title: "The Deadly Mimicry",
    fact: "To a sea turtle, floating plastic grocery bags look almost identical to jellyfish, their staple natural prey. Over 52% of sea turtles worldwide have ingested plastic debris.",
    actionTip: "Refuse single-use plastic grocery bags. Switch to durable reusable canvas totes."
  },
  {
    id: 2,
    title: "SDG 14: Life Below Water",
    fact: "Target 14.1 calls for the prevention and significant reduction of all marine pollution by 2025, specifically land-based debris and plastic waste entering our rivers and oceans.",
    actionTip: "Support municipal deposit-return schemes and avoid single-use plastics."
  },
  {
    id: 3,
    title: "Ghost Gear Menace",
    fact: "Discarded and lost commercial fishing nets (known as 'ghost nets') make up an estimated 10% of all ocean plastic and continue trapping sea turtles and marine mammals for decades.",
    actionTip: "Advocate for tagged fishing gear and support ocean cleanup retrieval initiatives."
  },
  {
    id: 4,
    title: "Beverage Rings & Entanglement",
    fact: "Six-pack beverage rings take hundreds of years to photodegrade into microplastics. Young turtles become trapped inside them, causing shell deformities and drowning.",
    actionTip: "Always snip every loop of plastic six-pack rings before recycling, or buy ringless packaging."
  },
  {
    id: 5,
    title: "11 Million Tons Annually",
    fact: "An estimated 11 to 14 million metric tons of plastic waste leak into the world's oceans every year—equivalent to dumping one garbage truck of plastic every single minute.",
    actionTip: "Carry a reusable insulated water bottle instead of buying single-use bottled water."
  },
  {
    id: 6,
    title: "Slow Degradation into Microplastics",
    fact: "Plastic bottles do not biodegrade. In ocean water, UV sunlight breaks them into microscopic particles that absorb toxic chemicals and enter the marine food web.",
    actionTip: "Participate in local river or coastal cleanup drives before waste reaches open waters."
  }
];

export function getRandomFact(): SDGFact {
  const index = Math.floor(Math.random() * SDG_FACTS.length);
  return SDG_FACTS[index];
}
