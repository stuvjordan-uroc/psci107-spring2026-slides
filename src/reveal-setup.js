import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import RevealMath from 'reveal.js/plugin/math/math.esm.js';

// Initialize Reveal.js with default options
// You can customize these options per presentation by passing them from the HTML
const deck = new Reveal({
  plugins: [Markdown, RevealMath.KaTeX],
  // Add your preferred default config here
  hash: true,
  transition: 'slide',
});

deck.initialize();
