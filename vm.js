import { Memory } from './modules/memory.js';
import { Stack } from './modules/stack.js';
import { Word } from './modules/word.js';
import { Dictionary } from './modules/dictionary.js';

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
    dictionary;
    
    constructor() {
	this.cellSize = 4;
	this.memory = new Memory();
	this.numCells = this.memory.memorySize / this.cellSize;
	this.ip = 24;
	this.dp = 24;
	this.stack = new Stack(this, this.memory.memorySize - (603 * this.cellSize));
	this.rstack = new Stack(this, this.memory.memorySize - (402 * this.cellSize));
	this.strBufStart = this.memory.memorySize - (1006 * this.cellSize);
	this.strBufEnd = this.memory.memorySize - (804 * this.cellSize);
	this.strBufPointer = this.strBufStart;
	this.tib = '';
	this.tibCopy = this.memory.memorySize - (22040 * this.cellSize);
	this.stateAddr = 8
	this.toIn = 1;
	this.baseAddr = 16;
	this.memory.setUint32(this.baseAddr, 10);
	this.latest = 0;
	this.debugTable = {};
	this.codeTable = [];
	this.systemOut = window.console;
	this.controlFlowUnresolved = 0;
	this.dictionary = new Dictionary(this);
	this.environment = [];
	this.skip = 0;
	this.pictureBuffer = '';
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

    peekIndices() {
	// if index < limit when signed, return true since signed is safe for +1
	// else return false and try using unsigned loop indices
	const limit = this.rpop(true, 'loop-sys-limit');
	const index = this.rpop(true, 'loop-sys-index');
	this.rpush(index, 'loop-sys-index');
	this.rpush(limit, 'loop-sys-limit');
	return index <= limit;
    }

    peekPlusIndices() {
	const limit = this.rpop(true, 'loop-sys-limit');
	const index = this.rpop(true, 'loop-sys-index');
	const step = this.pop(true);
	this.rpush(index, 'loop-sys-index');
	this.rpush(limit, 'loop-sys-limit');
	this.push(step);
	return (index <= limit && step > 0) || (index >= limit && step < 0) ;
    }

    rpush(val, label) {
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
	      .replaceAll('\n', ' \n ')
	      .replaceAll('\\', '\\\\');
	return a;
    }

    
    getBase() {
	const base = this.memory.getUint32(this.baseAddr);
	const ignoreBase = (base <= 1 || base > 36);
	return ignoreBase ? 16 : base ;
    }

    toBase(num) {
	return parseInt(num, this.getBase())
    }

    fromBase(num) {
	return 
    }

    isNumber(word) {
	let isNan;
	if(this.getBase() === 10) {
	    isNan = isNaN(Number(word));
	} else {
	    isNan = isNaN(parseInt(word, this.getBase()))
	}
	return !isNan && word !== '';
    }

    getNextWord() {
	let word = '';
	if(this.parseChar) {
	    while(this.getToIn() < this.tib.length && !word.includes(this.parseChar)) {
		word += this.tib[this.getToIn()];
		this.toInInc();
	    }
	    const blankAndEndOfLine = (this.parseChar === ' ' || this.parseChar === '\n') && this.getToIn() >= this.tib.length
	    if(word.includes(this.parseChar) || blankAndEndOfLine) {
		const a = blankAndEndOfLine ? word : word.substr(0, word.indexOf(this.parseChar));
		const b = blankAndEndOfLine ? '' : word.substr(word.indexOf(this.parseChar) + 1);
		if(a !== this.parseChar) {
		    this.parseStr += a;
		}
		const resume = this.getToIn() - b.length;
		this.memory.setUint32(this.toIn, resume);
		this.parseChar = null;
		if(this.parseCallback1) {
		    this.parseCallback1.call();
		}
		if(this.parseCallback2) {
		    this.parseCallback2.call();
		}
		this.parseCallback1 = null;
		this.parseCallback2 = null;
		word = b;
		this.toInDec();
		// ugly trampoline-ish thing
		while (this.rstack.depth() > 0) {
		    this.ip = this.rpop(false, 'jump');
		    this.doCol();
		}
	    } else {
		this.parseStr += word;
		word = '';
	    }
	} else {
	    while(this.getToIn() < this.tib.length && this.isNotSpace(this.tib[this.getToIn()])) {
		word += this.tib[this.getToIn()];
		this.toInInc();
	    }
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
		    if(foundWord.immediate === -1 || this.getState() === 0) {
			this.rpush(foundWord.cfa, 'jump');
			do {
			    this.ip = this.rpop(false, 'jump');
			    this.doCol();
			} while (this.rstack.depth() > 0 && !this.parseChar);
		    } else {
			this.writeHere(foundWord.cfa);
		    }
		} else if(this.isNumber(word)) {
		    if(this.getState() === 0) {
			this.stack.push(parseInt(word, this.getBase()));
		    } else {
			this.writeHere(this.findWord('LIT').cfa);
			this.writeHere(parseInt(word, this.getBase()));
		    }
		} 
		else {
		    this.abort(word + ' ?');
		}
	    }
	} catch (e) {
	    if(this.lastWord && !e.toString().includes('?')) {
		this.systemOut.log('Abort called while executing ' + Word.fromAddress(this, this.findByXt(this.lastWord)).name);
	    }
	    this.abort(e);
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
	    while(this.getToIn() <= len) {
		let word = this.getNextWord();
		this.toInInc();
		this.processWord(word);
		len = this.tib.length;
	    }
	    const okVal = this.getState() === 1 ? 'compiled' : 'ok';
	    if(this.systemOut !== console) {
		this.systemOut.log(okVal);
	    }
	    return okVal;
	} catch (e) {
	    this.systemOut.log('Error: ' + e);
	    this.systemOut.log(e.stack);
	}
    }

    setState(state) {
	this.memory.setByte(this.stateAddr, state);
    }

    getState() {
	return this.memory.getByte(this.stateAddr);
    }

    writeWord(word, hidden) {
	this.writeHere(word.link);
	this.writeCountedStringHere(word.name);
	this.alignDp();
	word.immediateAddr = this.dp
	this.writeHere(word.immediate);
	word.cfa2 = this.dp;
	this.writeHere(word.codeWord2);
	word.cfa = this.dp;
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
	return word.cfa;
    }

    clearStacks() {
	this.stack.clear();
	this.rstack.clear();
	this.controlFlowUnresolved = 0;
	this.resetTib();
	this.pictureBuffer = '';
    }

    resetTib() {
	this.resetToIn();
	this.tib = '';
    }
    
    forgetWordBeingDefined() {
	this.dp = this.hiddenWord.address;
	this.setState(0);
    }

    unresolvedControlFlow() {
	return this.controlFlowUnresolved < 0;
    }

    abort(reason) {
	if(!reason) {
	    reason = 'Abort called at ' + this.ip;
	}
	if(this.getState() === 1) {
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
}

window.forth = new ForthVM();

