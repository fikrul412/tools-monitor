<script lang="ts">
	import { getToolLogs, updateToolLogStatus } from '$lib/api/tools';
	import type { ToolLog } from '$lib/types';
	import ToolLogTable from '$lib/components/ToolLogTable.svelte';

	let logs = $state<ToolLog[]>([]);
	let isLoading = $state(true);
	let errorMessage = $state<string | null>(null);
	let updatingId = $state<number | string | null>(null);

	async function fetchLogs() {
		isLoading = true;
		errorMessage = null;

		try {
			logs = await getToolLogs();
			console.log('API Response (Tool Logs):', logs);
		} catch (err) {
			console.error('API Error (fetchLogs):', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to fetch tool logs.';
		} finally {
			isLoading = false;
		}
	}

	async function handleStatusChange(logId: number | string, event: Event) {
		const target = event.target as HTMLSelectElement;
		const newStatus = target.value;

		updatingId = logId;
		try {
			await updateToolLogStatus(logId, newStatus);
			logs = logs.map((log) => (log.id === logId ? { ...log, status: newStatus } : log));
		} catch (err) {
			console.error('API Error (updateStatus):', err);
			alert(err instanceof Error ? err.message : 'Failed to update status.');
			logs = [...logs];
		} finally {
			updatingId = null;
		}
	}

	$effect(() => {
		fetchLogs();
	});
</script>

<div class="dashboard-container">
	<header class="header">
		<h1>Tool Activity Logs</h1>
		<p>Audit history and tool activity records.</p>
	</header>

	{#if isLoading}
		<div class="state-container">
			<p>Loading log entries...</p>
		</div>
	{:else if errorMessage}
		<div class="state-container error">
			<p>{errorMessage}</p>
			<button class="retry-btn" onclick={fetchLogs}>Retry</button>
		</div>
	{:else}
		<div class="table-wrapper">
			<ToolLogTable {logs}>
				{#snippet statusActions(log)}
					<div class="status-actions">
						<select
							class="status-select status-{log.status}"
							value={log.status}
							disabled={updatingId === log.id}
							onchange={(e) => handleStatusChange(log.id, e)}
						>
							<option value="scheduled">Scheduled</option>
							<option value="completed">Completed</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
				{/snippet}
			</ToolLogTable>
		</div>
	{/if}
</div>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	.dashboard-container {
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}

	@media (min-width: 640px) {
		.dashboard-container {
			padding: 1.5rem;
		}
	}

	.header {
		margin-bottom: 1.25rem;
	}

	@media (min-width: 640px) {
		.header {
			margin-bottom: 1.5rem;
		}
	}

	.header h1 {
		margin: 0 0 0.25rem 0;
		color: #1a1a2e;
		font-size: 1.5rem;
	}

	@media (min-width: 640px) {
		.header h1 {
			font-size: 1.875rem;
		}
	}

	.header p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	@media (min-width: 640px) {
		.header p {
			font-size: 1rem;
		}
	}

	.state-container {
		padding: 2rem 1rem;
		text-align: center;
		background: #ffffff;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		color: #64748b;
		word-break: break-word;
	}

	@media (min-width: 640px) {
		.state-container {
			padding: 3rem;
		}
	}

	.state-container.error {
		color: #ef4444;
	}

	.retry-btn {
		margin-top: 0.75rem;
		padding: 0.625rem 1.25rem;
		background-color: #2563eb;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 500;
		min-height: 44px;
		transition: background-color 0.15s ease-in-out;
	}

	.retry-btn:hover {
		background-color: #1d4ed8;
	}

	.table-wrapper {
		width: 100%;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.status-actions {
		display: flex;
		align-items: center;
	}

	.status-select {
		padding: 0.35rem 0.6rem;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 4px;
		border: 1px solid #cbd5e1;
		cursor: pointer;
		min-height: 32px;
		transition: all 0.15s ease-in-out;
	}

	.status-select.status-scheduled {
		background-color: #eff6ff;
		color: #1d4ed8;
		border-color: #bfdbfe;
	}

	.status-select.status-completed {
		background-color: #f0fdf4;
		color: #15803d;
		border-color: #bbf7d0;
	}

	.status-select.status-cancelled {
		background-color: #fef2f2;
		color: #b91c1c;
		border-color: #fecaca;
	}

	.status-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>