function AList() {
	this.TabWidth = 24
	this.Buttons = []
	this.Fields = []
	this.BackColor = ['#ddddff', '#ddffdd']
	this.Items = []
	this.TabControls = {Items: []}
	this.ItemHeight = 30
	this.ItemWidth = 620
	this.TopY = 40

//---------------------------------------------------------------------------
	this.GetItemProperty = function(Item, Name) {
		Name = Name.split('.')
		for(var i = 0; i < Name.length; i++) Item = Item[Name[i]]
		return Item
	}

//---------------------------------------------------------------------------
	this.AddControl = function(Control) {
		this.TabControls.Items.push(Control)
	}

//---------------------------------------------------------------------------
	this.RenderTextButton = function(Item, Index, x, y, Params) {
		var BackColor = Params.BackColor
		if (!BackColor) BackColor = '#eeeeee'
		var Width = Params.Width
		if (!Width) Width = Canvas.GetTextMetrics(Params.Label).w + 8
		var Box = {x: x + 4, y: y + 4, w: Width, h: this.ItemHeight - 8}
		Canvas.RenderTextBox(Params.Label, Box, '#000000', BackColor, '#000000', 'center')
		Box.id = (Params.id ? Params.id : Index)
		if (Params.Title) Box.Title = Params.Title
		if (Params.Data) Box.Data = Params.Data
		this.AddControl(Box)
		return Width + 8
	}

//---------------------------------------------------------------------------
	this.RenderPropertyText = function(Item, Index, x, y, Params) {
		var Text = this.GetItemProperty(Item, Params.Property)
		var Width = Params.Width
		if (!Width) Width = Canvas.GetTextMetrics(Text).w
		Canvas.RenderText(Text, ABox(x + 4, y + 1, Width, this.ItemHeight - 2))
		return Width + 8
	}

//---------------------------------------------------------------------------
	this.RenderSkin = function(Item, Index, x, y) {
		var dy = (this.ItemHeight - 16) >> 1
		Canvas.RenderSprite(SnakeSkins.Get(Item.SkinId), x, y + dy)
		return 48
	}

//---------------------------------------------------------------------------
	this.RenderGap = function(Item, Index, x, y, Params) {
		return (Params.Width ? Params.Width : 4)
	}

//---------------------------------------------------------------------------
	this.RenderField = function(Field, Item, Index, x, y) {
		var Name = 'Render' + Field.Type
		return this[Name].call(this, Item, Index, x, y, Field)
	}

//---------------------------------------------------------------------------
	this.RenderItem = function(Item, y, Index) {
		var x = (640 - this.ItemWidth) >> 1
		var Color = this.BackColor[Index % this.BackColor.length]
		Canvas.FillRect(ABox(x, y, this.ItemWidth, this.ItemHeight), Color)
		var Fields = this.Fields
		for(var i = 0; i < Fields.length; i++) {
			x += this.RenderField(Fields[i], Item, Index, x, y)
		}
	}

//---------------------------------------------------------------------------
	this.RenderBody = function() {
		this.Clear()
		this.TabControls.Items = []
		var i, y = this.TopY
		if (this.Buttons.length) {
			var x = (640 - this.ItemWidth) >> 1
			for(i in this.Buttons) {
				x += this.RenderField(this.Buttons[i], null, null, x, y)
			}
			y += this.ItemHeight * 1.5
		}

		var Items = this.Items
		for(i = 0; i < Items.length; i++) {
			this.RenderItem(Items[i], y, i)
			y += this.ItemHeight
		}
		this.RenderControls()
	}

//---------------------------------------------------------------------------
	this.Serialize = function() {
		return {Object: 'AList', Data: []}
	}

//---------------------------------------------------------------------------
}
Extend(AList, BPageTab)


//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function ABotList() {
	this.Items = Game.OtherSnakes.List
	this.TabTitle = 'Боты'
	this.TabSprite = Sprites.Get('16.X')
	this.Fields = [
		{Type: 'Gap'},
		{Type: 'Skin'},
		{Type: 'PropertyText', Width: 472, Property: 'SnakeName'},
		{Type: 'TextButton', Width: 80, Label: 'Смотреть', BackColor: '#99ccff'},
	]

