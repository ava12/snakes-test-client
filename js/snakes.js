
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function ASnakeMap(Fields) {
	this.Description = ''
	this.HeadX = 3
	this.HeadY = 3

	if (Fields) {
		for(var i in Fields) {
			if (this[i] != undefined) this[i] = Fields[i]
		}
	}

	this.Lines = '--'.repeat(49)
	if (Fields && Fields.Lines) {
		for(var i in Fields.Lines) {
			var Line = Fields.Lines[i]
			var Pos = Line.Y * 14 + Line.X * 2
			this.Lines = this.Lines.splice(Pos, Pos + Line.Line.length, Line.Line)
		}
	}

//---------------------------------------------------------------------------
	this.RenderCell = function(Name, x, y, Size) {
		Canvas.RenderSprite(Sprites.Get(Name), x * Size, y * Size)
	}

//---------------------------------------------------------------------------
	this.Render = function(x, y, RotRef, Size) {
		if (!RotRef) RotRef = 0
		if (!Size) Size = 16

		Canvas.SaveState()
		Canvas.RotateReflect(ABox(x, y, Size * 7, Size * 7), RotRef)

		var Cells = ArrayChunk(this.Lines.chunk(2), 7)
		for(var y in Cells) {
			for(var x in Cells[y]) {
				var Cell = Cells[y][x].chunk()
				if (Cell[1] == '-') {
					this.RenderCell(Size + '.Any', x, y, Size)
				} else {
					this.RenderCell(Size + '.Group.' + Cell[1], x, y, Size)
					var t = Cell[0].toUpperCase()
					this.RenderCell(Size + '.' + t, x, y, Size)
					if (t != Cell[0]) this.RenderCell(Size + '.Not', x, y, Size)
				}
			}
		}
		this.RenderCell(Size + '.OwnHead', this.HeadX, this.HeadY, Size)

		Canvas.RestoreState()
	}

//---------------------------------------------------------------------------
	this.clone = function() {
		var Fields = {Description: this.Description, HeadX: this.HeadX,
			HeadY: this.HeadY, Lines: [{X: 0, Y: 0, Line: this.Lines}]}
		return new ASnakeMap(Fields)
	}

//---------------------------------------------------------------------------
	this.Serialize = function() {
		var Result = {
			Description: this.Description, HeadX: this.HeadX, HeadY: this.HeadY,
		}
		var Match = /^(-*)(.*?)-*$/.exec(this.Lines)
		if (!Match || !Match[2]) Result.Lines = []
		else {
			var Len = Match[1].length >> 1
			Result.Lines = [{X: Len % 7, Y: Math.floor(Len / 7), Line: Match[2]}]
		}
		return Result
	}

//---------------------------------------------------------------------------
	return this
}

//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function ASnake(Fields) {
	this.SnakeId = false
	this.PlayerId = false
	this.SnakeName = ''
	this.SnakeType =  'N'
	this.SkinId = 1
	this.ProgramDescription = ''
	this.Templates = ['S', 'S', 'S', 'S']

	if(Fields) {
		for(var i in Fields) {
			if (this[i] != undefined) this[i] = Fields[i]
		}
	}

	if (!Fields || !Fields.Maps) this.Maps = [new ASnakeMap()]
	else {
		this.Maps = []
		for(var i in Fields.Maps) this.Maps.push(new ASnakeMap(Fields.Maps[i]))
	}

//---------------------------------------------------------------------------
	this.SetName = function(Name) {
		if (Game.MySnakes.Get(Name) == this) return false

		Game.MySnakes.Remove(this.Name)
		this.Name = Name
		Game.MySnakes.Add(this)
	}

//---------------------------------------------------------------------------
  this.Serialize = function() {
    var Names = ['SnakeId', 'PlayerId', 'SnakeName', 'SnakeType', 'SkinId',
			'ProgramDescription', 'Templates']
    var Result = {Maps: []}
		for(var i in Names) Result[Names[i]] = this[Names[i]]
		for(i in this.Maps) Result.Maps.push(this.Maps[i].Serialize())
		return Result
  }

//---------------------------------------------------------------------------
	return this
}

//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function AFight(Fields) {
	this.FightId = false
	this.FightType = 'train'
	this.FightTime = false
	this.FightResult = false
	this.TurnLimit = 1000
	this.Turns = []
	this.Snakes = [null, null, null, null]
	this.SnakeStats = [null, null, null, null]

	this.SlotIndex = null

	if(Fields) {
		for(var i in Fields) {
			if (this[i] != undefined || i == 'SlotIndex') this[i] = Clone(Fields[i])
		}

		for(i in this.Snakes) {
			if (this.Snakes[i]) {
				if (!this.Snakes[i].Serialize) //this.Snakes[i] = Clone(this.Snakes[i])
				/*else*/ this.Snakes[i] = new ASnake(this.Snakes[i])
			}
		}
	}

