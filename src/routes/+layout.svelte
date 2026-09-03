<script>
	let { children } = $props();
	let isExpanded = $state(true);

	const menuItems = [
		{ name: 'Tools Status', path: '/', icon: '⚙️' },
		{ name: 'Tools Schedule', path: '/tool-logs', icon: '📈' },
		{ name: 'Add Schedule', path: '/schedule', icon: '📅' },
		{ name: 'Check In / Out', path: '/checkout', icon: '🔄' }
	];

	function toggleSidebar() {
		isExpanded = !isExpanded;
	}

	function closeSidebar() {
		isExpanded = false;
	}
</script>

<div class="layout">
	<!-- Overlay Backdrop when open -->
	{#if isExpanded}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="backdrop" onclick={closeSidebar}></div>
	{/if}

	<!-- Sidebar (Overlays main content) -->
	<aside class="sidebar" class:collapsed={!isExpanded}>
		<div class="sidebar-header">
			{#if isExpanded}
				<span class="logo">Tool Monitoring</span>
			{/if}
			<button class="toggle-btn" onclick={toggleSidebar} aria-label="Toggle Sidebar">
				{isExpanded ? '◀' : '▶'}
			</button>
		</div>

		<nav class="menu">
			<ul>
				{#each menuItems as item}
					<li>
						<a href={item.path} class="menu-item" >
							<span class="icon">{item.icon}</span>
							{#if isExpanded}
								<span class="label">{item.name}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>

	<!-- Main Content Area -->
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.layout {
		position: relative;
		height: 100vh;
		overflow: hidden;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 10;
	}

	.sidebar {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 240px;
		background-color: #1e1e2d;
		color: #ffffff;
		z-index: 20;
		transition: width 0.3s ease;
		display: flex;
		flex-direction: column;
		white-space: nowrap;
		box-shadow: 4px 0 10px rgba(0, 0, 0, 0.2);
	}

	.sidebar.collapsed {
		width: 60px;
		box-shadow: none;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid #2d2d3f;
	}

	.logo {
		font-weight: bold;
		font-size: 1.1rem;
	}

	.toggle-btn {
		background: transparent;
		border: none;
		color: #ffffff;
		cursor: pointer;
		font-size: 1rem;
		padding: 0.2rem 0.5rem;
		margin-left: auto;
	}

	.menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 0.8rem 1rem;
		color: #a2a3b7;
		text-decoration: none;
		gap: 1rem;
		transition: background 0.2s, color 0.2s;
	}

	.menu-item:hover {
		background-color: #2b2b40;
		color: #ffffff;
	}

	.icon {
		font-size: 1.2rem;
		min-width: 24px;
		text-align: center;
	}

	.main-content {
		height: 100%;
		box-sizing: border-box;
		padding: 2rem 2rem 2rem 80px; 
		background-color: #f5f5f9;
		overflow-y: auto;
	}
</style>