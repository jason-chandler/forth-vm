class Head {
    name;
    address;
    link;
}

class Word {
    head;
    immediate;
    codeWord;
    codeWord2;
    parameterField;
    cfa;
    pfa;

    constructor(address, name, immediate, codeWord, codeWord2, parameterField, latest) {
	this.head = new Head();
	this.head.address = address;
	this.head.name = name;
	this.head.link = latest;
	this.immediate = immediate;
	this.codeWord = codeWord;
	this.codeWord2 = codeWord2;
	this.parameterField = parameterField;
    }

    writeAtDp() {
	
    }

    static fromCFA(addr) {
	
    }
    
    
}

class CodeTable {
    static OP_DOCOL = 0;
    static OP_DOCON = 1;
    static OP_DOVAR = 2;
    static OP_DODOES = 3;

    getCode(addr) {
	switch(addr) {
	case CodeTable.OP_DOCOL:
	    
	    
	}
    }
}

class Dictionary {
    vm;
    latest;
    startingAddress;
    codeTable;

    constructor(vm, startingAddress) {
	this.vm = vm;
	this.startingAddress = startingAddress;
	this.pointer = startingAddress;
	this.codeTable = new CodeTable();
	
    }

    getDp() {
	return this.vm.getDp();
    }

    setDp(dp) {
	this.vm.setDp(dp);
    }

    writeHere(val) {
	this.vm.writeHere(val);
    }

    writeCountedStringHere(str) {
	this.vm.writeCountedStringHere(str);
    }

    readCountedString(addr) {
	this.vm.push(addr);
	return this.vm.readCountedString();
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
	let link = this.vm.getUint32(this.vm.align(addr + name.length));
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
	    addr = this.vm.align(addr) + (2 * this.vm.cellSize);
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

