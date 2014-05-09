function ASnakeEditor(Snake) {
	if (!Snake) Snake = new ASnake()
	else if (typeof Snake != 'object') Snake = Game.MySnakes.Get(Snake)

	this.Snake = Snake
	this.TabTitle = (Snake.SnakeName ? Snake.SnakeName : '<без имени>')
	this.TabSprite = SnakeSkins.Get(Snake.SkinId)
	this.BaseControlHtml = ''

	this.Controls = {Items: {
		Map: {x: 208, y: 150, w: 224, h: 224, Data: {cls: 'map', id: 'map'}},
		SkinId: {x: 8, y: 45, w: 48, h: 16, Data: {cls: 'desc', id: 'skin'},
			Back: false, Sprite: this.TabSprite},
		SnakeName: {x: 60, y: 42, w: 412, h: 22, Data: {cls: 'desc', id: 'name'},
			Back: false},
		FightButton: {x: 562, y: 42, w: 70, h: 22, Data: {cls: 'fight'},
			Label: 'В бой!', BackColor: '#99ff99'},
		ExportButton: {x: 482, y: 42, w: 70, h: 22, Data: {cls: 'export'},
			Label: 'Экспорт', Title: 'экспортировать в виде текста', BackColor: '#9cf'},
		ProgramDescription: {x: 8, y: 79, w: 624, h: 58,
			Data: {cls: 'desc', id: 'program'}, Back: false, Title: 'описание программы'},
		Description: {x: 8, y: 268, w: 192, h: 108, Data: {cls: 'desc', id: 'map'},
			Back: false, Title: 'описание карты'},
		HeadButton: {x: 27, y: 389, w: 32, h: 32, Data: {cls: 'tpl', id: 'head'},
			Title: 'своя голова', Sprite: '32.OwnHead'},
		ClearButton: {x: 27, y: 429, w: 32, h: 32, Data: {cls: 'tpl', id: 'clear'},
			Title: 'очистить', Sprite: '20.Any'},
		NotButton: {x: 84, y: 389, w: 32, h: 32, Data: {cls: 'tpl', id: 'not'},
			Title: 'модификатор НЕ', Sprite: '32.Not'},
		ControlButtons: {w: 32, h: 32, y: 342, Data: {cls: 'ctl'}, Items: [
			{x: 452, id: 'upper', Back: '32.Buttons.Back', Sprite: '16.Labels.Up', Title: 'выше'},
			{x: 486, id: 'lower', Back: '32.Buttons.Back', Sprite:'16.Labels.Down', Title: 'ниже'},
			{x: 520, id: 'add', Back: '32.Buttons.Add', Sprite: '16.Labels.Add', Title: 'новая карта'},
			{x: 554, id: 'copy', Back: '32.Buttons.Add', Sprite: '16.Labels.Copy', Title: 'копия карты'},
			{x: 588, id: 'del', Back: '32.Buttons.Del', Sprite: '16.Labels.Del', Title: 'удалить карту'},
		]},
		TemplateButtons: {y: 389, w: 32, h: 32, Data: {cls: 'tpl'},
			Title: 'пользовательский набор', Items: {
				V: {x: 124, id: 'V', Title: 'пустая клетка', Sprite: '32.V'},
				S: {x: 158, id: 'S', Title: 'свое тело', Sprite: '32.S'},
				T: {x: 192, id: 'T', Title: 'свой хвост', Sprite: '32.T'},
				X: {x: 226, id: 'X', Title: 'голова противника', Sprite: '32.X'},
				Y: {x: 260, id: 'Y', Title: 'тело противника', Sprite: '32.Y'},
				Z: {x: 294, id: 'Z', Title: 'хвост противника', Sprite: '32.Z'},
				W: {x: 328, id: 'W', Title: 'граница поля', Sprite: '32.W'},
				A: {x: 381, y: 389, id: 'A', Sprite: '32.A'},
				B: {x: 381, y: 429, id: 'B', Sprite: '32.B'},
				C: {x: 510, y: 389, id: 'C', Sprite: '32.C'},
				D: {x: 510, y: 429, id: 'D', Sprite: '32.D'},
			}
		},
		GroupButtons: {y: 429, w: 32, h: 32, Data: {cls: 'grp'}, Items: [
			{x: 84, id: '0', Title: 'И-группа 1', Sprite: '20.Group.0'},
			{x: 118, id: '1', Title: 'И-группа 2', Sprite: '20.Group.1'},
			{x: 153, id: '2', Title: 'И-группа 3', Sprite: '20.Group.2'},
			{x: 186, id: '3', Title: 'И-группа 4', Sprite: '20.Group.3'},
			{x: 226, id: '4', Title: 'ИЛИ-группа 1', Sprite: '20.Group.4'},
			{x: 260, id: '5', Title: 'ИЛИ-группа 2', Sprite: '20.Group.5'},
			{x: 294, id: '6', Title: 'ИЛИ-группа 3', Sprite: '20.Group.6'},
			{x: 328, id: '7', Title: 'ИЛИ-группа 4', Sprite: '20.Group.7'},
		]},
		UserSetButtons: {w: 16, h: 16, Data: {cls: 'set'}, Items: {
			A: {Items: {
				v: {x: 417, y: 389, Data: {id: 'v', usr: 'A'}, Title: 'пустая клетка', Sprite: '16.V'},
				s: {x: 435, y: 389, Data: {id: 's', usr: 'A'}, Title: 'свое тело', Sprite: '16.S'},
				t: {x: 453, y: 389, Data: {id: 't', usr: 'A'}, Title: 'свой хвост', Sprite: '16.T'},
				w: {x: 471, y: 389, Data: {id: 'w', usr: 'A'}, Title: 'граница поля', Sprite: '16.W'},
				x: {x: 417, y: 407, Data: {id: 'x', usr: 'A'}, Title: 'голова противника', Sprite: '16.X'},
				y: {x: 435, y: 407, Data: {id: 'y', usr: 'A'}, Title: 'тело противника', Sprite: '16.Y'},
				z: {x: 453, y: 407, Data: {id: 'z', usr: 'A'}, Title: 'хвост противника', Sprite: '16.Z'},
			}},
			B: {Items: {
				v: {x: 417, y: 429, Data: {id: 'v', usr: 'B'}, Title: 'пустая клетка', Sprite: '16.V'},
				s: {x: 435, y: 429, Data: {id: 's', usr: 'B'}, Title: 'свое тело', Sprite: '16.S'},
				t: {x: 453, y: 429, Data: {id: 't', usr: 'B'}, Title: 'свой хвост', Sprite: '16.T'},
				w: {x: 471, y: 429, Data: {id: 'w', usr: 'B'}, Title: 'граница поля', Sprite: '16.W'},
				x: {x: 417, y: 447, Data: {id: 'x', usr: 'B'}, Title: 'голова противника', Sprite: '16.X'},
				y: {x: 435, y: 447, Data: {id: 'y', usr: 'B'}, Title: 'тело противника', Sprite: '16.Y'},
				z: {x: 453, y: 447, Data: {id: 'z', usr: 'B'}, Title: 'хвост противника', Sprite: '16.Z'},
			}},
			C: {Items: {
				v: {x: 546, y: 389, Data: {id: 'v', usr: 'C'}, Title: 'пустая клетка', Sprite: '16.V'},
				s: {x: 564, y: 389, Data: {id: 's', usr: 'C'}, Title: 'свое тело', Sprite: '16.S'},
				t: {x: 582, y: 389, Data: {id: 't', usr: 'C'}, Title: 'свой хвост', Sprite: '16.T'},
				w: {x: 600, y: 389, Data: {id: 'w', usr: 'C'}, Title: 'граница поля', Sprite: '16.W'},
				x: {x: 546, y: 407, Data: {id: 'x', usr: 'C'}, Title: 'голова противника', Sprite: '16.X'},
				y: {x: 564, y: 407, Data: {id: 'y', usr: 'C'}, Title: 'тело противника', Sprite: '16.Y'},
				z: {x: 582, y: 407, Data: {id: 'z', usr: 'C'}, Title: 'хвост противника', Sprite: '16.Z'},
			}},
			D: {Items: {
				v: {x: 546, y: 429, Data: {id: 'v', usr: 'D'}, Title: 'пустая клетка', Sprite: '16.V'},
				s: {x: 564, y: 429, Data: {id: 's', usr: 'D'}, Title: 'свое тело', Sprite: '16.S'},
				t: {x: 582, y: 429, Data: {id: 't', usr: 'D'}, Title: 'свой хвост', Sprite: '16.T'},
				w: {x: 600, y: 429, Data: {id: 'w', usr: 'D'}, Title: 'граница поля', Sprite: '16.W'},
				x: {x: 546, y: 447, Data: {id: 'x', usr: 'D'}, Title: 'голова противника', Sprite: '16.X'},
				y: {x: 564, y: 447, Data: {id: 'y', usr: 'D'}, Title: 'тело противника', Sprite: '16.Y'},
				z: {x: 582, y: 447, Data: {id: 'z', usr: 'D'}, Title: 'хвост противника', Sprite: '16.Z'},
			}},
		}},
	}}

	this.PrevMapControl = {
		x: 48, y: 150, w: 112, h: 112, Data: {cls: 'map', id: 'prev'},
		Class: 'prev-map', Title: 'предыдущая карта'
	}

	this.NextMapControl = {
		x: 480, y: 150, w: 112, h: 112, Data: {cls: 'map', id: 'next'},
		Class: 'next-map', Title: 'следующая карта'
	}

	this.MapButtonControls = {w: 32, h: 32,	Data: {cls: 'map'}, Items: [
		{x : 452, y: 268, id: '0', Title: 'карта № 1', Sprite: '16.Digits.1'},
		{x : 486, y: 268, id: '1', Title: 'карта № 2', Sprite: '16.Digits.2'},
		{x : 520, y: 268, id: '2', Title: 'карта № 3', Sprite: '16.Digits.3'},
		{x : 554, y: 268, id: '3', Title: 'карта № 4', Sprite: '16.Digits.4'},
		{x : 588, y: 268, id: '4', Title: 'карта № 5', Sprite: '16.Digits.5'},
		{x : 452, y: 302, id: '5', Title: 'карта № 6', Sprite: '16.Digits.6'},
		{x : 486, y: 302, id: '6', Title: 'карта № 7', Sprite: '16.Digits.7'},
		{x : 520, y: 302, id: '7', Title: 'карта № 8', Sprite: '16.Digits.8'},
		{x : 554, y: 302, id: '8', Title: 'карта № 9', Sprite: '16.Digits.9'},
	]}

	this.MapIndex = 0
	this.Cells = null
	this.Group = null
	this.Element = null
	this.Not = false
	this.HeadX = null
	this.HeadY = null
	this.Templates = {}

//---------------------------------------------------------------------------
	;(function() {
		if (!window.JSON) delete this.Controls.ExportButton

		var SetNames = ['A', 'B', 'C', 'D']
		for(var i in SetNames) {
			var Set = {Count: 0,
				s: false, t: false, v: false, w: false, x: false, y: false, z: false}
			var Tpl = Snake.Templates[i].chunk()
			for(var j in Tpl) {
				var t = Tpl[j].toLowerCase()
				Set[t] = true
				Set.Count++
			}
			this.Templates[SetNames[i]] = Set
		}
	}).apply(this)

//---------------------------------------------------------------------------
	this.TabInit = function() {
		this.Snake.TabId = this.TabId
	}

//---------------------------------------------------------------------------
	this.RenderControls = function() {
		var MapCnt = this.Snake.Maps.length
		var Mbc = this.MapButtonControls
		var MapButtons = {w: Mbc.w, h: Mbc.h, Data: Mbc.Data,
			Items: Mbc.Items.slice(0, MapCnt)}
		var Html = Canvas.MakeControlHtml(this.Controls)
		this.BaseControlHtml = Html
		Html += Canvas.MakeControlHtml(MapButtons)
		if (this.MapIndex) {
			Html += Canvas.MakeControlHtml(this.PrevMapControl)
		}
		if (this.MapIndex < (MapCnt - 1)) {
			Html += Canvas.MakeControlHtml(this.PrevMapControl)
		}

		Canvas.RenderHtml('controls', Html)
	}

//---------------------------------------------------------------------------
	this.RenderButton = function(ButtonSet, ItemIndex, Pressed) {
		if (ItemIndex == undefined) var Button = ButtonSet
		else var Button = ButtonSet.Items[ItemIndex]
		if (!Button.Sprite) return

		var Sprite = Button.Sprite
		if (typeof Sprite == 'string') Sprite = Sprites.Get(Sprite)
		var dx = (Button.x ? Button.x : ButtonSet.x)
		var dy = (Button.y ? Button.y : ButtonSet.y)
		var Back = (Button.Back != undefined ? Button.Back : ButtonSet.Back)
		if (Back !== false) {
			if (!Back) {
				var w = (ButtonSet.w ? ButtonSet.w : Sprite.w)
				Back = w.toString() +
				(Pressed ? '.Buttons.Front' : '.Buttons.Back')
			}
			if (typeof Back == 'string') Back = Sprites.Get(Back)
			Canvas.RenderSprite(Back, dx, dy)
			dx += (Back.w - Sprite.w) >> 1
			dy += (Back.h - Sprite.h) >> 1
		}
		Canvas.RenderSprite(Sprite, dx, dy)
	}

//---------------------------------------------------------------------------
	this.RenderTextBox = function(Box, Text) {
		Canvas.RenderTextBox(Text, Box, '#000000', '#ffffff', '#000000')
	}

//---------------------------------------------------------------------------
	this.RenderProgramDescription = function() {
		this.RenderTextBox(
			this.Controls.Items.ProgramDescription, this.Snake.ProgramDescription
		)
	}

//---------------------------------------------------------------------------
	this.RenderDescription = function() {
		this.RenderTextBox(
			this.Controls.Items.Description, this.Snake.Maps[this.MapIndex].Description
		)
	}

//---------------------------------------------------------------------------
	this.RenderSnakeName = function() {
		this.RenderTextBox(this.Controls.Items.SnakeName, this.TabTitle)
	}

//---------------------------------------------------------------------------
	this.RenderBody = function() {
		var Controls = this.Controls.Items
		for (var i in Controls) {
			var Control = Controls[i]
			if (Control.Items == undefined) this.RenderButton(Control)
			else {
				for(var j in Control.Items) {
					if (Control.Items[j].Items == undefined) {
						this.RenderButton(Control, j)
					} else {
						var SubControl = Control.Items[j]
						for(var k in SubControl.Items) this.RenderButton(SubControl, k)
					}
				}
			}
		}

		this.RenderProgramDescription()
		this.RenderSnakeName()
		this.RenderDescription()

		var Button = Controls.FightButton
		Canvas.RenderTextButton(Button.Label, Button, Button.BackColor)
		Button = Controls.ExportButton
		Canvas.RenderTextButton(Button.Label, Button, Button.BackColor)

		for(i in this.Templates) {
			for(j in this.Templates[i]) {
				if (j.length > 1) continue

				if (this.Templates[i][j]) {
					this.RenderButton(Controls.UserSetButtons.Items[i], j, true)
				}
			}
		}

		this.SelectMap(this.MapIndex)
	}

//---------------------------------------------------------------------------
	this.SaveMap = function() {
		var Map = this.Snake.Maps[this.MapIndex]
		var Cells = []
		for(var i in this.Cells) Cells[i] = this.Cells[i].join('')
		Map.Lines = Cells.join('')
		Map.HeadX = this.HeadX
		Map.HeadY = this.HeadY
	}

//---------------------------------------------------------------------------
	this.SelectMap = function(Index) {
		var Maps = this.Snake.Maps
		var MapCnt = Maps.length
		var Map = Maps[Index]
		if (!Map) return

		var PrevBox = this.PrevMapControl
		var NextBox = this.NextMapControl

		var Btn = this.MapButtonControls
		Btn = {w: Btn.w, h: Btn.h, Data: Btn.Data, Items: Btn.Items.slice(0, MapCnt)}
		var Html = Canvas.MakeControlHtml(Btn)
		for(var i in Maps) {
			this.RenderButton(Btn, i, i == Index)
		}

		if (!Index) {
			Canvas.FillRect(ABox(PrevBox.x, PrevBox.y, 112, 112), '#ffffff')
		} else {
			Maps[Index - 1].Render(PrevBox.x, PrevBox.y)
			Html += Canvas.MakeControlHtml(PrevBox)
		}

		if (Index >= MapCnt - 1) {
			Canvas.FillRect(ABox(NextBox.x, NextBox.y, 112, 112), '#ffffff')
		} else {
			Maps[Index + 1].Render(NextBox.x, NextBox.y)
			Html += Canvas.MakeControlHtml(NextBox)
		}

		Canvas.RenderHtml('controls', this.BaseControlHtml + Html)

		//if (Index == this.MapIndex) return

		this.RenderButton(this.MapButtonControls, this.MapIndex, false)
		this.RenderButton(this.MapButtonControls, Index, true)
		this.MapIndex = Index
		this.RenderDescription()
		this.HeadX = Map.HeadX
		this.HeadY = Map.HeadY
		this.Cells = Map.Lines.chunk(14)

		var Controls = this.Controls.Items
		if (this.Group) this.RenderButton(Controls.GroupButtons, this.Group)
		if (this.Not) this.RenderButton(Controls.NotButton)
		if (this.Element) {
			switch(this.Element) {
				case '*':
					this.RenderButton(Controls.HeadButton)
				break

				case '-':
					this.RenderButton(Controls.ClearButton)
				break

				default:
					this.RenderButton(Controls.TemplateButtons, this.Element)
				break
			}
		}

		this.Group = null
		this.Element = null
		this.Not = false

		var Control = this.Controls.Items.Map
		for(var y in this.Cells) this.Cells[y] = this.Cells[y].chunk(2)

		Map.Render(Control.x, Control.y, 0, 32)
	}

//---------------------------------------------------------------------------
	this.MoveMap = function(Dir) {
		this.SaveMap()
		var NewIndex = this.MapIndex + Dir
		var Maps = this.Snake.Maps
		if (NewIndex < 0 || NewIndex >= Maps.length) return

		var t = Maps[this.MapIndex]
		Maps[this.MapIndex] = Maps[NewIndex]
		Maps[NewIndex] = t
		this.SelectMap(NewIndex)
	}

//---------------------------------------------------------------------------
	this.DrawCell = function(x, y, Cell) {
		var Control = this.Controls.Items.Map
		var dx = Control.x + (x << 5)
		var dy = Control.y + (y << 5)
		this.Cells[y][x] = Cell
		Cell = Cell.chunk()
		if (Cell[1] == '-') {
			Canvas.RenderSprite(Sprites.Get('32.Any'), dx, dy)
			if (x == this.HeadX && y == this.HeadY) {
				Canvas.RenderSprite(Sprites.Get('32.OwnHead'), dx, dy)
			}
		} else {
			Canvas.RenderSprite(Sprites.Get('32.Group.' + Cell[1]), dx, dy)
			var t = Cell[0].toUpperCase()
			Canvas.RenderSprite(Sprites.Get('32.' + t), dx, dy)
			if (t != Cell[0]) Canvas.RenderSprite(Sprites.Get('32.Not'), dx, dy)
		}
	}

//---------------------------------------------------------------------------
	this.PutCell = function(x, y) {
		if (x == this.HeadX && y == this.HeadY) return

		if (this.Element == '*') {
			var hx = this.HeadX
			var hy = this.HeadY
			this.HeadX = x
			this.HeadY = y
			this.DrawCell(hx, hy, '--')
			this.DrawCell(this.HeadX, this.HeadY, '--')
			return
		}

		if (this.Element == '-') {
			this.DrawCell(x, y, '--')
			return
		}

		var Cell = this.Cells[y][x].chunk()
		if (this.Element) Cell[0] = this.Element
		else {
			if (Cell[0] == '-') return
		}

		if (this.Group) Cell[1] = this.Group
		else {
			if (this.Element && Cell[1] == '-') Cell[1] = '0'
		}
		Cell[0] = (this.Not ? Cell[0].toLowerCase() : Cell[0].toUpperCase())
		this.DrawCell(x, y, Cell.join(''))
	}

//---------------------------------------------------------------------------
	this.HandleControlClick = function(Id) {
		var Maps = this.Snake.Maps
		switch(Id) {
			case 'upper':
				this.MoveMap(-1)
			break

			case 'lower':
				this.MoveMap(1)
			break

			case 'add': case 'copy':
				if (Maps.length >= 9) return

				this.SaveMap()
				Maps.push((Id == 'add' ? new ASnakeMap() : Clone(Maps[this.MapIndex])))
				this.SelectMap(Maps.length - 1)
			break

			case 'del':
				if (Maps.length <= 1) return

				Maps.splice(this.MapIndex, 1)
				if (this.MapIndex >= Maps.length) {
					this.SelectMap(Maps.length - 1)
				} else {
					this.SelectMap(this.MapIndex)
				}
				var t = this.MapButtonControls.Items[Maps.length]
				Canvas.FillRect(ABox(t.x, t.y, 32, 32), '#ffffff')
			break
		}
	}

//---------------------------------------------------------------------------
	this.HandleMapClick = function(x, y, Id) {
		if (!isNaN(parseInt(Id))) {
			this.SaveMap()
			this.SelectMap(parseInt(Id))
			return
		}

		switch(Id) {
			case 'map':
				this.PutCell(x >> 5, y >> 5)
			break

			case 'prev':
				this.SaveMap()
				this.SelectMap(this.MapIndex - 1)
			break

			case 'next':
				this.SaveMap()
				this.SelectMap(this.MapIndex + 1)
			break
		}
	}

//---------------------------------------------------------------------------
	this.HandleGroupClick = function(Id) {
		if (this.Element == '-' || this.Element == '*') {
			this.RenderButton(this.Controls, (this.Element == '*' ? 'HeadButton' : 'ClearButton'))
			this.Element = null
		}

		var Controls = this.Controls.Items.GroupButtons
		if (this.Group) {
			this.RenderButton(Controls, this.Group, false)
			if (this.Group == Id) {
				this.Group = null
				return
			}
		}
		this.RenderButton(Controls, Id, true)
		this.Group = Id
	}

//---------------------------------------------------------------------------
	this.HandleTemplateClick = function(Id) {
		var Controls = this.Controls.Items
		var Index = null
		var Element = this.Element
		if (Element != undefined) {
			switch(Element) {
				case '*': this.RenderButton(Controls.HeadButton); break
				case '-': this.RenderButton(Controls.ClearButton); break
				default: this.RenderButton(Controls.TemplateButtons, Element); break
			}
		}

		switch(Id) {
			case 'head': case 'clear':
				Id = (Id == 'head' ? '*' : '-')
				if (this.Group) {
					this.RenderButton(Controls.GroupButtons, this.Group)
					this.Group = null
				}
				if (Element == Id) {
					this.Element = null
				} else {
					this.Element = Id
					this.Group = null
					if (this.Not) {
						this.Not = false
						this.RenderButton(Controls.NotButton)
					}
					this.RenderButton(Controls[Id == '*' ? 'HeadButton' : 'ClearButton'], null, true)
				}
			break

			case 'not':
				this.Not = !this.Not
				if (Element == '*' || Element == '-') this.Element = null
				else this.RenderButton(Controls.TemplateButtons, Element, true)
				this.RenderButton(Controls.NotButton, null, this.Not)
			break

			default:
				if (Element == Id) {
					this.Element = null
				} else {
					this.Element = Id
					this.RenderButton(Controls.TemplateButtons, Id, true)
				}
			break
		}
	}

//---------------------------------------------------------------------------
	this.HandleSetClick = function(Template, Id) {
		var Set = this.Templates[Template]
		if (Set[Id]) {
			if (Set.Count <= 1) return

			Set[Id] = false
			Set.Count--
		} else {
			if (Set.Count >= 6) return

			Set[Id] = true
			Set.Count++
		}
		var t = []
		for(var i in Set) {
			if (i.length == 1 && Set[i]) t.push(i.toUpperCase())
		}
		this.Snake.Templates[{A: 0, B: 1, C: 2, D: 3}[Template]] = t.join('')
		this.RenderButton(this.Controls.Items.UserSetButtons.Items[Template], Id, Set[Id])
	}

//---------------------------------------------------------------------------
	this.HandleSkinClick = function() {
		var Html = []
		for(var i in SnakeSkins.SkinList) {
			var Id = SnakeSkins.SkinList[i]
			var Title = SnakeSkins.Skins[Id]
			Html.push(
				'<button class="skin skin' + Id + '" value="' + Id +
					'" onclick="Canvas.Input(this)" title="' + Title.encode() + '"></button>'
			)
		}
		Html = Html.join(' ')
		Canvas.RenderInputHtml(Html, 'Шкура для змеи', this.HandleInput, 'skin')
	}

//---------------------------------------------------------------------------
	this.HandleDescClick = function(Id) {
		if (Id == 'skin') return this.HandleSkinClick()

		var Params = {
			name: ['Имя змеи', 'text', this.Snake.SnakeName],
			program: ['Описание программы', 'textarea', this.Snake.ProgramDescription],
			map: ['Описание карты', 'textarea', this.Snake.Maps[this.MapIndex].Description],
		}
		Canvas.RenderInput(
			Params[Id][1], Params[Id][0], Params[Id][2], this.HandleInput, Id, true
		)
	}

//---------------------------------------------------------------------------
	this.HandleInput = function(Dataset, Id) {
		var Editor = TabSet.CurrentTab
		var Snake = Editor.Snake
		var Text = Dataset.value
		if (typeof Text == 'boolean') return

		if (Text) Text = Text.trim()

		switch(Id) {
			case 'name': {
				if (Text == Snake.SnakeName || Game.MySnakes.Exists(Text)) {
					alert('Змея с таким именем уже есть')
					return
				}

				if (!Text && Snake.SnakeName) {
					Game.MySnakes.Remove(Snake.SnakeName)
				} else {
					if (!Snake.SnakeName) {
						Snake.SnakeName = Text
						Game.MySnakes.Add(Snake)
					} else {
						if (!Game.MySnakes.Rename(Snake, Text)) return
					}
				}

				Editor.TabTitle = (Text ? Text : '<без имени>')
				Editor.RenderSnakeName()
				TabSet.RenderTabs()
			break }

			case 'program':
				Editor.Snake.ProgramDescription = Text
				Editor.RenderProgramDescription()
			break

			case 'map':
				Editor.Snake.Maps[Editor.MapIndex].Description = Text
				Editor.RenderDescription()
			break

			case 'skin':
				Editor.SetSkin(parseInt(Text))
				Editor.RenderButton(Editor.Controls, 'SkinId')
				TabSet.RenderTabs()
			break
		}
	}

//---------------------------------------------------------------------------
	this.SetSkin = function(Id) {
		var Skin = SnakeSkins.Get(Id)
		this.Snake.SkinId = Id
		this.TabSprite = Skin
		this.Controls.Items.SkinId.Sprite = Skin
		this.Controls.Items.SkinId.Title = Skin.Title
	}

//---------------------------------------------------------------------------
	this.HandleFightClick = function() {
		this.SaveMap()
		TabSet.Add(new AFightPlanner(this.Snake))
	}

//---------------------------------------------------------------------------
	this.HandleExportClick = function() {
		this.SaveMap()
		var w = window.open()
		w.document.open('text/plain')
		w.document.writeln(window.JSON.stringify(this.Snake.Serialize()))
		w.document.close()
		w.focus()
	}

//---------------------------------------------------------------------------
	this.OnClick = function(x, y, Dataset) {
		var Id = Dataset.id
		switch(Dataset.cls) {
			case 'ctl': this.HandleControlClick(Id); break
			case 'desc': this.HandleDescClick(Id); break
			case 'grp': this.HandleGroupClick(Id); break
			case 'map': this.HandleMapClick(x, y, Id); break
			case 'set': this.HandleSetClick(Dataset.usr, Id); break
			case 'tpl': this.HandleTemplateClick(Id); break
			case 'fight': this.HandleFightClick(); break
			case 'export': this.HandleExportClick(); break
		}
	}

//---------------------------------------------------------------------------
	this.Hide = function() {
		this.SaveMap()
	}

//---------------------------------------------------------------------------
	this.OnClose = function() {
		this.SaveMap()
		this.Snake.TabId = null
		return true
	}

//---------------------------------------------------------------------------
	this.Serialize = function() {
		this.SaveMap()
		return {
			Object: 'ASnakeEditor',
			Data: [this.Snake.SnakeName ? this.Snake.SnakeName : this.Snake.Serialize()]
		}
	}

//---------------------------------------------------------------------------
}
Extend(ASnakeEditor, BPageTab)

ASnakeEditor.Restore = function(Snake) {
	return new ASnakeEditor(Snake)
}
