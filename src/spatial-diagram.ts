import katex from 'katex';

interface Person {
  position: number;
  label: string;
  asLaTeX?: boolean;
}

interface Policy {
  position: number;
  label: string;
  asLaTeX?: boolean;
}

interface SpatialDiagramProps {
  width: number;
  height: number;
  id: string;
  marginX: number;
  marginY: number;
  fontSize?: number; // in pixels, defaults to 16
  persons?: Array<Person>;
  policies?: Array<Policy>;
  spaceLabel?: { label: string; asLaTeX?: boolean };
  LabelDirection?: "left" | "right"
}

/**
 * Measure the rendered size of text (LaTeX or plain HTML)
 */
function measureLabel(label: string, fontSize: number, asLaTeX: boolean): { width: number; height: number } {
  const html = asLaTeX
    ? katex.renderToString(label, { throwOnError: false, displayMode: false })
    : label;
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.fontSize = `${fontSize}px`;
  tempDiv.innerHTML = html;
  document.body.appendChild(tempDiv);
  const rect = tempDiv.getBoundingClientRect();
  document.body.removeChild(tempDiv);
  return { width: rect.width, height: rect.height };
}

/**
 * Create an SVG arrow (triangle) pointing up or down
 */
function createArrow(x: number, y: number, direction: 'up' | 'down'): string {
  const size = 6;
  if (direction === 'up') {
    return `<path d="M ${x},${y} L ${x - size},${y + size} L ${x + size},${y + size} Z" fill="currentColor"/>`;
  } else {
    return `<path d="M ${x},${y} L ${x - size},${y - size} L ${x + size},${y - size} Z" fill="currentColor"/>`;
  }
}

/**
 * Create a spatial diagram showing persons and policies on a one-dimensional space
 */
