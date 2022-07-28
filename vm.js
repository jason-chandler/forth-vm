//import { OpCode } from './opcode.js';
//import { Memory } from './memory.js';
//import { Dictionary } from './dictionary.js';

class Stack {
    vm;
    memory;
    signedMemory;
    s0; // below bottom of stack
    sp; // stack pointer
    cellSize;
    control_indices;

    constructor(vm, s0) {
	this.vm = vm;
	this.memory = vm.memory;
	this.signedMemory = vm.signedMemory;
	this.s0 = s0;
	this.sp = this.s0 - 1; 
	this.cellSize = this.vm.cellSize;
	this.stack_limit = 200;
	this.control_indices = [];
    }

    empty() {
	return this.sp === this.s0 - 1;
    }

    depth() {
	return this.s0 - 1 - this.sp;
    }

    push(val) {
	if(this.s0 - this.sp >= this.stack_limit) {
	    this.vm.systemOut.log("STACK OVERFLOW: " + val);
	    throw("STACK OVERFLOW: " + val);
	} else {
	    this.memory[this.sp--] = val;
	}
    }

    pushControl(val, label) {
	this.push(val);
	this.control_indices.push({ index: (this.sp + 1), label: label });
    }

    pop(signed) {
	if(this.empty()) {
	    this.vm.systemOut.log("STACK UNDERFLOW");
	    throw("STACK UNDERFLOW: ");
	} else {
	    if(this.control_indices.length === 0 || this.control_indices[this.control_indices.length - 1].index !== (this.sp + 1)) { 
		this.sp++;
		let val;
		if(signed) {
		    val = this.signedMemory[this.sp];
		} else {
		    val = this.memory[this.sp];
		}
		return val;
	    } else {
		throw('Control instruction ' + this.control_indices[this.control_indices.length - 1].label + ' cannot be used as a value');
	    }
	}
    }

    popControl(label) {
	let ctrl = this.control_indices.pop();
	if(ctrl.index === (this.sp + 1) && ctrl.label === label)
	{
	    return this.pop();
	} else {
	    throw('Control flow mismatch, ' + ctrl.index + ' ' + ctrl.label + ' was found while seeking ' + (this.sp + 1) + ' ' + label);
	}
    }

