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

    addWord(name, immediate, codeWord, codeWord2, parameterField) {
	let word = new Word(address, name, immediate, codeWord, codeWord2, parameterField, latest);
	
    }

    addCode(address, name, immediate) {
	let word = new Word(address, name, immediate, 1, 0, );
    }

    callCode(addr) {
	this.codeTable.getCode(addr).call();
    }

}

