// 1. pushAndPop
// Adds `toAdd` items into `list`, then removes any items that match `toRemove`.
// Returns the array of removed items.
export function pushAndPop<T>(
    list: T[],
    toAdd: T[],
    toRemove: T[]
  ): T[] {
    // 1) Add
    list.push(...toAdd);
  
    // 2) Remove matching elements one by one
    const removed: T[] = [];
    toRemove.forEach(item => {
      let idx: number;
      // repeatedly remove all occurrences
      while ((idx = list.indexOf(item)) !== -1) {
        removed.push(...list.splice(idx, 1));
      }
    });
  
    return removed;
  }
  
//   // Example:
//   const fruits = ["apple", "banana"];
//   const popped1 = pushAndPop(fruits, ["cherry", "apple"], ["apple", "pear"]);
//   console.log(fruits);  // ["banana", "cherry"]
//   console.log(popped1); // ["apple", "apple"]
  
  
  
  
  // 2. upsertWithCount
  // Keeps track of counts for each distinct value.
  // The list is an array of entries { value, count }.
  type CountEntry<T> = { value: T; count: number };
  
  export function upsertWithCount<T>(
    list: CountEntry<T>[],
    value: T,
    delta: number = 1
  ): void {
    const entry = list.find(e => e.value === value);
    if (entry) {
      // modify existing count
      entry.count += delta;
    } else {
      // add new entry
      list.push({ value, count: delta });
    }
  }
  
  // Helper to get current count (or zero if missing)
  export function getCount<T>(
    list: CountEntry<T>[],
    value: T
  ): number {
    const entry = list.find(e => e.value === value);
    return entry ? entry.count : 0;
  }
  
//   // Example:
//   const cart: CountEntry<string>[] = [];
//   upsertWithCount(cart, "apple");       // add 1 apple
//   upsertWithCount(cart, "banana", 2);   // add 2 bananas
//   upsertWithCount(cart, "apple", 3);     // now 4 apples total
  
//   console.log(cart);
//   // [ { value: "apple",  count: 4 },
//   //   { value: "banana", count: 2 } ]
  
//   console.log(getCount(cart, "apple"));  // 4
//   console.log(getCount(cart, "pear"));   // 0
  