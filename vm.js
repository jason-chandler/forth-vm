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

    push(val) {
	if(this.s0 - this.sp >= this.stack_limit) {
	    this.vm.systemOut.log("STACK OVERFLOW: " + val);
	    throw("STACK OVERFLOW: " + val);
	} else {
	    this.memory.setUint32(this.sp, val);
	    this.sp -= this.cellSize;
	}
    }

    pushControl(val, label) {
	this.push(val);
	this.control_indices.push({ index: (this.sp + this.cellSize), label: label });
    }

    pop(signed) {
	if(this.empty()) {
	    this.vm.systemOut.log("STACK UNDERFLOW");
	    throw("STACK UNDERFLOW: ");
	} else {
	    if(this.control_indices.length === 0 || this.control_indices[this.control_indices.length - this.cellSize].index !== (this.sp + this.cellSize)) { 
		this.sp += this.cellSize;
		let val;
		if(signed) {
		    val = this.memory.getInt32(this.sp);
		} else {
		    val = this.memory.getUint32(this.sp);
		}
		return val;
	    } else {
		throw('Control instruction ' + this.control_indices[this.control_indices.length - this.cellSize].label + ' cannot be used as a value');
	    }
	}
    }

    popControl(label) {
	let ctrl = this.control_indices.pop();
	if(ctrl.index === (this.sp + this.cellSize) && ctrl.label === label)
	{
	    return this.pop();
	} else {
	    throw('Control flow mismatch, ' + ctrl.index + ' ' + ctrl.label + ' was found while seeking ' + (this.sp + this.cellSize) + ' ' + label);
	}
    }

    popControlSkipLeave(label) {
	let leaveStack = [];
	for(var i = this.depth() - this.cellSize; i >= 0 && this.peekControl() === 'leave-sys'; i -= this.cellSize) {
	    leaveStack.push(this.popControl('leave-sys'));
	}
	let ctrl = this.control_indices.pop();
	if(ctrl.index === (this.sp + this.cellSize) && ctrl.label === label)
	{
	    let val = this.pop();
	    while(leaveStack.length !== 0) {
		this.pushControl(leaveStack.pop(), 'leave-sys');
	    }
	    return val;
	} else {
	    throw('Control flow mismatch, ' + ctrl.index + ' ' + ctrl.label + ' was found while seeking ' + (this.sp + this.cellSize) + ' ' + label);
	}
    }

    peekControl() {
	if(this.control_indices.length > 0) {
	    let ctrl = this.control_indices[this.control_indices.length - this.cellSize];
	    return ctrl.label;
	} else {
	    return '';
	}
    }

    pick(index) {
	if(index < (this.depth() - this.cellSize)) {
	    return this.memory.getUint32(this.s0 - this.cellSize - index);
	} else {
	    throw('CONTROL STACK UNDERFLOW');
	}
    }

    pickControl(index, label) {
	if(index < this.control_indices.length) {
	    if(label === this.control_indices[index].label) {
		return this.memory.getUint32(this.s0 - this.cellSize - index);
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
	    this.vm.systemOut.log(count);
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
	console.log('found address which should just be name is at ' + address);
	vm.stack.push(address);
	let name = vm.readCountedString();
	let immediateAddress = vm.align(address + name.length + 1)
	console.log('Immediate Address is ' + immediateAddress);
	let immediate = vm.memory.getInt32(immediateAddress);
	let cfa2 = immediateAddress + vm.cellSize;
	let cfa = cfa2 + vm.cellSize;
	let pfa = cfa + vm.cellSize;
	let codeWord = vm.memory.getUint32(cfa);
	let codeWord2 = vm.memory.getUint32(cfa2);
	return {address: address, name: name, immediate: immediate, codeWord: codeWord, codeWord2: codeWord2, cfa: cfa, cfa2: cfa2, pfa: pfa};
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
	this.state = 0;
	this.toIn = 0;
	this.latest = 0;
	this.debugTable = {};
	this.codeTable = [];
	this.systemOut = window.console;
	this.initCodeWords();
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

    push(val) {
	this.stack.push(val);
    }

    pop() {
	return this.stack.pop();
    }

    rpush(val) {
	this.rstack.push(val);
    }

    rpop() {
	return this.rstack.pop();
    }

    align(addr) {
	if(!addr) {
	    addr = this.stack.pop();
	}
	return addr + (this.cellSize - (addr % this.cellSize));
    }

    alignDp() {
	this.dp = this.align(this.dp);
    }

    writeHere(val) {
	this.memory.setUint32(this.dp, val);
	console.log('wrote ' + val + ' at ' + this.dp);
	this.offsetDp(this.cellSize);
    }

    write(offset, val) {
	this.memory.setUint32(offset, val);
    }

    writeC(offset, val) {
	let c = (typeof(val) !== 'number') ? val.charCodeAt() : c;
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
	console.log('setting ' + this.dp + ' to ' + cval + ' ' + writeByte);
	this.offsetDp(1);
	console.log('dp ' + this.dp);
	console.log(this.memory.getByte(this.dp - 1));
    }

    writeStringHere(str) {
	for(const ch of str) {
	    this.writeCHere(ch);
	}
    }

    writeCountedStringHere(str) {
	this.writeCHere(str.length);
	console.log('length written ' + str.length);
	this.writeStringHere(str);
    }

    readStringFromStack() {
	let str = "";
	let len = this.stack.pop()
	let loc = this.stack.pop();
	console.log('reading from loc ' + loc);
	console.log('read len is ' + len);
	for(let i = 0; i < len; i++) {
	    str += String.fromCharCode(this.memory.getByte(loc + i));
	    console.log('str so far is ' + str);
	}
	return str;
    }

    readCountedString() {
	let str = "";
	let loc = this.stack.pop();
	let len = this.memory.getByte(loc);
	console.log('reading from loc ' + loc);
	console.log('read len is ' + len);
	loc++;
	for(let i = 0; i < len; i++) {
	    str += String.fromCharCode(this.memory.getByte(loc));
	    loc++;
	    console.log('str so far is ' + str);
	}
	return str;
    }

    strBufSpace() {
	return this.strBufEnd - this.strBufPointer - 1;
    }

    writeToStringBuffer(str) {
	if((str.length + 1) > this.strBufSpace()) {
	    if((str.length + 1) > (this.strBufEnd - this.strBufStart)) {
		throw("String too large for buffer!");
	    }
	    this.strBufPointer = this.strBufStart;
	}
	this.stack.push(this.strBufPointer);
	this.stack.push(str.length);
	console.log('str buf pointer ' + this.strBufPointer);
	this.writeString(this.strBufPointer, str);
	this.strBufPointer += str.length + 1;
	console.log('after ' + this.strBufPointer);
	if(this.strBufPointer >= this.strBufEnd) {
	    this.strBufPointer = this.strBufStart;
	}
    }

    clearHidden() {
	if(this.hiddenWord) {
	    this.latest = this.hiddenWord.address;
	    console.log('set latest to ' + this.latest);
	    this.hiddenWord = null;
	}
    }

    doCol() {
	let selectedWord = this.memory.getUint32(this.ip);
	console.log('selectedWord = ' + selectedWord);
	// handle code
	if(selectedWord === 0) {
	    console.log('calling code at ' + (this.ip + this.cellSize));
	    this.callCode(this.memory.getUint32(this.ip + this.cellSize));
	} else {
	    this.rpush(this.ip + this.cellSize)
	    this.rpush(selectedWord);
	}
    }

    // OUTER INTERPRETER
    
    isNotSpace(character) {
	return character !== ' ' && character !== '\n';
    }

    isNumber(word) {
	return new Number(word).valueOf !== NaN;
    }

    getNextWord() {
	let word = '';
	while(this.toIn < this.tib.length && this.isNotSpace(this.tib[this.toIn])) {
	    word += this.tib[this.toIn];
	    this.toIn++;
	}
	return word;
    }

    processWord(word) {
	console.log('processing ' + word);
	let foundWord = this.findWord(word);
	let isWord = foundWord !== 0 && foundWord !== null && foundWord !== undefined;
	console.log('past found');
	if(isWord) {
	    if(foundWord.immediate === -1 || this.state === 0) {
		this.rpush(foundWord.cfa);
		do {
		    this.ip = this.rpop();
		    console.log('ip ' + this.ip);
		    this.doCol();
		} while (this.rstack.depth() > 0);
	    } else {
		this.writeHere(foundWord.cfa);
	    }
	} else if(this.isNumber(word)) {
	    if(this.state === 0) {
		console.log('pushing ' + word);
		this.stack.push(word);
	    } else {
		this.writeHere(this.findWord('LITERAL').cfa);
		this.writeHere(word);
	    }
	} else {
	    throw(new Exception(word + ' ?'));
	}
    }

    interpret(line) {
	this.tib = line;
	let len;
	if(line === null || line === undefined || line.length === undefined) {
	    len = 0;
	} else {
	    len = line.length;
	    console.log('length is ' + len);
	}
	this.toIn = 0;
	while(this.toIn < len) {
	    let word = this.getNextWord();
	    this.toIn++;
	    this.processWord(word);
	}
    }

    writeWord(word, hidden) {
	this.writeHere(word.link);
	this.writeCountedStringHere(word.name);
	this.alignDp();
	console.log('immediate written at ' + this.dp);
	this.writeHere(word.immediate);
	this.writeHere(word.codeWord2);
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
	this.writeWord(word, hidden);
    }

    addCode(immediate, index, fn, fnName) {
	let name = fnName === undefined ? fn.name.toUpperCase() : fnName.toUpperCase();
	this.alignDp();
	console.log('setting the code index ' + index + ' to ' + name);
	this.codeTable[index] = fn;
	console.log(index);
	console.log(fn);
	let parameterField = new Array(1);
	parameterField[0] = index;
	let word = new Word(this, this.dp, name, immediate, 0, 0, parameterField);
	this.writeWord(word);
    }

    callCode(index) {
	console.log('Calling code: ' + index);
	this.codeTable[index].call(this);
    }

    getNameAndLinkFromAddr(addr) {
	let link = this.memory.getUint32(addr);
	console.log('addr checked: ' + addr);
	console.log(addr + this.cellSize);
	this.push(addr + this.cellSize);
	let name = this.readCountedString();
	console.log ('Link: ' + link + ' Name: ' + name);
	return [name,link];
    }

    find(name) {
	if(this.latest === 0) {
	    throw("Forth VM has no definitions!");
	}
	let tempAddr = this.latest;
	console.log('latest ' + this.latest);
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

    findWord(name) {
	let addr = this.find(String(name).toUpperCase());
	console.log('found at addr ' + addr)
	if (addr === 0) {
	    return 0;
	} else {
	    return Word.fromAddress(this, addr);
	}
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
	this.addCode(0, index++, function parse() {
	    let parseChar = String.fromCharCode(this.stack.pop());
	    let str = '';
	    while(this.toIn < this.tib.length && this.tib[this.toIn] !== parseChar) {
		str += this.tib[this.toIn];
		this.toIn++;
	    }
	    this.toIn++;
	    this.writeToStringBuffer(str);
	})
	this.addCode(0, index++, function bl() {
	    this.stack.push(32);
	})
	this.addCode(0, index++, function docol() {
	    
	})
	this.addCode(0, index++, function colon() {
	    this.clearHidden();
	    this.callCode(3); // BL
	    this.callCode(2); // PARSE
	    let name = this.readStringFromStack();
	    this.addWord(name, 0, Word.getCFA(this, this.debugTable['DOCOL']), 0, true)
	    this.state = 1;
	}, ':')
	this.addCode(0, index++, function exit() {
	    this.rpop();
	})
	this.addCode(-1, index++, function semicolon() {
	    this.writeHere(this.findWord('EXIT').cfa);
	    this.clearHidden();
	    this.state = 0;
	}, ';')
	this.addCode(0, index++, function literal() {
	    const nextAddr = this.rpop();
	    this.stack.push(this.memory.getUint32(nextAddr));
	    this.rpush(nextAddr + this.cellSize);
	})
    }

    getNextWord(endChar) {
	let word = '';
	while(this.toIn < this.tib.length && this.isNotSpace(this.tib[this.toIn])) {
	    word += this.tib[this.toIn];
	    this.toIn++;
	}
	return word;
    }
}

//window.ForthVM = ForthVM;
window.vm = new ForthVM();


