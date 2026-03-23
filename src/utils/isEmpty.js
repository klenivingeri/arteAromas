export const isEmpty = (value) => {
  // null ou undefined
  if (value == null) return true;

  if (value == 0) return true;

  // string ou array
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length == 0;
  }

  // objeto
  if (typeof value === "object") {
    return Object.keys(value).length == 0;
  }

  return false; // outros tipos (número, boolean, etc.)
};