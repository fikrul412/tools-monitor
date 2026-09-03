import type { ToolStatus, ToolLogStatus, Tool, ToolLog } from './tools';

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	errors?: string[];
	logs?: string[];
}

export interface ToolFilter {
	status?: ToolStatus;
	[key: string]: unknown;
}

export interface ToolLogFilter {
	tool_id?: number;
	status?: ToolLogStatus;
	username?: string;
	[key: string]: unknown;
}

export type CreateToolLogPayload = Omit<ToolLog, 'id'>;

export type UpdateToolPayload = Partial<Omit<Tool, 'id'>> & { id: number };

export type UpdateToolLogPayload = Partial<Omit<ToolLog, 'id'>> & { id: number };