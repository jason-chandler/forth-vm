export class Word {
    address
    name
    link
    immediate
    codeWord
    codeWord2
    parameterField
    vm

    constructor(vm, address, name, immediate, codeWord, codeWord2, parameterField) {
	this.vm = vm;
	this.address = address;
	this.link = this.vm.latest;
	this.name = ('' + name).toUpperCase();
	this.immediate = immediate;
	this.codeWord = codeWord;
	this.codeWord2 = codeWord2;
	this.vm.debugTable[this.name] = address;
	this.parameterField = parameterField;
    }

    static fromAddress(vm, linkAddress) {
	let address = linkAddress + vm.cellSize;
	vm.stack.push(address);
	let name = vm.readCountedString();
	let immediateAddress = vm.align(address + name.length)
	let immediate = vm.memory.getInt32(immediateAddress);
	let cfa2 = immediateAddress + vm.cellSize;
	let cfa = cfa2 + vm.cellSize;
	let pfa = cfa + vm.cellSize;
	let codeWord = vm.memory.getUint32(cfa);
	let codeWord2 = vm.memory.getUint32(cfa2);
	return {address: address, name: name, immediate: immediate, immediateAddress: immediateAddress, codeWord: codeWord, codeWord2: codeWord2, cfa: cfa, cfa2: cfa2, pfa: pfa};
    }

    static getCFA(vm, linkAddress) {
	let nameAddress = linkAddress + vm.cellSize;
	return nameAddress + vm.align((1 + vm.memory.getByte(nameAddress))) + (vm.cellSize * 2);
    }
}
