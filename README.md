# Buylappysales

A deployment-ready electronics storefront with:

- a public storefront at `/`
- a checkout experience at `/checkout.html`
- a health endpoint at `/health`
- a products API at `/api/products`

## Run locally

```bash
npm install
npm start
```

The service listens on port `3000` by default, or the port provided by `PORT`.

## Deploy

This repository includes a Render configuration in [render.yaml](render.yaml) for a Node web service.
