import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const portalCode = fs.readFileSync('src/utils/portal.js', 'utf8').replace(/export /g, '');
const constantsCode = fs.readFileSync('src/utils/constants.js', 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/export /g, '');
const authCode = fs.readFileSync('src/modules/auth/authService.js', 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/export /g, '');
const values = new Map();
const calls = [];
const storage = {get: key => values.get(key) ?? null, set: (key, value) => values.set(key, value), remove: key => values.delete(key)};
const login = role => async () => { calls.push(role); return {data:{token:'test-token',user:{name:'Test User',email:'test@example.com'}}}; };
let logoutFailure = false;
const authApi = {branchLogin:login('branch'),branchLogout:async()=>{calls.push('branch-logout');if(logoutFailure)throw new Error('offline');},adminLogin:login('super-admin'),restaurantLogin:login('restaurant'),adminLogout:async()=>{},restaurantLogout:async()=>{}};
const context = vm.createContext({storage,authApi});
vm.runInContext(portalCode + constantsCode + authCode + '\n globalThis.result={authService,PORTAL,PORTAL_ROLE,STORAGE_KEYS};', context);
const {authService,PORTAL,PORTAL_ROLE,STORAGE_KEYS} = context.result;
const otherRole = PORTAL_ROLE === 'super-admin' ? 'restaurant' : 'super-admin';
await assert.rejects(authService.login('test@example.com','secret',otherRole), /not supported/);
assert.equal(calls.length,0);
const user = await authService.login('test@example.com','secret');
assert.equal(calls[0],PORTAL_ROLE);
assert.equal(user.role,PORTAL_ROLE);
assert.equal(authService.current().role,PORTAL_ROLE);
assert.equal(STORAGE_KEYS.session,`restrodesk_${PORTAL}_session`);
values.set(STORAGE_KEYS.session,{role:otherRole});
assert.equal(authService.current(),null);
assert.equal(values.has(STORAGE_KEYS.authToken),false);
await authService.login('test@example.com','secret');
await authService.logout();
assert.equal(authService.current(),null);
if (PORTAL === 'branch') {
  assert(calls.includes('branch-logout'));
  await authService.login('test@example.com','secret');
  logoutFailure=true;
  await assert.rejects(authService.logout(),/offline/);
  assert.equal(authService.current(),null);
  assert.equal(values.has(STORAGE_KEYS.authToken),false);
}
console.log(`${PORTAL}: correct login endpoint, role isolation, session keys, and logout checks passed.`);