    popControlSkipLeave(label) {
	let leaveStack = [];
	for(var i = this.depth() - 1; i >= 0 && this.peekControl() === 'leave-sys'; i--) {
	    leaveStack.push(this.popControl('leave-sys'));
	}
	let ctrl = this.control_indices.pop();
	if(ctrl.index === (this.sp + 1) && ctrl.label === label)
	{
	    let val = this.pop();
	    while(leaveStack.length !== 0) {
		this.pushControl(leaveStack.pop(), 'leave-sys');
	    }
	    return val;
	} else {
	    throw('Control flow mismatch, ' + ctrl.index + ' ' + ctrl.label + ' was found while seeking ' + (this.sp + 1) + ' ' + label);
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
	if(index < (this.depth() - 1)) {
	    return this.memory[this.s0 - 1 - index];
	} else {
	    throw('CONTROL STACK UNDERFLOW');
	}
    }

    pickControl(index, label) {
	if(index < this.control_indices.length) {
	    if(label === this.control_indices[index].label) {
		return this.memory[this.s0 - 1 - index];
	    } else {
		throw('Control flow mismatch, ' + index + ' ' + this.control_indices[index].label + ' was found while seeking ' + index + ' ' + label);
	    }
	} else {
	    throw('CONTROL STACK UNDERFLOW');
	}
    }

    clear() {
	while(this.sp !== (this.s0 - 1)) {
	    this.vm.memory[this.sp] = 0;
	    this.sp++;
	}
	this.control_indices = [];
    }

    print() {
	let buf = [];
	let count = 0;
	for(var i = this.s0 - 1; i !== this.sp; i--) {
	    buf.push(this.vm.memory[i]);
	    this.vm.systemOut.log(count);
	    count++;
	}
	this.vm.systemOut.log('<' + count + '> ' + buf);
    }

    toJSArray() {
	let buf = [];
	let count = 0;
	for(var i = this.s0 - 1; i !== this.sp; i--) {
	    buf.push(this.vm.memory[i]);
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

    constructor(vm, address, name, immediate, codeWord, codeWord2) {
	this.vm = vm;
	this.address = address;
	this.name = ('' + name).toUpperCase();
	this.immediate = immediate;
	this.codeWord = codeWord;
	this.codeWord2 = codeWord2;
	this.vm.debugTable[this.name] = address;
    }

    static fromAddress(vm, address) {
	vm.stack.push(address);
	let name = vm.readCountedString();
	let immediate = vm.memory.getByte(address + name.length + 1);
	return {address: address, name: name, immediate: immediate};
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

    writeUint32(offset, value) {
	this.view.setUint32(offset, value);
    }

    getByte(offset) {
	return this.view.getUint8(offset);
    }

    writeByte(offset, value) {
	this.view.setUint8(offset, value);
    }
}


const ForthVM = class {
    ip;
    dp;
    w;
    eax;
    cellSize;
    memory;
    numCells;
    stack;
    rstack;
    state;
    toIn;
    tib;
    latest;
    debugTable;
    systemOut;
    
    constructor() {
	this.cellSize = 4;
	this.memory = new Memory();
	this.numCells = this.memory.memorySize / this.cellSize;
	this.ip = 8;
	this.dp = 8;
	this.stack = new Stack(this, this.numCells - 603);
	this.rstack = new Stack(this, this.numCells - 402);
	this.tib = '';
	this.state = 0;
	this.toIn = 0;
	this.latest = 0;
	this.debugTable = {};
	this.systemOut = window.console;
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
	this.memory.writeUint32(this.dp, val);
	this.offsetDp(this.cellSize);
    }

    write(offset, val) {
	this.memory.writeUint32(offset, val);
    }

    writeC(offset, val) {
	this.memory.writeByte(offset, val);
    }

    writeString(offset, str) {
	let i = offset;
	for(ch of str) {
	    this.writeC(i, ch);
	    i++;
	}
    }

    writeCountedString(offset, str) {
	this.writeC(offset, str.length);
	let i = offset + 1;
	for(ch of str) {
	    this.writeC(i, ch);
	    i++;
	}
    }

    writeCHere(cval) {
	this.memory.writeByte(this.dp, cval);
	this.offsetDp(1);
    }

    writeStringHere(str) {
	for(ch of str) {
	    this.writeCHere(ch);
	}
    }

    writeCountedStringHere(str) {
	this.writeCHere(str.length);
	this.writeStringHere(str);
    }

    readCountedString() {
	let str = "";
	let loc = this.stack.pop();
	len = this.memory.getByte(loc);
	loc++;
	for(let i = 0; i < len; i++) {
	    str += this.memory.getByte(loc);
	    loc++;
	}
    }

    getW() {
	return this.w;
    }

    setW(w) {
	this.w = w;
    }

    getEax() {
	return this.eax;
    }

    ldEax(val) {
	this.eax = val;
    }

    jmpEax() {
	this.callCode(this.memory.getUint32(this.eax));
	/*
	if(this.memory.getUint32(this.eax) === 1) {
	    let pfa = this.eax + this.cellSize; // the uint32 at PFA will get an OpCode of a primitive
	    this.dictionary.callCode(this.memory.getUint32(pfa));
	} else {
	    console.log('This shouldn\'t happen');
	}
	*/
    }

    next() {
	this.setW(this.memory.getUint32(this.ip)); // w is now the CFA
	this.offsetIp(this.cellSize);
	this.ldEax(this.memory.getUint32(this.w)); // eax is now contents of code field or the CFA of the (CFA)
	this.jmpEax();
    }

    // OUTER INTERPRETER
    
    isNotSpace(character) {
	return character !== ' ' && character !== '\n';
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
	let foundWord = this.findWord(word);
	let isWord = foundWord !== null && foundWord !== undefined;
	if(isWord) {
	    if(foundWord.immediate === -1 || this.state === 0) {
		this.ip = foundWord.cfa;
		this.next();
	    } else {
		this.writeHere(foundWord);
	    }
	} else if(this.isNumber(word)) {
	    if(this.state === 0) {
		this.stack.push(word);
	    } else {
		this.writeHere(word);
	    }
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

    // DICTIONARY

    getDp() {
	return this.getDp();
    }

    setDp(dp) {
	this.setDp(dp);
    }


    readCountedString(addr) {
	this.push(addr);
	return this.readCountedString();
    }

    addWord(name, immediate, codeWord, codeWord2, parameterField) {
	let word = new Word(address, name, immediate, codeWord, codeWord2, parameterField, this.latest);
	this.writeWord(word);
    }

    addCode(address, name, immediate, codeIndex) {
	let word = new Word(address, name, immediate, 1, 0, codeIndex, this.latest);
	this.writeWord(word);
    }

    callCode(addr) {
	this.codeTable.getCode(addr).call();
    }

    getNameAndLinkFromAddr(addr) {
	let name = this.readCountedString(addr);
	let link = this.getUint32(this.align(addr + name.length));
	return [name,link];
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
	    if(String(tempName).toLocaleUpperCase() === String(name).toLocaleUpperCase()) {
		return tempAddr;
	    } else {
		tempAddr = tempLink;
	    }
	}
	return tempAddr;
    }

    findCFA(name) {
	let addr = this.find(String(name).toLocaleUpperCase());
	if(addr !== 0) {
	    addr += name.length + 1;
	    addr = this.align(addr) + (2 * this.cellSize);
	}
	return addr;
    }

    findWord(name) {
	let addr = this.find(String(name).toLocaleUpperCase());
	if (addr === 0) {
	    return 0;
	} else {
	    return Word.fromDict(String(name).toLocaleUpperCase(), addr);
	}
    }    
}

//window.ForthVM = ForthVM;
window.vm = new ForthVM();


