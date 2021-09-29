extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

use js_sys::{ArrayBuffer, Uint8Array};

#[wasm_bindgen]
pub struct Scanner {
  bad_chars: [bool; 256],
  prev_char: u8,
}

const DASH: u8 = '-' as u8;

#[wasm_bindgen]
impl Scanner {
  #[wasm_bindgen(constructor)]
  pub fn new(stop_chars: js_sys::Uint8Array) -> Scanner {
      let mut bad_chars: [bool; 256] = [false; 256];
      for ix in 0..stop_chars.length() as u32 {
        let stop_char_code: u8 = stop_chars.get_index(ix);
        bad_chars[stop_char_code as usize] = true;
      }
      Scanner {bad_chars: bad_chars, prev_char: 0xFF}
  }

  pub fn get_flag(&self, ix: usize) -> bool {
      self.bad_chars[ix]
  }

  pub fn suspicious(&mut self, bytes: js_sys::Uint8Array) -> bool {
    for ix in 0..bytes.length() as u32 {
      let byte = bytes.get_index(ix);
      if self.bad_chars[byte as usize] {
        return true;
      }
      if byte == DASH && self.prev_char == DASH {
        return true;
      }
      self.prev_char = byte;
    }

    false
  }
}
