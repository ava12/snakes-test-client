
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
var BPageTab = {
	TabId: null,
	TabPos: 0,
	TabWidth: 64,
	TabSprite: null,
	TabBorderColor: '#666666',
	TabBackColor: '#dddddd',
	TabSelectedColor: '#ffffff',
	TabControlHtml: null,
	TabImageData: null,
	TabControls: {},
	TabTitle: false,
	TabStackIndex: 0,

//---------------------------------------------------------------------------
	TabInit: function() {},

//---------------------------------------------------------------------------
	RenderBody: function() {},

//---------------------------------------------------------------------------
	RenderControls: function() {
		this.TabControlHtml = Canvas.MakeControlHtml(this.TabControls)
		Canvas.RenderHtml('controls', this.TabControlHtml)
	},

//---------------------------------------------------------------------------
	OnClick: function(x, y, Dataset) {},

//---------------------------------------------------------------------------
	RenderTab: function(Selected) {
		if (!this.TabSprite) return

		var dx = this.TabPos + ((this.TabWidth - this.TabSprite.w) >> 1)
		var dy = 2 + ((22 - this.TabSprite.h) >> 1)
		Canvas.RenderSprite(this.TabSprite, dx, dy)
	},

//---------------------------------------------------------------------------
	OnClose: function() {
		return true
	},

//---------------------------------------------------------------------------
	SaveControlHtml: function() {
		this.TabControlHtml = Canvas.GetHtml('controls')
	},

//---------------------------------------------------------------------------
	RestoreControlHtml: function() {
		if (this.TabControlHtml) Canvas.RenderHtml('controls', this.TabControlHtml)
		else this.RenderControls()
	},

//---------------------------------------------------------------------------
	SaveImageData: function() {
		//this.TabImageData = Canvas.GetImageData(0, 24)
	},

//---------------------------------------------------------------------------
	RestoreImageData: function() {
		if (!this.TabImageData) {
			Canvas.FillRect(this.TabBox, '#ffffff')
			this.RenderBody()
		}
		else Canvas.SetImageData(this.TabImageData, TabSet.TabBox.x, TabSet.TabBox.y)
	},

//---------------------------------------------------------------------------
	OnShow: function() {},
	OnHide: function() {},

//---------------------------------------------------------------------------
	Show: function() {
		this.OnShow()
		Canvas.FillRect(TabSet.TabBox, '#ffffff')
		this.RestoreControlHtml()
		this.RenderBody()
	},

//---------------------------------------------------------------------------
	Hide: function() {
		this.OnHide()
	},

//---------------------------------------------------------------------------
	IsActive: function() {
		return (TabSet.CurrentTab == this)
	},

//---------------------------------------------------------------------------
	Clear: function() {
		this.TabImageData = null
		this.TabControlHtml = null
		if (this.IsActive) Canvas.FillRect(TabSet.TabBox, '#ffffff')
	},

//---------------------------------------------------------------------------
	Serialize: function() {
		return null //{Object: '', Data: []}
	}

//---------------------------------------------------------------------------
}


//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function AMainPageTab() {
	this.TabPos = 2
	this.TabWidth = 24
//	this.TabSprite = Sprites.Get('16.OwnHead')
	this.TabTitle = 'Главная'
	this.TabStackIndex = 0
	this.TabControls = {w: 200, h: 50, BackColor: '#99ccff', Items: {
		Bots: {x: 70, y: 127, Label: 'Боты', id: 'Bots', List: Game.OtherSnakes, Tab: ABotList},
		Snakes: {x: 70, y: 227, Label: 'Змеи', id: 'Snakes', List: Game.MySnakes, Tab: ASnakeList},
		Fights: {x: 70, y: 327, Label: 'Бои', id: 'Fights', List: Game.Fights, Tab: AFightList},
		Help: {x: 370, y: 127, Label: 'Справка', id: 'Help'},
		Save: {x: 370, y: 227, Label: 'Сохранить данные', id: 'Save',
			EmptyColor: '#99ff99', SavedColor: '#eeee99'},
		Remove: {x: 370, y: 327, Label: 'Удалить данные', id: 'Remove',
			EmptyColor: '#cccccc', SavedColor: '#ff9999'},
	}}

	if (!Game.CanSave) {
		delete this.TabControls.Items.Save
		delete this.TabControls.Items.Remove
	}

