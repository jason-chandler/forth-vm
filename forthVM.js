class Chunk {
    code;
    capacity;
    count;
    constructor() {
	this.capacity = 8;
	this.code = new Uint8Array(this.capacity);
	this.count = 0;
    }

    growBuffer() {
	let temp = new Uint8Array(this.capacity * 2);
	for(var i = 0; i < this.capacity; i++) {
	    temp[i] = this.code[i];
	}
	this.code = temp;
	this.capacity = this.capacity * 2;
    }
    
    write(b) {
	if(this.capacity < this.count + 1) {
	    this.growBuffer();
	}
	this.code[this.count] = b;
	this.count++;
    }
}

class OpCode {
    static {}
    static OP_NOOP = 0;
    static OP_JMP = 1;
    static OP_LIT = 2;
    static OP_ULIT = 3;
    static OP_FLIT = 4;
    static OP_DLIT = 5;
    static OP_RPUSH = 6;
    static OP_RPOP = 7;
    static OP_PUSH = 8;
    static OP_POP = 9;
    static OP_PLUS = 10;
    static OP_MINUS = 11;
    static OP_SLASH = 12;
    static OP_STAR = 13;
    static OP_MOD = 14;
    static OP_DUP = 15;
    static OP_BYE = 16;
    static OP_EXIT = 17;
    static OP_DOCOL = 18;
    static OP_SWAP = 19;
    static OP_DUP = 20;
    static OP_ROT = 21;
    static OP_MINUS_ROT = 22;
    static OP_PICK = 23;
    static OP_NIP = 24;
    static OP_TUCK = 25;
    static OP_OVER = 26;
    static OP_DOT = 27;
    static OP_DOT_S = 28;
    static OP_DUMP = 29;
    static OP_DUMPC = 30;
    static OP_CREATE = 31;
    static OP_DOES = 32;
    static OP_ALIGN = 33;
    static OP_ALIGNED = 34;
    static OP_IMMEDIATE = 35;
    static OP_LBRAC = 36;
    static OP_RBRAC = 37;
    static OP_STORE = 38;
    static OP_FETCH = 39;
    static OP_SP_FETCH = 40;
    static OP_EQ = 41;
    static OP_DOVAR = 42;
    static OP_DOCON = 43;
    static OP_BRANCH = 44;
    static OP_0BRANCH = 45;
    static OP_WORDS = 46;
    static OP_COLON = 47;
    static OP_SEMICOLON = 48;
    static OP_PARSE = 49;
    static OP_DROP = 50;
    static OP_TO_R = 51;
    static OP_R_TO = 52;
    static OP_BL = 53;
    static OP_DODOES = 54;
    static OP_CONSTANT = 55;
    static OP_VARIABLE = 56;
    static OP_ALLOT = 57;
    static OP_COMMA = 58;
    static OP_C_COMMA = 59;
    static OP_HERE = 60;
    static OP_IF = 61;
    static OP_ELSE = 62;
    static OP_THEN = 63;
    static OP_TRUE = 64;
    static OP_FALSE = 65;

    static reverseLookup(val) {
	switch(val) {
	case OpCode.OP_NOOP:
	    return 'OP_NOOP';
	    break;
	case OpCode.OP_DOCOL:
	    return 'OP_DOCOL';
	    break;
	case OpCode.OP_DOCON:
	    return 'OP_DOCON';
	    break;
	case OpCode.OP_DOVAR:
	    return 'OP_DOVAR';
	    break;
	case OpCode.OP_ULIT:
	    return 'OP_ULIT';
	    break;
	case OpCode.OP_EXIT:
	    return 'OP_EXIT';
	    break;
	case OpCode.OP_LIT:
	    return 'OP_LIT';
	    break;
	case OpCode.OP_FLIT:
	    return 'OP_FLIT';
	    break;
	case OpCode.OP_DLIT:
	    return 'OP_DLIT';
	    break;
	case OpCode.OP_TO_R:
	    return 'OP_TO_R';
	    break;
	case OpCode.OP_R_TO:
	    return 'OP_R_TO';
	    break;
	case OpCode.OP_PUSH:
	    return 'OP_PUSH';
	    break;
	case OpCode.OP_POP:
	    return 'OP_POP';
	    break;
	case OpCode.OP_SWAP:
	    return 'OP_SWAP';
	    break;
	case OpCode.OP_DUP:
	    return 'OP_DUP';
	    break;
	case OpCode.OP_DROP:
	    return 'OP_DROP';
	    break;
	case OpCode.OP_OVER:
	    return 'OP_OVER';
	    break;
	case OpCode.OP_PICK:
	    return 'OP_PICK';
	    break;
	case OpCode.OP_ROT:
	    return 'OP_ROT';
	    break;
	case OpCode.OP_MINUS_ROT:
	    return 'OP_MINUS_ROT';
	    break;
	case OpCode.OP_NIP:
	    return 'OP_NIP';
	    break;
	case OpCode.OP_TUCK:
	    return 'OP_TUCK';
	    break;
	case OpCode.OP_PLUS:
	    return 'OP_PLUS';
	    break;
	case OpCode.OP_MINUS:
	    return 'OP_MINUS';
	    break;
	case OpCode.OP_SLASH:
	    return 'OP_SLASH';
	    break;
	case OpCode.OP_STAR:
	    return 'OP_STAR';
	    break;
	case OpCode.OP_MOD:
	    return 'OP_MOD';
	    break;
	case OpCode.OP_GREATER:
	    return 'OP_GREATER';
	    break;
	case OpCode.OP_GREATER_EQ:
	    return 'OP_GREATER_EQ';
	    break;
	case OpCode.OP_EQ:
	    return 'OP_EQ';
	    break;
	case OpCode.OP_LESS:
	    return 'OP_LESS';
	    break;
	case OpCode.OP_LESS_EQ:
	    return 'OP_LESS_EQ';
	    break;
	case OpCode.OP_ZERO_EQ:
	    return 'OP_ZERO_EQ';
	    break;
	case OpCode.OP_ZERO_LESS:
	    return 'OP_ZERO_LESS';
	    break;
	case OpCode.OP_BRANCH:
	    return 'OP_BRANCH';
	    break;
	case OpCode.OP_0BRANCH:
	    return 'OP_0BRANCH';
	    break;
	case OpCode.OP_DOT_S:
	    return 'OP_DOT_S';
	    break;
	case OpCode.OP_DOT:
	    return 'OP_DOT';
	    break;
	case OpCode.OP_FETCH:
	    return 'OP_FETCH';
	    break;
	case OpCode.OP_SP_FETCH:
	    return 'OP_SP_FETCH';
	    break;
	case OpCode.OP_STORE:
	    return 'OP_STORE';
	    break;
	case OpCode.OP_WORDS:
	    return 'OP_WORDS';
	    break;
	case OpCode.OP_COLON:
	    return 'OP_COLON';
	    break;
	case OpCode.OP_SEMICOLON:
	    return 'OP_SEMICOLON';
	    break;
	case OpCode.OP_PARSE:
	    return 'OP_PARSE';
	    break;
	case OpCode.OP_DUMP:
	    return 'OP_DUMP';
	    break;
	case OpCode.OP_DUMPC:
	    return 'OP_DUMPC';
	    break;
	case OpCode.OP_BL:
	    return 'OP_BL';
	    break;
	case OpCode.OP_DODOES:
	    return 'OP_DODOES';
	    break;
	case OpCode.OP_VARIABLE:
	    return 'OP_VARIABLE';
	    break;
	case OpCode.OP_CONSTANT:
	    return 'OP_CONSTANT';
	    break;
	case OpCode.OP_CREATE:
	    return 'OP_CREATE';
	    break;
	case OpCode.OP_DOES:
	    return 'OP_DOES';
	    break;
	case OpCode.OP_ALLOT:
	    return 'OP_ALLOT';
	    break;
	case OpCode.OP_COMMA:
	    return 'OP_COMMA';
	    break;
	case OpCode.OP_C_COMMA:
	    return 'OP_C_COMMA';
	    break;
	case OpCode.OP_LBRAC:
	    return 'OP_LBRAC';
	    break;
	case OpCode.OP_RBRAC:
	    return 'OP_RBRAC';
	    break;
	case OpCode.OP_HERE:
	    return 'OP_HERE';
	    break;
	case OpCode.OP_IF:
	    return 'OP_IF';
	    break;
	case OpCode.OP_ELSE:
	    return 'OP_ELSE';
	    break;
	case OpCode.OP_THEN:
	    return 'OP_THEN';
	    break;
	case OpCode.OP_TRUE:
	    return 'OP_TRUE';
	    break;
	case OpCode.OP_FALSE:
	    return 'OP_FALSE';
	    break;	    
	}

    }
}