//---------------------------------------------------------------------------
	this.Serialize = function() {
		var Result = {}
		var Names = ['FightId', 'FightType', 'FightTime', 'FightResult',
			'TurnLimit', 'Turns', 'SnakeStats', 'SlotIndex']
		for(var i in Names) Result[Names[i]] = this[Names[i]]
		Result.Snakes = [null, null, null, null]
		for(var i in this.Snakes) {
			if (this.Snakes[i]) Result.Snakes[i] = this.Snakes[i].Serialize()
		}
		return Result
	}

//---------------------------------------------------------------------------
	return this
}


//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
var Game = {
	OtherSnakes: {List: []},

//---------------------------------------------------------------------------
	Fights: {
		MaxCount: 10,
		List: [],

//---------------------------------------------------------------------------
		Add: function(Fight) {
			if (this.List.length >= this.MaxCount) {
				alert('Вы можете сохранить не более ' + this.MaxCount + ' боев.')
				return false
			}

			Fight.SlotIndex = this.List.length
			this.List.push(Fight)
		},

//---------------------------------------------------------------------------
		Remove: function(Fight) {
			var Index = Fight.SlotIndex
			if (Index == undefined) return

			this.List.splice(Index, 1)
			for(var i = this.List.length - 1; i >= Index; i--) {
				this.List[i].SlotIndex--
			}
			Fight.SlotIndex = null
		},

//---------------------------------------------------------------------------
	},

//---------------------------------------------------------------------------
	MySnakes: {
		MaxCount: 10,
		List: [],
		Index: {},

//---------------------------------------------------------------------------
		Normalize: function(Name) {
			return String(Name).toLowerCase().replace('ё', 'е')
		},

//---------------------------------------------------------------------------
		Exists: function(Name) {
			return !!this.Index[this.Normalize(Name)]
		},

//---------------------------------------------------------------------------
    Get: function(Name) {
      return this.Index[this.Normalize(Name)]
    },

//---------------------------------------------------------------------------
		Add: function(Snake) {
			if (this.List.length >= this.MaxCount) {
				alert('Вы можете сохранить не более ' + this.MaxCount + ' змей.')
				return false
			}

			var Name = this.Normalize(Snake.SnakeName)
			if (this.Index[Name]) {
				alert('Змея ' + Snake.SnakeName + ' уже существует.')
				return false
			}

			this.Index[Name] = Snake
			var List = this.List
			for(var i = 0; i < List.length; i++) {
				if (Name < this.Normalize(List[i].SnakeName)) {
					List.splice(i, 0, Snake)
					return true
				}
			}
			List.push(Snake)
			return true
		},

//---------------------------------------------------------------------------
		Remove: function(Name) {
			Name = this.Normalize(Name)
			if (!this.Index[Name]) return

			this.Index[Name].SnakeName = ''
			delete this.Index[Name]
			var List = this.List
			for(var i = 0; i < List.length; i++) {
				if (!List[i].SnakeName) {
					List.splice(i, 1)
					return
				}
			}
		},

//---------------------------------------------------------------------------
		Rename: function(Snake, NewName) {
			var Name = Snake.SnakeName
			this.Remove(Name)
			Snake.SnakeName = NewName
			if (this.Add(Snake)) {
				return true
			}
			else {
				Snake.SnakeName = Name
				this.Add(Snake)
				return false
			}
		},

//---------------------------------------------------------------------------
	},

//---------------------------------------------------------------------------
	Run: function() {
		TabSet.Init()
		this.Load()
	},

//---------------------------------------------------------------------------
	CanSave: (!!window.localStorage && !!window.JSON),

//---------------------------------------------------------------------------
	HasData: function() {
		return !!localStorage.Snakes
	},

//---------------------------------------------------------------------------
	Load: function() {
		if (!this.CanSave) return

		var Data = localStorage.getItem('Snakes')
		if (!Data) return

		Data = JSON.parse(Data)
		this.MySnakes.List = []
		this.MySnakes.Index = {}
		this.Fights.List = []

		for(var i in Data.Snakes) {
			this.MySnakes.Add(new ASnake(Data.Snakes[i]))
		}
		for(i in Data.Fights) {
			this.Fights.List.push(new AFight(Data.Fights[i]))
		}
		TabSet.Restore(Data.Tabs)
	},

//---------------------------------------------------------------------------
	Save: function() {
		if (!this.CanSave) return

		var Tabs = TabSet.Serialize()
		var Snakes = [], Fights = []
		for(var i in this.MySnakes.List) Snakes.push(this.MySnakes.List[i].Serialize())
		for(i in this.Fights.List) Fights.push(this.Fights.List[i].Serialize())
		var Data = {Snakes: Snakes, Fights: Fights, Tabs: Tabs}
		localStorage.setItem('Snakes', JSON.stringify(Data))
	},

//---------------------------------------------------------------------------
	Remove: function() {
		localStorage.removeItem('Snakes')
	},

//---------------------------------------------------------------------------
}