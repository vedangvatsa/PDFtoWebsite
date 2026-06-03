import fs from 'fs';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Retrieve credentials
const notionToken = process.env.NOTION_INTEGRATION_TOKEN;
const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

if (!notionToken || !parentPageId) {
  console.error('ERROR: Missing NOTION_INTEGRATION_TOKEN or NOTION_PARENT_PAGE_ID in your .env.local file.');
  console.log('\nPlease add the following to your /Users/vedang/PDFtoWebsite/.env.local file:');
  console.log('NOTION_INTEGRATION_TOKEN=secret_xxxxxx');
  console.log('NOTION_PARENT_PAGE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  process.exit(1);
}

const notion = new Client({ auth: notionToken });

// Convert simple markdown string to Notion rich text array
function toRichText(text) {
  // Strip simple markdown formatting for Notion rich text blocks
  let content = text.trim();
  const bold = content.startsWith('**') && content.endsWith('**');
  if (bold) content = content.substring(2, content.length - 2);

  const italic = content.startsWith('*') && content.endsWith('*');
  if (italic) content = content.substring(1, content.length - 1);

  return [
    {
      type: 'text',
      text: { content },
      annotations: { bold, italic }
    }
  ];
}

// Convert a markdown table row into Notion table cells
function toTableCells(rowText) {
  const parts = rowText.split('|').map(s => s.trim());
  // Remove first and last empty elements from split margin |
  if (parts[0] === '') parts.shift();
  if (parts[parts.length - 1] === '') parts.pop();

  return parts.map(part => {
    // Strip bold markers from cells
    let content = part;
    let bold = false;
    if (content.startsWith('**') && content.endsWith('**')) {
      content = content.substring(2, content.length - 2);
      bold = true;
    }
    return [
      {
        type: 'text',
        text: { content }
      }
    ];
  });
}

async function exportToNotion() {
  const reportPath = '/Users/vedang/.gemini/antigravity/brain/a953b8fa-3e99-4aca-a494-6da238a4bab2/artifacts/hashtagweb3_cvinbio_metrics_summary.md';
  
  if (!fs.existsSync(reportPath)) {
    console.error(`ERROR: Summary report not found at ${reportPath}`);
    return;
  }

  console.log('Reading metrics summary report...');
  const md = fs.readFileSync(reportPath, 'utf8');
  const lines = md.split('\n');

  const blocks = [];
  let currentTable = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle Table Accumulation
    if (line.startsWith('|')) {
      // Skip divider lines (|---|---|)
      if (line.includes('---')) continue;

      if (!currentTable) {
        currentTable = {
          type: 'table',
          table: {
            table_width: line.split('|').length - 2, // subtract margin split margins
            has_column_header: true,
            has_row_header: false,
            children: []
          }
        };
      }

      currentTable.table.children.push({
        type: 'table_row',
        table_row: {
          cells: toTableCells(line)
        }
      });
      continue;
    } else {
      // If table ended, push accumulated table block
      if (currentTable) {
        blocks.push(currentTable);
        currentTable = null;
      }
    }

    if (line === '') continue;

    // Headers
    if (line.startsWith('# ')) {
      // Main Page Title is ignored as it is passed in the page creation properties
      continue;
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: toRichText(line.substring(3)) }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: toRichText(line.substring(4)) }
      });
    }
    // Image embeds (Images cannot be uploaded directly via URLs from local filesystem, so we reference them as text captions)
    else if (line.startsWith('![')) {
      const match = line.match(/!\[([^\]]*)\]\(([^)]*)\)/);
      if (match) {
        const altText = match[1] || 'Chart';
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: { content: `📊 [Chart Embed: ${altText}]` },
                annotations: { italic: true, bold: true }
              }
            ]
          }
        });
      }
    }
    // Dividers
    else if (line === '---') {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {}
      });
    }
    // List Items
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: toRichText(line.substring(2)) }
      });
    }
    // Regular paragraphs
    else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: toRichText(line) }
      });
    }
  }

  // Push final table if file ended on table
  if (currentTable) {
    blocks.push(currentTable);
  }

  console.log(`Parsed ${blocks.length} Notion blocks. Creating Notion page...`);

  try {
    const response = await notion.pages.create({
      parent: { page_id: parentPageId },
      properties: {
        title: [
          {
            text: {
              content: 'Analytics & Database Metrics: Hashtag Web3 & CV in Bio'
            }
          }
        ]
      },
      children: blocks
    });

    console.log('\n✅ SUCCESS: Page exported successfully to Notion!');
    console.log(`URL: ${response.url}`);
  } catch (error) {
    console.error('Notion API Error:', error);
  }
}

exportToNotion();
