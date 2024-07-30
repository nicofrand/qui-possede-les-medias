import 'webext-dynamic-content-scripts'
import localforage from 'localforage'
import { isEmpty, removeAccents, removeTLD } from './libs/utils'
import { renderBadge } from './libs/browser'
import optionsStorage from './libs/storage'

localforage.setDriver([localforage.INDEXEDDB, localforage.WEBSQL])

const sitesStore = localforage.createInstance({name: "sites"})
const entitiesStore = localforage.createInstance({name: "entities"})

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
}

browser.runtime.onInstalled.addListener(async event => {
  if (event.reason !== 'install') {
    await sitesStore.clear();
  }

  const { default: relations } = await import(/* webpackChunkName: "relations" */ '../data/relations_medias_francais.tsv');
  const { default: entities } = await import(/* webpackChunkName: "entities" */ '../data/entities.csv');

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
  const mediaToOwners = new Map([...reduceOwners(mediaGroupsToOwners).entries()].sort());

  // Try to build a list of possible websites given a media.
  for (const [media, owners] of mediaToOwners) {
    const mediaName = removeAccents(
        removeTLD(
          media
            .toLowerCase()
            .replace(/(groupe|, |'|\+)/g, "")
            .trim()
        )
    );

    // What to do with "Canal +"?

    const ownersList = Array.from(owners);

    const possibleDomains = new Set([
      `${mediaName.replaceAll(" ", "")}`,
      `${mediaName.replaceAll(" ", "").replaceAll("l’", "")}`,
      `${mediaName.replaceAll(" ", "").replaceAll("l’", "l")}`,
      `${mediaName.replaceAll(" ", "-")}`,
      `${mediaName.replaceAll(" ", "-").replaceAll("l’", "")}`,
      `${mediaName.replaceAll(" ", "-").replaceAll("l’", "l")}`,
    ]);

    for (const domain of possibleDomains) {
      console.log(domain);
      await sitesStore.setItem(domain, ownersList);

      // Ex: tf1 -> tf1info.fr
      await sitesStore.setItem(`${domain}info`, ownersList);
    }

    for (const item of entities) {
      await entitiesStore.setItem(item.name, item);
    }
  }
})

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (!message || !message.action) {
    return
  }

  const hostWithoutTld = removeTLD(message.hostname);
  const site = await sitesStore.getItem(hostWithoutTld);
  if (isEmpty(site)) {
    return;
  }

  if (message.action === 'content') {
    await renderBadge(site.length.toString() || '', sender.tab.id)

    const { enableContent } = await optionsStorage.getAll();

    if (!enableContent) {
      return
    }
  }

  return Promise.all(site.map(async name => ((await entitiesStore.getItem(name)) || {name})))
})
