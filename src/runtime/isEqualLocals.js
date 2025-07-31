function isEqualLocals(a, b, isNamedExport) {
  if ((!a && b) || (a && !b)) {
    return false;
  }

  let property;

  for (property in a) {
    if (isNamedExport && property === "default") {
      continue;
    }

    if (a[property] !== b[property]) {
      return false;
    }
  }

  for (property in b) {
    if (isNamedExport && property === "default") {
      continue;
    }

    if (!a[property]) {
      return false;
    }
  }

  return true;
}

module.exports = isEqualLocals;
