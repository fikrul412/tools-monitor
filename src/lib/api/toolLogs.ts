import { api } from './client';
import type { ToolLog } from '$lib/types';
import type { ToolLogFilter, CreateToolLogPayload, UpdateToolLogPayload } from '$lib/types';

export async function getToolLogs(filter: ToolLogFilter = {}): Promise<ToolLog[]> {
	return (await api.get<ToolLog[]>('getToolLogs', filter)) || [];
}

export async function getToolLog(id: number): Promise<ToolLog | undefined> {
	return await api.get<ToolLog>('getToolLog', { id });
}

export async function postToolLog(logData: CreateToolLogPayload): Promise<void> {
	await api.post<void>('postToolLog', logData);
}

export async function setToolLog(
	id: number,
	partialToolLog: Partial<Omit<ToolLog, 'id'>>
): Promise<void> {
	const payload: UpdateToolLogPayload = { id, ...partialToolLog };
	await api.post<void>('setToolLog', payload);
}