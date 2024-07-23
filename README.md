# CRUD with simple admin panel. 

## [Demo](https://crud-deno-hono-eta-oauth.deno.dev)  

Double login (google, x/twitter) + manage collected data using the admin panel.  

## Description 

- [TypeScript](https://www.typescriptlang.org), backend rendered web application.  
- [deno(runtime)](https://github.com/denoland/deno) + [hono(framework)](https://github.com/honojs/hono) + [eta(template render engine)](https://github.com/eta-dev/eta) based.  
- [OAuth2(Open Authorization)](https://oauth.net/2/) implemented for [google](https://accounts.google.com/) and [x/twitter](https://twitter.com) accounts, using [deno_vk_oauth](https://github.com/denoland/deno_kv_oauth).  
- common user can edit personal data record.  
- admin panel used to manage data records collected from users.  
- built-in [Deno KV](https://docs.deno.com/deploy/kv/manual/#deno-kv) used to manage database stuff.  
- [deno deploy](https://deno.com/deploy) hosted.  
- `admin access` granted using deno deploy `environment variables` in production, and `.env` file in development process.  
The `.env` file example:
```properties
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

GOOGLE_OAUTH_CONFIG_REDIRECT_URI=http://localhost:8000/callback-google
X_OAUTH_CONFIG_REDIRECT_URI=http://localhost:8000/callback-x

ADMIN_IDS=idfromappscreen,anotheradmin,commaseparated
```
- for deno deploy, the redirect_uri `localhost:8000` should be replaced to used domain.  
- to get clent_id and client_secret first configure oauth2 for google and x/twitter accounts where you registered.  
- at the moment (2024) the solutions used have free plans.  

## Requirements 

- configured [deno](https://github.com/denoland/deno).  
- correct `.env` file(otherwise OAuth2 will fail).  

Developed on linux.

## Usage 

- clone the repo
- create and fill `.env` file in repo root folder(README.md file level).
- terminal: `deno task bang` to run locally.  

For details discover `deno.json` file.
