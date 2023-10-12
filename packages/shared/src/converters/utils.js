export const handleSubtypeNS = (subtype) => {
  const subtypes = subtype.split(":");
  return subtypes.length > 1
    ? { "subtype-ns": subtypes[0], subtype: subtypes[1] }
    : { subtype };
};

export const pushToArray = (array, value) => (() => array)(array.push(value));