//---------------------------------------------------------------------------
	this.RenderSaveRemove = function() {
		if (!Game.CanSave) return

		var Controls = this.TabControls.Items
		var Box = {w: this.TabControls.w, h: this.TabControls.h}
		var Lists = ['Save', 'Remove']
		for(var i in Lists) {
			var Control = Controls[Lists[i]]
			Box.x = Control.x
			Box.y = Control.y
			var Color = (Game.HasData() ? Control.SavedColor : Control.EmptyColor)
			Canvas.RenderTextBox(
				Control.Label, Box, '#000000', Color, '#000000', 'center', 'middle'
			)
		}
	}

//---------------------------------------------------------------------------
	this.RenderBody = function() {
		var Controls = this.TabControls.Items
		var Box = {w: this.TabControls.w, h: this.TabControls.h}
		var BackColor = this.TabControls.BackColor

		var Lists = ['Bots', 'Snakes', 'Fights', 'Help']
		for(var i in Lists) {
			var Control = Controls[Lists[i]]
			Box.x = Control.x
			Box.y = Control.y
			var Label = Control.Label
			if (Control.List) Label += ' (' + Control.List.List.length + ')'
			Canvas.RenderTextBox(Label, Box, '#000000', BackColor, '#000000', 'center', 'middle')
		}

		this.RenderSaveRemove()
	}

//---------------------------------------------------------------------------
	this.OnClick = function(x, y, Dataset) {
		switch(Dataset.id) {
			case 'Bots': case 'Snakes': case 'Fights':
				var Control = this.TabControls.Items[Dataset.id]
				if (Control.List.TabId) TabSet.Select(Control.List.TabId)
				else TabSet.Add(new Control.Tab())
			break

			case 'Help':
				var t = window.open('help.html', 'SnakesHelp')
				window.blur()
				t.focus()
			break

			case 'Save':
				if (Game.HasData() && !confirm('Переписать сохраненные данные?')) return

				Game.Save()
				this.RenderSaveRemove()
			break

			case 'Remove':
				if (Game.HasData() && !confirm('Удалить сохраненные данные?')) return

				Game.Remove()
				this.RenderSaveRemove()
			break
		}
	}

//---------------------------------------------------------------------------
	this.OnClose = function() {
		return false
	}

//---------------------------------------------------------------------------
}
Extend(AMainPageTab, BPageTab)


