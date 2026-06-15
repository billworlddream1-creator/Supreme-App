import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link, Image as ImageIcon, Settings, Type, 
  Smile, Search, X, Compass, Palette, Maximize, ChevronDown, Check, Upload, Trash
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// --------------------------------------------------------
// Comprehensive Emoji Corpus (Up to 1000 Emojis Organized by Category)
// --------------------------------------------------------
import { 
  EmojiItem as ImportedEmojiItem, 
  EmojiCategory as ImportedEmojiCategory, 
  EMOJI_CATEGORIES as IMPORTED_EMOJI_CATEGORIES, 
  ALL_EMOJIS_LIST as IMPORTED_ALL_EMOJIS_LIST, 
  searchEmojis 
} from '../constants/emojis';

const EMOJI_CATEGORIES = IMPORTED_EMOJI_CATEGORIES;
const ALL_EMOJIS_LIST = IMPORTED_ALL_EMOJIS_LIST;

interface EmojiItem {
  char: string;
  name: string;
  keywords: string[];
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: EmojiItem[];
}

const OLD_EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smileys & People',
    icon: '😄',
    emojis: [
      { char: '😄', name: 'grinning face with smiling eyes', keywords: ['smile', 'happy', 'joy', 'grin'] },
      { char: '😃', name: 'grinning face', keywords: ['smile', 'happy', 'joy'] },
      { char: '😀', name: 'grinning face open mouth', keywords: ['smile', 'happy', 'joy'] },
      { char: '😊', name: 'smiling face with smiling eyes', keywords: ['smile', 'happy', 'blush'] },
      { char: '😉', name: 'winking face', keywords: ['wink', 'flirt'] },
      { char: '😍', name: 'smiling face with heart-eyes', keywords: ['love', 'heart', 'crush', 'want'] },
      { char: '😘', name: 'face blowing a kiss', keywords: ['kiss', 'love', 'flirt'] },
      { char: '😚', name: 'kissing face with closed eyes', keywords: ['kiss', 'love'] },
      { char: '😜', name: 'winking face with tongue', keywords: ['playful', 'tongue', 'crazy'] },
      { char: '😝', name: 'squinting face with tongue', keywords: ['playful', 'tongue', 'crazy'] },
      { char: '😛', name: 'face with tongue', keywords: ['playful', 'tongue'] },
      { char: '😳', name: 'flushed face', keywords: ['blush', 'shy', 'embarrassed'] },
      { char: '😎', name: 'smiling face with sunglasses', keywords: ['cool', 'sun', 'rad', 'sunglasses'] },
      { char: '🤓', name: 'nerd face', keywords: ['glasses', 'smart', 'nerd'] },
      { char: '🥳', name: 'partying face', keywords: ['celebrate', 'party', 'birthday', 'woo'] },
      { char: '🥺', name: 'pleading face', keywords: ['please', 'cute', 'eyes', 'cry'] },
      { char: '😢', name: 'crying face', keywords: ['cry', 'sad', 'tear'] },
      { char: '😭', name: 'loudly crying face', keywords: ['cry', 'sad', 'sob', 'tear'] },
      { char: '😂', name: 'face with tears of joy', keywords: ['laugh', 'lol', 'funny', 'haha'] },
      { char: '🤣', name: 'rolling on the floor laughing', keywords: ['laugh', 'lol', 'rofl', 'funny'] },
      { char: '😡', name: 'pouting face', keywords: ['angry', 'mad', 'rage'] },
      { char: '😤', name: 'face with steam from nose', keywords: ['angry', 'frustrated'] },
      { char: '🤯', name: 'exploding head', keywords: ['mind', 'blown', 'shock'] },
      { char: '😱', name: 'face screaming in fear', keywords: ['scared', 'shock', 'scream'] },
      { char: '😴', name: 'sleeping face', keywords: ['sleep', 'tired', 'zzz'] },
      { char: '🤔', name: 'thinking face', keywords: ['think', 'hmmm', 'ponder'] },
      { char: '🤫', name: 'shushing face', keywords: ['quiet', 'shh', 'silent'] },
      { char: '🤭', name: 'face with hand over mouth', keywords: ['gasp', 'oops', 'secret'] },
      { char: '👍', name: 'thumbs up', keywords: ['yes', 'agree', 'good', 'ok'] },
      { char: '👎', name: 'thumbs down', keywords: ['no', 'disagree', 'bad'] },
      { char: '👊', name: 'oncoming fist', keywords: ['fist', 'fight', 'power'] },
      { char: '✌️', name: 'victory hand', keywords: ['peace', 'two', 'win'] },
      { char: '👌', name: 'OK hand', keywords: ['ok', 'agree', 'perfect'] },
      { char: '🤝', name: 'handshake', keywords: ['deal', 'partnership', 'agree'] },
      { char: '🙏', name: 'folded hands', keywords: ['please', 'thank you', 'pray', 'hope'] },
      { char: '👏', name: 'clapping hands', keywords: ['applause', 'bravo', 'congrats'] },
      { char: '🙌', name: 'raising hands', keywords: ['celebrate', 'praise', 'yay'] },
      { char: '💪', name: 'flexed biceps', keywords: ['strong', 'fitness', 'power'] },
      { char: '✨', name: 'sparkles', keywords: ['shine', 'pretty', 'magic', 'clean'] },
      { char: '🔥', name: 'fire', keywords: ['lit', 'hot', 'cool', 'awesome'] },
      { char: '❤️', name: 'red heart', keywords: ['love', 'like', 'heart'] },
      { char: '💖', name: 'sparkling heart', keywords: ['love', 'heart', 'pretty'] },
      { char: '🎉', name: 'party popper', keywords: ['celebrate', 'party', 'congrats'] },
      { char: '💡', name: 'light bulb', keywords: ['idea', 'creative', 'smart'] },
      { char: '🚀', name: 'rocket', keywords: ['growth', 'space', 'launch', 'fast'] },
      { char: '📱', name: 'mobile phone', keywords: ['phone', 'tech', 'device'] },
      { char: '💻', name: 'laptop', keywords: ['code', 'computer', 'work', 'tech'] },
      { char: '💸', name: 'money with wings', keywords: ['rich', 'spend', 'profit'] },
    ]
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: '🌿',
    emojis: [
      { char: '🐶', name: 'dog face', keywords: ['dog', 'puppy', 'pet'] },
      { char: '🐱', name: 'cat face', keywords: ['cat', 'kitten', 'pet'] },
      { char: '🦁', name: 'lion', keywords: ['lion', 'king', 'wild'] },
      { char: '🐯', name: 'tiger face', keywords: ['tiger', 'wild'] },
      { char: '🦊', name: 'fox', keywords: ['fox', 'smart'] },
      { char: '🐻', name: 'bear', keywords: ['bear', 'wild'] },
      { char: '🐨', name: 'koala', keywords: ['koala', 'cute'] },
      { char: '🦅', name: 'eagle', keywords: ['bird', 'eagle', 'fly'] },
      { char: '🦉', name: 'owl', keywords: ['bird', 'owl', 'smart'] },
      { char: '🦖', name: 't-rex', keywords: ['dinosaur', 'dino', 'rawr'] },
      { char: '🦈', name: 'shark', keywords: ['fish', 'ocean', 'shark'] },
      { char: '🐬', name: 'dolphin', keywords: ['fish', 'ocean', 'dolphin'] },
      { char: '🦋', name: 'butterfly', keywords: ['insect', 'bug', 'pretty'] },
      { char: '🐌', name: 'snail', keywords: ['insect', 'bug', 'slow'] },
      { char: '🐝', name: 'honeybee', keywords: ['bug', 'honey', 'bee'] },
      { char: '🌵', name: 'cactus', keywords: ['desert', 'plant'] },
      { char: '🌲', name: 'evergreen tree', keywords: ['forest', 'plant'] },
      { char: '🌴', name: 'palm tree', keywords: ['tropical', 'beach', 'plant'] },
      { char: ' Maple', name: 'maple leaf', keywords: ['leaf', 'fall', 'plant'] },
      { char: '🍁', name: 'maple leaf', keywords: ['leaf', 'autumn', 'canada'] },
      { char: '🌹', name: 'rose', keywords: ['flower', 'love', 'red'] },
      { char: '🌸', name: 'cherry blossom', keywords: ['flower', 'pretty', 'spring'] },
      { char: '🌻', name: 'sunflower', keywords: ['flower', 'yellow', 'sun'] },
      { char: '☘️', name: 'shamrock', keywords: ['lucky', 'green', 'shamrock'] },
      { char: '🍀', name: 'four leaf clover', keywords: ['lucky', 'green'] },
      { char: '🍄', name: 'mushroom', keywords: ['fungus', 'mario'] },
      { char: '🌞', name: 'sun with face', keywords: ['sun', 'summer', 'happy'] },
      { char: '🌙', name: 'crescent moon', keywords: ['moon', 'night', 'sleep'] },
      { char: '🪐', name: 'ringed planet', keywords: ['space', 'planet', 'saturn'] },
      { char: '⭐', name: 'star', keywords: ['yellow', 'star', 'like'] },
      { char: '🌈', name: 'rainbow', keywords: ['rainbow', 'color', 'happy'] },
      { char: '⚡', name: 'high voltage', keywords: ['lightning', 'bolt', 'shock'] },
      { char: '❄️', name: 'snowflake', keywords: ['winter', 'cold', 'snow'] },
    ]
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: '🍕',
    emojis: [
      { char: '🍎', name: 'red apple', keywords: ['apple', 'fruit', 'healthy'] },
      { char: '🍌', name: 'banana', keywords: ['banana', 'fruit', 'yellow'] },
      { char: '🍉', name: 'watermelon', keywords: ['melon', 'fruit', 'summer'] },
      { char: '🍓', name: 'strawberry', keywords: ['berry', 'fruit', 'sweet'] },
      { char: '🍒', name: 'cherries', keywords: ['cherries', 'fruit', 'sweet'] },
      { char: '🥑', name: 'avocado', keywords: ['guac', 'healthy', 'fruit'] },
      { char: '🥦', name: 'broccoli', keywords: ['vegetable', 'healthy', 'green'] },
      { char: '🌶️', name: 'hot pepper', keywords: ['chili', 'spicy', 'hot'] },
      { char: '🥐', name: 'croissant', keywords: ['bread', 'pastry', 'french'] },
      { char: '🍔', name: 'hamburger', keywords: ['burger', 'beef', 'fastfood'] },
      { char: '🍟', name: 'french fries', keywords: ['fries', 'potato', 'fastfood'] },
      { char: '🍕', name: 'pizza', keywords: ['pizza', 'cheese', 'party'] },
      { char: '🌭', name: 'hot dog', keywords: ['hotdog', 'fastfood'] },
      { char: '🌮', name: 'taco', keywords: ['taco', 'mexican'] },
      { char: '🍣', name: 'sushi', keywords: ['sushi', 'rice', 'japanese'] },
      { char: '🍜', name: 'steaming bowl', keywords: ['ramen', 'soup', 'noodles'] },
      { char: '🍰', name: 'shortcake', keywords: ['cake', 'dessert', 'sweet'] },
      { char: '🍩', name: 'donut', keywords: ['donut', 'sweet', 'pastry'] },
      { char: '🍪', name: 'cookie', keywords: ['cookie', 'sweet', 'chocolate'] },
      { char: '🍫', name: 'chocolate bar', keywords: ['chocolate', 'sweet'] },
      { char: '🍿', name: 'popcorn', keywords: ['movie', 'snack'] },
      { char: '🍯', name: 'honey pot', keywords: ['honey', 'sweet'] },
      { char: '☕', name: 'hot beverage', keywords: ['coffee', 'caffeine', 'tea', 'morning'] },
      { char: '🍵', name: 'teacup without handle', keywords: ['matcha', 'tea', 'green'] },
      { char: '🍺', name: 'beer mug', keywords: ['beer', 'drink', 'party'] },
      { char: '🍻', name: 'clinking beer mugs', keywords: ['beer', 'drink', 'cheers'] },
      { char: '🍷', name: 'wine glass', keywords: ['wine', 'drink', 'fancy'] },
      { char: '🍹', name: 'tropical drink', keywords: ['cocktail', 'drink', 'beach'] },
      { char: '🥤', name: 'cup with straw', keywords: ['soda', 'drink'] },
      { char: '🧋', name: 'bubble tea', keywords: ['boba', 'sweet', 'tea'] },
    ]
  },
  {
    id: 'activities',
    name: 'Activities & Sports',
    icon: '⚽',
    emojis: [
      { char: '⚽', name: 'soccer ball', keywords: ['sports', 'soccer', 'football'] },
      { char: '🏀', name: 'basketball', keywords: ['sports', 'basketball'] },
      { char: '🏈', name: 'american football', keywords: ['sports', 'football'] },
      { char: '⚾', name: 'baseball', keywords: ['sports', 'baseball'] },
      { char: '🎾', name: 'tennis', keywords: ['sports', 'tennis'] },
      { char: '🥊', name: 'boxing glove', keywords: ['sports', 'fight'] },
      { char: '🏆', name: 'trophy', keywords: ['win', 'award', 'champion'] },
      { char: '🏅', name: 'sports medal', keywords: ['win', 'award', 'medal'] },
      { char: '🎮', name: 'video game', keywords: ['gaming', 'play', 'console'] },
      { char: '🎯', name: 'direct hit', keywords: ['target', 'dart', 'focus', 'goal'] },
      { char: '🎨', name: 'artist palette', keywords: ['art', 'paint', 'creativity'] },
      { char: '🎬', name: 'clapper board', keywords: ['movie', 'film', 'hollywood'] },
      { char: '🎤', name: 'microphone', keywords: ['sing', 'music', 'podcast'] },
      { char: '🎧', name: 'headphone', keywords: ['music', 'audio', 'listen'] },
      { char: '🎸', name: 'guitar', keywords: ['music', 'instrument'] },
      { char: '🎹', name: 'musical keyboard', keywords: ['music', 'piano'] },
      { char: '🧱', name: 'brick', keywords: ['build', 'construct'] },
      { char: '💎', name: 'gem stone', keywords: ['diamond', 'wealth', 'luxury'] },
    ]
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: '✈️',
    emojis: [
      { char: '✈️', name: 'airplane', keywords: ['travel', 'flight', 'plane'] },
      { char: '🚗', name: 'automobile', keywords: ['travel', 'car', 'drive'] },
      { char: '🚲', name: 'bicycle', keywords: ['travel', 'bike', 'ride'] },
      { char: '🚀', name: 'rocket', keywords: ['space', 'launch', 'nebula'] },
      { char: '🛸', name: 'flying saucer', keywords: ['space', 'alien', 'ufo'] },
      { char: '🏝️', name: 'desert island', keywords: ['beach', 'tropical', 'vacation'] },
      { char: '⛰️', name: 'mountain', keywords: ['climb', 'hiking', 'nature'] },
      { char: '🌋', name: 'volcano', keywords: ['lava', 'eruption', 'hot'] },
      { char: '🏕️', name: 'camping', keywords: ['outdoors', 'tent', 'nature'] },
      { char: '🗼', name: 'tokyo tower', keywords: ['landmark', 'paris', 'tokyo'] },
      { char: '🗽', name: 'statue of liberty', keywords: ['landmark', 'usa', 'nyc'] },
      { char: '🏰', name: 'castle', keywords: ['disney', 'fairytale', 'magic'] },
      { char: '🕋', name: 'kaaba', keywords: ['islam', 'mecca', 'religion'] },
      { char: '⛲', name: 'fountain', keywords: ['park', 'water'] },
      { char: '🎡', name: 'ferris wheel', keywords: ['carnival', 'ride', 'amusement'] },
      { char: '✈', name: 'airplane icon', keywords: ['travel'] },
      { char: '🌅', name: 'sunrise', keywords: ['morning', 'sun', 'sky'] },
      { char: '🌇', name: 'sunset', keywords: ['evening', 'sun', 'sky'] },
      { char: '🌃', name: 'night with stars', keywords: ['night', 'city', 'stars'] },
      { char: '🗺️', name: 'world map', keywords: ['travel', 'explore', 'geography'] },
    ]
  },
  {
    id: 'tech',
    name: 'Tech & Symbols',
    icon: '⌨️',
    emojis: [
      { char: '💻', name: 'laptop computer', keywords: ['code', 'tech', 'work'] },
      { char: '🖥️', name: 'desktop computer', keywords: ['tech', 'screen'] },
      { char: '⌨️', name: 'keyboard', keywords: ['tech', 'typing'] },
      { char: '💾', name: 'floppy disk', keywords: ['save', 'tech', 'retro'] },
      { char: '📷', name: 'camera', keywords: ['photo', 'shoot', 'lens'] },
      { char: '🎥', name: 'movie camera', keywords: ['video', 'film', 'recording'] },
      { char: '📡', name: 'satellite antenna', keywords: ['signals', 'space', 'radar'] },
      { char: '🔋', name: 'battery', keywords: ['charge', 'power'] },
      { char: '🔌', name: 'electric plug', keywords: ['charge', 'power', 'plug'] },
      { char: '⚙️', name: 'gear', keywords: ['settings', 'wrench', 'process'] },
      { char: '🛠️', name: 'hammer and wrench', keywords: ['fix', 'build', 'tools'] },
      { char: '🧪', name: 'test tube', keywords: ['science', 'lab', 'chemistry'] },
      { char: '🔬', name: 'microscope', keywords: ['science', 'lab', 'biology'] },
      { char: '🩺', name: 'stethoscope', keywords: ['health', 'doctor', 'medicine'] },
      { char: '📈', name: 'chart increasing', keywords: ['forx', 'stock', 'growth'] },
      { char: '📉', name: 'chart decreasing', keywords: ['forex', 'loss', 'down'] },
      { char: '💵', name: 'dollar banknote', keywords: ['cash', 'money', 'rich'] },
      { char: '🪙', name: 'coin', keywords: ['coin', 'gold', 'supreme'] },
      { char: '💳', name: 'credit card', keywords: ['money', 'payment', 'card'] },
      { char: '🔒', name: 'locked', keywords: ['security', 'safe', 'private'] },
      { char: '🔔', name: 'bell', keywords: ['alert', 'notification'] },
      { char: '📣', name: 'megaphone', keywords: ['announce', 'shout', 'news'] },
    ]
  }
];

