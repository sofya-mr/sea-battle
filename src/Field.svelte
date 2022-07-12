<script>
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	export let fieldSize;
	export let cells;


	function sendEvent(i) {
		dispatch("fire", i);
	}
</script>

<div class="container" style="width:{fieldSize * 80}px">
	{#each cells as cell, i}
		<button
			on:click={() => sendEvent(i)}
			class:checked={cell.checked}
			class:damaged={cell.ship && cell.checked}
			class:sunk={cell.ship && cell.ship.isSunk}
			class:sunkByMagic={cell.ship && cell.ship.isSunk == 2}
		/>
	{/each}
</div>

<style>

		button {
		margin-top: 0;
		margin-bottom: 0;
		padding: 3px;
		width: 80px;
		flex-shrink: 0;
		height: 80px;
		transition: background-color 0.5s;
		cursor: pointer;
	}

	.container {
		/* width:80%; */
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}

	.sunkByMagic {
		background-color: #222;
		animation-name: color;
		animation-duration: 1s;
		animation-iteration-count: 0.3;
	}

	.checked {
		background-color: rgb(226, 226, 226);
	}

	.damaged {
		background-color: orange;
	}

	.sunk {
		background-color: brown;
	}

	@keyframes color {
		0% {
			background-color: rgb(234, 250, 4);
		}
		20% {
			background-color: #f44242;
		}
		40% {
			background-color: rgb(24, 16, 246);
		}
		60% {
			background-color: #f442dc;
		}
		80% {
			background-color: rgb(212, 246, 16);
		}
		100% {
			background-color: #f44242;
		}
	}
</style>
