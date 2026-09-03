<script lang="ts">
	import type { ToolLog } from '$lib/types';
	import type { Snippet } from 'svelte';

	interface Props {
		logs: ToolLog[];
		statusActions?: Snippet<[ToolLog]>;
	}

	let { logs, statusActions }: Props = $props();

	function getBadgeClass(status: string) {
		switch (status.toLowerCase()) {
			case 'completed':
				return 'badge-completed';
			case 'cancelled':
				return 'badge-cancelled';
			default:
				return 'badge-scheduled';
		}
	}
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th>ID</th>
				<th>User</th>
				<th>Tool ID</th>
				<th>Start Time</th>
				<th>End Time</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#if logs.length === 0}
				<tr>
					<td colspan="6" class="empty-cell">No log entries found.</td>
				</tr>
			{:else}
				{#each logs as log (log.id)}
					<tr>
						<td>#{log.id}</td>
						<td class="user-cell">{log.username}</td>
						<td>#{log.tool_id}</td>
						<td>{log.start_date}</td>
						<td>{log.end_date}</td>
						<td class="status-cell">
							{#if statusActions}
								{@render statusActions(log)}
							{:else}
								<span class="badge {getBadgeClass(log.status)}">
									{log.status}
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.table-container {
		width: 100%;
		overflow-x: auto;
		background: #ffffff;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.9rem;
	}

	th,
	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e2e8f0;
		white-space: nowrap;
	}

	th {
		background-color: #f8fafc;
		font-weight: 600;
		color: #475569;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.user-cell {
		font-weight: 500;
		color: #0f172a;
	}

	.status-cell {
		min-width: 220px;
	}

	.empty-cell {
		text-align: center;
		color: #94a3b8;
		padding: 2rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.badge-scheduled {
		background-color: #dbeafe;
		color: #1e40af;
	}

	.badge-completed {
		background-color: #dcfce7;
		color: #15803d;
	}

	.badge-cancelled {
		background-color: #fee2e2;
		color: #b91c1c;
	}
</style>