class Debug {
    
    static {}
    static disassembleChunk(chunk) {
	for(var offset = 0; offset < chunk.count;) {
	    offset = Debug.disassembleInstruction(chunk, offset);
	}
    }
    static simpleInstruction(name, offset) {
	console.log(name);
	return offset + 1;
    }
    
    static disassembleInstruction(chunk, offset) {
	let instruction = chunk.code[offset];
	switch(instruction) {
	case OpCode.OP_NOOP:
	    return simpleInstruction("OP_NOOP", offset);
	case OpCode.OP_RETURN:
	    return simpleInstruction("OP_RETURN", offset);
	default:
	    return simpleInstruction("UNKNOWN", offset);
	}
    }
}

class Head {
    Vm;
    name;
    address;
    link;

    constructor(vm, name, address) {
	this.vm = vm;
	this.name = name;
	this.address = address;
    }

    writeName() {
	this.vm.offsetDp(-this.vm.dp + this.vm.writeCountedString(this.name, this.vm.dp));
    }

    makeLink() {
	this.link = this.vm.latest
	this.vm.offsetDp(-this.vm.dp + this.vm.writeUint32(this.link, this.vm.dp));
    }

    write() {
	this.writeName();
	this.makeLink();
    }
}

class Word {
    vm;
    head;
    headAddress;
    immediate;
    immediateAddress;
    codeWord;
    cfa;
    pfa;
    parameterField;


    // HEAD
    // name - regular string in constructors, counted string in memory
    // link - address of previous word
    //
    // BODY
    // immediate
    // codeWord
    // cfa;
    // parameterField;

    // New word
    static newWord(vm, name, immediate, codeWord, parameterField, codeWord2) {
	let word = new Word();
	word.vm = vm;
	word.headAddress = word.vm.dp;
	word.head = new Head(word.vm, name, word.headAddress);
	word.head.write();
	word.immediate = immediate; // is this an immediate word
	word.codeWord = codeWord;
	word.codeWord2 = codeWord2 === null ? OpCode.NOOP : codeWord2 === undefined ? OpCode.NOOP : codeWord2;
	word.parameterField = parameterField;
	word.writeBody();
	return word;
    }

    // Existing word
    static fromDict(vm, name, address) {
	let word = new Word();
	word.vm = vm;
	word.headAddress = address;
	word.head = new Head(word.vm, name, word.headAddress);
	let countString = word.vm.readCountedString(word.headAddress);
	word.head.name = countString[1];
	let linkLoc = countString[2];
	word.head.link = word.vm.memory[linkLoc];
	word.vm.debug('name: ' + word.head.name);
	word.vm.debug('address: ' + word.headAddress);
	word.immediateAddress = linkLoc + 1;
	word.vm.debug('immediate Addr ' + word.immediateAddress);
	word.immediate = word.vm.memory[word.immediateAddress];
	word.vm.debug('immediate ' + word.immediate);
	word.cfa = word.immediateAddress + 1;
	word.cfa2 = word.cfa + 1;
	word.vm.debug('cfa: ' + word.cfa);
	word.vm.debug('cfa2: ' + word.cfa2);
	word.codeWord = word.vm.memory[word.cfa];
	word.codeWord2 = word.vm.memory[word.cfa2];
	word.vm.debug('word.codeWord = ' + word.codeWord);
	word.vm.debug('word.codeWord2 = ' + word.codeWord2);
	word.pfa = word.cfa2 + 1;
	word.parameterField = [];
	let pp = word.pfa;
	if(word.codeWord === OpCode.OP_JMP) {
	    word.parameterField.push(word.vm.memory[pp]);
	} else {
	    while((word.vm.memory[pp] !== word.vm.exitXt) && word.vm.memory[pp] !== undefined) {
		word.parameterField.push(word.vm.memory[pp]);
		pp++;
	    }
	}
	word.vm.debug('word.parameterField = ' + word.parameterField);
	return word;
    }

    writeBody() {
	this.immediateAddr = this.vm.dp;
	this.vm.offsetDp(-this.vm.dp + this.vm.writeUint32(this.immediate, this.vm.dp));
	this.cfa = this.vm.dp;
	if(this.codeWord === OpCode.OP_JMP) { // code, not high level Forth
	    this.vm.offsetDp(-this.vm.dp + this.vm.writeUint32(OpCode.OP_JMP, this.vm.dp));
	    this.vm.offsetDp(-this.vm.dp + this.vm.writeUint32(this.codeWord2, this.vm.dp));
	    this.vm.offsetDp(-this.vm.dp + this.vm.writeUint32(this.parameterField, this.vm.dp));
	    // keep hidden until word is defined
	    this.vm.latest = this.headAddress;

	} else {
	    this.vm.offsetDp(-this.vm.dp + this.vm.writeUint32(this.codeWord, this.vm.dp));
	    this.vm.offsetDp(-this.vm.dp + this.vm.writeUint32(this.codeWord2, this.vm.dp));
	    // leave body open for create/colon to compile to
	    if(this.parameterField !== null && this.parameterField !== undefined) {
		this.vm.offsetDp(-this.vm.dp + this.vm.writeUint32(this.parameterField, this.vm.dp));
	    }
	    this.vm.wordUnderConstruction = this.headAddress;
	}

    }

