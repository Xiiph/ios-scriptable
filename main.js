'use strict';

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
    
    const featPattern = /[(\[](?:featuring|feat[.]?|ft[.]?)\s+([^\])]+)/i;

    const fullPattern = /(.+)\s?(?:\[|\()?/i;

    const versionPattern = /[\[(](?!featuring\b|feat\b|ft\b)([^\])]+)/i;
    
// console.log(this.name.match(fullPattern));
//     let m = this.name.match(fullPattern);
//     this.title = m[1];
    let m;
    m = this.name.match(featPattern);
    this.featuring = m ? m[1] : "";
    
    m = this.name.match(versionPattern);
    this.version = m ? m[1] : "";
    
    let matchIndex = this.name.search(/\[|\(/);
    this.title = this.name.slice(0, matchIndex).trim();
    
console.log([this.title, this.featuring, this.version]);
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
    
    console.log(tracks);
    return result;
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

// console.log(await searchAll("domino"));
console.log(await searchAll("feat radio edit"));
// console.log(getNeedle("Domino by Jessie J feat Pitbull"));

let input = "Domino by Jessie J feat Pitbull";

console.log(new Needle(input));
// let url = 'https://itunes.apple.com/search?country=se&media=music&entity=song&term=Domino+Jessie+J&limit=25&explicit=yes';
// const r = new Request(url);
// await console.log(r);
// const json = await r.loadJSON();
// console.log(json);
