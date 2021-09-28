extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;
//use unicode_segmentation::UnicodeSegmentation;
//use js_sys::{JsString};


#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u16(a: u16);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

//      This approach can not use starts with / ends with dash '-'
//      Did not inclue '+' since commonly used for phone number with country code
//      The algorithm looks for specific stop characters as well as double dashes "--"
#[wasm_bindgen]
pub fn is_suspicious(s: &str) -> bool {
    let mut ans = false;
    let mut previous_dash = false;
    let stop_chars: [char; 11] = [';', '$', '\'',  '<', '/', '\\', '&', '#', '%', '>', '='] ;
    let char_vec: Vec<char> = s.chars().collect();
    'outer: for c in char_vec {
        '_inner: for j in 0..=10 {
            if c == stop_chars[j] {
                ans = true;
                break 'outer;
            }
        }
        if c=='-' && previous_dash == true {
            ans = true;
            break 'outer;
        }
        // Check to look for double dash '--' the string
        if c=='-' {
            previous_dash = true;
        } else {
            previous_dash = false;
        }
    }
    return ans;
}

// trying to get this to work https://rustwasm.github.io/docs/wasm-bindgen/reference/types/str.html
// but it looks like is_suspicious (regular) is faster than is_suspicious_2 !!
#[wasm_bindgen]
pub fn is_suspicious_2(js_str: &js_sys::JsString) -> bool {  // this is way slower than is_suspicious so still needs some work
    let mut ans = false;
    let mut previous_dash = false;
    //let stop_strs: [&str; 11] = [";", "$", "\'",  "<", "/", "\\", "&", "#", "%", ">", "="] ;
    let stop_u16: [u16; 11] = [59, 36, 39, 60, 47, 92, 38, 35, 37, 62, 61];
    //let mut char_count :u16 = 0;
    'outer: for c in js_str.iter() {   // I think the problem here is I can not break out of the iterator
        '_inner: for j in 0..=10 {
            if c == stop_u16[j] {
                ans = true;
                break 'outer;  // this is actually working because I put in counters
            }
        }
        // the UTF-16 code for '-' is 45
        if c==45 && previous_dash == true {
            ans = true;
            break 'outer;
        }
        // Check to look for double dash '--' the string
        if c==45 {
            previous_dash = true;
        } else {
            previous_dash = false;
        }
    }
    return ans;
}

/// Here is a duck-typed interface for any JavaScript object that has a `quack`
/// method.
///
/// Note that any attempts to check if an object is a `Quacks` with
/// `JsCast::is_instance_of` (i.e. the `instanceof` operator) will fail because
/// there is no JS class named `Quacks`.
// #[wasm_bindgen]
// extern "C" {
//     pub type Quacks;
//
//     #[wasm_bindgen(structural, method)]
//     pub fn quack(this: &Quacks) -> String;
// }
//
// /// Next, we can export a function that takes any object that quacks:
// #[wasm_bindgen]
// pub fn make_em_quack_to_this(duck: &Quacks) -> String {
//     let _s = duck.quack();
//     // ...
//     _s
// }


use js_sys::{ArrayBuffer, Uint8Array};
//use crate::wasm_bindgen::JsCast;

#[wasm_bindgen]
extern "C" {
  pub type Buffer;

  #[wasm_bindgen(method, getter)]
  fn buffer(this: &Buffer) -> ArrayBuffer;

  #[wasm_bindgen(method, getter, js_name = byteOffset)]
  fn byte_offset(this: &Buffer) -> u32;

  #[wasm_bindgen(method, getter)]
  fn length(this: &Buffer) -> u32;
}

#[wasm_bindgen]
pub fn len(buffer: &Buffer) -> u32 {
  //let ab: js_sys::ArrayBuffer = buffer.buffer();
  let abp = buffer.buffer();

  //unsafe {
  //  let p = std::slice::from_raw_parts(&abp, buffer.length() as usize);
  //  return *p.offset(0);
  //}
  //use crate::wasm_bindgen::JsCast;
  //let p: &u8 = abp.unchecked_ref::<u8>();
  //let mut i: u32 = 0;
  //for c in abp.iter() {
  //  i = i + 1;
  //}
  //return i;

  abp.byte_length()
  //let a = &ab as [u8];
  //let array = &mut ab.value_of();
  //let array = &mut ab.unchecked_into::<[u8]>();
  //return array[1];

  //buffer.length()
}

#[wasm_bindgen]
pub fn ix(buffer: &Buffer, ix: usize) -> u8 {
  let abp = buffer.buffer();
  // let vec: Vec<u8> =
  let ui8: Uint8Array = Uint8Array::new_with_byte_offset_and_length(
    &buffer.buffer(),
    buffer.byte_offset(),
    buffer.length(),
  );

  ui8.get_index(ix as u32)
  //vec[ix]
  //vec.get_index(ix)
}


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
      Scanner {bad_chars: bad_chars, prev_char: 0xFF;}
  }

  pub fn get_flag(&self, ix: usize) -> bool {
      self.bad_chars[ix]
  }

  pub fn has_suspicious(&mut self, bytes: js_sys::Uint8Array) -> bool {
    for ix in 0..bytes.length() as u32 {
      let byte = bytes.get_index(ix);
      if self.bad_chars[byte as usize] {
        return true;
      }
      if (byte == DASH && self.prev_char == DASH) {
        return true;
      }
      self.prev_char = byte;
    }

    false
  }
}

// need to think about about some more but but looks like should work for any utf-16 since all stop chars are ascii - don't need grapheme in s.graphemes(true) {
