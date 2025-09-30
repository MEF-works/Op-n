# Op’n – Mobile AI Assistant App

Op’n is a mobile-first AI-powered personal assistant built with React Native and Expo.  It combines a persistent chat assistant, file storage, code editing, and cloud connectors into a unified experience.  Levy, the intelligent assistant powering Op’n, helps you plan, code, organise files and interact with connected services quickly and effectively.

## Features

- **Chat Assistant (Levy)** – Persistent chat screen backed by OpenAI’s GPT‑4.  Levy remembers your conversation history across app restarts and can analyse files from your vault on demand.
- **File Storage (Vault)** – Upload, tag, rename and delete files with support for up to 1 GB of local storage.  Files are stored in the app’s private document directory and organised in a simple explorer UI with search and tag filters.
- **Code Canvas** – A lightweight code editor with syntax highlighting for JavaScript, TypeScript, JSON, HTML, CSS and Markdown.  Create new files, open existing ones from the vault and save changes.  A preview pane renders highlighted code.
- **Connectors Hub** – Integrations with third‑party services:
  - **GitHub** – Browse your repositories and push file updates to a repo using a personal access token.
  - **Notion** – Query your databases and append pages using an integration token.
  - **Google Drive** – List files from your Drive.  (Requires an OAuth access token obtained via your own auth flow.)
  - **Custom API** – Placeholder for adding your own REST endpoints.
- **Settings** – Manage API keys and tokens, view storage usage, and clear saved settings.
- **Command Dashboard** – A bottom tab navigation provides quick access to Chat, Vault, Canvas, Connectors and Settings screens.

## Getting Started

These instructions assume you have Node.js and the Expo CLI installed.  To install Expo CLI run:

```bash
npm install -g expo-cli
```

### 1. Install dependencies

Clone this repository and install dependencies:

```bash
cd opn-app
npm install
```

### 2. Obtain API keys and tokens

Op’n relies on several external APIs.  Store your keys securely and never commit them to version control.

| Service | Purpose | How to obtain |
|-------|---------|--------------|
| **OpenAI API key** | Used for Levy’s chat assistant. | Create a secret key from your [OpenAI dashboard](https://platform.openai.com/account/api-keys). |
| **GitHub personal access token** | Allows listing repositories and pushing commits.  Grant `repo` scope. | Generate a token at GitHub developer settings. |
| **Notion integration token** | Permits querying and updating your databases. | Create an integration and share your database with it (see Notion docs). |
| **Notion database ID** | Identifies the database to query. | Copy the ID from the URL of your Notion database. |
| **Google Drive OAuth token** | Enables listing files from Drive. | Use your own OAuth client to sign in and obtain an access token with the drive.readonly scope. |

Open the **Settings** tab in the app to paste your keys.  Tokens are stored securely on the device via `AsyncStorage`.

### 3. Run the app locally

Start the Expo development server:

```bash
npm run start
```

Use the Expo Go app on your iOS or Android device to scan the QR code, or launch an emulator:

- **Android:** `npm run android`
- **iOS:** `npm run ios`

### 4. Build an APK or IPA

To build a production binary, use Expo’s build service.  First ensure you are logged into Expo (`expo login`).  Then run:

```bash
expo build:android
expo build:ios
```

Follow the prompts to configure signing credentials.  See the Expo Build docs for details.

## Usage Guide

### Chat Assistant

Navigate to the **Chat** tab to converse with Levy.  Type a message and press **Send**.  Levy will reply using GPT‑4.  Your conversation history persists between sessions.  If you ask a question about a file stored in the vault, Levy can open and analyse it.  When using this feature from within the Vault, Levy will provide a summary or insights based on the file contents.

### File Vault

In the **Vault** tab you can manage your local files:

1. **Upload:** Tap the upload icon in the header to select a file from your device.
2. **Search:** Use the search bar to filter by file name or tags.
3. **Tag:** Tap the label icon to add comma‑separated tags.  Tags help filter and organise your files.
4. **Rename:** Tap the pencil icon to change the file name.
5. **Ask Levy:** Tap the comment‑question icon to have Levy analyse the file.  Files must be under 500 KB for this feature.
6. **Delete:** Tap the trash icon to remove a file from storage.

The vault is stored locally in the app’s private directory.  Op’n supports up to 1 GB of storage, but this limit may vary by device.

### Code Canvas

The **Canvas** tab provides a lightweight coding environment.  You can:

1. **Open** a file from the vault via the folder icon.
2. **Create** a new file with the plus icon.  Provide a name and extension (for example `script.ts`).
3. **Edit** the file content.  The text editor supports multiline editing and syntax highlighting for popular languages.  A preview pane shows highlighted code.
4. **Save** your changes via the save icon.

This is not a full compiler environment but is useful for quick edits on the go.  To push changes to GitHub, ensure your GitHub token is configured and then use the integration in the **Connectors** tab.

### Connectors

In the **Connectors** tab you can test and manage integrations:

- **GitHub:** Lists your repositories when a personal access token is provided.  You can push file updates from the code canvas using functions provided in `services/github.ts`.
- **Notion:** Displays page titles from a specified database when an integration token and database ID are provided.
- **Google Drive:** Lists files from your drive when an access token is supplied.  To obtain a token, implement your own OAuth flow using Expo’s AuthSession API.
- **Custom API:** A placeholder for adding additional REST endpoints.  Extend the `services/` folder with your own modules and surface them in the UI.

### Settings

Use the **Settings** tab to manage API keys and tokens.  You can view how much storage the vault is using and clear all saved keys if needed.  Changes are persisted immediately.

## Development Notes

- **Expo & React Native:** The app is built with Expo SDK 49 and React Native 0.72.  All packages are stable and compatible with the Expo managed workflow.
- **Async Storage:** Settings and chat history are persisted using `@react-native-async-storage/async-storage`.
- **File Storage:** Files are saved under the app’s document directory (`FileSystem.documentDirectory/vault`).  Uploads copy the file into this directory and rename it with a UUID prefix.
- **Chat API:** The OpenAI integration uses the `openai` NPM package to call the GPT‑4 chat completions endpoint.  A system prompt is injected to define Levy’s behaviour.
- **Design:** The UI uses React Native Paper components and dark theme, with icons courtesy of Ionicons.

## Contributing

Contributions are welcome!  Feel free to open issues or pull requests with improvements, bug fixes or new connectors.  Please ensure any new dependencies are compatible with the Expo managed workflow.