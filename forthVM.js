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
    static OP_SWAP = 2;
    static OP_LOAD_UINT32 = 3;
    static OP_LOAD_FLOAT32 = 4;
    static OP_LOAD_DOUBLE = 5;
    static OP_RPUSH = 6;
    static OP_RPOP = 7;
    static OP_PUSH = 8;
    static OP_POP = 9;
    static OP_ADD = 10;
    static OP_SUB = 11;
    static OP_DIV = 12;
    static OP_MUL = 13;
    static OP_MOD = 14;
    static OP_DUP = 15;
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
    static newWord(vm, name, immediate, codeWord, parameterField) {
	let word = new Word();
	word.vm = vm;
	word.headAddress = word.vm.ip;
	word.head = new Head(word.vm, name, word.headAddress);
	word.head.write();
	word.immediate = immediate; // is this an immediate word
	word.codeWord = codeWord;
	word.parameterField = parameterField;
	word.writeBody();
	return word;
    }

    // Existing word
    static fromDict(vm, address) {
	let word = new Word();
	word.vm = vm;
	word.headAddress = address;
	let countString = word.vm.readCountedString(word.headAddress);
	word.head.name = countString[1];
	let linkLoc = countString[2];
	word.head.link = word.vm.memory[linkLoc];
	let immediateAddr = linkLoc + 1;
	word.immediate = word.vm[immediateAddr];
	word.cfa = immediate + 1;
	word.codeWord = word.vm[cfa];
	word.pfa = word.cfa + 2;
	return word;
    }

    writeBody() {
	this.immediateAddr = this.vm.ip;
	this.vm.writeUint32(this.immediate);
	this.cfa = this.vm.ip;
	if(this.codeWord === 0) { // code, not high level Forth
	    this.vm.writeUint32(OpCode.OP_NOOP);
	    this.vm.writeUint32(this.parameterField);
	} else {
	}
	this.vm.writeUint32(OpCode.OP_EXIT);
	// keep it hidden until word is defined
	this.vm.latest = this.address;
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
	    if(tempName === name) {
		return tempAddr;
	    } else {
		tempAddr = tempLink;
	    }
	}
	return tempAddr;
    }

    static findWord(vm, name) {
	let addr = Word.find(vm, name);
	if (addr === 0) {
	    return 0;
	} else {
	    return Word.fromDict(addr);
	}
    }

    static findXt(vm, name) {
	let wordOrZero = Word.findWord(vm, name);
	if(wordOrZero !== 0) {
	    return wordOrZero.cfa;;
	} else {
	    vm.abort(name + " ?");
	}
    }

}


class Stack {
    vm;
    memory;
    s0; // below bottom of stack
    sp_fetch; // stack pointer
    cell_size;

    constructor(vm, s0, cell_size) {
	this.vm = vm;
	this.memory = vm.memory;
	this.s0 = s0;
	this.sp_fetch = s0 + 1; 
	this.cell_size = cell_size;
	this.stack_limit = 200;
    }

    empty() {
	return this.sp_fetch === s0 + 1;
    }

    push(val) {
	if(this.sp_fetch - this.s0 >= this.stack_limit) {
	    this.vm.systemOut.log("STACK OVERFLOW: " + val);
	    this.vm.quit();
	    throw("STACK OVERFLOW: " + val);
	} else {
	    this.memory[this.sp_fetch++] = val;
	}
    }

    pop() {
	if(this.empty()) {
	    this.vm.systemOut.log("STACK UNDERFLOW");
	    this.vm.quit();
	    throw("STACK UNDERFLOW: ");
	} else {
	    let val = this.memory[this.sp_fetch]
	    this.sp_fetch--;
	    return val;
	}
    }

    clear() {
	while(this.sp_fetch !== (this.s0 + 1)) {
	    this.vm.memory[this.sp_fetch] = 0;
	    this.sp_fetch--;
	}
    }
}


class ForthVM {
    stack;
    rstack;
    eax;
    memory;
    cell_size;
    ip;
    latest;
    sourceId;
    systemOut;
    

    constructor() {
	this.memory = new Uint32Array(65536);
	this.byteView = new Uint8Array(this.memory.buffer);
	this.stack = new Stack(this, );
	this.rstack = new Stack(this, );

	this.cell_size = 4; // in order to get a Uint32, new Uint32Array(memory.buffer, byteOffset, length_in_uint32s)
	this.ip = 0; // program counter, current interp address
	this.eax; // register for current value
	this.latest = 0;
	this.source_id = -1; // -1 for string eval, 0 for file
	this.systemOut = console; // in case i change output area later;
    }


    writeByte(b, offset) {
	this.byteView[offset] = b;
	this.systemOut.log('writing ' + b + ' @ ' + offset)
    }

    align(offset, write) {
	if(offset === 0) {
	    return 0;
	}
	if(offset % this.cell_size === 0) {
	    return offset / this.cell_size;
	} else {
	    while((this.cell_size - (offset % this.cell_size)) !== this.cell_size) {
		this.systemOut.log(offset);
		if(write) {
		    this.writeByte(OpCode.OP_NOOP, offset);
		}
		offset++;
	    }
	}
	return offset / this.cell_size;
    }

    writeAlign(offset) {
	return this.align(offset, true);
    }

