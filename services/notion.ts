import axios from 'axios';

const NOTION_VERSION = '2022-06-28';

/**
 * Fetches pages from a Notion database.
 * @param token Integration secret.
 * @param databaseId Database identifier.
 */
export async function listDatabasePages(token: string, databaseId: string) {
  const res = await axios.post(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data.results;
}

/**
 * Creates a simple page in the specified Notion database.  The properties object should be
 * structured according to Notion API requirements.
 */
export async function createDatabasePage(
  token: string,
  databaseId: string,
  properties: any,
) {
  const res = await axios.post(
    'https://api.notion.com/v1/pages',
    {
      parent: { database_id: databaseId },
      properties,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data;
}