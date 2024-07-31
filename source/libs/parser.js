/**
 * @param {Map<string, Set<string>} mediaGroupsToOwners
 * @returns Map<string, Set<string>>
 */
export const reduceOwners = (mediaGroupsToOwners) => {
  let modified = false;

  // Some owners are holdings, also owned by other holdings or owners.
  for (const [mediaGroup, owners] of mediaGroupsToOwners) {
    for (const owner of owners) {
      if (owner !== mediaGroup && mediaGroupsToOwners.has(owner)) {
        const ownersArray = Array.from(owners);
        const parents = Array.from(mediaGroupsToOwners.get(owner)).filter(itm => itm !== mediaGroup);

        // Remove the current owner & insert parents
        ownersArray.splice(ownersArray.indexOf(owner), 1, ...parents);

        mediaGroupsToOwners.set(mediaGroup, new Set(ownersArray));

        modified = true;
      }
    }
  }

  if (modified) {
    return reduceOwners(mediaGroupsToOwners);
  }

  return mediaGroupsToOwners;
};

/**
 * @param {object[]} relations
 * @returns Map<string, Set<string>>
 */
export const mediaRelationsDataToMap = (relations) => {
  // First, create a map of targets (media groups) to origins (owners).
  const mediaGroupsToOwners = new Map();
  for (const item of relations) {
    if (!item.hasOwnProperty("cible") || !item.hasOwnProperty("origine")) {
      continue;
    }

    if (item.cible === item.origine) {
      continue;
    }

    if (!mediaGroupsToOwners.has(item.cible)) {
      mediaGroupsToOwners.set(item.cible, new Set());
    }

    mediaGroupsToOwners.get(item.cible).add(item.origine);
  }

  // Reduce map and sort it.
  return new Map([...reduceOwners(mediaGroupsToOwners).entries()].sort());
};
