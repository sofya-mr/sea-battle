<script>
	let sunkShips = 0;
	let damagedCells = 0;
	let shipsLeft = 0;
	let attempts = 0;
	let text = "Sea battle";
	let unicornState = false;
	let powerLevel=0;




	const fieldSize = 6;
	const cells = [];

	for (let counter = 0; counter < fieldSize * fieldSize; counter++) {
		cells.push({ ship: false, checked: false });
	}
	let ships = [
		{ shipLength: 3, isSunk: false, cellDamage: 0, coords: [] },

		{ shipLength: 2, isSunk: false, cellDamage: 0, coords: [] },

		{ shipLength: 2, isSunk: false, cellDamage: 0, coords: [] },

		{ shipLength: 1, isSunk: false, cellDamage: 0, coords: [] },

		{ shipLength: 1, isSunk: false, cellDamage: 0, coords: [] },
	];

	// getting ships set//
	let occupied = [];

	let directions = [
		{ x: 1, y: 0 }, // right
		{ x: 0, y: 1 }, // bottom
	];

	let watchDog = 0;

	function getCoords(i, obj) {
		watchDog++;
		if (watchDog > 1000) alert("bad things happen");

		let dir = directions[Math.floor(Math.random() * 2)];
		if (
			obj.x * dir.x > fieldSize - ships[i].shipLength ||
			obj.y * dir.y > fieldSize - ships[i].shipLength
		) {
			return false; // если корабль не помещается по ширине или высоте, то прервать выполнение функции
		}

		for (let j = 0; j < ships[i].shipLength; j++) {
			//повторять столько раз, сколько клеток в корабле
			const ind = obj.x + obj.y * fieldSize; // рассчит клетка по координатам, кот пришли как аргумент
			ships[i].coords[j] = ind; // в массив шипс, в соответствующий корабль (объект)
			// в проперти коордс кладется значение соответствующей клетки (номер клетки, что соответствует
			//индексу в массиве целс)
			obj = { x: obj.x + dir.x, y: obj.y + dir.y }; // корабль удлиняется по вертикали или горизонтали

			if (occupied.indexOf(ind) !== -1) {
				// если полученная клетка (инд) присутствует в массиве окупаед
				return false; // прервать выполнение функции
			}
		}

		ships[i].coords.forEach((ind) => (cells[ind].ship = ships[i])); //добавляем определенным клеткам (инд) проперти шипс, присваиваем туда
		//аналогичный объект из массива шипс (то есть целый корабль)
		return true;
	}
	const validPos = function (point) {
		// {x, y}
		const x = point.x;
		const y = point.y;
		//  let y = Math.floor(i / fieldSize);
		//  let x = i % fieldSize;

		//  let dir4= [{ x: 1, y: 0 },
		// { x: 0, y: 1 },

		//  ]

		if (x > fieldSize || x < 0 || y > fieldSize || y < 0) {
			return false;
		}
		return true;
	};

	for (let i = 0; i < ships.length; i++) {
		// for each ship
		let obj = {
			x: Math.floor(Math.random() * fieldSize),
			y: Math.floor(Math.random() * fieldSize),
		};

		if (!getCoords(i, obj)) {
			i--;
			continue;
		}
		console.log(ships[i]);
		occupied.push(...ships[i].coords);

		ships[i].coords.forEach((i) => {
			let y = Math.floor(i / fieldSize);
			let x = i % fieldSize;

			let neighbors = [
				{ x: x + 1, y },
				{ x: x - 1, y },
				{ x, y: y + 1 },
				{ x, y: y - 1 },
				{ x: x + 1, y: y - 1 },
				{ x: x + 1, y: y + 1 },
				{ x: x - 1, y: y + 1 },
				{ x: x - 1, y: y - 1 },
			];

			let validNeigbors = neighbors
				.filter(validPos)
				.map((o) => o.x + o.y * fieldSize);

			occupied.push(...validNeigbors);
		});
	}

	// game actions

	function checkCell(i) {
		attempts += 1;
		text="Missed...";

		if (cells[i].ship) {
			if (!cells[i].checked) {
				cells[i].ship.cellDamage += 1;
				text="Hit!"
				damagedCells += 1;
				powerLevel +=1;
				if (cells[i].ship.cellDamage === cells[i].ship.shipLength) {
					cells[i].ship.isSunk = true;
					sunkShips += 1;
					shipsLeft = ships.length - sunkShips;
					text="You sunk a ship!"
				}
			}

			cells = cells;
		}

		cells[i].checked = true;
		
		
	}

	//magic

	function magic(i) {

		unicornState = !unicornState;
		setTimeout(() => {
			powerLevel=0;
		}, 1000)

		setTimeout(() => {
			for (let ship of ships) {
			// ships.forEach((ship) => {
			if (ship.isSunk == false) {
				ship.isSunk = 2;
				sunkShips+=1;
				text="Magic unicorn sunk a ship!"
				shipsLeft = ships.length - sunkShips;
				ship.damagedCells = ship.shipLength;
				damagedCells+=ship.shipLength;
				for (let i = 0; i < ship.coords.length; i++) {
					cells[ship.coords[i]].checked = true;
				}
				
				break;
			}
		}

		}, 2000)
		
		
	}

