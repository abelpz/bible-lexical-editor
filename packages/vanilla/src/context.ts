export function createContext() {
  let contextValue = undefined;

  function Provider(value, callback) {
    let currentValue = contextValue;
    contextValue = value;
    callback();
    contextValue = currentValue;
  }

  function Consumer() {
    return contextValue;
  }

  return {
    Provider,
    Consumer,
  };
}

export function useContext(ctxRef) {
  return ctxRef.Consumer();
}
