import { Word } from './word.js';

export class Dictionary {
    vm;
    
    constructor(vm) {
	this.vm = vm;
	this.initCodeWords(this.vm);
    }

    initCodeWords(vm) {
	let index = 0;
	const SWAP = index;
	vm.addCode(0, index++, function swap() {
	    let a = vm.stack.pop();
	    let b = vm.stack.pop();
	    vm.stack.push(a);
	    vm.stack.push(b);
	})
	const DUP = index;
	vm.addCode(0, index++, function dup() {
	    let a = vm.stack.pop();
	    vm.stack.push(a);
	    vm.stack.push(a);
	})
	const ROT = index;
	vm.addCode(0, index++, function rot() {
	    let a = vm.stack.pop();
	    let b = vm.stack.pop();
	    let c = vm.stack.pop();
	    vm.stack.push(b);
	    vm.stack.push(a);
	    vm.stack.push(c);
	})
	const OVER = index;
	vm.addCode(0, index++, function over() {
	    vm.push(vm.stack.pick(1));
	})
	const PARSE = index;
	let counted;
	const PARSEIMPL = function () {
	    vm.parseChar = String.fromCharCode(vm.stack.pop());
	    // let parseChar = String.fromCharCode(vm.stack.pop());
	    vm.parseStr = '';
	    vm.parseCallback1 = function () {
		if(vm.counted) {
		    vm.writeCountedToStringBuffer(vm.parseStr);
		} else {
		    vm.writeToStringBuffer(vm.parseStr);
		}
	    }.bind(this, vm)
	}.bind(this, vm);
	vm.addCode(0, index++, function parse() {
	    vm.counted = false;
	    PARSEIMPL();
	    vm.parseCallback2 = null;
	})
	const BL = index;
	vm.addCode(0, index++, function bl() {
	    vm.stack.push(32); // space
	})
	vm.addCode(-1, index++, function lparen() {
	    vm.parseStr = '';
	    vm.parseChar = String.fromCharCode(41); // right paren
	    vm.parseCallback1 = null;
	    vm.parseCallback2 = null;
	}, '(')
	const BACKSLASH = index;
	vm.addCode(-1, index++, function backslash() {
	    vm.parseStr = '';
	    vm.parseChar = '\n';
	    vm.parseCallback1 = null;
	    vm.parseCallback2 = null;
	}, '\\')
	vm.addCode(-1, index++, function backslash() {
	    vm.callCode(BACKSLASH);
	}, '\\\\')
	vm.addCode(-1, index++, function dot_lparen() {
	    vm.push(41); // right paren
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		vm.systemOut.log(vm.readStringFromStack());
	    }.bind(this, vm);
	}, '.(')
	vm.addCode(0, index++, function docol() {
	    
	})
	vm.addCode(0, index++, function colon() {
	    vm.clearHidden();
	    vm.setState(1);
	    vm.callCode(BL); // BL
	    vm.callCode(PARSE); // PARSE
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		vm.addWord(name, 0, Word.getCFA(this, vm.debugTable['DOCOL']), 0, true)
	    }.bind(this,this);
	}, ':')
	vm.addCode(0, index++, function exit() {
	    vm.rpop(false, 'jump');
	})
	vm.addCode(-1, index++, function semicolon() {
	    if(vm.unresolvedControlFlow()) {
		vm.abort('Control flow word is unresolved');
	    }
	    vm.writeHere(vm.findWord('EXIT').cfa);
	    vm.clearHidden();
	    vm.setState(0);
	}, ';')
	vm.addCode(0, index++, function lit() {
	    const nextAddr = vm.rpop(false, 'jump');
	    vm.stack.push(vm.memory.getUint32(nextAddr));
	    vm.rpush(nextAddr + vm.cellSize, 'jump');
	})
	vm.addCode(0, index++, function dlit() {
	    const nextAddr = vm.rpop(false, 'jump');
	    vm.stack.dpush(vm.memory.getInt64(nextAddr));
	    vm.rpush(nextAddr + vm.cellSize, 'jump');
	})
	vm.addCode(-1, index++, function literal() {
	    const a = vm.pop();
	    vm.writeHere(vm.findWordOrAbort('LIT').cfa);
	    vm.writeHere(a);
	})
	vm.addCode(0, index++, function dotS() {
	    vm.stack.print();
	}, '.s')
	vm.addCode(0, index++, function toR() {
	    const a = vm.rpop(false, 'jump');
	    vm.rpush(vm.pop(false));
	    vm.rpush(a, 'jump');
	}, '>R');
	vm.addCode(0, index++, function Rfrom() {
	    const a = vm.rpop(false, 'jump');
	    vm.push(vm.rpop(false));
	    vm.rpush(a, 'jump');
	}, 'R>');
	vm.addCode(0, index++, function store() {
	    const addr = vm.pop();
	    const val = vm.pop();
	    vm.memory.setUint32(addr, val)
	}, '!')
	vm.addCode(0, index++, function fetch() {
	    const a = vm.stack.pop();
	    vm.stack.push(vm.memory.getUint32(a));
	}, '@')
	const COMMA = index;
	vm.addCode(0, index++, function comma() {
	    if(vm.dp % vm.cellSize !== 0) {
		vm.abort('Must be aligned to store to cell.');
	    }
	    vm.writeHere(vm.pop(false));
	}, ',')
	vm.addCode(0, index++, function cfetch() {
	    vm.stack.push(vm.memory.getByte(vm.stack.pop()));
	}, 'c@')
	vm.addCode(0, index++, function ccomma() {
	    vm.writeCHere(vm.pop());
	}, 'c,')
	vm.addCode(0, index++, function cstore() {
	    const addr = vm.pop();
	    const val = vm.pop()
	    vm.memory.setByte(addr, val);
	}, 'c!')
	vm.addCode(0, index++, function rfetch() {
	    vm.push(vm.rstack.pick(1));
	}, 'R@')
	vm.addCode(0, index++, function here() {
	    vm.push(vm.dp);
	})
	vm.addCode(0, index++, function allot() {
	    vm.offsetDp(vm.pop());
	})
	vm.addCode(0, index++, function base() {
	    vm.push(vm.baseAddr);
	})
	vm.addCode(0, index++, function decimal() {
	    vm.memory.setUint32(vm.baseAddr, 10);
	})
	vm.addCode(0, index++, function hex() {
	    vm.memory.setUint32(vm.baseAddr, 16);
	})
	vm.addCode(0, index++, function dovar() {
	    vm.stack.push(vm.rpop(false, 'jump'));
	})
	vm.addCode(0, index++, function docon() {
	    vm.stack.push(vm.memory.getUint32(vm.rpop(false, 'jump')));
	})
	vm.addCode(0, index++, function equal() {
	    if(vm.pop(true) === vm.pop(true)) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '=')
	vm.addCode(0, index++, function variable() {
	    vm.clearHidden();
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		vm.addWord(name, 0, Word.getCFA(this, vm.debugTable['DOVAR']), 0)
		vm.offsetDp(vm.cellSize);
	    }.bind(this, vm);
	})
	vm.addCode(0, index++, function constant() {
	    const constant = vm.pop();
	    vm.clearHidden();
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		vm.addWord(name, 0, Word.getCFA(this, vm.debugTable['DOCON']), 0)
		vm.writeHere(constant);
	    }.bind(this, vm);
	})
	vm.addCode(0, index++, function tick() {
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		const found = vm.findWordOrAbort(name);
		vm.push(found.cfa);
	    }.bind(this, vm);
	}, '\'')
	vm.addCode(-1, index++, function bracket_tick() {
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		const found = vm.findWordOrAbort(name);
		vm.writeHere(vm.findWordOrAbort('LIT').cfa);
		vm.writeHere(found.cfa);
	    }.bind(this, vm);
	}, '[\']')
	vm.addCode(-1, index++, function lbracket() {
	    vm.setState(0);
	}, '[')
	vm.addCode(-1, index++, function rbracket() {
	    vm.setState(1);
	}, ']')
	vm.addCode(-1, index++, function bracket_char() {
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		vm.writeHere(vm.findWord('LIT').cfa);
		vm.writeHere(name.charCodeAt(0));
	    }.bind(this, vm);
	}, '[char]')
	vm.addCode(0, index++, function _char() {
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		vm.push(name.charCodeAt(0));
	    }.bind(this, vm);
	}, 'char')
	vm.addCode(0, index++, function char_plus() {
	    vm.push((vm.pop() + 1));
	}, 'char+')
	vm.addCode(0, index++, function chars() {
	    vm.push(vm.pop());
	})
	vm.addCode(-1, index++, function bracket_compile() {
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		const found = vm.findWordOrAbort(name);
		vm.writeHere(found.cfa);
	    }.bind(this, vm);
	}, '[compile]')
	vm.addCode(0, index++, function immediate() {
	    const latestWord = Word.fromAddress(this, vm.latest);
	    vm.memory.setInt32(latestWord.immediateAddress, -1);
	})
	vm.addCode(0, index++, function execute() {
	    const a = vm.rpopNested(false, 'jump');
	    vm.rpush(vm.pop(), 'jump');
	    vm.rpushNested(a, 'jump');
	})
	vm.addCode(0, index++, function compile_comma() {
	    const xt = vm.stack.pop();
	    const found = vm.findByXtOrAbort(xt);
	    vm.writeHere(xt);
	}, 'compile,')
	vm.addCode(0, index++, function d() {
	    vm.systemOut.log(vm.stack.pop(true).toString(vm.getBase()));
	}, '.')
	vm.addCode(0, index++, function plus() {
	    vm.stack.push(vm.stack.pop(true) + vm.stack.pop());
	}, '+')
	vm.addCode(0, index++, function minus() {
	    const b = vm.stack.pop();
	    vm.stack.push(vm.stack.pop(true) - b);
	}, '-')
	vm.addCode(0, index++, function star() {
	    vm.stack.push(vm.stack.pop(true) * vm.stack.pop());
	}, '*')
	vm.addCode(0, index++, function slash() {
	    const b = vm.stack.pop(true);
	    vm.stack.push(Math.floor(vm.stack.pop(true) / b));
	}, '/')
	vm.addCode(0, index++, function mod() {
	    const b = vm.stack.pop(true);
	    vm.stack.push(vm.stack.pop(true) % b);
	})
	vm.addCode(0, index++, function slashmod() {
	    const b = vm.stack.pop(true);
	    const a = vm.stack.pop(true);
	    vm.stack.push(a % b);
	    vm.stack.push(Math.floor(a / b));
	}, '/mod')
	vm.addCode(0, index++, function starslashmod() {
	    const c = vm.stack.pop(true);
	    const b = vm.stack.pop(true);
	    const a = vm.stack.pop(true);
	    vm.stack.push(Number(BigInt(a * b) % BigInt(c)));
	    vm.stack.push(Number(BigInt(a * b) / BigInt(c)));
	}, '*/mod')

	vm.addCode(0, index++, function um_slashmod() {
	    const b = BigInt(vm.stack.pop());
	    const a = BigInt(vm.stack.dpop());
	    vm.stack.push(Number(a % b));
	    vm.stack.push(Math.floor(Number(a / b)));
	}, 'um/mod')
	vm.addCode(0, index++, function sm_slashrem() {
	    const b = BigInt(vm.stack.pop(true));
	    const a = BigInt(vm.stack.dpop(true));
	    vm.stack.push(Number(a % b));
	    vm.stack.push(Number(a / b));
	}, 'sm/rem')
	vm.addCode(0, index++, function fm_slashmod() {
	    // TODO: real floored division for doubleInts
	    // JavaScript only implements symmetric for Int64's
	    const b = vm.stack.pop(true);
	    const a = Number(vm.stack.dpop(true));
	    vm.stack.push(a % b);
	    Math.floor(vm.stack.push(a / b));
	}, 'fm/mod')
	vm.addCode(0, index++, function less() {
	    const b = vm.stack.pop(true);
	    const a = vm.stack.pop(true);
	    if(a < b) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '<')
	vm.addCode(0, index++, function greater() {
	    const b = vm.stack.pop(true);
	    const a = vm.stack.pop(true);
	    if(a > b) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '>')
	vm.addCode(0, index++, function lesseq() {
	    const b = vm.stack.pop(true);
	    const a = vm.stack.pop(true);
	    if(a <= b) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '<=')
	vm.addCode(0, index++, function greateq() {
	    const b = vm.stack.pop(true);
	    const a = vm.stack.pop(true);
	    if(a >= b) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '>=')
	vm.addCode(0, index++, function abs() {
	    vm.push(Math.abs(vm.pop(true)));
	})
	vm.addCode(0, index++, function align() {
	    vm.alignDp();
	})
	vm.addCode(0, index++, function aligned() {
	    vm.push(vm.align());
	})
	vm.addCode(0, index++, function i() {
	    vm.stack.push(vm.rstack.pick(2));
	})
	vm.addCode(0, index++, function j() {
	    vm.stack.push(vm.rstack.pick(4));
	})
	const DROP = index;
	vm.addCode(0, index++, function drop() {
	    vm.pop();
	})
	vm.addCode(0, index++, function nip() {
	    vm.callCode(SWAP);
	    vm.callCode(DROP);
	})
	vm.addCode(0, index++, function tuck() {
	    vm.callCode(SWAP);
	    vm.callCode(OVER);
	})
	vm.addCode(0, index++, function pick() {
	    vm.push(vm.stack.pick(vm.pop(false)));
	})
	vm.addCode(0, index++, function roll() {
	    const a = vm.pop();
	    if(vm.stack.depth() >= a + 1) {
		for(let i = a; i > 0; i--) {
		    const lowLoc = vm.stack.sp + (vm.cellSize * (i))
		    const highLoc = vm.stack.sp + (vm.cellSize * (i + 1))
		    const low = vm.memory.getUint32(lowLoc);
		    const high = vm.memory.getUint32(highLoc);
		    vm.memory.setUint32(lowLoc, high);
		    vm.memory.setUint32(highLoc, low);
		}
	    } else {
		vm.abort('STACK UNDERFLOW');
	    }
	})
	vm.addCode(0, index++, function abort() {
	    vm.abort();
	})
	vm.addCode(0, index++, function abort_quote() {
	    vm.push(34);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const reason = vm.readStringFromStack();
		vm.abort(reason);
	    }.bind(this, vm);
	}, 'abort"')
	vm.addCode(0, index++, function read_cstring() {
	    const a = vm.rpop(false, 'jump');
	    const len = vm.memory.getByte(a);
	    vm.push(a + 1);
	    vm.push(len);
	    vm.rpush(vm.align(a + len), 'jump');
	}, '(s")')
	const SQUOTE = index;
	vm.addCode(-1, index++, function s_quote() {
	    vm.stack.push(34);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		if(vm.getState() === 1) {
		    vm.writeHere(vm.findWord('(S")').cfa);
		    const str = vm.readStringFromStack();
		    vm.writeCountedStringHere(str);
		    vm.alignDp();
		}
	    }.bind(this, vm);
	}, 's"')
	const TYPE = index;
	vm.addCode(0, index++, function type() {
	    vm.systemOut.log(vm.readStringFromStack());
	})
	vm.addCode(-1, index++, function dot_quote() {
	    vm.stack.push(34);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		if(vm.getState() === 1) {
		    vm.writeHere(vm.findWord('(S")').cfa);
		    const str = vm.readStringFromStack();
		    vm.writeCountedStringHere(str);
		    vm.alignDp();
		    vm.writeHere(vm.findWord('TYPE').cfa);
		} else {
		    vm.callCode(TYPE);
		}
	    }.bind(this, vm);
	}, '."')
	vm.addCode(0, index++, function zerobranch() {
	    const brVal = vm.stack.pop();
	    const returnAddr = vm.rpop(false, 'jump');
	    const branchAddr = vm.memory.getUint32(returnAddr);
	    
	    if(brVal === 0) {
		vm.rpush(branchAddr, 'jump');
	    } else {
		vm.rpush(returnAddr + vm.cellSize, 'jump');
	    }
	}, '0branch')
	vm.addCode(0, index++, function branch() {
	    const returnAddr = vm.rpop(false, 'jump');
	    const branchAddr = vm.memory.getUint32(returnAddr);
	    vm.rpush(branchAddr, 'jump');
	})
	vm.addCode(0, index++, function run_do() {
	    const a = vm.rpop(false, 'jump');
	    vm.rpush(vm.stack.pop(), 'loop-sys-index');
	    vm.rpush(vm.stack.pop(), 'loop-sys-limit');
	    vm.rpush(a, 'jump');
	}, '(do)')
	vm.addCode(-1, index++, function _do() {
	    if(vm.getState() === 1) {
		vm.writeHere(vm.findWord('(DO)').cfa);
		vm.stack.push(vm.dp, 'do-sys');
		vm.controlFlowUnresolved -= 1;
	    } else {
		vm.abort('Cannot use control flow construct \'DO\' in interpret mode');
	    }
	}, 'do')
	vm.addCode(-1, index++, function _case() {
	    if(vm.getState() === 1) {
		// TODO: look up a better implementation of this
		vm.writeHere(vm.findWord('LIT').cfa);
		vm.push(vm.dp, 'case-sys');
		vm.writeHere(0);
		vm.writeHere(vm.findWord('DROP').cfa);
		vm.controlFlowUnresolved -= 1;
	    } else {
		vm.abort('Cannot use control flow construct \'CASE\' in interpret mode');
	    }
	}, 'case')
	vm.addCode(-1, index++, function _of() {
	    if(vm.getState() === 1) {
		vm.writeHere(vm.findWord('LIT').cfa);
		vm.writeHere(1);
		vm.writeHere(vm.findWord('PICK').cfa);
		vm.writeHere(vm.findWord('=').cfa);
		vm.writeHere(vm.findWord('0BRANCH').cfa);
		vm.push(vm.dp, 'of-sys');
		vm.writeHere(0);
		vm.writeHere(vm.findWord('DROP').cfa);
		vm.controlFlowUnresolved -= 1;
			 } else {
			     vm.abort('Cannot use control flow construct \'OF\' in interpret mode');
			 }
	}, 'of')
	vm.addCode(-1, index++, function endof() {
	    if(vm.getState() === 1) {
		const endOf = vm.dp;
		const _of = vm.pop(false, 'of-sys');
		const _case = vm.pop(false, 'case-sys');
		// make sure the previous endof jumps to before the branch
		// so it skips to the end
		vm.memory.setUint32(_case, endOf);
		vm.writeHere(vm.findWord('BRANCH').cfa);
		vm.push(vm.dp, 'case-sys');
		vm.writeHere(0);
		// make sure the previous OF jumps after the branch to check
		// if the next case is true
		vm.memory.setUint32(_of, vm.dp);
		vm.controlFlowUnresolved += 1;
			 } else {
			     vm.abort('Cannot use control flow construct \'ENDOF\' in interpret mode');
			 }
	}, 'endof')
	vm.addCode(-1, index++, function endcase() {
	    if(vm.getState() === 1) {
		const _case = vm.pop(false, 'case-sys');
		vm.writeHere(vm.findWord('DROP').cfa);
		vm.memory.setUint32(_case, vm.dp);
		vm.controlFlowUnresolved += 1;
			 } else {
			     vm.abort('Cannot use control flow construct \'ENDCASE\' in interpret mode');
			 }
	}, 'endcase')
	vm.addCode(0, index++, function runLoop() {
	    let nextAddr = vm.rpop(false, 'jump');
	    const signed = vm.peekIndices();
	    let limit = vm.rpop(signed, 'loop-sys-limit');
	    let index = vm.rpop(signed, 'loop-sys-index') + 1;
	    if(limit === index) {
		vm.pushTrue();
	    } else {
		vm.rpush(index, 'loop-sys-index');
		vm.rpush(limit, 'loop-sys-limit');
		vm.pushFalse();
	    }
	    vm.rpush(nextAddr, 'jump');
	}, '(loop)')
	vm.addCode(0, index++, function runPlusLoop() {
	    let nextAddr = vm.rpop(false, 'jump');
	    const signed = vm.peekPlusIndices();
	    let limit = vm.rpop(signed, 'loop-sys-limit');
	    let index = vm.rpop(signed, 'loop-sys-index') + vm.pop(signed);
	    if((limit - 1) === index) {
		vm.pushTrue();
	    } else {
		vm.rpush(index, 'loop-sys-index');
		vm.rpush(limit, 'loop-sys-limit');
		vm.pushFalse();
	    }
	    vm.rpush(nextAddr, 'jump');
	}, '(+loop)')
	let plus;
	const loop = function () {
	    if(vm.getState() === 1) {
		if(vm.unresolvedControlFlow()) {
		    const loopWord = plus ? '(+LOOP)' : '(LOOP)';
		    vm.writeHere(vm.findWord(loopWord).cfa);
		    vm.writeHere(vm.findWord('0BRANCH').cfa);
		    let leaveStack = [];
		    while(vm.stack.peekControl() === 'leave-sys') {
			const leaveSys = vm.stack.pop(false, 'leave-sys');
			leaveStack.push(leaveSys);
		    }
		    const doSys = vm.stack.pop(false, 'do-sys');
		    vm.writeHere(doSys);
		    while(leaveStack.length !== 0) {
			const leaveLoc = leaveStack.pop();
			vm.memory.setUint32(leaveLoc, vm.dp);
		    }
		    vm.controlFlowUnresolved++;
		} else {
		    vm.abort('Cannot use LOOP without matching DO');
		}
	    } else {
		vm.abort('Cannot use control flow construct \'LOOP\' in interpret mode');
	    }
	}.bind(this, vm);
	vm.addCode(-1, index++, function loop1 () {
	    plus = false;
	    loop();
	}, 'loop');
	vm.addCode(-1, index++, function loop2 () {
	    plus = true;
	    loop();
	}, '+loop');
	vm.addCode(0, index++, function toIn() {
	    vm.push(vm.toIn);
	}, '>in');
	vm.addCode(0, index++, function do_does() {
	    const createdAddr = vm.rpop(false, 'jump');
	    const cfa2 = createdAddr - (2 * vm.cellSize);
	    const code2 = vm.memory.getUint32(cfa2);
	    vm.push(createdAddr);
	    if(code2 !== 0) {
		vm.rpush(code2, 'jump');
	    }
	}, 'dodoes')
	vm.addCode(0, index++, function run_does() {
	    let latestWord = Word.fromAddress(this, vm.latest);
	    const lastDefinitionCreated = latestWord.codeWord === Word.getCFA(this, vm.debugTable['DODOES']);
	    if(lastDefinitionCreated) {
		const returnAddr = vm.rpop(false, 'jump');
		vm.memory.setUint32(latestWord.cfa2, returnAddr);
	    } else {
		vm.abort('Cannot use DOES without CREATE');
	    }
	}, '(does)')
	const DOES = index;
	vm.addCode(-1, index++, function does() {
	    if(vm.getState() === 0) {
		let latestWord = Word.fromAddress(this, vm.latest);
		const lastDefinitionCreated = latestWord.codeWord === Word.getCFA(this, vm.debugTable['DODOES']);
		if(lastDefinitionCreated) {
		    vm.memory.setUint32(latestWord.cfa2, vm.dp);
		    vm.setState(1);
		} else {
		    vm.abort('Cannot use DOES without CREATE');
		}
	    } else {
		vm.writeHere(Word.getCFA(this, vm.debugTable['(DOES)']));
	    }
	}, 'does>')
	const CREATE = index;
	vm.addCode(0, index++, function create() {
	    vm.clearHidden();
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		vm.addWord(name, 0, Word.getCFA(this, vm.debugTable['DODOES']), 0);
	    }.bind(this, vm);
	})
	vm.addCode(0, index++, function buffer() {
	    vm.alignDp();
	    const size = vm.pop();
	    vm.clearHidden();
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		vm.addWord(name, 0, Word.getCFA(this, vm.debugTable['DODOES']), 0);
		vm.offsetDp(size);
	    }.bind(this, vm);
	})
	vm.addCode(0, index++, function cellplus() {
	    vm.push(vm.pop(false) + vm.cellSize);
	}, 'cell+')
	vm.addCode(0, index++, function cells() {
	    vm.push(vm.pop(false) * vm.cellSize);
	})
	vm.addCode(-1, index++, function again() {
	    if(vm.getState() === 1) {
		vm.writeHere(Word.getCFA(this, vm.debugTable['BRANCH']));
		vm.writeHere(vm.pop(false, 'dest'));
		vm.controlFlowUnresolved += 1;
	    } else {
		vm.abort('Cannot use control flow construct \'AGAIN\' in interpret mode');
	    }
	})
	vm.addCode(-1, index++, function begin() {
	    if(vm.getState() === 1) {
		vm.stack.push(vm.dp, 'dest');
		vm.controlFlowUnresolved -= 1;
	    } else {
		vm.abort('Cannot use control flow construct \'BEGIN\' in interpret mode');
	    }
	})
	vm.addCode(-1, index++, function repeat() {
	    if(vm.getState() === 1) {
		vm.writeHere(Word.getCFA(this, vm.debugTable['BRANCH']));
		vm.writeHere(vm.pop(false, 'dest'));
		vm.memory.setUint32(vm.pop(false, 'orig'), vm.dp);
		vm.controlFlowUnresolved += 2;
	    } else {
		vm.abort('Cannot use control flow construct \'REPEAT\' in interpret mode');
	    }
	})
	vm.addCode(-1, index++, function until() {
	    if(vm.getState() === 1) {
		vm.writeHere(vm.findWord('0BRANCH').cfa);
		vm.writeHere(vm.pop(false, 'dest'));
		vm.controlFlowUnresolved += 1;
	    } else {
		vm.abort('Cannot use control flow construct \'UNTIL\' in interpret mode');
	    }
	})
	vm.addCode(-1, index++, function _while() {
	    if(vm.getState() === 1) {
		if(vm.unresolvedControlFlow()) {
		    vm.writeHere(vm.findWord('0BRANCH').cfa);
		    const dest = vm.pop(false, 'dest');
		    vm.push(vm.dp, 'orig');
		    vm.push(dest, 'dest');
		    vm.writeHere(0);
		    vm.controlFlowUnresolved -= 1;
		} else {
		    vm.abort('Cannot use while without matching begin');
		}
	    } else {
		vm.abort('Cannot use control flow construct \'WHILE\' in interpret mode');
	    }
	}, 'while')
	vm.addCode(0, index++, function oneplus() {
	    vm.push(1 + vm.pop(true));
	}, '1+')
	vm.addCode(0, index++, function oneminus() {
	    vm.push(vm.pop(true) - 1);
	}, '1-')
	vm.addCode(0, index++, function run_leave() {
	    const a = vm.rpop(false, 'jump');
	    vm.rpop(true, 'loop-sys-limit');
	    vm.rpop(true, 'loop-sys-index');
	    const branchAddr = vm.memory.getUint32(a);
	    vm.rpush(branchAddr, 'jump');
	}, '(leave)')
	vm.addCode(-1, index++, function leave() {
	    if(vm.getState() === 1) {
		if(vm.unresolvedControlFlow()) {
		    vm.writeHere(vm.findWord('(LEAVE)').cfa);
		    vm.push(vm.dp, 'leave-sys');
		    vm.writeHere(0);
		} else {
		    vm.abort('Cannot use leave outside of control flow construct');
		}
	    } else {
		vm.abort('Cannot use control flow construct \'LEAVE\' in interpret mode');
	    }
	})
	vm.addCode(0, index++, function unloop() {
	    const a = vm.rpop(false, 'jump');
	    vm.rpop(false, 'loop-sys-limit');
	    vm.rpop(false, 'loop-sys-index');
	    vm.rpush(a, 'jump');
	})
	vm.addCode(-1, index++, function _if() {
	    if(vm.getState() === 1) {
		vm.writeHere(vm.findWord('0BRANCH').cfa);
		vm.push(vm.dp, 'orig');
		vm.writeHere(0);
		vm.controlFlowUnresolved -= 1;
	    } else {
		vm.abort('Cannot use control flow construct \'IF\' in interpret mode');
	    }
	}, 'if')
	vm.addCode(-1, index++, function _else() {
	    if(vm.getState() === 1) {
		if(vm.unresolvedControlFlow()) {
		    vm.writeHere(vm.findWord('BRANCH').cfa);		    
		    let orig2 = vm.dp;
		    vm.writeHere(0);
		    vm.memory.setUint32(vm.stack.pop(false, 'orig', true), vm.dp);
		    vm.push(orig2, 'orig');
		} else {
		    vm.abort('Cannot use else without matching if');
		}
	    } else {
		vm.abort('Cannot use control flow construct \'ELSE\' in interpret mode');
	    }
	}, 'else')
	vm.addCode(-1, index++, function then() {
	    if(vm.getState() === 1) {
		if(vm.unresolvedControlFlow()) {
		    vm.memory.setUint32(vm.stack.pop(false, 'orig', true), vm.dp);
		    vm.controlFlowUnresolved++;
		} else {
		    vm.abort('Cannot use then without matching if');
		}
	    } else {
		vm.abort('Cannot use control flow construct \'THEN\' in interpret mode');
	    }
	})
	vm.addCode(0, index++, function count() {
	    const loc = vm.stack.pop();
	    const len = vm.memory.getByte(loc);
	    vm.push(loc + 1);
	    vm.push(len);
	})
	vm.addCode(0, index++, function cr() {
	    vm.systemOut.log('\n');
	})
	vm.addCode(0, index++, function colon_noname() {
	    vm.clearHidden();
	    const noname_cfa = vm.addWord('', 0, Word.getCFA(this, vm.debugTable['DOCOL']), 0);
	    vm.setState(1);
	    vm.push(noname_cfa);
	}, ':noname')
	vm.addCode(-1, index++, function recurse() {
	    if(vm.hiddenWord) {
		vm.writeHere(vm.hiddenWord.cfa);
	    } else {
		vm.writeHere(vm.getXtAndLinkFromAddr(vm.latest)[0]);
	    }
	})
	vm.addCode(0, index++,  function dump() {
	    const limit = vm.pop();
	    const addr = vm.pop();
	    let str = '';
	    for(let i = 0; i < limit; i++) {
		str += vm.memory.getByte(addr + i);
		str += ' ';
	    }
	    vm.systemOut.log(str);
	})
	vm.addCode(0, index++,  function defdump() {
	    const limit = vm.pop();
	    const cfa = vm.pop();
	    let str = '';
	    for(let i = 0; i < limit; i+= vm.cellSize) {
		const defcfa = vm.memory.getUint32(cfa + i);
		const addr = vm.findByXt(defcfa);
		if(addr !== 0)  {
		    str += Word.fromAddress(this, addr).name;
		} else {
		    str += defcfa;
		}
		str += ' ';
	    }
	    vm.systemOut.log(str);
	})
	vm.addCode(0, index++, function defer() {
	    vm.callCode(CREATE);
	    vm.writeHere(vm.findWord('ABORT').cfa);
	    vm.callCode(DOES);
	    vm.writeHere(vm.findWord('@').cfa);
	    vm.writeHere(vm.findWord('EXECUTE').cfa);
	    vm.writeHere(vm.findWord('EXIT').cfa);
	    vm.setState(0);
	})
	vm.addCode(0, index++, function is() {
	    const xt = vm.pop();
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const pfa = vm.findWordOrAbort(vm.readStringFromStack()).pfa;
		vm.memory.setUint32(pfa, xt);
	    }.bind(this, vm);
	})
	vm.addCode(0, index++, function defer_store() {
	    const deferred = vm.pop();
	    const xt = vm.pop();
	    const found = vm.findByXtOrAbort(deferred);
	    vm.memory.setUint32(deferred + vm.cellSize, xt);
	}, 'defer!')
	vm.addCode(0, index++, function defer_fetch() {
	    const deferred = vm.pop();
	    const found = vm.findByXtOrAbort(deferred);
	    vm.push(vm.memory.getUint32(deferred + vm.cellSize));
	}, 'defer@')
	vm.addCode(0, index++, function action_of() {
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const pfa = vm.findWord(vm.readStringFromStack()).pfa;
		vm.push(vm.memory.getUint32(pfa));
	    }.bind(this, vm);
	}, 'action-of')
	vm.addCode(0, index++, function word() {
	    PARSEIMPL();
	})
	vm.addCode(0, index++, function include() {
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		let tempTib = vm.tib;
		let resumeToIn = vm.getToIn();
		vm.tib = '';
		const fileName = vm.readStringFromStack();
		return vm.loadFile(fileName).then((loadedFile) => {
		    const file = vm.filterWeirdSpacing(loadedFile);
		    const matchPattern = RegExp('include ' + fileName, 'gi');
		    const substrindex = tempTib.match(matchPattern).index + 'include '.length + fileName.length;
		    const resumeTib = String(file) + ' \n ' + tempTib.substring(resumeToIn);
		    for(let splitTib of resumeTib.split('\n')) {
			const result = vm.interpret(splitTib + ' \n ');
			if(result !== "ok" && result !== "compiled") {
			    vm.systemOut.log('Error in file read, got: ' + result);
			    break;
			}
		    }
		})
	    }.bind(this, vm);
	})
	vm.addCode(0, index++, function environmentq() {
	    const query = vm.readStringFromStack();
	    if(vm.environment.includes(query.toUpperCase())) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, 'environment?')
	vm.addCode(-1, index++, function bracketIf() {
	    if(vm.skip > 0 || vm.pop() === 0) {
		vm.skip++;
	    }
	}, '[if]')
	vm.addCode(-1, index++, function bracketElse() {
	    if(vm.skip === 1) {
		vm.skip--;
	    }
	}, '[else]')
	vm.addCode(-1, index++, function bracketThen() {
	    if(vm.skip > 0) {
		vm.skip--;
	    }
	}, '[then]')
	vm.addCode(0, index++, function _true() {
	    vm.pushTrue();
	}, 'true')
	vm.addCode(0, index++, function _false() {
	    vm.pushFalse();
	}, 'false')
	vm.addCode(0, index++, function depth() {
	    vm.push(vm.stack.depth());
	})
	vm.addCode(0, index++, function source() {
	    vm.push(vm.tibCopy);
	    vm.push(vm.tib.length);
	})
	vm.addCode(0, index++, function ne() {
	    if(vm.pop() !== vm.pop()) {
		vm.pushTrue();
	    }
	    else {
		vm.pushFalse();
	    }
	}, '<>')
	vm.addCode(0, index++, function or() {
	    vm.push(vm.pop() | vm.pop());
	})
	vm.addCode(0, index++, function xor() {
	    vm.push(vm.pop() ^ vm.pop());
	})
	vm.addCode(0, index++, function lshift() {
	    const b = vm.pop();
	    const a = vm.pop();
	    vm.push(a << b);
	})
	vm.addCode(0, index++, function rshift() {
	    const b = vm.pop();
	    const a = vm.pop();
	    vm.push(a >>> b);
	})
	vm.addCode(0, index++, function plus_store() {
	    const a = vm.pop();
	    vm.memory.setUint32(a, (vm.memory.getUint32(a) + vm.pop()));
	}, '+!')
	vm.addCode(0, index++, function qdup() {
	    const a = vm.pop();
	    vm.push(a);
	    if(a !== 0) {
		vm.push(a);
	    }
	}, '?dup')
	vm.addCode(0, index++, function negate() {
	    vm.push(0 - vm.pop());
	})
	vm.addCode(0, index++, function invert() {
	    vm.push(~vm.pop(true));
	})
	vm.addCode(0, index++, function and() {
	    vm.push(vm.pop() & vm.pop());
	})
	vm.addCode(0, index++, function star_slash() {
	    const c = vm.pop(true);
	    const b = vm.pop(true);
	    const a = vm.pop(true);
	    vm.push((a * b) / c);
	}, '*/')
	vm.addCode(0, index++, function mtimes() {
	    vm.stack.dpush(vm.pop(true) * vm.pop(true));
	}, 'm*')
	vm.addCode(0, index++, function umtimes() {
	    vm.stack.dpush(vm.pop() * vm.pop());
	}, 'um*')
	vm.addCode(0, index++, function twotimes() {
	    vm.push(vm.pop(true) << 1);
	}, '2*')
	vm.addCode(0, index++, function twodiv() {
	    vm.push(vm.pop(true) >> 1);
	}, '2/')
	vm.addCode(0, index++, function zeroeq() {
	    if(vm.pop() === 0) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '0=')
	vm.addCode(0, index++, function greater_zero() {
	    if(vm.pop(true) > 0) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '0>')
	vm.addCode(0, index++, function less_zero() {
	    if(vm.pop(true) < 0) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '0<')
	vm.addCode(0, index++, function neq_zero() {
	    if(vm.pop(true) !== 0) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, '0<>')
	vm.addCode(0, index++, function unsigned_dot() {
	    vm.systemOut.log(vm.stack.pop().toString(vm.getBase()));
	}, 'u.')
	vm.addCode(0, index++, function unsigned_less() {
	    const b = vm.pop();
	    const a = vm.pop();
	    if(a < b) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, 'u<')
	vm.addCode(0, index++, function unsigned_greater() {
	    const b = vm.pop();
	    const a = vm.pop();
	    if(a > b) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, 'u>')
	vm.addCode(0, index++, function min() {
	    vm.push(Math.min(vm.pop(true), vm.pop(true)));
	})
	vm.addCode(0, index++, function max() {
	    vm.push(Math.max(vm.pop(true), vm.pop(true)));
	})
	vm.addCode(0, index++, function twodrop() {
	    vm.pop();
	    vm.pop();
	}, '2drop')
	vm.addCode(0, index++, function twodup() {
	    vm.push(vm.stack.pick(1));
	    vm.push(vm.stack.pick(1));
	}, '2dup')
	vm.addCode(0, index++, function twoover() {
	    vm.push(vm.stack.pick(3));
	    vm.push(vm.stack.pick(3));
	}, '2over')
	vm.addCode(0, index++, function twoswap() {
	    vm.rpush(vm.pop());
	    vm.callCode(ROT);
	    vm.callCode(ROT);
	    vm.push(vm.rpop());
	    vm.callCode(ROT);
	    vm.callCode(ROT);
	}, '2swap')
	vm.addCode(0, index++, function twofetch() {
	    const addr = vm.stack.pop()
	    vm.stack.push(vm.memory.getUint32(addr + vm.cellSize));
	    vm.stack.push(vm.memory.getUint32(addr));
	}, '2@')
	vm.addCode(0, index++, function tworfetch() {
	    vm.push(vm.rstack.pick(2));
	    vm.push(vm.rstack.pick(1));
	}, '2r@')
	vm.addCode(0, index++, function twostore() {
	    const addr = vm.pop();
	    vm.memory.setUint32(addr, vm.pop());
	    vm.memory.setUint32(addr + vm.cellSize, vm.pop());
	}, '2!')
	vm.addCode(0, index++, function twotor() {
	    const a = vm.rpop(false, 'jump')
	    vm.rpush(vm.stack.pick(1));
	    vm.rpush(vm.stack.pick(0));
	    vm.rpush(a, 'jump');
	}, '2>r')
	vm.addCode(0, index++, function tworfrom() {
	    const c = vm.rpop(false, 'jump');
	    const b = vm.rpop();
	    const a = vm.rpop();
	    vm.push(a);
	    vm.push(b);
	    vm.rpush(c, 'jump');
	}, '2r>')
	vm.addCode(0, index++, function qdup() {
	    const a = vm.pop();
	    if(a !== 0) {
		vm.push(a);
	    }
	    vm.push(a);
	}, '?dup')
	vm.addCode(0, index++, function s_to_d() {
	    const a = vm.pop(true);
	    vm.stack.dpush(a);
	}, 's>d')
	const COMPILEC = index; 
	vm.addCode(0, index++, function compile_comma() {
	    vm.writeHere(vm.pop());
	}, 'compile,')
	vm.addCode(-1, index++, function postpone() {
	    vm.callCode(BL);
	    vm.callCode(PARSE);
	    vm.parseCallback2 = function () {
		const name = vm.readStringFromStack();
		const found = vm.findWordOrAbort(name);
		if(found.immediate) {
		    vm.writeHere(found.cfa);
		} else {
		    vm.writeHere(vm.findWord('LIT').cfa);
		    vm.writeHere(found.cfa);
		    vm.writeHere(vm.findWord('COMPILE,').cfa);
		}
	    }.bind(this, vm);
	})
	vm.addCode(0, index++, function state() {
	    vm.push(vm.stateAddr);
	})
	vm.addCode(0, index++, function tobody() {
	    vm.push(vm.pop() + vm.cellSize);
	}, '>body')
	vm.addCode(0, index++, function evaluate() {
	    const word = vm.readStringFromStack();
	    let tempTib = vm.tib;
	    let resumeToIn = vm.getToIn();
	    vm.tib = '';
	    const resumeTib = [word,  tempTib.substring(resumeToIn)];
	    for(let splitTib of resumeTib) {
		const result = vm.interpret(splitTib);
		if(result !== "ok" && result !== "compiled") {
		    vm.systemOut.log('Error in evaluate, got: ' + result);
		    break;
		}
	    }
	})
	vm.addCode(0, index++, function numstart() {
	}, '<#')
	vm.addCode(0, index++, function num() {
	    const d = BigInt(vm.stack.pop());
	    const base = BigInt(vm.getBase());
	    vm.pictureBuffer += d % base;
	    vm.stack.push(Number(d / base));
	}, '#')
	vm.addCode(0, index++, function nums() {
	    let d = BigInt(vm.stack.pop());
	    const base = BigInt(vm.getBase());
	    let i = 100;
	    while(d !== BigInt(0) && i > 0) {
		vm.pictureBuffer += d % base;
		d = d / base;
		vm.stack.push(Number(d));
		i--;
	    }
	}, '#S')
	vm.addCode(0, index++, function hold() {
	    const d = vm.stack.pop();
	    vm.pictureBuffer = String.fromCharCode(Number(d)) + vm.pictureBuffer;
	})
	vm.addCode(0, index++, function holds() {
	    const str = vm.readStringFromStack();
	    vm.pictureBuffer = str + vm.pictureBuffer;
	})
	vm.addCode(0, index++, function sign() {
	    const d = BigInt(vm.stack.pop());
	    if(d < 0) {
		vm.pictureBuffer = '-' + vm.pictureBuffer;
	    }
	})

	vm.addCode(0, index++, function numend() {
	    vm.writeToStringBuffer(vm.pictureBuffer);
	    vm.pictureBuffer = '';
	}, '#>')
	vm.addCode(0, index++, function sequal() {
	    const a = vm.readStringFromStack();
	    const b = vm.readStringFromStack();
	    if(a === b) {
		vm.pushTrue();
	    } else {
		vm.pushFalse();
	    }
	}, 's=')
	vm.addCode(0, index++, function tonumber() {
	    const a = vm.readStringFromStack();
	    let numAsString = '';
	    let i = -1;
	    for(let ch of a) {
		i++
		if(i === 0 && (ch === '+' || ch === '-')) {
		    numAsString += ch;
		} else if(!isNaN(Number(ch))) {
		    numAsString += ch;
		} else {
		    break;
		}
	    }
	    //console.log('number ' + numAsString);
	    //console.log(Number(numAsString));
	    if(numAsString.trim().length > 0 && !isNaN(Number(numAsString))) {
		vm.push(parseInt(numAsString, vm.getBase()));
	    }
	    if (a.substr(i).length > 0) {
		//console.log('substring ' + a.substr(i));
		vm.writeToStringBuffer(a.substr(i), false);
	    }
	}, '>number')
	vm.addCode(0, index++, function move() {
	    const a = vm.pop(true);
	    const dest = vm.pop();
	    const src = vm.pop();
	    if(a > 0) {
		for(let i = 0; i < a; i++) {
		    vm.memory.setByte(dest + i, vm.memory.getByte(src + i));
		}
	    }
	})
	vm.addCode(0, index++, function cmove() {
	    // TODO: fix propagation as given in Forth 83
	    const a = vm.pop(true);
	    const dest = vm.pop();
	    const src = vm.pop();
	    if(a > 0) {
		for(let i = 0; i < a; i++) {
		    vm.memory.setByte(dest + i, vm.memory.getByte(src + i));
		}
	    }
	})
	vm.addCode(0, index++, function fill() {
	    const ch = vm.pop();
	    const len = vm.pop(true);
	    const dest = vm.pop();
	    if(len > 0) {
		for(let i = 0; i < len; i++) {
		    vm.memory.setByte(dest + i, ch);
		}
	    }
	})
	vm.addCode(0, index++, function emit() {
	    vm.systemOut.log(String.fromCharCode(vm.pop()));
	})
	vm.addCode(0, index++, function space() {
	    vm.systemOut.log(' ');
	})
	vm.addCode(0, index++, function spaces() {
	    const a = vm.pop(true);
	    for(let i = 0; i < a; i++) {
		vm.systemOut.log(' ');
	    }
	})
	vm.addCode(0, index++, function find() {
	    vm.callCode(DUP);
	    const name = vm.readCountedString();
	    const found = vm.findWord(name);
	    if(found === 0) {
		vm.push(0);
	    } else {
		vm.callCode(DROP);
		vm.push(found.cfa);
		if(found.immediate === -1) {
		    vm.push(1);
		} else {
		    vm.push(-1);
		}
	    }
	})
	vm.addCode(0, index++, function js() {
	    const a = vm.readStringFromStack();
	    const jobject = eval(a);
	    vm.jpush(jobject);
	})
	vm.addCode(0, index++, function jcall() {
	    const a = vm.readStringFromStack();
	    const jfun = eval(a);
	    const arity = vm.pop();
	    let arglist = [];
	    const jthis = vm.jpop();
	    for(var i = 0; i < arity; i++) {
		const arg = vm.jpop();
		arglist.push(arg);
	    }
	    vm.jpush(jfun.apply(jthis, arglist));
	})
	vm.addCode(0, index++, function dotjs() {
	    let k = '';
	    let j = 0;
	    for(let i of vm.jstack) {
		k += i;
		j++;
		k += ' ';
	    }
	    vm.systemOut.log(k + ' <' + j + '>');
	}, '.js')
	vm.addCode(0, index++, function jdrop() {
	    vm.jpop();
	})
	vm.addCode(0, index++, function jswap() {
	    const b = vm.jpop();
	    const a = vm.jpop();
	    vm.jpush(b);
	    vm.jpush(a);
	})
	vm.addCode(0, index++, function jdup() {
	    vm.jpush(vm.jstack[vm.jstack.length - 1]);
	})
	vm.addCode(0, index++, function jrot() {
	    if(vm.jstack.length < 3) {
		vm.abort('STACK UNDERFLOW');
	    }
	    const c = vm.jpop();
	    const b = vm.jpop();
	    const a = vm.jpop();
	    vm.jpush(b);
	    vm.jpush(c);
	    vm.jpush(a);
	})
	vm.addCode(0, index++, function stojs() {
	    vm.jpush(vm.pop(true));
	}, 's>js')
	vm.addCode(0, index++, function fixtojs() {
	    const b = vm.pop();
	    const a = vm.pop();
	    vm.jpush(a / b);
	}, '/>js')
    }
}
