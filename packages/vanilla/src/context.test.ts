import { createContext, useContext } from "./context";

describe("Context", () => {
  // TODO: investigate if this is the expected usage and outcome.
  it("should create context", () => {
    const context = createContext<string>();
    const value = "value";

    context.Provider(value, () => undefined);
    expect(useContext(context)).toEqual(undefined);

    context.Provider(value, () => {
      expect(useContext(context)).toEqual(value);
    });
    expect(useContext(context)).toEqual(undefined);
  });
});
