//import { OpCode } from './opcode.js';
//import { Memory } from './memory.js';
//import { Dictionary } from './dictionary.js';



const ForthVM = class {
    ip;
    dp;
    w;
    eax;
    cellSize;
    memory;
    dictionary;
    state;
    toIn;
    tib;
    
    constructor() {
	this.cellSize = 4;
	this.memory = new Memory();
	this.ip = 8;
	this.dp = 8;
	this.dictionary = new Dictionary(this, this.dp);
	this.tib = '';
	this.state = 0;
	this.toIn = 0;
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

    writeHere(val) {
	this.memory.writeUint32(val, this.dp);
	offsetDp(this.cellSize);
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
	this.dictionary.callCode(this.memory.getUint32(this.eax));
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

    isNotSpace(character) {
	return character !== ' ' && character !== '\n';
    }

    getNextWord() {
	let word = '';
	while(this.toIn < this.tib.length && isNotSpace(this.tib[this.toIn])) {
	    word += this.tib[this.toIn];
	    this.toIn++;
	}
	return word;
    }

    processWord(word) {
	let foundWord = this.dictionary.findWord(word);
	if(foundWord !== null && (foundWord.immediate === -1 || this.state === 0)) {
	    
	}
    }

    interpret(line) {
	this.tib = line;
	let len;
	if(line === null || line === undefined || line.length === undefined) {
	    len = 0;
	} else {
	    len = line.length;
	}
	this.toIn = 0;
	while(this.toIn < len) {
	    word = this.getNextWord();
	    this.toIn++;
	    this.processWord(word);
	}
    }
    
}

//window.ForthVM = ForthVM;
window.vm = new ForthVM();


