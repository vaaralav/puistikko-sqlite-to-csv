#!/usr/bin/env node
'use strict';
const meow = require('meow');
const main = require('./index.js');

const cli = meow(`
  Käyttö $ ./cli.js <database_file> <uuden_csv_tiedoston_nimi> <sarjan_vartiot_csv> <sarjan_koodi> <radat>

  Esimerkki: $ ./cli.js testi.db HA_vartiot.csv HA ABC
  Esimerkkikomento hakee vartioiden numerot HA_vartiot.csv-tiedostosta, hakee tulokset HA-sarjalle radoille HA-A, HA-B ja HA-C.

  - database_file: SQLite-tietokantatiedoston nimi
  - sarjan_vartiot_csv: Sarjan kaikkien vartioiden numerot jokainen omalla rivillään
  - sarjan_koodi: HA/RU/SI/PU/VP
  - radat: Merkkijono, jonka jokainen merkki on radan tarkenne. Esim. ABC
`);

(async function() {
  try {
    if (cli.input.length !== 5) {
      throw 'Parametreja on väärä määrä!';
    }
    await main(...cli.input);
  } catch (err) {
    console.log(err);
    console.log(cli.help);
    process.exit(1);
  }
})();
