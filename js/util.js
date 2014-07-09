
//---------------------------------------------------------------------------
String.prototype.repeat = function(Count) {
	Count = Math.floor(Count)
	var Str = this
	if (!Count || Count < 0) return ''

	var Result = '';
	if (Count & 1) Result = Str
	Count >>= 1
	while(Count) {
		Str += Str
		if (Count & 1) Result += Str
		Count >>= 1
	}
	return Result
}

//---------------------------------------------------------------------------
String.prototype.splice = function(First, Last, Replace) {
	return this.slice(0, First) + Replace + this.slice(Last)
}

//---------------------------------------------------------------------------
String.prototype.chunk = function(Size) {
	if (Size == undefined) Size = 1
	if (Size <= 0) return

	var Result = new Array(Math.floor((this.length + Size - 1) / Size))
	var Len = Result.length
	if (!Len) return Result

	var Pos = 0
	for(var i = 0; i < Len; i++) {
		Result[i] = this.substr(Pos, Size)
		Pos += Size
	}
	return Result
}

//---------------------------------------------------------------------------
String.prototype.encode = function() {
	return this.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').
		replace('"', '&quot;')
}

//---------------------------------------------------------------------------
String.prototype.subst = function(Params) {
	return this.replace(/\{\{([A-Za-z_0-9]+)\}\}/g, function(Match, Name) {
		if (Params[Name] == undefined) return Match
		else return Params[Name]
	})
}

//---------------------------------------------------------------------------
function ArrayFill(Len, Value, DoClone) {
	var Arr = new Array(Len)
	if (DoClone == undefined) DoClone = true
	if (Len) {
		if(DoClone && Value instanceof Array) {
			for(var i = 0; i < Len; i++) Arr[i] = Clone(Value)
		} else {
			for(var i = 0; i < Len; i++) Arr[i] = Value
		}
	}
	return Arr
}

//---------------------------------------------------------------------------
function Clone(Obj) {
	if (!(Obj instanceof Object)) return Obj

	if (Obj.clone) return Obj.clone()

	if (typeof Obj == 'function') return Obj

	if (Obj instanceof Array) {
		var Result = []
		var Len = Obj.length
		for(var i = 0; i < Len; i++) {
			Result[i] = Clone(Obj[i])
		}
	} else {
		//var c = Obj.constructor
		var Result = {}
		for(var i in Obj) Result[i] = Clone(Obj[i])
		Result.prototype = Obj.prototype
	}
	return Result
}

//---------------------------------------------------------------------------
function ArrayChunk(Arr, Size) {
	if (Size <= 0) return

	var Len = Arr.length
	var Result = []
	for(var i = 0; i < Len; i += Size) {
		Result.push(Arr.slice(i, i + 7))
	}
	return Result
}

//---------------------------------------------------------------------------
function ArrayShuffle(Arr) {
	if (!Arr.length || Arr.length == 1) return Arr

	for(var Len = Arr.length; Len > 1; Len--) {
		var i = Math.floor(Math.random() * Len)
		var v = Arr[i]
		Arr[i] = Arr[Len - 1]
		Arr[Len - 1] = v
	}
}

//---------------------------------------------------------------------------
function ArrayRandom(Arr) {
	if (!Arr.length) return
	if (Arr.length == 1) return Arr[0]
	return Arr[Math.floor(Math.random() * Arr.length)]
}

//---------------------------------------------------------------------------
function ArrayRange(First, Last) {
	var Step = (Last >= First ? 1 : -1)
	var Len = Math.abs(Last - First) + 1
	var Result = new Array(Len)
	for(var i = 0; i < Len; i++) {
		Result[i] = First
		First += Step
	}
	return Result
}

//---------------------------------------------------------------------------
function NewId(Name, GetLast) {
	if (!Name) Name = '_'
	if (!this[Name]) this[Name] = 0
	if (!GetLast) this[Name]++
	return this[Name]
}

//---------------------------------------------------------------------------
function Extend(Child, Parent) {
	var f = function() {}
	f.prototype = Parent
	Child.prototype = new f()
	Child.prototype.constructor = Child
	Child.prototype.Parent = Child.prototype
}

//---------------------------------------------------------------------------
function GetDataset(Dom) {
	var Dataset = Dom.dataset
	if (Dataset == undefined) {
		Dataset = {}
		var Attr = Dom.attributes
		var Len = Attr.length
		for(var i = 0; i < Len; i++) {
			var Node = Attr.item(i)
			if (Node.nodeName.substr(0, 5) == 'data-') {
				Dataset[Node.nodeName.substr(5)] = Node.nodeValue
			}
		}
	}
	return Dataset
}

//---------------------------------------------------------------------------
function GetImage(Id) {
	var Result = new Image()
	Result.src = document.getElementById(Id).src
	return Result
}

//---------------------------------------------------------------------------
function ABox(x, y, w, h) {
	return {x: x, y: y, w: w, h: h}
}