//---------------------------------------------------------------------------
	this.TabInit = function() {
		Game.OtherSnakes.TabId = this.TabId
	}

//---------------------------------------------------------------------------
	this.OnClose = function() {
		Game.OtherSnakes.TabId = null
		return true
	}

//---------------------------------------------------------------------------
	this.OnClick = function(x, y, Dataset) {
		var Snake = this.Items[Dataset.id]
		if (!Snake) return

		if (Snake.TabId) TabSet.Select(Snake.TabId)
		else TabSet.Add(new ASnakeViewer(Snake))
	}

//---------------------------------------------------------------------------
	this.Serialize = function() {
		return {Object: 'ABotList', Data: []}
	}

//---------------------------------------------------------------------------
}
Extend(ABotList, new AList())

ABotList.Restore = function() {
	return new ABotList()
}


//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function ASnakeList() {
	this.Items = Game.MySnakes.List
	this.TabTitle = 'Змеи'
	this.TabSprite = Sprites.Get('16.OwnHead')
	this.Buttons = [
		{Type: 'TextButton', Width: 70, Label: 'Новая', id: 'new', BackColor: '#9f9'},
		{Type: 'TextButton', Width: 70, Label: 'Импорт', id: 'import', BackColor: '#9f9'},
	]
	this.Fields = [
		{Type: 'Gap'},
		{Type: 'Skin'},
		{Type: 'PropertyText', Width: 332, Property: 'SnakeName'},
		{Type: 'TextButton', Width: 120, Label: 'Редактировать', BackColor: '#ff9',
			Data: {cls: 'edit'}},
		{Type: 'TextButton', Width: 90, Label: 'Удалить', BackColor: '#f99',
			Data: {cls: 'delete'}},
	]

//---------------------------------------------------------------------------
	this.TabInit = function() {
		Game.MySnakes.TabId = this.TabId
	}

//---------------------------------------------------------------------------
	this.OnClose = function() {
		Game.MySnakes.TabId = null
		return true
	}

//---------------------------------------------------------------------------
	this.OnClick = function(x, y, Dataset) {
		if (Dataset.id == 'new') {
			TabSet.Add(new ASnakeEditor())
			return
		}

		if (Dataset.id == 'import') {
			Canvas.RenderInput('textarea', 'Импорт змеи', '', function(Dataset, Context) {
				if (!Dataset.value) return

				try {
					var Snake = new ASnake(window.JSON.parse(Dataset.value))
					Snake.SnakeName = ''
					Snake.TabId = null
					TabSet.Add(new ASnakeEditor(Snake))
				}
				catch(e) {
					alert('Некорректный формат данных')
				}
			}, this, true)
			return
		}

		var Snake = this.Items[Dataset.id]
		switch(Dataset.cls) {
			case 'edit': {
				if (Snake.TabId) TabSet.Select(Snake.TabId)
				else TabSet.Add(new ASnakeEditor(Snake))
			break }

			case 'delete': {
				if (confirm('Вы действительно хотите удалить змею "' + Snake.SnakeName + '"?')) {
					if (Snake.TabId) TabSet.Close(Snake.TabId)
					Game.MySnakes.Remove(Snake.SnakeName)
					this.RenderBody()
				}
			}
		}
	}

//---------------------------------------------------------------------------
	this.Serialize = function() {
		return {Object: 'ASnakeList', Data: []}
	}

//---------------------------------------------------------------------------
;(function() {
	if (!window.JSON) delete this.Buttons[1]
}).apply(this)

//---------------------------------------------------------------------------
}
Extend(ASnakeList, new AList())

ASnakeList.Restore = function() {
	return new ASnakeList()
}


