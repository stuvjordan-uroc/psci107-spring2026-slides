# Pattern: Animated Spatial Diagrams with reveal.js Fragments

## Overview

This project uses a combination of `spatial-diagram.ts` and reveal.js fragment classes to create spatial diagrams that appear to change dynamically as users advance through slides. Multiple static diagrams are layered using absolute positioning and reveal.js fragments control their visibility, creating the illusion of a single evolving diagram.

## Required Reading

**IMPORTANT**: Before implementing this pattern, read the official reveal.js fragments documentation:
https://revealjs.com/fragments/

Pay special attention to:

- Fragment animation classes (`fade-in`, `fade-out`, `fade-in-then-out`, etc.)
- `data-fragment-index` for controlling order
- How the `visible` class is applied

## The Pattern

### 1. Create a Positioning Container

Create a container with `position: relative` to serve as the positioning context:

```html
<div class="handwritten" style="position: relative;">
  <!-- Diagrams will be layered here -->
</div>
```

### 2. Layer Multiple Diagrams

Create multiple `<div>` elements within the container, each with:

- A unique `id` for the diagram
- Fragment classes to control visibility
- Absolute positioning (except the first one)
- `data-fragment-index` to control timing

```html
<div class="handwritten" style="position: relative;">
  <!-- First diagram: appears then disappears -->
  <div
    id="diagram-0"
    class="fragment fade-in-then-out"
    data-fragment-index="1"
  ></div>

  <!-- Second diagram: appears in same location -->
  <div
    id="diagram-1"
    class="fragment"
    data-fragment-index="2"
    style="position: absolute; top: 0; left: 0;"
  ></div>

  <!-- Third diagram (if needed) -->
  <div
    id="diagram-2"
    class="fragment"
    data-fragment-index="3"
    style="position: absolute; top: 0; left: 0;"
  ></div>
</div>
```

### 3. Generate Diagrams with JavaScript

Use a `<script type="module">` block to populate each diagram div:

```html
<script type="module">
  import { createSpatialDiagram } from "/src/spatial-diagram.ts";

  // First diagram - only persons
  document.getElementById("diagram-0").innerHTML = createSpatialDiagram({
    width: 900,
    height: 150,
    id: "spatial-0",
    marginX: 40,
    marginY: 10,
    fontSize: 25,
    persons: [
      { position: 0.1, label: "K" },
      { position: 0.5, label: "L" },
    ],
  });

  // Second diagram - persons + policies
  document.getElementById("diagram-1").innerHTML = createSpatialDiagram({
    width: 900,
    height: 150,
    id: "spatial-1",
    marginX: 40,
    marginY: 10,
    fontSize: 25,
    policies: [
      { position: 0.3, label: "X" },
      { position: 0.7, label: "Y" },
    ],
    persons: [
      { position: 0.1, label: "K" },
      { position: 0.5, label: "L" },
    ],
  });
</script>
```

### 4. Optional: Add SVG Overlays

You can also add SVG elements as fragments to annotate diagrams:

```html
<svg
  class="fragment"
  data-fragment-index="4"
  style="position: absolute; top: 0; left: 0; width: 900px; height: 150px; pointer-events: none;"
>
  <line
    x1="450"
    y1="20"
    x2="450"
    y2="130"
    stroke="red"
    stroke-width="4"
    stroke-dasharray="5,5"
  />
</svg>
```

## Complete Working Example

From [0129-single-peaked-prefs.html](../presentations/0129-single-peaked-prefs.html) lines 240-333:

