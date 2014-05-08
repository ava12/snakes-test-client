
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
function ACanvas(Canvas, HtmlLayers) {
	if (typeof Canvas == 'string') Canvas = document.getElementById(Canvas)
	this.DrawContext = Canvas.getContext('2d')
	this.Width = Canvas.width
	this.Height = Canvas.height
	this.HtmlLayers = {}
	this.ClickHandler = function(x, y, Dataset) {}
	this.FontFamily = 'sans-serif'
	this.FontSize = 10
	this.LineHeight = 15

	for(var i in HtmlLayers) {
		this.HtmlLayers[i] = HtmlLayers[i]
	}

	this.Transform = [
		[1, 0, 0, 1, 0, 0, 0, 0],
		[0, 1, -1, 0, 0, 0, 1, 0],
		[-1, 0, 0, -1, 1, 1, 0, 0],
		[0, -1, 1, 0, 0, 0, 0, 1],

		[-1, 0, 0, 1, 1, 0, 0, 0],
		[0, -1, -1, 0, 0, 0, 1, 1],
		[1, 0, 0, -1, 0, 1, 0, 0],
		[0, 1, 1, 0, 0, 0, 0, 0],
	]

	this.SavedHtml = null

	this.InputApplyButtonHtml =
		'<input type="button" value="Сохранить" onclick="Canvas.Input(true)">'
	this.InputFrameHtml =
		'<div class="input"><div><div class="title">{{title}}</div><br>{{input}}' +
		'<br><br>{{apply}}' +
		' <input type="button" value="Закрыть" onclick="Canvas.Input(false)"></div></div>'
	this.InputHtml = {
		text: '<input type="text" id="canvas-input" value="{{value}}">',
		textarea: '<textarea id="canvas-input">{{value}}</textarea>',
		div: '<div class="content">{{value}}</div>',
	}
	this.InputHandler = null
	this.InputContext = null

//---------------------------------------------------------------------------
	this.MakeControlHtml = function(Control, Context) {
		if (typeof Control == 'string' || typeof Control == 'number') {
			Control = {Data: {id: Control}}
		}
		if (Context == undefined) Context = {}
		else Context = Clone(Context)
		for(var i in Control) {
			switch(i) {
				case 'Items': case 'prototype':
					continue
				break

				case 'Data':
					if (!Context.Data) Context.Data = {}
					for(var j in Control.Data) Context.Data[j] = Control.Data[j]
				break

				case 'id':
					if (!Context.Data) Context.Data = {}
					Context.Data.id = Control.id
				break

				default:
					Context[i] = Control[i]
				break
			}
		}

		if (!Control.Items) {
			var Class = (Context.Class ? ' class="' + Context.Class + '"': '')
			var Result = ['<div ' + Class]
			for(i in Context.Data) {
				if (i == 'prototype') continue

				Result.push(' data-' + i + '="' + Context.Data[i] + '"')
			}
			if (Context.Title) Result.push(' title="' + Context.Title.encode() + '"')
			Result.push(' style="')
			var Css = {x: 'left', y: 'top', w: 'width', h: 'height'}
			for(i in Css) {
				if (Context[i] != undefined) {
					Result.push(Css[i] + ':' + Context[i] + 'px;')
				}
			}
			Result.push('"></div>\n')
			return Result.join('')
		}

		var Result = []

		if (!Control.Type) {
			for(i in Control.Items) {
				Result.push(this.MakeControlHtml(Control.Items[i], Context))
			}
			return Result.join('')
		}

		switch(Control.Type) {
			case 'grid':
				var BaseX = Context.x
				for(var i in Control.Items) {
					var Row = Control.Items[i]
					Context.x = BaseX
					for(var j in Row) {
						Result.push(this.MakeControlHtml(Row[j], Context))
						Context.x += Context.dx
					}
					Context.y += Context.dy
				}
			break;

			case 'box':
				var BaseX = Context.x
				if (!Context.bdx) Context.bdx = 0
				if (!Context.bdy) Context.bdy = 0
				for(var i in Control.Items) {
					Result.push(this.MakeControlHtml(Control.Items[i], Context))
					Context.x += Context.dx
					if (Context.x > Context.dw + BaseX) {
						Context.x = BaseX + Context.bdx
						Context.y += Context.bdy
					}
				}
			break;
		}

		return Result.join('')
	}

//---------------------------------------------------------------------------
	this.RenderHtml = function(LayerName, Html) {
		var Layer = document.getElementById(this.HtmlLayers[LayerName])
		if (!Layer) return null

		if (Html == undefined) Html = ''
		var Result = Layer.innerHTML
		Layer.innerHTML = Html
		return Result
	}

//---------------------------------------------------------------------------
	this.GetHtml = function(LayerName) {
		return this.HtmlLayers[LayerName].innerHTML
	}

//---------------------------------------------------------------------------
	this.RotateReflect = function(Box, RotRef) {
		var Transform = Clone(this.Transform[RotRef])
		Transform[4] = Box.w * Transform[4] + Box.h * Transform[6] + Box.x
		Transform[5] = Box.h * Transform[5] + Box.w * Transform[7] + Box.y

		this.DrawContext.setTransform.apply(this.DrawContext, Transform.slice(0, 6))
	}

//---------------------------------------------------------------------------
	this.RenderSprite = function(Sprite, dx, dy, RotRef) {
		if (!Sprite.Image) {
			Sprite = {Image: Sprite, x: 0, y: 0, w: Sprite.width, h: Sprite.height}
		}
		var sx = Sprite.x
		var sy = Sprite.y
		var sw = Sprite.w
		var sh = Sprite.h

		var dc = this.DrawContext
		if(!RotRef) {
			dc.drawImage(Sprite.Image, sx, sy, sw, sh, dx, dy, sw, sh)
			return
		}

		dc.save()
		this.RotateReflect(dx, dy, sw, sh, RotRef)
		dc.drawImage(Sprite.Image, sx, sy, sw, sh, 0, 0, sw, sh)
		dc.restore()
	}

//---------------------------------------------------------------------------
	this.RenderSpriteStack = function(Sprites, dx, dy) {
		var sw = Sprites[0].w
		var sh = Sprites[0].h
		for(var i in Sprites) {
			var s = Sprites[i]
			this.RenderSprite(s, dx + ((sw - s.w) >> 1), dy + ((sh - s.h) >> 1))
		}
	}

//---------------------------------------------------------------------------
	this.RenderTiles = function(Image, Box) {
		var dc = this.DrawContext
		dc.save()
		dc.fillStyle = dc.createPattern(Image, 'repeat')
		dc.setTransform(1, 0, 0, 1, Box.x, Box.y)
		dc.fillRect(0, 0, Box.w, Box.h)
		dc.restore()
	}

//---------------------------------------------------------------------------
	this.SaveState = function() {
		this.DrawContext.save()
	}

//---------------------------------------------------------------------------
	this.RestoreState = function() {
		this.DrawContext.restore()
	}

//---------------------------------------------------------------------------
	this.Clip = function(Box) {
		var x = Box.x, y = Box.y, w = Box.w, h = Box.h
		if (x == undefined) x = 0
		if (y == undefined) y = 0
		if (w == undefined) w = this.Width - x
		if (h == undefined) h = this.Height - y
		var dc = this.DrawContext
		dc.beginPath()
		dc.rect(x, y, w, h)
		dc.clip()
	}

//---------------------------------------------------------------------------
	this.Rect = function(Box, FillColor, StrokeColor, StrokeWidth) {
		var dc = this.DrawContext
		dc.save()
		if (FillColor) {
			dc.fillStyle = FillColor
			dc.fillRect(Box.x, Box.y, Box.w, Box.h)
		}
		if (StrokeColor) {
			dc.strokeStyle = StrokeColor
			if(!StrokeWidth) StrokeWidth = 1
			var sw12 = StrokeWidth / 2
			dc.strokeRect(Box.x + sw12, Box.y + sw12, Box.w - StrokeWidth, Box.h - StrokeWidth)
		}
		dc.restore()
	}

//---------------------------------------------------------------------------
	this.FillRect = function(Box, Color) {
		this.Rect(Box, Color)
	}

//---------------------------------------------------------------------------
	this.StrokeRect = function(Box, Color, StrokeWidth) {
		this.Rect(Box, null, Color, StrokeWidth)
	}

//---------------------------------------------------------------------------
	this.GetImageData = function(Box) {
		var x = Box.x, y = Box.y, w = Box.w, h = Box.h
		if (x == undefined) x = 0
		if (y == undefined) y = 0
		if (w == undefined) w = this.Width - x
		if (h == undefined) h = this.Height - y
		return this.DrawContext.getImageData(x, y, w, h)
	}

//---------------------------------------------------------------------------
	this.SetImageData = function(Data, x, y) {
		if (x == undefined) x = 0
		if (y == undefined) y = 0
		this.DrawContext.putImageData(Data, x, y)
	}

//---------------------------------------------------------------------------
	this.Translate = function(x, y) {
		this.DrawContext.translate(x, y)
	}

//---------------------------------------------------------------------------
	this.OnClick = function(e) {
		var x = (e.offsetX == undefined ? e.layerX : e.offsetX)
		var y = (e.offsetY == undefined ? e.layerY : e.offsetY)
		this.ClickHandler(x, y, GetDataset(e.target))
	}

//---------------------------------------------------------------------------
	this.SetFont = function(Family, Size, LineHeight) {
		if (!Family) Family = this.FontFamily
		else this.FontFamily = Family
		if (!Size) Size = this.FontSize
		else this.FontSize = Size
		if (!LineHeight) LineHeight = Size * 1.3
		else this.LineHeight = LineHeight
		if (Family.indexOf(' ') >= 0) Family = '"' + Family + '"'
		this.DrawContext.font = Size + 'px ' + Family
	}

//---------------------------------------------------------------------------
	this.GetTextMetrics = function(Text, w, h) {
		var Result = {w: 0, h: 0, Lines: []}
		if (!Text) return Result

		var dc = this.DrawContext
		Text = Text.split('\n')
		var LastY = this.LineHeight

		for(var i = 0; i < Text.length; i++) {
			var Line = Text[i].replace(/^\s+|\s+$/g, '').split(/\s+/)
			var FirstIndex = 0
			var LastWidth = 0

			for(var j = 0; j < Line.length; j++) {
				var Output = Line.slice(FirstIndex, j + 1).join(' ')
				var OutWidth = dc.measureText(Output).width
				if (OutWidth <= w) {
					LastWidth = OutWidth
					continue
				}

				if (j == FirstIndex) {
					FirstIndex = j + 1
				} else {
					Output = Line.slice(FirstIndex, j).join(' ')
					OutWidth = LastWidth
					FirstIndex = j
				}
				LastWidth = 0
				if (OutWidth > Result.w) Result.w = OutWidth
				Result.Lines.push({w: OutWidth, Text: Output})
				Output = Line[FirstIndex]
				LastY += this.LineHeight
				Result.h += this.LineHeight
				if (LastY > h) return Result
			}

			if (Output) {
				Result.Lines.push({w: LastWidth, Text: Output})
				LastY += this.LineHeight
				Result.h += this.LineHeight
				if (LastY > h) return Result
			}
		}

		return Result
	}

//---------------------------------------------------------------------------
	this.RenderText = function(Text, Box, Color, Align, VAlign) {
		Text = String(Text)
		if (!Text) return

		var x = Box.x, y = Box.y, w = Box.w, h = Box.h
		if (!Color) Color = '#000000'
		if (!Align) Align = 'left'
		if (!VAlign) VAlign = 'top'
		var dc = this.DrawContext
		dc.save()
		dc.rect(x, y, w, h)
		dc.clip()
		dc.fillStyle = Color

		var Metrics = this.GetTextMetrics(Text, w, h)
		var Lines = Metrics.Lines
		switch(VAlign) {
			case 'bottom': y += (h - Metrics.h); break
			case 'middle': y += ((h - Metrics.h) >> 1) - 2 ; break
		}

		for(var i in Lines) {
			y += this.LineHeight
			var LineW = Lines[i].w
			var LineX = x
			switch(Align) {
				case 'right': LineX += w - LineW; break
				case 'center': LineX += (w - LineW) >> 1; break
			}
			dc.fillText(Lines[i].Text, LineX, y)
		}

		dc.restore()
	}

//---------------------------------------------------------------------------
	this.Line = function(x1, y1, x2, y2, Color, Width) {
		var dc = this.DrawContext
		dc.save()
		if (Color != undefined) dc.strokeStyle = Color
		if (Width != undefined) dc.lineWidth = Width
		dc.beginPath()
		dc.moveTo(x1, y1)
		dc.lineTo(x2, y2)
		dc.stroke()
		dc.restore()
	}

//---------------------------------------------------------------------------
	this.RenderTextBox = function(Text, Box, Color, BackColor, BorderColor, Align, VAlign) {
		this.SaveState()
		if (!BackColor) BackColor = '#ffffff'
		this.Rect(Box, BackColor, BorderColor, 1)
		this.Clip(ABox(Box.x + 2, Box.y + 2, Box.w - 4, Box.h - 4))
		this.RenderText(Text, ABox(Box.x + 4, Box.y - 1, Box.w - 8, Box.h + 1), Color, Align, VAlign)
		this.RestoreState()
	}

//---------------------------------------------------------------------------
	this.RenderTextButton = function(Text, Box, BackColor, Color) {
		if (!Color) Color = '#000'
		if (!BackColor) BackColor = '#eef'
		return this.RenderTextBox(Text, Box, Color, BackColor, Color, 'center', 'middle')
	}

//---------------------------------------------------------------------------
	this.RenderCustomInputHtml = function(Html, Handler, Context) {
		this.InputHandler = Handler
		this.InputContext = Context
		var Layer = document.getElementById('control-frame')
		this.SavedHtml = Layer.innerHTML
		Layer.innerHTML = Html
		var Input = document.getElementById('canvas-input')
		if (Input) Input.focus()
	}

//---------------------------------------------------------------------------
	this.RenderInputHtml = function(Html, Title, Handler, Context, RenderApplyButton) {
		var Input = this.InputFrameHtml.subst(
			{title: Title, input: Html, apply: (RenderApplyButton ? this.InputApplyButtonHtml : '')})
		this.RenderCustomInputHtml(Input, Handler, Context)
	}

//---------------------------------------------------------------------------
	this.RenderInput = function(
		Type, Title, Value, Handler, Context, RenderApplyButton, Encode
	) {
		if (Encode == undefined || Encode) Value = String(Value).encode()
		var Html = this.InputHtml[Type].subst({value: Value})
		this.RenderInputHtml(Html, Title, Handler, Context, RenderApplyButton)
	}

//---------------------------------------------------------------------------
	this.Input = function(Dom) {
		if (Dom === true) Dom = document.getElementById('canvas-input')
		document.getElementById('control-frame').innerHTML = this.SavedHtml
		this.SavedHtml = null
		if (this.InputHandler) {
			if (typeof Dom == 'object' && Dom) {
				var Dataset = GetDataset(Dom)
				Dataset.value = Dom.value
			} else {
				Dataset = {value: Dom}
			}
			this.InputHandler(Dataset, this.InputContext)
		}
		this.InputHandler = null
		this.InputContext = null
	}

//---------------------------------------------------------------------------
}