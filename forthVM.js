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
    static OP_INVERT = 66;
    static OP_RUN_LOOP = 67;
    static OP_LOOP = 68;
    static OP_RUN_DO = 69;
    static OP_DO = 70;
    static OP_LEAVE = 71;
    static OP_RUN_PLUS_LOOP = 72;
    static OP_PLUS_LOOP = 73;
    static OP_I = 74;
    static OP_J = 75;
    static OP_RUN_LEAVE = 76;
    static OP_BEGIN = 77;
    static OP_UNTIL = 78;
    static OP_WHILE = 79;
    static OP_REPEAT = 80;
    static OP_GREATER = 81;
    static OP_LESS = 82;
    static OP_GREATER_EQ = 83;
    static OP_LESS_EQ = 84;
    static OP_INCLUDE = 85;
    static OP_S_QUOTE = 86;
    static OP_BACK_SLASH = 87;
    static OP_BASE = 88;
    static OP_DECIMAL = 89;
    static OP_HEX = 90;
    static OP_ABORT = 91;
    static OP_ABORT_QUOTE = 92;
    static OP_CELLS = 93;
    static OP_CELL_PLUS = 94;
    static OP_TICK = 95;
    static OP_EXECUTE = 96;
    static OP_ENVIRONMENT_Q = 97;
    static OP_BRACKET_IF = 98;
    static OP_BRACKET_ELSE = 99;
    static OP_LPAREN = 100;
    static OP_F_FETCH = 101;
    static OP_F_STORE = 102;
    static OP_DOVAL = 103;
    static OP_DOFVAL = 104;
    static OP_F_VALUE = 105;
    static OP_VALUE = 106;
    static OP_TO = 107;
    static OP_F_TILDE = 108;
    static OP_F_NEGATE = 109;
    static OP_F_OVER = 110;
    static OP_F_DUP = 111;
    static OP_F_SWAP = 112;
    static OP_F_DROP = 113;
    static OP_FLOATS = 114;
    static OP_F_DEPTH = 115;
    static OP_NE = 116;
    static OP_ZERO_EQ = 117;
    static OP_ONE_PLUS = 118;
    static OP_ONE_MINUS = 119;
    static OP_OR = 120;
    static OP_AND = 121;
    static OP_XOR = 122;
    static OP_PLUS_STORE = 123;
    static OP_DEPTH = 124;
    static OP_TYPE = 125;
    static OP_SOURCE = 126;
    static OP_CR = 127;
    static OP_TO_IN = 128;

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
	case OpCode.OP_INVERT:
	    return 'OP_INVERT';
	    break;
	case OpCode.OP_RUN_LOOP:
	    return 'OP_RUN_LOOP';
	    break;
	case OpCode.OP_LOOP:
	    return 'OP_LOOP';
	    break;
	case OpCode.OP_RUN_DO:
	    return 'OP_RUN_DO';
	    break;
	case OpCode.OP_DO:
	    return 'OP_DO';
	    break;
	case OpCode.OP_LEAVE:
	    return 'OP_LEAVE';
	    break;
	case OpCode.OP_RUN_PLUS_LOOP:
	    return 'OP_RUN_PLUS_LOOP';
	    break;
	case OpCode.OP_PLUS_LOOP:
	    return 'OP_PLUS_LOOP';
	    break;
	case OpCode.OP_I:
	    return 'OP_I';
	    break;
	case OpCode.OP_J:
	    return 'OP_J';
	    break;
	case OpCode.OP_RUN_LEAVE:
	    return 'OP_RUN_LEAVE';
	    break;
	case OpCode.OP_BEGIN:
	    return 'OP_BEGIN';
	    break;
	case OpCode.OP_UNTIL:
	    return 'OP_UNTIL';
	    break;
	case OpCode.OP_WHILE:
	    return 'OP_WHILE';
	    break;
	case OpCode.OP_REPEAT:
	    return 'OP_REPEAT';
	    break;
	case OpCode.OP_INCLUDE:
	    return 'OP_INCLUDE';
	    break;
	case OpCode.OP_S_QUOTE:
	    return 'OP_S_QUOTE';
	    break;
	case OpCode.OP_BACKSLASH:
	    return 'OP_BACKSLASH';
	    break;
	case OpCode.OP_BASE:
	    return 'OP_BASE';
	    break;
	case OpCode.OP_ABORT:
	    return 'OP_ABORT';
	    break;
	case OpCode.OP_ABORT_QUOTE:
	    return 'OP_ABORT_QUOTE';
	    break;
	case OpCode.OP_HEX:
	    return 'OP_HEX';
	    break;
	case OpCode.OP_DECIMAL:
	    return 'OP_DECIMAL';
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
	this.cfa2 = this.cfa + 1;
	this.pfa = this.cfa2 + 1;
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
    signedMemory;
    s0; // below bottom of stack
    sp; // stack pointer
    cell_size;
    control_indices;

    constructor(vm, s0, cell_size) {
	this.vm = vm;
	this.memory = vm.memory;
	this.signedMemory = vm.signedMemory;
	this.s0 = s0;
	this.sp = this.s0 - 1; 
	this.cell_size = cell_size;
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
    rotation;
    length;

    constructor(vm, address) {
	this.vm = vm;
	// byte-aligned
	this.i0 = this.vm.getByteAddress(address);
	this.ip = this.i0 - 1;
	this.tos = this.ip;
	this.to_in = this.i0 + 4;
	this.rotation = 0;
	this.length = 0;
    }

    rp() {
	return this.i0 - 1 - this.vm.memory[this.to_in / this.vm.cell_size];
    }

    empty() {
	return this.rp() === this.ip;
    }

    updateLength() {
	this.length = this.rp() - this.ip;
    }

    clear() {
	this.vm.debugFinest('clearing inputBuffer');
	this.tos = this.i0 - 1;
	this.ip = this.i0 - 1;
	this.vm.memory[this.to_in / this.vm.cell_size] = 0;
	this.rotation = 0;
	this.length = 0;
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
	this.updateLength();
    }

    pop() {
	// Max length is 255
	if(!this.empty()) {
	    let len = this.vm.byteView[this.rp()];
	    this.vm.memory[this.to_in / this.vm.cell_size] += 1;
	    let str = '';
	    for(var i = 0; i < len; i++) {
		str += String.fromCharCode(this.vm.byteView[this.rp()]);
		this.vm.memory[this.to_in / this.vm.cell_size] += 1;
	    }
	    this.updateLength();
	    if(this.rp() === this.ip) {
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
	if(this.rp() + len >= this.i0) {
	    this.vm.abort("INPUT BUFFER UNDERFLOW");
	}
	this.vm.memory[this.to_in / this.vm.cell_size] -= len;
	this.updateLength();
    }

    skip(len) {
	if(this.rp() - len < this.ip) {
	    this.vm.abort("INPUT BUFFER OVERFLOW");
	}
	this.vm.memory[this.to_in / this.vm.cell_size] += len;
	this.updateLength();
    }

    rewriteAtRp(name) {
	let saveIp = this.ip;
	let saveTos = this.tos;
	this.ip = this.rp();
	this.push(name);
	this.ip = saveIp;
	this.tos = saveTos;
	this.updateLength();
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
    signedMemory;
    cell_size;
    ip;
    dp;
    latest;
    source_id;
    systemOut;
    state;
    pad;
    stringPad;
    debugMode;
    userMark;
    sysMark;
    wordUnderConstruction;
    exitXt;
    cfaXtArray;
    controlFlowUnresolved;
    baseAddress;
    environment;

    constructor() {
	this.cell_size = 4; // in order to get a Uint32, new Uint32Array(memory.buffer, byteOffset, length_in_uint32s)
	this.memory_size = 65536;
	this.memory = new Uint32Array(this.memory_size);
	this.signedMemory = new Int32Array(this.memory.buffer);
	this.byteView = new Uint8Array(this.memory.buffer);
	this.stack = new Stack(this, this.memory_size - 603, this.cell_size);
	this.rstack = new Stack(this, this.memory_size - 402, this.cell_size);
	this.fstack = new Stack(this, this.memory_size - 201, this.cell_size);
	this.cfstack = new Stack(this, this.memory_size - 804, this.cell_size);
	this.jstack = [];
	this.inputBuffer = new InputQueue(this, this.memory_size - 1005);
	this.ip = 3; // program counter, current interp address
	this.dp = 3;
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
	this.string0 = (this.memory_size - 1406) * this.cell_size;
	this.stringCap = (this.memory_size + 255) * this.cell_size;
	this.stringPointer = this.string0;
	this.baseAddress = 2 * this.cell_size;
	this.byteView[this.baseAddress] = 10;
	this.environment = { 'FLOATING': -1, 'FLOATING-STACK': -1, '/COUNTED-STRING': 255, '/HOLD': 255, 'ADDRESS-UNIT=BITS': 32, 'FLOORED': -1, 'RETURN-STACK-CELLS': 200, 'STACK-CELLS': 200 };
    }


    findCfaWords() {
	let arr = [];
	for(const i of ['DOCOL','DOCON','DOVAR', 'DODOES', 'DOVAL', 'DOFVAL']) {
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
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
	this.stack.push(Word.findXt(this, name));
    }

    here() {
	this.stack.push(this.cdp);
    }

    execute() {
	this.rPush(this.ip);
	this.jmp(this.stack.pop());
	this.docol();
    }

    create() {
	this.bl();
	this.parse();
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
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
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for variable definition');
	}
	Word.newWord(this, name, 0, this.cfaXtArray[2], 0);
	Word.unhideLatest(this);
    }

    value() {
	this.bl();
	this.parse();
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for value definition');
	}
	Word.newWord(this, name, 0, this.cfaXtArray[4], this.stack.pop());
	Word.unhideLatest(this);
    }

    fvalue() {
	this.bl();
	this.parse();
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for fvalue definition');
	}
	let word = Word.newWord(this, name, 0, this.cfaXtArray[5], 0);
	new Float32Array(this.memory.buffer, word.pfa * 4, 1)[0] = this.fstack.pop();
	Word.unhideLatest(this);
    }

    source() {
	this.stack.push(this.source_id);
    }

    toIn() {
	this.stack.push(this.inputBuffer.to_in);
    }

    to() {
	this.bl();
	this.parse();
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for fvalue definition');
	}
	let val = this.find(name);
	if(this.memory[val.cfa] === this.cfaXtArray[4]) {
	    this.memory[val.pfa] = this.stack.pop();
	} else if(this.memory[val.cfa] === this.cfaXtArray[5]) {
	    new Float32Array(this.memory.buffer, val.pfa * 4, 1)[0] = this.fstack.pop();
	} else {
	    this.abort("Cannot use TO with a non-value");
	}
    }

    constant() {
	this.bl();
	this.parse();
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
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

    cells() {
	this.stack.push(this.stack.pop() * this.cell_size);
    }

    cellPlus() {
	this.stack.push(this.stack.pop() + this.cell_size);
    }

    base() {
	this.stack.push(this.baseAddress);
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
    writeCountedString(name, addr, charAligned, noCount) {
	let isIp;
	if (addr === undefined) { addr = this.ip; isIp = true; };
	let tempIp;
	if(charAligned) {
	    tempIp = addr;
	} else {
	    tempIp = this.getByteAddress(addr);
	}
	let truncLength = Math.min(name.length, 255);
	if(noCount !== true) {
	    this.writeByte(truncLength, tempIp);
	    tempIp++;
	}
	for(var i = 0; i < truncLength; i++) {
	    this.writeByte(name.charCodeAt(i), tempIp);
	    tempIp++;
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
	    byteAddress++;
	}
	return [len, str, this.readAlign(byteAddress)]; // 
    }

    readStringBasedOnSource(addr, isByteAddress, isLengthOnStack, isAddrOnStack) {
	if(this.source_id === 0 || this.source_id === -1) {
	    // input buffer grows downwards
	    return this.readReversedCountedString(addr, isByteAddress, isLengthOnStack, isAddrOnStack);
	} else {
	    return this.readCountedString(addr, isByteAddress, isLengthOnStack, isAddrOnStack);
	}
    }

    readStringFromStack() {
	return this.readStringBasedOnSource(null, true, true, true)[1];
    }

    inputBufferEmpty() {
	let inputBuffer;
	if(this.source_id === 0 || this.source_id === -1) {
	    // input buffer grows downwards
	    return this.inputBuffer.length === 0;
	} else {
	    return this.source_id.length === 0;
	}
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

    writeFloat32(i, addr) {
	if(addr === undefined || addr === null) {
	    new Float32Array(this.memory.buffer, this.ip * 4, 1)[0] = i;
	    this.ip++;
	} else {
	    new Float32Array(this.memory.buffer, addr * 4, 1)[0] = i;
	    return addr + 1;
	}
    }


    clearStacks() {
	this.rstack.clear();
	this.stack.clear();
	this.fstack.clear();
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
	this.defcode('<>', 0, OpCode.OP_NE);
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
	this.defcode('INVERT', 0, OpCode.OP_INVERT);
	this.defcode('(LOOP)', 0, OpCode.OP_RUN_LOOP);
	this.defcode('LOOP', 1, OpCode.OP_LOOP);
	this.defcode('(DO)', 0, OpCode.OP_RUN_DO);
	this.defcode('DO', 1, OpCode.OP_DO);
	this.defcode('LEAVE', 1, OpCode.OP_LEAVE);
	this.defcode('(+LOOP)', 0, OpCode.OP_RUN_PLUS_LOOP);
	this.defcode('+LOOP', 1, OpCode.OP_PLUS_LOOP);
	this.defcode('I', 0, OpCode.OP_I);
	this.defcode('J', 0, OpCode.OP_J);
	this.defcode('(LEAVE)', 0, OpCode.OP_RUN_LEAVE);
	this.defcode('BEGIN', 1, OpCode.OP_BEGIN);
	this.defcode('UNTIL', 1, OpCode.OP_UNTIL);
	this.defcode('WHILE', 1, OpCode.OP_WHILE);
	this.defcode('REPEAT', 1, OpCode.OP_REPEAT);
	this.defcode('>', 0, OpCode.OP_GREATER);
	this.defcode('>=', 0, OpCode.OP_GREATER_EQ);
	this.defcode('<=', 0, OpCode.OP_LESS_EQ);
	this.defcode('<', 0, OpCode.OP_LESS);
	this.defcode('INCLUDE', 0, OpCode.OP_INCLUDE);
	this.defcode('S"', 1, OpCode.OP_S_QUOTE);
	this.defcode('\\', 1, OpCode.OP_BACK_SLASH);
	this.defcode('\n\\', 1, OpCode.OP_BACK_SLASH);
	this.defcode('BASE', 0, OpCode.OP_BASE);
	this.defcode('DECIMAL', 0, OpCode.OP_DECIMAL);
	this.defcode('HEX', 0, OpCode.OP_HEX);
	this.defcode('\n', 0, OpCode.OP_NOOP);
	this.defcode('ABORT', 0, OpCode.OP_ABORT);
	this.defcode('ABORT"', 0, OpCode.OP_ABORT_QUOTE);
	this.defcode('CELLS', 0, OpCode.OP_CELLS);
	this.defcode('CELL+', 0, OpCode.OP_CELL_PLUS);
	this.defcode('\'', 0, OpCode.OP_TICK);
	this.defcode('[\']', 1, OpCode.OP_TICK);
	this.defcode('EXECUTE', 0, OpCode.OP_EXECUTE);
	this.defcode('ENVIRONMENT?', 0, OpCode.OP_ENVIRONMENT_Q);
	this.defcode('[IF]', 1, OpCode.OP_BRACKET_IF);
	this.defcode('[ELSE]', 1, OpCode.OP_BRACKET_ELSE);
	this.defcode('[THEN]', 1, OpCode.OP_NOOP);
	this.defcode('(', 1, OpCode.OP_LPAREN);
	this.defcode('FVARIABLE', 0, OpCode.OP_VARIABLE);
	this.defcode('F!', 0, OpCode.OP_F_STORE);
	this.defcode('F@', 0, OpCode.OP_F_FETCH);
	this.defcode('DOVAL', 0, OpCode.OP_DOVAL);
	this.defcode('DOFVAL', 0, OpCode.OP_DOFVAL);
	this.defcode('VALUE', 0, OpCode.OP_VALUE);
	this.defcode('FVALUE', 0, OpCode.OP_F_VALUE);
	this.defcode('TO', 0, OpCode.OP_TO);
	this.defcode('F~', 0, OpCode.OP_F_TILDE);
	this.defcode('FNEGATE', 0, OpCode.OP_F_NEGATE);
	this.defcode('FOVER', 0, OpCode.OP_F_OVER);
	this.defcode('FDUP', 0, OpCode.OP_F_DUP);
	this.defcode('FSWAP', 0, OpCode.OP_F_SWAP);
	this.defcode('FDROP', 0, OpCode.OP_F_DROP);
	this.defcode('FLOATS', 0, OpCode.OP_FLOATS);
	this.defcode('FDEPTH', 0, OpCode.OP_F_DEPTH);
	this.defcode('0=', 0, OpCode.OP_ZERO_EQ);
	this.defcode('1+', 0, OpCode.OP_ONE_PLUS);
	this.defcode('1-', 0, OpCode.OP_ONE_MINUS);
	this.defcode('OR', 0, OpCode.OP_OR);
	this.defcode('AND', 0, OpCode.OP_AND);
	this.defcode('XOR', 0, OpCode.OP_XOR);
	this.defcode('+!', 0, OpCode.OP_PLUS_STORE);
	this.defcode('DEPTH', 0, OpCode.OP_DEPTH);
	this.defcode('TYPE', 0, OpCode.OP_TYPE);
	this.defcode('SOURCE', 0, OpCode.OP_SOURCE);
	this.defcode('CR', 0, OpCode.OP_CR);
	this.defcode('>IN', 0, OpCode.OP_TO_IN);
    }

    bracketIf() {
	let currentName;
	let nestCount = 0;
	if(this.stack.pop() === 0) {
	    while((currentName !== '[ELSE]' && currentName !== '[THEN]') || nestCount >= 0) {
		if(this.inputBufferEmpty()) {
		    this.abort('COULD NOT FIND [IF] OR [ELSE] IN BUFFER');
		}
		this.parseName();
		currentName = this.readStringFromStack();
		if(currentName === '[IF]') {
		    nestCount++;
		} else if(currentName === '[THEN]') {
		    nestCount--;
		}
	    }
	}
    }

    bracketElse() {
	let currentName;
	let nestCount = 0;
	while(currentName !== '[THEN]' || nestCount >= 0) {
	    if(this.inputBufferEmpty()) {
		this.abort('COULD NOT FIND [THEN] IN BUFFER');
	    }
	    this.parseName();
	    currentName = this.readStringFromStack();
	    if(currentName === '[IF]') {
		nestCount++;
	    } else if(currentName === '[THEN]') {
		nestCount--;
	    }
	}
    }

    lparen() {
	this.stack.push(41);
	this.parse(true);
    }

    environmentQ() {
	let query = this.readStringFromStack();
	let result = this.environment[query];
	if(result === null || result === undefined) {
	    this.result = 0;
	} else {
	    this.pushTrue();
	}
	this.stack.push(result);
    }

    writeStringToBuffer(name) {
	if(this.stringPointer + name.length >= this.stringCap) {
	    this.stringPointer = this.string0;
	    if(this.string0 + name.length >= this.stringCap) {
		this.abort('STRING TOO LARGE FOR BUFFER');
	    }
	}
	let addr = this.stringPointer;
	this.stringPointer = this.writeCountedString(name, this.stringPointer, true, true);
	return addr;
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
	this.refreshPad();
    }

    noOp() {
	
    }

    decimal() {
	this.byteView[this.baseAddress] = 10;
    }

    hex() {
	this.byteView[this.baseAddress] = 16;
    }

    abortQuote() {
	this.sQuote();
	this.abort(this.readStringBasedOnSource(null, true, true, true)[1]);
    }

    swap() {
	let a = this.stack.pop();
	let b = this.stack.pop();
	this.stack.push(a);
	this.stack.push(b);
    }

    refreshPad() {
	this.pad = this.dp + 200;
	this.refreshStringPad();
    }

    refreshStringPad() {
	this.stringPad = this.pad + 800;
    }

    //inline param
    pushFloat32() {
	this.fstack.push(new Float32Array(this.memory.buffer, this.ip * 4, 1)[0]);
	this.offsetIp(1)
    }
    
    //inline param
    pushDouble64()  {
	this.fstack.push(new Float64Array(this.memory.buffer, this.ip * 4, 1)[0]);
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
	this.source_id = -1;
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
	case OpCode.OP_NE:
	    this.ne();
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
	case OpCode.OP_INVERT:
	    this.invert();
	    break;
	case OpCode.OP_DO:
	    this.opDo();
	    break;
	case OpCode.OP_RUN_DO:
	    this.opRunDo();
	    break;
	case OpCode.OP_LOOP:
	    this.loop();
	    break;
	case OpCode.OP_RUN_LOOP:
	    this.runLoop();
	    break;
	case OpCode.OP_LEAVE:
	    this.leave();
	    break;
	case OpCode.OP_RUN_PLUS_LOOP:
	    this.runPlusLoop();
	    break;
	case OpCode.OP_PLUS_LOOP:
	    this.plusLoop();
	    break;
	case OpCode.OP_I:
	    this.opI();
	    break;
	case OpCode.OP_J:
	    this.opJ();
	    break;
	case OpCode.OP_RUN_LEAVE:
	    this.runLeave();
	    break;
	case OpCode.OP_BEGIN:
	    this.begin();
	    break;
	case OpCode.OP_UNTIL:
	    this.until();
	    break;
	case OpCode.OP_WHILE:
	    this.opWhile();
	    break;
	case OpCode.OP_REPEAT:
	    this.repeat();
	    break;
	case OpCode.OP_INCLUDE:
	    this.include();
	    break;
	case OpCode.OP_S_QUOTE:
	    this.sQuote();
	    break;
	case OpCode.OP_BACK_SLASH:
	    this.backSlash();
	    break;
	case OpCode.OP_BASE:
	    this.base();
	    break;
	case OpCode.OP_HEX:
	    this.hex();
	    break;
	case OpCode.OP_DECIMAL:
	    this.decimal();
	    break;
	case OpCode.OP_ABORT:
	    this.abort();
	    break;
	case OpCode.OP_ABORT_QUOTE:
	    this.abortQuote();
	    break;
	case OpCode.OP_CELLS:
	    this.cells();
	    break;
	case OpCode.OP_CELL_PLUS:
	    this.cellPlus();
	    break;
	case OpCode.OP_TICK:
	    this.tick();
	    break;
	case OpCode.OP_EXECUTE:
	    this.execute();
	    break;
	case OpCode.OP_ENVIRONMENT_Q:
	    this.environmentQ();
	    break;
	case OpCode.OP_BRACKET_IF:
	    this.bracketIf();
	    break;
	case OpCode.OP_BRACKET_ELSE:
	    this.bracketElse();
	    break;
	case OpCode.OP_LPAREN:
	    this.lparen();
	    break;
	case OpCode.OP_F_STORE:
	    this.fStore();
	    break;
	case OpCode.OP_F_FETCH:
	    this.fFetch();
	    break;
	case OpCode.OP_DOVAL:
	    this.doval();
	    break;
	case OpCode.OP_DOFVAL:
	    this.dofval();
	    break;
	case OpCode.OP_VALUE:
	    this.value();
	    break;
	case OpCode.OP_F_VALUE:
	    this.fvalue();
	    break;
	case OpCode.OP_TO:
	    this.to();
	    break;
	case OpCode.OP_F_TILDE:
	    this.fTilde();
	    break;
	case OpCode.OP_F_NEGATE:
	    this.fNegate();
	    break;
	case OpCode.OP_F_OVER:
	    this.fOver();
	    break;
	case OpCode.OP_F_DUP:
	    this.fDup();
	    break;
	case OpCode.OP_F_SWAP:
	    this.fSwap();
	    break;
	case OpCode.OP_F_DROP:
	    this.fDrop();
	    break;
	case OpCode.OP_FLOATS:
	    this.floats();
	    break;
	case OpCode.OP_F_DEPTH:
	    this.fDepth();
	    break;
	case OpCode.OP_OR:
	    this.or();
	    break;
	case OpCode.OP_AND:
	    this.and();
	    break;
	case OpCode.OP_XOR:
	    this.xor();
	    break;
	case OpCode.OP_PLUS_STORE:
	    this.plusStore();
	    break;
	case OpCode.OP_DEPTH:
	    this.depth();
	    break;
	case OpCode.OP_TYPE:
	    this.opType();
	    break;
	case OpCode.OP_SOURCE:
	    this.source();
	    break;
	case OpCode.OP_CR:
	    this.cr();
	    break;
	case OpCode.OP_TO_IN:
	    this.toIn();
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

    doval() {
	this.pushInt32();
	this.exit();
    }

    dofval() {
	this.pushFloat32();
	this.exit();
    }

    dot() {
	this.systemOut.log(this.stack.pop(true));
    }

    dotS() {
	this.stack.print();
    }

    dotFS() {
	this.fstack.print();
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
	this.stack.push(new Int32Array(this.memory.buffer, addr, 1)[0]);
    }

    fFetch() {
	let addr = this.stack.pop();
	this.fstack.push(new Float32Array(this.memory.buffer, addr, 1)[0]);
    }

    fStore() {
	let addr = this.stack.pop();
	let val = this.fstack.pop();
	this.memory[addr] = val;
    }

    fTilde() {
	let diff = this.fstack.pop();
	let b = this.fstack.pop();
	let a = this.fstack.pop();
	let calc = Math.abs(a - b);
	if((diff > 0.0 && calc < diff) || (diff === 0.0 && calc === diff) || (diff < 0.0 && calc < (Math.abs(diff) * (Math.abs(a) + Math.abs(b))))) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}
    }

    fNegate() {
	this.fstack.push(this.fstack.pop() * -1);
    }

    fSwap() {
	let top = this.fstack.pop();
	let sec = this.fstack.pop();
	this.fstack.push(top);
	this.fstack.push(sec);
    }

    fDrop() {
	this.fstack.pop();
    }

    fDup() {
	let top = this.fstack.pop();
	this.fstack.push(top);
	this.fstack.push(top);
    }

    fOver() {
	let top = this.fstack.pop();
	let dup = this.fstack.pop();
	this.fstack.push(dup);
	this.fstack.push(top);
	this.fstack.push(dup);
    }

    floats() {
	this.stack.push(this.stack.pop());
    }

    depth() {
	this.stack.push(this.stack.depth());
    }

    fDepth() {
	this.stack.push(this.fstack.depth());
    }

    sp_fetch() {
	this.stack.push(this.stack.sp);
    }

    store() {
	let addr = this.stack.pop();
	let val = this.stack.pop();
	this.memory[addr] = val;
    }

    plusStore() {
	let addr = this.stack.pop();
	let val = this.stack.pop();
	this.memory[addr] += val;
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

    parseName(skip) {
	this.bl();
	this.parse(skip);
    }

    parse(skip) {
	let parseChar = String.fromCharCode(this.stack.pop());
	let str = '';
	let inputBuffer;
	if(this.source_id === 0 || this.source_id === -1) {
	    inputBuffer = this.inputBuffer;
	} else {
	    inputBuffer = this.source_id;
	}
	let nextWord = '';
	if(inputBuffer.length !== 0) {
	    let x = inputBuffer.pop();
	    if(x.trim() !== '') {
		nextWord = x;
		str += nextWord;
	    }
	}
	while(!nextWord.includes(parseChar) && inputBuffer.length !== 0) {
	    nextWord = inputBuffer.pop();
	    str += nextWord;
	}
	let split = str.split(parseChar);
	let strAddress;
	if(inputBuffer === this.inputBuffer) {
	    this.inputBuffer.rewind(split[0].length + 1);
	    if(split[1] !== undefined && split[1] !== null && split[1].length !== 0) {
		this.inputBuffer.rewind(split[1].length + 1);
	    }
	    this.inputBuffer.rewriteAtRp(split[0]);
	    strAddress = this.inputBuffer.rp() - 1;
	    this.inputBuffer.skip(split[0].length + 1)
	    if(split[1] !== undefined && split[1] !== null && split[1].length !== 0) {
		this.inputBuffer.rewriteAtRp(split[1]);
	    }
	} else {
	    //console.log(split[0]);
	    if(!skip) {
		strAddress = this.writeStringToBuffer(split[0]);
	    }
	    if(split[1] !== null && split[1] !== undefined && split[1].length !== 0) {
		inputBuffer.push(split[1]);
	    }
	}
	if(!skip) {
	    //console.log('parsed: ' + split[0]);
	    this.stack.push(strAddress);
	    this.stack.push(split[0].length);
	}
    }

    colon() {
	this.sysMark = this.dp;
	this.bl();
	this.parse();
	this.state = -1;
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
	if(name === undefined || name === null || name.trim() === '') {
	    this.abort('Word name cannot be blank for colon definition');
	}
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

    preProcessNumberString(str) {
	if(str.endsWith('e') || str.endsWith('E')) {
	    str = str.concat(0);
	}
	return str;
    }

    number(str) {
	return String(str).trim() !== '' && Number(str).toString() !== 'NaN';
    }

    doNumber(str) {
	if(this.state === 0) {
	    if(str.startsWith('0x') || str.startsWith('-0x')) {
		this.stack.push(parseInt(str, 16));
	    } else if(str.includes('e') || str.includes('E')) {
		this.fstack.push(Number(str));
	    } else if(str.includes('.')) {
		this.systemOut.log('Not implemented yet')
	    } else {
		this.base();
		this.fetch();
		this.stack.push(parseInt(str, this.stack.pop()));
	    }
	} else {
	    if(str.startsWith('0x') || str.startsWith('-0x')) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "LIT"), this.dp));
		this.offsetDp(-this.dp + this.writeInt32(parseInt(str, 16), this.dp));
	    } else if(str.includes('e') || str.includes('E')) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "FLIT"), this.dp));
		this.offsetDp(-this.dp + this.writeFloat32(Number(str), this.dp));
	    } else if(str.includes('.')) {
		this.systemOut.log('Not implemented yet')
	    } else {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "LIT"), this.dp));
		this.base();
		this.fetch();
		this.offsetDp(-this.dp + this.writeInt32(parseInt(str, this.stack.pop()), this.dp));
	    }
	}
    }

    splitAndFilter(str) {
	let blankFn = function(word) { return word !== '' && word !== undefined && word !== null; };
	return String(str).trim().split('\r').join(' ').split('\t').join(' ').split(' ').filter(blankFn);
    }

    backSlash() {
	this.stack.push(10);
	this.parse(true);
    }

    processInputBuffer() {
	let inputPredicate;
	let inputBuffer;
	if(this.source_id === 0 || this.source_id === -1) {
	    inputBuffer = this.inputBuffer;
	    inputPredicate = function () { return inputBuffer.empty.call(inputBuffer) };
	} else {
	    inputBuffer = this.source_id;
	    inputPredicate = function () { return inputBuffer.length === 0 };
	}
	while(!inputPredicate()) {
	    let str = inputBuffer.pop();
	    while(str === ' ') {
		str = inputBuffer.pop();
	    }
	    this.debug('input is: ' + str);
	    console.log('input is: ' + str);
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
		    if(this.ip === top && !this.rstack.empty()) {
			this.exit();
		    }
		} else {
		    this.offsetDp(-this.dp + this.writeUint32(word.cfa, this.dp));
		}
	    } else if (this.number(this.preProcessNumberString(str))) {
		str = this.preProcessNumberString(str);
		this.doNumber(str)
		this.dotS();
		this.dotFS();
	    } else {
		this.abort(str + ' ?');
	    }
	}
    }

    writeAtDp(uint) {
	this.offsetDp(-this.dp + this.writeUint32(uint, this.dp));
    }

    writeLitAtDp(uint) {
	this.writeAtDp(Word.findXt(this, "LIT"));
	this.writeAtDp(uint);
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

    eq() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	if(a === b) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}
    }

    ne() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	if(a !== b) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}

    }

    greater() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	if(a > b) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}
    }

    greaterEq() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	if(a >= b) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}
    }

    less() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	if(a < b) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}
    }

    lessEq() {
	let b = this.stack.pop();
	let a = this.stack.pop();
	if(a <= b) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}
    }

    zeroEq() {
	if(this.stack.pop() === 0) {
	    this.pushTrue();
	} else {
	    this.pushFalse();
	}
    }

    onePlus() {
	let a = this.stack.pop();
	this.stack.push(a + 1);
    }

    oneMinus() {
	let a = this.stack.pop();
	this.stack.push(a - 1);
    }

    invert() {
	//this.stack.push(this.stack.pop() * -1 - 1);
	this.stack.push(~this.stack.pop());
    }

    or() {
	this.stack.push(this.stack.pop() | this.stack.pop());
    }

    and() {
	this.stack.push(this.stack.pop() & this.stack.pop());
    }

    xor() {
	this.stack.push(this.stack.pop() ^ this.stack.pop());
    }

    opType() {
	let a = this.readStringBasedOnSource(null, true, true, true)[1];
	this.systemOut.log(a);
    }

    cr() {
	this.systemOut.log('\n');
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
	let name = this.readStringBasedOnSource(null, true, true, true)[1];
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
	    this.stack.pushControl(orig, 'orig');
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
		this.memory[this.stack.popControlSkipLeave('orig')] = this.dp;
		this.stack.pushControl(orig2, 'orig');
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
		this.memory[this.stack.popControlSkipLeave('orig')] = this.dp;
		this.controlFlowUnresolved++;
	    } else {
		this.abort('Cannot use then without matching if');
	    }
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    opRunDo() {
	this.rstack.pushControl(this.stack.pop(), 'loop-sys-index');
	this.rstack.pushControl(this.stack.pop(), 'loop-sys-limit');
    }

    opDo() {
	if(this.state === -1) {
	    this.debugFinest('Entering DO')
	    this.debugFinest('Writing (DO) at ' + this.dp);
	    this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "(DO)"), this.dp));
	    let doSys = this.dp;
	    this.stack.pushControl(doSys, 'do-sys');
	    this.controlFlowUnresolved -= 1;
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    runLoop() {
	let limit = this.rstack.popControl('loop-sys-limit');
	let index = this.rstack.popControl('loop-sys-index') + 1;
	if(limit === index) {
	    this.pushTrue();
	} else {
	    this.rstack.pushControl(index, 'loop-sys-index');
	    this.rstack.pushControl(limit, 'loop-sys-limit');
	    this.pushFalse();
	}
    }

    runPlusLoop() {
	let limit = this.rstack.popControl('loop-sys-limit');
	let index = this.rstack.popControl('loop-sys-index') + this.stack.pop();
	if(index >= limit) {
	    this.pushTrue();
	} else {
	    this.rstack.pushControl(index, 'loop-sys-index');
	    this.rstack.pushControl(limit, 'loop-sys-limit');
	    this.pushFalse();
	}
    }

    loop() {
	if(this.state === -1) {
	    if(this.unresolvedControlFlow()) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "(LOOP)"), this.dp));
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "0BRANCH"), this.dp));
		let leaveStack = [];
		while(this.stack.peekControl() === 'leave-sys') {
		    let leaveSys = this.stack.popControl('leave-sys');
		    leaveStack.push(leaveSys);
		}
		let doSys = this.stack.popControl('do-sys');
		this.offsetDp(-this.dp + this.writeUint32(doSys, this.dp));
		while(leaveStack.length !== 0) {
		    this.memory[leaveStack.pop()] = this.dp;
		}
		this.controlFlowUnresolved++;
	    } else {
		this.abort('Cannot use loop without matching do');
	    }
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    plusLoop() {
	if(this.state === -1) {
	    if(this.unresolvedControlFlow()) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "(+LOOP)"), this.dp));
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "0BRANCH"), this.dp));
		let leaveStack = [];
		while(this.stack.peekControl() === 'leave-sys') {
		    let leaveSys = this.stack.popControl('leave-sys');
		    leaveStack.push(leaveSys);
		}
		let doSys = this.stack.popControl('do-sys');
		this.offsetDp(-this.dp + this.writeUint32(doSys, this.dp));
		while(leaveStack.length !== 0) {
		    this.memory[leaveStack.pop()] = this.dp;
		}
		this.controlFlowUnresolved++;
	    } else {
		this.abort('Cannot use loop without matching do');
	    }
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    runLeave() {
	let limit = this.rstack.popControl('loop-sys-limit');
	let index = this.rstack.popControl('loop-sys-index');
    }

    leave() {
	if(this.state === -1) {
	    if(this.unresolvedControlFlow()) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "(LEAVE)"), this.dp));
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "BRANCH"), this.dp));
		this.stack.pushControl(this.dp, 'leave-sys');
		this.offsetDp(-this.dp + this.writeUint32(0, this.dp));
	    } else {
		this.abort('Cannot use leave outside of control flow construct');
	    }
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    opI() {
	this.stack.push(this.rstack.pick(this.rstack.depth() - 1 - 1));
    }

    opJ() {
	this.stack.push(this.rstack.pick(this.rstack.depth() - 1 - 3));
    }

    begin() {
	if(this.state === -1) {
	    this.stack.pushControl(this.dp, 'dest');
	    this.controlFlowUnresolved -= 1;
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    repeat() {
	if(this.state === -1) {
	    this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "BRANCH"), this.dp));
	    this.offsetDp(-this.dp + this.writeUint32(this.stack.popControl('dest'), this.dp));
	    this.memory[this.stack.popControl('orig')] = this.dp;
	    this.controlFlowUnresolved += 1;
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    until() {
	if(this.state === -1) {
	    this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "0BRANCH"), this.dp));
	    this.offsetDp(-this.dp + this.writeUint32(this.stack.popControl('dest'), this.dp));
	    this.controlFlowUnresolved += 1;
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    opWhile() {
	if(this.state === -1) {
	    if(this.unresolvedControlFlow()) {
		this.offsetDp(-this.dp + this.writeUint32(Word.findXt(this, "0BRANCH"), this.dp));
		let dest = this.stack.popControl('dest');
		this.stack.pushControl(this.dp, 'orig');
		this.stack.pushControl(dest, 'dest');
		this.offsetDp(-this.dp + this.writeUint32(0, this.dp));
	    } else {
		this.abort('Cannot use while without matching begin');
	    }
	} else {
	    this.abort('Cannot use control flow construct in interpret mode');
	}
    }

    sQuote() {
	this.stack.push(34);
	this.parse();
	if(this.state !== 0) {
	    let len = this.stack.pop();
	    let addr = this.stack.pop();
	    this.writeLitAtDp(addr);
	    this.writeLitAtDp(len);
	} 
    }

    include() {
	let fileName = this.readStringBasedOnSource(null, true, true, true)[1];
	let file = this.loadFile(fileName).replaceAll('\n\n', '\n').replaceAll('\n', ' \n ');
	let temp_source_id = this.source_id;
	let split = this.splitAndFilter(file);
	for(var i = 1; i < split.length; i+=2) {
	    split.splice(i, 0, ' ');
	}
	this.source_id = split.reverse();
	this.processInputBuffer();
	this.source_id = temp_source_id;
    }

    loadFile(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", location.href + filePath, false);
	xmlhttp.send();
	if (xmlhttp.status==200) {
	    result = xmlhttp.responseText;
	}
	return result;
    }

    process() {
	    try {
		if (!this.inputBuffer.empty()) {
		    this.processInputBuffer();
		}
		this.systemOut.log('ok');
	    } catch (e) {
		this.systemOut.log('Error: ' + e);
		this.systemOut.log(e.stack);
	    }
	    
    }
};


