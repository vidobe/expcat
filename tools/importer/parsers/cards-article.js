/* global WebImporter */

/**
 * Parser for cards-article block
 *
 * Source: https://blog.epson.com/
 * Base Block: cards
 *
 * Block Structure:
 * - Row 1: Block name header
 * - Row 2-N: Each card = 1 row with 2 columns [image | heading, link]
 *
 * Source HTML Pattern:
 * <div class="card">
 *   <div class="card__image">
 *     <a><picture><img></picture></a>
 *   </div>
 *   <div class="card__content">
 *     <a><h3 class="card__title">...</h3></a>
 *     <a class="card__reading-time"><span>X min read</span></a>
 *   </div>
 * </div>
 *
 * Generated: 2026-01-15
 */
export default function parse(element, { document }) {
  // Extract image
  // VALIDATED: Found .card__image img in captured DOM
  const image = element.querySelector('.card__image img');

  // Extract title and link
  // VALIDATED: Found .card__title and .card__link in captured DOM
  const titleEl = element.querySelector('.card__title');
  const titleLink = element.querySelector('.card__link');

  // Extract reading time link
  // VALIDATED: Found .card__reading-time in captured DOM
  const readingTimeLink = element.querySelector('.card__reading-time');

  // Build content cell
  const contentCell = document.createElement('div');

  if (titleEl) {
    const h3 = document.createElement('h3');
    h3.textContent = titleEl.textContent;
    contentCell.appendChild(h3);
  }

  if (readingTimeLink) {
    const link = document.createElement('a');
    link.href = readingTimeLink.href || titleLink?.href || '#';
    link.textContent = readingTimeLink.querySelector('span')?.textContent || 'Read more';
    contentCell.appendChild(link);
  }

  // Build cells array - single card per row
  const cells = [
    [image || '', contentCell]
  ];

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Article', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