export function createSpatialDiagram(props: SpatialDiagramProps): string {
  const {
    width,
    height,
    id,
    marginX,
    marginY,
    fontSize = 16,
    persons = [],
    policies = [],
    spaceLabel,
    LabelDirection
  } = props;

  const lineY = height / 2;
  const lineStartX = marginX;
  const lineEndX = width - marginX;
  const lineLength = lineEndX - lineStartX;

  let svgContent = `<svg id="${id}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`;

  // Draw the horizontal line
  svgContent += `<line x1="${lineStartX}" y1="${lineY}" x2="${lineEndX}" y2="${lineY}" stroke="currentColor" stroke-width="2"/>`;

  // Draw policy arrows and labels (above the line)
  for (const policy of policies) {
    const x = lineStartX + policy.position * lineLength;
    const useLaTeX = policy.asLaTeX ?? false;
    const labelDims = measureLabel(policy.label, fontSize, useLaTeX);
    const labelX = x - labelDims.width / 2;
    const arrowTopY = marginY + labelDims.height + 5;
    const arrowHeight = lineY - arrowTopY;

    if (arrowHeight > 0) {
      // Draw arrow line
      svgContent += `<line x1="${x}" y1="${arrowTopY}" x2="${x}" y2="${lineY}" stroke="currentColor" stroke-width="1"/>`;
      // Draw arrow head pointing down
      svgContent += createArrow(x, lineY, 'down');
    }

    // Draw label
    const labelHtml = useLaTeX
      ? katex.renderToString(policy.label, { throwOnError: false, displayMode: false })
      : policy.label;
    const labelY = marginY;
    svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${policy.label}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: center;">${labelHtml}</div>
    </foreignObject>`;
  }

  // Draw person arrows and labels (below the line)
  let maxPersonLabelBottom = lineY;
  for (const person of persons) {
    const x = lineStartX + person.position * lineLength;
    const useLaTeX = person.asLaTeX ?? false;
    const labelDims = measureLabel(person.label, fontSize, useLaTeX);
    const labelY = height - marginY - labelDims.height;
    const arrowBottomY = labelY - 5;
    const arrowHeight = arrowBottomY - lineY;

    if (arrowHeight > 0) {
      // Draw arrow line
      svgContent += `<line x1="${x}" y1="${lineY}" x2="${x}" y2="${arrowBottomY}" stroke="currentColor" stroke-width="1"/>`;
      // Draw arrow head pointing up
      svgContent += createArrow(x, lineY, 'up');
    }

    // Draw label
    const labelHtml = useLaTeX
      ? katex.renderToString(person.label, { throwOnError: false, displayMode: false })
      : person.label;
    const labelX = x - labelDims.width / 2;
    svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${person.label}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: center;">${labelHtml}</div>
    </foreignObject>`;

    maxPersonLabelBottom = Math.max(maxPersonLabelBottom, labelY + labelDims.height);
  }

  // Draw space label (centered below everything)
  if (spaceLabel) {
    const useLaTeX = spaceLabel.asLaTeX ?? false;
    const labelDims = measureLabel(spaceLabel.label, fontSize, useLaTeX);
    const lineCenterX = lineStartX + lineLength / 2;
    const labelX = lineCenterX - labelDims.width / 2;
    const labelY = maxPersonLabelBottom + 10;
    const labelHtml = useLaTeX
      ? katex.renderToString(spaceLabel.label, { throwOnError: false, displayMode: false })
      : spaceLabel.label;

    svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${spaceLabel.label}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: center;">${labelHtml}</div>
    </foreignObject>`;

    // Draw directional arrow if specified
    if (LabelDirection) {
      const arrowY = labelY + labelDims.height + 10;
      const arrowLength = 40;
      if (LabelDirection === 'right') {
        const arrowStartX = lineCenterX - arrowLength / 2;
        const arrowEndX = lineCenterX + arrowLength / 2;
        svgContent += `<line x1="${arrowStartX}" y1="${arrowY}" x2="${arrowEndX}" y2="${arrowY}" stroke="currentColor" stroke-width="1" marker-end="url(#arrowhead-${id})"/>`;
      } else {
        const arrowStartX = lineCenterX + arrowLength / 2;
        const arrowEndX = lineCenterX - arrowLength / 2;
        svgContent += `<line x1="${arrowStartX}" y1="${arrowY}" x2="${arrowEndX}" y2="${arrowY}" stroke="currentColor" stroke-width="1" marker-end="url(#arrowhead-${id})"/>`;
      }
    }
  }

  // Add arrow marker definition if needed
  if (spaceLabel && LabelDirection) {
    svgContent += `<defs>
      <marker id="arrowhead-${id}" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="currentColor"/>
      </marker>
    </defs>`;
  }

  svgContent += '</svg>';
  return svgContent;
}

/**
 * Create an svg with id `id` with width `width` and height `height`.
 * 
 * Draw a horizontal line that spans from the left edge + `marginX` to the 
 * right edge - `marginX` of the svg, centered vertically.
 * 
 * If `persons` is defined, for each `Person` draw an arrow pointing at the
 * line *from below* at the horizontal position given by the proportion
 * at `Person.position` (which must be a number between 0 and 1.  E.g. 
 * if the line is 300px long, Person.position=0.1 means draw the arrow
 * pointing to `margin.x` + 30px.)  At the bottom of the arrow,
 * add a text label given by `Person.label`.  The text should be interpreted
 * as LaTeX markup.  Thus the label needs to be something like an foreign 
 * entity (is that the right term for an HTML element embedded in an svg????), 
 * and somehow the LaTeX interpreter used in the project has to be invoked to 
 * render the label.  Add an id to whatever entity is used given by `Person.label`.
 * 
 * If `policies` is defined, do the same for policies, EXCEPT each policy is marked
 * an arrow pointing at the line *from above*, and the policy label of course
 * goes above the origin of the arrow.
 * 
 * If `spaceLabel` is defined, use the string (interpreted as LaTeX markup)
 * as a label UNDER the line and beneath all the `persons` labels.  Use some
 * fancy-assed javascript to center that motherfucking label.  Note that some fancy-assed
 * javascript is going to be required to compute the heights of the arrows, person labels,
 * and space label given the height of the figure!  Add an id to the entity for the
 * spaceLabel given by spaceLabel.
 * 
 * If `labelDirection` is defined, draw an arrow under the spaceLabel pointing in the
 * indicated direction.
 */

