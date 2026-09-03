<script lang="ts">
	import { updateToolStatus } from '$lib/api/tools';

	let loading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	// Sample tools array — update statuses as needed
	let tools = $state([
		{ id: 1, name: '3D Printer - Ender 3 V3 SE', status: '1' },
		{ id: 2, name: '3D Printer - Ender 3', status: '1' },
		{ id: 3, name: '3D Printer - Ender 3 (Aux)', status: '2' }
	]);

	function getStatusLabel(status: string) {
		switch (status) {
			case '1': return { text: 'Available', class: 'badge-status-1' };
			case '2': return { text: 'In Use', class: 'badge-status-2' };
			case '3': return { text: 'Maintenance', class: 'badge-status-3' };
			default: return { text: 'Unknown', class: '' };
		}
	}

	async function handleStatusChange(toolId: number, newStatus: string) {
		loading = true;
		errorMessage = '';
		successMessage = '';

		const now = new Date().toLocaleString('en-GB'); // Current timestamp string

		try {
			await updateToolStatus(toolId, newStatus);

			// Update status in local UI state
			tools = tools.map((t) => (t.id === toolId ? { ...t, status: newStatus } : t));

			successMessage = `Tool #${toolId} updated to status ${newStatus} at ${now}`;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to update status.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="checkout-container">
	<div class="header">
		<h1>Tool Status Manager</h1>
		<p>Click a button to change a tool's status immediately.</p>
	</div>

	{#if successMessage}
		<div class="alert alert-success">{successMessage}</div>
	{/if}

	{#if errorMessage}
		<div class="alert alert-error">{errorMessage}</div>
	{/if}

	<div class="tools-grid">
		{#each tools as tool}
			{@const status = getStatusLabel(tool.status)}
			<div class="tool-card">
				<div class="tool-header">
					<h3>{tool.name}</h3>
					<span class="tool-id">ID: #{tool.id}</span>
				</div>

				<div class="status-indicator">
					<span class="status-label">Status:</span>
					<span class="badge {status.class}">{status.text}</span>
				</div>

				<div class="status-actions">
					<button
						class="btn btn-available"
						disabled={loading || tool.status === '1'}
						onclick={() => handleStatusChange(tool.id, '1')}
					>
						Available
					</button>
					<button
						class="btn btn-in-use"
						disabled={loading || tool.status === '2'}
						onclick={() => handleStatusChange(tool.id, '2')}
					>
						In Use
					</button>
					<button
						class="btn btn-maint"
						disabled={loading || tool.status === '3'}
						onclick={() => handleStatusChange(tool.id, '3')}
					>
						Maintenance
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.checkout-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 1.5rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.header h1 {
		margin: 0 0 0.25rem 0;
		color: #0f172a;
	}

	.header p {
		margin: 0 0 1.5rem 0;
		color: #64748b;
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}

	.tool-card {
		background: #ffffff;
		border-radius: 8px;
		padding: 1.25rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.tool-header h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1.05rem;
		color: #1e293b;
	}

	.tool-id {
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 600;
	}

	.status-indicator {
		margin: 1rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-label {
		font-size: 0.85rem;
		color: #64748b;
	}

	.badge {
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.badge-status-1 {
		background-color: #dcfce7;
		color: #15803d;
	}

	.badge-status-2 {
		background-color: #fef3c7;
		color: #b45309;
	}

	.badge-status-3 {
		background-color: #fee2e2;
		color: #b91c1c;
	}

	.status-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.btn {
		flex: 1;
		min-width: 80px;
		padding: 0.5rem;
		border-radius: 6px;
		border: none;
		font-weight: 600;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.btn-available {
		background-color: #16a34a;
		color: white;
	}

	.btn-in-use {
		background-color: #2563eb;
		color: white;
	}

	.btn-maint {
		background-color: #f1f5f9;
		color: #475569;
		border: 1px solid #cbd5e1;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.alert {
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.alert-error {
		background-color: #fef2f2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	.alert-success {
		background-color: #f0fdf4;
		color: #166534;
		border: 1px solid #bbf7d0;
	}
</style>