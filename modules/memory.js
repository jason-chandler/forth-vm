export class Memory {
    buffer;
    memorySize;
    view;

    constructor() {
	this.memorySize = 65536 * 4;
	this.buffer = new ArrayBuffer(this.memorySize);
	this.view = new DataView(this.buffer);
    }

    getUint32(offset) {
	return this.view.getUint32(offset);
    }

    setUint32(offset, value) {
	this.view.setUint32(offset, value);
    }

    getInt32(offset) {
	return this.view.getInt32(offset);
    }

    setInt32(offset, value) {
	this.view.setInt32(offset, value);
    }

    getByte(offset) {
	return this.view.getUint8(offset);
    }

    setByte(offset, value) {
	this.view.setUint8(offset, value);
    }
}

