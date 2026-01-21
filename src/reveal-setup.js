import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';

// Initialize Reveal.js with default options
// You can customize these options per presentation by passing them from the HTML
const deck = new Reveal({
  plugins: [Markdown],
  // Add your preferred default config here
  hash: true,
  transition: 'slide',
});

deck.initialize();
