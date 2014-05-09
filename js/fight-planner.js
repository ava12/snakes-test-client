function AFightPlanner(Fight) {
	this.TabTitle = 'бой'
	this.TabSprite = Sprites.Get('Fight')
	if (Fight instanceof AFight) {
		if (!Fight.FightTime) this.Fight = Fight
		else return new AFightViewer(Fight)
	} else {
		this.Fight = new AFight()
		if (Fight instanceof ASnake) this.Fight.Snakes[0] = Fight
	}

	this.MaxTurnLimit = 1000

	this.SnakeListColors = ['#f99', '#ee6', '#6e6', '#9df']

	this.TabControls = {Items: {
		SnakeButtons: {Items: [
			{Items: {Change: {x: 20, y: 41, w: 500, h: 28, Data: {cls: 'change', id: 0}},
				Remove: {x: 530, y: 41, w: 100, h: 28, Data: {cls: 'remove', id: 0}}}},
			{Items: {Change: {x: 20, y: 71, w: 500, h: 28, Data: {cls: 'change', id: 1}},
				Remove: {x: 530, y: 71, w: 100, h: 28, Data: {cls: 'remove', id: 1}}}},
			{Items: {Change: {x: 20, y: 101, w: 500, h: 28, Data: {cls: 'change', id: 2}},
				Remove: {x: 530, y: 101, w: 100, h: 28, Data: {cls: 'remove', id: 2}}}},
			{Items: {Change: {x: 20, y: 131, w: 500, h: 28, Data: {cls: 'change', id: 3}},
				Remove: {x: 530, y: 131, w: 100, h: 28, Data: {cls: 'remove', id: 3}}}},
		]},
		TurnRuler: {x: 70, y: 180, w: 500, h: 16, Title: 'Лимит ходов',
			Data: {cls: 'ruler'}},
		TurnCounter: {x: 285, y: 209, w: 50, h: 22, Title: 'Лимит ходов',
			Data: {cls: 'limit'}},
		TurnButtons: {w: 16, h: 16, Data: {cls: 'turn'}, Items: [
			{x: 242, y: 212, Title: '-10', id: '-10', Sprite: '16.Labels.First'},
			{x: 262, y: 212, Title: '-1', id: '-1', Sprite: '16.Labels.Back'},
			{x: 342, y: 212, Title: '+1', id: '1', Sprite: '16.Labels.Forth'},
			{x: 362, y: 212, Title: '+10', id: '10', Sprite: '16.Labels.Last'},
		]},
		RunButton: {x: 275, y: 260, w: 70, h: 30, Label: 'В бой!',
			Data: {cls: 'run'}},
	}}
	this.ListBox = {x: 10, y: 40, w: 500, h: 30}
	this.ListItems = {
		Skin: {x: 20, y: 47, w: 48, h: 16},
		Name: {x: 80, y: 41, w: 415, h: 28},
		Remove: {x: 520, y: 42, w: 100, h: 26, Color: '#ffcccc', Label: 'Убрать'},
	}


//---------------------------------------------------------------------------
	this.TabInit = function() {
		this.Fight.TabId = this.TabId
	}

//---------------------------------------------------------------------------
	this.OnClose = function() {
		this.Fight.TabId = null
		return true
	}

//---------------------------------------------------------------------------
	this.RenderTurnRuler = function(Value) {
		var RulerBox = this.TabControls.Items.TurnRuler
		var CounterBox = this.TabControls.Items.TurnCounter
		Canvas.FillRect(ABox(RulerBox.x - 4, RulerBox.y, RulerBox.w + 8, RulerBox.h), '#ffffff')
		Canvas.Rect(RulerBox, '#dddddd', '#000000')
		var MarkX = RulerBox.x + Value * RulerBox.w / this.MaxTurnLimit
		Canvas.Rect(ABox(MarkX - 4, RulerBox.y, 8, RulerBox.h), '#99ff99', '#000000')
		Value = Value.toString()
		Canvas.RenderTextBox(Value, CounterBox, '#000000', '#ffffff', '#000000',
			'center')
	}

//---------------------------------------------------------------------------
	this.RenderSnake = function(Index) {
		var Snake = this.Fight.Snakes[Index]
		if (!Snake) return

		var dy = this.ListBox.h * Index
		var Skin = SnakeSkins.Get(Snake.SkinId)
		var Items = this.ListItems
		Canvas.RenderSprite(Skin, Items.Skin.x, Items.Skin.y + dy)
		var Box = {x: Items.Name.x, y: Items.Name.y + dy, w: Items.Name.w, h: Items.Name.h}
		Canvas.RenderTextBox(Snake.SnakeName, Box, '#000000', this.SnakeListColors[Index])
	}

//---------------------------------------------------------------------------
	this.RenderSnakeList = function() {
		var Box = Clone(this.ListBox)
		var Buttons = [/*'Change', */'Remove']
		var Items = this.TabControls.Items.SnakeButtons.Items
		var ListItems = Clone(this.ListItems)

		for(var i = 0; i < 4; i++) {
			Canvas.FillRect(Box, this.SnakeListColors[i])
			for(var j in Buttons) {
				var Button = ListItems[Buttons[j]]
				if (Items[i]) {
					Canvas.RenderTextBox(Button.Label, Button, '#000000',
					                     Button.Color, '#000000', 'center')
				}
				Button.y += Box.h
			}
			this.RenderSnake(i)
			Box.y += Box.h
		}
	}

//---------------------------------------------------------------------------
	this.RenderBody = function() {
		this.RenderSnakeList()
		this.RenderTurnRuler(this.Fight.TurnLimit)

		var Buttons = this.TabControls.Items.TurnButtons.Items
		for(var i in Buttons) {
			var Button = Buttons[i]
			Canvas.RenderSprite(Sprites.Get(Button.Sprite), Button.x, Button.y)
		}
		Button = this.TabControls.Items.RunButton
		Canvas.RenderTextBox(Button.Label, Button, '#000000', '#99ff99',
			'#000000', 'center', 'middle')
	}

//---------------------------------------------------------------------------
	this.ShowSnakeList = function(Index) {
		var Lists = [
			[Game.OtherSnakes.List, 'Боты', 'b'],
			[Game.MySnakes.List, 'Змеи', 'n'],
		]
		var Html = ''
		for(var i in Lists) {
			var List = Lists[i]
			Html += '<div class="snake-list-frame"><h3>' + List[1] + '</h3>\r\n<ul class="snake-list">\r\n'
			var Class = List[2]
			List = List[0]
			for(var j in List) {
				var Snake = List[j]
				var Name = Snake.SnakeName.encode()
				Html += '<li data-cls="' + Class + '" data-id="' + j +
					'" title="' + Name +
					'" onclick="Canvas.Input(this)">' +
					'<span class="skin skin' + Snake.SkinId +'"></span>' +
					Name + '</li>\r\n'
			}
			Html += '</ul></div>\r\n'
		}

		Canvas.RenderInputHtml(Html, '', function(Dataset, Tab) {
			Tab.Fight.Snakes[Index] =
				(Dataset.cls == 'b' ? Game.OtherSnakes : Game.MySnakes).
				List[Dataset.id]
			Tab.RenderBody()
		}, this, false)
	}

//---------------------------------------------------------------------------
	this.RunFight = function() {
		var HasSnakes = false
		for(var i in this.Fight.Snakes) {
			if (this.Fight.Snakes[i]) {
				HasSnakes = true
				break
			}
		}
		if (!HasSnakes) {
			alert('Назначьте хотя бы одну змею!')
			return
		}

		var Processor = new AFightProcessor(this.Fight)
		var Html = '<div class="fight-run">Расчет боя: ' +
			'<span id="fight-turn">0</span>/' + this.Fight.TurnLimit + '</div>'
		Canvas.RenderHtml('controls', Html)
		var CounterDom = document.getElementById('fight-turn')
		Processor.TurnAlert = function(Turn) {
			CounterDom.innerHTML = Turn
		}
		var Fight = new AFight(Processor.Process())
		Fight.Turns.push(0)
		TabSet.Replace(this.TabId, new AFightViewer(Fight))
	}

//---------------------------------------------------------------------------
	this.OnClick = function(x, y, Dataset) {
		switch(Dataset.cls) {
			case 'ruler':
				this.Fight.TurnLimit = (x * this.MaxTurnLimit / this.TabControls.Items.TurnRuler.w + 1)
				this.RenderTurnRuler(this.Fight.TurnLimit)
			break

			case 'turn':
				var Limit = this.Fight.TurnLimit + parseInt(Dataset.id)
				if (Limit < 1) Limit = 1
				if (Limit > this.MaxTurnLimit) Limit = this.MaxTurnLimit
				this.Fight.TurnLimit = Limit
				this.RenderTurnRuler(Limit)
			break

			case 'limit':
				var Limit = parseInt(prompt('Лимит ходов:', this.Fight.TurnLimit))
				if (Limit > 0 && Limit <= this.MaxTurnLimit) {
					this.Fight.TurnLimit = Limit
					this.RenderTurnRuler(Limit)
				}
			break

			case 'change':
				this.ShowSnakeList(Dataset.id)
			break

			case 'remove':
				this.Fight.Snakes[Dataset.id] = null
				this.RenderBody()
			break

			case 'run':
				this.RunFight()
			break
		}
	}

//---------------------------------------------------------------------------
	;(function() {
		var FirstSnake = this.Fight.Snakes[0]
		if (FirstSnake && !FirstSnake.SnakeName) {
			delete this.TabControls.Items.SnakeButtons.Items[0]
		}
	}).call(this)

//---------------------------------------------------------------------------
}
Extend(AFightPlanner, BPageTab)