$: if (sunkShips==ships.length) {
	text="Congratulations! You won."
	
}

</script>

<div>
	<img
		src="./unicorn.png"
		alt="Unicorn Gif"
		class="image"
		class:fly={!unicornState}
	/>
</div>

<p>{text}</p>
<div class="container" style="width:{fieldSize * 80}px">
	{#each cells as cell, i}
		<button
			on:click={() => checkCell(i)}
			class:checked={cell.checked}
			class:damaged={cell.ship && cell.checked}
			class:sunk={cell.ship && cell.ship.isSunk}
			class:sunkByMagic={cell.ship && cell.ship.isSunk==2}
		/>
	{/each}
</div>
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
			<button class="magicButton" on:click={magic} disabled={powerLevel<5}>
				Let magic unicorn help</button>
			<div class="scale closer{powerLevel <= 5? powerLevel:5}" />
		</div>
	</div>
{:else}

<div class=scaleContainer>
	<h2>You are the winner!</h2>
	<button class='resettingButton' >
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

	p {
		margin: 0px;
	}

	.container {
		/* width:80%; */
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}

	.statsContainer {
		padding: 0 20px;
	}
	.stats {
		white-space: nowrap;
	}

	

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
		background: rgb(250, 60, 60);
		border-radius: 5px;

		/* transition: background-color 0.5s; */
		transition: width 1s;
	}

	.closer1 {
		width: 20%;
	}

	.closer2 {
		width: 40%;
		background-color: rgb(97, 251, 102);
	}

	.closer3 {
		width: 60%;
		background-color: rgb(0, 255, 247);
	}

	.closer4 {
		width: 80%;
		background-color: rgb(117, 251, 217);
	}

	.closer5 {
		width: 100%;
		background-color: rgb(220, 248, 97);
	}


	.sunkByMagic {
		background-color: #222;
  animation-name: color;
  animation-duration: 1s;
  animation-iteration-count: 0.3;
}

@keyframes color {
  0% {
    background-color: #222;
  }
  20% {
    background-color: #4285f4;
  }
  40% {
    background-color: #222;
  }
  60% {
    background-color: #4285f4;
  } 
  80% {
    background-color: #222;
  }
  100% {
    background-color: #4285f4;
  }
}



	.image {
		transition: left 3s;
		position: absolute;
		left: -1000px;
		top: 100px;
	}

	.fly {
		left: 2000px;
	}

	.scaleContainer {
		margin-top: 5px;
		position: relative;
		text-align: center;
   		width: 100%;
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
</style>
