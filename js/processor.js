
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function AFightProcessor(Fight) {
	this.Fight = Fight

	this.BatchTurnCount = 50

	this.DirX = [0, 1, 0, -1]
	this.DirY = [-1, 0, 1, 0]
	this.StartX = [12, 9, 12, 15]
	this.StartY = [15, 12, 9, 12]

	this.FreeCell = 1
	this.BorderCell = 2
	this.HeadCell = 0x10
	this.BodyCell = 0x100
	this.TailCell = 0x1000
	this.GroupShift = 16
	this.RateShift = 20
	this.TailShift = 12
	this.HeadMask = 0xF0
	this.BodyMask = 0xF00
	this.TailMask = 0xF000
	this.RateMask = 0x700000
	this.AllowedMask = this.TailMask | this.FreeCell
	this.AnyMask = 0xFFF3

	this.IsSolitaire = null

//---------------------------------------------------------------------------
	this.TurnAlert = function(TurnIndex) {}

//---------------------------------------------------------------------------
	this.Process = function() {
		if (this.Response) return this.Response

		this.Field = ArrayFill(25, ArrayFill(25, this.FreeCell))
		this.PrepareSnakes()
		this.Turns = []

		var BatchCnt = this.BatchTurnCount
		for(var Turn = 1; Turn <= this.Fight.TurnLimit; Turn++) {
			if (!this.ProcessTurn()) break

			BatchCnt--
			if (!BatchCnt) {
				BatchCnt = this.BatchTurnCount
				this.TurnAlert(Turn)
			}
		}
		if (!this.Result) this.Result = 'free'
		this.TurnAlert(Turn)

		this.Response = {
			Response: 'fight info',
			FightId: '0',
			FightType: 'train',
			FightTime: Math.floor((new Date()).getTime() / 1000),
			FightResult: this.Result,
			TurnLimit: this.Fight.TurnLimit,
			Turns: this.Turns,
			Snakes: this.Fight.Snakes,
			SnakeStats: ArrayFill(4, null),
		}

		for(var i = 0; i < 4; i++) {
			var Snake = this.Snakes[i]
			if (Snake) {
				//var FightSnake = this.Fight.Snakes[i]
				this.Response.SnakeStats[i] = {
					Status: Snake.Result,
					FinalLength: Snake.Coords.length,
					DebugData: Snake.Debug.join(''),
				}
			}
		}

		this.Field = null
		this.Snakes = null
		return this.Response
	}


//---------------------------------------------------------------------------
	this.PrepareSnakes = function() {
		var FightSnakes = [null, null, null, null]
		for(var i in this.Fight.Snakes) {
			var Snake = this.Fight.Snakes[i]
			if (!Snake) continue

			if (this.IsSolitaire == undefined) this.IsSolitaire = true
			else this.IsSolitaire = false
			var Coords = this.PrepareCoords(i)
			this.Field[Coords[0][1]][Coords[0][0]] = this.HeadCell << i
			for(var j = 1; j < 9; j++) {
				this.Field[Coords[j][1]][Coords[j][0]] = this.BodyCell << i
			}
			this.Field[Coords[9][1]][Coords[9][0]] = this.TailCell << i

			FightSnakes[i] = {
				Dir: i, Coords: Coords, Result: '', Debug: [],
				Maps: this.PrepareMapVariants(Snake, i)
			}
		}
		this.Snakes = FightSnakes
	}

//---------------------------------------------------------------------------
	this.PrepareCoords = function(Index) {
		var Result = new Array(10)
		var dx = this.DirX[Index ^ 2]
		var dy = this.DirY[Index ^ 2]
		var x = this.StartX[Index]
		var y = this.StartY[Index]
		Result[0] = [x, y]
		for(var i = 1; i < 9; i++) {
			x += dx
			y += dy
			Result[i] = [x, y]
		}
		x += dx
		y += dy
		Result[9] = [x, y]
		return Result
	}

//---------------------------------------------------------------------------
	this.PrepareMapVariants = function(Snake, Index) {
		var Result = []
		var Templates = this.MakeTemplateMasks(Snake.Templates, Index)
		for(var i in Snake.Maps) {
			Result[i] = this.MakeMapVariants(Snake.Maps[i], Templates, Index)
		}
		return Result
	}

//---------------------------------------------------------------------------
	this.MakeMapVariants = function(Map, Templates, Index) {
		var Result = new Array(8)
		var BaseMasks = this.FillMapVariant(Map.Lines, Templates)
		var HeadCoords = [Map.HeadX, Map.HeadY]
		Result[0] = [HeadCoords[0], HeadCoords[1], ArrayChunk(BaseMasks, 7)]

		// [индекс_X_головы, множитель_X, смещение_X,
		//  индекс_Y_головы, множитель_Y, смещение_Y,
		//  индекс_первой_клетки, смещение_индекса_в_строке, смещение_индекса_новой_строки]
		var Params = [
			null,
			[1, -1, 6,  0, 1, 0,  42, -7, 1],
			[0, -1, 6,  1, -1, 6,  48, -1, -7],
			[1, 1, 0,  0, -1, 6,  6, 7, -1],

			[0, -1, 6,  1, 1, 0,  6, -1, 7],
			[1, -1, 6,  0, -1, 6,  48, -7, -1],
			[0, 1, 0,  1, -1, 6,  42, 1, -7],
			[1, 1, 0,  0, 1, 0,  0, 7, 1],
		]

		for(var i = 1; i < 8; i++) {
			var Param = Params[i]
			var Masks = new Array(49)
			var LineIndex = Param[6]
			var dx = Param[7]
			var dy = Param[8]
			var j = 0
			for(var y = 0; y < 7; y++) {
				var Pos = LineIndex
				LineIndex += dy
				for(var x = 0; x < 7; x++) {
					Masks[j] = BaseMasks[Pos]
					j++
					Pos += dx
				}
			}
			x = HeadCoords[Param[0]] * Param[1] + Param[2]
			y = HeadCoords[Param[3]] * Param[4] + Param[5]
			Result[i] = [x, y, ArrayChunk(Masks, 7)]
		}

		return Result
	}

//---------------------------------------------------------------------------
	this.MakeTemplateMasks = function(Templates, Index) {
		var SingleRate = 6 << this.RateShift
		var MultiRate = 1 << this.RateShift
		var Result = {
			S: SingleRate | (this.BodyCell << Index),
			T: SingleRate | (this.TailCell << Index),
			V: SingleRate | (this.FreeCell),
			W: SingleRate | (this.BorderCell),
			X: SingleRate | (this.HeadMask & ~(this.HeadCell << Index)),
			Y: SingleRate | (this.BodyMask & ~(this.BodyCell << Index)),
			Z: SingleRate | (this.TailMask & ~(this.TailCell << Index)),
		}

		var Names = ['A', 'B', 'C', 'D']
		for(var i in Names) {
			var Template = Templates[i].chunk()
			var Mask = 0
			for(var j in Template) Mask |= Result[Template[j]]
			Mask = (Mask & ~this.RateMask) | ((7 - Template.length) << this.RateShift)
			Result[Names[i]] = Mask
		}

		Names = 'ABCDSTVWXYZ'.chunk()
		Mask = this.AnyMask | this.RateMask
		for(var i in Names) {
			Result[Names[i].toLowerCase()] = Result[Names[i]] ^ Mask
		}

		return Result
	}

//---------------------------------------------------------------------------
	this.FillMapVariant = function(Lines, Templates) {
		Lines = Lines.chunk(2)
		var Result = ArrayFill(49, this.AnyMask)
		for(var i in Lines) {
			var Cell = Lines[i].chunk()
			if (Cell[0] == '-') continue

			Result[i] = Templates[Cell[0]] | (parseInt(Cell[1]) << this.GroupShift)
		}
		return Result
	}

//---------------------------------------------------------------------------
	this.ProcessTurn = function() {
		var StepOrder = [0, 1, 2, 3]
		ArrayShuffle(StepOrder)

		var SnakesMoved = false
		var Turn = 0
		for(var i = 0; i < 3; i++) Turn |= StepOrder[i] << (i << 1)
		for(var i in StepOrder) {
			var StepResult = this.ProcessStep(StepOrder[i])
			if (StepResult) SnakesMoved = true
			Turn |= StepResult << ((StepOrder[i] << 1) + 6)
		}

		if (!SnakesMoved) {
			this.Result = 'blocked'
			return false
		}

		this.Turns.push(Turn)

		if (!this.IsSolitaire) {
			var SnakesAlive = 0
			for (i in this.Snakes) {
				if (this.Snakes[i] && this.Snakes[i].Coords.length) {
					SnakesAlive++
				}
			}
			if (SnakesAlive < 2) {
				this.Result = 'eaten'
				return false
			}
		}

		return true
	}

//---------------------------------------------------------------------------
	this.ProcessStep = function(SnakeIndex) {
		var Snake = this.Snakes[SnakeIndex]
		if (!Snake || Snake.Coords.length < 2) return 0

		var HeadX = Snake.Coords[0][0]
		var HeadY = Snake.Coords[0][1]
		var Dir = (Snake.Dir - 1) & 3
		var AllowedDirs = []
		for(var i = 2; i >= 0; i--) {
			var Cell = this.Field[HeadY + this.DirY[Dir]]
			if (Cell) {
				Cell = Cell[HeadX + this.DirX[Dir]]
				if (Cell & this.AllowedMask) AllowedDirs.push(Dir)
			}
			Dir = (Dir + 1) & 3
		}

		if (AllowedDirs.length < 2) {
			if (!AllowedDirs.length) {
				Snake.Result = 'blocked'
				Snake.Debug.push(this.EncodeDebug(0, 1))
				return 0
			}

			Dir = AllowedDirs[0]
			var i = (Dir - Snake.Dir + 2) & 3
			this.MoveSnake(SnakeIndex, Dir)
			Snake.Debug.push(this.EncodeDebug(0, 2))
			return i
		}

		for(var i in Snake.Maps) {
			var BestRate = 0
			var BestDirs = []

			for(var j in AllowedDirs) {
				Dir = AllowedDirs[j]
				var Rates = [
					this.RateMapVariant(Snake.Maps[i][Dir], HeadX, HeadY),
					this.RateMapVariant(Snake.Maps[i][Dir | 4], HeadX, HeadY),
				]
				var Rate = Math.max(Rates[0], Rates[1])
				if (Rate > Rates[0]) Dir |= 4
				if (Rate && Rate >= BestRate) {
					if (Rate == BestRate) BestDirs.push(Dir)
					else {
						BestRate = Rate
						BestDirs = [Dir]
					}
				}
			}

			if (!BestRate) continue

			Dir = ArrayRandom(BestDirs)
			j = (Dir - Snake.Dir + 2) & 3
			this.MoveSnake(SnakeIndex, Dir & 3)
			Snake.Debug.push(this.EncodeDebug(Number(i) + 1, Dir))
			return j
		}

		Dir = ArrayRandom(AllowedDirs)
		i = (Dir - Snake.Dir + 2) & 3
		this.MoveSnake(SnakeIndex, Dir)
		Snake.Debug.push(this.EncodeDebug(0, 3))
		return i
	}

//---------------------------------------------------------------------------
	this.EncodeDebug = function(Map, Variant) {
		return String.fromCharCode(((Map << 3) | Variant) + 32)
	}

//---------------------------------------------------------------------------
	this.RateMapVariant = function(Variant, HeadX, HeadY) {
		var Results = new Array(8)
		var StartX = HeadX - Variant[0]
		var StartY = HeadY - Variant[1]
		var Masks = Variant[2]
		var my = StartY - 1
		for(var y = 0, my = StartY; y < 7; y++, my++) {
			for(var x = 0, mx = StartX; x < 7; x++, mx++) {
				if (mx < 0 || mx >= 25 || my < 0 || my >= 25) var Cell = this.BorderCell
				else var Cell = this.Field[my][mx]
				var Mask = Masks[y][x]
				if (Mask == this.AnyMask) continue

				var Group = (Mask >> this.GroupShift) & 7
				if (Results[Group] == undefined) Results[Group] = 0
				if (!(Cell & Mask)) {
					if (Group < 4) Results[Group] = -1
					continue
				}
				if (Results[Group] >= 0) {
					Results[Group] += Mask >> this.RateShift
				}
			}
		}

		var Result = 1
		var Failed = null
		for(Group = 0; Group < 4; Group++) {
			var GroupResult = Results[Group]
			if (GroupResult == undefined) continue

			if (GroupResult <= 0) {
				if (Failed == undefined) Failed = true
			} else {
				Failed = false
				Result += GroupResult
			}
		}
		if (Failed) return 0

		for(Group = 4; Group < 8; Group++) {
			GroupResult = Results[Group]
			if (GroupResult == undefined) continue

			if (!GroupResult) return 0
			else Result += GroupResult
		}

		return Result
	}

//---------------------------------------------------------------------------
	this.MoveSnake = function(SnakeIndex, Dir) {
		var Snake = this.Snakes[SnakeIndex]
		var SnakeX = Snake.Coords[0][0]
		var SnakeY = Snake.Coords[0][1]
		var MoveX = SnakeX + this.DirX[Dir]
		var MoveY = SnakeY + this.DirY[Dir]
		var Cell = this.Field[MoveY][MoveX]
		var Coords
		Snake.Dir = Dir
		Snake.Result = 'free'

		this.Field[SnakeY][SnakeX] = this.BodyCell << SnakeIndex
		Snake.Coords.unshift([MoveX, MoveY])
		this.Field[MoveY][MoveX] = this.HeadCell << SnakeIndex

		if (Cell &(this.FreeCell | (this.TailCell << SnakeIndex))) {
			Coords = Snake.Coords.pop()
			if (Coords[0] != MoveX || Coords[1] != MoveY) {
				this.Field[Coords[1]][Coords[0]] = this.FreeCell
			}
			Coords = Snake.Coords[Snake.Coords.length - 1]
			this.Field[Coords[1]][Coords[0]] = this.TailCell << SnakeIndex
			return
		}

		var EnemyIndex = {1: 0, 2: 1, 4: 2, 8: 3}[(Cell & this.TailMask) >> this.TailShift]
		var Enemy = this.Snakes[EnemyIndex]
		Enemy.Coords.pop()
		if (Enemy.Coords.length < 2) Enemy.Result = 'eaten'
		if (Enemy.Coords.length) {
			Coords = Enemy.Coords[Enemy.Coords.length - 1]
			this.Field[Coords[1]][Coords[0]] = this.TailCell << EnemyIndex
		}
	}

//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
}