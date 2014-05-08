;(function() {
	var Bots = [
		{"Maps":[{"Description":"","HeadX":3,"HeadY":3,"Lines":[{"X":3,"Y":2,"Line":"Z0"}]},{"Description":"","HeadX":0,"HeadY":6,"Lines":[{"X":0,"Y":0,"Line":"Z5Z5Z5Z5Z5Z5--Z5Z5Z5Z5Z5----Z5Z5Z5Z5------Z5Z5Z5--------Z5Z5"}]},{"Description":"","HeadX":0,"HeadY":6,"Lines":[{"X":4,"Y":1,"Line":"Y3----------Y2Z3--------Y1Z2--------Y0Z1----------Z0"}]}],"SnakeId":false,"PlayerId":false,"SnakeName":"Балбес","SnakeType":"B","SkinId":4,"ProgramDescription":"Глупый, но с хорошим аппетитом","Templates":["S","S","S","S"]},

		{"Maps":[{"Description":"","HeadX":3,"HeadY":3,"Lines":[{"X":3,"Y":2,"Line":"Z0"}]},{"Description":"","HeadX":0,"HeadY":6,"Lines":[{"X":4,"Y":1,"Line":"A3----------A2Z3--------A1Z2--------A0Z1----------Z0"}]},{"Description":"","HeadX":0,"HeadY":6,"Lines":[{"X":0,"Y":4,"Line":"Z5Z5Z5----------Z5"}]},{"Description":"","HeadX":0,"HeadY":6,"Lines":[{"X":0,"Y":3,"Line":"Z5Z5Z5Z5"}]},{"Description":"","HeadX":0,"HeadY":6,"Lines":[{"X":0,"Y":0,"Line":"Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5--Z5Z5Z5Z5Z5"}]},{"Description":"","HeadX":6,"HeadY":6,"Lines":[{"X":1,"Y":0,"Line":"c0c0c0c0c0c0----c0c0c0c0c0------c0c0c0c0--------c0c0c0----------c0c0------------c0S0S0S0S0S0S0"}]},{"Description":"","HeadX":3,"HeadY":3,"Lines":[{"X":3,"Y":4,"Line":"S0"}]}],"SnakeId":false,"PlayerId":false,"SnakeName":"Бывалый","SnakeType":"N","SkinId":5,"ProgramDescription":"Кое-что умеет","Templates":["XY","S","STW","S"]},

		{"Maps":[{"Description":"","HeadX":0,"HeadY":0,"Lines":[{"X":0,"Y":1,"Line":"A5A5----------A5A5A5--------A5A5A5A5------A5A5A5A5A5----A5A5A5A5A5A5--A5A5A5A5A5A5A5"}]},{"Description":"","HeadX":3,"HeadY":3,"Lines":[{"X":3,"Y":4,"Line":"S0"}]}],"SnakeId":false,"PlayerId":false,"SnakeName":"Трус","SnakeType":"B","SkinId":2,"ProgramDescription":"Только удирает","Templates":["XYZ","S","S","S"]}
	]

	for(var i in Bots) Bots[i] = new ASnake(Bots[i])
	Game.OtherSnakes.List = Bots
})()