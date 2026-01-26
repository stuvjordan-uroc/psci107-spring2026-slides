/**
 * Generates an SVG path for a left bracket with an offset nipple
 * @param {number} width - Width of the viewBox
 * @param {number} height - Height of the viewBox
 * @param {number} nipplePercent - Vertical position of nipple (0-100, where 0 is top, 100 is bottom)
 * @returns {string} SVG path string
 */
export function generateLeftBracket(width, height, nipplePercent = 30) {
  // Bracket parameters
  const topY = 0;
  const bottomY = height;
  const leftX = width * 0.3;
  const rightX = width * 0.9;
  const nippleX = 3; // Close to left edge

  // Convert nipplePercent to actual Y coordinate
  const nippleY = (nipplePercent / 100) * height;

  // Calculate control points proportionally
  const topArmLength = nippleY - topY;
  const bottomArmLength = bottomY - nippleY;

  // Top arm control points (convex then concave to nipple)
  const topMidY = topY + (topArmLength * 0.3);
  const topCurveY = topY + (topArmLength * 0.7);

  // Bottom arm control points (mirror of top)
  const bottomCurveY = nippleY + (bottomArmLength * 0.3);
  const bottomMidY = nippleY + (bottomArmLength * 0.7);

  return `M ${rightX},${topY} 
    C ${leftX + (width * 0.1)},${topY} ${leftX},${topY} ${leftX},${topMidY}
    C ${leftX},${topCurveY} ${leftX + (width * 0.06)},${nippleY - 6} ${nippleX},${nippleY}
    C ${leftX + (width * 0.06)},${nippleY + 6} ${leftX},${bottomCurveY} ${leftX},${bottomMidY}
    C ${leftX},${bottomY} ${leftX + (width * 0.1)},${bottomY} ${rightX},${bottomY}`;
}
