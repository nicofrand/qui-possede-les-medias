import 'webext-dynamic-content-scripts';
import localforage from 'localforage';
import { isEmpty, removeTLD, mediaNameToWebsites } from './libs/utils';
import { renderBadge } from './libs/browser';
import { mediaRelationsDataToMap } from './libs/parser';
import optionsStorage from './libs/storage';

localforage.setDriver([localforage.INDEXEDDB, localforage.WEBSQL])

const sitesStore = localforage.createInstance({name: "sites"})
const entitiesStore = localforage.createInstance({name: "entities"})

browser.runtime.onInstalled.addListener(async event => {
  if (event.reason !== 'install') {
    await sitesStore.clear();
  }

  const { default: relations } = await import(/* webpackChunkName: "relations" */ '../data/relations_medias_francais.tsv');
  const { default: entities } = await import(/* webpackChunkName: "entities" */ '../data/entities.csv');

  const mediaToOwners = mediaRelationsDataToMap(relations);

  // Try to build a list of possible websites given a media.
  const websitesToOwners = new Map();
  for (const [media, owners] of mediaToOwners) {
    mediaNameToWebsites(media).forEach(domain => {
      websitesToOwners.set(domain, owners);
    });
  }

  for (const [domain, owners] of websitesToOwners) {
    await sitesStore.setItem(domain, Array.from(owners));
  }

  for (const item of entities) {
    await entitiesStore.setItem(item.name, item);
  }
});

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
