<script>
	import Field from "./Field.svelte";
	import StatsMagic from "./StatsMagic.svelte";
	import { newShips, directions } from "./helpers";

	let sunkShips = 0;
	let damagedCells = 0;
	let shipsLeft = 0;
	let attempts = 0;
	let text = "The Empire set it's ships in your sea. Find and sink them!";
	let textOption = "";
	let unicornState = false;
	let powerLevel = 0;

	const fieldSize = 6;
	let cells = [];

	let ships;

	// getting ships set//
	let occupied;

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

		ships[i].coords.forEach(ind => (cells[ind].ship = ships[i])); //добавляем определенным клеткам (инд) проперти шипс, присваиваем туда
		//аналогичный объект из массива шипс (то есть целый корабль)
		return true;
	}
	const validPos = function (point) {
		// {x, y}
		const x = point.x;
		const y = point.y;

		if (x > fieldSize || x < 0 || y > fieldSize || y < 0) {
			return false;
		}
		return true;
	};

	restart();

	function placeShips() {
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

			occupied.push(...ships[i].coords);

			ships[i].coords.forEach(i => {
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
					.map(o => o.x + o.y * fieldSize);

				occupied.push(...validNeigbors);
			});
		}
	}
	// game actions

	function checkCell(i) {
		attempts += 1;
		text = "Missed...";

		if (cells[i].ship) {
			if (!cells[i].checked) {
				cells[i].ship.cellDamage += 1;
				text = "Hit!";
				damagedCells += 1;
				powerLevel += 1;
				if (cells[i].ship.cellDamage === cells[i].ship.shipLength) {
					cells[i].ship.isSunk = true;
					sunkShips += 1;
					shipsLeft = ships.length - sunkShips;
					text = "You sunk a ship!";
				}
			}

			cells = cells;
		}

		cells[i].checked = true;
	}

	//magic

	function magic() {
		unicornState = !unicornState;
		setTimeout(() => {
			powerLevel = 0;
		}, 1000);

		setTimeout(() => {
			for (let ship of ships) {
				// ships.forEach((ship) => {
				if (ship.isSunk == false) {
					ship.isSunk = 2;
					sunkShips += 1;
					textOption = shipsLeft == 1 ? "There's" : "There are";
					text = `Magic unicorn sunk a ship! ${textOption} only ${shipsLeft} left.`;
					shipsLeft = ships.length - sunkShips;
					ship.damagedCells = ship.shipLength;
					damagedCells += ship.shipLength;
					for (let i = 0; i < ship.coords.length; i++) {
						cells[ship.coords[i]].checked = true;
					}

					break;
				}
			}
		}, 2000);
	}

	$: if (sunkShips == ships.length) {
		text = "Congratulations! You won. All the ship's are sunk.";
	}

	function restart() {
		sunkShips = 0;
		damagedCells = 0;
		attempts = 0;
		text = "The Empire set it's ships in your sea. Find and sink them!";
		unicornState = false;
		powerLevel = 0;

		cells = [];
		for (let counter = 0; counter < fieldSize * fieldSize; counter++) {
			cells.push({ ship: false, checked: false });
		}

		occupied = [];
		ships = newShips();
		placeShips();
	}

</script>

<div>
	<img
		src="./unicorn.png"
		alt="Unicorn Gif"
		class="image"
		class:fly={!unicornState} />
</div>

<p>{text}</p>

<Field on:fire={ev => checkCell(ev.detail)} {fieldSize} {cells} />
<StatsMagic
	on:activateUnicorn={magic}
	on:restart={restart}
	{sunkShips}
	{damagedCells}
	{shipsLeft}
	{attempts}
	{powerLevel}
	{ships} />

<style>
	p {
		margin: 0px;
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

</style>
