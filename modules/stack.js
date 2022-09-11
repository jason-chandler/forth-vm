export class Stack {
    vm;
    memory;
    s0; // below bottom of stack
    sp; // stack pointer
    cellSize;
    control_indices;

    constructor(vm, s0) {
	this.vm = vm;
	this.memory = vm.memory;
	this.s0 = s0;

	this.cellSize = this.vm.cellSize;
	this.sp = this.s0 - this.cellSize; 
	this.stack_limit = 200 * this.cellSize;
	this.control_indices = [];
    }

    empty() {
	return this.sp === this.s0 - this.cellSize;
    }

    depth() {
	return (this.s0 - this.cellSize - this.sp) / this.cellSize;
    }

    push(val, label) {
	if(this.s0 - this.sp >= this.stack_limit) {
	    this.vm.systemOut.log("STACK OVERFLOW: " + val);
	    this.vm.abort("STACK OVERFLOW: " + val);
	} else {
	    this.memory.setUint32(this.sp, val);
	    this.sp -= this.cellSize;
	    this.control_indices.push({ label: label });
	}
    }

    dpush(val, label) {
	const low = this.sp;
	this.push(0, label);
	const high = this.sp;
	this.push(0, label);
	this.vm.memory.view.setBigInt64(high, BigInt(val));
    }

    dpop(signed) {
	let a;
	if(signed) {
	    a = this.vm.memory.view.getBigInt64(this.sp + this.vm.cellSize);
	} else {
	    a = this.vm.memory.view.getBigUint64(this.sp + this.vm.cellSize);
	}
	this.pop();
	this.pop();
	return a;
    }

    pop(signed, label, skipLeave) {
	let leaveStack = [];
	if(this.empty()) {
	    this.vm.systemOut.log("STACK UNDERFLOW");
	    this.vm.abort("STACK UNDERFLOW: ");
	} else {
	    if(skipLeave) {
		for(var i = this.depth() - 1; i >= 0 && this.peekControl() === 'leave-sys'; i--) {
		    leaveStack.push(this.pop(false, 'leave-sys'));
		}
	    }

	    let ctrl = this.control_indices.pop();
	    if(ctrl.label === label)
	    {
		this.sp += this.cellSize;
		let val;
		if(signed) {
		    val = this.memory.getInt32(this.sp);
		} else {
		    val = this.memory.getUint32(this.sp);
		}
		while(skipLeave && leaveStack.length !== 0) {
		    this.push(leaveStack.pop(), 'leave-sys');
		}
		return val;
	    } else {
		throw('Control flow mismatch, ' + ' ' + ctrl.label + ' was found while seeking ' + label);
	    }
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
	if(index < this.depth()) {
	    return this.memory.getUint32(this.sp + (this.cellSize * (index + 1)));
	} else {
	    this.vm.abort('STACK UNDERFLOW');
	}
    }

    loopDepth() {
	let depth = 0;
	for(let ctrl of this.control_indices) {
	    if(ctrl.label === 'loop-sys-index') {
		depth++;
	    }
	}
	return depth;
    }

    pickControl(index, label) {
	if(index < this.control_indices.length) {
	    if(label === this.control_indices[index].label) {
		return this.memory.getUint32(this.s0 - (this.cellSize * (index + 1)));
	    } else {
		this.vm.abort('Control flow mismatch, ' + index + ' ' + this.control_indices[index].label + ' was found while seeking ' + index + ' ' + label);
	    }
	} else {
	    this.vm.abort('CONTROL STACK UNDERFLOW');
	}
    }

    clear() {
	while(this.sp !== (this.s0 - this.cellSize)) {
	    this.vm.memory.setUint32(this.sp, 0);
	    this.sp += this.cellSize;
	}
	this.control_indices = [];
    }

    print() {
	let buf = [];
	let count = 0;
	for(var i = this.s0 - this.cellSize; i !== this.sp; i -= this.cellSize) {
	    buf.push(this.vm.memory.getUint32(i));
	    count++;
	}
	this.vm.systemOut.log('<' + count + '> ' + buf);
    }

    toJSArray() {
	let buf = [];
	let count = 0;
	for(var i = this.s0 - this.cellSize; i !== this.sp; i -= this.cellSize) {
	    buf.push(this.vm.memory.getUint32(i));
	    count++;
	}
	return buf;
    }

}
