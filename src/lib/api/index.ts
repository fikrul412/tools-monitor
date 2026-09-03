import { api } from './client';
import type {
	Tool,
	ToolFilter,
	UpdateToolPayload
} from '$lib/types';

export async function getTools(
	filter: ToolFilter = {}
): Promise<Tool[]> {
	return api.get<Tool[]>('getTools', filter);
}

export async function getTool(
	id: number
): Promise<Tool | undefined> {
	return api.get<Tool | undefined>('getTool', { id });
}

export async function setTool(
	id: number,
	partialTool: Partial<Omit<Tool, 'id'>>
): Promise<void> {
	const payload: UpdateToolPayload = {
		id,
		...partialTool
	};

	await api.post<void>('setTool', payload);
}