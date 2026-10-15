<p align="center">
<img width="150" src="./public/android-chrome-512x512.png" alt="logo" />
</p>

# Social Media to Mealie

Have you found a recipe on social media and don’t want to write it out yourself? This tool lets you import recipes from
videos directly into [Mealie](https://github.com/mealie-recipes/mealie).

**Tested social media platforms:**

- Instagram
- TikTok
- Facebook
- YouTube Shorts
- Pinterest

Other sites may work as well, since the tool uses `yt-dlp` to download videos. If you encounter issues with other
websites, please open an issue.

> **Note:** If you receive a `BAD_RECIPE` error, it may be due to Mealie’s recipe parsing. If you find a better prompt
> or solution, feel free to open an issue or PR!

## Features

- Import posts into Mealie with a link and a click
- [iOS Shortcut v0.4](https://www.icloud.com/shortcuts/2bbc4c037d6a4383bc5ff6e60715f2dc) for easy importing
- PWA support, to allow sharing links to the app from mobile devices for quick importing.

## Screenshot

![Screenshot of the web interface](./public/screenshot.png "Screenshot of the web interface")

## Requirements

- [Mealie 1.9.0+](https://github.com/mealie-recipes/mealie) with AI provider
  configured ([docs](https://docs.mealie.io/documentation/getting-started/installation/open-ai/))
- [Docker](https://docs.docker.com/engine/install/)

## Deployment

<details open>
    <summary>Docker Compose</summary>

1. Create a `docker-compose.yml` file based on the [docker-compose.example.yml](https://github.com/GerardPolloRebozado/social-to-mealie/blob/main/docker-compose.example.yml)
   in the repo and fill in the required environment variables.
   If you prefer having them in a separate file you can create a `.env` file based on the [example.env](https://github.com/GerardPolloRebozado/social-to-mealie/blob/main/example.env).

2. **Start the service with Docker Compose:**

    ```sh
    docker-compose up -d
    ```

    </details>

<details>
    <summary>Docker Run</summary>

```sh
docker run --restart unless-stopped --name social-to-mealie \
  -e OPENAI_URL=https://api.openai.com/v1 \
  -e OPENAI_API_KEY=sk-... \
  -e TRANSCRIPTION_MODEL=whisper-1 \
  -e MEALIE_URL=https://mealie.example.com \
  -e MEALIE_API_KEY=ey... \
  -e MEALIE_GROUP_NAME=home \
  -p 4000:3000 \
  --security-opt no-new-privileges:true \
  ghcr.io/gerardpollorebozado/social-to-mealie:latest
```

</details>

<details>
    <summary>Local Development</summary>

1. Clone the repository and install dependencies:

    ```sh
    git clone https://github.com/GerardPolloRebozado/social-to-mealie.git
    cd social-to-mealie
    npm install
    ```

2. Create a `.env` file based on `example.env` and fill in your values:

    ```sh
    cp example.env .env
    ```

3. Create an empty `cookies.txt` file (required by the volume mount if defined in `docker-compose.yml`):

    ```sh
    touch cookies.txt
    ```

4. Build and start the container locally:

    ```sh
    docker compose build
    docker compose up -d
    ```

    The app will be available at `http://localhost:4000`.

5. To view logs:

    ```sh
    docker logs -f social-to-mealie
    ```

</details>

> [!TIP]
> In order to be able to install the PWA the app needs to have HTTPS, you can use a reverse proxy like caddy or nginx,
> but be careful as opening this app to the internet as it will allow anyone to submit recipes to your Mealie instance.
> I recommend adding a small log in or IP whitelist

## Environment Variables

| Variable                  | Required | Default                     | Description                                                                                                                                  |
| ------------------------- | -------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| OPENAI_URL                | Yes      | `https://api.openai.com/v1` | URL for the OpenAI API or a compatible one                                                                                                   |
| OPENAI_API_KEY            | Yes      | —                           | API key for OpenAI or a compatible one                                                                                                       |
| TRANSCRIPTION_MODEL       | No       | `whisper-1`                 | Whisper model to use, required when the local one is not filled                                                                              |
| LOCAL_TRANSCRIPTION_MODEL | No       | —                           | Model ID from hugging face to use for local audio to text transcription, required when the provider doesn't support transcriptions API       |
| TEXT_MODEL                | Yes      | `gpt-5-mini`                | Text model to use for recipe generation                                                                                                      |
| MEALIE_URL                | Yes      | `http://localhost:9000`     | URL of your Mealie instance                                                                                                                  |
| EXTERNAL_MEALIE_URL       | No       | -                           | Optional, this will be the URL used when showing the result of the recipe, not needed if the `MEALIE_URL` is already a public accessible URL |
| MEALIE_API_KEY            | Yes      | —                           | API key for Mealie                                                                                                                           |
| MEALIE_GROUP_NAME         | No       | `home`                      | Mealie group name                                                                                                                            |
| EXTRA_PROMPT              | No       | —                           | Additional instructions for AI, such as language translation                                                                                 |
| YTDLP_VERSION             | No       | `latest`                    | Version of yt-dlp to use                                                                                                                     |
| PORT                      | No       | `4000`                      | Host port to expose the app on                                                                                                               |
| COOKIES                   | No       | —                           | Cookies string for yt-dlp to access protected content `NAME=VALUE`                                                                           |

## Authentication (optional)

By default the app has no login, so anyone who can reach it can submit recipes to your Mealie. You can protect it with any OpenID Connect provider (Authentik, Keycloak, Google, ...). Authentication is disabled unless `AUTH_OIDC_ISSUER` is set.

| Variable                | Required        | Default | Description                                                                                  |
| ----------------------- | --------------- | ------- | -------------------------------------------------------------------------------------------- |
| AUTH_OIDC_ISSUER        | No              | —       | Issuer URL of your OIDC provider. Setting it enables login                                   |
| AUTH_OIDC_CLIENT_ID     | If auth enabled | —       | OIDC client ID                                                                               |
| AUTH_OIDC_CLIENT_SECRET | If auth enabled | —       | OIDC client secret                                                                           |
| AUTH_OIDC_NAME          | No              | `SSO`   | Label shown on the sign-in button                                                            |
| AUTH_SECRET             | If auth enabled | —       | Random secret used to sign sessions, for example `openssl rand -base64 33`                   |
| AUTH_URL                | If auth enabled | —       | Public URL of this app, for example `https://recipes.example.com`                            |
| AUTH_TRUST_HOST         | No              | —       | Set to `true` when running behind a reverse proxy                                            |
| API_TOKEN               | No              | —       | Static token that lets non-browser clients (the iOS Shortcut) call `/api/get-url` without logging in |

Register this redirect URI at your provider:

```
<AUTH_URL>/api/auth/callback/oidc
```

Example with Authentik: create an OAuth2/OpenID provider (confidential client) and an application, set the redirect URI above, and use `https://<authentik-host>/application/o/<application-slug>/` as the issuer (keep the trailing slash).

When `API_TOKEN` is set, send it as a header on the import endpoint:

```
Authorization: Bearer <API_TOKEN>
```

### Multi-household support (optional)

By default every recipe is created in the household of the user who owns `MEALIE_API_KEY`. If your Mealie instance has several households, set `MEALIE_MAP_USERS=true` (requires OIDC login) and each recipe will be created in the household of the person who is logged in.

| Variable                      | Required | Default | Description                                                                          |
| ----------------------------- | -------- | ------- | ------------------------------------------------------------------------------------ |
| MEALIE_MAP_USERS              | No       | `false` | Look up the logged-in user in Mealie by email and create recipes in their household  |
| MEALIE_REQUIRE_VERIFIED_EMAIL | No       | `false` | Also require the OIDC provider to report the email as verified (`email_verified`)    |

How it works:

- At login, the email from your OIDC provider is matched against the users in Mealie. The user's id, household and group are stored in the session. The API key is never exposed to the browser.
- A recipe is created with `MEALIE_API_KEY` and then reassigned to the user's household, so only one Mealie token is needed.
- `MEALIE_API_KEY` must belong to a Mealie admin, because the user lookup uses the admin users endpoint.
- A user whose email does not match any Mealie user cannot sign in and sees an error on the sign-in page.
- Requests that use `API_TOKEN` have no logged-in user, so their recipes are created in the household of the `MEALIE_API_KEY` owner.
- Only enable this if users cannot change their own email address at your OIDC provider, or set `MEALIE_REQUIRE_VERIFIED_EMAIL=true`. Otherwise someone could claim another person's email.

Only `/api/get-url` accepts the token. Everything else requires an OIDC login.

## Tested AI providers compatibility

- OpenAI
- GroqAI

## Partial support

Because theese providers don't support the transcriptions API it requires LOCAL_TRANSCRIPTION_MODEL to be set, recommended model: `Xenova/whisper-base`, you can use any model that is compatible with the ONNX runtime from hugging face

- llmstudio
- ollama

Some recommended models for local AI are:

- `qwen3-vl:8b`
- `gemma-3-12b`

If you want to use another model the model needs to have tools support and vision capabilities.
If you want better results use the same models but in larger variants.

It can work with any other provider that is compatible with the OpenAI API, if you find any issues please open an issue.

[![Star History Chart](https://app.repohistory.com/api/svg?repo=GerardPolloRebozado/social-to-mealie&type=Date&background=0D1117&color=f86262)](https://app.repohistory.com/star-history)
