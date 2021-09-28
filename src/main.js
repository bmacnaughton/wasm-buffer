const { is_suspicious } = require('../pkg/simple_wasm')

const run = async () => {
  const total = 45

  console.log('Starting!');
/*
  console.time('wasm-time');
  console.timeEnd('wasm-time');

  console.time('js-time');
  console.timeEnd('js-time');
}
*/
  let data = {
    id: 1,
    first_name: "Sco'rpia",
    last_name: "Chiclitz"
  };

  console.log(is_suspicious(JSON.stringify(data)));  
}

run();
