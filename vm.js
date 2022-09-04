//import { OpCode } from './opcode.js';
//import { Memory } from './memory.js';
//import { Dictionary } from './dictionary.js';

class Stack {
    vm;
    memory;
    s0; // below bottom of stack
    sp; // stack pointer
    cellSize;
    control_indices;

    constructor(vm, s0) {
	this.vm = vm;
	this.memory = vm.memory;
	this.s0 = s0;

	this.cellSize = this.vm.cellSize;
	this.sp = this.s0 - this.cellSize; 
	this.stack_limit = 200 * this.cellSize;
	this.control_indices = [];
    }

    empty() {
	return this.sp === this.s0 - this.cellSize;
    }

    depth() {
	return (this.s0 - this.cellSize - this.sp) / this.cellSize;
    }

    push(val, label) {
	if(this.s0 - this.sp >= this.stack_limit) {
	    this.vm.systemOut.log("STACK OVERFLOW: " + val);
	    throw("STACK OVERFLOW: " + val);
	} else {
	    this.memory.setUint32(this.sp, val);
	    this.sp -= this.cellSize;
	    this.control_indices.push({ label: label });
	}
    }

    dpush(val, label) {
	const low = this.sp;
	this.push(0, label);
	const high = this.sp;
	this.push(0, label);
	this.vm.memory.view.setBigInt64(high, BigInt(val));
    }

    pop(signed, label, skipLeave) {
	let leaveStack = [];
	if(this.empty()) {
	    this.vm.systemOut.log("STACK UNDERFLOW");
	    throw("STACK UNDERFLOW: ");
	} else {
	    if(skipLeave) {
		for(var i = this.depth() - 1; i >= 0 && this.peekControl() === 'leave-sys'; i--) {
		    leaveStack.push(this.pop(false, 'leave-sys'));
		}
	    }

	    let ctrl = this.control_indices.pop();
	    if(ctrl.label === label)
	    {
		this.sp += this.cellSize;
		let val;
		if(signed) {
		    val = this.memory.getInt32(this.sp);
		} else {
		    val = this.memory.getUint32(this.sp);
		}
		while(skipLeave && leaveStack.length !== 0) {
		    this.push(leaveStack.pop(), 'leave-sys');
		}
		return val;
	    } else {
		throw('Control flow mismatch, ' + ' ' + ctrl.label + ' was found while seeking ' + label);
	    }
	}
    }

    peekControl() {
	if(this.control_indices.length > 0) {
	    let ctrl = this.control_indices[this.control_indices.length - 1];
	    return ctrl.label;
	} else {
	    return '';
	}
    }

    pick(index) {
	if(index < this.depth()) {
	    return this.memory.getUint32(this.sp + (this.cellSize * (index + 1)));
	} else {
	    throw('STACK UNDERFLOW');
	}
    }

    loopDepth() {
	let depth = 0;
	for(let ctrl of this.control_indices) {
	    if(ctrl.label === 'loop-sys-index') {
		depth++;
	    }
	}
	return depth;
    }

    pickControl(index, label) {
	if(index < this.control_indices.length) {
	    if(label === this.control_indices[index].label) {
		return this.memory.getUint32(this.s0 - (this.cellSize * (index + 1)));
	    } else {
		throw('Control flow mismatch, ' + index + ' ' + this.control_indices[index].label + ' was found while seeking ' + index + ' ' + label);
	    }
	} else {
	    throw('CONTROL STACK UNDERFLOW');
	}
    }

    clear() {
	while(this.sp !== (this.s0 - this.cellSize)) {
	    this.vm.memory.setUint32(this.sp, 0);
	    this.sp += this.cellSize;
	}
	this.control_indices = [];
    }

    print() {
	let buf = [];
	let count = 0;
	for(var i = this.s0 - this.cellSize; i !== this.sp; i -= this.cellSize) {
	    buf.push(this.vm.memory.getUint32(i));
	    count++;
	}
	this.vm.systemOut.log('<' + count + '> ' + buf);
    }

    toJSArray() {
	let buf = [];
	let count = 0;
	for(var i = this.s0 - this.cellSize; i !== this.sp; i -= this.cellSize) {
	    buf.push(this.vm.memory.getUint32(i));
	    count++;
	}
	return buf;
    }

}

class Word {
    address
    name
    link
    immediate
    codeWord
    codeWord2
    parameterField
    vm

    constructor(vm, address, name, immediate, codeWord, codeWord2, parameterField) {
	this.vm = vm;
	this.address = address;
	this.link = this.vm.latest;
	this.name = ('' + name).toUpperCase();
	this.immediate = immediate;
	this.codeWord = codeWord;
	this.codeWord2 = codeWord2;
	this.vm.debugTable[this.name] = address;
	this.parameterField = parameterField;
	// new Word(this, this.dp, name.toUpperCase(), immediate, codeWord, codeWord2, parameterField);
    }

    static fromAddress(vm, linkAddress) {
	let address = linkAddress + vm.cellSize;
	vm.stack.push(address);
	let name = vm.readCountedString();
	let immediateAddress = vm.align(address + name.length + 1)
	let immediate = vm.memory.getInt32(immediateAddress);
	let cfa2 = immediateAddress + vm.cellSize;
	let cfa = cfa2 + vm.cellSize;
	let pfa = cfa + vm.cellSize;
	let codeWord = vm.memory.getUint32(cfa);
	let codeWord2 = vm.memory.getUint32(cfa2);
	return {address: address, name: name, immediate: immediate, immediateAddress: immediateAddress, codeWord: codeWord, codeWord2: codeWord2, cfa: cfa, cfa2: cfa2, pfa: pfa};
    }

    static getCFA(vm, linkAddress) {
	let nameAddress = linkAddress + vm.cellSize;
	return nameAddress + vm.align((1 + vm.memory.getByte(nameAddress))) + (vm.cellSize * 2);
    }
}

class Memory {
    buffer;
    memorySize;
    view;

    constructor() {
	this.memorySize = 65536 * 4;
	this.buffer = new ArrayBuffer(this.memorySize);
	this.view = new DataView(this.buffer);
    }

    getUint32(offset) {
	return this.view.getUint32(offset);
    }

    setUint32(offset, value) {
	this.view.setUint32(offset, value);
    }

    getInt32(offset) {
	return this.view.getInt32(offset);
    }

    setInt32(offset, value) {
	this.view.setInt32(offset, value);
    }

    getByte(offset) {
	return this.view.getUint8(offset);
    }

    setByte(offset, value) {
	this.view.setUint8(offset, value);
    }
}