//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function AFightList() {
	this.Items = Game.Fights.List
	this.TabTitle = 'Бои'
	this.TabSprite = Sprites.Get('Attack')
	this.Buttons = [
		{Type: 'TextButton', Width: 100, Label: 'Новый бой', id: 'new', BackColor: '#9f9'},
		{Type: 'TextButton', Width: 100, Label: 'Импорт', id: 'import', BackColor: '#9f9'},
	]
	this.Fields = [
		{Type: 'DateTime', Width: 170},
		{Type: 'SnakeSkin', Index: 0, BackColor: '#ff9999'},
		{Type: 'SnakeSkin', Index: 1, BackColor: '#ffff66'},
		{Type: 'SnakeSkin', Index: 2, BackColor: '#66ee66'},
		{Type: 'SnakeSkin', Index: 3, BackColor: '#99ddff'},
		{Type: 'Gap', Width: 8},
		{Type: 'TextButton', Width: 90, Label: 'Смотреть', BackColor: '#99ccff',
			Data: {cls: 'view'}},
		{Type: 'Gap', Width: 8},
		{Type: 'TextButton', Width: 90, Label: 'Удалить', BackColor: '#ff9999',
			Data: {cls: 'delete'}},
	]

//---------------------------------------------------------------------------
	this.RenderSnakeSkin = function(Item, Index, x, y, Params) {
		var Snake = Item.Snakes[Params.Index]
		if (!Snake) return 56

		var dy = (this.ItemHeight - 16) >> 1
		var Box = {x: x + 4, y: y + dy, w: 48, h: 16, Title: Snake.SnakeName}
		Canvas.FillRect(Box, Params.BackColor)
		Canvas.RenderSprite(SnakeSkins.Get(Snake.SkinId), x + 4, y + dy)
		this.AddControl(Box)
		return 56
	}

//---------------------------------------------------------------------------
	this.RenderDateTime = function(Item, Index, x, y, Params) {
		var dt = new Date(Item.FightTime * 1000)
		var d = [dt.getDate(), dt.getMonth() + 1, dt.getFullYear()]
		var t = [dt.getHours(), dt.getMinutes(), dt.getSeconds()]
		for(var i in t) if (t[i] < 10) t[i] = '0' + t[i]
		dt = d.join('.') + ' ' + t.join(':')
		Canvas.RenderText(dt, ABox(x + 4, y + 1, Params.Width, this.ItemHeight - 2))
		return Params.Width + 8
	}

//---------------------------------------------------------------------------
	this.TabInit = function() {
		Game.Fights.TabId = this.TabId
	}

//---------------------------------------------------------------------------
	this.OnClose = function() {
		Game.Fights.TabId = null
		return true
	}

//---------------------------------------------------------------------------
	this.OnClick = function(x, y, Dataset) {
		if (Dataset.id == 'new') {
			TabSet.Add(new AFightPlanner())
			return
		}

		if (Dataset.id == 'import') {
			Canvas.RenderInput('textarea', 'Импорт боя', '', function(Dataset, Context) {
				if (!Dataset.value) return

				try {
					var Fight = new AFight(window.JSON.parse(Dataset.value))
					Fight.SlotIndex = null
					Fight.TabId = null
					TabSet.Add(new AFightViewer(Fight))
				}
				catch(e) {
					alert('Некорректный формат данных')
				}
			}, this, true)
			return
		}

		var Fight = this.Items[Dataset.id]
		switch(Dataset.cls) {
			case 'view': {
				if (Fight.TabId) TabSet.Select(Fight.TabId)
				else TabSet.Add(new AFightViewer(Fight))
			break }

			case 'delete': {
				if (confirm('Вы действительно хотите удалить этот бой?')) {
					//if (Fight.TabId) TabSet.Close(Fight.TabId)
					Game.Fights.Remove(this.Items[Dataset.id])
					this.RenderBody()
				}
			break }
		}

//		if (Snake.TabId) TabSet.Select(Snake.TabId)
//		else TabSet.Add(new ASnakeEditor(Snake))
	}

//---------------------------------------------------------------------------
	this.Serialize = function() {
		return {Object: 'AFightList', Data: []}
	}

//---------------------------------------------------------------------------
;(function() {
	if (!window.JSON) delete this.Buttons[1]
}).apply(this)

//---------------------------------------------------------------------------
}
Extend(AFightList, new AList())

AFightList.Restore = function() {
	return new AFightList()
}

