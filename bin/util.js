function toArray(value) {
  return (!Array.isArray(value) && value) ? [value] : value || [];
}

function fetchTags(template) {
  const info = {
    input: [],
  };

  /* istanbul ignore else */
  if (template.indexOf('{{') === -1
    && template.indexOf('}}') === -1
    && template.indexOf('{%') === -1
    && template.indexOf('%}') === -1
  ) {
    return info;
  }

  let matches;

  /* istanbul ignore else */
  if (template.indexOf('{{#') !== -1 || template.indexOf('{{^') !== -1 || template.indexOf('{%') !== -1) {
    do {
      matches = template.match(/\{%-?\s*(if|for|case|unless)\s+([^#{}/]+)\s*%\}([\s\S]+?)\{%-?\s*end\1\s*%\}/)
        || template.match(/\{\{([#^](if|each|with|unless))\s+([^#{}/]+)\}\}([\s\S]+?)\{\{\/\2\}\}/)
        || template.match(/\{\{([#^]([^#{}/]+))\}\}([\s\S]+?)\{\{\/\2\}\}/);

      /* istanbul ignore else */
      if (matches) {
        let fixedKey = (matches.length === 4 ? matches[2] : matches[3]).trim();

        /* istanbul ignore else */
        if (matches[1] === 'if' || matches[1] === 'case' || matches[1] === 'unless') {
          fixedKey = fixedKey.split(/\s+/)[0];
        }

        /* istanbul ignore else */
        if (matches[1] === 'for') {
          fixedKey = fixedKey.trim().split(/\sin\s/).pop();
        }

        const fixedBody = matches.length === 4 ? matches[3] : matches[4];

        template = template.replace(matches[0], '');

        /* istanbul ignore else */
        if (!info.input.find(x => x.key === fixedKey)) {
          const fixedItem = {
            key: fixedKey,
            ...fetchTags(fixedBody),
          };

          /* istanbul ignore else */
          if (matches[1] === 'for' || matches[2] === 'each') {
            fixedItem.repeat = true;

            /* istanbul ignore else */
            if (!Array.isArray(fixedItem.input[0])) {
              fixedItem.input = [fixedItem.input];
            }
          }

          /* istanbul ignore else */
          if (matches[1].charAt() === '^') {
            fixedItem.falsy = true;
          }

          info.input.push(fixedItem);
        }
      }
    } while (matches);
  }

  do {
    matches = template.match(/\{\{([^#{}/]+)\}\}/);

    /* istanbul ignore else */
    if (matches) {
      template = template.replace(matches[0], '');

      const fixedKey = matches[1].replace(/^[#^]|\|.*$/g, '').trim();

      /* istanbul ignore else */
      if (!info.input.find(x => x.key === fixedKey)) {
        info.input.push({
          key: fixedKey,
          input: [],
        });
      }
    }
  } while (matches);

  return info;
}

module.exports = {
  toArray,
  fetchTags,
};
