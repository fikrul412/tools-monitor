import { api } from '$lib/api/client';
import type { Tool, ToolLog } from '$lib/types';

// Fetch all tool logs
export async function getToolLogs(params?: Record<string, unknown>): Promise<ToolLog[]> {
	return await api.get<ToolLog[]>('getToolLogs', params);
}

// Fetch a single tool log by ID
export async function getToolLog(id: number | string): Promise<ToolLog> {
	return await api.get<ToolLog>('getToolLog', { id });
}

// Update a log entry's status using 'setToolLog' action
export async function updateToolLogStatus(
	id: number | string,
	status: string
): Promise<ToolLog> {
	return await api.post<ToolLog>('setToolLog', { status }, { id });
}

// Update a tool's status using client.ts
export async function updateToolStatus(
	id: number | string,
	status: string | number
): Promise<Tool> {
	return await api.post<Tool>('setTool', { status: String(status) }, { id });
}

// Create a new checkout reservation log
export async function createToolLog(logData: {
	username: string;
	tool_id: number | string;
	start_date: string;
	end_date: string;
	status?: string;
}): Promise<ToolLog> {
	return await api.post<ToolLog>('postToolLog', {
		...logData,
		tool_id: String(logData.tool_id),
		status: logData.status || 'scheduled'
	});
}

// Complete checkout workflow
export async function checkoutTool(payload: {
	username: string;
	tool_id: number | string;
	start_date: string;
	end_date: string;
}): Promise<{ log: ToolLog; tool: Tool }> {
	const log = await createToolLog(payload);
	const tool = await updateToolStatus(payload.tool_id, '2');

	return { log, tool };
}