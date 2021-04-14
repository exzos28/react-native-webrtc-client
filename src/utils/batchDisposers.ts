export default (...args: ((() => void) | void)[]) => () => {
  for (let i = args.length - 1; i >= 0; i--) {
    const arg = args[i];
    if (typeof arg === 'function') {
      arg();
    }
  }
};