```html
<div class="handwritten" style="position: relative;">
  <div
    id="midpoint-rule-0"
    class="fragment fade-in-then-out"
    data-fragment-index="1"
  ></div>
  <div
    id="midpoint-rule-1"
    class="fragment"
    data-fragment-index="2"
    style="position: absolute; top: 0; left: 0;"
  ></div>
  <svg
    class="fragment"
    data-fragment-index="6"
    style="position: absolute; top: 0; left: 0; width: 900px; height: 150px; pointer-events: none;"
  >
    <line
      x1="507.4"
      y1="20"
      x2="507.4"
      y2="130"
      stroke="red"
      stroke-width="4"
      stroke-dasharray="5,5"
    />
  </svg>
</div>

<script type="module">
  import { createSpatialDiagram } from "/src/spatial-diagram.ts";

  document.getElementById("midpoint-rule-0").innerHTML = createSpatialDiagram({
    width: 900,
    height: 150,
    id: "mpr-0",
    marginX: 40,
    marginY: 10,
    fontSize: 25,
    persons: [
      { position: 0.1, label: "K" },
      { position: 0.23, label: "L" },
      { position: 0.4, label: "M" },
      { position: 0.52, label: "N" },
      { position: 0.6, label: "O" },
      { position: 0.71, label: "P" },
      { position: 0.81, label: "Q" },
      { position: 0.95, label: "R" },
      { position: 0.99, label: "S" },
    ],
  });

  document.getElementById("midpoint-rule-1").innerHTML = createSpatialDiagram({
    width: 900,
    height: 150,
    id: "mpr-0",
    marginX: 40,
    marginY: 10,
    fontSize: 25,
    policies: [
      { position: 0.44, label: "X" },
      { position: 0.7, label: "Y" },
    ],
    persons: [
      { position: 0.1, label: "K" },
      { position: 0.23, label: "L" },
      { position: 0.4, label: "M" },
      { position: 0.52, label: "N" },
      { position: 0.6, label: "O" },
      { position: 0.71, label: "P" },
      { position: 0.81, label: "Q" },
      { position: 0.95, label: "R" },
      { position: 0.99, label: "S" },
    ],
  });
</script>
```

## How It Works

1. **Fragment index 1**: First diagram (`diagram-0`) fades in showing only persons
2. **Fragment index 2**: First diagram fades out while second diagram (`diagram-1`) fades in at the exact same position, now showing persons + policies
3. Because of `position: absolute; top: 0; left: 0;` on the second diagram, it overlays perfectly on the first
4. The user perceives a single diagram where policies "appear"

## Key Points for AI Agents

- **Always use `position: relative`** on the parent container
- **First diagram** typically doesn't need absolute positioning
- **Subsequent diagrams** need `position: absolute; top: 0; left: 0;`
- **Use `fade-in-then-out`** for diagrams that should disappear
- **Use plain `fragment`** (defaults to fade-in) for diagrams that should remain visible
- **Match dimensions** exactly across all diagram versions (width, height, margins)
- **Keep persons/policies at same positions** when they appear in multiple diagrams to maintain continuity
- **Increment `data-fragment-index`** to control the sequence
- Each diagram needs a **unique element `id`** for JavaScript to target
- Each call to `createSpatialDiagram` should use a **unique `id` parameter** (though in practice the example above reuses 'mpr-0', which works but isn't ideal)

## Common Use Cases

1. **Adding elements**: First diagram shows baseline, second adds new persons/policies
2. **Moving elements**: Diagrams with same elements at different positions (less common)
3. **Highlighting**: Add SVG overlays to draw attention to specific areas
4. **Sequential revelation**: Build up complex diagrams step by step

## spatial-diagram.ts API Reference

See [/src/spatial-diagram.ts](../src/spatial-diagram.ts) for the full TypeScript source.

Key properties:

- `width`, `height`: SVG dimensions in pixels
- `id`: Unique identifier for the diagram
- `marginX`, `marginY`: Spacing from edges
- `fontSize`: Label font size in pixels
- `persons`: Array of `{ position: 0-1, label: string, asLaTeX?: boolean }`
- `policies`: Array of `{ position: 0-1, label: string, asLaTeX?: boolean }`
- `spaceLabel`: Optional label below the diagram
- `LabelDirection`: Optional "left" or "right" arrow under space label
