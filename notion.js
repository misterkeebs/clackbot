require('dotenv').config();
const moment = require('moment-timezone');
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_KEY });

async function addItem(text) {
  try {
    const response = await notion.databases.query({
      database_id: 'cf74e9561ef74ae99473610f0abef863',
    });
    console.log(JSON.stringify(response, null, 2));
    // const page = response.results[5];
    // console.log('page', page);
    // const children = await notion.blocks.children.list({ block_id: page.id });
    // console.log(JSON.stringify(children, null, 2));

    const page = await notion.pages.create({
      parent: {
        database_id: 'cf74e9561ef74ae99473610f0abef863',
      },
      cover: {
        external: {
          url: 'https://cdn.discordapp.com/attachments/943164528378667038/944234329394016326/elongate.gif',
        }
      },
      properties: {
        Date: {
          date: {
            start: moment().tz('America/Sao_Paulo'),
          },
        },
        Image: {
          files: [
            {
              name: 'elongate',
              external: {
                url: 'https://cdn.discordapp.com/attachments/943164528378667038/944234329394016326/elongate.gif',
              }
            }
          ],
        },
        Keyboard: {
          multi_select: [
            { name: 'Elongate' },
          ],
        },
        Winner: {
          title: [
            {
              text: {
                content: 'fcoury | mrkeebs.com#0001',
              }
            }
          ]
        }
      },
      children: [
        {
          object: 'block',
          paragraph: {
            text: [
              {
                text: {
                  content: 'Elongate Polycarb'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          image: {
            external: {
              url: 'https://cdn.discordapp.com/attachments/943164528378667038/944234329394016326/elongate.gif',
            }
          }
        }
      ]
    });
    console.log(JSON.stringify(page, null, 2));
  } catch (error) {
    console.log('error', error);
    console.error('Error', error);
  }
}

addItem('Yurts in Big Sur, California');
