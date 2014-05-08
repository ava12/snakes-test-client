function ASnakeViewer(Snake) {
	if (typeof Snake != 'object') Snake = Game.OtherSnakes.List[Snake]
	this.Snake = Snake
	this.TabTitle = (Snake.SnakeName ? Snake.SnakeName : '<без имени>')
	this.TabSprite = SnakeSkins.Get(Snake.SkinId)
	this.CurrentMap = 0

	this.TabControls = {Items: {
		ProgramDescription: {x: 251, y: 52, w: 381, h: 54,
			Data: {cls: 'desc', id: 'program'}, Back: false, Title: 'описание программы'},
		Description: {x: 21, y: 336, w: 224, h: 70, Data: {cls: 'desc', id: 'map'},
			Back: false, Title: 'описание карты'},
		MapButtons: {w: 32, h: 32,	Data: {cls: 'map'}, Items: [
			{x : 45, y: 409, id: '0', Title: 'карта № 1'},
			{x : 81, y: 409, id: '1', Title: 'карта № 2'},
			{x : 117, y: 409, id: '2', Title: 'карта № 3'},
			{x : 153, y: 409, id: '3', Title: 'карта № 4'},
			{x : 189, y: 409, id: '4', Title: 'карта № 5'},
			{x : 45, y: 445, id: '5', Title: 'карта № 6'},
			{x : 81, y: 445, id: '6', Title: 'карта № 7'},
			{x : 117, y: 445, id: '7', Title: 'карта № 8'},
			{x : 153, y: 445, id: '8', Title: 'карта № 9'},
		]},
		Maps: {w: 112, h: 112, Data: {cls: 'map'}, Items: [
			{x : 265, y: 116, id: '0', Title: 'карта № 1'},
			{x : 386, y: 116, id: '1', Title: 'карта № 2'},
			{x : 507, y: 116, id: '2', Title: 'карта № 3'},
			{x : 265, y: 237, id: '3', Title: 'карта № 4'},
			{x : 386, y: 237, id: '4', Title: 'карта № 5'},
			{x : 507, y: 237, id: '5', Title: 'карта № 6'},
			{x : 265, y: 358, id: '6', Title: 'карта № 7'},
			{x : 386, y: 358, id: '7', Title: 'карта № 8'},
			{x : 507, y: 358, id: '8', Title: 'карта № 9'},
		]},
		FightButton: {x: 562, y: 27, w: 70, h: 22, Data: {cls: 'fight'},
			Label: 'В бой!', BackColor: '#99ff99'},
	}}

	this.SkinControl = {x: 8, y: 29, w: 48, h: 16}
	this.NameControl = {x: 60, y: 27, w: 492, h: 22}
	this.MapControl = {x: 21, y: 109, w: 224, h: 224}

	this.Templates = {
		A: {x: 8, y: 52},
		B: {x: 8, y: 79},
		C: {x: 129, y: 52},
		D: {x: 129, y: 79},
	}


//---------------------------------------------------------------------------
	this.TabInit = function() {
		this.Snake.TabId = this.TabId
	}

//---------------------------------------------------------------------------
	this.RenderMapButton = function(Index, Selected) {
		var SpriteName = (Selected ? '32.Buttons.Front' : '32.Buttons.Back')
		var Button = this.TabControls.Items.MapButtons.Items[Index]
		Canvas.RenderSprite(Sprites.Get(SpriteName), Button.x, Button.y)
		Canvas.RenderSprite(Sprites.Get('16.Digits.' + (Index + 1)), Button.x + 8, Button.y + 8)
	}

//---------------------------------------------------------------------------
	this.RenderTextBox = function(Box, Text) {
		Canvas.RenderTextBox(Text, Box, '#000000', '#ffffff', '#000000')
	}

//---------------------------------------------------------------------------
	this.RenderMap = function(Index) {
		this.Snake.Maps[Index].Render(this.MapControl.x, this.MapControl.y, 0, 32)
		this.RenderTextBox(this.TabControls.Items.Description, this.Snake.Maps[Index].Description)
	}

//---------------------------------------------------------------------------
	this.HighlightMap = function(Index, Selected) {
		var Color = (Selected ? '#000000' : '#ffffff')
		var Ctl = this.TabControls.Items.Maps.Items[Index]
		Canvas.StrokeRect(ABox(Ctl.x - 5, Ctl.y - 5, 122, 122), Color)
		Canvas.StrokeRect(ABox(Ctl.x - 4, Ctl.y - 4, 120, 120), Color)
	}

//---------------------------------------------------------------------------
	this.SelectMap = function(Index) {
		Index = parseInt(Index)
		this.RenderMapButton(this.CurrentMap)
		this.RenderMapButton(Index, true)
		this.HighlightMap(this.CurrentMap)
		this.HighlightMap(Index, true)
		this.RenderMap(Index)
		this.CurrentMap = Index
	}

//---------------------------------------------------------------------------
	this.RenderMaps = function() {
		var MapCnt = this.Snake.Maps.length
		var Controls = this.TabControls.Items
		var SnakeMaps = this.Snake.Maps
		for(var i = 0; i < MapCnt; i++) {
			this.RenderMapButton(i)
			var Map = Controls.Maps.Items[i]
			SnakeMaps[i].Render(Map.x, Map.y)
		}
	}

//---------------------------------------------------------------------------
	this.RenderTemplates = function() {
		var Templates = this.Snake.Templates
		var Names = ['A', 'B', 'C', 'D']
		var ButtonSprite = Sprites.Get('16.Buttons.Back')
		for(var i in Names) {
			var Name = Names[i]
			var Template = String(Templates[i]).chunk()
			var x = this.Templates[Name].x
			var y = this.Templates[Name].y
			Canvas.RenderSprite(Sprites.Get('16.' + Name), x, y)
			for(var j in Template) {
				x += 17
				Canvas.RenderSprite(ButtonSprite, x, y)
				Canvas.RenderSprite(Sprites.Get('16.' + Template[j]), x, y)
			}
		}

	}

//---------------------------------------------------------------------------
	this.RenderBody = function() {
		this.RenderMaps()
		this.RenderTemplates()

		this.SelectMap(0)
		var Controls = this.TabControls.Items
		Canvas.RenderSprite(this.TabSprite, this.SkinControl.x, this.SkinControl.y)
		this.RenderTextBox(this.NameControl, this.TabTitle)
		this.RenderTextBox(Controls.ProgramDescription, this.Snake.ProgramDescription)
		var Button = Controls.FightButton
		Canvas.RenderTextBox(Button.Label, Button, '#000', Button.BackColor,
			'#000', 'center', 'middle')
	}

//---------------------------------------------------------------------------
	this.RenderDescription = function(Id) {
		var Params
		if (Id == 'program') {
			Params = ['div', 'Описание змеи', this.Snake.ProgramDescription]
		} else {
			Params = ['div', 'Описание карты', this.Snake.Maps[this.CurrentMap].Description]
		}
		Params[2] = Params[2].replace('\n', '<br>\n')
		Canvas.RenderInput(Params[0], Params[1], Params[2], null, null, false, false)
	}

//---------------------------------------------------------------------------
	this.OnClick = function(x, y, Dataset) {
		var Id = Dataset.id
		switch(Dataset.cls) {
			case 'map': this.SelectMap(Id); break
			case 'desc': this.RenderDescription(Id); break
			case 'fight': TabSet.Add(new AFightPlanner(this.Snake)); break
		}
	}

//---------------------------------------------------------------------------
	this.OnClose = function() {
		this.Snake.TabId = null
		return true
	}

//---------------------------------------------------------------------------
	this.Serialize = function() {
		var List = Game.OtherSnakes.List
		for(var i in List) if (List[i] == this.Snake) break
		return {Object: 'ASnakeViewer', Data: [i]}
	}

//---------------------------------------------------------------------------
	;(function() {
		var MapCnt = this.Snake.Maps.length
		var Controls = this.TabControls.Items
		Controls.Maps.Items = Controls.Maps.Items.slice(0, MapCnt)
		Controls.MapButtons.Items = Controls.MapButtons.Items.slice(0, MapCnt)
	}).apply(this)

//---------------------------------------------------------------------------
}
Extend(ASnakeViewer, BPageTab)

ASnakeViewer.Restore = function(Snake) {
	return new ASnakeViewer(Snake)
}
