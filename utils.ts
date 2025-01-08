/**
 * Custom error class for URL formatting errors
 */
export class URLFormatError extends Error {
	constructor(message: string, public readonly originalUrl: string) {
		super(message);
		this.name = "URLFormatError";
	}
}

/**
 * Configuration options for URL formatting
 */
export interface URLFormatOptions {
	defaultProtocol?: "https" | "http";
	strictMode?: boolean;
	allowedProtocols?: string[];
}

/**
 * Formats a string into a valid URL for Puppeteer
 * @param urlString - The input string to convert to a URL
 * @param options - Configuration options for URL formatting
 * @returns A properly formatted URL string
 * @throws URLFormatError if the string cannot be converted to a valid URL
 */
export function formatUrl(urlString: string, options: URLFormatOptions = {}): string {
	// Default options
	const { defaultProtocol = "https", strictMode = true, allowedProtocols = ["http:", "https:", "ftp:", "ws:", "wss:"] } = options;

	// Input validation
	if (!urlString) {
		throw new URLFormatError("URL string cannot be empty", urlString);
	}

	// Check for potentially dangerous patterns
	const dangerousPatterns = ["javascript:", "data:", "vbscript:", "file:"];

	if (dangerousPatterns.some((pattern) => urlString.toLowerCase().includes(pattern))) {
		throw new URLFormatError("URL contains potentially dangerous protocol", urlString);
	}

	try {
		// First attempt: Check if it's already a valid URL
		const urlObj = new URL(urlString);

		// Validate protocol
		if (!allowedProtocols.includes(urlObj.protocol)) {
			throw new URLFormatError(`Protocol "${urlObj.protocol}" is not allowed`, urlString);
		}

		return urlObj.toString();
	} catch (error) {
		if (error instanceof URLFormatError) {
			throw error;
		}

		// If not valid, try to fix it
		let formattedUrl = urlString
			.trim()
			// Replace multiple spaces with single space
			.replace(/\s+/g, " ")
			// Remove spaces around dots and slashes
			.replace(/\s*([./])\s*/g, "$1")
			// Convert Unicode quotes to standard quotes
			.replace(/[\u2018\u2019\u201C\u201D]/g, '"')
			// Remove unsafe characters (expanded list)
			.replace(/[<>{}|\\^`[\]'";]/g, "")
			// Remove control characters
			.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

		// Handle common typos in protocol
		formattedUrl = formattedUrl
			.replace(/^(https?)(:|;)\/+/i, "$1://")
			.replace(/^(https?)\/+/i, "$1://")
			.replace(/^:?\/+/i, `${defaultProtocol}://`);

		// Add default protocol if no protocol is specified
		if (!formattedUrl.match(/^[a-zA-Z]+:\/\//)) {
			formattedUrl = `${defaultProtocol}://` + formattedUrl;
		}

		// Remove multiple forward slashes (except after protocol)
		formattedUrl = formattedUrl.replace(/([^:]\/)\/+/g, "$1");

		// Remove trailing slashes from the domain portion
		formattedUrl = formattedUrl.replace(/^(https?:\/\/[^/]+)\/+$/, "$1");

		try {
			const finalUrl = new URL(formattedUrl);

			// Final protocol validation
			if (!allowedProtocols.includes(finalUrl.protocol)) {
				throw new URLFormatError(`Protocol "${finalUrl.protocol}" is not allowed`, urlString);
			}

			// Additional strict mode validations
			if (strictMode) {
				// Ensure hostname has at least one dot and no consecutive dots
				if (!finalUrl.hostname.includes(".") || finalUrl.hostname.includes("..")) {
					throw new URLFormatError("Invalid hostname format", urlString);
				}

				// Check for common typos in hostname
				if (finalUrl.hostname.startsWith(".") || finalUrl.hostname.endsWith(".")) {
					throw new URLFormatError("Hostname cannot start or end with a dot", urlString);
				}
			}

			return finalUrl.toString();
		} catch (error) {
			if (error instanceof URLFormatError) {
				throw error;
			}
			throw new URLFormatError(`Unable to format "${urlString}" into a valid URL`, urlString);
		}
	}
}
