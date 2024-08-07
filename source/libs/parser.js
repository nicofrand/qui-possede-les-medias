import { mediaNameToWebsites } from './utils';

/**
 * @param {Map<string, Set<string>} mediaGroupsToOwners
 * @returns Map<string, Set<string>>
 */
const reduceOwners = (mediaGroupsToOwners) => {
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
const mediaRelationsDataToMap = (relations) => {
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

/**
 * @param {object[]} relations
 * @returns Map<string, Set<string>>
 */
export const mediaRelationsToWebsitesMapping = (relations) => {
  const mediaToOwners = mediaRelationsDataToMap(relations);

  // Try to build a list of possible websites given a media.
  const websitesToOwners = new Map();

  // Add media group website to owner.
  websitesToOwners.set("mycanal", mediaToOwners.get("Canal +"));
  websitesToOwners.set("nouvelobs", mediaToOwners.get("L’Obs"));
  websitesToOwners.set("lesinrocks", mediaToOwners.get("Les Inrockuptibles"));
  websitesToOwners.set("nova", mediaToOwners.get("Radio Nova"));
  websitesToOwners.set("lejsl", mediaToOwners.get("Le Journal de Saône-et-Loire"));
  websitesToOwners.set("jhm", mediaToOwners.get("Le Journal de la Haute-Marne"));
  websitesToOwners.set("larep", mediaToOwners.get("La République du Centre"));
  websitesToOwners.set("lest-eclair", mediaToOwners.get("L’Est-éclair - Libération Champagne"));
  websitesToOwners.set("lardennais", mediaToOwners.get("L’Union - L’Ardennais"));
  websitesToOwners.set("lunion", mediaToOwners.get("L’Union - L’Ardennais"));
  websitesToOwners.set("nrpyrenees", mediaToOwners.get("La Nouvelle République des Pyrénées"));
  websitesToOwners.set("6play", mediaToOwners.get("M6"));
  websitesToOwners.set("rmcbfmplay", mediaToOwners.get("RMC"));
  websitesToOwners.set("francetvinfo", mediaToOwners.get("France Info"));
  websitesToOwners.set("mc-doualiya", mediaToOwners.get("Monte Carlo Doualiya"));
  websitesToOwners.set("lcp", mediaToOwners.get("La Chaîne parlementaire"));

  // TODO: check why automatic fails.
  websitesToOwners.set("lanouvellerepublique", mediaToOwners.get("Nouvelle République du Centre"));
  websitesToOwners.set("nrj-play", mediaToOwners.get("NRJ"));
  websitesToOwners.set("aujourdhui-en-france", mediaToOwners.get("Aujourd’hui en France")); // "’" in middle is not recognized

  // Unknown from CSV file
  websitesToOwners.set("larecherche", mediaToOwners.get("Claude Perdriel"));
  //websitesToOwners.set("yahoo", mediaToOwners.get("Apollo"));
  //websitesToOwners.set("theconversation", mediaToOwners.get("The Conversation Trust"));

  for (const [media, owners] of mediaToOwners) {
    mediaNameToWebsites(media).forEach(domain => {
      websitesToOwners.set(domain, owners);
    });
  }

  return websitesToOwners;
};
