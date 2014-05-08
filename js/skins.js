var SnakeSkins = {
	Image: GetImage('img-skins'),

	SkinList: [1, 2, 3, 4, 5, 6],

	Skins: {
		1: '<по умолчанию>',
		2: 'белая',
		3: 'желтая',
		4: 'зеленая',
		5: 'красная',
		6: 'синяя',
	},

//---------------------------------------------------------------------------
	Get: function(Index) {
		return {
			Image: this.Image, Title: this.Skins[Index],
			x: 0, y: (Number(Index) - 1) << 4, w: 48, h: 16
		}
	},

//---------------------------------------------------------------------------
}

function ASkin(Index) {
	this.Image = new Image()
	this.Image.src = 'img/16/skin' + Index + '.png'
	this.TypeX = {h: 0, b: 16, r: 32, l: 48, t: 64}

//---------------------------------------------------------------------------
	this.Get = function(Type, Dir) {
		return {
			Image: this.Image,
			x: this.TypeX[Type.charAt(0).toLowerCase()],
			y: Dir << 4,
			w: 16,
			h: 16,
		}
	}

//---------------------------------------------------------------------------
}