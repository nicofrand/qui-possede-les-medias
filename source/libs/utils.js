export const isEmpty = variable => (!variable || variable.length === 0 || Object.getOwnPropertyNames(variable).length === 0)

export const renderData = (data) => {
  if (data.length < 1) {
    return null
  }
  data = data.map(entity => entity.link
    ? `<a href="${entity.link}" rel="noopener noreferrer" target="_blank">${entity.name}</a>`
    : entity.name
  )
  if (data.length === 1) {
    return data.pop()
  }
  if (typeof Intl !== 'undefined' && Intl.ListFormat) {
    const lf = new Intl.ListFormat('fr')
    return lf.format(data)
  }
  const last = data.pop()
  return [
    data.join(', '),
    last
  ].join(' et ')
}

export const renderText = (data) => {
  const text = document.createElement('p')
  text.className = 'qui-possede-les-medias-text'
  if (data && data.length > 0) {
    text.innerHTML = `Ce média appartient à ${renderData(data)}.`
  } else {
    text.innerHTML = 'Aucune donnée d’appartenance concernant ce média n’est disponible.'
  }
  return text
}

export const removeAccents = str =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const removeTLD = str => {
  const splitDomain = str.split(".");
  if (splitDomain.length <= 1) {
    return str;
  }

  return splitDomain.slice(0, -1).join(".")
};

export const normalizeMediaName = name => {
  return removeAccents(
    removeTLD(
      name
        .toLowerCase()
        .replace(/(groupe|, |'|\+)/g, "")
        .replace("&", "et")
        .trim()
    )
  );
};

/**
 * @param {string} media
 */
export const mediaNameToWebsites = (media) => {
  const mediaName = normalizeMediaName(media);

  const possibleDomains = new Set([
    `${mediaName.replaceAll(" ", "")}`,
    `${mediaName.replaceAll(" ", "").replaceAll("l’", "")}`,
    `${mediaName.replaceAll(" ", "").replaceAll("l’", "l")}`,
    `${mediaName.replaceAll(" ", "-")}`,
    `${mediaName.replaceAll(" ", "-").replaceAll("l’", "")}`,
    `${mediaName.replaceAll(" ", "-").replaceAll("l’", "l")}`,
  ]);

  const allDomains = new Set(possibleDomains);

  // Remove dashes
  const withoutDashes = mediaName.replaceAll("-", "");
  if (withoutDashes !== mediaName) {
    const undashedPossibleDomains = mediaNameToWebsites(withoutDashes);
    for (const domain of undashedPossibleDomains) {
      allDomains.add(domain);
    }
  }

  // Remove common prefixes.
  if (mediaName.startsWith("le ") || mediaName.startsWith("la ")) {
    const unprefixedPossibleDomains = mediaNameToWebsites(mediaName.substring(3));
    for (const domain of unprefixedPossibleDomains) {
      allDomains.add(domain);
    }
  }

  // Remove common suffixes.
  const withoutSuffix = mediaName.replace(/(?:du|de la)?\s?(?:republicaine?|centre|libere|hebdo|info|play|litteraire|’)$/i, "").trim();
  if (withoutSuffix !== mediaName) {
    const unsuffixedPossibleDomains = mediaNameToWebsites(withoutSuffix);
    for (const domain of unsuffixedPossibleDomains) {
      allDomains.add(domain);
    }
  }

  // Try with acronyms
  const acronym = mediaName.split(" ").map(word => {
    if (word === "le" || word === "la") {
      return word;
    }

    return word[0];
  }).join("");
  if (acronym && acronym.length > 2 && acronym !== mediaName) {
    const acronymsPossibleDomains = mediaNameToWebsites(acronym);
    for (const domain of acronymsPossibleDomains) {
      allDomains.add(domain);
    }
  }

  return allDomains;
};
