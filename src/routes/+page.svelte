<script lang="ts">
	import { getTools } from '$lib/api';
	import type { Tool } from '$lib/types';
	import ToolTable from '$lib/components/ToolTable.svelte';

	let tools = $state<Tool[]>([]);
	let isLoading = $state(true);
	let errorMessage = $state<string | null>(null);

	async function fetchTools() {
		isLoading = true;
		errorMessage = null;

		try {
			const response = await getTools();

			console.log('API Response (Tools):', response);

			tools = response;
		} catch (err) {
			console.error('API Error (fetchTools):', err);

			errorMessage =
				err instanceof Error
					? err.message
					: 'Failed to fetch tools.';
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		fetchTools();
	});
</script>

<div class="dashboard-container">
	<header>
		<h1>Tools Monitor</h1>
		<p>Current status of all tools.</p>
	</header>

	{#if isLoading}
		<div class="state-container">
			<p>Loading tools...</p>
		</div>
	{:else if errorMessage}
		<div class="state-container error">
			<p>{errorMessage}</p>
			<button onclick={fetchTools}>Retry</button>
		</div>
	{:else}
		<ToolTable {tools} />
	{/if}
</div>

<style>
	.dashboard-container {
		max-width: 900px;
		margin: 0 auto;
	}

	header {
		margin-bottom: 1.5rem;
	}

	h1 {
		margin: 0 0 0.25rem;
		color: #1a1a2e;
	}

	header p {
		margin: 0;
		color: #666;
	}

	.state-container {
		padding: 3rem;
		text-align: center;
		background: #ffffff;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		color: #64748b;
	}

	.state-container.error {
		color: #ef4444;
	}

	button {
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>