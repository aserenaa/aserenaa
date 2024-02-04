import { promises as fs } from 'fs'
import { join } from 'path'
import Parser from 'rss-parser'

const MAX_NUMBER_OF_ITEMS = {
  ARTICLES: 3
}

const PLACEHOLDERS = {
  LATEST_ARTICLES: '%{{latest_articles}}%',
  DAY_NAME: '%{{day_name}}'
}

const parser = new Parser()

const getLatestArticles = async () => {
  const feed = await parser.parseURL('https://idkan.dev/feed.xml')
  return feed.items.slice(0, MAX_NUMBER_OF_ITEMS.ARTICLES)
}

const getDayName = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

;(async () => {
  const [template, latestArticles, dayName] = await Promise.all([
    fs.readFile('./README_TEMPLATE.md', { encoding: 'utf8' }),
    getLatestArticles(),
    getDayName()
  ])

  const latestArticlesList = latestArticles.map(({ title, link, contentSnippet }) => {
    return `<li><a href="${link}"><b>${title}</b></a><br><i>${contentSnippet}</i></li>`
  }, join('\n\t'))

  const newReadme = template
    .replace(PLACEHOLDERS.LATEST_ARTICLES, latestArticlesList)
    .replace(PLACEHOLDERS.DAY_NAME, dayName)

  await fs.writeFile('README.md', newReadme)
})()
