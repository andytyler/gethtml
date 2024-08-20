# 🌊 Waterfall-Fetch

A powerful and flexible utility for web scraping and HTML fetching, employing a waterfall approach with multiple strategies.

[![npm version](https://badge.fury.io/js/waterfall-fetch.svg)](https://badge.fury.io/js/waterfall-fetch)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

# 🚀 Quick Start

## 📦 Installation

```bash
npm install waterfall-fetch
```

## 🛠️ Usage

```typescript
import getHtml from 'waterfall-fetch'; // import the module

const url = 'https://example.com';

// Basic usage
const result = await getHtml(url); // simply fetch the HTML

// Suggested usage - Destructuring support (inspired by Supabase API)
const { html, error, success } = await getHtml(url); 

if (success) {
  console.log(html);
} else {
  console.error(error);
}
```

## 🔧 API

### `getHtml(url: string, options?: Options): Promise<HtmlResponse>`

Fetches HTML content from the specified URL using various strategies. The response object is designed to work seamlessly with destructuring, inspired by the Supabase API, allowing for clean and intuitive usage.

#### Parameters

- `url`: The URL to fetch
- `options` (optional):
  - `set`: Strategy set to use ('cheap', 'js', or null)
  - `evalFunction`: Custom evaluation function for Puppeteer

#### Returns

A `Promise` resolving to an `HtmlResponse` object:

```typescript
type HtmlResponse = {
  success: boolean;
  html: string | null;
  root?: NodeHTMLElement;
  evaluation_result?: any;
  strategy: FetchStrategy;
  error?: Error | null | string | unknown;
  status?: number | string | null;
};
```

## 🧠 Strategies

1. **Axios**: Fast and lightweight HTTP client
2. **Node-fetch**: Simple and modern fetch API for Node.js
3. **Stealth Puppeteer**: Headless browser for JavaScript-heavy sites

The module attempts each strategy in order until successful or all fail.

## 🛡️ Environment Variables

Set these in your `.env` file or deployment environment:

``` text
BROWSER_SERVICE=browserless
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERLESS_API_KEY=your_browserless_api_key
NODE_ENV=production
HEADLESS=on
```

## 🌟 Why Waterfall-Fetch?

Waterfall-Fetch employs a smart, cascading approach to web scraping and HTML retrieval. Here's why it's a game-changer:

This intelligent, tiered strategy ensures that you're always using the most appropriate and efficient method for each unique scraping scenario, balancing speed, cost, and accuracy.

## Logic

The waterfall method starts with the **fastest and most cost-effective strategy** to fetch the HTML of your target URL.

If the initial attempt fails, Waterfall-Fetch seamlessly transitions to more **robust methods**, ensuring you ultimately receive the HTML from the target URL.

There are 2 built in strategy sets

1. **Cheap Set**: Optimized for cost-effectiveness and speed
   - Axios
   - Node-fetch
   - Puppeteer (as a last resort)

2. **JS Set**: Designed for JavaScript-heavy websites (slower, but more accurate)
   - Puppeteer (with stealth mode)
   - Axios (as a fallback)
   - Node-fetch (as a final attempt)

Each set is tailored to specific use cases, allowing you to choose the most appropriate strategy for your scraping needs.

You can also use a custom set of strategies, from the existing set or pass in your own.

## 🚀 Features

- Multiple fetching strategies (Axios, Node-fetch, Puppeteer)
- Waterfall approach for optimal content retrieval
- Stealth mode using Puppeteer for JavaScript-heavy sites
- Customizable strategy prioritization
- Built-in error handling and logging
- TypeScript support

## 🛠️ Advanced Usage

### Passing (optional) Custom Set of Strategies

To create a custom set of strategies for fetching HTML, you can pass an array of strategies to the `set` option when calling the `getHtml` function. This allows you to prioritize the strategies you want to use based on your specific needs.

Here's how you can define and use a custom set:

```typescript
import getHtml, { fetchWithAxios, fetchWithNodeFetch, fetchWithStealthPuppeteer } from 'waterfall-fetch';

const url = 'https://example.com';

// Define a custom set of strategies
const customSet = [fetchWithNodeFetch, fetchWithAxios, fetchWithStealthPuppeteer];

// Use the custom set
const result = await getHtml(url, { set: customSet });

console.log(result.html);
console.log(result.strategy.name); // Logs the name of the successful strategy
```

### Custom Evaluation Function

A custom evaluation function in the context of `getHtml` is a user-defined function that takes a `page` object as its parameter. This `page` object represents the current state of the web page being interacted with, allowing you to execute JavaScript within the context of that page.

The evaluation function can return any value that can be serialized, such as:

- A string (e.g., the title of the page)
- A number (e.g., the number of elements on the page)
- An object (e.g., data extracted from the page)
- An array (e.g., a list of links)

Here's an example of how it works:

```typescript
const { html, evaluation_result } = await getHtml(url, {
  set: 'js',
  evalFunction: async (page) => {
    // Custom evaluation function
    return await page.evaluate(() => document.title);
  }
});
```

In this example, the custom evaluation function retrieves the document title of the page and returns it. The result is then accessible through the `evaluation_result` property in the response from `getHtml`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/andytyler/getHtml/issues).

## 📝 License

This project is [ISC](https://opensource.org/licenses/ISC) licensed.

## 🙏 Acknowledgements

- [Puppeteer](https://pptr.dev/)
- [Axios](https://axios-http.com/)
- [Node-fetch](https://github.com/node-fetch/node-fetch)

---

Made with ❤️ by [andytyler](https://github.com/andytyler) in the UK 🇬🇧.

GitHub: [@andytyler](https://github.com/andytyler)
Repo: [waterfall-fetch](https://github.com/andytyler/waterfall-fetch)