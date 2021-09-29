'use strict';

class Scanner {
  constructor(stopChars) {
    this.stopChars = [];
    for (const c of stopChars) {
      this.stopChars[c.charCodeAt(0)] = true;
    }
  }

  suspicious(buffer) {
    for (let ix = 0; ix < buffer.length; i++) {
      if (this.stopChars[ix]) {
        return true;
      }
    }
    return false;
  }
}

module.exports = Scanner;
