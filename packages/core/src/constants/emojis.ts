/** Curated, tagged emoji set for the design canvas. Emojis render as text
 *  layers (native, exports fine). Searchable by tag. */
export interface EmojiDef {
  char: string;
  tags: string[];
}

export const EMOJIS: ReadonlyArray<EmojiDef> = [
  // faces / love
  { char: '😀', tags: ['face', 'happy', 'smile'] },
  { char: '😎', tags: ['face', 'cool', 'sunglasses'] },
  { char: '🥳', tags: ['party', 'celebrate', 'birthday'] },
  { char: '😍', tags: ['love', 'face', 'heart'] },
  { char: '🤩', tags: ['star', 'face', 'wow'] },
  { char: '😂', tags: ['laugh', 'face', 'fun'] },
  { char: '❤️', tags: ['love', 'heart', 'red'] },
  { char: '🔥', tags: ['fire', 'hot', 'lit', 'flame'] },
  { char: '✨', tags: ['sparkle', 'shine', 'magic'] },
  { char: '⭐', tags: ['star', 'favorite'] },
  { char: '🌟', tags: ['star', 'glow', 'shine'] },
  { char: '💫', tags: ['star', 'dizzy', 'sparkle'] },
  { char: '💯', tags: ['hundred', 'perfect', 'score'] },
  { char: '⚡', tags: ['lightning', 'energy', 'power'] },
  { char: '💥', tags: ['boom', 'burst', 'pow'] },
  { char: '👑', tags: ['crown', 'king', 'queen', 'royal'] },
  { char: '💎', tags: ['gem', 'diamond', 'luxury'] },
  { char: '🎉', tags: ['party', 'celebrate', 'owambe'] },
  { char: '🎊', tags: ['party', 'confetti', 'celebrate'] },
  { char: '🎈', tags: ['party', 'balloon', 'birthday'] },
  { char: '🎂', tags: ['cake', 'birthday', 'party'] },
  { char: '🎁', tags: ['gift', 'present', 'birthday'] },
  // nature / weather
  { char: '☀️', tags: ['sun', 'summer', 'weather'] },
  { char: '🌙', tags: ['moon', 'night'] },
  { char: '🌈', tags: ['rainbow', 'colorful', 'pride'] },
  { char: '🌊', tags: ['wave', 'ocean', 'sea'] },
  { char: '🌴', tags: ['palm', 'tropical', 'summer'] },
  { char: '🌸', tags: ['flower', 'floral', 'spring'] },
  { char: '🌻', tags: ['sunflower', 'flower', 'summer'] },
  { char: '🍀', tags: ['clover', 'luck', 'green'] },
  { char: '🌍', tags: ['earth', 'world', 'globe'] },
  { char: '🏙️', tags: ['city', 'skyline', 'buildings', 'lagos'] },
  { char: '🌆', tags: ['city', 'sunset', 'skyline'] },
  { char: '🗽', tags: ['city', 'statue', 'landmark'] },
  // music / activity
  { char: '🎵', tags: ['music', 'note', 'song'] },
  { char: '🎶', tags: ['music', 'notes', 'song'] },
  { char: '🎧', tags: ['music', 'headphones', 'dj'] },
  { char: '🎤', tags: ['music', 'mic', 'sing'] },
  { char: '🎸', tags: ['music', 'guitar', 'rock'] },
  { char: '🥁', tags: ['music', 'drum'] },
  { char: '🏆', tags: ['trophy', 'win', 'champion'] },
  { char: '🥇', tags: ['medal', 'gold', 'first'] },
  { char: '⚽', tags: ['football', 'soccer', 'sport'] },
  { char: '🏀', tags: ['basketball', 'sport'] },
  { char: '🎮', tags: ['game', 'play', 'gamer'] },
  { char: '🎯', tags: ['target', 'goal', 'aim'] },
  // food / drink
  { char: '☕', tags: ['coffee', 'drink', 'cafe'] },
  { char: '🍕', tags: ['pizza', 'food'] },
  { char: '🍔', tags: ['burger', 'food'] },
  { char: '🍦', tags: ['ice cream', 'food', 'summer'] },
  { char: '🍩', tags: ['donut', 'food'] },
  { char: '🍷', tags: ['wine', 'drink'] },
  { char: '🍻', tags: ['beer', 'drink', 'party'] },
  // symbols / objects
  { char: '🚀', tags: ['rocket', 'space', 'launch'] },
  { char: '💀', tags: ['skull', 'edgy', 'street'] },
  { char: '👻', tags: ['ghost', 'spooky', 'fun'] },
  { char: '🤖', tags: ['robot', 'tech', 'ai'] },
  { char: '👽', tags: ['alien', 'space'] },
  { char: '🦁', tags: ['lion', 'animal', 'wild'] },
  { char: '🐯', tags: ['tiger', 'animal', 'wild'] },
  { char: '🐶', tags: ['dog', 'animal', 'pet'] },
  { char: '🐱', tags: ['cat', 'animal', 'pet'] },
  { char: '🦋', tags: ['butterfly', 'nature'] },
  { char: '🐝', tags: ['bee', 'nature'] },
  { char: '🌹', tags: ['rose', 'flower', 'love'] },
  { char: '✝️', tags: ['cross', 'faith', 'church'] },
  { char: '☮️', tags: ['peace', 'symbol'] },
  { char: '♻️', tags: ['recycle', 'eco', 'green'] },
  { char: '🤙', tags: ['hand', 'shaka', 'cool'] },
  { char: '✌️', tags: ['peace', 'hand', 'victory'] },
  { char: '👊', tags: ['fist', 'punch', 'power'] },
  { char: '🙏', tags: ['pray', 'thanks', 'faith'] },
  { char: '💪', tags: ['muscle', 'strong', 'gym'] },
  { char: '🦅', tags: ['eagle', 'bird', 'freedom'] },
  { char: '🌃', tags: ['night', 'city', 'stars'] },
  { char: '🍃', tags: ['leaf', 'nature', 'wind'] },
];

export const searchEmojis = (query: string): EmojiDef[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [...EMOJIS];
  return EMOJIS.filter((e) => e.tags.some((t) => t.includes(q)));
};