    static endBody(vm) {
	vm.offsetDp(-vm.dp + vm.writeUint32(vm.exitXt, vm.dp));
	// keep hidden until word is defined
	Word.unhideLatest(vm);
    }

    static unhideLatest(vm) {
	vm.latest = vm.wordUnderConstruction;
    }

    static lastDefinitionUsedCreate(vm) {
	return Word.at(vm, vm.latest).codeWord2 === 1;
    }

    static getNameAndLinkFromAddr(vm, addr) {
	let countString = vm.readCountedString(addr);
	let name = countString[1];
	let link = vm.memory[countString[2]];
	return [name,link];
    }

    // Return address or 0
    static find(vm, name) {
	if(vm.latest === 0) {
	    throw("Forth VM has no definitions!");
	}
	let tempAddr = vm.latest;
	while(tempAddr !== 0) {
	    let check = this.getNameAndLinkFromAddr(vm, tempAddr);
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

    static findWord(vm, name) {
	let addr = Word.find(vm, String(name).toLocaleUpperCase());
	if (addr === 0) {
	    return 0;
	} else {
	    return Word.fromDict(vm, String(name).toLocaleUpperCase(), addr);
	}
    }

    static at(vm, addr) {
	return Word.fromDict(vm, vm.readCountedString(addr)[1].toLocaleUpperCase(), addr);
    }

    // Probably slow, just use this for debug
    static fromCfa(vm, cfa) {
	if(vm.latest === 0) {
	    throw("Forth VM has no definitions!");
	}
	let tempAddr = vm.latest;
	while(tempAddr !== 0) {
	    let check = this.getNameAndLinkFromAddr(vm, tempAddr);
	    let tempName = check[0];
	    let tempLink = check[1];
	    let word = Word.fromDict(vm, String(tempName).toLocaleUpperCase(), tempAddr);
	    if(cfa === word.cfa) {
		return word;
	    } else {
		tempAddr = tempLink;
	    }
	}
	return tempAddr;
    }
    
    static findXt(vm, name) {
	let wordOrZero = Word.findWord(vm, String(name).toLocaleUpperCase());
	if(wordOrZero !== 0) {
	    return wordOrZero.cfa;;
	} else {
	    vm.abort(String(name).toLocaleUpperCase() + " ?");
	}
    }
}


class Stack {
    vm;
    memory;
    s0; // below bottom of stack
    sp; // stack pointer
    cell_size;

    constructor(vm, s0, cell_size) {
	this.vm = vm;
	this.memory = vm.memory;
	this.s0 = s0;
	this.sp = this.s0 - 1; 
	this.cell_size = cell_size;
	this.stack_limit = 200;
    }

    empty() {
	return this.sp === this.s0 - 1;
    }

    push(val) {
	if(this.s0 - this.sp >= this.stack_limit) {
	    this.vm.systemOut.log("STACK OVERFLOW: " + val);
	    throw("STACK OVERFLOW: " + val);
	} else {
	    this.memory[this.sp--] = val;
	}
    }

    pop() {
	if(this.empty()) {
	    this.vm.systemOut.log("STACK UNDERFLOW");
	    throw("STACK UNDERFLOW: ");
	} else {
	    this.sp++;
	    let val = this.memory[this.sp];
	    return val;
	}
    }

    clear() {
	while(this.sp !== (this.s0 - 1)) {
	    this.vm.memory[this.sp] = 0;
	    this.sp++;
	}
    }

    print() {
	let buf = [];
	let count = 0;
	for(var i = this.s0 - 1; i !== this.sp; i--) {
	    buf.push(this.vm.memory[i]);
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

class InputQueue {
    vm;
    i0;
    tos;
    ip;
    to_in;
    rp;
    rotation;

    constructor(vm, address) {
	this.vm = vm;
	// byte-aligned
	this.i0 = this.vm.getByteAddress(address);
	this.ip = this.i0 - 1;
	this.tos = this.ip;
	this.rp = this.ip;
	this.to_in = 0;
	this.rotation = 0;
    }

    empty() {
	return this.rp === this.ip;
    }

    clear() {
	this.vm.debugFinest('clearing inputBuffer');
	this.tos = this.i0 - 1;
	this.rp = this.i0 - 1;
	this.ip = this.i0 - 1;
	this.to_in = 0;
	this.rotation = 0;
	/*
	while(this.ip !== this.i0 - 1) {
	    this.vm.writeByte(0, this.ip);
	    this.ip++;
	}
	*/
    }

    push(name) {
	let truncLength = Math.min(name.length, 255);
	this.vm.writeByte(truncLength, this.ip);
	this.tos = this.ip;
	this.ip--;
	for(var i = 0; i < truncLength; i++) {
	    this.vm.writeByte(name.charCodeAt(i), this.ip);
	    this.ip--;
	    this.vm.debug(name.charCodeAt(i));
	}
    }

    pop() {
	// Max length is 255
	if(!this.empty()) {
	    let len = this.vm.byteView[this.rp];
	    this.rp--;
	    this.to_in++;
	    let str = '';
	    for(var i = 0; i < len; i++) {
		str += String.fromCharCode(this.vm.byteView[this.rp]);
		this.rp--;
		this.to_in++;
	    }
	    if(this.rp === this.ip) {
		this.rotation++;
		if(this.rotation === 16) {
		    this.clear();
		}
	    }
	    return str;
	} else {
	    this.vm.abort('INPUT BUFFER UNDERFLOW');
	}
    }

    rewind(len) {
	if(this.rp + len >= this.i0) {
	    this.vm.abort("INPUT BUFFER UNDERFLOW");
	}
	this.rp += len;
	this.to_in -= len;
    }

    skip(len) {
	if(this.rp - len < this.ip) {
	    this.vm.abort("INPUT BUFFER OVERFLOW");
	}
	this.rp -= len;
	this.to_in += len;
    }

    rewriteAtRp(name) {
	let saveIp = this.ip;
	let saveTos = this.tos;
	this.ip = this.rp;
	this.push(name);
	this.ip = saveIp;
	this.tos = saveTos;
    }

    print() {
	let addr = this.i0 - 1;
	while(addr !== this.ip) {
	    this.vm.systemOut.log(String.fromCharCode(this.vm.byteView[addr]));
	    addr--;
	}
    }

}


class ForthVM {
    stack;
    rstack;
    fstack;
    jstack;
    cfstack;
    inputBuffer;
    eax;
    memory_size;
    memory;
    cell_size;
    ip;
    dp;
    latest;
    source_id;
    systemOut;
    state;
    pad;
    debugMode;
    userMark;
    sysMark;
    wordUnderConstruction;
    exitXt;
    cfaXtArray;
    controlFlowUnresolved;

    constructor() {
	this.cell_size = 4; // in order to get a Uint32, new Uint32Array(memory.buffer, byteOffset, length_in_uint32s)
	this.memory_size = 65536;
	this.memory = new Uint32Array(this.memory_size);
	this.byteView = new Uint8Array(this.memory.buffer);
	this.stack = new Stack(this, this.memory_size - 603, this.cell_size);
	this.rstack = new Stack(this, this.memory_size - 402, this.cell_size);
	this.fstack = new Stack(this, this.memory_size - 201, this.cell_size);
	this.cfstack = new Stack(this, this.memory_size - 804, this.cell_size);
	this.jstack = [];
	this.inputBuffer = new InputQueue(this, this.memory_size - 1005);
	this.ip = 2; // program counter, current interp address
	this.dp = 2;
	this.cdp = this.dp * this.cell_size; // char-aligned dictionary pointer
	this.eax; // register for current value
	this.latest = 0;
	this.source_id = -1; // -1 for string eval, 0 for file
	this.systemOut = console; // in case i change output area later;
	this.addPrimitives();
	this.state = 0; // interpret mode
	this.refreshPad();
	this.debugMode = 0;
	this.wordUnderConstruction = null;
	this.exitXt = Word.findXt(this, 'EXIT');
	this.cfaXtArray = this.findCfaWords();
	this.controlFlowUnresolved = 0;
    }

    findCfaWords() {
	let arr = [];
	for(const i of ['DOCOL','DOCON','DOVAR', 'DODOES']) {
	    arr.push(Word.findXt(this, i));
	}
	return arr;
    }

    debug(...input) {
	if(this.debugMode === -1 || this.debugMode === -2) {
	    this.systemOut.log.apply(this.systemOut, input);
	}
    }

    debugFn(fn, thisArg, ...args) {
	if(this.debugMode === -1 || this.debugMode === -2) {
	    fn.call(thisArg, args);
	}
    }

    debugFinest(...input) {
	if(this.debugMode === -2) {
	    this.systemOut.log.apply(this.systemOut, input);
	}

    }

    writeByte(b, offset) {
	this.byteView[offset] = b;
	this.debugFinest('writing ' + b + ' @ ' + offset)
    }

    alignHelper(offset, write) {
	if(offset === 0) {
	    return 0;
	}
	if(offset % this.cell_size === 0) {
	    return offset / this.cell_size;
	} else {
	    // if we're writing, put down some nullops til we get there
	    if(write) {	
		while(offset % this.cell_size !== 0) {
		    this.debug(offset);
		    this.writeByte(OpCode.OP_NOOP, offset);
		    offset++;
		}
	    } else {
		// if we're just reading, skip ahead
		offset += (this.cell_size - (offset % this.cell_size))
	    }
	    return offset / this.cell_size;
	}
    }

    writeAlign(offset) {
	return this.alignHelper(offset, true);
    }

    readAlign(offset) {
	return this.alignHelper(offset, false);
    }

    align() {
	let alignedAddr = readAlign(this.here());
	this.dp = alignedAddr;
	this.cdp = alignedAddr * this.cell_size;
    }

    aligned() {
	let alignedAddr = readAlign(this.here()) * this.cell_size;
	this.stack.push(alignedAddr);
    }

    getByteAddress(addr) {
	return addr * this.cell_size;
    }

    find(name) {
	return Word.findWord(this, name);
    }

    tick() {
	this.bl();
	this.parse();
	let name = this.readReversedCountedString(null, true, true, true)[1];
	this.stack.push(Word.findXt(this, name));
    }

    here() {
	this.stack.push(this.cdp);
    }

    create() {
	this.bl();
	this.parse();
	let name = this.readReversedCountedString(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for create definition');
	}
	Word.newWord(this, name, 0, this.cfaXtArray[2], null, 1);
	Word.unhideLatest(this);
    }

    does() {
	if(Word.lastDefinitionUsedCreate(this)) {
	    let instanceWord = Word.at(this, this.latest);
	    this.memory[instanceWord.cfa] = this.cfaXtArray[3];
	    this.memory[instanceWord.cfa2] = this.ip;
	    this.debug('does: ');
	    this.debug(instanceWord);
	    this.exit();
	} else {
	    this.abort('DOES> used without create');
	}
    }

    variable() {
	this.bl();
	this.parse();
	let name = this.readReversedCountedString(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for variable definition');
	}
	Word.newWord(this, name, 0, this.cfaXtArray[2], 0);
	Word.unhideLatest(this);
    }

    constant() {
	this.bl();
	this.parse();
	let name = this.readReversedCountedString(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for constant definition');
	}
	const constant = this.stack.pop();
	Word.newWord(this, name, 0, this.cfaXtArray[1], constant);
	this.debug('New constant ' + name + ' with value: ' + constant);
	Word.unhideLatest(this);
    }

    allot() {
	let bytes = this.stack.pop();
	this.offsetDp(bytes, true);
    }

    comma() {
	const x = this.stack.pop();
	this.memory[this.dp] = x;
	this.offsetDp(1);
    }

    cComma() {
	const x = this.stack.pop();
	this.byteView[this.cdp] = x;
	this.offsetDp(1, true);
    }

    dodoesLoop(topIp) {
	do {
	    let dest = this.memory[this.ip];
	    this.debug('dodoes Jump destination: ' + dest);
	    // When we jump back, we want the next space
	    let isCode = this.checkForCode();
	    if(!isCode && dest !== 0) {
		if(this.isCFA(this.ip)) {
		    this.debug('skipping cfa2: ' + (this.ip + 1))
		    this.ip += 2;
		} else {
		    this.ip++;
		}
		this.rPush(this.ip);
		this.jmp(dest);
	    } else if(isCode) {
		this.call();
	    } else {
		//noop or empty codeword2:
		this.ip++;
		return;
	    }
	} while(this.ip !== topIp || this.rstack.empty());
    }
    
    dodoes() {
	this.stack.push(this.ip);
	this.ip--;
	this.dodoesLoop(this.ip);
	this.exit();
    }
    
    // Write a counted string and then align to cell size
    writeCountedString(name, addr, charAligned) {
	let isIp;
	if (addr === undefined) { addr = this.ip; isIp = true; };
	let tempIp = this.getByteAddress(addr);
	let truncLength = Math.min(name.length, 255);
	this.writeByte(truncLength, tempIp);
	tempIp++;
	for(var i = 0; i < truncLength; i++) {
	    this.writeByte(name.charCodeAt(i), tempIp);
	    tempIp++
	    this.debug(name.charCodeAt(i));
	}
	// Make sure we line back up with cell size
	if(isIp) {
	    this.ip = this.writeAlign(tempIp);
	} else {
	    if(!charAligned) {
		return this.writeAlign(tempIp);
	    } else {
		return tempIp;
	    }
	}
	this.debugFinest('aligned address after write is ' + this.ip)
	this.debugFinest('it contains ' + this.memory[this.ip]);
    }

    readCountedString(addr, isByteAddress, isLengthOnStack, isAddrOnStack) {
	if ( addr === undefined) { addr = this.ip };
	let byteAddress;
	let len;
	if(isLengthOnStack) {
	    len = this.stack.pop();
	}
	if(isAddrOnStack) {
	    addr = this.stack.pop();
	}
	
	if(!isByteAddress) {
	    byteAddress = this.getByteAddress(addr);
	} else {
	    byteAddress = addr;
	}
	// Max length is 255
	if(!isLengthOnStack) {
	    len = this.byteView[byteAddress];
	    byteAddress++;
	} 
	let str = '';
	for(var i = 0; i < len; i++) {
	    str += String.fromCharCode(this.byteView[byteAddress]);
	    byteAddress++
	}
	return [len, str, this.readAlign(byteAddress)]; // 
    }

    readReversedCountedString(addr, isByteAddress, isLengthOnStack, isAddrOnStack) {
	if ( addr === undefined) { addr = this.ip };
	let byteAddress;
	let len;
	if(isLengthOnStack) {
	    len = this.stack.pop();
	}
	if(isAddrOnStack) {
	    addr = this.stack.pop();
	}
	
	if(!isByteAddress) {
	    byteAddress = this.getByteAddress(addr);
	} else {
	    byteAddress = addr;
	}
	// Max length is 255
	if(!isLengthOnStack) {
	    len = this.byteView[byteAddress];
	    byteAddress--;
	}
	let str = '';
	for(var i = 0; i < len; i++) {
	    str += String.fromCharCode(this.byteView[byteAddress]);
	    byteAddress--;
	}
	return [len, str]; // 
    }

    writeUint32(u, addr) {
	if(addr === undefined || addr === null) {
	    this.memory[this.ip] = u;
	    this.ip++;
	} else {
	    this.memory[addr] = u;
	    return addr + 1;
	}
    }

    writeInt32(i, addr) {
	if(addr === undefined || addr === null) {
	    new Int32Array(this.memory.buffer, this.ip * 4, 1)[0] = i;
	    this.ip++;
	} else {
	    new Int32Array(this.memory.buffer, addr * 4, 1)[0] = i;
	    return addr + 1;
	}
    }

    clearStacks() {
	this.rstack.clear();
	this.stack.clear();
	this.fstack.clear();
	this.cfstack.clear();
	this.inputBuffer.clear();
	this.jstack = [];
	this.controlFlowUnresolved = 0;
    }
    

    defcode(name, immediate, opcode) {
	if(opcode === undefined) {
	    this.abort('Undefined opcode: ' + name);
	}
	// a codeword of 1 will run the next address as a JS primitive lookup
	Word.newWord(this, name, immediate, OpCode.OP_JMP, opcode);
    }

    addPrimitives() {
	this.defcode('EXIT', 0, OpCode.OP_EXIT);
	this.defcode('SWAP', 0, OpCode.OP_SWAP);
	this.defcode('BYE', 0, OpCode.OP_BYE);
	this.defcode('+', 0, OpCode.OP_PLUS);
	this.defcode('-', 0, OpCode.OP_MINUS);
	this.defcode('*', 0, OpCode.OP_STAR);
	this.defcode('/', 0, OpCode.OP_SLASH);
	this.defcode('MOD', 0, OpCode.OP_MOD);
	this.defcode('>R', 0, OpCode.OP_TO_R);
	this.defcode('R>', 0, OpCode.OP_R_TO);
	this.defcode('DOCOL', 0, OpCode.OP_DOCOL);
	this.defcode(':', 0, OpCode.OP_COLON);
	this.defcode(';', 1, OpCode.OP_SEMICOLON);
	this.defcode('LIT', 0, OpCode.OP_LIT);
	this.defcode('FLIT', 0, OpCode.OP_FLIT);
	this.defcode('DUP', 0, OpCode.OP_DUP);
	this.defcode('DROP', 0, OpCode.OP_DROP);
	this.defcode('OVER', 0, OpCode.OP_OVER);
	this.defcode('PICK', 0, OpCode.OP_PICK);
	this.defcode('NIP', 0, OpCode.OP_NIP);
	this.defcode('TUCK', 0, OpCode.OP_TUCK);
	this.defcode('ROT', 0, OpCode.OP_ROT);
	this.defcode('-ROT', 0, OpCode.OP_MINUS_ROT);
	this.defcode('.', 0, OpCode.OP_DOT);
	this.defcode('.S', 0, OpCode.OP_DOT_S);
	this.defcode('=', 0, OpCode.OP_EQ);
	this.defcode('!', 0, OpCode.OP_STORE);
	this.defcode('@', 0, OpCode.OP_FETCH);
	this.defcode('DOVAR', 0, OpCode.OP_DOVAR);
	this.defcode('DOCON', 0, OpCode.OP_DOCON);
	this.defcode('DUMP', 0, OpCode.OP_DUMP);
	this.defcode('DUMPC', 0, OpCode.OP_DUMPC);
	this.defcode('CREATE', 0, OpCode.OP_CREATE);
	this.defcode('DOES>', 0, OpCode.OP_DOES);
	this.defcode('ALIGN', 0, OpCode.OP_ALIGN);
	this.defcode('ALIGNED', 0, OpCode.OP_ALIGNED);
	this.defcode('IMMEDIATE', 0, OpCode.OP_IMMEDIATE);
	this.defcode('[', 1, OpCode.OP_LBRAC);
	this.defcode(']', 1, OpCode.OP_RBRAC);
	this.defcode('!', 0, OpCode.OP_STORE);
	this.defcode('@', 0, OpCode.OP_FETCH);
	this.defcode('SP@', 0, OpCode.OP_SP_FETCH);
	this.defcode('BRANCH', 0, OpCode.OP_BRANCH);
	this.defcode('0BRANCH', 0, OpCode.OP_0BRANCH);
	this.defcode('WORDS', 0, OpCode.OP_WORDS);
	this.defcode('PARSE', 0, OpCode.OP_PARSE);
	this.defcode('BL', 0, OpCode.OP_BL);
	this.defcode('DODOES', 0, OpCode.OP_DODOES);
	this.defcode('VARIABLE', 0, OpCode.OP_VARIABLE);
	this.defcode('CONSTANT', 0, OpCode.OP_CONSTANT);
	this.defcode('ALLOT', 0, OpCode.OP_ALLOT);
	this.defcode(',', 0, OpCode.OP_COMMA);
	this.defcode('C,', 0, OpCode.OP_C_COMMA);
	this.defcode('HERE', 0, OpCode.OP_HERE);
	this.defcode('IF', 1, OpCode.OP_IF);
	this.defcode('ELSE', 1, OpCode.OP_ELSE);
	this.defcode('THEN', 1, OpCode.OP_THEN);
	this.defcode('TRUE', 0, OpCode.OP_TRUE);
	this.defcode('FALSE', 0, OpCode.OP_FALSE);
    }

    offsetIp(numCells) {
	this.ip += numCells;
    }

    offsetDp(offset, isBytes) {
	if(isBytes) {
	    this.cdp += offset;
	    this.dp = this.readAlign(this.cdp);
	} else {
	    this.dp += offset;
	    this.cdp = this.dp * this.cell_size;
	}
    }

    noOp() {
	this.offsetIp(1);
    }

    swap() {
	let a = this.stack.pop();
	let b = this.stack.pop();
	this.stack.push(a);
	this.stack.push(b);
    }

    refreshPad() {
	this.pad = this.dp + 200;
    }

    //inline param
    pushFloat32() {
	this.stack.push(new Float32Array(this.memory.buffer, this.ip * 4, 1)[0]);
	this.offsetIp(1)
    }
    
    //inline param
    pushDouble64()  {
	this.stack.push(new Float64Array(this.memory.buffer, this.ip * 4, 1)[0]);
	this.offsetIp(2);
    }

    pushInt32()  {
	let signed = new Int32Array(this.memory.buffer, this.ip * 4, 1)[0];
	this.debug('Pushing Int32: ' + signed);
	this.stack.push(signed);
	this.offsetIp(1);
    }


    pushUint32() {
	this.debugFinest('Pushing Uint32: ' + this.memory[this.ip]);
	this.stack.push(this.memory[this.ip]);
	this.offsetIp(1);
    }

    pushFalse() {
	this.stack.push(0);
    }

    pushTrue() {
	this.stack.push(-1);
    }

    dump() {
	let numCells = this.stack.pop();
	let startingAddr = this.stack.pop();
	let tempBuff = [];
	for(var i = 0; i < numCells; i++) {
	    tempBuff.push(this.memory[startingAddr + i]);
	}
	this.systemOut.log(tempBuff);
    }

    dumpc() {
	let numBytes = this.stack.pop();
	let startingAddr = this.stack.pop();
	let tempBuff = [];
	for(var i = 0; i < numBytes; i++) {
	    tempBuff.push(String.fromCharCode(this.byteView[startingAddr + i]));
	}
	this.systemOut.log(tempBuff);
    }

    refill() {
	if(this.parseBuffer.length !== 0) {
	    
	}
    }

    quit() {
	this.clearStacks();
    }

    forgetDefinitionInProgress() {
	if(!this.rstack.empty()) {
	    this.ip = (this.rstack.s0 - 1)
	}
	while(this.ip > this.sysMark) {
	    this.memory[this.ip] = 0;
	    this.ip--;
	}
	this.memory[this.ip] = 0;
	this.state = 0;
    }

    abort(msg) {
	if(msg === undefined || msg === null) {
	    msg = 'Abort called at ' + this.ip;
	}
	if(this.state === -1) {
	    this.forgetDefinitionInProgress();
	}
	this.quit();
	throw(msg);
    }

    rPush(reg) {
	this.rstack.push(reg);
    }

    jmp(dest) {
	this.ip = dest;
    }

    engine(prim) {
	switch(prim) {
	case OpCode.OP_NOOP:
	    this.noOp();
	    break;
	case OpCode.OP_DOCOL:
	    this.docol();
	    break;
	case OpCode.OP_DOCON:
	    this.docon();
	    break;
	case OpCode.OP_DOVAR:
	    this.dovar();
	    break;
	case OpCode.OP_ULIT:
	    this.uLit();
	    break;
	case OpCode.OP_LIT:
	    this.lit();
	    break;
	case OpCode.OP_FLIT:
	    this.fLit()
	    break;
	case OpCode.OP_DLIT:
	    this.dLit();
	    break;
	case OpCode.OP_TO_R:
	    this.toR();
	    break;
	case OpCode.OP_R_TO:
	    this.rTo();
	    break;
	case OpCode.OP_SWAP:
	    this.swap();
	    break;
	case OpCode.OP_DUP:
	    this.dup();
	    break;
	case OpCode.OP_DROP:
	    this.drop();
	    break;
	case OpCode.OP_OVER:
	    this.over();
	    break;
	case OpCode.OP_PICK:
	    this.pick();
	    break;
	case OpCode.OP_ROT:
	    this.rot();
	    break;
	case OpCode.OP_MINUS_ROT:
	    this.minus_rot();
	    break;
	case OpCode.OP_NIP:
	    this.nip();
	    break;
	case OpCode.OP_TUCK:
	    this.tuck();
	    break;
	case OpCode.OP_PLUS:
	    this.plus();
	    break;
	case OpCode.OP_MINUS:
	    this.minus();
	    break;
	case OpCode.OP_SLASH:
	    this.slash();
	    break;
	case OpCode.OP_STAR:
	    this.star();
	    break;
	case OpCode.OP_MOD:
	    this.mod();
	    break;
	case OpCode.OP_GREATER:
	    this.greater();
	    break;
	case OpCode.OP_GREATER_EQ:
	    this.greaterEq();
	    break;
	case OpCode.OP_EQ:
	    this.eq();
	    break;
	case OpCode.OP_LESS:
	    this.less();
	    break;
	case OpCode.OP_LESS_EQ:
	    this.lessEq();
	    break;
	case OpCode.OP_ZERO_EQ:
	    this.zeroEq();
	    break;
	case OpCode.OP_ZERO_LESS:
	    this.zeroLess();
	    break;
	case OpCode.OP_BRANCH:
	    this.branch();
	    break;
	case OpCode.OP_0BRANCH:
	    this.zeroBranch();
	    break;
	case OpCode.OP_DOT_S:
	    this.dotS();
	    break;
	case OpCode.OP_DOT:
	    this.dot();
	    break;
	case OpCode.OP_FETCH:
	    this.fetch();
	    break;
	case OpCode.OP_SP_FETCH:
	    this.sp_fetch();
	    break;
	case OpCode.OP_STORE:
	    this.store();
	    break;
	case OpCode.OP_WORDS:
	    this.words();
	    break;
	case OpCode.OP_COLON:
	    this.colon();
	    break;
	case OpCode.OP_SEMICOLON:
	    this.semicolon();
	    break;
	case OpCode.OP_PARSE:
	    this.parse();
	    break;
	case OpCode.OP_DUMP:
	    this.dump();
	    break;
	case OpCode.OP_DUMPC:
	    this.dumpc();
	    break;
	case OpCode.OP_BL:
	    this.bl();
	    break;
	case OpCode.OP_EXIT:
	    this.exit();
	    break;
	case OpCode.OP_CREATE:
	    this.create();
	    break;
	case OpCode.OP_DOES:
	    this.does();
	    break;
	case OpCode.OP_IMMEDIATE:
	    this.immediate();
	    break;
	case OpCode.OP_DODOES:
	    this.dodoes();
	    break;
	case OpCode.OP_VARIABLE:
	    this.variable();
	    break;
	case OpCode.OP_CONSTANT:
	    this.constant();
	    break;
	case OpCode.OP_ALLOT:
	    this.allot();
	    break;
	case OpCode.OP_COMMA:
	    this.comma();
	    break;
	case OpCode.OP_C_COMMA:
	    this.cComma();
	    break;
	case OpCode.OP_LBRAC:
	    this.lbrac();
	    break;
	case OpCode.OP_RBRAC:
	    this.rbrac();
	    break;
	case OpCode.OP_HERE:
	    this.here();
	    break;
	case OpCode.OP_IF:
	    this.opIf();
	    break;
	case OpCode.OP_ELSE:
	    this.opElse();
	    break;
	case OpCode.OP_THEN:
	    this.opThen();
	    break;
	case OpCode.OP_TRUE:
	    this.pushTrue();
	    break;
	case OpCode.OP_FALSE:
	    this.pushFalse();
	    break;
	default:
	    this.abort('Missing CODE: ' + prim);
	}
    }

    call() {
	this.ip += 2;
	let prim = this.memory[this.ip];
	this.exit();
	this.debug('Calling primitive: ' + OpCode.reverseLookup(prim));
	this.engine(prim);
    }

    checkForCode() {
	return this.memory[this.ip] === OpCode.OP_JMP;
    }

    uLit() {
	this.pushUint32();
    }

    lit() {
	this.pushInt32();
    }

    fLit() {
	this.pushFloat32();
    }

    dLit() {
	this.pushDouble64();
    }

    dovar() {
	this.stack.push(this.ip);
	this.exit();
    }

    dot() {
	this.systemOut.log(this.stack.pop());
    }

    dotS() {
	this.stack.print();
    }

    drop() {
	this.stack.pop();
    }

    dup() {
	this.stack.push(0);
	this.pick();
    }

    pick() {
	let num = this.stack.pop();
	if(this.stack.sp + num + 1 < this.stack.s0) {
	    this.stack.push(this.memory[this.stack.sp + num + 1])
	} else {
	    this.abort('STACK UNDERFLOW');
	}
    }

    rot() {
	let a = this.stack.pop();
	this.swap();
	this.stack.push(a);
	this.swap();
    }

    minus_rot() {
	this.rot();
	this.rot();
    }

    over() {
	this.swap();
	this.dup();
	this.minus_rot();
    }

    nip() {
	this.swap();
	this.drop();
    }

    tuck() {
	this.dup();
	this.minus_rot();
    }

    fetch() {
	let addr = this.stack.pop();
	this.stack.push(this.memory[addr]);
    }

    sp_fetch() {
	this.stack.push(this.stack.sp);
    }

    store() {
	let addr = this.stack.pop();
	let val = this.stack.pop();
	this.memory[addr] = val;
    }

    bl() {
	this.stack.push(32);
    }

    lbrac() {
	if(this.specialInterpret) {
	    this.abort('Cannot nest left brackets');
	}
	if(this.state !== -1) {
	    this.abort('Left bracket cannot be used in execute mode');
	}
	this.state = 0;
	this.specialInterpret = true;
    }

    rbrac() {
	if(this.state !== 0) {
	    this.abort('Right bracket cannot be used in compile mode');
	}
	if(!this.specialInterpret) {
	    this.abort('Cannot use right bracket without left bracket');
	}
	this.state = -1;
	this.specialInterpret = false;
    }

    parse() {
	let parseChar = String.fromCharCode(this.stack.pop());
	let str = '';
	// skip leading space after PARSE
	if(!this.inputBuffer.empty()) {
	    this.inputBuffer.pop();
	}
	let nextWord = '';
	while(!nextWord.includes(parseChar) && !this.inputBuffer.empty()) {
	    nextWord = this.inputBuffer.pop();
	    str += nextWord;
	}
	let split = str.split(parseChar);
	this.inputBuffer.rewind(split[0].length + 1);
	if(split[1] !== undefined && split[1] !== null && split[1].length !== 0) {
	    this.inputBuffer.rewind(split[1].length + 1);
	}
	this.inputBuffer.rewriteAtRp(split[0]);
	let strAddress = this.inputBuffer.rp - 1;
	this.inputBuffer.skip(split[0].length + 1)
	if(split[1] !== undefined && split[1] !== null && split[1].length !== 0) {
	    this.inputBuffer.rewriteAtRp(split[1]);
	}
	this.stack.push(strAddress);
	this.stack.push(split[0].length);
    }

    colon() {
	if(this.state === -1) {
	    this.abort('Cannot nest colon definitions');
	}
	this.sysMark = this.dp;
	this.bl();
	this.parse();
	this.state = -1;
	let name = this.readReversedCountedString(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for colon definition');
	}
	this.ip = this.dp;
	Word.newWord(this, name, 0, this.cfaXtArray[0]);
    }

    semicolon() {
	if(this.state === -1) {
	    if(this.unresolvedControlFlow()) {
		this.abort('Control flow word is unresolved');
	    }
	    Word.endBody(this);
	    this.state = 0;
	} else {
	    this.abort('Semicolon not allowed outside colon definition');
	}
    }

    immediate() {
	this.memory[Word.at(this, this.latest).immediateAddress] = 1;
    }

    number(str) {
	return String(str).trim() !== '' && Number(str).toString() !== 'NaN';
    }

    doNumber(str) {
	if(this.state === 0) {
	    if(str.startsWith('0x') || str.startsWith('-0x')) {
		this.stack.push(Number(str));
	    } else if(str.includes('e')) {
		this.fstack.push(Number(str));
	    } else if(str.includes('.')) {
		this.systemOut.log('Not implemented yet')
	    } else {
		this.stack.push(Number(str));
	    }
	} else {
	    if(str.startsWith('0x') || str.startsWith('-0x')) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "LIT"), this.dp));
		this.offsetDp(-this.dp + this.writeInt32(Number(str), this.dp));
	    } else if(str.includes('e')) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "FLIT"), this.dp));
		this.offsetDp(-this.dp + this.writeFloat32(Number(str), this.dp));
	    } else if(str.includes('.')) {
		this.systemOut.log('Not implemented yet')
	    } else {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "LIT"), this.dp));
		this.offsetDp(-this.dp + this.writeInt32(Number(str), this.dp));
	    }
	}
    }

    splitAndFilter(str) {
	let blankFn = function(word) { return word !== '' && word !== '\n' && word !== undefined && word !== null; };
	return String(str).trim().split(' ').filter(blankFn);
    }

    processInputBuffer() {
	while(!this.inputBuffer.empty()) {
	    let str = this.inputBuffer.pop();
	    while(str === ' ') {
		str = this.inputBuffer.pop();
	    }
	    this.debug('input is: ' + str);
	    this.debug(str);
	    let word = this.find(str);
	    if(word !== 0) {
		if (this.state === 0 || word.immediate === 1) {
		    let top = this.ip;
		    this.rPush(top);
		    this.debug('Rpushed: ' + this.rstack.empty(this.debugFn(this.rstack.print, this.rstack)));
		    
		    this.jmp(word.cfa);
		    this.debug('word.cfa: ' + word.cfa);
		    this.docol();
		    /*
		    if(this.state === -1 && word.immediate === 1) {
			let tmpStack = this.stack.toJSArray();
			let tmpRstack = this.rstack.toJSArray();
			tmpRstack.pop();
			this.docol();
			let afterStack = this.stack.toJSArray();
			let afterRstack = this.rstack.toJSArray();
			if(tmpStack.length !== afterStack.length || tmpRstack.length !== afterRstack.length) {
			    this.abort('Stack modified during definition');
			}
			for(const i in tmpStack) {
			    if(tmpStack[i] !== afterStack[i]) {
				this.abort('Stack modified during definition');
			    }
			}
			for(const i in tmpRstack) {
			    if(tmpRstack[i] !== afterRstack[i]) {
				this.abort('Return stack modified during definition');
			    }
			}
		    } else {
			this.docol();
		    } */
		    if(this.ip === top && !this.rstack.empty()) {
			this.exit();
		    }

		} else {
		    if(word.name !== ':') {
			this.offsetDp(-this.dp + this.writeUint32(word.cfa, this.dp));
		    } else {
			this.abort('Cannot compile ' + word.name + ' to a definition');
		    }
		}
	    } else if (this.number(str)) {
		this.doNumber(str)
	    } else {
		this.abort(str + ' ?');
	    }
	}
    }

    interpret(str) {
	let split = this.splitAndFilter(str);
	this.debug('this is the split:' + split);
	for(var i = 0; i < split.length; i++) {
	    this.inputBuffer.push(split[i]);
	    if(i+1 !== split.length) {
		this.inputBuffer.push(' ');
	    }
	}
	this.process();
    }

    isCFA(addr) {
	for(const i of this.cfaXtArray) {
	    this.debugFinest('cfa: ' + i);
	    this.debugFinest('addr: ' + this.memory[addr]);
	    if(this.memory[addr] === i) {
		return true;
	    }
	}
	return false;
    }

    docol() {
	do {
	    let dest = this.memory[this.ip];
	    this.debug('Jump destination: ' + dest);
	    // When we jump back, we want the next space
	    let isCode = this.checkForCode();
	    if(!isCode && dest !== 0) {
		if(this.isCFA(this.ip)) {
		    this.debug('skipping cfa2: ' + (this.ip + 1))
		    this.ip += 2;
		} else {
		    this.ip++;
		}
		this.rPush(this.ip);
		this.jmp(dest);
	    } else if(isCode) {
		this.call();
	    } else {
		//noop or empty codeword2:
		this.ip++;
		return;
	    }
	} while(!this.rstack.empty());
    }

    docon() {
	this.stack.push(this.memory[this.ip]);
	this.exit();
    }
	
    exit() {
	this.ip = this.rstack.pop();
	this.debug('Exiting to: ' + this.ip);
	this.debug('Return Stack: ' + this.rstack.empty(this.debugFn(this.rstack.print, this.rstack)));
	return;
    }

    toR() {
	this.rstack.push(this.stack.pop());
    }

    Rto() {
	this.stack.push(this.rstack.pop());
    }

    plus() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	this.stack.push(a+b);
    }

    minus() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	this.stack.push(a-b);
    }

    star() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	this.stack.push(a*b);
    }

    slash() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	this.stack.push(Math.floor(a/b));
    }

    mod() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	this.stack.push(a%b);
    }

    zeroEq() {
	if(this.stack.pop() === 0) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}
    }

    zeroBranch() {
	this.debugFinest('executing 0branch');
	let brVal = this.stack.pop();
	this.pushUint32();
	if(brVal === 0) {
	    this.ip = this.stack.pop();
	} else {
	    this.drop();
	}
    }

    branch() {
	this.pushUint32();
	this.ip = this.stack.pop();
    }

    postpone() {
	this.bl();
	this.parse();
	let name = this.readReversedCountedString(null, true, true, true)[1];
	this.writeUint32(Word.findXt(this, name), this.dp);
    }

    unresolvedControlFlow() {
	return this.controlFlowUnresolved <= -1;
    }

    opIf() {
	if(this.state === -1) {
	    this.debugFinest('Entering IF')
	    this.debugFinest('Writing 0Branch at ' + this.dp);
	    this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "0BRANCH"), this.dp));
	    this.debugFinest('Writing addr at ' + this.dp);
	    let orig = this.dp;
	    this.offsetDp(-this.dp + this.writeUint32(0, this.dp));
	    this.cfstack.push(orig);
	    this.controlFlowUnresolved -= 1;
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    opElse() {
	if(this.state === -1) {
	    if(this.unresolvedControlFlow()) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "BRANCH"), this.dp));
		let orig2 = this.dp;
		this.offsetDp(-this.dp + this.writeUint32(0, this.dp));
		this.memory[this.cfstack.pop()] = this.dp;
		this.cfstack.push(orig2);
	    } else {
		this.abort('Cannot use else without matching if');
	    }
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    opThen() {
	if(this.state === -1) {
	    if(this.unresolvedControlFlow()) {
		this.memory[this.cfstack.pop()] = this.dp;
		this.controlFlowUnresolved++;
	    } else {
		this.abort('Cannot use then without matching if');
	    }
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    process() {
	    try {
		if(!this.rstack.empty()) {
		    this.docol();
		} else if (!this.inputBuffer.empty()) {
		    this.processInputBuffer();
		}
		this.systemOut.log('ok');
	    } catch (e) {
		this.systemOut.log('Error: ' + e);
		this.systemOut.log(e.stack);
	    }
	    
    }
};