//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
var TabSet = {
	MainTab: null,
	Tabs: [],
	TabIndex: {},
	CurrentTab: null,
	TabStack: [],

	TabViewPos: 52,
	TabViewWidth: 546,
	TabSetPos: 0,
	TabSetWidth: 0,
	TabBox: {x: 0, y: 24, w: 640, h: 480},

	Controls: {w: 16, h: 16, y: 4, Data: {cls: 'tabs'}, Items: [
		{x: 2, y: 0, w: 24, h: 24, Title: 'Главная закладка'},
		{x: 30, Data: {id: 'left'}, Title: 'прокрутить влево', Sprite: '16.Buttons.Left'},
		{x: 602, Data: {id: 'right'}, Title: 'прокрутить вправо', Sprite: '16.Buttons.Right'},
		{x: 622, Data: {id: 'close'}, Title: 'закрыть вкладку', Sprite: '16.Buttons.Del'},
	]},

//---------------------------------------------------------------------------
	Hide: function(Tab) {
		Tab.Hide()
		if (Tab == this.MainTab) this.RenderTab(Tab, false)
	},

//---------------------------------------------------------------------------
	Show: function(Tab) {
		Tab.Show()
		if (Tab == this.MainTab) this.RenderTab(Tab, true)
	},

//---------------------------------------------------------------------------
	RenderTab: function(Tab, Selected) {
		var SpriteStyle = (Selected ? 'Tabs.Front' : 'Tabs.Back')
		var LeftSprite = Sprites.Get(SpriteStyle + 'Left')
		LeftSprite.w = Tab.TabWidth - 8
		var RightSprite = Sprites.Get(SpriteStyle + 'Right')
		Canvas.RenderSprite(LeftSprite, Tab.TabPos, 0)
		Canvas.RenderSprite(RightSprite, Tab.TabPos + LeftSprite.w, 0)
		Tab.RenderTab(Selected)
	},

//---------------------------------------------------------------------------
	RenderTabs: function() {
		var TabSetPos = this.TabSetPos
		var TabViewPos = this.TabViewPos
		var TabViewWidth = this.TabViewWidth
		var CurrentTab = this.CurrentTab

		var TabViewBox = ABox(TabViewPos, 0, TabViewWidth, 24)
		Canvas.SaveState()
		Canvas.Clip(TabViewBox)
		Canvas.FillRect(TabViewBox, '#dddddd')
		Canvas.Line(TabViewPos, 23, TabViewPos + TabViewWidth, 23, '#666666', 2)

		var Controls = {y: 0, h: 24, Items: [], Data: {cls: 'tabs'}}
		Canvas.Translate(TabSetPos + TabViewPos, 0)
		for(var i in this.Tabs) {
			var Tab = this.Tabs[i]
			var TabPos = Tab.TabPos + TabSetPos
			if (TabPos < TabViewWidth && (TabPos + Tab.TabWidth) > 0) {
				this.RenderTab(Tab, Tab == CurrentTab)
				Controls.Items.push(
					{x: TabPos, w: Tab.TabWidth, Data: {id: Tab.TabId}, Title: Tab.TabTitle}
				)
			}
		}
		Canvas.RestoreState()
		Canvas.RenderHtml('tabs', Canvas.MakeControlHtml(Controls))
	},

//---------------------------------------------------------------------------
	Select: function(Id) {
/*
		if (Id) {
			if (Id == this.CurrentTab.TabId) return
		}
		else {
			if (this.CurrentTab == this.MainTab) return
		}
*/
		this.Hide(this.CurrentTab)

		if (Id) this.CurrentTab = this.Tabs[this.TabIndex[Id]]
		else this.CurrentTab = this.MainTab
		if (this.CurrentTab) {
			this.Show(this.CurrentTab)
			this.AlignTab(this.CurrentTab)
			for(var i = this.CurrentTab.TabStackIndex + 1; i < this.TabStack.length; i++) {
				this.TabStack[i].TabStackIndex--
			}
			this.TabStack.push(this.TabStack.splice(this.CurrentTab.TabStackIndex, 1)[0])
			this.CurrentTab.TabStackIndex = this.TabStack.length - 1
		}
		this.RenderTabs()
	},

//---------------------------------------------------------------------------
	Add: function(Tab) {
		Tab.TabId = NewId()
		this.Tabs.push(Tab)
		this.TabIndex[Tab.TabId] = this.Tabs.length - 1
		Tab.TabPos = this.TabSetWidth + 2
		this.TabSetWidth += Tab.TabWidth + 2
		Tab.TabStackIndex = this.TabStack.length
		this.TabStack.push(Tab)
		Tab.TabInit()
		this.Select(Tab.TabId)
	},

//---------------------------------------------------------------------------
	Close: function(TabId) {
		if (!TabId) TabId = this.CurrentTab.TabId
		if (!TabId) return false

		var Index = this.TabIndex[TabId]
		var Current = this.Tabs[Index]
		if (!Current.OnClose()) return false

		Current.Hide()
		for(var i = Current.TabStackIndex + 1; i < this.TabStack.length; i++) {
			this.TabStack[i].TabStackIndex--
		}
		this.TabStack.splice(Current.TabStackIndex, 1)

		this.Tabs.splice(Index, 1)
		delete this.TabIndex[Current.TabId]

		var LastIndex = this.Tabs.length - 1

		if (Index > LastIndex) {
			this.TabSetWidth = Current.TabPos
			if (this.Tabs.length) this.TabSetWidth -= 2
		} else {
			var Width = this.Tabs[Index].TabPos - Current.TabPos
			this.TabSetWidth -= Width
			for(; Index <= LastIndex; Index++) {
				this.TabIndex[this.Tabs[Index].TabId] = Index
				this.Tabs[Index].TabPos -= Width
			}
		}

		if (this.TabSetWidth <= this.TabViewWidth) this.TabSetPos = 0
		else if (this.TabSetWidth + this.TabSetPos < this.TabViewWidth) {
			this.TabSetPos = this.TabViewWidth - this.TabSetWidth
		}

		if (Current == this.CurrentTab) this.Select(this.TabStack[this.TabStack.length - 1].TabId)
		else this.RenderTabs()
		return false
	},

//---------------------------------------------------------------------------
	AlignTab: function(Tab) {
		if (Tab.TabPos < -this.TabSetPos) {
			this.TabSetPos = Tab.TabPos
			return
		}

		var RightDif = (this.TabSetPos + this.TabViewWidth) - (Tab.TabPos + Tab.TabWidth)
		if (RightDif < 0) {
			this.TabSetPos = RightDif - this.TabSetPos
			return
		}
	},

//---------------------------------------------------------------------------
	ScrollLeft: function() {
		var TabSetPos = -this.TabSetPos
		if (TabSetPos <= 0) return

		var Tab = this.Tabs[0]
		var Index = 0
		while(Tab.TabPos < TabSetPos) {
			Index++
			Tab = this.Tabs[Index]
		}
		if (Index > 0) {
			Tab = this.Tabs[Index - 1]
			this.TabSetPos = -Tab.TabPos
		}
		this.RenderTabs()
	},

//---------------------------------------------------------------------------
	ScrollRight: function() {
		var TabsRight = this.TabViewWidth - this.TabSetPos
		var Index = this.Tabs.length - 1
		if (Index < 0) return

		var Tab = this.Tabs[Index]
		while((Tab.TabPos + Tab.TabWidth) > TabsRight) {
			Index--
			Tab = this.Tabs[Index]
		}
		if (Index < this.Tabs.length - 1) {
			Tab = this.Tabs[Index + 1]
			this.TabSetPos = this.TabViewWidth - Tab.TabPos - Tab.TabWidth
		}
		this.RenderTabs()
	},

//---------------------------------------------------------------------------
	OnClick: function(x, y, Dataset) {
		if (Dataset.cls != 'tabs') return TabSet.CurrentTab.OnClick(x, y, Dataset)

		if (!Dataset.id) return TabSet.Select()

		switch(Dataset.id) {
			case 'close': TabSet.Close(); break
			case 'left': TabSet.ScrollLeft(); break
			case 'right': TabSet.ScrollRight(); break
			default: TabSet.Select(Dataset.id); break
		}
	},

//---------------------------------------------------------------------------
	Render: function() {
		Canvas.Line(0, 23, 640, 23, '#666666', 2)

		for(var i in this.Controls.Items) {
			var Control = this.Controls.Items[i]
			if (Control.Sprite) {
				Canvas.RenderSprite(Sprites.Get(Control.Sprite), Control.x, 4)
			}
		}

		this.Show(this.CurrentTab)
	},

//---------------------------------------------------------------------------
	Init: function() {
		this.MainTab = new AMainPageTab()
		this.CurrentTab = this.MainTab
		this.TabStack = [this.MainTab]
		Canvas.ClickHandler = this.OnClick
		Canvas.RenderHtml('tab_controls', Canvas.MakeControlHtml(this.Controls))
		this.Render()
	},

//---------------------------------------------------------------------------
	Serialize: function() {
		var Result = []
		for(var i in this.Tabs) {
			var t = this.Tabs[i].Serialize()
			if (t) Result.push(t)
		}
		return Result
	},

//---------------------------------------------------------------------------
	Restore: function(Data) {
		this.Tabs = []
		this.TabIndex = {}
		this.TabSetPos = 0
		this.TabSetWidth = 0
		for(var i in Data) {
			this.Add(window[Data[i].Object].Restore.apply(window[Data[i].Object], Data[i].Data))
		}
		this.Select()
	},

//---------------------------------------------------------------------------
	Replace: function(Id, Tab) {
		if (typeof Id == 'object') Id = Id.TabId
		var Index = this.TabIndex[Id]
		if (Index == undefined) return false

		var OldTab = this.Tabs[Index]
		Tab.TabId = OldTab.TabId
		Tab.TabPos = OldTab.TabPos
		Tab.TabStackIndex = OldTab.TabStackIndex
		this.Tabs[Index] = Tab
		this.TabStack[Tab.TabStackIndex] = Tab

		var dw = Tab.TabWidth - OldTab.TabWidth
		if (dw) {
			this.TabSetWidth += dw
			for(var i = Index + 1; i < this.Tabs.length; i++) {
				this.Tabs[i].TabPos += dw
			}
		}

		Tab.TabInit()
		if (Id == this.CurrentTab.TabId) {
			this.CurrentTab = Tab
			Tab.Show()
		}
		this.RenderTabs()
		return true
	}

//---------------------------------------------------------------------------
}
