class Chunk {
    codeBuffer;
    code;
    capacity;
    count;
    constructor() {
	this.capacity = 8;
	this.codeBuffer = new ArrayBuffer(this.capacity);
	this.code = new Uint8Array(this.codeBuffer);
	this.count = 0;
    }

    growBuffer() {
	let tempBuffer = new ArrayBuffer(this.capacity * 2);
	let temp = new Uint8Array(tempBuffer);
	for(var i = 0; i < this.capacity; i++) {
	    temp[i] = this.code[i];
	}
	this.codeBuffer = tempBuffer;
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
    static OP_RETURN = 1;
}

class Debug {
    
    static {}
    static disassembleChunk(chunk) {
	for(var offset = 0; offset < chunk.count;) {
	    offset = Debug.disassembleInstruction(chunk, offset);
	}
    }
    static disassembleInstruction(chunk, offset) {
	let instruction = chunk.code[offset];
	switch(instruction) {
	case OpCode.OP_NOOP:
	    console.log("OP_NOOP");
	    return offset += 1;
	case OpCode.OP_RETURN:
	    console.log("OP_RETURN");
	    return offset += 1
	default:
	    console.log("UNRECOGNIZED");
	    return offset += 1;
	}
    }
}
class ForthVM {
    stack;
    rstack;
    OpCode;
    memory;
    memory_bytes;
    cell_size;
    pc;
    

    constructor() {
	this.stack = [];
	this.rstack = [];
	this.memory = new ArrayBuffer(65536);
	this.memory_bytes = new Uint8Array(memory);
	this.cell_size = 4;
	this.pc = 0; // program counter, current interp address
	this.eax; // register for current value
    }

/*
    
    putByteHere(b) {
	this.memory_bytes[this.pc] = b;
	this.pc++;
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
	this.pc++;
	this.OpCode[this.memory_bytes[pc]].call();
	this.NEXT();
    }

    OP_NOOP() {
    }

    OP_JMP_EAX() {
	
    }

    NEXT() {
	// Load memory at program counter into eax
	this.eax = memory_bytes[this.pc];
	this.pc++;
	this.OP_JMP_EAX();
	return;
    }

    OP_PUSHRSP() {
	// Push program counter's address onto the return stack
	rstack.push(this.memory_bytes[this.pc]);
    }

    OP_POPRSP() {
	return rstack.pop();
    }

    OP_DOCOL() {
	this.OP_PUSHRSP();
	this.eax += cell_size;
	this.pc = this.eax;
    }

    
*/
    
		

};


