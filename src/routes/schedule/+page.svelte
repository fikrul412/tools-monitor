<script lang="ts">
	import { getTools } from '$lib/api';
	import { postToolLog } from '$lib/api/toolLogs';
	import type { Tool } from '$lib/types';
	import { goto } from '$app/navigation';

	let tools = $state<Tool[]>([]);
	let isLoadingTools = $state(true);
	let isSubmitting = $state(false);

	let username = $state('');
	let toolId = $state<number | ''>('');
	let startDate = $state('');
	let startTime = $state('');
	let endDate = $state('');
	let endTime = $state('');

	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	$effect(() => {
		async function loadTools() {
			try {
				tools = await getTools();
			} catch (err) {
				errorMessage = 'Failed to load available tools.';
			} finally {
				isLoadingTools = false;
			}
		}
		loadTools();
	});

	function formatDateTimeString(dateStr: string, timeStr: string): string {
		// Converts YYYY-MM-DD and HH:mm to DD/MM/YYYY HH:mm:ss for backend
		const [year, month, day] = dateStr.split('-');
		return `${day}/${month}/${year} ${timeStr}:00`;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = null;
		successMessage = null;

		if (!username || !toolId || !startDate || !startTime || !endDate || !endTime) {
			errorMessage = 'Please fill in all fields.';
			return;
		}

		const startFormatted = formatDateTimeString(startDate, startTime);
		const endFormatted = formatDateTimeString(endDate, endTime);

		isSubmitting = true;

		try {
			await postToolLog({
				username,
				tool_id: String(toolId),
				start_date: startFormatted,
				end_date: endFormatted,
				status: 'scheduled'
			});

			successMessage = 'Schedule added successfully!';
			setTimeout(() => {
				goto('/tool-logs');
			}, 1200);
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to schedule tool.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="schedule-container">
	<header class="header">
		<h1>Schedule Tool Usage</h1>
		<p>Book a time slot for a tool.</p>
	</header>

	<div class="form-card">
		{#if errorMessage}
			<div class="alert alert-error">{errorMessage}</div>
		{/if}

		{#if successMessage}
			<div class="alert alert-success">{successMessage}</div>
		{/if}

		<form onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="username">Username</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					placeholder="Enter your name"
					required
				/>
			</div>

			<div class="form-group">
				<label for="tool">Select Tool</label>
				{#if isLoadingTools}
					<select disabled><option>Loading tools...</option></select>
				{:else}
					<select id="tool" bind:value={toolId} required>
						<option value="">-- Choose a Tool --</option>
						{#each tools as tool (tool.id)}
							<option value={tool.id}>#{tool.id} - {tool.name}</option>
						{/each}
					</select>
				{/if}
			</div>

			<div class="grid-2">
				<div class="form-group">
					<label for="start-date">Start Date</label>
					<input id="start-date" type="date" bind:value={startDate} required />
				</div>
				<div class="form-group">
					<label for="start-time">Start Time</label>
					<input id="start-time" type="time" bind:value={startTime} required />
				</div>
			</div>

			<div class="grid-2">
				<div class="form-group">
					<label for="end-date">End Date</label>
					<input id="end-date" type="date" bind:value={endDate} required />
				</div>
				<div class="form-group">
					<label for="end-time">End Time</label>
					<input id="end-time" type="time" bind:value={endTime} required />
				</div>
			</div>

			<button type="submit" class="submit-btn" disabled={isSubmitting}>
				{isSubmitting ? 'Checking Availability...' : 'Book Schedule'}
			</button>
		</form>
	</div>
</div>

<style>
	.schedule-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.header h1 {
		margin: 0 0 0.25rem 0;
		color: #1a1a2e;
	}

	.header p {
		margin: 0 0 1.5rem 0;
		color: #64748b;
	}

	.form-card {
		background: #ffffff;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		margin-bottom: 1.25rem;
	}

	label {
		font-weight: 600;
		font-size: 0.875rem;
		color: #334155;
		margin-bottom: 0.375rem;
	}

	input,
	select {
		padding: 0.625rem;
		border: 1px solid #cbd5e1;
		border-radius: 6px;
		font-size: 0.95rem;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.submit-btn {
		width: 100%;
		padding: 0.75rem;
		background-color: #2563eb;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.submit-btn:disabled {
		background-color: #94a3b8;
		cursor: not-allowed;
	}

	.alert {
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1.25rem;
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