const ForthVM = class {
    ip;
    dp;
    cellSize;
    memory;
    numCells;
    stack;
    rstack;
    state;
    toIn;
    tib;
    latest;
    codeTable;
    debugTable;
    systemOut;
    strBufStart;
    strBufEnd;
    strBufPointer;
    controlFlowUnresolved;
    environment;
    skip;
    
    constructor() {
	this.cellSize = 4;
	this.memory = new Memory();
	this.numCells = this.memory.memorySize / this.cellSize;
	this.ip = 8;
	this.dp = 8;
	this.stack = new Stack(this, this.memory.memorySize - (603 * this.cellSize));
	this.rstack = new Stack(this, this.memory.memorySize - (402 * this.cellSize));
	this.strBufStart = this.memory.memorySize - (1006 * this.cellSize);
	this.strBufEnd = this.memory.memorySize - (804 * this.cellSize);
	this.strBufPointer = this.strBufStart;
	this.tib = '';
	this.tibCopy = this.memory.memorySize - (20040 * this.cellSize);
	this.state = 0;
	this.toIn = 1;
	this.baseAddr = this.memory.memorySize - (1208 * this.cellSize);
	this.memory.setUint32(this.baseAddr, 10);
	this.latest = 0;
	this.debugTable = {};
	this.codeTable = [];
	this.systemOut = window.console;
	this.controlFlowUnresolved = 0;
	this.initCodeWords();
	this.environment = [];
	this.skip = 0;
    }

    getIp() {
	return this.ip;
    }

    setIp(ip) {
	this.ip = ip;
    }

    offsetIp(offset) {
	this.ip += offset;
    }

    getDp() {
	return this.dp;
    }

    setDp(dp) {
	this.dp = dp;
    }
    
    offsetDp(offset) {
	this.dp += offset;
    }

    push(val, label) {
	this.stack.push(val, label);
    }

    pop(signed, label) {
	return this.stack.pop(signed, label);
    }

    rpush(val, label) {
	if(val !== 0) {
	    //console.log(Word.fromAddress(this, this.findByXt(val)).name);
	    //console.log(Word.fromAddress(this, this.findByXt(val)));
	}
	this.rstack.push(val, label);
    }

    rpop(signed, label) {
	const a = this.rstack.pop(signed, label);
	this.lastWord = a;
	return a;
    }

    rpushNested(val, label) {
	if(val) {
	    this.rpush(val, label);
	}
    }
    
    rpopNested(signed, label) {
	if(this.rstack.depth() > 1) {
	    this.rpop(signed, label);
	}
    }

    align(addr) {
	if(!addr) {
	    addr = this.stack.pop();
	}
	const mod = addr % this.cellSize;
	return (mod === 0 && this.memory.getUint32(addr) === 0) ? addr : addr + (this.cellSize - mod);
    }

    alignDp() {
	this.dp = this.align(this.dp);
    }

    writeHere(val) {
	this.memory.setUint32(this.dp, val);
	this.offsetDp(this.cellSize);
    }

    write(offset, val) {
	this.memory.setUint32(offset, val);
    }

    writeC(offset, val) {
	let c = (typeof(val) !== 'number') ? val.charCodeAt() : val;
	this.memory.setByte(offset, c);
    }

    writeString(offset, str) {
	let i = offset;
	for(let ch of str) {
	    this.writeC(i, ch);
	    i++;
	}
    }

    writeCountedString(offset, str) {
	this.writeC(offset, str.length);
	let i = offset + 1;
	for(let ch of str) {
	    this.writeC(i, ch);
	    i++;
	}
    }

    writeCHere(cval) {
	let writeByte = typeof(cval) === 'string' ? cval.charCodeAt() : cval;
	this.memory.setByte(this.dp, writeByte);
	this.offsetDp(1);
    }

    writeStringHere(str) {
	for(const ch of str) {
	    this.writeCHere(ch);
	}
    }

    writeCountedStringHere(str) {
	this.writeCHere(str.length);
	this.writeStringHere(str);
    }

    readStringFromStack() {
	let str = "";
	let len = this.stack.pop()
	let loc = this.stack.pop();
	for(let i = 0; i < len; i++) {
	    str += String.fromCharCode(this.memory.getByte(loc + i));
	}
	return str;
    }

    readCountedString() {
	let str = "";
	let loc = this.stack.pop();
	let len = this.memory.getByte(loc);
	loc++;
	for(let i = 0; i < len; i++) {
	    str += String.fromCharCode(this.memory.getByte(loc));
	    loc++;
	}
	return str;
    }

    strBufSpace() {
	return this.strBufEnd - this.strBufPointer - 1;
    }

    writeToStringBuffer(str, counted) {
	if((str.length + 1) > this.strBufSpace()) {
	    if((str.length + 1) > (this.strBufEnd - this.strBufStart)) {
		throw("String too large for buffer!");
	    }
	    this.strBufPointer = this.strBufStart;
	}
	this.stack.push(this.strBufPointer);

	if(counted) {
	    this.writeCountedString(this.strBufPointer, str);
	    this.strBufPointer += str.length + 2;
	} else {
	    this.stack.push(str.length);
	    this.writeString(this.strBufPointer, str);
	    this.strBufPointer += str.length + 1;
	}
	if(this.strBufPointer >= this.strBufEnd) {
	    this.strBufPointer = this.strBufStart;
	}
    }

    writeCountedToStringBuffer(str) {
	this.writeToStringBuffer(str, true);
    }


    clearHidden() {
	if(this.hiddenWord) {
	    this.latest = this.hiddenWord.address;
	    this.hiddenWord = null;
	}
    }

    doCol() {
	try{
	    const selectedWord = this.memory.getUint32(this.ip);
	// handle code
	if(selectedWord === 0) {
	    try {
		
		const a = this.memory.getUint32(this.ip + this.cellSize);
		try {
		    //	    console.log(this.codeTable[a]);
		    const b = this.callCode(a);
		    if(typeof(b) === 'Promise') {
			b.then((val) => val);
		    }
		} catch (e) {
		    this.systemOut.log('CODE index called: ' + a);
		    throw(e);
		}
	    } catch (e) {
		this.systemOut.log('CODE pointer at ' + this.ip + this.cellSize);
		throw(e);
	    }
	} else {
	    //console.log(Word.fromAddress(this, this.findByXt(selectedWord)).name);
	    this.rpush(this.ip + this.cellSize, 'jump')
	    this.rpush(selectedWord, 'jump');
	}
	} catch(e) {
	    this.systemOut.log('IP: ' + this.ip);
	    throw(e);
	}
    }

    sloadFile(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", location.href + filePath, false);
	xmlhttp.send(null);
	if (xmlhttp.status==200) {
	    result = xmlhttp.responseText;
	}
	return result.toString();
	    
    }

    async loadFile(filePath) {
	let a = await fetch(filePath);
	let b = await a.text();
	return b;
    }

    // OUTER INTERPRETER
    
    isNotSpace(character) {
	return character.trim() !== '' && character !== ' ' && character !== '\n';
    }

    filterWeirdSpacing(str) {
	//let blankFn = function(word) { return word !== '' && word !== undefined && word !== null; };
	const a = String(str)
	      .trim()
	      .replaceAll('\t', ' ')
	      .replaceAll('\n\n', '\n')
	      .replaceAll('\n', ' \n ');
	return a;
    }

    
    getBase() {
	return this.memory.getUint32(this.baseAddr);
    }

    isNumber(word) {
	return !isNaN(parseInt(word, this.getBase())) && word !== '';
    }

    getNextWord() {
	let word = '';
	while(this.getToIn() < this.tib.length && this.isNotSpace(this.tib[this.getToIn()])) {
	    word += this.tib[this.getToIn()];
	    this.toInInc();
	}
	return word;
    }

    isImmediateControlWord(word) {
	const upWord = word.toUpperCase();
	return upWord === '[IF]' || upWord === '[ELSE]' || upWord === '[THEN]';
    }

    shouldSkip(word) {
	return this.skip > 0 && !this.isImmediateControlWord(word);
    }

    processWord(word) {
	try {
	    if(this.isNotSpace(word) && !this.shouldSkip(word)) {
		let foundWord = this.findWord(word);
		let isWord = foundWord !== 0 && foundWord !== null && foundWord !== undefined;
		if(isWord) {
		    if(foundWord.immediate === -1 || this.state === 0) {
			this.rpush(foundWord.cfa, 'jump');
			do {
			    this.ip = this.rpop(false, 'jump');
			    this.doCol();
			} while (this.rstack.depth() > 0);
		    } else {
			this.writeHere(foundWord.cfa);
		    }
		} else if(this.isNumber(word)) {
		    if(this.state === 0) {
			this.stack.push(parseInt(word, this.getBase()));
		    } else {
			this.writeHere(this.findWord('LITERAL').cfa);
			this.writeHere(parseInt(word, this.getBase()));
		    }
		} 
		else {
		    throw(word + ' ?');
		}
	    }
	} catch (e) {
	    this.clearStacks();
	    if(this.lastWord && !e.toString().includes('?')) {
		this.systemOut.log('Abort called while executing ' + Word.fromAddress(this, this.findByXt(this.lastWord)).name);
	    }
	    throw(e);
	}
    }

    interpret(line, fromChar) {
	try {
	    this.tib = line;
	    this.writeString(this.tibCopy, line)
	    let len;
	    if(line === null || line === undefined || line.length === undefined) {
		len = 0;
	    } else {
		len = this.tib.length;
	    }
	    if(!fromChar) {
		this.resetToIn();
	    } else {
		this.memory.setUint32(this.toIn, fromChar);
	    }
	    while(this.getToIn() < len) {
		let word = this.getNextWord();
		this.toInInc();
		this.processWord(word);
		len = this.tib.length;
	    }
	    const okVal = this.state === 1 ? 'compiled' : 'ok';
	    if(this.systemOut !== console) {
		this.systemOut.log(okVal);
	    }
	    return okVal;
	} catch (e) {
	    this.systemOut.log('Error: ' + e);
	    this.systemOut.log(e.stack);
	}
    }

    writeWord(word, hidden) {
	this.writeHere(word.link);
	this.writeCountedStringHere(word.name);
	this.alignDp();
	this.writeHere(word.immediate);
	this.writeHere(word.codeWord2);
	const cfa = this.dp;
	this.writeHere(word.codeWord);
	if(word.parameterField !== undefined) {
	    for(let addr of word.parameterField) {
		this.writeHere(addr);
	    }
	}
	if(!hidden) {
	    this.latest = word.address;
	} else {
	    this.hiddenWord = word;
	}
	return cfa;
    }

    clearStacks() {
	this.stack.clear();
	this.rstack.clear();
	this.controlFlowUnresolved = 0;
	this.resetTib();
    }

    resetTib() {
	this.resetToIn();
	this.tib = '';
    }
    
    forgetWordBeingDefined() {
	this.dp = this.hiddenWord.address;
	this.state = 0;
    }

    unresolvedControlFlow() {
	return this.controlFlowUnresolved < 0;
    }

    abort(reason) {
	if(!reason) {
	    reason = 'Abort called at ' + this.ip;
	}
	if(this.state === 1) {
	    this.forgetWordBeingDefined();
	}
	this.clearStacks();
	throw(reason);
    }

    pushTrue() {
	this.stack.push(-1);
    }

    pushFalse() {
	this.stack.push(0);
    }

    getToIn() {
	return this.memory.getUint32(this.toIn);
    }

    resetToIn() {
	this.memory.setUint32(this.toIn, 0);
    }

    toInInc() {
	let toInVal = this.getToIn();
	this.memory.setUint32(this.toIn, toInVal + 1);
    }

    toInDec() {
	let toInVal = this.getToIn();
	this.memory.setUint32(this.toIn, toInVal - 1);
    }


    // DICTIONARY

    getDp() {
	return this.getDp();
    }

    setDp(dp) {
	this.setDp(dp);
    }

    addWord(name, immediate, codeWord, codeWord2, hidden) {
	this.alignDp();
	let word = new Word(this, this.dp, name.toUpperCase(), immediate, codeWord, codeWord2, []);
	const cfa = this.writeWord(word, hidden);
	return cfa;
    }

    addCode(immediate, index, fn, fnName) {
	let name = fnName === undefined ? fn.name.toUpperCase() : fnName.toUpperCase();
	this.alignDp();
	this.codeTable[index] = fn;
	let parameterField = new Array(1);
	parameterField[0] = index;
	let word = new Word(this, this.dp, name, immediate, 0, 0, parameterField);
	this.writeWord(word);
    }

    callCode(index) {
	this.codeTable[index].call(this);
    }

    getNameAndLinkFromAddr(addr) {
	const link = this.memory.getUint32(addr);
	this.push(addr + this.cellSize);
	const name = this.readCountedString();
	return [name,link];
    }

    getXtAndLinkFromAddr(addr) {
	const link = this.memory.getUint32(addr);
	const xt = Word.getCFA(this, addr);
	return [xt,link];
    }


    find(name) {
	if(this.latest === 0) {
	    throw("Forth VM has no definitions!");
	}
	let tempAddr = this.latest;
	while(tempAddr !== 0) {
	    let check = this.getNameAndLinkFromAddr(tempAddr);
	    let tempName = check[0];
	    let tempLink = check[1];
	    if(String(tempName).toUpperCase() === String(name).toUpperCase()) {
		return tempAddr;
	    } else {
		tempAddr = tempLink;
	    }
	}
	return tempAddr;
    }

    findByXt(xt) {
	if(this.latest === 0) {
	    throw("Forth VM has no definitions!");
	}
	let tempAddr = this.latest;
	while(tempAddr !== 0) {
	    let check = this.getXtAndLinkFromAddr(tempAddr);
	    let tempXt = check[0];
	    let tempLink = check[1];
	    if(tempXt === xt) {
		return tempAddr;
	    } else {
		tempAddr = tempLink;
	    }
	}
	return tempAddr;
    }

    findByXtOrAbort(xt) {
	const addr = this.findByXt(xt);
	return addr === 0 ? this.abort("Invalid execution token: " + xt) : addr;
    }

    findWord(name) {
	let addr = this.find(String(name).toUpperCase());
	if (addr === 0) {
	    return 0;
	} else {
	    return Word.fromAddress(this, addr);
	}
    }

    findWordOrAbort(name) {
	const word = this.findWord(name);
	return word === 0 ? this.abort(name + " ?") : word;
    }

    initCodeWords() {
	let index = 0;
	this.addCode(0, index++, function swap() {
	    let a = this.stack.pop();
	    let b = this.stack.pop();
	    this.stack.push(a);
	    this.stack.push(b);
	})
	this.addCode(0, index++, function dup() {
	    let a = this.stack.pop();
	    this.stack.push(a);
	    this.stack.push(a);
	})
	this.addCode(0, index++, function rot() {
	    let a = this.stack.pop();
	    let b = this.stack.pop();
	    let c = this.stack.pop();
	    this.stack.push(b);
	    this.stack.push(a);
	    this.stack.push(c);
	})
	this.addCode(0, index++, function over() {
	    this.push(this.stack.pick(1));
	})
	const PARSE = index;
	let counted;
	const PARSEIMPL = function () {
	    let parseChar = String.fromCharCode(this.stack.pop());
	    let str = '';
	    while(this.getToIn() < this.tib.length && this.tib[this.getToIn()] !== parseChar) {
		str += this.tib[this.getToIn()];
		this.toInInc();
	    }
	    this.toInInc();
	    if(counted) {
		this.writeCountedToStringBuffer(str);
	    } else {
		this.writeToStringBuffer(str);
	    }
	}.bind(this, this);
	this.addCode(0, index++, function parse() {
	    counted = false;
	    PARSEIMPL();
	})
	const BL = index;
	this.addCode(0, index++, function bl() {
	    this.stack.push(32); // space
	})
	this.addCode(-1, index++, function lparen() {
	    let parseChar = String.fromCharCode(41); // right paren
	    while(this.getToIn() < this.tib.length && this.tib[this.getToIn()] !== parseChar) {
		this.toInInc();
	    }
	    this.toInInc();
	}, '(')
	this.addCode(-1, index++, function backslash() {
	    let parseChar = '\n';
	    while(this.getToIn() < this.tib.length && this.tib[this.getToIn()] !== parseChar) {
		this.toInInc();
	    }
	    this.toInInc();
	    //console.log(this.getToIn());
	}, '\\')
	this.addCode(-1, index++, function dot_lparen() {
	    let parseChar = String.fromCharCode(41); // right paren
	    let str = '';
	    while(this.getToIn() < this.tib.length && this.tib[this.getToIn()] !== parseChar) {
		str += this.tib[this.getToIn()];
		this.toInInc();
	    }
	    this.systemOut.log(str);
	    this.toInInc();
	}, '.(')
	this.addCode(0, index++, function docol() {
	    
	})
	this.addCode(0, index++, function colon() {
	    this.clearHidden();
	    this.callCode(BL); // BL
	    this.callCode(PARSE); // PARSE
	    const name = this.readStringFromStack();
	    this.addWord(name, 0, Word.getCFA(this, this.debugTable['DOCOL']), 0, true)
	    this.state = 1;
	}, ':')
	this.addCode(0, index++, function exit() {
	    this.rpop(false, 'jump');
	})
	this.addCode(-1, index++, function semicolon() {
	    if(this.unresolvedControlFlow()) {
		this.abort('Control flow word is unresolved');
	    }
	    this.writeHere(this.findWord('EXIT').cfa);
	    this.clearHidden();
	    this.state = 0;
	}, ';')
	this.addCode(0, index++, function literal() {
	    const nextAddr = this.rpop(false, 'jump');
	    this.stack.push(this.memory.getUint32(nextAddr));
	    this.rpush(nextAddr + this.cellSize, 'jump');
	})
	this.addCode(0, index++, function dotS() {
	    this.stack.print();
	}, '.s')
	this.addCode(0, index++, function toR() {
	    const a = this.rpop(false, 'jump');
	    this.rpush(this.pop(false));
	    this.rpush(a, 'jump');
	}, '>R');
	this.addCode(0, index++, function Rfrom() {
	    const a = this.rpop(false, 'jump');
	    this.push(this.rpop(false));
	    this.rpush(a, 'jump');
	}, 'R>');
	this.addCode(0, index++, function store() {
	    const addr = this.pop();
	    const val = this.pop();
	    this.memory.setUint32(addr, val)
	}, '!')
	this.addCode(0, index++, function fetch() {
	    this.stack.push(this.memory.getUint32(this.stack.pop()));
	}, '@')
	const COMMA = index;
	this.addCode(0, index++, function comma() {
	    if(this.dp % this.cellSize !== 0) {
		this.abort('Must be aligned to store to cell.');
	    }
	    this.writeHere(this.pop(false));
	}, ',')
	this.addCode(0, index++, function cfetch() {
	    this.stack.push(this.memory.getByte(this.stack.pop()));
	}, 'c@')
	this.addCode(0, index++, function ccomma() {
	    this.writeCHere(this.pop());
	}, 'c,')
	this.addCode(0, index++, function cstore() {
	    const addr = this.pop();
	    const val = this.pop()
	    this.stack.push(this.memory.setByte(addr, val));
	}, 'c!')
	this.addCode(0, index++, function rfetch() {
	    this.push(this.rstack.pick(1));
	}, 'R@')
	this.addCode(0, index++, function here() {
	    this.push(this.dp);
	})
	this.addCode(0, index++, function allot() {
	    this.offsetDp(this.pop());
	})
	this.addCode(0, index++, function base() {
	    this.push(this.baseAddr);
	})
	this.addCode(0, index++, function decimal() {
	    this.memory.setUint32(this.baseAddr, 10);
	})
	this.addCode(0, index++, function hex() {
	    this.memory.setUint32(this.baseAddr, 16);
	})
	this.addCode(0, index++, function dovar() {
	    this.stack.push(this.rpop(false, 'jump'));
	})
	this.addCode(0, index++, function docon() {
	    this.stack.push(this.memory.getUint32(this.rpop(false, 'jump')));
	})
	this.addCode(0, index++, function equal() {
	    if(this.pop(true) === this.pop(true)) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '=')
	this.addCode(0, index++, function variable() {
	    this.clearHidden();
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    this.addWord(name, 0, Word.getCFA(this, this.debugTable['DOVAR']), 0)
	    this.offsetDp(this.cellSize);
	})
	this.addCode(0, index++, function constant() {
	    const constant = this.pop();
	    this.clearHidden();
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    this.addWord(name, 0, Word.getCFA(this, this.debugTable['DOCON']), 0)
	    this.writeHere(constant);
	})
	this.addCode(0, index++, function tick() {
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    const found = this.findWordOrAbort(name);
	    this.push(found.cfa);
	}, '\'')
	this.addCode(-1, index++, function bracket_tick() {
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    const found = this.findWordOrAbort(name);
	    this.writeHere(this.findWordOrAbort('LITERAL').cfa);
	    this.writeHere(found.cfa);
	}, '[\']')
	this.addCode(-1, index++, function lbracket() {
	    this.state = 0;
	}, '[')
	this.addCode(-1, index++, function rbracket() {
	    this.state = 1;
	}, ']')
	this.addCode(-1, index++, function bracket_char() {
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    this.writeHere(this.findWord('LITERAL').cfa);
	    this.writeHere(name.charCodeAt(0));
	}, '[char]')
	this.addCode(0, index++, function _char() {
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    this.push(name.charCodeAt(0));
	}, 'char')
	this.addCode(0, index++, function char_plus() {
	    this.push((this.pop() + 1));
	}, 'char+')
	this.addCode(0, index++, function chars() {
	    this.push(this.pop());
	})
	this.addCode(-1, index++, function bracket_compile() {
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    const found = this.findWordOrAbort(name);
	    this.writeHere(found.cfa);
	}, '[compile]')
	this.addCode(0, index++, function immediate() {
	    const latestWord = Word.fromAddress(this, this.latest);
	    this.memory.setInt32(latestWord.immediateAddress, -1);
	})
	this.addCode(0, index++, function execute() {
	    const a = this.rpopNested(false, 'jump');
	    this.rpush(this.pop(), 'jump');
	    this.rpushNested(a, 'jump');
	})
	this.addCode(0, index++, function compile_comma() {
	    const xt = this.stack.pop();
	    const found = this.findByXtOrAbort(xt);
	    this.writeHere(xt);
	}, 'compile,')
	this.addCode(0, index++, function d() {
	    this.systemOut.log(this.stack.pop(true).toString(this.getBase()));
	}, '.')
	this.addCode(0, index++, function plus() {
	    this.stack.push(this.stack.pop(true) + this.stack.pop());
	}, '+')
	this.addCode(0, index++, function minus() {
	    const b = this.stack.pop();
	    this.stack.push(this.stack.pop(true) - b);
	}, '-')
	this.addCode(0, index++, function star() {
	    this.stack.push(this.stack.pop(true) * this.stack.pop());
	}, '*')
	this.addCode(0, index++, function slash() {
	    const b = this.stack.pop(true);
	    this.stack.push(Math.floor(this.stack.pop(true) / b));
	}, '/')
	this.addCode(0, index++, function mod() {
	    const b = this.stack.pop(true);
	    this.stack.push(this.stack.pop(true) % b);
	})
	this.addCode(0, index++, function slashmod() {
	    const b = this.stack.pop(true);
	    const a = this.stack.pop(true);
	    this.stack.push(a % b);
	    this.stack.push(Math.floor(a / b));
	}, '/mod')
	this.addCode(0, index++, function less() {
	    const b = this.stack.pop(true);
	    const a = this.stack.pop(true);
	    if(a < b) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '<')
	this.addCode(0, index++, function greater() {
	    const b = this.stack.pop(true);
	    const a = this.stack.pop(true);
	    if(a > b) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '>')
	this.addCode(0, index++, function lesseq() {
	    const b = this.stack.pop(true);
	    const a = this.stack.pop(true);
	    if(a <= b) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '<=')
	this.addCode(0, index++, function greateq() {
	    const b = this.stack.pop(true);
	    const a = this.stack.pop(true);
	    if(a >= b) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '>=')
	this.addCode(0, index++, function abs() {
	    this.push(Math.abs(this.pop(true)));
	})
	this.addCode(0, index++, function align() {
	    this.alignDp();
	})
	this.addCode(0, index++, function aligned() {
	    this.push(this.align());
	})
	this.addCode(0, index++, function i() {
	    this.stack.push(this.rstack.pick(2));
	})
	this.addCode(0, index++, function j() {
	    this.stack.push(this.rstack.pick(4));
	})
	this.addCode(0, index++, function pick() {
	    this.push(this.stack.pick(this.pop(false)));
	})
	this.addCode(0, index++, function abort() {
	    this.abort();
	})
	this.addCode(0, index++, function abort_quote() {
	    this.push(34);
	    this.callCode(PARSE);
	    const reason = this.readStringFromStack();
	    this.abort(reason);
	}, 'abort"')
	this.addCode(0, index++, function read_cstring() {
	    const a = this.rpop(false, 'jump');
	    const len = this.memory.getByte(a);
	    this.push(a + 1);
	    this.push(len);
	    this.rpush(this.align(a + len), 'jump');
	}, '(s")')
	const SQUOTE = index;
	this.addCode(-1, index++, function s_quote() {
	    this.stack.push(34);
	    this.callCode(PARSE);
	    if(this.state === 1) {
		this.writeHere(this.findWord('(S")').cfa);
		const str = this.readStringFromStack();
		this.writeCountedStringHere(str);
		this.alignDp();
	    }
	}, 's"')
	const TYPE = index;
	this.addCode(0, index++, function type() {
	    this.systemOut.log(this.readStringFromStack());
	})
	this.addCode(-1, index++, function dot_quote() {
	    this.stack.push(34);
	    this.callCode(PARSE);
	    if(this.state === 1) {
		this.writeHere(this.findWord('(S")').cfa);
		const str = this.readStringFromStack();
		this.writeCountedStringHere(str);
		this.alignDp();
		this.writeHere(this.findWord('TYPE').cfa);
	    } else {
		this.callCode(TYPE);
	    }
	}, '."')
	this.addCode(0, index++, function drop() {
	    this.pop();
	})
	this.addCode(0, index++, function zerobranch() {
	    const brVal = this.stack.pop();
	    const returnAddr = this.rpop(false, 'jump');
	    const branchAddr = this.memory.getUint32(returnAddr);
	    
	    if(brVal === 0) {
		this.rpush(branchAddr, 'jump');
	    } else {
		this.rpush(returnAddr + this.cellSize, 'jump');
	    }
	}, '0branch')
	this.addCode(0, index++, function branch() {
	    const returnAddr = this.rpop(false, 'jump');
	    const branchAddr = this.memory.getUint32(returnAddr);
	    this.rpush(branchAddr, 'jump');
	})
	this.addCode(0, index++, function run_do() {
	    const a = this.rpop(false, 'jump');
	    this.rpush(this.stack.pop(), 'loop-sys-index');
	    this.rpush(this.stack.pop(), 'loop-sys-limit');
	    this.rpush(a, 'jump');
	}, '(do)')
	this.addCode(-1, index++, function _do() {
	    if(this.state === 1) {
		this.writeHere(this.findWord('(DO)').cfa);
		this.stack.push(this.dp, 'do-sys');
		this.controlFlowUnresolved -= 1;
	    } else {
		this.abort('Cannot use control flow construct \'DO\' in interpret mode');
	    }
	}, 'do')
	this.addCode(-1, index++, function _case() {
	    if(this.state === 1) {
		// TODO: look up a better implementation of this
		this.writeHere(this.findWord('LITERAL').cfa);
		this.push(this.dp, 'case-sys');
		this.writeHere(0);
		this.writeHere(this.findWord('DROP').cfa);
		this.controlFlowUnresolved -= 1;
	    } else {
		this.abort('Cannot use control flow construct \'CASE\' in interpret mode');
	    }
	}, 'case')
	this.addCode(-1, index++, function _of() {
	    if(this.state === 1) {
		this.writeHere(this.findWord('LITERAL').cfa);
		this.writeHere(1);
		this.writeHere(this.findWord('PICK').cfa);
		this.writeHere(this.findWord('=').cfa);
		this.writeHere(this.findWord('0BRANCH').cfa);
		this.push(this.dp, 'of-sys');
		this.writeHere(0);
		this.writeHere(this.findWord('DROP').cfa);
		this.controlFlowUnresolved -= 1;
			 } else {
			     this.abort('Cannot use control flow construct \'OF\' in interpret mode');
			 }
	}, 'of')
	this.addCode(-1, index++, function endof() {
	    if(this.state === 1) {
		const endOf = this.dp;
		const _of = this.pop(false, 'of-sys');
		const _case = this.pop(false, 'case-sys');
		// make sure the previous endof jumps to before the branch
		// so it skips to the end
		this.memory.setUint32(_case, endOf);
		this.writeHere(this.findWord('BRANCH').cfa);
		this.push(this.dp, 'case-sys');
		this.writeHere(0);
		// make sure the previous OF jumps after the branch to check
		// if the next case is true
		this.memory.setUint32(_of, this.dp);
		this.controlFlowUnresolved += 1;
			 } else {
			     this.abort('Cannot use control flow construct \'ENDOF\' in interpret mode');
			 }
	}, 'endof')
	this.addCode(-1, index++, function endcase() {
	    if(this.state === 1) {
		const _case = this.pop(false, 'case-sys');
		this.writeHere(this.findWord('DROP').cfa);
		this.memory.setUint32(_case, this.dp);
		this.controlFlowUnresolved += 1;
			 } else {
			     this.abort('Cannot use control flow construct \'ENDCASE\' in interpret mode');
			 }
	}, 'endcase')
	this.addCode(0, index++, function runLoop() {
	    let nextAddr = this.rpop(false, 'jump');
	    let limit = this.rpop(true, 'loop-sys-limit');
	    let index = this.rpop(true, 'loop-sys-index') + 1;
	    if(limit === index) {
		this.pushTrue();
	    } else {
		this.rpush(index, 'loop-sys-index');
		this.rpush(limit, 'loop-sys-limit');
		this.pushFalse();
	    }
	    this.rpush(nextAddr, 'jump');
	}, '(loop)')
	this.addCode(0, index++, function runPlusLoop() {
	    let nextAddr = this.rpop(false, 'jump');
	    let limit = this.rpop(true, 'loop-sys-limit');
	    let index = this.rpop(true, 'loop-sys-index') + this.pop(true);
	    if(limit === index) {
		this.pushTrue();
	    } else {
		this.rpush(index, 'loop-sys-index');
		this.rpush(limit, 'loop-sys-limit');
		this.pushFalse();
	    }
	    this.rpush(nextAddr, 'jump');
	}, '(+loop)')
	let plus;
	const loop = function () {
	    if(this.state === 1) {
		if(this.unresolvedControlFlow()) {
		    const loopWord = plus ? '(+LOOP)' : '(LOOP)';
		    this.writeHere(this.findWord(loopWord).cfa);
		    this.writeHere(this.findWord('0BRANCH').cfa);
		    let leaveStack = [];
		    while(this.stack.peekControl() === 'leave-sys') {
			const leaveSys = this.stack.pop(false, 'leave-sys');
			leaveStack.push(leaveSys);
		    }
		    const doSys = this.stack.pop(false, 'do-sys');
		    this.writeHere(doSys);
		    while(leaveStack.length !== 0) {
			const leaveLoc = leaveStack.pop();
			this.memory.setUint32(leaveLoc, this.dp);
		    }
		    this.controlFlowUnresolved++;
		} else {
		    this.abort('Cannot use LOOP without matching DO');
		}
	    } else {
		this.abort('Cannot use control flow construct \'LOOP\' in interpret mode');
	    }
	}.bind(this, this);
	this.addCode(-1, index++, function loop1 () {
	    plus = false;
	    loop();
	}, 'loop');
	this.addCode(-1, index++, function loop2 () {
	    plus = true;
	    loop();
	}, '+loop');
	this.addCode(0, index++, function toIn() {
	    this.push(this.toIn);
	}, '>in');
	this.addCode(0, index++, function do_does() {
	    const createdAddr = this.rpop(false, 'jump');
	    const cfa2 = createdAddr - (2 * this.cellSize);
	    const code2 = this.memory.getUint32(cfa2);
	    this.push(createdAddr);
	    if(code2 !== 0) {
		this.rpush(code2, 'jump');
	    }
	}, 'dodoes')
	this.addCode(0, index++, function run_does() {
	    let latestWord = Word.fromAddress(this, this.latest);
	    const lastDefinitionCreated = latestWord.codeWord === Word.getCFA(this, this.debugTable['DODOES']);
	    if(lastDefinitionCreated) {
		const returnAddr = this.rpop(false, 'jump');
		this.memory.setUint32(latestWord.cfa2, returnAddr);
	    } else {
		this.abort('Cannot use DOES without CREATE');
	    }
	}, '(does)')
	const DOES = index;
	this.addCode(-1, index++, function does() {
	    if(this.state === 0) {
		let latestWord = Word.fromAddress(this, this.latest);
		const lastDefinitionCreated = latestWord.codeWord === Word.getCFA(this, this.debugTable['DODOES']);
		if(lastDefinitionCreated) {
		    this.memory.setUint32(latestWord.cfa2, this.dp);
		    this.state = 1;
		} else {
		    this.abort('Cannot use DOES without CREATE');
		}
	    } else {
		this.writeHere(Word.getCFA(this, this.debugTable['(DOES)']));
	    }
	}, 'does>')
	const CREATE = index;
	this.addCode(0, index++, function create() {
	    this.clearHidden();
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    this.addWord(name, 0, Word.getCFA(this, this.debugTable['DODOES']), 0);
	})
	this.addCode(0, index++, function buffer() {
	    this.alignDp();
	    const size = this.pop();
	    this.clearHidden();
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const name = this.readStringFromStack();
	    this.addWord(name, 0, Word.getCFA(this, this.debugTable['DODOES']), 0);
	    this.offsetDp(size);
	})
	this.addCode(0, index++, function cellplus() {
	    this.push(this.pop(false) + this.cellSize);
	}, 'cell+')
	this.addCode(0, index++, function cells() {
	    this.push(this.pop(false) * this.cellSize);
	})
	this.addCode(-1, index++, function again() {
	    if(this.state === 1) {
		this.writeHere(Word.getCFA(this, this.debugTable['BRANCH']));
		this.writeHere(this.pop(false, 'dest'));
		this.controlFlowUnresolved += 1;
	    } else {
		this.abort('Cannot use control flow construct \'AGAIN\' in interpret mode');
	    }
	})
	this.addCode(-1, index++, function begin() {
	    if(this.state === 1) {
		this.stack.push(this.dp, 'dest');
		this.controlFlowUnresolved -= 1;
	    } else {
		this.abort('Cannot use control flow construct \'BEGIN\' in interpret mode');
	    }
	})
	this.addCode(-1, index++, function repeat() {
	    if(this.state === 1) {
		this.writeHere(Word.getCFA(this, this.debugTable['BRANCH']));
		this.writeHere(this.pop(false, 'dest'));
		this.memory.setUint32(this.pop(false, 'orig'), this.dp);
		this.controlFlowUnresolved += 2;
	    } else {
		this.abort('Cannot use control flow construct \'REPEAT\' in interpret mode');
	    }
	})
	this.addCode(-1, index++, function until() {
	    if(this.state === 1) {
		this.writeHere(this.findWord('0BRANCH').cfa);
		this.writeHere(this.pop(false, 'dest'));
		this.controlFlowUnresolved += 1;
	    } else {
		this.abort('Cannot use control flow construct \'UNTIL\' in interpret mode');
	    }
	})
	this.addCode(-1, index++, function _while() {
	    if(this.state === 1) {
		if(this.unresolvedControlFlow()) {
		    this.writeHere(this.findWord('0BRANCH').cfa);
		    const dest = this.pop(false, 'dest');
		    this.push(this.dp, 'orig');
		    this.push(dest, 'dest');
		    this.writeHere(0);
		    this.controlFlowUnresolved -= 1;
		} else {
		    this.abort('Cannot use while without matching begin');
		}
	    } else {
		this.abort('Cannot use control flow construct \'WHILE\' in interpret mode');
	    }
	}, 'while')
	this.addCode(0, index++, function oneplus() {
	    this.push(1 + this.pop(true));
	}, '1+')
	this.addCode(0, index++, function oneminus() {
	    this.push(this.pop(true) - 1);
	}, '1-')
	this.addCode(0, index++, function run_leave() {
	    const a = this.rpop(false, 'jump');
	    this.rpop(false, 'loop-sys-limit');
	    this.rpop(false, 'loop-sys-index');
	    const branchAddr = this.memory.getUint32(a);
	    this.rpush(branchAddr, 'jump');
	}, '(leave)')
	this.addCode(-1, index++, function leave() {
	    if(this.state === 1) {
		if(this.unresolvedControlFlow()) {
		    this.writeHere(this.findWord('(LEAVE)').cfa);
		    this.push(this.dp, 'leave-sys');
		    this.writeHere(0);
		} else {
		    this.abort('Cannot use leave outside of control flow construct');
		}
	    } else {
		this.abort('Cannot use control flow construct \'LEAVE\' in interpret mode');
	    }
	})
	this.addCode(-1, index++, function _if() {
	    if(this.state === 1) {
		this.writeHere(this.findWord('0BRANCH').cfa);
		this.push(this.dp, 'orig');
		this.writeHere(0);
		this.controlFlowUnresolved -= 1;
	    } else {
		this.abort('Cannot use control flow construct \'IF\' in interpret mode');
	    }
	}, 'if')
	this.addCode(-1, index++, function _else() {
	    if(this.state === 1) {
		if(this.unresolvedControlFlow()) {
		    this.writeHere(this.findWord('BRANCH').cfa);		    
		    let orig2 = this.dp;
		    this.writeHere(0);
		    this.memory.setUint32(this.stack.pop(false, 'orig', true), this.dp);
		    this.push(orig2, 'orig');
		} else {
		    this.abort('Cannot use else without matching if');
		}
	    } else {
		this.abort('Cannot use control flow construct \'ELSE\' in interpret mode');
	    }
	}, 'else')
	this.addCode(-1, index++, function then() {
	    if(this.state === 1) {
		if(this.unresolvedControlFlow()) {
		    this.memory.setUint32(this.stack.pop(false, 'orig', true), this.dp);
		    this.controlFlowUnresolved++;
		} else {
		    this.abort('Cannot use then without matching if');
		}
	    } else {
		this.abort('Cannot use control flow construct \'THEN\' in interpret mode');
	    }
	})
	this.addCode(0, index++, function count() {
	    const loc = this.stack.pop();
	    const len = this.memory.getByte(loc);
	    this.push(loc + 1);
	    this.push(len);
	})
	this.addCode(0, index++, function cr() {
	    this.systemOut.log('\n');
	})
	this.addCode(0, index++, function colon_noname() {
	    this.clearHidden();
	    const noname_cfa = this.addWord('', 0, Word.getCFA(this, this.debugTable['DOCOL']), 0);
	    this.state = 1;
	    this.push(noname_cfa);
	}, ':noname')
	this.addCode(-1, index++, function recurse() {
	    if(this.hiddenWord) {
		this.writeHere(this.hiddenWord.cfa);
	    } else {
		this.writeHere(this.getXtAndLinkFromAddr(this.latest)[0]);
	    }
	})
	this.addCode(0, index++,  function dump() {
	    const limit = this.pop();
	    const addr = this.pop();
	    let str = '';
	    for(let i = 0; i < limit; i++) {
		str += this.memory.getByte(addr + i);
		str += ' ';
	    }
	    this.systemOut.log(str);
	})
	this.addCode(0, index++,  function defdump() {
	    const limit = this.pop();
	    const cfa = this.pop();
	    let str = '';
	    for(let i = 0; i < limit; i+= this.cellSize) {
		const defcfa = this.memory.getUint32(cfa + i);
		const addr = this.findByXt(defcfa);
		if(addr !== 0)  {
		    str += Word.fromAddress(this, addr).name;
		} else {
		    str += defcfa;
		}
		str += ' ';
	    }
	    this.systemOut.log(str);
	})
	this.addCode(0, index++, function defer() {
	    this.callCode(CREATE);
	    this.writeHere(this.findWord('ABORT').cfa);
	    this.callCode(DOES);
	    this.writeHere(this.findWord('@').cfa);
	    this.writeHere(this.findWord('EXECUTE').cfa);
	    this.writeHere(this.findWord('EXIT').cfa);
	    this.state = 0;
	})
	this.addCode(0, index++, function is() {
	    const xt = this.pop();
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const pfa = this.findWordOrAbort(this.readStringFromStack()).pfa;
	    this.memory.setUint32(pfa, xt);
	})
	this.addCode(0, index++, function defer_store() {
	    const deferred = this.pop();
	    const xt = this.pop();
	    const found = this.findByXtOrAbort(deferred);
	    this.memory.setUint32(deferred + this.cellSize, xt);
	}, 'defer!')
	this.addCode(0, index++, function defer_fetch() {
	    const deferred = this.pop();
	    const found = this.findByXtOrAbort(deferred);
	    this.push(this.memory.getUint32(deferred + this.cellSize));
	}, 'defer@')
	this.addCode(0, index++, function action_of() {
	    this.callCode(BL);
	    this.callCode(PARSE);
	    const pfa = this.findWord(this.readStringFromStack()).pfa;
	    this.push(this.memory.getUint32(pfa));
	}, 'action-of')
	this.addCode(0, index++, function word() {
	    counted = true;
	    PARSEIMPL();
	})
	this.addCode(0, index++, function include() {
	    this.callCode(BL);
	    this.callCode(PARSE);
	    let tempTib = this.tib;
	    let resumeToIn = this.getToIn();
	    this.tib = '';
	    const fileName = this.readStringFromStack();
	    return this.loadFile(fileName).then((loadedFile) => {
		const file = this.filterWeirdSpacing(loadedFile);
		const substrindex = tempTib.match('include ' + fileName).index + 'include '.length + fileName.length;
		const resumeTib = String(file) + ' \n ' + tempTib.substring(resumeToIn);
		for(let splitTib of resumeTib.split('\n')) {
		    const result = this.interpret(splitTib + ' \n ');
		    if(result !== "ok" && result !== "compiled") {
			this.systemOut.log('Error in file read, got: ' + result);
			break;
		    }
		}
	    })
	})
	this.addCode(0, index++, function environmentq() {
	    const query = this.readStringFromStack();
	    if(this.environment.includes(query.toUpperCase())) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, 'environment?')
	this.addCode(-1, index++, function bracketIf() {
	    if(this.skip > 0 || this.pop() === 0) {
		this.skip++;
	    }
	}, '[if]')
	this.addCode(-1, index++, function bracketElse() {
	    if(this.skip === 1) {
		this.skip--;
	    }
	}, '[else]')
	this.addCode(-1, index++, function bracketThen() {
	    if(this.skip > 0) {
		this.skip--;
	    }
	}, '[then]')
	this.addCode(0, index++, function _true() {
	    this.pushTrue();
	}, 'true')
	this.addCode(0, index++, function _false() {
	    this.pushFalse();
	}, 'false')
	this.addCode(0, index++, function depth() {
	    this.push(this.stack.depth());
	})
	this.addCode(0, index++, function source() {
	    this.push(this.tibCopy);
	    this.push(this.tib.length);
	})
	this.addCode(0, index++, function ne() {
	    if(this.pop() !== this.pop()) {
		this.pushTrue();
	    }
	    else {
		this.pushFalse();
	    }
	}, '<>')
	this.addCode(0, index++, function or() {
	    this.push(this.pop() | this.pop());
	})
	this.addCode(0, index++, function xor() {
	    this.push(this.pop() ^ this.pop());
	})
	this.addCode(0, index++, function lshift() {
	    const b = this.pop();
	    const a = this.pop();
	    this.push(a << b);
	})
	this.addCode(0, index++, function rshift() {
	    const b = this.pop();
	    const a = this.pop();
	    this.push(a >>> b);
	})
	this.addCode(0, index++, function plus_store() {
	    const a = this.pop();
	    this.setUint32(a, (this.getUint32(a) + this.pop()));
	}, '+!')
	this.addCode(0, index++, function qdup() {
	    const a = this.pop();
	    this.push(a);
	    if(a !== 0) {
		this.push(a);
	    }
	}, '?dup')
	this.addCode(0, index++, function negate() {
	    this.push(0 - this.pop());
	})
	this.addCode(0, index++, function invert() {
	    this.push(~this.pop());
	})
	this.addCode(0, index++, function and() {
	    this.push(this.pop() & this.pop());
	})
	this.addCode(0, index++, function star_slash() {
	    const c = this.pop(true);
	    const b = this.pop(true);
	    const a = this.pop(true);
	    this.push((a * b) / c);
	}, '*/')
	this.addCode(0, index++, function mtimes() {
	    this.stack.dpush(this.pop(true) * this.pop(true));
	}, 'm*')
	this.addCode(0, index++, function twotimes() {
	    this.push(this.pop(true) << 1);
	}, '2*')
	this.addCode(0, index++, function twodiv() {
	    this.push(this.pop(true) >> 1);
	}, '2/')
	this.addCode(0, index++, function zeroeq() {
	    if(this.pop() === 0) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '0=')
	this.addCode(0, index++, function greater_zero() {
	    if(this.pop(true) > 0) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '0>')
	this.addCode(0, index++, function less_zero() {
	    if(this.pop(true) < 0) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '0<')
	this.addCode(0, index++, function neq_zero() {
	    if(this.pop(true) !== 0) {
		this.pushTrue();
	    } else {
		this.pushFalse();
	    }
	}, '0<>')
    }
    getNextWord(endChar) {
	let word = '';
	while(word === '' && this.getToIn() < this.tib.length) {
	    while(this.getToIn() < this.tib.length && this.isNotSpace(this.tib[this.getToIn()])) {
		word += this.tib[this.getToIn()];
		this.toInInc();
	    }
	    if(word === '') {
		this.toInInc();
	    }
	}
	return word;
    }
}

//window.ForthVM = ForthVM;
window.vm = new ForthVM();


