<script lang="ts">
	import { TOOL_STATUS_MAP, type Tool } from '$lib/types';

	let { tools = [] }: { tools: Tool[] } = $props();
</script>

<div class="table-card">
	<table>
		<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#each tools as tool (tool.id)}
				<tr>
					<td class="id-col">#{tool.id}</td>
					<td class="name-col">{tool.name}</td>
					<td>
						<span class="status-badge status-{tool.status}">
							{TOOL_STATUS_MAP[tool.status] ?? `Status ${tool.status}`}
						</span>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="3" class="empty-cell">No tools available.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-card {
		background: #ffffff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		overflow: hidden;
		border: 1px solid #e2e8f0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	th, td {
		padding: 1rem;
		border-bottom: 1px solid #edf2f7;
	}

	th {
		background-color: #f8fafc;
		font-weight: 600;
		color: #475569;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.id-col {
		font-weight: 600;
		color: #64748b;
		width: 80px;
	}

	.name-col {
		font-weight: 500;
		color: #1e293b;
	}

	/* Status Badge Styles */
	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.status-badge.status-1 {
		background-color: #dcfce7;
		color: #15803d;
	}

	.status-badge.status-2 {
		background-color: #fef3c7;
		color: #b45309;
	}

	.status-badge.status-3 {
		background-color: #fee2e2;
		color: #b91c1c;
	}

	.empty-cell {
		text-align: center;
		color: #94a3b8;
		padding: 2rem;
	}
</style>