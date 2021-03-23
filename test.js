const VolatileStorage = require('./');
const delay = dt => new Promise(resolve => setTimeout(resolve, dt));

(async () => {

let storage, keys, keys0, len, len0;
let x, y, z, a, b;

storage = new VolatileStorage({capacity: 2, maxAge: 2000});
console.assert(storage.getCapacity() === 2, 'capacity');
console.assert(storage.getMaxAge() === 2000, 'max age');

await storage.setItem('x', 0);

len0 = await storage.length();
keys0 = await storage.keys();
await storage.setItem('x', 1);
len = await storage.length();
keys = await storage.keys();
console.assert(len0 === len, 'same length after adding existing key');
console.assert(JSON.stringify(keys0) === JSON.stringify(keys), 'same keys after adding existing key');

await storage.setItem('y', 'test');

len = await storage.length();
console.assert(len === 2, 'length after adding x, y');

x = await storage.getItem('x');
console.assert(x === 1, 'numeric value of x');

await storage.setItem('z', {a: [1, 2]});
await delay(100);

len = await storage.length();
console.assert(len === 2, 'length after overflow');

x = await storage.getItem('x');
console.assert(x === undefined, 'removed value of x');

y = await storage.getItem('y');
console.assert(y === 'test', 'string value of y');

z = await storage.getItem('z');
console.assert(JSON.stringify(z) === JSON.stringify({a: [1, 2]}), 'object value of z');

keys = await storage.keys();
console.assert(JSON.stringify(keys) === JSON.stringify(['y', 'z']), 'keys');

len = await storage.length();
console.assert(len === 2, 'length');

storage.removeItem('y');

len = await storage.length();
console.assert(len === 1, 'length');

keys = await storage.keys();
console.assert(JSON.stringify(keys) === JSON.stringify(['z']), 'keys after removing y');

storage.clear();

keys = await storage.keys();
console.assert(JSON.stringify(keys) === JSON.stringify([]), 'keys after clearing');

await storage.setItem('a', 'aaa');
await storage.setItem('b', 'bbb', {maxAge: 3000});

await delay(1000);

a = await storage.getItem('a');
b = await storage.getItem('b');
console.assert(a === 'aaa', 'value a unexpired');
console.assert(b === 'bbb', 'value b unexpired');

await delay(1500);

a = await storage.getItem('a');
b = await storage.getItem('b');
console.assert(a === undefined, 'value a expired');
console.assert(b === 'bbb', 'value b still unexpired');

await delay(1000);

a = await storage.getItem('a');
b = await storage.getItem('b');
console.assert(a === undefined && b === undefined, 'values a and b expired');

storage = new VolatileStorage();
console.assert(storage.getCapacity() === Infinity, 'infinite capacity');
console.assert(storage.getMaxAge() === Infinity, 'infinite max age');

})();
