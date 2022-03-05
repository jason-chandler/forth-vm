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
    static OP_DO_NLIT = 2;
    static OP_DO_ULIT = 3;
    static OP_DO_FLIT = 4;
    static OP_DO_DLIT = 5;
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
    static OP_BRANCH_QUESTION = 45;
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
    vm;
    name;
    address;
    link;

    constructor(vm, name, address) {
	this.vm = vm;
	this.name = name;
	this.address = address;
    }

    writeName() {
	this.vm.writeCountedString(this.name);
    }

    makeLink() {
	this.link = this.vm.latest
	this.vm.writeUint32(this.link);
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
	word.headAddress = word.vm.ip;
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
	word.immediateAddress = linkLoc + 1;
	word.vm.debug('immediate Addr ' + word.immediateAddress);
	word.immediate = word.vm.memory[word.immediateAddress];
	word.vm.debug('immediate ' + word.immediate);
	word.cfa = word.immediateAddress + 1;
	word.cfa2 = word.cfa + 1;
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
	    while((word.vm.memory[pp] !== Word.findXt(word.vm, 'EXIT')) && word.vm.memory[pp] !== undefined) {
		word.parameterField.push(word.vm.memory[pp]);
		pp++;
	    }
	}
	word.vm.debug('word.parameterField = ' + word.parameterField);
	return word;
    }

    writeBody() {
	this.immediateAddr = this.vm.ip;
	this.vm.writeUint32(this.immediate);
	this.cfa = this.vm.ip;
	if(this.codeWord === OpCode.OP_JMP) { // code, not high level Forth
	    this.vm.writeUint32(OpCode.OP_JMP);
	    this.vm.writeUint32(this.codeWord2);
	    this.vm.writeUint32(this.parameterField);
	} else {
	    this.vm.writeUint32(Word.findXt('EXIT')); // end with exit
	}
	// keep it hidden until word is defined
	this.vm.latest = this.headAddress;
	this.vm.here = this.vm.ip;
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
	    if(tempName.toLocaleUpperCase() === name.toLocaleUpperCase()) {
		return tempAddr;
	    } else {
		tempAddr = tempLink;
	    }
	}
	return tempAddr;
    }

    static findWord(vm, name) {
	let addr = Word.find(vm, name.toLocaleUpperCase());
	if (addr === 0) {
	    return 0;
	} else {
	    return Word.fromDict(vm, name.toLocaleUpperCase(), addr);
	}
    }

    static findXt(vm, name) {
	let wordOrZero = Word.findWord(vm, name.toLocaleUpperCase());
	if(wordOrZero !== 0) {
	    return wordOrZero.cfa;;
	} else {
	    vm.abort(name.toLocaleUpperCase() + " ?");
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
	while(this.sp !== (this.s0 + 1)) {
	    this.vm.memory[this.sp] = 0;
	    this.sp++;
	}
    }
}

class InputQueue {
    vm;
    i0;
    tos;
    ip;
    to_in;
    rp;

    constructor(vm, address) {
	this.vm = vm;
	// byte-aligned
	this.i0 = this.vm.getByteAddress(address);
	this.ip = this.i0 - 1;
	this.tos = this.ip;
	this.rp = this.ip;
	this.to_in = 0;
    }

    empty() {
	return this.ip === this.i0 - 1 && this.tos === this.ip;
    }

