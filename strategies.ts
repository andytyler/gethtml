import axios from "axios";
import fetch from "node-fetch";
import type { Page } from "puppeteer";
import { initStealthPuppeteer } from "./actions";

export type StrategyResponse = {
	success: boolean;
	strategy: FetchStrategy;
	html: string | null;
	evaluation_result?: any;
	error: unknown | string | Error | null;
	status: number | null;
	page?: Page; // Add this line
};

export type FetchStrategy = {
	name: string;
	cost: number;
};

export type OnPageEvaluationFunction = (page: Page) => Promise<any>;

/**
 * The function fetches data from a specified URL using the Axios library in TypeScript and returns a
 * Promise with the response.
 * @param {string} url - The `url` parameter is a string that represents the URL of the resource you
 * want to fetch using Axios.
 * @returns The function `fetchWithAxios` returns a Promise that resolves to a `StrategyResponse`
 * object.
 */
export async function fetchWithAxios(url: string): Promise<StrategyResponse> {
	const strategy: FetchStrategy = { name: "axios", cost: 0 };
	const headers = {
		Authorization: "Bearer 789574hh9s__f9b8y3bfalfn[]ff9whuefewjibf822+3++=555wbi3b3juuu",
		"Content-Type": "application/json",
		accept: "*/*",
		"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
		referer: "https://www.bing.co.uk",
		cookie: "DSID=AAO-7r4OSkS76zbHUkiOpnI0kk-X19BLDFF53G8gbnd21VZV2iehu-w_2v14cxvRvrkd_NjIdBWX7wUiQ66f-D8kOkTKD1BhLVlqrFAaqDP3LodRK2I0NfrObmhV9HsedGE7-mQeJpwJifSxdchqf524IMh9piBflGqP0Lg0_xjGmLKEQ0F4Na6THgC06VhtUG5infEdqMQ9otlJENe3PmOQTC_UeTH5DnENYwWC8KXs-M4fWmDADmG414V0_X0TfjrYu01nDH2Dcf3TIOFbRDb993g8nOCswLMi92LwjoqhYnFdf1jzgK0",
	};

	try {
		const response = await axios.get(url, { headers });
		if (response.status !== 200) {
			return { success: false, strategy, html: null, error: response.statusText, status: response.status } as StrategyResponse;
		}
		return { success: true, strategy, html: response.data, error: null, status: response.status } as StrategyResponse;
	} catch (error) {
		return { success: false, strategy, html: null, error, status: null } as StrategyResponse;
	}
}

// todo - add a strategy that uses a proxy with axios

/**
 * The function fetchWithNodeFetch is an async function that uses the Node Fetch library to fetch HTML
 * content from a given URL and returns a Promise that resolves to a StrategyResponse object.
 * @param {string} url - The `url` parameter is a string that represents the URL of the resource you
 * want to fetch.
 * @returns The function `fetchWithNodeFetch` returns a Promise that resolves to a `StrategyResponse`
 * object.
 */
export async function fetchWithNodeFetch(url: string): Promise<StrategyResponse> {
	const strategy: FetchStrategy = { name: "node-fetch", cost: 0 };
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return { success: false, strategy, html: null, error: response.statusText, status: response.status } as StrategyResponse;
		}
		const html = await response.text();
		return { success: true, strategy, html, error: null, status: response.status } as StrategyResponse;
	} catch (error) {
		return { success: false, strategy, html: null, error, status: null } as StrategyResponse;
	}
}

/**
 * The function fetches the HTML content of a given URL using Puppeteer with stealth capabilities.
 * @param {string} url - The `url` parameter is a string that represents the URL of the webpage you
 * want to fetch using Puppeteer.
 * @returns The function `fetchWithStealthPuppeteer` returns a Promise that resolves to a
 * `StrategyResponse` object.
 */
export async function fetchWithStealthPuppeteer(url: string, evalFunction?: OnPageEvaluationFunction, keepBrowserOpen?: boolean): Promise<StrategyResponse> {
	const strategy: FetchStrategy = { name: "stealth-puppeteer", cost: 0 };
	let stealth_browser: any = null;
	let page: Page | null = null;

	try {
		const { browser: stealth_browser, page: initialPage, error } = await initStealthPuppeteer(true);
		if (error) return { success: false, strategy, html: null, error, status: null };
		if (!stealth_browser || !initialPage) {
			if (stealth_browser) await stealth_browser.close();
			return {
				success: false,
				strategy,
				html: null,
				error: new Error("No browser OR, no page when loading stealth puppeteer."),
				status: null,
			};
		}

		page = initialPage;

		console.log(`[STEALTH PUPPETEER] ${url}`);
		const http_response = await page.goto(url, { waitUntil: "domcontentloaded" });
		console.log("[STEALTH PUPPETEER] domcontentloaded");
		const status = http_response ? http_response.status() : null;

		let evaluation_result;
		if (evalFunction) {
			evaluation_result = await evalFunction(page);
		}

		const html = await page.content();

		if (!keepBrowserOpen) {
			await stealth_browser.close();
			page = null;
		}

		return {
			success: true,
			strategy,
			html,
			error: null,
			evaluation_result,
			status,
			page: keepBrowserOpen ? page : undefined,
		} as StrategyResponse;
	} catch (error) {
		if (!keepBrowserOpen && stealth_browser) {
			await stealth_browser.close();
		}
		return {
			success: false,
			strategy,
			html: null,
			error,
			status: null,
			page: keepBrowserOpen ? page : undefined,
		} as StrategyResponse;
	}
}

//todo - add a strategy that uses a proxy with puppeteer
// export async function fetchWithStealthPuppeteerWithProxy(url: string): Promise<StrategyResponse> {
