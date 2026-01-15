/* global WebImporter */

/**
 * Parser for columns-featured block
 *
 * Source: https://blog.epson.com/
 * Base Block: columns
 *
 * Block Structure:
 * - Row 1: Block name header
 * - Row 2: 2 columns [image | heading, description, link]
 *
 * Source HTML Pattern:
 * <div class="card card--fullwidth">
 *   <div class="row">
 *     <div class="col-sm-6">
 *       <div class="card__image">
 *         <a><picture><img></picture></a>
 *       </div>
 *     </div>
 *     <div class="col-sm-6">
 *       <div class="card__content">
 *         <a><h3 class="card__title">...</h3></a>
 *         <p class="card__desc">...</p>
 *         <a class="card__reading-time"><span>X min read</span></a>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-01-15
 */
export default function parse(element, { document }) {
  // Extract image from left column
  // VALIDATED: Found .card__image img in captured DOM
  const image = element.querySelector('.card__image img');

  // Extract title from right column
  // VALIDATED: Found .card__title in captured DOM
  const title = element.querySelector('.card__title');

  // Extract description
  // VALIDATED: Found .card__desc in captured DOM
  const description = element.querySelector('.card__desc');

  // Extract reading time link
  // VALIDATED: Found .card__reading-time in captured DOM
  const readingTimeLink = element.querySelector('.card__reading-time');

  // Build cells array matching columns block structure
  // Row 1: 2 columns [image | content]
  const contentCell = document.createElement('div');
  if (title) {
    const h3 = document.createElement('h3');
    h3.textContent = title.textContent;
    contentCell.appendChild(h3);
  }
  if (description) {
    const p = document.createElement('p');
    p.textContent = description.textContent;
    contentCell.appendChild(p);
  }
  if (readingTimeLink) {
    const link = document.createElement('a');
    link.href = readingTimeLink.href;
    link.textContent = readingTimeLink.querySelector('span')?.textContent || 'Read more';
    contentCell.appendChild(link);
  }

  const cells = [
    [image || '', contentCell],
  ];

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Featured', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
