import katex from 'katex';

interface Person2D {
  x: number;
  y: number;
  label: string;
  asLaTeX?: boolean;
  guides?: boolean;
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

interface SpatialDiagram2DProps {
  width: number;
  height: number;
  id: string;
  marginX: number;
  marginY: number;
  fontSize?: number;
  persons?: Array<Person2D>;
  horizontalPolicies?: Array<Policy>;
  verticalPolicies?: Array<Policy>;
  horizontalScale?: Scale;
  verticalScale?: Scale;
  horizontalLabel?: { label: string; asLaTeX?: boolean };
  verticalLabel?: { label: string; asLaTeX?: boolean };
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
 * Create a 2D spatial diagram showing persons and policies on a two-dimensional space.
 * 
 * Draws horizontal and vertical axes that cross at the center of the SVG (accounting for margins).
 * 
 * @param props - Configuration object for the 2D spatial diagram
 * @param props.width - Width of the SVG in pixels
 * @param props.height - Height of the SVG in pixels
 * @param props.id - Unique identifier for the SVG element
 * @param props.marginX - Horizontal margin in pixels
 * @param props.marginY - Vertical margin in pixels
 * @param props.fontSize - Font size in pixels (defaults to 16)
 * @param props.persons - Array of persons to display as dots with labels.
 *   Each person's x and y must be between 0 and 1 (proportions along the axes).
 *   Labels are positioned at the top-right of the dot.
 * @param props.horizontalPolicies - Array of policies to display above the horizontal axis
 *   with downward-pointing arrows.
 * @param props.verticalPolicies - Array of policies to display left of the vertical axis
 *   with rightward-pointing arrows.
 * @param props.horizontalScale - Optional scale configuration for the horizontal axis
 * @param props.verticalScale - Optional scale configuration for the vertical axis
 * @param props.horizontalLabel - Optional label for the horizontal axis, displayed at the right end
 * @param props.verticalLabel - Optional label for the vertical axis, displayed at the top end
 * 
 * @returns SVG string representing the complete 2D spatial diagram
 */
export function createSpatialDiagram2D(props: SpatialDiagram2DProps): string {
  const {
    width,
    height,
    id,
    marginX,
    marginY,
    fontSize = 16,
    persons = [],
    horizontalPolicies = [],
    verticalPolicies = [],
    horizontalScale,
    verticalScale,
    horizontalLabel,
    verticalLabel
  } = props;

  // Calculate the bounds of the drawing area
  const leftX = marginX;
  const rightX = width - marginX;
  const topY = marginY;
  const bottomY = height - marginY;

  // Calculate center point where axes cross
  const centerX = (leftX + rightX) / 2;
  const centerY = (topY + bottomY) / 2;

  // Calculate axis dimensions
  const horizontalAxisLength = rightX - leftX;
  const verticalAxisLength = bottomY - topY;

  let svgContent = `<svg id="${id}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`;

  // Draw the horizontal axis
  svgContent += `<line x1="${leftX}" y1="${centerY}" x2="${rightX}" y2="${centerY}" stroke="currentColor" stroke-width="2"/>`;

  // Draw the vertical axis
  svgContent += `<line x1="${centerX}" y1="${topY}" x2="${centerX}" y2="${bottomY}" stroke="currentColor" stroke-width="2"/>`;

  // Draw horizontal scale tics and labels if provided
  if (horizontalScale) {
    const useLaTeX = horizontalScale.asLaTeX ?? false;
    for (const tic of horizontalScale.tics) {
      const x = leftX + tic.pos * horizontalAxisLength;
      const ticLength = 4;

      // Draw tic mark (4px line downward from the horizontal axis)
      svgContent += `<line x1="${x}" y1="${centerY}" x2="${x}" y2="${centerY + ticLength}" stroke="currentColor" stroke-width="2"/>`;

      // Draw tic label if provided
      if (tic.label) {
        const labelDims = measureLabel(tic.label, fontSize, useLaTeX);
        const labelX = x - labelDims.width / 2;
        const labelY = centerY + ticLength + 2;
        const labelHtml = useLaTeX
          ? katex.renderToString(tic.label, { throwOnError: false, displayMode: false })
          : tic.label;

        svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: center;">${labelHtml}</div>
        </foreignObject>`;
      }
    }
  }

  // Draw vertical scale tics and labels if provided
  if (verticalScale) {
    const useLaTeX = verticalScale.asLaTeX ?? false;
    for (const tic of verticalScale.tics) {
      const y = topY + tic.pos * verticalAxisLength;
      const ticLength = 4;

      // Draw tic mark (4px line rightward from the vertical axis)
      svgContent += `<line x1="${centerX}" y1="${y}" x2="${centerX + ticLength}" y2="${y}" stroke="currentColor" stroke-width="2"/>`;

      // Draw tic label if provided
      if (tic.label) {
        const labelDims = measureLabel(tic.label, fontSize, useLaTeX);
        const labelX = centerX + ticLength + 2;
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

  // Draw horizontal policy arrows and labels (above the horizontal axis)
  for (const policy of horizontalPolicies) {
    const x = leftX + policy.position * horizontalAxisLength;
    const useLaTeX = policy.asLaTeX ?? false;
    const labelDims = measureLabel(policy.label, fontSize, useLaTeX);
    const arrowLength = 10;

    // Draw arrow line (pointing down to the horizontal axis)
    const arrowTopY = centerY - arrowLength;
    svgContent += `<line x1="${x}" y1="${arrowTopY}" x2="${x}" y2="${centerY}" stroke="currentColor" stroke-width="1"/>`;

    // Draw arrow head
    const arrowSize = 3;
    svgContent += `<path d="M ${x},${centerY} L ${x - arrowSize},${centerY - arrowSize} L ${x + arrowSize},${centerY - arrowSize} Z" fill="currentColor"/>`;

    // Draw label above the arrow
    const labelX = x - labelDims.width / 2;
    const labelY = arrowTopY - labelDims.height - 2;
    const labelHtml = useLaTeX
      ? katex.renderToString(policy.label, { throwOnError: false, displayMode: false })
      : policy.label;

    svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${policy.label}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: center;">${labelHtml}</div>
    </foreignObject>`;
  }

  // Draw vertical policy arrows and labels (left of the vertical axis)
  for (const policy of verticalPolicies) {
    const y = topY + policy.position * verticalAxisLength;
    const useLaTeX = policy.asLaTeX ?? false;
    const labelDims = measureLabel(policy.label, fontSize, useLaTeX);
    const arrowLength = 10;

    // Draw arrow line (pointing right to the vertical axis)
    const arrowLeftX = centerX - arrowLength;
    svgContent += `<line x1="${arrowLeftX}" y1="${y}" x2="${centerX}" y2="${y}" stroke="currentColor" stroke-width="1"/>`;

    // Draw arrow head
    const arrowSize = 3;
    svgContent += `<path d="M ${centerX},${y} L ${centerX - arrowSize},${y - arrowSize} L ${centerX - arrowSize},${y + arrowSize} Z" fill="currentColor"/>`;

    // Draw label left of the arrow
    const labelX = arrowLeftX - labelDims.width - 2;
    const labelY = y - labelDims.height / 2;
    const labelHtml = useLaTeX
      ? katex.renderToString(policy.label, { throwOnError: false, displayMode: false })
      : policy.label;

    svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${policy.label}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: right;">${labelHtml}</div>
    </foreignObject>`;
  }

  // Draw persons as dots with labels
  for (const person of persons) {
    const x = leftX + person.x * horizontalAxisLength;
    const y = topY + person.y * verticalAxisLength;
    const dotRadius = 8;

    // Draw guide lines if requested
    if (person.guides) {
      // Vertical guide line (from person to horizontal axis)
      svgContent += `<line x1="${x}" y1="${y}" x2="${x}" y2="${centerY}" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3"/>`;
      // Horizontal guide line (from person to vertical axis)
      svgContent += `<line x1="${x}" y1="${y}" x2="${centerX}" y2="${y}" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3"/>`;
    }

    // Draw dot
    svgContent += `<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="currentColor"/>`;

    // Draw label at top-right of the dot (bottom-left corner of label at top-right + 3px)
    const useLaTeX = person.asLaTeX ?? false;
    const labelDims = measureLabel(person.label, fontSize, useLaTeX);
    const labelX = x + dotRadius + 0;
    const labelY = y - dotRadius - 0 - labelDims.height;
    const labelHtml = useLaTeX
      ? katex.renderToString(person.label, { throwOnError: false, displayMode: false })
      : person.label;

    svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelDims.width}" height="${labelDims.height}" id="${person.label}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 0; text-align: left;">${labelHtml}</div>
    </foreignObject>`;
  }

  // Draw horizontal axis label if provided
  if (horizontalLabel) {
    const useLaTeX = horizontalLabel.asLaTeX ?? false;
    const labelHtml = useLaTeX
      ? katex.renderToString(horizontalLabel.label, { throwOnError: false, displayMode: false })
      : horizontalLabel.label;

    const labelWidth = marginX - 4; // 2px padding on each side
    const labelX = rightX + 2;
    // Allow full vertical span for multi-line text
    const labelHeight = verticalAxisLength; // Use full height between top and bottom
    const labelY = topY;

    svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelWidth}" height="${labelHeight}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 2px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; display: flex; align-items: center; justify-content: center; height: 100%;">${labelHtml}</div>
    </foreignObject>`;
  }

  // Draw vertical axis label if provided
  if (verticalLabel) {
    const useLaTeX = verticalLabel.asLaTeX ?? false;
    const labelHtml = useLaTeX
      ? katex.renderToString(verticalLabel.label, { throwOnError: false, displayMode: false })
      : verticalLabel.label;

    const labelHeight = marginY - 4; // 2px padding on each side
    const labelWidth = horizontalAxisLength; // Use full horizontal axis length
    const labelX = leftX;
    const labelY = 2;

    svgContent += `<foreignObject x="${labelX}" y="${labelY}" width="${labelWidth}" height="${labelHeight}">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; margin: 0; padding: 2px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; display: flex; align-items: center; justify-content: center; width: 100%;">${labelHtml}</div>
    </foreignObject>`;
  }

  svgContent += '</svg>';
  return svgContent;
}
