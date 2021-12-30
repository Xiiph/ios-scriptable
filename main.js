'use strict';

const normalize = (x
= "") => (x.normalize().toUpperCase());

const cmpStr = (a, b) => {
  return { 
    is: a == b,
    has: a.includes(b) && b != "", 
    begin: a.startsWith(b) && b != "",
  }
}

const cmpArr = (a, b) => {
  return { 
    is: a == b,
    has: a.includes(b),
  }
}

class Artist {
  constructor(data) {
    this.parse(data);
  }
  
  parse(data) {
     this.id = data.artistId;
     this.name = data.artistName;
  }
}

class Collection {
  constructor(data) {
    this.parse(data);
  }
  
  parse(data) {
     this.id = data.collectionId;
     this.name = data.collectionName;
  }
}

class Track {
  constructor(data) {
    this.parse(data);
  }
  
  parse(data) {
    if (!data)
      throw Error('invalid data');
      
    this.id = data.trackId;
    this.name = data.trackName;
    this.duration = data.trackTimeMillis;
    
    this.artist = new Artist(data);
    this.collection = new Collection(data);
    
    const featPattern = /[(\[](?:featuring\b|feat\b[.]?|ft\b[.]?)\s+([^\])]+)/i;

    const versionPattern = /[\[(](?!featuring\b|feat\b|ft\b)([^\])]+)/i;
    
// console.log(this.name.match(fullPattern));
//     let m = this.name.match(fullPattern);
//     this.title = m[1];
    let m;
    m = this.name.match(featPattern);
    this.featuringStr = m ? m[1] : "";
    
    if (m) {
      const featArtistPattern = /[^,&]+/gi;
      m = this.featuringStr.match(featArtistPattern);
      this.featuring = m.map(normalize);
    } else {
      this.featuring = [];
    }
    
    m = this.name.match(versionPattern);
    this.version = m ? m[1] : "";
    
    let matchIndex = this.name.search(/\[|\(/);
    this.title = (matchIndex != -1) ? this.name.slice(0, matchIndex).trim() : this.name;
      
    console.log([this.title, this.featuring, this.version]);

    this.normalized = { 
      name: normalize(this.name),
      title: normalize(this.title),
      artist: normalize(this.artist.name),
      collection: normalize(this.collection.name),
      version: normalize(this.version),
      featuring: this.featuring.map(x => normalize(x)),
    };
  }
  
  compare(needle) {
    const a = this.normalized;
    const b = needle.normalized;
    
    let result = {
      name: cmpStr(a.name, b.title),
      title: cmpStr(a.title, b.title),
      artist: cmpStr(a.artist, b.artist),
      featuring: cmpArr(a.featuring, b.featuring),
    };
    
    return result;
  }
}


class Needle {          
  constructor(str) {
    this.parse(str);
  }
  
  parse(str) {
    this.input = str;
    
    const fullPattern = /^"?("*)(?<title>.+)\1(?: by | - |\n)(?<fullArtist>.+)"?(?:\n|$)/i;
const featPattern = /(.+?)(?:\s+(?:featuring|feat[.]?|ft[.]?)\s+|$)/gi;

    let m = str.match(fullPattern);
    if (!m)
      throw Error("unable to extract artist from input");
    this.title = m.groups.title;
    this.full = m.groups.fullArtist;
    this.all = [];
    
    for (m of this.full.matchAll(featPattern)) {
       this.all.push(m[1]);
    }
    
    this.artist = this.all[0];
    this.featuring = this.all.slice(1);
    
    this.normalized = {
      artist: normalize(this.artist),
      title: normalize(this.title),
      full: normalize(this.full),
      featuring: this.featuring.map(normalize),
    };
  }
}

async function search(term, entity = "song", attribute = "", country = "se", limit = 1) {
    
    let url = `https://itunes.apple.com/search?country=${country}&media=music&entity=${entity}&attribute=${attribute}&term=${encodeURIComponent(term)}&limit=${limit}&explicit=yes`;

    const r = new Request(url);
//     console.log(await r);
    const json = await r.loadJSON();
//     console.log(json);
    return json;
//     const json = await r.loadJSON();
//     await console.log(r);
//     return json;
}
   
async function searchAll(term) {
    let result = await search(term);
    let tracks = parseSearchResult(result);
    
    console.log(result);
    return tracks;
}

function parseSearchResult(result) {
  const retval = [];
  let track;
  for (const v of result.results) {
    track = new Track(v);
    retval.push(track);
  }
  
  return retval;
}

function getNeedle(str) {
    const retval = {};
    const p1 = /^"?("*)(?<title>.+)\1(?: by | - |\n)(?<fullArtist>.+)"?(?:\n|$)/i;    
    const p2 = /^[\s_*"']+|[\s_*"']+$|\n+/i;
    const p3 = /(.+?)(?:\s+(?:featuring|feat[.]|ft[.])\s+|$)/i;
    const p4 = /\((?:featuring|feat[.]?|ft[.]?)\s*([^)]+)\)/i;    
    const p5 = /\[([^\]]+)\]/i;
    
    let m = str.match(p1);
//     console.log(m.groups.fullArtist);
}

// console.log(await searchAll("domino"));// 
// let tracks = await searchAll("feat radio edit");
// console.log(getNeedle("Domino by Jessie J feat Pitbull"));

let input = "Domino by Jessie J";
let tracks = await searchAll(input);
let needle = new Needle(input);

console.log(tracks && tracks[0].compare(needle));
// let url = 'https://itunes.apple.com/search?country=se&media=music&entity=song&term=Domino+Jessie+J&limit=25&explicit=yes';
// const r = new Request(url);
// await console.log(r);
// const json = await r.loadJSON();
// console.log(json);
