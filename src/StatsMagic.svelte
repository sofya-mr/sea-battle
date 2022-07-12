<script>

import { createEventDispatcher } from "svelte";
const dispatch = createEventDispatcher();

    export let sunkShips = 0;
	export let damagedCells = 0;
	export let shipsLeft = 0;
	export let attempts = 0;
	export let powerLevel=0;
	export let ships;

	function activateUnicorn() {
		dispatch('activateUnicorn');
	}

	function restart() {
		dispatch('restart');
	}

</script>

<div class="bottom">
	<div class="statsContainer">
		<div class="stats">
			<!-- <header> Stats:</header> -->
			Number of ships: {ships.length} <br />
			Attempts: {attempts} <br />
			Cells damage: {damagedCells} <br />
			Sunk ships: {sunkShips} <br />
			Ships left: {shipsLeft} <br />
		</div>
	</div>

{#if sunkShips!==ships.length}
	<div>
		<div>The button will be activated when you gain enough power:</div>

		<div class="scaleContainer">
			<button class="magicButton" on:click={activateUnicorn} disabled={powerLevel<5}>
				Let magic unicorn help</button>
			<div class="scale closer{powerLevel <= 5? powerLevel:5}" />
		</div>
	</div>
{:else}

<div class=scaleContainer>
	<h2>You are the winner!</h2>
	<button class='resettingButton' on:click={restart} >
		RESTART GAME
	</button>
</div>

{/if}
</div>

<style>
	h2{
		margin-top:5px;
		margin-bottom:16px;
	}

	.statsContainer {
		padding: 0 20px;
	}

	.stats {
		white-space: nowrap;
	}

	.magicButton {
		width: 100%;
		height: 40px;
		border-radius: 5px;
		background-color: transparent;
	}

	.resettingButton {
		width: 100%;
		height: 40px;
		border-radius: 5px;
		background-color:aqua;
	}

	.bottom {
		display: flex;
		width: 480px;
		margin-top: 5px;
	}

	.scale {
		position: absolute;
		z-index: -1;
		top: 0;
		left: 0;
		width: 5%;
		height: 40px;
		background-color:rgb(128, 248, 124);
		border-radius: 5px;

		/* transition: background-color 0.5s; */
		transition: width 1s;
	}

	.scaleContainer {
		margin-top: 5px;
		position: relative;
		text-align: center;
   		width: 100%;
	}

	.closer1 {
		background-color:rgb(128, 248, 124);;
		width: 20%;
	}

	.closer2 {
		width: 40%;
		background-color: rgb(117, 251, 139);
	}

	.closer3 {
		width: 60%;
		background-color: rgb(173, 251, 117);
	}

	.closer4 {
		width: 80%;
		background-color: rgb(240, 251, 117);
	}

	.closer5 {
		width: 100%;
		background-color: rgb(250, 255, 111);
	}
</style>