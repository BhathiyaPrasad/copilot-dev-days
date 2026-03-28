import type { APIRoute } from 'astro';

export const prerender = false;

// In-memory cache: Map<username, { data: any; timestamp: number }>
const contributionCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour in milliseconds

export const GET: APIRoute = async ({ params }) => {
	const { username } = params;

	// Validate username parameter
	if (!username || typeof username !== 'string' || username.trim() === '') {
		return new Response(
			JSON.stringify({
				error: 'Username is required',
				status: 400,
				timestamp: new Date().toISOString(),
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	// Validate username format (alphanumeric and hyphens only)
	if (!/^[a-zA-Z0-9-]+$/.test(username)) {
		return new Response(
			JSON.stringify({
				error: 'Invalid username format. Username must contain only alphanumeric characters and hyphens.',
				status: 400,
				timestamp: new Date().toISOString(),
			}),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	// Check cache
	const cacheKey = username.toLowerCase();
	const cached = contributionCache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return new Response(JSON.stringify(cached.data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'X-Cache': 'HIT',
			},
		});
	}

	try {
		// Fetch from GitHub's contribution endpoint
		const url = `https://github.com/${username}.contribs`;
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'User-Agent': 'Mona-Mayhem (GitHub Copilot Workshop)',
				Accept: 'application/json',
			},
			// Set a 5-second timeout
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) {
			if (response.status === 404) {
				return new Response(
					JSON.stringify({
						error: `GitHub user '${username}' not found`,
						status: 404,
						timestamp: new Date().toISOString(),
					}),
					{ status: 404, headers: { 'Content-Type': 'application/json' } }
				);
			}

			// Handle other HTTP errors
			return new Response(
				JSON.stringify({
					error: `GitHub API error: ${response.statusText}`,
					status: response.status,
					timestamp: new Date().toISOString(),
				}),
				{ status: response.status, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Parse and cache the response
		const data = await response.json();

		// Store in cache
		contributionCache.set(cacheKey, {
			data,
			timestamp: Date.now(),
		});

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'X-Cache': 'MISS',
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		// Handle timeout
		if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
			return new Response(
				JSON.stringify({
					error: 'Request timeout. GitHub API took too long to respond.',
					status: 408,
					timestamp: new Date().toISOString(),
				}),
				{ status: 408, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Handle network errors
		return new Response(
			JSON.stringify({
				error: `Failed to fetch contribution data: ${errorMessage}`,
				status: 502,
				timestamp: new Date().toISOString(),
			}),
			{ status: 502, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
