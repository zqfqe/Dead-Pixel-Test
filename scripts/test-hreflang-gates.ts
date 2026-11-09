import assert from 'node:assert/strict';
import { SEO_LANDING_PAGES, LOCALE_PAIRS, pageAlternates } from '../data/seoLandingPages';

const byPath=new Map(SEO_LANDING_PAGES.map(page=>[page.path.replace(/\/+$/,'')||'/',page]));
const normalize=(p:string)=>p.replace(/\/+$/,'')||'/';
const original=new Map(SEO_LANDING_PAGES.map(page=>[page.path,page.indexable]));
const expected=(pair:[string,string])=>[{lang:'en',path:pair[0]},{lang:'pt-BR',path:pair[1]}];

try{
 for(const pair of LOCALE_PAIRS){
  const en=byPath.get(normalize(pair[0]));
  const pt=byPath.get(normalize(pair[1]));
  assert.ok(pt,'Missing Portuguese partner for '+pair[1]);
  pt.indexable=false;
  if(en)en.indexable=false;
  assert.deepEqual(pageAlternates(pair[0]),[],'Unreviewed EN page should not emit alternates');
  assert.deepEqual(pageAlternates(pair[1]),[],'Unreviewed PT page should not emit alternates');
  pt.indexable=true;
  if(en){
   assert.deepEqual(pageAlternates(pair[0]),[],'One-sided admission must not emit hreflang');
   en.indexable=true;
  }
  // '/' is indexable only when the real origin is configured; this helper is
  // tested solely for its post-approval reciprocal pairing logic.
  assert.deepEqual(pageAlternates(pair[0]),expected(pair),'English pairing must be reciprocal');
  assert.deepEqual(pageAlternates(normalize(pair[1])),expected(pair),'Portuguese pairing must accept canonical slash shape');
  assert.deepEqual(pageAlternates(normalize(pair[0])),expected(pair),'English pairing must accept canonical slash shape');
 }
 assert.deepEqual(pageAlternates('/phone-screen-dead-pixel-test/'),[],'Phone/iPhone are not one-to-one equivalent');
 assert.deepEqual(pageAlternates('/pt-br/teste-de-cores/'),[],'Color and contrast scopes are not equivalent');
 console.log('PASS hreflang: four paired intents, both slash shapes, mutual admission and non-equivalent exclusions');
}finally{
 for(const page of SEO_LANDING_PAGES)page.indexable=original.get(page.path);
}
