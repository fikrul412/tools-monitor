export type ToolStatus = 1 | 2 | 3;

export const TOOL_STATUS_MAP: Record<ToolStatus, string> = {
	1: 'Available',
	2: 'Being Used',
	3: 'Maintenance'
} as const;

export type ToolLogStatus =
	| 'completed'
	| 'scheduled'
	| 'cancelled'
	| 'pending'
	| 'on_progress';

export interface Tool {
	id: string;
	name: string;
	category: string;
	status: string;
}

export interface ToolLog {
	id?: string;
	username: string;
	tool_id: string;
	start_date: string;
	end_date: string;
	status: string;
}

export interface CheckoutPayload {
	username: string;
	tool_id: string;
	start_date: string;
	end_date: string;
}