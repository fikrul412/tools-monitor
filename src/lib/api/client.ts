import type { ApiResponse } from '$lib/types';

const GAS_ENDPOINT =
	'https://script.google.com/macros/s/AKfycbwxxe-_yhaHfw8734Cn623PlpUiCzY0lesWNaNrUo6ZRwlunM91-YgODrqTYs6GN0anxw/exec';

async function request<T>(
	action: string,
	params: Record<string, unknown> = {},
	payload?: unknown
): Promise<T> {
	const url = new URL(GAS_ENDPOINT);
	url.searchParams.set('action', action);

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			url.searchParams.set(key, String(value));
		}
	}

	const config: RequestInit = {
		method: payload === undefined ? 'GET' : 'POST'
	};

	if (payload !== undefined) {
		config.body = JSON.stringify(payload);
		config.headers = {
			'Content-Type': 'text/plain;charset=utf-8'
		};
	}

	const response = await fetch(url.toString(), config);

	if (!response.ok) {
		throw new Error(`HTTP Error: ${response.status}`);
	}

	const result: ApiResponse<T> = await response.json();

	if (!result.success) {
		const message = result.errors?.length
			? result.errors.join(', ')
			: `Failed to execute action: ${action}`;

		throw new Error(message);
	}

	return result.data;
}

export const api = {
	get: <T>(action: string, params: Record<string, unknown> = {}) =>
		request<T>(action, params),

	post: <T>(
		action: string,
		payload?: unknown,
		params: Record<string, unknown> = {}
	) => request<T>(action, params, payload)
};