    clear() {
	this.tos = this.i0 - 1;
	this.rp = this.i0 - 1;
	this.to_in = 0;
	while(this.ip !== this.i0 - 1) {
	    this.vm.writeByte(0, this.ip);
	    this.ip++;
	}
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
		this.rp--
		this.to_in++;
	    }
	    if(this.rp === this.ip) {
		this.clear();
	    }
	    return str;
	} else {
	    this.vm.systemOut.log('INPUT BUFFER UNDERFLOW');
	}
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
    inputBuffer;
    eax;
    memory_size;
    memory;
    cell_size;
    ip;
    here;
    latest;
    source_id;
    systemOut;
    state;
    pad;
    debugMode;
    

    constructor() {
	this.cell_size = 4; // in order to get a Uint32, new Uint32Array(memory.buffer, byteOffset, length_in_uint32s)
	this.memory_size = 65536;
	this.memory = new Uint32Array(this.memory_size);
	this.byteView = new Uint8Array(this.memory.buffer);
	this.stack = new Stack(this, this.memory_size - 603, this.cell_size);
	this.rstack = new Stack(this, this.memory_size - 402, this.cell_size);
	this.fstack = new Stack(this, this.memory_size - 201, this.cell_size);
	this.jstack = [];
	this.inputBuffer = new InputQueue(this, this.memory_size - 804);
	this.ip = 2; // program counter, current interp address
	this.here = 2;
	this.eax; // register for current value
	this.latest = 0;
	this.source_id = -1; // -1 for string eval, 0 for file
	this.systemOut = console; // in case i change output area later;
	this.addPrimitives();
	this.state = 0; // interpret mode
	this.refreshPad();
	this.debugMode = 0;
    }

    debug(...input) {
	if(this.debugMode === -1) {
	    this.systemOut.log(input);
	}
    }

    writeByte(b, offset) {
	this.byteView[offset] = b;
	this.debug('writing ' + b + ' @ ' + offset)
    }

    align(offset, write) {
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
	return this.align(offset, true);
    }

    readAlign(offset) {
	return this.align(offset, false);
    }

    getByteAddress(addr) {
	return addr * this.cell_size;
    }

    find(name) {
	return Word.findWord(this, name);
    }

    tick() {
	let name = this.parse();
	this.push(Word.findXt(this, name));
    }

    // Write a counted string and then align to cell size
    writeCountedString(name, addr) {
	if (addr === undefined) { addr = this.ip };
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
	this.ip = this.writeAlign(tempIp);
	this.debug('aligned address after write is ' + this.ip)
	this.debug('it contains ' + this.memory[this.ip]);
    }

    readCountedString(addr) {
	if ( addr === undefined) { addr = this.ip };
	let byteAddress = this.getByteAddress(addr);
	// Max length is 255
	let len = this.byteView[byteAddress];
	byteAddress++;
	let str = '';
	for(var i = 0; i < len; i++) {
	    str += String.fromCharCode(this.byteView[byteAddress]);
	    byteAddress++
	}
	return [len, str, this.readAlign(byteAddress)]; // 
    }

    writeUint32(u) {
	this.memory[this.ip] = u;
	this.ip++;
    }

    clearStacks() {
	this.rstack.clear();
	this.stack.clear();
	this.fstack.clear();
	this.inputBuffer.clear();
	this.jstack = [];
    }
    

    defcode(name, immediate, opcode) {
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
	this.defcode('DOLIT', 0, OpCode.OP_DOLIT);
	this.defcode('DOFLIT', 0, OpCode.OP_DOFLIT);
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
	this.defcode('IMMEDIATE', 1, OpCode.OP_IMMEDIATE);
	this.defcode('[', 0, OpCode.OP_LBRAC);
	this.defcode(']', 1, OpCode.OP_RBRAC);
	this.defcode('!', 0, OpCode.OP_STORE);
	this.defcode('@', 0, OpCode.OP_FETCH);
	this.defcode('SP@', 0, OpCode.OP_SP_FETCH);
	this.defcode('BRANCH', 0, OpCode.OP_BRANCH);
	this.defcode('BRANCH?', 0, OpCode.OP_BRANCH_QUESTION);
    }

    offsetIp(numCells) {
	this.ip += numCells;
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
	this.pad = this.ip + 200;
    }

    //inline param
    pushFloat32() {
	this.offsetIp(1);
	this.push(new Float32Array(this.memory.buffer, this.ip * 4, 1)[0]);
	this.offsetIp(1)
    }
    
    //inline param
    pushDouble64()  {
	this.offsetIp(1);
	this.push(new Float64Array(this.memory.buffer, this.ip * 4, 1)[0]);
	this.offsetIp(2);
    }

    pushInt32()  {
	this.offsetIp(1);
	this.push(new Int32Array(this.memory.buffer, this.ip * 4, 1)[0]);
	this.offsetIp(1);
    }


    pushUint32() {
	this.offsetIp(1);
	this.push(this.memory[this.ip]);
	this.offsetIp(1);
    }

    pushFalse() {
	this.push(0);
    }

    pushTrue() {
	this.push(-1);
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
	    tempBuff.push(this.byteView[startingAddr + i]);
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

    abort(msg) {
	if(msg === undefined || msg === null) {
	    msg = 'Abort called at ' + this.ip;
	}
	this.quit();
	throw(msg);
    }

    rPush(reg) {
	this.rstack.push(reg);
    }

    rPop() {
	if(this.rstack.length !== 0) {
	    return this.rstack.pop();
	} else {
	    this.systemOut.log("RSTACK UNDERFLOW");
	    this.abort();
	}
    }

    push(reg) {
	this.stack.push(reg);
    }

    pop() {
	if(this.stack.length !== 0) {
	    return this.stack.pop();
	} else {
	    this.systemOut.log("STACK UNDERFLOW");
	    this.abort();
	}
    }

    jmp(dest) {
	this.ip = dest;
    }

    doPrimitive(prim) {
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

	case OpCode.OP_DO_ULIT:
	    this.doULit();
	    break;
	case OpCode.OP_DO_LIT:
	    this.doLit();
	    break;
	case OpCode.OP_DO_FLIT:
	    this.doFLit()
	    break;
	case OpCode.OP_DO_DLIT:
	    this.doDLit();
	    break;
	case OpCode.OP_TO_R:
	    this.rPush();
	    break;
	case OpCode.OP_R_TO:
	    this.rPop();
	    break;
	case OpCode.OP_PUSH:
	    this.push();
	    break;
	case OpCode.OP_POP:
	    this.pop();
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
	case OpCode.OP_BRANCH_QUESTION:
	    this.branchQuestion();
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
	}
    }

    call() {
	this.ip += 2;
	let prim = this.memory[this.ip];
	this.exit();
	this.debug('Calling primitive: ' + prim);
	this.doPrimitive(prim);
    }

    checkForCode() {
	return this.memory[this.ip] === OpCode.OP_JMP;
    }

    doULit() {
	this.pushUint32();
    }

    doLit() {
	this.pushInt32();
    }

    doFLit() {
	this.pushFloat32();
    }

    doDLit() {
	this.pushDouble64();
    }

    doVar() {
	this.stack.push(this.ip + 1);
	this.exit();
    }

    dot() {
	this.systemOut.log(this.stack.pop());
    }

    dotS() {
	let buf = [];
	let count = 0;
	for(var i = this.stack.s0 - 1; i !== this.stack.sp; i--) {
	    buf.push(this.memory[i]);
	    count++;
	}
	this.systemOut.log('<' + count + '> ' + buf);
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
	let val = this.stack.pop();
	let addr = this.stack.pop();
	this.memory[addr] = val;
    }

    number(str) {
	return str.trim() !== '' && Number(str).toString() !== 'NaN';
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
		this.writeUint32(Word.findXt(this, "DOLIT"));
		this.writeInt32(Number(str));
	    } else if(str.includes('e')) {
		this.writeUint32(Word.findXt(this, "DOFLIT"));
		this.writeFloat32(Number(str));
	    } else if(str.includes('.')) {
		this.systemOut.log('Not implemented yet')
	    } else {
		this.writeUint32(Word.findXt(this, "DOLIT"));
		this.writeInt32(Number(str));
	    }
	}
    }

    splitAndFilter(str) {
	let blankFn = function(word) { return word !== '' && word !== '\n'; };
	return str.trim().split(' ').filter(blankFn);
    }

    processInputBuffer() {
	while(!this.inputBuffer.empty()) {
	    let str = this.inputBuffer.pop();
	    let word = this.find(str);
	    if(word !== 0) {
		this.rPush(this.ip);
		this.jmp(word.cfa);
		this.debug('word.cfa: ' + word.cfa);
		while(!this.rstack.empty()) {
		    this.docol();
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
	}
	this.engine();
    }

    docol() {
	let dest = this.memory[this.ip];
	// When we jump back, we want the next space
	let isCode = this.checkForCode();
	if(!isCode && dest !== 0) {
	    this.ip++;
	    this.rPush(this.ip);
	    this.jmp(dest);
	} else if(isCode) {
	    this.call();
	} else {
	    //noop or empty codeword2:
	    this.ip++;
	    return;
	}
    }

    docon() {
	// should be pointing to cfa2
	this.stack.push(this.memory[this.ip + 1]);
    }
	
    exit() {
	this.ip = this.rPop();
	return;
    }

    toR() {
	this.rPush(this.pop());
    }

    Rto() {
	this.push(this.rPop());
    }

    plus() {
	let b = this.pop();
	let a = this.pop();
	this.push(a+b);
    }

    minus() {
	let b = this.pop();
	let a = this.pop();
	this.push(a-b);
    }

    star() {
	let b = this.pop();
	let a = this.pop();
	this.push(a*b);
    }

    slash() {
	let b = this.pop();
	let a = this.pop();
	this.push(Math.floor(a/b));
    }

    mod() {
	let b = this.pop();
	let a = this.pop();
	this.push(a%b);
    }	


    engine() {
	    try {
		if(!this.rstack.empty()) {
		    this.docol();
		} else if (!this.inputBuffer.empty()) {
		    this.processInputBuffer();
		}
		this.systemOut.log('ok');
	    } catch (e) {
		this.systemOut.log('Error: ' + e);
	    }
	    
    }
};


