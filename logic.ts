import { HTMLElement, parse } from "node-html-parser";
import {
	fetchWithAxios,
	fetchWithNodeFetch,
	fetchWithStealthPuppeteer,
	type FetchStrategy,
	type OnPageEvaluationFunction,
	type StrategyResponse,
} from "./strategies";

export type NodeHTMLElement = HTMLElement;

export type HtmlResponse = {
	success: boolean;
	html: string | null;
	root?: NodeHTMLElement;
	evaluation_result?: any;
	strategy: FetchStrategy;
	error?: Error | null | string | unknown;
	status?: number | string | null;
	page?: any; // Add this line
};

export type FetchStrategyFunction = (url: string, evalFunction?: OnPageEvaluationFunction, keepBrowserOpen?: boolean) => Promise<StrategyResponse>;

export default async function getHtml(
	url: string,
	options?: {
		set: "cheap" | "js" | null;
		evalFunction?: OnPageEvaluationFunction;
		keepBrowserOpen?: boolean; // Add this line
	}
): Promise<HtmlResponse> {
	let { set, evalFunction, keepBrowserOpen } = options || { set: null, evalFunction: null, keepBrowserOpen: false };

	let strategy_set: FetchStrategyFunction[] = [fetchWithAxios, fetchWithNodeFetch, fetchWithStealthPuppeteer];
	if (evalFunction) set = "js";
	if (set === "cheap") strategy_set = [fetchWithAxios, fetchWithNodeFetch];
	if (set === "js") strategy_set = [fetchWithStealthPuppeteer];

	for (const strategyFunction of strategy_set) {
		const { success, html, strategy, evaluation_result, error, status, page }: StrategyResponse = evalFunction
			? await strategyFunction(url, evalFunction, keepBrowserOpen)
			: await strategyFunction(url, undefined, keepBrowserOpen);
		if (error) console.error(error);
		console.log(`getHTML: [${strategy.name}] [${status}] [${success}] [${html?.length}] [${url}]`);

		if (!success || !html) continue;

		const root: NodeHTMLElement = parse(html);

		return { success, html, root, strategy, evaluation_result, error, status, page: keepBrowserOpen ? page : undefined };
	}
	return { success: false, html: null, strategy: { name: "unknown", cost: 0 }, page: undefined };
}