// Combine old inline emojis
const OLD_ALL_EMOJIS_LIST = OLD_EMOJI_CATEGORIES.flatMap(cat => cat.emojis);

// Pre-defined Stock Premium Visual Assets (Stock Images)
const STOCK_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', name: 'Space Cyberpunk' },
  { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop', name: 'Code Terminal' },
  { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop', name: 'Abstract Liquid' },
  { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop', name: 'Premium Microchip' },
  { url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop', name: 'Technological Glow' },
  { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop', name: 'Forex Analytics' },
];

export default function WysiwygEditor({ value, onChange, placeholder }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);
  
  // Emoji Picker States
  const [emojiSearch, setEmojiSearch] = useState('');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('smileys');
  
  // Image Panel States
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedImageAlignment, setSelectedImageAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [selectedImageWidth, setSelectedImageWidth] = useState<'50%' | '75%' | '100%'>('100%');
  
  // Formatting Configuration
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [selectedSize, setSelectedSize] = useState('16px');
  const [selectedColor, setSelectedColor] = useState('#111827');
  
  const [toolbarConfig, setToolbarConfig] = useState({
    fontFamily: true,
    fontSize: true,
    fontColor: true,
    bold: true,
    italic: true,
    underline: true,
    align: true,
    list: true,
    link: true,
    image: true,
    emoji: true,
  });

  // Sync state to DOM comfortably
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Synchronise cursor typing changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Run native command safely
  const runCommand = (command: string, value: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    // Enable css styling representation to ensure rich fonts and custom inline styling properties map well
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    handleInput();
  };

  const toggleToolbarOption = (option: keyof typeof toolbarConfig) => {
    setToolbarConfig(prev => ({ ...prev, [option]: !prev[option] }));
  };

  // Typography Actions
  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    runCommand('fontName', font);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    // Custom wrapper to set specific font size securely
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      // Just set color styling using standard browser commands
      runCommand('fontSize', '4');
      return;
    }
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = size;
    
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
      handleInput();
    } catch {
      runCommand('fontSize', '4');
    }
  };

  const handleColorChange = (hexColor: string) => {
    setSelectedColor(hexColor);
    runCommand('foreColor', hexColor);
  };

  // Emoji Action
  const insertEmoji = (char: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    // Insert at selection cursor
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const emojiNode = document.createTextNode(char);
      range.insertNode(emojiNode);
      
      // Move cursor to after emoji
      range.setStartAfter(emojiNode);
      range.setEndAfter(emojiNode);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current.innerHTML += char;
    }
    
    handleInput();
  };

  // Image Upload Action (converts to Base64)
  const handleLocalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        insertImageHTML(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
    setShowImagePanel(false);
  };

  const insertImageHTML = (url: string, altText: string = 'Article image') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    let alignmentClass = 'mx-auto block';
    if (selectedImageAlignment === 'left') alignmentClass = 'float-left mr-4';
    if (selectedImageAlignment === 'right') alignmentClass = 'float-right ml-4';

    const imgStyle = `width: ${selectedImageWidth}; border-radius: 1rem; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 1rem; margin-bottom: 1rem; transition: transform 0.3s; cursor: pointer; display: block;`;
    const imageTag = `<img src="${url}" alt="${altText}" class="${alignmentClass} post-image group" style="${imgStyle}" referrerPolicy="no-referrer" />`;

    // Standard insert HTML command
    document.execCommand('insertHTML', false, imageTag);
    handleInput();
  };

  // Perform Emoji Filtering in real-time
  const filteredEmojis = emojiSearch.trim()
    ? ALL_EMOJIS_LIST.filter(emoji => 
        emoji.name.toLowerCase().includes(emojiSearch.toLowerCase()) || 
        emoji.keywords.some(tag => tag.toLowerCase().includes(emojiSearch.toLowerCase()))
      )
    : EMOJI_CATEGORIES.find(cat => cat.id === activeEmojiCategory)?.emojis || [];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white flex flex-col shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-supreme-gold)]/20 focus-within:border-[var(--color-supreme-gold)] transition-all">
      {/* Dynamic WYSIWYG Editor Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5 w-full">
          
          {/* Font Type Selection */}
          {toolbarConfig.fontFamily && (
            <div className="relative group/font">
              <select
                value={selectedFont}
                onChange={(e) => handleFontChange(e.target.value)}
                className="h-9 px-2.5 pr-8 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-xs hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)] cursor-pointer appearance-none"
                style={{ fontFamily: selectedFont === 'Default' ? 'Inter' : selectedFont }}
              >
                <option value="Inter">Inter (Sans)</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Georgia">Georgia</option>
                <option value="Comic Sans MS">Comic Sans Playful</option>
                <option value="Impact">Impact Bold</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Font Size Selector */}
          {toolbarConfig.fontSize && (
            <div className="relative">
              <select
                value={selectedSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="h-9 px-2.5 pr-8 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-xs hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-supreme-gold)] cursor-pointer appearance-none"
              >
                <option value="12px">12px (Small)</option>
                <option value="14px">14px</option>
                <option value="16px">16px (Normal)</option>
                <option value="18px">18px (Medium)</option>
                <option value="20px">20px (Heading S)</option>
                <option value="24px">24px (Heading M)</option>
                <option value="32px">32px (Heading L)</option>
                <option value="40px">40px (Hero XL)</option>
                <option value="48px">48px (Giant)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Expanded Font Text Color Tool */}
          {toolbarConfig.fontColor && (
            <div className="relative flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 h-9 shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Color</span>
              
              {/* Preselected gorgeous palette swatches */}
              <div className="flex items-center gap-1">
                {['#111827', '#eab308', '#dc2626', '#10b981', '#3b82f6', '#8b5cf6'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={clsx(
                      "w-4.5 h-4.5 rounded-full border border-black/10 transition-transform hover:scale-120 flex items-center justify-center",
                      selectedColor === color && "ring-1 ring-offset-1 ring-[var(--color-supreme-gold)]"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {selectedColor === color && <Check className="w-2.5 h-2.5 text-white mix-blend-difference" />}
                  </button>
                ))}
              </div>

              {/* Advanced Custom Color Picker Input */}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <label className="relative cursor-pointer hover:opacity-80 flex items-center" title="Custom Swatch">
                <Palette className="w-3.5 h-3.5 text-gray-500" />
                <input 
                  type="color" 
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="absolute opacity-0 w-5 h-5 cursor-pointer -translate-x-1" 
                />
              </label>
            </div>
          )}

          <div className="h-6 w-px bg-gray-200 my-1 hidden md:block" />

          {/* Bold, Italic, Underline responsiveness built robustly */}
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 shadow-xs">
            {toolbarConfig.bold && (
              <button 
                onClick={() => runCommand('bold')}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4 font-black" />
              </button>
            )}
            {toolbarConfig.italic && (
              <button 
                onClick={() => runCommand('italic')}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
            )}
            {toolbarConfig.underline && (
              <button 
                onClick={() => runCommand('underline')}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Align and Structuring Options */}
          {toolbarConfig.align && (
            <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 shadow-xs">
              <button onClick={() => runCommand('justifyLeft')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Align Left">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button onClick={() => runCommand('justifyCenter')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Align Center">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button onClick={() => runCommand('justifyRight')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Align Right">
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {toolbarConfig.list && (
            <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 shadow-xs">
              <button onClick={() => runCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Bullet List">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => runCommand('insertOrderedList')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Image & Emoji Special Overlays */}
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-0.5 shadow-xs relative">
            {toolbarConfig.image && (
              <button 
                onClick={() => { setShowImagePanel(!showImagePanel); setShowEmojiPicker(false); }}
                className={clsx("p-1.5 rounded transition-colors", showImagePanel ? "bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)]" : "hover:bg-gray-100 text-gray-600")} 
                title="Insert Enhanced Media"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            )}
            
            {toolbarConfig.emoji && (
              <button 
                onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowImagePanel(false); }}
                className={clsx("p-1.5 rounded transition-all", showEmojiPicker ? "bg-amber-100 text-amber-700" : "hover:bg-gray-100 text-gray-600")} 
                title="Aura Emojis"
              >
                <Smile className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Settings Menu */}
        <div className="relative w-full sm:w-auto flex justify-end">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
            title="Toolbar Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-3"
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Custom Controls</div>
                <div className="space-y-1">
                  {Object.entries(toolbarConfig).map(([key, isEnabled]) => (
                    <label key={key} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-xl cursor-pointer">
                      <span className="text-xs font-semibold text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={isEnabled}
                        onChange={() => toggleToolbarOption(key as keyof typeof toolbarConfig)}
                        className="rounded text-[var(--color-supreme-gold)] focus:ring-[var(--color-supreme-gold)] h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Overlays */}
      <AnimatePresence>
        {/* ENHANCED IMAGE UPLOADER PANEL */}
        {showImagePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 border-b border-gray-200 p-4 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[var(--color-supreme-gold)]" /> Insert Professional Visual Art
              </span>
              <button onClick={() => setShowImagePanel(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout parameters for Image insertion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Local File uploader */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-center items-center text-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-700 mb-1">Upload Local Image</span>
                <p className="text-[10px] text-gray-400 mb-3">Supports JPG, PNG, WEBP</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleLocalImageSelect} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[var(--color-supreme-gold)]/10 text-[var(--color-supreme-gold)] hover:bg-[var(--color-supreme-gold)]/20 transition-all text-[11px] font-bold rounded-lg"
                >
                  Choose File
                </button>
              </div>

              {/* URL insertion */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700 block mb-1">Image Web URL</span>
                  <input 
                    type="url" 
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[var(--color-supreme-gold)]"
                  />
                </div>
                <button
                  type="button"
                  disabled={!imageUrlInput.startsWith('http')}
                  onClick={() => {
                    insertImageHTML(imageUrlInput, 'Article Image Link');
                    setImageUrlInput('');
                    setShowImagePanel(false);
                  }}
                  className="w-full mt-3 py-1.5 bg-gray-900 text-white font-bold text-[11px] rounded-lg disabled:opacity-50 transition-colors"
                >
                  Embed URL Link
                </button>
              </div>

              {/* Adjust Layout Options */}
              <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-xs flex flex-col gap-3">
                <div>
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">Default Sizing</span>
                  <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-lg">
                    {['50%', '75%', '100%'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedImageWidth(size as any)}
                        className={clsx(
                          "py-1 text-[10px] font-bold rounded",
                          selectedImageWidth === size ? "bg-white shadow-xs text-gray-900" : "text-gray-500"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">Initial Alignment</span>
                  <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-lg">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setSelectedImageAlignment(align as any)}
                        className={clsx(
                          "py-1 text-[10px] font-bold rounded capitalizeName",
                          selectedImageAlignment === align ? "bg-white shadow-xs text-gray-900" : "text-gray-500"
                        )}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Stock presets search */}
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-500 block mb-2 uppercase tracking-wide">Supreme Royalty-Free Stock Presets</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {STOCK_PRESETS.map((stock) => (
                  <button
                    key={stock.name}
                    type="button"
                    onClick={() => {
                      insertImageHTML(stock.url, stock.name);
                      setShowImagePanel(false);
                    }}
                    className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img src={stock.url} alt={stock.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center px-1 text-[8px] font-bold text-white overflow-hidden text-ellipsis whitespace-nowrap">
                      {stock.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* EMOJI KEYBOARD & SEARCH TOOL UNLOCKED */}
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-200 z-50 flex flex-col p-4 shadow-inner"
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pb-2 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-gray-800">Choose Aura Emoji</span>
              </div>
              
              {/* Online search bar filter */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input 
                  type="text"
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  placeholder="Online search up to 1000 emojis..."
                  className="w-full pl-8 pr-7 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
                {emojiSearch && (
                  <button onClick={() => setEmojiSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Category tabs */}
            {!emojiSearch && (
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none mb-3 border-b border-gray-100">
                {EMOJI_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveEmojiCategory(cat.id)}
                    className={clsx(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0",
                      activeEmojiCategory === cat.id 
                        ? "bg-amber-100 text-amber-700" 
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Emojis Display Grid */}
            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
              {filteredEmojis.length > 0 ? (
                filteredEmojis.map((emoji) => (
                  <button
                    key={emoji.char}
                    onClick={() => insertEmoji(emoji.char)}
                    className="aspect-square bg-gray-50 hover:bg-amber-150 border border-gray-100 hover:border-amber-300 rounded-lg text-2xl flex items-center justify-center transition-all hover:scale-115 active:scale-95 group relative"
                    title={emoji.name}
                  >
                    {emoji.char}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-900 text-[8px] font-bold text-white px-1.5 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1 z-55 capitalize">
                      {emoji.name}
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-xs font-bold text-gray-400">
                  No matching emoji characters found under search keywords.
                </div>
              )}
            </div>
            
            <div className="text-[9px] text-gray-400 text-right mt-2 flex items-center justify-end gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Search indexing: 1000+ Rich Emojis loaded online
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synchronized ContentEditable Rich Text Element */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder || "Start writing your masterpiece with formatted style..."}
        className="w-full min-h-[280px] p-6 focus:outline-none resize-y text-gray-800 bg-white leading-relaxed text-base overflow-y-auto outline-hidden custom-editor"
        style={{ fontFamily: selectedFont === 'Default' ? 'Inter' : selectedFont }}
      />

      {/* Editor CSS styling and placeholder layout definitions */}
      <style>{`
        .custom-editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
          display: block;
        }
        .custom-editor img {
          max-width: 100%;
          cursor: pointer;
        }
        .custom-editor img:hover {
          outline: 3px solid var(--color-supreme-gold);
        }
      `}</style>
    </div>
  );
}
