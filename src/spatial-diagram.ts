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

interface Tic {
  pos: number;
  label?: string;
}

interface Scale {
  asLaTeX?: boolean;
  tics: Array<Tic>;
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
  LabelDirection?: "left" | "right" | "up" | "down";
  scale?: Scale;
  orientation?: "horizontal" | "vertical";
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
 * Create an SVG arrow (triangle) pointing up, down, left, or right
 */
function createArrow(x: number, y: number, direction: 'up' | 'down' | 'left' | 'right'): string {
  const size = 6;
  if (direction === 'up') {
    return `<path d="M ${x},${y} L ${x - size},${y + size} L ${x + size},${y + size} Z" fill="currentColor"/>`;
  } else if (direction === 'down') {
    return `<path d="M ${x},${y} L ${x - size},${y - size} L ${x + size},${y - size} Z" fill="currentColor"/>`;
  } else if (direction === 'left') {
    return `<path d="M ${x},${y} L ${x + size},${y - size} L ${x + size},${y + size} Z" fill="currentColor"/>`;
  } else { // right
    return `<path d="M ${x},${y} L ${x - size},${y - size} L ${x - size},${y + size} Z" fill="currentColor"/>`;
  }
}

/**
 * Create a spatial diagram showing persons and policies on a one-dimensional space.
 * 
 * Draws a horizontal line spanning from left edge + marginX to right edge - marginX,
 * centered vertically in the SVG.
 * 
 * @param props - Configuration object for the spatial diagram
 * @param props.width - Width of the SVG in pixels
 * @param props.height - Height of the SVG in pixels
 * @param props.id - Unique identifier for the SVG element
 * @param props.marginX - Horizontal margin in pixels
 * @param props.marginY - Vertical margin in pixels
 * @param props.fontSize - Font size in pixels (defaults to 16)
 * @param props.persons - Array of persons to display below the line with upward-pointing arrows.
 *   Each person's position must be between 0 and 1 (proportion along the line).
 *   Labels are added at the bottom of arrows and can be LaTeX markup if asLaTeX is true.
 * @param props.policies - Array of policies to display above the line with downward-pointing arrows.
 *   Each policy's position must be between 0 and 1 (proportion along the line).
 *   Labels are added at the top of arrows and can be LaTeX markup if asLaTeX is true.
 * @param props.spaceLabel - Optional label displayed centered below all person labels.
 *   Can be LaTeX markup if asLaTeX is true.
 * @param props.LabelDirection - Optional direction ('left', 'right', 'up', or 'down') for an arrow
 *   displayed beside the space label.
 * @param props.scale - Optional scale configuration with tics and labels to display
 *   on the line.
 * @param props.orientation - Optional orientation ('horizontal' or 'vertical', defaults to 'horizontal').
 *   In vertical mode, the line runs top-to-bottom, persons appear on the left, and policies on the right.
 * 
 * @returns SVG string representing the complete spatial diagram
 * 
 * @example
 * ```typescript
 * const diagram = createSpatialDiagram({
 *   width: 600,
 *   height: 300,
 *   id: 'spatial-1',
 *   marginX: 50,
 *   marginY: 30,
 *   persons: [{ position: 0.3, label: 'A', asLaTeX: false }],
 *   policies: [{ position: 0.7, label: 'x', asLaTeX: false }],
 *   spaceLabel: { label: 'Left-Right', asLaTeX: false },
 *   LabelDirection: 'right'
 * });
 * ```
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
    LabelDirection,
    scale,
    orientation = 'horizontal'
  } = props;

  const isVertical = orientation === 'vertical';

  let svgContent = `<svg id="${id}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`;

  if (isVertical) {
    // Vertical orientation: line runs top to bottom
    const lineX = width / 2;
    const lineStartY = marginY;
    const lineEndY = height - marginY;
    const lineLength = lineEndY - lineStartY;

    // Draw the vertical line
    svgContent += `<line x1="${lineX}" y1="${lineStartY}" x2="${lineX}" y2="${lineEndY}" stroke="currentColor" stroke-width="2"/>`;

    // Draw scale tics and labels if provided
    if (scale) {
      const useLaTeX = scale.asLaTeX ?? false;
      for (const tic of scale.tics) {
        const y = lineStartY + tic.pos * lineLength;
        const ticLength = 4;

        // Draw tic mark (4px line rightward from the main line)
        svgContent += `<line x1="${lineX}" y1="${y}" x2="${lineX + ticLength}" y2="${y}" stroke="currentColor" stroke-width="2"/>`;

        // Draw tic label if provided
        if (tic.label) {
          const labelDims = measureLabel(tic.label, fontSize, useLaTeX);
          const labelX = lineX + ticLength + 2;
          const labelY = y - labelDims.height / 2;
          const labelHtml = useLaTeX
            ? katex.renderToString(tic.label, { throwOnError: false, displayMode: false })
            : tic.label;

          svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: left;">${labelHtml}</div>
          </foreignObject>`;
        }
      }
    }

    // Draw policy arrows and labels (to the right of the line)
    for (const policy of policies) {
      const y = lineStartY + policy.position * lineLength;
      const useLaTeX = policy.asLaTeX ?? false;
      const labelDims = measureLabel(policy.label, fontSize, useLaTeX);
      const arrowLeftX = lineX;
      const arrowRightX = width - marginX - labelDims.width - 5;
      const arrowLength = arrowRightX - arrowLeftX;

      if (arrowLength > 0) {
        // Draw arrow line
        svgContent += `<line x1="${arrowLeftX}" y1="${y}" x2="${arrowRightX}" y2="${y}" stroke="currentColor" stroke-width="1"/>`;
        // Draw arrow head pointing left
        svgContent += createArrow(lineX, y, 'left');
      }

      // Draw label
      const labelHtml = useLaTeX
        ? katex.renderToString(policy.label, { throwOnError: false, displayMode: false })
        : policy.label;
      const labelX = width - marginX - labelDims.width;
      const labelY = y - labelDims.height / 2;
      svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${policy.label}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: left;">${labelHtml}</div>
      </foreignObject>`;
    }

    // Draw person arrows and labels (to the left of the line)
    let maxPersonLabelRight = lineX;
    for (const person of persons) {
      const y = lineStartY + person.position * lineLength;
      const useLaTeX = person.asLaTeX ?? false;
      const labelDims = measureLabel(person.label, fontSize, useLaTeX);
      const labelX = marginX;
      const arrowRightX = lineX;
      const arrowLeftX = labelX + labelDims.width + 5;
      const arrowLength = arrowRightX - arrowLeftX;

      if (arrowLength > 0) {
        // Draw arrow line
        svgContent += `<line x1="${arrowLeftX}" y1="${y}" x2="${arrowRightX}" y2="${y}" stroke="currentColor" stroke-width="1"/>`;
        // Draw arrow head pointing right
        svgContent += createArrow(lineX, y, 'right');
      }

      // Draw label
      const labelHtml = useLaTeX
        ? katex.renderToString(person.label, { throwOnError: false, displayMode: false })
        : person.label;
      const labelY = y - labelDims.height / 2;
      svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${person.label}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: right;">${labelHtml}</div>
      </foreignObject>`;

      maxPersonLabelRight = Math.max(maxPersonLabelRight, labelX + labelDims.width);
    }

    // Draw space label (centered to the right of everything)
    if (spaceLabel) {
      const useLaTeX = spaceLabel.asLaTeX ?? false;
      const labelDims = measureLabel(spaceLabel.label, fontSize, useLaTeX);
      const lineCenterY = lineStartY + lineLength / 2;
      const labelX = maxPersonLabelRight + 10;
      const labelY = lineCenterY - labelDims.height / 2;
      const labelHtml = useLaTeX
        ? katex.renderToString(spaceLabel.label, { throwOnError: false, displayMode: false })
        : spaceLabel.label;

      svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${spaceLabel.label}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: left;">${labelHtml}</div>
      </foreignObject>`;

      // Draw directional arrow if specified
      if (LabelDirection) {
        const arrowX = labelX + labelDims.width + 10;
        const arrowLength = 40;
        if (LabelDirection === 'down') {
          const arrowStartY = lineCenterY - arrowLength / 2;
          const arrowEndY = lineCenterY + arrowLength / 2;
          svgContent += `<line x1="${arrowX}" y1="${arrowStartY}" x2="${arrowX}" y2="${arrowEndY}" stroke="currentColor" stroke-width="1" marker-end="url(#arrowhead-${id})"/>`;
        } else if (LabelDirection === 'up') {
          const arrowStartY = lineCenterY + arrowLength / 2;
          const arrowEndY = lineCenterY - arrowLength / 2;
          svgContent += `<line x1="${arrowX}" y1="${arrowStartY}" x2="${arrowX}" y2="${arrowEndY}" stroke="currentColor" stroke-width="1" marker-end="url(#arrowhead-${id})"/>`;
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

  } else {
    // Horizontal orientation (original implementation)
    const lineY = height / 2;
    const lineStartX = marginX;
    const lineEndX = width - marginX;
    const lineLength = lineEndX - lineStartX;

    // Draw the horizontal line
    svgContent += `<line x1="${lineStartX}" y1="${lineY}" x2="${lineEndX}" y2="${lineY}" stroke="currentColor" stroke-width="2"/>`;

    // Draw scale tics and labels if provided
    if (scale) {
      const useLaTeX = scale.asLaTeX ?? false;
      for (const tic of scale.tics) {
        const x = lineStartX + tic.pos * lineLength;
        const ticLength = 4;

        // Draw tic mark (4px line downward from the main line)
        svgContent += `<line x1="${x}" y1="${lineY}" x2="${x}" y2="${lineY + ticLength}" stroke="currentColor" stroke-width="2"/>`;

        // Draw tic label if provided
        if (tic.label) {
          const labelDims = measureLabel(tic.label, fontSize, useLaTeX);
          const labelX = x - labelDims.width / 2;
          const labelY = lineY + ticLength + 2;
          const labelHtml = useLaTeX
            ? katex.renderToString(tic.label, { throwOnError: false, displayMode: false })
            : tic.label;

          svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: center;">${labelHtml}</div>
        </foreignObject>`;
        }
      }
    }

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
  }

  svgContent += '</svg>';
  return svgContent;
}

