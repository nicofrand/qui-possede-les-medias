# <img src="source/icon.png" width="45" align="left"> Qui possède les médias ?

> Qui possède les grands médias que nous lisons ?

[![Build Status](https://github.com/DesignandHuman/qui-possede-les-medias/workflows/Node%20CI/badge.svg)](https://github.com/DesignandHuman/qui-possede-les-medias/actions)

## À propos

_Apprenons à faire connaissance avec les actionnaires majoritaires des grands médias que nous lisons quotidiennement._

📰 Chaque jour nous lisons la presse en ligne. Via un lien, un tweet, un message publié sur Facebook. Tout cela nous influence et nous fait comprendre le monde avec un certain regard.

🔍 Mais savons-nous à qui appartiennent les médias que nous lisons ? Moi, je ne le savais pas, c'est pourquoi j’ai créé ce plugin.

💰 Une fois installé, ce plugin permet de savoir qui est l’actionnaire majoritaire qui possède financièrement le média en question.

👀 Sur chaque nom, il y a un lien vers la page Wikipédia de l’actionnaire afin de mieux le connaître, lorsque disponible.


## Installation

[link-cws]: https://chrome.google.com/webstore/detail/qui-poss%C3%A8de-les-m%C3%A9dias/njndbdlccjiaaockbcambicedfgkhnmb "Version published on Chrome Web Store"
[link-amo]: https://addons.mozilla.org/firefox/addon/qui-possède-les-médias/ "Version published on Mozilla Add-ons"

- [**Chrome** extension][link-cws] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/njndbdlccjiaaockbcambicedfgkhnmb.svg">][link-cws]
- [**Firefox** add-on][link-amo] [<img valign="middle" src="https://img.shields.io/amo/v/qui-possede-les-medias.svg">][link-amo]
- **Opera** extension: Use [this Opera extension](https://addons.opera.com/en/extensions/details/download-chrome-extension-9/) to install the Chrome version.


## Contribution

### Données

Pour modifier ou ajouter des nouvelles données au plugin, deux fichier [CSV](https://fr.wikipedia.org/wiki/Comma-separated_values) et [TSV]() sont disponibles.
Ces fichiers sont éditables via un logiciel tableur.

* [**`data/relations_medias_francais.tsv`**](data/relations_medias_francais.tsv) est directement extrait du [dépôt du Monde Diplomatique](https://github.com/mdiplo/Medias_francais/blob/master/relations_medias_francais.tsv) et liste les relations entre les groupes médiatiques et leurs propriétaires.

* [**`data/entities.csv`**](data/entities.csv) liste des propriétaires ou entités, avec leur type et un lien pour en savoir plus.
  Chaque propriétaire est listé avec son type (`holder` ou `group`) et un lien pour en savoir plus.

  ```csv
  nom,type,lien
  ```

TODO: extraire le type directement depuis le fichier *medias_francais.tsv* du dépôt du Monde diplomatique, et construire les liens automatiquement vers Wikipedia et DuckDuckGo.

Pour soumettre des modifications :
 * [Télécharger le ou les fichiers dans le répertoire `data/`](https://github.com/DesignandHuman/qui-possede-les-medias/upload/master/data)
 * Soumettre le _commit_
 * Soumettre la _Pull request_

### Code

[Node.js](https://nodejs.org/) version >= 12 is required.

1. Clone locally the repository.
   ```bash
   git clone https://github.com/DesignandHuman/qui-possede-les-medias.git
   cd qui-possede-les-medias
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Start development server.
   ```bash
   npm run start
   ```


## Sources

* [Le Monde diplomatique/Medias_francais](https://github.com/mdiplo/Medias_francais)


## License

MIT © Design & Human/[Geoffrey Dorne](https://geoffreydorne.com) & [Léo Colombaro](https://colombaro.fr)
