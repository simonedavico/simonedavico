import fs from "fs";
import Parser from "rss-parser";

const feedParser = new Parser();

const ListMarkers = Object.freeze({
  TO_READ: "{{toRead}}",
  READING: "{{currentlyReading}}",
  READ: "{{read}}",
});

const BookCollections = Object.freeze({
  TO_READ: "Tc4xQ",
  READING: "V1sLd",
  READ: "4KT35",
});

/**
 * An oku.club feed
 * @typedef {Object} FeedItem
 * @property {string} creator
 * @property {string} title
 * @property {string} link
 * @property {string} pubDate
 *
 * @typedef {Object} Feed
 * @property {FeedItem[]} items
 * @property {string} feedUrl
 */

/**
 * Fetches the feed for a books collection on oku.club
 *
 * @param {string} collectionId the id of the collection
 * @returns {Promise<Feed>} the parsed feed
 */
const fetchBooksCollectionFeed = (collectionId) => {
  return feedParser.parseURL(`https://oku.club/rss/collection/${collectionId}`);
};

/**
 * Transforms a feed into a markdown list
 *
 * @param {string} collectionId the id of the collection to transform
 * @returns {Promise<string>} the list in markdown format
 */
const feedToMarkdownList = async (feedId) => {
  const feed = await fetchBooksCollectionFeed(feedId);
  return feed.items.map((item) => `* [${item.title}](${item.link})`).join("\n");
};

/**
 * Updates the readme, fetching the books list from oku.club
 */
const generateReadme = async () => {
  const readmeTemplate = fs.readFileSync("./README.template.md", {
    encoding: "utf-8",
  });

  const [toRead, reading, read] = await Promise.all([
    feedToMarkdownList(BookCollections.TO_READ),
    feedToMarkdownList(BookCollections.READING),
    feedToMarkdownList(BookCollections.READ),
  ]);

  const updatedReadme = readmeTemplate
    .replace(ListMarkers.TO_READ, toRead)
    .replace(ListMarkers.READING, reading)
    .replace(ListMarkers.READ, read);

  fs.writeFileSync("./README.md", updatedReadme);
};

await generateReadme();
