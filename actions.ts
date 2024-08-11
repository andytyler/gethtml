// import { HTMLElement } from 'node-html-parser';
import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { config } from "dotenv";
config();

const { BROWSER_SERVICE, BROWSERBASE_API_KEY, BROWSERLESS_API_KEY, NODE_ENV, HEADLESS } = process.env;

export let browserless_ws_endpoint = BROWSERLESS_API_KEY ? `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}&stealth&--window-size=430,932` : "";
export let browserbase_ws_endpoint = BROWSERBASE_API_KEY ? `wss://chrome.browserless.io?token=${BROWSERBASE_API_KEY}&stealth&--window-size=430,932` : "";

const ws_endpoint =
	BROWSER_SERVICE === "browserless" ? browserless_ws_endpoint : BROWSER_SERVICE === "browserbase" ? browserbase_ws_endpoint : browserbase_ws_endpoint;
// import { HttpsProxyAgent } from 'https-proxy-agent';

// // puppeteer-extra is a drop-in replacement for puppeteer,
// // it augments the installed puppeteer with plugin functionality
// const puppeteer = require('puppeteer-extra')

// // add stealth plugin and use defaults (all evasion techniques)
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// puppeteer.use(StealthPlugin())

// todo implement page pool!!
export async function initStealthPuppeteer(headless: boolean = true): Promise<{ browser: Browser | null; page: Page | null; error?: Error | unknown | null }> {
	// todo Need to make as little as possible load in to save on bandwidth
	let browser: Browser | null = null;
	let page: Page | null = null;
	const IS_PRODUCTION = NODE_ENV === "production";
	const SHOW_PUPPETEER = HEADLESS === "off" ? false : headless;
	// Set options for puppeteer to be as robust as possible - don't crash.

	const puppeteerOptions = {
		ignoreHTTPSErrors: true,
		timeout: 60000,
		headless: IS_PRODUCTION ? true : SHOW_PUPPETEER,
		handleSIGINT: false,
		handleSIGTERM: false,
		handleSIGHUP: false,
		// ignoreDefaultArgs: ['--disable-extensions'],
		args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
	};

	try {
		// console.log('BROWSERLESS_API_KEY', NODE_ENV);

		browser = IS_PRODUCTION
			? // Connect to browserless in production
			  await puppeteer.connect({ browserWSEndpoint: ws_endpoint })
			: // Run the browser locally while in development
			  puppeteer.use(StealthPlugin()) && (await puppeteer.launch(puppeteerOptions));
		//   await puppeteer.connect({ browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}` });

		if (!browser) return { browser: null, page: null, error: new Error("No browser") };
		page = await browser.newPage();
		if (!page) {
			browser.close();
			return { browser: null, page: null, error: new Error("No page") };
		}
		await page.setViewport({ width: 430, height: 932 });

		await page.setRequestInterception(true);
		page.on("request", (req) => {
			if (
				(!req.isInterceptResolutionHandled() && req.resourceType() === "image") ||
				req.resourceType() === "font" ||
				req.resourceType() === "media"
				// req.resourceType() === 'stylesheet'
			) {
				return req.abort();
			} else {
				req.continue();
			}
		});

		return { browser, page };
	} catch (error) {
		console.error("Error initializing Stealth Puppeteer:", error);
		if (browser) {
			browser.close();
		}
		return { browser: null, page: null, error };
	}
	//finally {
	// if (browser) {
	// 	browser.close();
	// }
	// }
	return { browser, page };
}

// puppeteer page pool
// const StealthPageFactory = {
//   create: async function () {
//     return await createPageForBrowserPool();
//   },
//   destroy: async function (page: Page) {
//     return await destroyPageForBrowserPool(page);
//   },
// };

// export const StealthPagePool = genericPool.createPool(StealthPageFactory, { max: MAX_PAGES, min: 0, autostart: false });

// export async function initStealthPuppeteerWithProxy(headless: boolean = false): Promise<{ browser: Browser | null; page: Page | null }> {
// 	let browser: Browser | null = null;
// 	let page: Page | null = null;

// 	// Proxy Config
// 	const Proxy = {
// 		host: process.env.BRIGHTDATA_UNLOCKER_HOST as string,
// 		user: `${process.env.BRIGHTDATA_UNLOCKER_USERNAME}${true ? '-ua-mobile' : ''}` as string,
// 		password: process.env.BRIGHTDATA_UNLOCKER_PASSWORD as string
// 	};

// 	const puppeteerOptions = {
// 		ignoreHTTPSErrors: true,
// 		headless,
// 		handleSIGINT: false,
// 		handleSIGTERM: false,
// 		handleSIGHUP: false,
// 		args: [`--proxy-server=http://${Proxy.user}:${Proxy.password}@${Proxy.host}`, '--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox']
// 	};

// 	try {
// 		puppeteer.use(StealthPlugin());
// 		browser = await puppeteer.connect(puppeteerOptions);
// 		if (!browser) throw new Error('No browser');
// 		page = await browser.newPage();
// 	} catch (error) {
// 		console.error('Error initializing Stealth Puppeteer:', error);
// 		return { browser: null, page: null };
// 	}

// 	return { browser, page };
// }
