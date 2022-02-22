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

    constructor(vm, name) {
	this.vm = vm;
	this.name = name;
    }

    writeName() {
	this.vm.writeCountedString(this.name);
    }

    makeLink() {
	this.link = this.vm.latest
	this.vm.writeUint32(this.link);
	this.vm.latest = this.address;
    }

    write() {
	this.address = this.vm.ip;
	this.writeName();
	this.makeLink();
    }
}

class Word {
    vm;
    head;
    immediate;
    xt;

    constructor(vm, name, immediate, codeWord, body) {
	this.vm = vm;
	this.head = new Head(vm, name);
	this.immediate = immediate;
	this.codeWord = codeWord;
	this.body = body;

	this.write();
    }

    write() {
	this.head.write();
	this.vm.writeUint32(this.immediate);
	if(this.codeWord === 0) { // code, not high level Forth
	    this.vm.writeUint32(this.body);
	} else {
	}
	this.vm.writeUint32(OpCode.OP_EXIT);
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
	    console.log("STACK OVERFLOW: " + val);
	    this.vm.quit();
	    throw("STACK OVERFLOW: " + val);
	} else {
	    this.memory[this.sp_fetch++] = val;
	}
    }

    pop() {
	if(this.empty()) {
	    console.log("STACK UNDERFLOW");
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
    

    constructor() {
	this.memory = new Uint32Array(65536);
	this.byteView = new Uint8Array(this.memory.buffer);
	this.stack = new Stack(this, );
	this.rstack = new Stack(this, );

	this.cell_size = 4; // in order to get a Uint32, new Uint32Array(memory.buffer, byteOffset, length_in_uint32s)
	this.ip = 0; // program counter, current interp address
	this.eax; // register for current value
	this.latest = 0;
    }


    writeByte(b, offset) {
	this.byteView[offset] = b;
	console.log('writing ' + b + ' @ ' + offset)
    }

    align(offset) {
	if(offset % 4 === 0) {
	    return offset / 4;
	} else {
	    while(offset % 4 !== 0) {
		this.writeByte(OpCode.OP_NOOP, offset);
		offset++;
	    }
	}
	return offset / 4;
    }

    // Write a counted string and then align to cell size
    writeCountedString(name) {
	let tempIp = this.ip * 4;
	this.writeByte(name.length, tempIp);
	tempIp++;
	for(var i = 0; i < Math.min(name.length, 19); i++) {
	    this.writeByte(name.charCodeAt(i), tempIp);
	    tempIp++
	    console.log(name.charCodeAt(i));
	}
	// Arbitrary string size limit is len + 19 because alignment is annoying
	this.ip += 4;
    }

    writeUint32(u) {
	this.memory[this.ip] = u;
	this.ip++;
    }

    defcode(name, immediate, opcode) {
	new Word(this, name, immediate, 0, opcode);
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

    // load up an address to jump to and move the pointer forward
    loadAddress() {
	this.eax = this.memory[this.ip];
	this.offsetIp(1);
    }

    //inline param
    pushFloat32() {
	this.offsetIp(1);
	this.push(new Float32Array(this.memory.buffer, this.ip * 4, 1)[0]);
	this.offsetip(1)
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

    quit() {
	this.rstack.clear();
	this.stack.clear();
    }

    rPush(reg) {
	this.rstack.push(reg);
    }

    rPop() {
	if(this.rstack.length !== 0) {
	    return this.rstack.pop();
	} else {
	    console.log("RSTACK UNDERFLOW");
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
	    console.log("STACK UNDERFLOW");
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
	this.next();
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