    readAlign(offset) {
	return this.align(offset, false);
    }

    // Write a counted string and then align to cell size
    writeCountedString(name) {
	let tempIp = this.ip * this.cell_size;
	let truncLength = Math.min(name.length, 255);
	this.writeByte(truncLength, tempIp);
	tempIp++;
	for(var i = 0; i < truncLength; i++) {
	    this.writeByte(name.charCodeAt(i), tempIp);
	    tempIp++
	    this.systemOut.log(name.charCodeAt(i));
	}
	// Make sure we line back up with cell size
	this.ip = this.writeAlign(tempIp);
    }

    readCountedString(address) {
	let byteAddress = address * this.cell_size;
	// Max length is 255
	let len = this.byteView[byteAddress];
	byteAddress++;
	let str = '';
	for(var i = 0; i < len; i++) {
	    str += String.fromCharCode(this.byteView[byteAddress + i]);
	}
	return [len, str, this.readAlign(byteAddress)]; // 
    }

    writeUint32(u) {
	this.memory[this.ip] = u;
	this.ip++;
    }

    defcode(name, immediate, opcode) {
	Word.newWord(this, name, immediate, 0, opcode);
    }

    addPrimitives() {
	this.defcode('SWAP', 0, OpCode.OP_SWAP);
	
    }

    offsetIp(numCells) {
	this.ip += numCells;
    }

    noOp() {
	this.offsetIp(1);
    }

    //inline param
    pushFloat32() {
	this.offsetIp(1);
	this.push(new Float32Array(this.memory.buffer, this.ip * 4, 1)[0]);
	this.offsetIp(1)
    }
    
    //inline param
    pushDouble()  {
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

    readFromInput() {

    }

    quit() {
	this.rstack.clear();
	this.stack.clear();
	this.readFromInput();
    }

    abort(msg) {
	if(msg !== undefined && msg !== null) {
	    this.systemOut.log(msg);
	}
	this.quit();
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

    enter() {
	let dest = this.memory[this.ip];
	this.ip++;
	this.rPush(ip);
	jmp(dest);
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

	

    engine() {
	while(this.memory[this.ip] !== OpCode.OP_BYE) {
	    switch(this.memory[this.ip]) {
	    case OpCode.OP_NOOP:
		this.noOp();
		break;
	    case OpCode.OP_ENTER:
		this.enter()
	    case OP_PUSH_UINT32:
		this.pushUint32();
		break;
	    case OP_PUSH_FLOAT32:
		this.pushFloat32();
		break;
	    case OP_PUSH_DOUBLE:
		this.pushDouble();
		break;
	    case OP_TO_R:
		this.rPush();
		break;
	    case OP_R_TO:
		this.rPop();
		break;
	    case OP_PUSH:
		this.push();
		break;
	    case OP_POP:
		this.pop();
		break;
	    case OP_ADD:
		this.add();
		break;
	    case OP_SUB:
		this.sub();
		break;
	    case OP_DIV:
		this.div();
		break;
	    case OP_MUL:
		this.mul();
		break;
	    case OP_MOD:
		this.mod();
		break;
	    case OP_GREATER:
		this.greater();
		break;
	    case OP_GREATER_EQ:
		this.greaterEq();
		break;
	    case OP_EQ:
		this.eq();
		break;
	    case OP_LESS:
		this.less();
		break;
	    case OP_LESS_EQ:
		this.lessEq();
		break;
	    case OP_ZERO_EQ:
		this.zeroEq();
		break;
	    case OP_ZERO_LESS:
		this.zeroLess();
		break;

	    }
	}
    }

    
/*
    
    putByteHere(b) {
	this.memory_bytes[this.ip] = b;
	this.ip++;
    }

    
    writeCountedStringHere(name) {
	this.putByteHere(name.length);
	for(var i = 0; i < name.length; i++) {
	    this.putByteHere(name.charCodeAt(i));
	}
    }


    addPrimitiveToDictionary(name, prim_code) {
	writeCountedStringHere(name);
	this.putByteHere(1);
	this.putByteHere(prim_code);
    }

    readFromAddress(address, instruction) {
    }
    
    readAsFloat32(chunk1, chunk2, chunk3, chunk4) {
	let chunks = [chunk1, chunk2, chunk3, chunk4];
	let b = new ArrayBuffer(4);
	let intermediate = new Uint8Array(b);
	for(var i = 0; i < 4; i ++) {
	    intermediate[i] = chunks[i];
	}
	return new Float32Array(b)[0];
    }

    

    OP_DOPRIM() {
	this.ip++;
	this.OpCode[this.memory_bytes[ip]].call();
	this.NEXT();
    }

    OP_NOOP() {
    }

    OP_JMP_EAX() {
	
    }

    NEXT() {
	// Load memory at program counter into eax
	this.eax = memory_bytes[this.ip];
	this.ip++;
	this.OP_JMP_EAX();
	return;
    }

    OP_PUSHRSP() {
	// Push program counter's address onto the return stack
	rstack.push(this.memory_bytes[this.ip]);
    }

    OP_POPRSP() {
	return rstack.pop();
    }

    OP_DOCOL() {
	this.OP_PUSHRSP();
	this.eax += cell_size;
	this.ip = this.eax;
    }

    
*/
    
		

};


